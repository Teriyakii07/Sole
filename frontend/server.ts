/// <reference types="node" />
import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { randomInt, randomBytes } from "node:crypto";

interface Request extends IncomingMessage {
  body?: any;
}

interface Response {
  status(code: number): Response;
  json(body: unknown): Response;
}

type Handler = (req: Request, res: Response) => unknown;
const routes = new Map<string, Handler>();

const app = {
  post(path: string, handler: Handler) {
    routes.set(`POST ${path}`, handler);
    return this;
  },
  listen(port: number, callback?: () => void) {
    return createServer(async (incoming: IncomingMessage, outgoing: ServerResponse) => {
      // Dynamic CORS handling
      const origin = incoming.headers.origin || "*";
      outgoing.setHeader("Access-Control-Allow-Origin", origin);
      outgoing.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      outgoing.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

      if (incoming.method === "OPTIONS") {
        outgoing.statusCode = 204;
        outgoing.end();
        return;
      }

      const path = incoming.url?.split("?")[0] ?? "/";
      const handler = routes.get(`${incoming.method ?? "GET"} ${path}`);

      if (!handler) {
        outgoing.statusCode = 404;
        outgoing.end();
        return;
      }

      const req = incoming as Request;
      try {
        const chunks: Buffer[] = [];
        for await (const chunk of incoming) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
        req.body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {};
      } catch {
        outgoing.statusCode = 400;
        outgoing.setHeader("Content-Type", "application/json");
        outgoing.end(JSON.stringify({ success: false, message: "Invalid JSON body." }));
        return;
      }

      outgoing.setHeader("Content-Type", "application/json");
      const res: Response = {
        status(code: number) {
          outgoing.statusCode = code;
          return this;
        },
        json(body: unknown) {
          outgoing.end(JSON.stringify(body));
          return this;
        },
      };

      try {
        await handler(req, res);
      } catch (error) {
        console.error("Request error:", error);
        if (!outgoing.headersSent) {
          outgoing.statusCode = 500;
          outgoing.end(JSON.stringify({ success: false, message: "Internal server error." }));
        }
      }
    }).listen(port, callback);
  },
};

const PORT = Number(process.env.PORT) || 5000;
const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_INTERVAL_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

interface PendingOtp {
  phone: string;
  code: string;
  purpose: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
}

const pendingOtps = new Map<string, PendingOtp>();
const lastSentAt = new Map<string, number>();

// Format phone number to clean PhilSMS format (e.g. 639171234567 without +)
function normalizePhilippinePhone(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const digits = value.replace(/\D/g, "");
  if (/^09\d{9}$/.test(digits)) return `63${digits.slice(1)}`;
  if (/^639\d{9}$/.test(digits)) return digits;
  return null;
}

function isPurpose(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9][a-z0-9_-]{0,39}$/i.test(value);
}

function cleanExpiredOtps(): void {
  const now = Date.now();
  for (const [hash, record] of pendingOtps) {
    if (record.expiresAt <= now) pendingOtps.delete(hash);
  }
  for (const [phone, sentAt] of lastSentAt) {
    if (sentAt + RESEND_INTERVAL_MS <= now) lastSentAt.delete(phone);
  }
}

/** POST /api/otp/send — body: { phone: string, purpose: string } */
app.post("/api/otp/send", async (req: Request, res: Response) => {
  cleanExpiredOtps();

  const phone = normalizePhilippinePhone(req.body?.phone);
  const { purpose } = req.body ?? {};

  if (!phone || !isPurpose(purpose)) {
    console.warn(`OTP send rejected -> phone valid: ${!!phone}, purpose valid: ${isPurpose(purpose)} (purpose="${purpose}")`);
    return res.status(400).json({
      success: false,
      message: "Enter a valid Philippine mobile number and purpose."
    });
  }

  const previousSend = lastSentAt.get(phone);
  if (previousSend && Date.now() - previousSend < RESEND_INTERVAL_MS) {
    return res.status(429).json({
      success: false,
      message: "Please wait 60 seconds before requesting another code."
    });
  }

  // Active API token fallback
  const apiToken = process.env.PHILSMS_API_TOKEN || "5916|Gfm4pHjaUScH8gbSTXeIylvqTfF05PfdsF54DN5p82cc0e99 ";
  const senderId = process.env.PHILSMS_SENDER_ID || "PhilSMS";

  if (!apiToken) {
    console.error("PhilSMS API token is not configured.");
    return res.status(500).json({
      success: false,
      message: "PhilSMS API token is not configured."
    });
  }

  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  const otpHash = randomBytes(32).toString("hex");
  const createdAt = Date.now();

  try {
    console.log(`\n--- SENDING OTP VIA PHILSMS ---`);
    console.log(`Sending PhilSMS OTP to ${phone} with Sender ID: ${senderId}`);
    console.log(`Generated OTP Code (stored in memory): ${code}`);
    console.log(`Generated OTP Hash: ${otpHash}`);

    const smsResponse = await fetch("https://dashboard.philsms.com/api/v3/sms/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        recipient: phone,
        sender_id: senderId,
        type: "plain",
        message: `Your SOLE verification code is ${code}. It expires in 5 minutes.`,
      }),
    });

    const smsResult: any = await smsResponse.json().catch(() => null);
    console.log("PhilSMS API Response:", smsResult);

    if (!smsResponse.ok || (smsResult?.status !== "success" && smsResult?.status !== true)) {
      console.error("PhilSMS API failure response:", smsResult ?? smsResponse.statusText);
      return res.status(502).json({
        success: false,
        message: smsResult?.message ?? "PhilSMS service was unable to send the SMS.",
      });
    }

    pendingOtps.set(otpHash, {
      phone,
      code,
      purpose,
      createdAt,
      expiresAt: createdAt + OTP_TTL_MS,
      attempts: 0,
    });

    lastSentAt.set(phone, createdAt);

    return res.json({
      success: true,
      otpHash,
      createdAt,
      message: "Verification code sent via PhilSMS.",
    });
  } catch (error) {
    console.error("PhilSMS request exception:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to reach PhilSMS servers right now.",
    });
  }
});

/** POST /api/otp/verify — body: { phone: string, code: string, purpose: string, hash: string } */
app.post("/api/otp/verify", (req: Request, res: Response) => {
  cleanExpiredOtps();

  const phone = normalizePhilippinePhone(req.body?.phone);
  const { code, purpose, hash } = req.body ?? {};

  console.log(`\n--- VERIFYING OTP ---`);
  console.log(`Incoming Phone: ${phone}`);
  console.log(`Incoming Code: "${code}"`);
  console.log(`Incoming Hash: "${hash}"`);
  console.log(`Incoming Purpose: "${purpose}"`);

  if (!phone || typeof code !== "string" || !/^\d{6}$/.test(code)) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid 6-digit code and Philippine mobile number.",
    });
  }

  if (!isPurpose(purpose) || typeof hash !== "string") {
    return res.status(400).json({ success: false, message: "Invalid verification request." });
  }

  const record = pendingOtps.get(hash);
  console.log(`Stored Record found for Hash:`, record ? { code: record.code, phone: record.phone } : "NONE");

  if (!record) {
    return res.status(400).json({
      success: false,
      message: "This verification session expired or is invalid. Please request a new code.",
    });
  }

  if (record.phone !== phone) {
    console.log(`Phone Mismatch: Expected ${record.phone}, got ${phone}`);
    return res.status(400).json({
      success: false,
      message: "Phone number mismatch. Please try again.",
    });
  }

  if (record.purpose !== purpose) {
    return res.status(400).json({ success: false, message: "Invalid verification purpose." });
  }

  if (record.expiresAt <= Date.now()) {
    pendingOtps.delete(hash);
    return res.status(400).json({ success: false, message: "This code has expired. Please request a new one." });
  }

  record.attempts += 1;
  if (record.attempts > MAX_ATTEMPTS) {
    pendingOtps.delete(hash);
    return res.status(429).json({ success: false, message: "Too many incorrect attempts. Please request a new code." });
  }

  // Code comparison (trim string to prevent hidden space issues)
  if (record.code.trim() !== code.trim()) {
    console.log(`Code Mismatch: Stored "${record.code}" vs Entered "${code}"`);
    return res.status(400).json({ success: false, message: "Incorrect verification code." });
  }

  pendingOtps.delete(hash);
  console.log(`OTP Successfully Verified for ${phone}!`);
  return res.json({ success: true, message: "Phone number verified successfully." });
});

app.listen(PORT, () => {
  console.log(`PhilSMS OTP API running on port ${PORT}`);
});