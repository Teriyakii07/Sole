import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

interface VercelRequest {
  method?: string;
  query: Record<string, string | string[] | undefined>;
  body?: unknown;
}

interface VercelResponse {
  status(code: number): VercelResponse;
  json(body: unknown): VercelResponse;
}

interface SupabaseConfig {
  url: string;
  serviceRoleKey: string;
}

interface PasswordResetSession {
  otp_hash: string;
  phone: string;
  user_id: string;
  code_hash: string;
  created_at: string;
  expires_at: string;
  attempts: number;
  status: "sending" | "pending" | "verified" | "updating" | "completed" | "locked" | "failed";
  reset_token_expires_at: string | null;
}

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_INTERVAL_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;
const SESSION_RETENTION_MS = 24 * 60 * 60 * 1000;

class SupabaseRequestError extends Error {
  constructor(readonly status: number) {
    super(`Supabase request failed with status ${status}.`);
  }
}

function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return { url: url.replace(/\/$/, ""), serviceRoleKey };
}

function supabaseHeaders(config: SupabaseConfig): Record<string, string> {
  return {
    apikey: config.serviceRoleKey,
    Authorization: `Bearer ${config.serviceRoleKey}`,
    "Content-Type": "application/json",
  };
}

async function supabaseRequest(
  config: SupabaseConfig,
  path: string,
  init: RequestInit = {}
): Promise<unknown> {
  const requestUrl = path.startsWith("http://") || path.startsWith("https://")
    ? path
    : `${config.url}${path}`;
  const response = await fetch(requestUrl, {
    ...init,
    headers: {
      ...supabaseHeaders(config),
      ...init.headers,
    },
  });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new SupabaseRequestError(response.status);
  return payload;
}

function normalizePhilippinePhone(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const digits = value.replace(/\D/g, "");
  if (/^09\d{9}$/.test(digits)) return `63${digits.slice(1)}`;
  if (/^639\d{9}$/.test(digits)) return digits;
  return null;
}

function maskPhone(phone: string): string {
  return `${phone.slice(0, 4)}${"*".repeat(Math.max(0, phone.length - 6))}${phone.slice(-2)}`;
}

function parseBody(body: unknown): Record<string, unknown> {
  if (typeof body === "string") {
    try {
      const parsed: unknown = JSON.parse(body);
      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return {};
    }
  }
  if (typeof body === "object" && body !== null && !Array.isArray(body)) {
    return body as Record<string, unknown>;
  }
  return {};
}

function sessionsUrl(config: SupabaseConfig, params: Record<string, string>): string {
  const url = new URL(`${config.url}/rest/v1/password_reset_sessions`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return `${url.pathname}${url.search}`;
}

async function cleanExpiredSessions(config: SupabaseConfig): Promise<void> {
  await supabaseRequest(
    config,
    sessionsUrl(config, {
      expires_at: `lt.${new Date(Date.now() - SESSION_RETENTION_MS).toISOString()}`,
    }),
    { method: "DELETE" }
  );
}

async function findAuthAccountByEmail(
  config: SupabaseConfig,
  email: string
): Promise<{ userId: string; phone: string | null } | null> {
  const perPage = 1000;
  let page = 1;

  while (true) {
    const usersUrl = new URL(`${config.url}/auth/v1/admin/users`);
    usersUrl.searchParams.set("page", String(page));
    usersUrl.searchParams.set("per_page", String(perPage));

    const response = await fetch(usersUrl, { headers: supabaseHeaders(config) });
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) throw new SupabaseRequestError(response.status);
    if (
      typeof payload !== "object" ||
      payload === null ||
      !("users" in payload) ||
      !Array.isArray(payload.users)
    ) {
      throw new Error("Supabase Auth returned an invalid user list.");
    }

    for (const candidate of payload.users) {
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
      const phone = [metadata.phone_number, metadata.phone, user.phone].reduce<string | null>(
        (found, value) => found || normalizePhilippinePhone(value),
        null
      );
      return { userId: user.id, phone };
    }

    if (payload.users.length === 0) return null;
    page += 1;
  }
}

async function findAccount(
  config: SupabaseConfig,
  email: string
): Promise<{ userId: string; phone: string | null } | null> {
  const profileUrl = new URL(`${config.url}/rest/v1/profiles`);
  profileUrl.searchParams.set("select", "id,phone_number");
  profileUrl.searchParams.set("email", `eq.${email}`);
  profileUrl.searchParams.set("limit", "1");

  const response = await fetch(profileUrl, { headers: supabaseHeaders(config) });
  const profiles: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new SupabaseRequestError(response.status);
  if (!Array.isArray(profiles)) throw new Error("Supabase returned an invalid profile list.");

  const profile = profiles[0] as { id?: unknown; phone_number?: unknown } | undefined;
  const profilePhone = normalizePhilippinePhone(profile?.phone_number);
  if (typeof profile?.id === "string" && profilePhone) {
    return { userId: profile.id, phone: profilePhone };
  }

  const authAccount = await findAuthAccountByEmail(config, email);
  if (authAccount?.phone) return authAccount;
  return null;
}

function codeDigest(serviceRoleKey: string, otpHash: string, code: string): string {
  return createHmac("sha256", serviceRoleKey).update(`${otpHash}:${code}`).digest("hex");
}

function tokenDigest(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function requestReset(
  config: SupabaseConfig,
  body: Record<string, unknown>
): Promise<{ status: number; body: Record<string, unknown> }> {
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: 400, body: { success: false, message: "Enter a valid email address." } };
  }

  const account = await findAccount(config, email);
  if (!account?.phone) {
    return {
      status: 404,
      body: {
        success: false,
        message:
          "We couldn't find a valid phone number linked to this email. Check your account details or contact support.",
      },
    };
  }

  const now = Date.now();
  const recentSessions = await supabaseRequest(
    config,
    `/rest/v1/password_reset_sessions?${new URLSearchParams({
      select: "otp_hash",
      phone: `eq.${account.phone}`,
      created_at: `gt.${new Date(now - RESEND_INTERVAL_MS).toISOString()}`,
      status: "neq.failed",
      limit: "1",
    })}`
  );
  if (Array.isArray(recentSessions) && recentSessions.length > 0) {
    return {
      status: 429,
      body: { success: false, message: "Please wait 60 seconds before requesting another code." },
    };
  }

  const apiToken = process.env.PHILSMS_API_TOKEN;
  if (!apiToken) {
    return {
      status: 500,
      body: { success: false, message: "PhilSMS API token is not configured on the server." },
    };
  }

  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  const otpHash = randomBytes(32).toString("hex");
  const createdAt = new Date(now).toISOString();
  const session: PasswordResetSession = {
    otp_hash: otpHash,
    phone: account.phone,
    user_id: account.userId,
    code_hash: codeDigest(config.serviceRoleKey, otpHash, code),
    created_at: createdAt,
    expires_at: new Date(now + OTP_TTL_MS).toISOString(),
    attempts: 0,
    status: "sending",
    reset_token_expires_at: null,
  };

  await supabaseRequest(config, "/rest/v1/password_reset_sessions", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(session),
  });

  try {
    const smsResponse = await fetch("https://dashboard.philsms.com/api/v3/sms/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        recipient: account.phone,
        sender_id: process.env.PHILSMS_SENDER_ID || "PhilSMS",
        type: "plain",
        message: `Your SOLE verification code is ${code}. It expires in 5 minutes.`,
      }),
    });
    const smsPayload: unknown = await smsResponse.json().catch(() => null);
    const smsResult =
      typeof smsPayload === "object" && smsPayload !== null
        ? (smsPayload as { status?: unknown; message?: unknown })
        : null;
    if (!smsResponse.ok || (smsResult?.status !== "success" && smsResult?.status !== true)) {
      await supabaseRequest(
        config,
        sessionsUrl(config, { otp_hash: `eq.${otpHash}`, status: "eq.sending" }),
        { method: "PATCH", body: JSON.stringify({ status: "failed" }) }
      );
      return {
        status: 502,
        body: {
          success: false,
          message: smsResult?.message ?? "PhilSMS service was unable to send the SMS.",
        },
      };
    }
  } catch (error) {
    await supabaseRequest(
      config,
      sessionsUrl(config, { otp_hash: `eq.${otpHash}`, status: "eq.sending" }),
      { method: "PATCH", body: JSON.stringify({ status: "failed" }) }
    );
    console.error("PhilSMS request exception:", error);
    return {
      status: 502,
      body: { success: false, message: "Unable to reach PhilSMS servers right now." },
    };
  }

  await supabaseRequest(
    config,
    sessionsUrl(config, { otp_hash: `eq.${otpHash}`, status: "eq.sending" }),
    { method: "PATCH", body: JSON.stringify({ status: "pending" }) }
  );

  return {
    status: 200,
    body: {
      success: true,
      otpHash,
      createdAt: now,
      message: "Verification code sent via PhilSMS.",
      phone: maskPhone(account.phone),
    },
  };
}

async function verifyReset(
  config: SupabaseConfig,
  body: Record<string, unknown>
): Promise<{ status: number; body: Record<string, unknown> }> {
  const { hash, code } = body;
  if (
    typeof hash !== "string" ||
    !/^[a-f0-9]{64}$/i.test(hash) ||
    typeof code !== "string" ||
    !/^\d{6}$/.test(code)
  ) {
    return {
      status: 400,
      body: { success: false, message: "Enter a valid 6-digit verification code." },
    };
  }

  const rows = await supabaseRequest(
    config,
    `/rest/v1/password_reset_sessions?${new URLSearchParams({
      select: "*",
      otp_hash: `eq.${hash}`,
      status: "eq.pending",
      limit: "1",
    })}`
  );
  const session = Array.isArray(rows) ? (rows[0] as PasswordResetSession | undefined) : undefined;
  if (!session || Date.parse(session.expires_at) <= Date.now()) {
    return {
      status: 400,
      body: {
        success: false,
        message: "This verification session expired or is invalid. Request a new code.",
      },
    };
  }

  const expected = Buffer.from(session.code_hash, "hex");
  const actual = Buffer.from(codeDigest(config.serviceRoleKey, hash, code), "hex");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    const attempts = session.attempts + 1;
    const update = await supabaseRequest(
      config,
      sessionsUrl(config, {
        otp_hash: `eq.${hash}`,
        status: "eq.pending",
        attempts: `eq.${session.attempts}`,
      }),
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          attempts,
          ...(attempts >= MAX_ATTEMPTS ? { status: "locked" } : {}),
        }),
      }
    );
    if (!Array.isArray(update) || update.length === 0) {
      return {
        status: 409,
        body: { success: false, message: "This verification code was already used. Request a new code." },
      };
    }
    return attempts >= MAX_ATTEMPTS
      ? {
          status: 429,
          body: { success: false, message: "Too many incorrect attempts. Request a new code." },
        }
      : { status: 400, body: { success: false, message: "Incorrect verification code." } };
  }

  const resetToken = randomBytes(32).toString("hex");
  const update = await supabaseRequest(
    config,
    sessionsUrl(config, {
      otp_hash: `eq.${hash}`,
      status: "eq.pending",
      attempts: `eq.${session.attempts}`,
    }),
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        status: "verified",
        code_hash: "",
        reset_token_hash: tokenDigest(resetToken),
        reset_token_expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
      }),
    }
  );
  if (!Array.isArray(update) || update.length === 0) {
    return {
      status: 409,
      body: { success: false, message: "This verification code was already used. Request a new code." },
    };
  }
  return { status: 200, body: { success: true, resetToken } };
}

async function completeReset(
  config: SupabaseConfig,
  body: Record<string, unknown>
): Promise<{ status: number; body: Record<string, unknown> }> {
  const { resetToken, password } = body;
  if (
    typeof resetToken !== "string" ||
    typeof password !== "string" ||
    password.length < 8 ||
    !password.trim()
  ) {
    return {
      status: 400,
      body: { success: false, message: "Choose a password with at least 8 characters." },
    };
  }

  const resetTokenHash = tokenDigest(resetToken);
  const rows = await supabaseRequest(
    config,
    `/rest/v1/password_reset_sessions?${new URLSearchParams({
      select: "otp_hash,user_id",
      reset_token_hash: `eq.${resetTokenHash}`,
      status: "eq.verified",
      reset_token_expires_at: `gt.${new Date().toISOString()}`,
      limit: "1",
    })}`
  );
  const session = Array.isArray(rows)
    ? (rows[0] as { otp_hash: string; user_id: string } | undefined)
    : undefined;
  if (!session) {
    return {
      status: 400,
      body: {
        success: false,
        message: "Your reset session expired. Request a new verification code.",
      },
    };
  }

  const lock = await supabaseRequest(
    config,
    sessionsUrl(config, {
      otp_hash: `eq.${session.otp_hash}`,
      status: "eq.verified",
      reset_token_hash: `eq.${resetTokenHash}`,
    }),
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ status: "updating" }),
    }
  );
  if (!Array.isArray(lock) || lock.length === 0) {
    return {
      status: 409,
      body: { success: false, message: "This password reset is already being completed." },
    };
  }

  let updateResponse: Response;
  try {
    updateResponse = await fetch(
      `${config.url}/auth/v1/admin/users/${encodeURIComponent(session.user_id)}`,
      {
        method: "PUT",
        headers: supabaseHeaders(config),
        body: JSON.stringify({ password }),
      }
    );
  } catch (error) {
    await supabaseRequest(
      config,
      sessionsUrl(config, {
        otp_hash: `eq.${session.otp_hash}`,
        status: "eq.updating",
        reset_token_hash: `eq.${resetTokenHash}`,
      }),
      { method: "PATCH", body: JSON.stringify({ status: "verified" }) }
    );
    throw error;
  }

  if (!updateResponse.ok) {
    await supabaseRequest(
      config,
      sessionsUrl(config, {
        otp_hash: `eq.${session.otp_hash}`,
        status: "eq.updating",
        reset_token_hash: `eq.${resetTokenHash}`,
      }),
      { method: "PATCH", body: JSON.stringify({ status: "verified" }) }
    );
    console.error("Supabase password update failed:", updateResponse.status);
    return {
      status: 502,
      body: {
        success: false,
        message: "Unable to update your password right now. Please try again.",
      },
    };
  }

  await supabaseRequest(
    config,
    sessionsUrl(config, {
      otp_hash: `eq.${session.otp_hash}`,
      status: "eq.updating",
    }),
    {
      method: "PATCH",
      body: JSON.stringify({
        status: "completed",
        reset_token_hash: null,
        reset_token_expires_at: null,
      }),
    }
  );
  return { status: 200, body: { success: true, message: "Your password has been updated." } };
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, message: "Method not allowed." });
    return;
  }

  const action = req.query.action;
  if (typeof action !== "string" || !["request", "verify", "complete"].includes(action)) {
    res.status(404).json({ success: false, message: "Password reset route not found." });
    return;
  }

  const config = getSupabaseConfig();
  if (!config) {
    res.status(500).json({
      success: false,
      message: "Password reset is not configured on the server.",
    });
    return;
  }

  try {
    await cleanExpiredSessions(config);
    const body = parseBody(req.body);
    const result =
      action === "request"
        ? await requestReset(config, body)
        : action === "verify"
          ? await verifyReset(config, body)
          : await completeReset(config, body);
    res.status(result.status).json(result.body);
  } catch (error) {
    if (error instanceof SupabaseRequestError) {
      console.error("Supabase password reset request failed:", error.status);
      res.status(502).json({
        success: false,
        message: "Password reset service is temporarily unavailable.",
      });
      return;
    }
    console.error("Password reset function failed:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}
