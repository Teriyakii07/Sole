import type { OTPPayload, AuthResponse, OTPPurpose } from '../views/types/AuthTypes';
import { supabase } from '../lib/supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

type ApiResponse = Partial<AuthResponse>;

function isApiResponse(value: unknown): value is ApiResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    typeof value.success === 'boolean'
  );
}

async function getFunctionErrorMessage(error: Error): Promise<string> {
  if ('context' in error && error.context instanceof Response) {
    const payload: unknown = await error.context.json().catch(() => null);
    if (
      typeof payload === 'object' &&
      payload !== null &&
      'message' in payload &&
      typeof payload.message === 'string'
    ) {
      return payload.message;
    }
  }
  return error.message;
}

async function callAuthApi(
  path: string,
  action: string,
  payload: Record<string, unknown>
): Promise<ApiResponse> {
  if (import.meta.env.DEV) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data: unknown = await response.json().catch(() => null);
    if (!isApiResponse(data)) {
      throw new Error(response.ok ? 'Invalid response from authentication service.' : response.statusText);
    }
    return data;
  }

  const { data, error } = await supabase.functions.invoke<ApiResponse>('auth-otp', {
    body: { action, ...payload },
  });
  if (error) {
    return { success: false, message: await getFunctionErrorMessage(error) };
  }
  if (!isApiResponse(data)) {
    throw new Error('Invalid response from authentication service.');
  }
  return data;
}

export const requestPasswordResetOTP = async (email: string): Promise<AuthResponse> => {
  try {
    const data = await callAuthApi(
      '/api/password-reset/request',
      'request-password-reset',
      { email: email.trim().toLowerCase() }
    );

    if (!data.success) {
      return {
        success: false,
        message: data.message || 'Unable to send a password reset code.',
      };
    }

    return {
      success: true,
      requiresOTP: true,
      message: data.message || 'Verification code sent via PhilSMS.',
      phone: data.phone,
      otpHash: data.otpHash,
      createdAt: data.createdAt,
    };
  } catch (error) {
    console.error('Password Reset OTP Request Error:', error);
    return {
      success: false,
      message: 'Network error while requesting a password reset code.',
    };
  }
};

export const verifyPasswordResetOTP = async (
  hash: string,
  code: string
): Promise<AuthResponse> => {
  try {
    const data = await callAuthApi(
      '/api/password-reset/verify',
      'verify-password-reset',
      { hash, code }
    );

    if (!data.success) {
      return {
        success: false,
        message: data.message || 'Invalid or expired verification code.',
      };
    }

    return {
      success: true,
      message: 'Phone number verified successfully.',
      resetToken: data.resetToken,
    };
  } catch (error) {
    console.error('Password Reset OTP Verification Error:', error);
    return {
      success: false,
      message: 'Network error while verifying your code.',
    };
  }
};

export const completePasswordReset = async (
  resetToken: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const data = await callAuthApi(
      '/api/password-reset/complete',
      'complete-password-reset',
      { resetToken, password }
    );

    if (!data.success) {
      return {
        success: false,
        message: data.message || 'Unable to update your password.',
      };
    }

    return {
      success: true,
      message: data.message || 'Your password has been updated.',
    };
  } catch (error) {
    console.error('Password Reset Completion Error:', error);
    return {
      success: false,
      message: 'Network error while updating your password.',
    };
  }
};

// Standardizes any PH phone number format (+639..., 09..., 639...) to 639XXXXXXXXX
function normalizePhone(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[\s()-]/g, '');
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1);
  }
  if (cleaned.startsWith('09') && cleaned.length === 11) {
    cleaned = `639${cleaned.slice(2)}`;
  }
  return cleaned;
}

// Validates against standard Philippine mobile formats
function validPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s()-]/g, '');
  return /^(639\d{9}|09\d{9}|\+639\d{9})$/.test(cleaned);
}

// SEND PhilSMS OTP
export const sendPhilSMSOTP = async (
  phone: string,
  purpose: OTPPurpose | string
): Promise<AuthResponse> => {
  try {
    const rawPhone = (phone || '').trim();
    const normalizedPurpose = purpose ? purpose.toString().trim().toLowerCase() : '2fa_login';

    if (!validPhone(rawPhone)) {
      return {
        success: false,
        message: 'Please enter a valid Philippine phone number.',
      };
    }

    // Always normalize to 639XXXXXXXXX format for consistent backend API payloads
    const normalizedPhone = normalizePhone(rawPhone);

    const data = await callAuthApi(
      '/api/otp/send',
      'send-otp',
      { phone: normalizedPhone, purpose: normalizedPurpose }
    );

    if (!data.success) {
      return {
        success: false,
        message: data.message || 'Unable to send OTP via PhilSMS.',
      };
    }

    return {
      success: true,
      requiresOTP: true,
      message: data.message || 'Verification code sent via PhilSMS.',
      phone: normalizedPhone,
      otpHash: data.otpHash,
      createdAt: data.createdAt,
    };
  } catch (error) {
    console.error('OTP Send Error:', error);
    return {
      success: false,
      message: 'Network error while requesting PhilSMS OTP.',
    };
  }
};

// VERIFY PhilSMS OTP
export const verifyPhilSMSOTP = async (
  payload: OTPPayload
): Promise<AuthResponse> => {
  try {
    const normalizedPhone = normalizePhone(payload.phone);
    const normalizedPurpose = payload.purpose ? payload.purpose.toString().trim().toLowerCase() : '';

    if (!validPhone(normalizedPhone) || !payload.hash || !normalizedPurpose) {
      return {
        success: false,
        message: 'Missing OTP verification information.',
      };
    }

    if (!/^\d{6}$/.test(payload.code)) {
      return {
        success: false,
        message: 'Please enter a valid 6-digit OTP.',
      };
    }

    const data = await callAuthApi(
      '/api/otp/verify',
      'verify-otp',
      {
        phone: normalizedPhone,
        code: payload.code.trim(),
        purpose: normalizedPurpose,
        hash: payload.hash,
      }
    );

    if (!data.success) {
      return {
        success: false,
        message: data.message || 'Invalid or expired OTP code.',
      };
    }

    return {
      success: true,
      message: data.message || 'Phone number verified successfully.',
      phone: normalizedPhone,
    };
  } catch (error) {
    console.error('OTP Verify Error:', error);
    return {
      success: false,
      message: 'Network error during OTP verification.',
    };
  }
};