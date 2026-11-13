import { supabase } from '../lib/supabaseClient';

import type {
  AuthResponse,
  OTPPayload,
} from '../views/types/AuthTypes';

type OTPApiResponse = AuthResponse;


async function callAuthApi(
  action: string,
  payload: Record<string, unknown> = {}
): Promise<AuthResponse> {
  const { data, error } = await supabase.functions.invoke('auth-otp', {
    body: {
      action,
      ...payload,
    },
  });

  if (error) {
    console.error('OTP Edge Function error:', error);

    let errorMessage =
      'Unable to connect to the authentication service. Please try again.';

    // Read the actual JSON error returned by the Edge Function.
    if ('context' in error && error.context instanceof Response) {
      try {
        const responseBody = await error.context.clone().json();

        console.error('Edge Function error response:', responseBody);

        if (
          responseBody &&
          typeof responseBody.message === 'string'
        ) {
          errorMessage = responseBody.message;
        }
      } catch (parseError) {
        console.error('Unable to parse Edge Function error:', parseError);
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }

  if (!data?.success) {
    throw new Error(data?.message || 'OTP request failed.');
  }

  return data as AuthResponse;
}


// REGISTRATION: Send OTP
export async function sendPhilSMSOTP(
  phone: string,
  purpose: 'registration'
): Promise<AuthResponse> {
  return callAuthApi('send-otp', {
    phone,
    purpose,
  });
}

// REGISTRATION: Verify OTP
export async function verifyPhilSMSOTP(
  payload: OTPPayload
): Promise<AuthResponse> {
  return callAuthApi('verify-otp', {
    phone: payload.phone,
    code: payload.code,
    hash: payload.hash,
    purpose: payload.purpose,
  });
}

// FORGOT PASSWORD: Request OTP
export async function requestPasswordResetOTP(
  email: string
): Promise<AuthResponse> {
  return callAuthApi('request-password-reset', {
    email,
  });
}

// FORGOT PASSWORD: Verify OTP
export async function verifyPasswordResetOTP(
  hash: string,
  code: string
): Promise<AuthResponse> {
  return callAuthApi('verify-password-reset', {
    hash,
    code,
  });
}

// FORGOT PASSWORD: Update password
export async function completePasswordReset(
  resetToken: string,
  password: string
): Promise<AuthResponse> {
  return callAuthApi('complete-password-reset', {
    resetToken,
    password,
  });
}