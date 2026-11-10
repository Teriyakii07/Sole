
export interface OTPPayload {
  phone: string;
  code: string;
  purpose: "REGISTRATION" | "2FA_LOGIN";
  otpHash: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  requiresOTP?: boolean;
  phone?: string;
  userId?: string;
  otpHash?: string;
}
