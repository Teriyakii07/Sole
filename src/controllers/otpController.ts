import type { OTPPayload, AuthResponse, OTPPurpose } from '../views/types/AuthTypes';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

export const requestPasswordResetOTP = async (email: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/password-reset/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
    const data = await response.json();

    if (!response.ok || !data.success) {
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
    const response = await fetch(`${API_BASE_URL}/api/password-reset/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash, code }),
    });
    const data = await response.json();

    if (!response.ok || !data.success) {
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
    const response = await fetch(`${API_BASE_URL}/api/password-reset/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resetToken, password }),
    });
    const data = await response.json();

    if (!response.ok || !data.success) {
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

    console.log('Sending payload to backend:', {
      phone: normalizedPhone,
      purpose: normalizedPurpose
    });

    const response = await fetch(`${API_BASE_URL}/api/otp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: normalizedPhone,
        purpose: normalizedPurpose,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
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

    const response = await fetch(`${API_BASE_URL}/api/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: normalizedPhone,
        code: payload.code.trim(),
        purpose: normalizedPurpose,
        hash: payload.hash,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
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