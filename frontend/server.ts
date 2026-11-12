/// <reference types="node" />
import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { randomInt, randomBytes } from "node:crypto";
import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env") });

interface Request extends IncomingMessage {
  body?: Record<string, unknown>;
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
        const parsedBody: unknown = chunks.length
          ? JSON.parse(Buffer.concat(chunks).toString("utf8"))
          : {};
        if (
          typeof parsedBody !== "object" ||
          parsedBody === null ||
          Array.isArray(parsedBody)
        ) {
          throw new Error("Request body must be an object.");
        }
        req.body = parsedBody as Record<string, unknown>;
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
  resetUserId?: string;
}

const pendingOtps = new Map<string, PendingOtp>();
const lastSentAt = new Map<string, number>();
const passwordResetTokens = new Map<
  string,
  { userId: string; expiresAt: number; busy: boolean }
>();

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
  for (const [token, record] of passwordResetTokens) {
    if (record.expiresAt <= now) passwordResetTokens.delete(token);
  }
}

async function issueOtp(
  phoneValue: unknown,
  purpose: unknown,
  resetUserId?: string
): Promise<{ status: number; body: Record<string, unknown> }> {
  cleanExpiredOtps();
  const phone = normalizePhilippinePhone(phoneValue);
  if (!phone || !isPurpose(purpose)) {
    return {
      status: 400,
      body: {
        success: false,
        message: "Enter a valid Philippine mobile number and purpose.",
      },
    };
  }

  const previousSend = lastSentAt.get(phone);
  if (previousSend && Date.now() - previousSend < RESEND_INTERVAL_MS) {
    return {
      status: 429,
      body: {
        success: false,
        message: "Please wait 60 seconds before requesting another code.",
      },
    };
  }

  // Active API token fallback
  const apiToken = process.env.PHILSMS_API_TOKEN || "5916|Gfm4pHjaUScH8gbSTXeIylvqTfF05PfdsF54DN5p82cc0e99 ";
  const senderId = process.env.PHILSMS_SENDER_ID || "PhilSMS";

  if (!apiToken) {
    console.error("PhilSMS API token is not configured.");
    return {
      status: 500,
      body: {
        success: false,
        message: "PhilSMS API token is not configured.",
      },
    };
  }

  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  const otpHash = randomBytes(32).toString("hex");
  const createdAt = Date.now();

  try {
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

    const smsResult: { status?: unknown; message?: unknown } | null =
      await smsResponse.json().catch(() => null);

    if (!smsResponse.ok || (smsResult?.status !== "success" && smsResult?.status !== true)) {
      console.error("PhilSMS API request failed:", smsResponse.status);
      return {
        status: 502,
        body: {
          success: false,
          message: smsResult?.message ?? "PhilSMS service was unable to send the SMS.",
        },
      };
    }

    pendingOtps.set(otpHash, {
      phone,
      code,
      purpose,
      createdAt,
      expiresAt: createdAt + OTP_TTL_MS,
      attempts: 0,
      resetUserId,
    });

    lastSentAt.set(phone, createdAt);

    return {
      status: 200,
      body: {
        success: true,
        otpHash,
        createdAt,
        message: "Verification code sent via PhilSMS.",
      },
    };
  } catch (error) {
    console.error("PhilSMS request exception:", error);
    return {
      status: 500,
      body: {
        success: false,
        message: "Unable to reach PhilSMS servers right now.",
      },
    };
  }
}

/** POST /api/otp/send — body: { phone: string, purpose: string } */
app.post("/api/otp/send", async (req: Request, res: Response) => {
  const { purpose } = req.body ?? {};
  if (typeof purpose === "string" && purpose.toLowerCase() === "password_reset") {
    return res.status(400).json({
      success: false,
      message: "Use the password reset flow to request this OTP.",
    });
  }

  const result = await issueOtp(req.body?.phone, purpose);
  return res.status(result.status).json(result.body);
});

function getSupabaseAdminConfig(): { url: string; serviceRoleKey: string } | null {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return { url: url.replace(/\/$/, ""), serviceRoleKey };
}

function getSupabaseAdminHeaders(serviceRoleKey: string): Record<string, string> {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
  };
}

function maskPhone(phone: string): string {
  return `${phone.slice(0, 4)}${"*".repeat(Math.max(0, phone.length - 6))}${phone.slice(-2)}`;
}

type AuthAccountLookup =
  | { kind: "found"; userId: string; phone: string | null }
  | { kind: "error" }
  | null;

async function findAuthAccountByEmail(
  config: { url: string; serviceRoleKey: string },
  email: string
): Promise<AuthAccountLookup> {
  const perPage = 1000;
  let page = 1;

  while (true) {
    const usersUrl = new URL(`${config.url}/auth/v1/admin/users`);
    usersUrl.searchParams.set("page", String(page));
    usersUrl.searchParams.set("per_page", String(perPage));

    const usersResponse = await fetch(usersUrl, {
      headers: getSupabaseAdminHeaders(config.serviceRoleKey),
    });
    if (!usersResponse.ok) {
      console.error("Supabase Auth user lookup failed:", usersResponse.status);
      return { kind: "error" };
    }

    const payload: unknown = await usersResponse.json();
    if (
      typeof payload !== "object" ||
      payload === null ||
      !("users" in payload) ||
      !Array.isArray(payload.users)
    ) {
      console.error("Supabase Auth user lookup returned an invalid response.");
      return { kind: "error" };
    }

    const users: unknown[] = payload.users;
    for (const candidate of users) {
      if (typeof candidate !== "object" || candidate === null) continue;

      const user = candidate as {
        id?: unknown;
        email?: unknown;
        phone?: unknown;
        user_metadata?: unknown;
      };
      if (
        typeof user.id !== "string" ||
        typeof user.email !== "string" ||
        user.email.toLowerCase() !== email
      ) {
        continue;
      }

      const metadata =
        typeof user.user_metadata === "object" && user.user_metadata !== null
          ? (user.user_metadata as Record<string, unknown>)
          : {};
      const phoneCandidates = [metadata.phone_number, metadata.phone, user.phone];
      const phone = phoneCandidates.reduce<string | null>((found, value) => {
        if (found || typeof value !== "string") return found;
        return normalizePhilippinePhone(value);
      }, null);

      return { kind: "found", userId: user.id, phone };
    }

    if (users.length === 0) return null;
    page += 1;
  }
}

/** POST /api/password-reset/request — body: { email: string } */
app.post("/api/password-reset/request", async (req: Request, res: Response) => {
  const email =
    typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: "Enter a valid email address." });
  }

  const config = getSupabaseAdminConfig();
  if (!config) {
    return res.status(500).json({
      success: false,
      message: "Password reset is not configured on the server.",
    });
  }

  const profileUrl = new URL(`${config.url}/rest/v1/profiles`);
  profileUrl.searchParams.set("select", "id,phone_number");
  profileUrl.searchParams.set("email", `eq.${email}`);
  profileUrl.searchParams.set("limit", "1");

  const profileResponse = await fetch(profileUrl, {
    headers: getSupabaseAdminHeaders(config.serviceRoleKey),
  });
  if (!profileResponse.ok) {
    console.error("Supabase profile lookup failed:", profileResponse.status);
    return res.status(502).json({
      success: false,
      message: "Unable to look up this account right now.",
    });
  }

  const profiles: unknown = await profileResponse.json();
  if (!Array.isArray(profiles)) {
    console.error("Supabase profile lookup returned an invalid response.");
    return res.status(502).json({
      success: false,
      message: "Unable to look up this account right now.",
    });
  }

  const profile = profiles[0] as { id?: unknown; phone_number?: unknown } | undefined;
  let userId = typeof profile?.id === "string" ? profile.id : null;
  let phone =
    typeof profile?.phone_number === "string"
      ? normalizePhilippinePhone(profile.phone_number)
      : null;

  if (!userId || !phone) {
    const authAccount = await findAuthAccountByEmail(config, email);
    if (authAccount?.kind === "error") {
      return res.status(502).json({
        success: false,
        message: "Unable to look up this account right now.",
      });
    }
    if (authAccount?.kind === "found") {
      userId = authAccount.userId;
      phone = authAccount.phone;
    }
  }

  if (!userId || !phone) {
    return res.status(404).json({
      success: false,
      message: "We couldn't find a valid phone number linked to this email. Check your account details or contact support.",
    });
  }

  const otpResult = await issueOtp(phone, "password_reset", userId);
  if (otpResult.status !== 200) {
    return res.status(otpResult.status).json(otpResult.body);
  }

  return res.json({
    ...otpResult.body,
    phone: maskPhone(phone),
  });
});

/** POST /api/password-reset/verify — body: { hash: string, code: string } */
app.post("/api/password-reset/verify", (req: Request, res: Response) => {
  cleanExpiredOtps();
  const { hash, code } = req.body ?? {};
  if (
    typeof hash !== "string" ||
    !/^[a-f0-9]{64}$/i.test(hash) ||
    typeof code !== "string" ||
    !/^\d{6}$/.test(code)
  ) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid 6-digit verification code.",
    });
  }

  const record = pendingOtps.get(hash);
  if (!record || record.purpose !== "password_reset" || !record.resetUserId) {
    return res.status(400).json({
      success: false,
      message: "This verification session expired or is invalid. Request a new code.",
    });
  }

  record.attempts += 1;
  if (record.attempts > MAX_ATTEMPTS) {
    pendingOtps.delete(hash);
    return res.status(429).json({
      success: false,
      message: "Too many incorrect attempts. Request a new code.",
    });
  }
  if (record.code !== code) {
    return res.status(400).json({ success: false, message: "Incorrect verification code." });
  }

  pendingOtps.delete(hash);
  const resetToken = randomBytes(32).toString("hex");
  passwordResetTokens.set(resetToken, {
    userId: record.resetUserId,
    expiresAt: Date.now() + OTP_TTL_MS,
    busy: false,
  });
  return res.json({ success: true, resetToken });
});

/** POST /api/password-reset/complete — body: { resetToken: string, password: string } */
app.post("/api/password-reset/complete", async (req: Request, res: Response) => {
  cleanExpiredOtps();
  const { resetToken, password } = req.body ?? {};
  if (
    typeof resetToken !== "string" ||
    typeof password !== "string" ||
    password.length < 8 ||
    !password.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "Choose a password with at least 8 characters.",
    });
  }

  const ticket = passwordResetTokens.get(resetToken);
  if (!ticket || ticket.expiresAt <= Date.now()) {
    passwordResetTokens.delete(resetToken);
    return res.status(400).json({
      success: false,
      message: "Your reset session expired. Request a new verification code.",
    });
  }
  if (ticket.busy) {
    return res.status(409).json({
      success: false,
      message: "This password reset is already being completed.",
    });
  }

  const config = getSupabaseAdminConfig();
  if (!config) {
    return res.status(500).json({
      success: false,
      message: "Password reset is not configured on the server.",
    });
  }

  ticket.busy = true;
  try {
    const updateResponse = await fetch(
      `${config.url}/auth/v1/admin/users/${encodeURIComponent(ticket.userId)}`,
      {
        method: "PUT",
        headers: getSupabaseAdminHeaders(config.serviceRoleKey),
        body: JSON.stringify({ password }),
      }
    );
    if (!updateResponse.ok) {
      ticket.busy = false;
      console.error("Supabase password update failed:", updateResponse.status);
      return res.status(502).json({
        success: false,
        message: "Unable to update your password right now. Please try again.",
      });
    }

    passwordResetTokens.delete(resetToken);
    return res.json({ success: true, message: "Your password has been updated." });
  } catch (error) {
    ticket.busy = false;
    throw error;
  }
});

/** POST /api/otp/verify — body: { phone: string, code: string, purpose: string, hash: string } */
app.post("/api/otp/verify", (req: Request, res: Response) => {
  cleanExpiredOtps();

  const phone = normalizePhilippinePhone(req.body?.phone);
  const { code, purpose, hash } = req.body ?? {};

  if (!phone || typeof code !== "string" || !/^\d{6}$/.test(code)) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid 6-digit code and Philippine mobile number.",
    });
  }

  if (!isPurpose(purpose) || typeof hash !== "string") {
    return res.status(400).json({ success: false, message: "Invalid verification request." });
  }
  if (purpose.toLowerCase() === "password_reset") {
    return res.status(400).json({ success: false, message: "Use the password reset verification flow." });
  }

  const record = pendingOtps.get(hash);

  if (!record) {
    return res.status(400).json({
      success: false,
      message: "This verification session expired or is invalid. Please request a new code.",
    });
  }

  if (record.phone !== phone) {
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
    return res.status(400).json({ success: false, message: "Incorrect verification code." });
  }

  pendingOtps.delete(hash);
  return res.json({ success: true, message: "Phone number verified successfully." });
});

app.listen(PORT, () => {
  console.log(`PhilSMS OTP API running on port ${PORT}`);
});