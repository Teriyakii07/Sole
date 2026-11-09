
import { supabase } from '../lib/supabaseClient';

export type OTPPurpose =
  | 'REGISTRATION'
  | '2FA_LOGIN';

export interface OTPPayload {
  phone: string;
  code: string;
  hash: string;
  purpose: OTPPurpose;
  createdAt?: number;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  requiresOTP?: boolean;
  phone?: string;
  otpHash?: string;
  createdAt?: number;
}

const FUNCTION_NAME = 'otp';

function normalizePhone(phone: string): string {
  return phone.replace(/[\s()-]/g, '');
}

function validPhone(phone: string): boolean {
  return /^(\+639\d{9}|09\d{9})$/.test(phone);
}

async function getErrorMessage(error: {
  message: string;
  context?: unknown;
}): Promise<string> {
  if (error.context instanceof Response) {
    try {
      const result = await error.context.clone().json();

      if (typeof result?.message === 'string') {
        return result.message;
      }
    } catch {
      // Use fallback message.
    }

    return `OTP server error (${error.context.status}).`;
  }

  return error.message || 'Unable to contact OTP service.';
}

// SEND OTP
export const sendPhilSMSOTP = async (
  phone: string,
  purpose: OTPPurpose
): Promise<AuthResponse> => {
  try {
    const normalizedPhone = normalizePhone(phone);

    if (!validPhone(normalizedPhone)) {
      return {
        success: false,
        message: 'Please enter a valid Philippine phone number.',
      };
    }

    const { data, error } = await supabase.functions.invoke(
      FUNCTION_NAME,
      {
        body: {
          action: 'send',
          phone: normalizedPhone,
          purpose,
        },
      }
    );

    if (error) {
      console.error('OTP Send Error:', error);

      return {
        success: false,
        message: await getErrorMessage(error),
      };
    }

    const result = data as AuthResponse;

    if (
      !result?.success ||
      !result.otpHash ||
      typeof result.createdAt !== 'number'
    ) {
      return {
        success: false,
        message: result?.message || 'Unable to send OTP.',
      };
    }

    return {
      success: true,
      requiresOTP: true,
      message: result.message,
      phone: normalizedPhone,
      otpHash: result.otpHash,
      createdAt: result.createdAt,
    };

  } catch (error) {
    console.error('OTP Send Exception:', error);

    return {
      success: false,
      message: 'Unexpected error while sending OTP.',
    };
  }
};

// VERIFY OTP
export const verifyPhilSMSOTP = async (
  payload: OTPPayload
): Promise<AuthResponse> => {
  try {
    const normalizedPhone = normalizePhone(payload.phone);

    if (
      !validPhone(normalizedPhone) ||
      !payload.hash ||
      !payload.purpose
    ) {
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

    const { data, error } = await supabase.functions.invoke(
      FUNCTION_NAME,
      {
        body: {
          action: 'verify',
          phone: normalizedPhone,
          code: payload.code,
          purpose: payload.purpose,
          hash: payload.hash,
        },
      }
    );

    if (error) {
      console.error('OTP Verify Error:', error);

      return {
        success: false,
        message: await getErrorMessage(error),
      };
    }

    const result = data as AuthResponse;

    if (!result?.success) {
      return {
        success: false,
        message: result?.message || 'Invalid OTP code.',
      };
    }

    return {
      success: true,
      message: result.message || 'OTP verified successfully.',
      phone: result.phone,
    };

  } catch (error) {
    console.error('OTP Verify Exception:', error);

    return {
      success: false,
      message: 'Unexpected error during OTP verification.',
    };
  }
};
