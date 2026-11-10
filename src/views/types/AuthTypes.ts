export interface LoginPayload {
  usernameOrEmail: string;
  password: string;
}

export interface SignUpPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export type OTPPurpose =
  | 'REGISTRATION'
  | '2FA_LOGIN';

export interface OTPPayload {
  phone: string;
  code: string;
  purpose: OTPPurpose;
  hash: string;
  createdAt?: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  requiresOTP?: boolean;
  token?: string;
  phone?: string;
  userId?: string;
  otpHash?: string;
  createdAt?: number;
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string | undefined;
}

export interface PasswordResetPayload {
  email: string;
}