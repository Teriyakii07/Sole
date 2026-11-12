import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_INTERVAL_MS = 60 * 1000;
const SESSION_RETENTION_MS = 24 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 5;

interface ApiBody {
  [key: string]: unknown;
}

type OtpSession = {
  otp_hash: string;
  phone: string;
  purpose: "registration" | "2fa_login";
  code_hash: string;
  created_at: string;
  expires_at: string;
  attempts: number;
  status: "sending" | "pending" | "verified" | "locked" | "failed";
};

type PasswordResetSession = {
  otp_hash: string;
  phone: string;
  user_id: string;
  code_hash: string;
  created_at: string;
  expires_at: string;
  attempts: number;
  status:
    | "sending"
    | "pending"
    | "verified"
    | "updating"
    | "completed"
    | "locked"
    | "failed";
  reset_token_hash: string | null;
  reset_token_expires_at: string | null;
};

type Profile = {
  id: string;
  email: string | null;
  phone_number: string | null;
};

type TableDefinition<Row> = {
  Row: Row;
  Insert: Row;
  Update: Partial<Row>;
  Relationships: [];
};

type Database = {
  public: {
    Tables: {
      otp_sessions: TableDefinition<OtpSession>;
      password_reset_sessions: TableDefinition<PasswordResetSession>;
      profiles: TableDefinition<Profile>;
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

type AdminClient = SupabaseClient<Database>;
type OtpPurpose = OtpSession["purpose"];

class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly publicMessage: string,
  ) {
    super(publicMessage);
  }
}

function isRecord(value: unknown): value is ApiBody {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function jsonResponse(body: ApiBody, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizePhilippinePhone(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const digits = value.replace(/\D/g, "");
  if (/^09\d{9}$/.test(digits)) return `63${digits.slice(1)}`;
  if (/^639\d{9}$/.test(digits)) return digits;
  return null;
}

function isOtpPurpose(value: string): value is OtpPurpose {
  return value === "registration" || value === "2fa_login";
}

function maskPhone(phone: string): string {
  return `${phone.slice(0, 4)}${"*".repeat(Math.max(0, phone.length - 6))}${
    phone.slice(-2)
  }`;
}

function randomHex(byteCount: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteCount));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

async function digestToken(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return bytesToHex(new Uint8Array(digest));
}

async function digestCode(
  secret: string,
  otpHash: string,
  code: string,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${otpHash}:${code}`),
  );
  return bytesToHex(new Uint8Array(signature));
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

function getClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRoleKey) {
    throw new ApiError(500, "Authentication service is not configured.");
  }
  return {
    client: createClient<Database>(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    }),
    serviceRoleKey,
  };
}

function checkDbError(
  error: { message: string } | null,
  operation: string,
): void {
  if (!error) return;
  console.error(`${operation} failed:`, error.message);
  throw new ApiError(502, "Authentication service is temporarily unavailable.");
}

async function hasRecentCode(
  client: AdminClient,
  phone: string,
): Promise<boolean> {
  const cutoff = new Date(Date.now() - RESEND_INTERVAL_MS).toISOString();
  const [signupResult, resetResult] = await Promise.all([
    client
      .from("otp_sessions")
      .select("otp_hash")
      .eq("phone", phone)
      .gt("created_at", cutoff)
      .neq("status", "failed")
      .limit(1),
    client
      .from("password_reset_sessions")
      .select("otp_hash")
      .eq("phone", phone)
      .gt("created_at", cutoff)
      .neq("status", "failed")
      .limit(1),
  ]);
  checkDbError(signupResult.error, "OTP resend lookup");
  checkDbError(resetResult.error, "Password-reset resend lookup");
  return (signupResult.data?.length ?? 0) > 0 ||
    (resetResult.data?.length ?? 0) > 0;
}

async function cleanExpiredSessions(client: AdminClient): Promise<void> {
  const cutoff = new Date(Date.now() - SESSION_RETENTION_MS).toISOString();
  const [otpResult, resetResult] = await Promise.all([
    client.from("otp_sessions").delete().lt("expires_at", cutoff),
    client.from("password_reset_sessions").delete().lt("expires_at", cutoff),
  ]);
  checkDbError(otpResult.error, "OTP session cleanup");
  checkDbError(resetResult.error, "Password-reset session cleanup");
}

async function sendSms(phone: string, code: string): Promise<void> {
  const apiToken = Deno.env.get("PHILSMS_API_TOKEN");
  if (!apiToken) {
    throw new ApiError(500, "PhilSMS API token is not configured.");
  }

  let response: Response;
  try {
    response = await fetch("https://dashboard.philsms.com/api/v3/sms/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        recipient: phone,
        sender_id: Deno.env.get("PHILSMS_SENDER_ID") || "PhilSMS",
        type: "plain",
        message:
          `Your SOLE verification code is ${code}. It expires in 5 minutes.`,
      }),
    });
  } catch (error) {
    console.error("PhilSMS request failed:", error);
    throw new ApiError(502, "Unable to reach PhilSMS servers right now.");
  }

  const payload: unknown = await response.json().catch(() => null);
  const result = isRecord(payload) ? payload : {};
  if (!response.ok || (result.status !== "success" && result.status !== true)) {
    console.error("PhilSMS request was rejected:", response.status);
    throw new ApiError(
      502,
      typeof result.message === "string"
        ? result.message
        : "PhilSMS service was unable to send the SMS.",
    );
  }
}

async function insertOtpSession(
  client: AdminClient,
  serviceRoleKey: string,
  options: {
    phone: string;
    purpose: string;
    userId?: string;
    table: "otp_sessions" | "password_reset_sessions";
  },
): Promise<{ otpHash: string; createdAt: number }> {
  if (await hasRecentCode(client, options.phone)) {
    throw new ApiError(
      429,
      "Please wait 60 seconds before requesting another code.",
    );
  }

  const now = Date.now();
  const code = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
  const otpCode = code.toString().padStart(6, "0");
  const otpHash = randomHex(32);
  const session = {
    otp_hash: otpHash,
    phone: options.phone,
    code_hash: await digestCode(serviceRoleKey, otpHash, otpCode),
    created_at: new Date(now).toISOString(),
    expires_at: new Date(now + OTP_TTL_MS).toISOString(),
    attempts: 0,
    status: "sending" as const,
  };
  if (options.table === "otp_sessions") {
    if (!isOtpPurpose(options.purpose)) {
      throw new ApiError(400, "Invalid OTP purpose.");
    }
    const { error } = await client.from("otp_sessions").insert({
      ...session,
      purpose: options.purpose,
    });
    checkDbError(error, "OTP session creation");
  } else {
    if (!options.userId) {
      throw new ApiError(500, "Password-reset account is unavailable.");
    }
    const { error } = await client.from("password_reset_sessions").insert({
      ...session,
      user_id: options.userId,
      reset_token_hash: null,
      reset_token_expires_at: null,
    });
    checkDbError(error, "Password-reset session creation");
  }

  try {
    await sendSms(options.phone, otpCode);
  } catch (error) {
    const updateResult = options.table === "otp_sessions"
      ? await client
        .from("otp_sessions")
        .update({ status: "failed" })
        .eq("otp_hash", otpHash)
        .eq("status", "sending")
      : await client
        .from("password_reset_sessions")
        .update({ status: "failed" })
        .eq("otp_hash", otpHash)
        .eq("status", "sending");
    checkDbError(updateResult.error, "Failed OTP cleanup");
    throw error;
  }

  const updateResult = options.table === "otp_sessions"
    ? await client
      .from("otp_sessions")
      .update({ status: "pending" })
      .eq("otp_hash", otpHash)
      .eq("status", "sending")
    : await client
      .from("password_reset_sessions")
      .update({ status: "pending" })
      .eq("otp_hash", otpHash)
      .eq("status", "sending");
  checkDbError(updateResult.error, "OTP activation");
  return { otpHash, createdAt: now };
}

async function sendOtp(
  client: AdminClient,
  serviceRoleKey: string,
  body: ApiBody,
): Promise<ApiBody> {
  const phone = normalizePhilippinePhone(body.phone);
  const purpose = typeof body.purpose === "string"
    ? body.purpose.toLowerCase()
    : "";
  if (!phone || !isOtpPurpose(purpose)) {
    throw new ApiError(
      400,
      "Enter a valid Philippine mobile number and purpose.",
    );
  }

  const session = await insertOtpSession(client, serviceRoleKey, {
    phone,
    purpose,
    table: "otp_sessions",
  });
  return {
    success: true,
    otpHash: session.otpHash,
    createdAt: session.createdAt,
    message: "Verification code sent via PhilSMS.",
  };
}

async function verifyOtp(
  client: AdminClient,
  serviceRoleKey: string,
  body: ApiBody,
): Promise<ApiBody> {
  const phone = normalizePhilippinePhone(body.phone);
  const purpose = typeof body.purpose === "string"
    ? body.purpose.toLowerCase()
    : "";
  const { hash, code } = body;
  if (
    !phone ||
    !isOtpPurpose(purpose) ||
    typeof hash !== "string" ||
    !/^[a-f0-9]{64}$/i.test(hash) ||
    typeof code !== "string" ||
    !/^\d{6}$/.test(code)
  ) {
    throw new ApiError(400, "Invalid OTP verification request.");
  }

  const { data, error } = await client
    .from("otp_sessions")
    .select("*")
    .eq("otp_hash", hash)
    .eq("phone", phone)
    .eq("purpose", purpose)
    .eq("status", "pending")
    .maybeSingle();
  checkDbError(error, "OTP lookup");

  const session = data;
  if (!session || Date.parse(session.expires_at) <= Date.now()) {
    throw new ApiError(
      400,
      "This verification session expired or is invalid. Please request a new code.",
    );
  }

  const expected = await digestCode(serviceRoleKey, hash, code);
  if (!constantTimeEqual(session.code_hash, expected)) {
    const attempts = session.attempts + 1;
    const { data: updated, error: updateError } = await client
      .from("otp_sessions")
      .update({
        attempts,
        ...(attempts >= MAX_ATTEMPTS ? { status: "locked" } : {}),
      })
      .eq("otp_hash", hash)
      .eq("status", "pending")
      .eq("attempts", session.attempts)
      .select("otp_hash")
      .maybeSingle();
    checkDbError(updateError, "OTP attempt update");
    if (!updated) {
      throw new ApiError(
        409,
        "This verification code was already used. Request a new code.",
      );
    }
    if (attempts >= MAX_ATTEMPTS) {
      throw new ApiError(
        429,
        "Too many incorrect attempts. Please request a new code.",
      );
    }
    throw new ApiError(400, "Incorrect verification code.");
  }

  const { data: updated, error: updateError } = await client
    .from("otp_sessions")
    .update({ status: "verified", code_hash: "" })
    .eq("otp_hash", hash)
    .eq("status", "pending")
    .eq("attempts", session.attempts)
    .select("otp_hash")
    .maybeSingle();
  checkDbError(updateError, "OTP verification update");
  if (!updated) {
    throw new ApiError(
      409,
      "This verification code was already used. Request a new code.",
    );
  }
  return {
    success: true,
    message: "Phone number verified successfully.",
    phone,
  };
}

async function findAuthAccountByEmail(
  client: AdminClient,
  email: string,
): Promise<{ userId: string; phone: string | null } | null> {
  const { data: profile, error } = await client
    .from("profiles")
    .select("id,phone_number")
    .eq("email", email)
    .limit(1)
    .maybeSingle();
  checkDbError(error, "Profile lookup");

  const profilePhone = normalizePhilippinePhone(profile?.phone_number);
  if (typeof profile?.id === "string" && profilePhone) {
    return { userId: profile.id, phone: profilePhone };
  }

  const perPage = 1000;
  for (let page = 1;; page += 1) {
    const { data, error: authError } = await client.auth.admin.listUsers({
      page,
      perPage,
    });
    checkDbError(authError, "Auth account lookup");

    for (const user of data.users) {
      if (user.email?.toLowerCase() !== email) continue;
      const candidates = [
        user.user_metadata?.phone_number,
        user.user_metadata?.phone,
        user.phone,
      ];
      const phone = candidates.reduce<string | null>(
        (found, value) => found || normalizePhilippinePhone(value),
        null,
      );
      return { userId: user.id, phone };
    }
    if (data.users.length < perPage) return null;
  }
}

async function requestPasswordReset(
  client: AdminClient,
  serviceRoleKey: string,
  body: ApiBody,
): Promise<ApiBody> {
  const email = typeof body.email === "string"
    ? body.email.trim().toLowerCase()
    : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, "Enter a valid email address.");
  }

  const account = await findAuthAccountByEmail(client, email);
  if (!account?.phone) {
    throw new ApiError(
      404,
      "We couldn't find a valid phone number linked to this email. Check your account details or contact support.",
    );
  }

  const session = await insertOtpSession(client, serviceRoleKey, {
    phone: account.phone,
    purpose: "password_reset",
    userId: account.userId,
    table: "password_reset_sessions",
  });
  return {
    success: true,
    otpHash: session.otpHash,
    createdAt: session.createdAt,
    message: "Verification code sent via PhilSMS.",
    phone: maskPhone(account.phone),
  };
}

async function verifyPasswordReset(
  client: AdminClient,
  serviceRoleKey: string,
  body: ApiBody,
): Promise<ApiBody> {
  const { hash, code } = body;
  if (
    typeof hash !== "string" ||
    !/^[a-f0-9]{64}$/i.test(hash) ||
    typeof code !== "string" ||
    !/^\d{6}$/.test(code)
  ) {
    throw new ApiError(400, "Enter a valid 6-digit verification code.");
  }

  const { data, error } = await client
    .from("password_reset_sessions")
    .select("*")
    .eq("otp_hash", hash)
    .eq("status", "pending")
    .maybeSingle();
  checkDbError(error, "Password-reset OTP lookup");

  const session = data;
  if (!session?.user_id || Date.parse(session.expires_at) <= Date.now()) {
    throw new ApiError(
      400,
      "This verification session expired or is invalid. Request a new code.",
    );
  }

  const expected = await digestCode(serviceRoleKey, hash, code);
  if (!constantTimeEqual(session.code_hash, expected)) {
    const attempts = session.attempts + 1;
    const { data: updated, error: updateError } = await client
      .from("password_reset_sessions")
      .update({
        attempts,
        ...(attempts >= MAX_ATTEMPTS ? { status: "locked" } : {}),
      })
      .eq("otp_hash", hash)
      .eq("status", "pending")
      .eq("attempts", session.attempts)
      .select("otp_hash")
      .maybeSingle();
    checkDbError(updateError, "Password-reset attempt update");
    if (!updated) {
      throw new ApiError(
        409,
        "This verification code was already used. Request a new code.",
      );
    }
    if (attempts >= MAX_ATTEMPTS) {
      throw new ApiError(
        429,
        "Too many incorrect attempts. Request a new code.",
      );
    }
    throw new ApiError(400, "Incorrect verification code.");
  }

  const resetToken = randomHex(32);
  const { data: updated, error: updateError } = await client
    .from("password_reset_sessions")
    .update({
      status: "verified",
      code_hash: "",
      reset_token_hash: await digestToken(resetToken),
      reset_token_expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
    })
    .eq("otp_hash", hash)
    .eq("status", "pending")
    .eq("attempts", session.attempts)
    .select("otp_hash")
    .maybeSingle();
  checkDbError(updateError, "Password-reset verification update");
  if (!updated) {
    throw new ApiError(
      409,
      "This verification code was already used. Request a new code.",
    );
  }
  return { success: true, resetToken };
}

async function completePasswordReset(
  client: AdminClient,
  body: ApiBody,
): Promise<ApiBody> {
  const { resetToken, password } = body;
  if (
    typeof resetToken !== "string" ||
    typeof password !== "string" ||
    password.length < 8 ||
    !password.trim()
  ) {
    throw new ApiError(400, "Choose a password with at least 8 characters.");
  }

  const resetTokenHash = await digestToken(resetToken);
  const { data, error } = await client
    .from("password_reset_sessions")
    .select("otp_hash,user_id")
    .eq("reset_token_hash", resetTokenHash)
    .eq("status", "verified")
    .gt("reset_token_expires_at", new Date().toISOString())
    .limit(1)
    .maybeSingle();
  checkDbError(error, "Password-reset ticket lookup");

  if (!data?.user_id) {
    throw new ApiError(
      400,
      "Your reset session expired. Request a new verification code.",
    );
  }

  const { data: locked, error: lockError } = await client
    .from("password_reset_sessions")
    .update({ status: "updating" })
    .eq("otp_hash", data.otp_hash)
    .eq("reset_token_hash", resetTokenHash)
    .eq("status", "verified")
    .select("otp_hash")
    .maybeSingle();
  checkDbError(lockError, "Password-reset ticket lock");
  if (!locked) {
    throw new ApiError(409, "This password reset is already being completed.");
  }

  const restoreTicket = async () => {
    const { error: restoreError } = await client
      .from("password_reset_sessions")
      .update({ status: "verified" })
      .eq("otp_hash", data.otp_hash)
      .eq("reset_token_hash", resetTokenHash)
      .eq("status", "updating");
    checkDbError(restoreError, "Password-reset ticket restore");
  };

  try {
    const { error: updateError } = await client.auth.admin.updateUserById(
      data.user_id,
      {
        password,
      },
    );
    if (updateError) {
      await restoreTicket();
      console.error("Supabase password update failed:", updateError.message);
      throw new ApiError(
        502,
        "Unable to update your password right now. Please try again.",
      );
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    await restoreTicket();
    throw error;
  }

  const { error: finishError } = await client
    .from("password_reset_sessions")
    .update({
      status: "completed",
      reset_token_hash: null,
      reset_token_expires_at: null,
    })
    .eq("otp_hash", data.otp_hash)
    .eq("status", "updating");
  checkDbError(finishError, "Password-reset completion");
  return { success: true, message: "Your password has been updated." };
}

Deno.serve(async (request: Request): Promise<Response> => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse(
      { success: false, message: "Method not allowed." },
      405,
    );
  }

  try {
    const { client, serviceRoleKey } = getClient();
    const payload: unknown = await request.json().catch(() => null);
    if (!isRecord(payload) || typeof payload.action !== "string") {
      throw new ApiError(400, "Invalid request.");
    }

    await cleanExpiredSessions(client);

    let result: ApiBody;
    switch (payload.action) {
      case "send-otp":
        result = await sendOtp(client, serviceRoleKey, payload);
        break;
      case "verify-otp":
        result = await verifyOtp(client, serviceRoleKey, payload);
        break;
      case "request-password-reset":
        result = await requestPasswordReset(client, serviceRoleKey, payload);
        break;
      case "verify-password-reset":
        result = await verifyPasswordReset(client, serviceRoleKey, payload);
        break;
      case "complete-password-reset":
        result = await completePasswordReset(client, payload);
        break;
      default:
        throw new ApiError(404, "Authentication action not found.");
    }
    return jsonResponse(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonResponse(
        { success: false, message: error.publicMessage },
        error.status,
      );
    }
    console.error("Supabase auth-otp function failed:", error);
    return jsonResponse(
      { success: false, message: "Internal server error." },
      500,
    );
  }
});
