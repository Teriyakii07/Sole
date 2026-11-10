import type {
  LoginPayload,
  SignUpPayload,
  AuthResponse,
  UserProfile
} from '../views/types/AuthTypes';

import { sendPhilSMSOTP } from './otpController';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

// Helper function to format any PH number (+639..., 639..., 09...) into 639XXXXXXXXX
function formatPhilippinePhone(phone: string): string {
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

// The password check runs on this isolated, in-memory client, so nothing is saved
// in the browser and the main `supabase` client stays signed out until the OTP passes.
const env = (import.meta as any).env ?? {};
const authProbe = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storageKey: 'sole-2fa-probe'
  }
});

// Session from a correct password, held in memory until the OTP is verified.
let pendingSession: { access_token: string; refresh_token: string } | null = null;

// Drop the held session and revoke it on the server (used on cancel / failure).
const discardPendingSession = (): void => {
  if (pendingSession) {
    pendingSession = null;
    void authProbe.auth.signOut({ scope: 'local' });
  }
};

export const handleLogin = async (
  credentials: LoginPayload
): Promise<AuthResponse> => {
  try {
    const rawInput = credentials.usernameOrEmail.trim();

    if (!rawInput || !credentials.password) {
      return {
        success: false,
        message: 'Please enter your email/phone number and password.'
      };
    }

    let loginEmail = rawInput.toLowerCase();

    // 1. Detect if the user entered a Philippine phone number instead of an email
    const isPhoneInput = /^(\+639\d{9}|639\d{9}|09\d{9})$/.test(rawInput.replace(/[\s()-]/g, ''));

    if (isPhoneInput) {
      const formattedInputPhone = formatPhilippinePhone(rawInput);

      // Query profiles table to find the linked email for this phone number
      const { data: phoneProfile, error: phoneError } = await supabase
        .from('profiles')
        .select('id, email, phone_number')
        .eq('phone_number', formattedInputPhone)
        .maybeSingle();

      if (phoneError || !phoneProfile || !phoneProfile.email) {
        return {
          success: false,
          message: 'No account found linked to this mobile number.'
        };
      }

      // Map resolved profile email to login credentials
      loginEmail = phoneProfile.email;
    }

    // 2. Authenticate credentials with Supabase Auth using resolved email
    const { data: authData, error: authError } = await authProbe.auth.signInWithPassword({
      email: loginEmail,
      password: credentials.password
    });

    if (authError || !authData.user) {
      return {
        success: false,
        message: authError?.message || 'Invalid email/phone number or password.'
      };
    }

    let rawPhone = '';

    // 3. Fetch phone from profiles table using authenticated session
    const { data: profile } = await authProbe
      .from('profiles')
      .select('phone_number')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (profile?.phone_number) {
      rawPhone = profile.phone_number;
    }

    // 4. Fallback to auth metadata if profile query yields nothing
    if (!rawPhone) {
      rawPhone =
        authData.user.user_metadata?.phone_number ||
        authData.user.user_metadata?.phone ||
        authData.user.phone ||
        '';
    }

    // 5. Strictly format to 639XXXXXXXXX (12 digits)
    const formattedPhone = formatPhilippinePhone(rawPhone);

    console.log('User ID:', authData.user.id);
    console.log('Fetched Raw Phone:', rawPhone);
    console.log('Formatted Phone for PhilSMS:', formattedPhone);

    // 5b. Password is correct, but the user is NOT signed in until the OTP passes.
    //     Keep the session in memory only; the main client is still signed out.
    pendingSession = authData.session
      ? {
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token
        }
      : null;

    // GUARD: Catch empty/invalid numbers locally BEFORE calling backend API
    if (!formattedPhone || !/^(639\d{9})$/.test(formattedPhone)) {
      discardPendingSession();
      return {
        success: false,
        message: 'No registered Philippine mobile number found in your profile. Please check Supabase profiles.'
      };
    }

    // 6. Send PhilSMS OTP directly with standard formattedPhone
    const otpResult = await sendPhilSMSOTP(formattedPhone, 'login');

    if (!otpResult.success) {
      discardPendingSession();
      return {
        success: false,
        message: otpResult.message ?? 'Unable to send OTP via PhilSMS. Please try again.'
      };
    }

    return {
      success: true,
      requiresOTP: true,
      message: otpResult.message ?? 'OTP sent successfully via PhilSMS.',
      phone: otpResult.phone,
      otpHash: otpResult.otpHash,
      createdAt: otpResult.createdAt
    };

  } catch (error) {
    console.error('Login Error:', error);
    discardPendingSession();
    return {
      success: false,
      message: 'An unexpected error occurred during login.'
    };
  }
};

export const handleSignUp = async (
  data: SignUpPayload
): Promise<AuthResponse> => {
  try {
    if (data.password !== data.confirmPassword) {
      return {
        success: false,
        message: 'Passwords do not match.'
      };
    }

    if (data.password.length < 8) {
      return {
        success: false,
        message: 'Password must contain at least 8 characters.'
      };
    }

    const email = data.email.trim().toLowerCase();
    const phone = formatPhilippinePhone(data.phone);

    if (
      !email ||
      !phone ||
      !data.firstName.trim() ||
      !data.lastName.trim()
    ) {
      return {
        success: false,
        message: 'Please complete all required fields.'
      };
    }

    if (!/^(639\d{9})$/.test(phone)) {
      return {
        success: false,
        message: 'Please enter a valid Philippine phone number starting with 09, 639, or +639.'
      };
    }

    // 1. Create User in Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName.trim(),
          last_name: data.lastName.trim(),
          full_name: `${data.firstName.trim()} ${data.lastName.trim()}`,
          phone_number: phone,
          phone: phone
        }
      }
    });

    if (signUpError || !signUpData.user) {
      return {
        success: false,
        message: signUpError?.message || 'Failed to register account with Supabase Auth.'
      };
    }

    // 2. Save user details to profiles table (persisting email column for phone logins)
    const { error: profileError } = await supabase.from('profiles').upsert([
      {
        id: signUpData.user.id,
        email: email,
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        phone_number: phone
      }
    ]);

    if (profileError) {
      console.error('Error saving profile to database:', profileError);
    }

    // 3. Trigger PhilSMS OTP
    const otpResult = await sendPhilSMSOTP(phone, 'registration');

    if (!otpResult.success) {
      return {
        success: false,
        message: otpResult.message ?? 'Unable to send OTP via PhilSMS. Please try again.'
      };
    }

    return {
      success: true,
      requiresOTP: true,
      message: 'Please verify your phone number using the code sent by PhilSMS.',
      phone: otpResult.phone,
      otpHash: otpResult.otpHash,
      createdAt: otpResult.createdAt
    };

  } catch (error) {
    console.error('Registration Error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred during registration.'
    };
  }
};

// Call after the 2FA OTP is verified: restores the parked session so the user is signed in.
export const completeLogin = async (): Promise<AuthResponse> => {
  if (!pendingSession) {
    return {
      success: false,
      message: 'Your login session expired. Please sign in again.'
    };
  }

  const { error } = await supabase.auth.setSession(pendingSession);
  pendingSession = null;

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: 'Signed in successfully.' };
};

// Call if the user closes the OTP modal without verifying.
export const cancelPendingLogin = (): void => {
  discardPendingSession();
};

export const handleLogout = async (): Promise<AuthResponse> => {
  await supabase.auth.signOut();
  return {
    success: true,
    message: 'Successfully logged out.'
  };
};

export const handleForgotPassword = async (
  email: string
): Promise<AuthResponse> => {
  if (!email.trim()) {
    return {
      success: false,
      message: 'Please enter your email address.'
    };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim());

  if (error) {
    return {
      success: false,
      message: error.message
    };
  }

  return {
    success: true,
    message: 'Password reset request sent.'
  };
};

export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
};

export const getUserProfile = async (): Promise<UserProfile | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  return {
    id: user.id,
    first_name: user.user_metadata?.first_name ?? '',
    last_name: user.user_metadata?.last_name ?? '',
    phone_number: user.user_metadata?.phone_number ?? user.user_metadata?.phone ?? '',
    created_at: user.created_at,
    updated_at: user.updated_at ?? user.created_at
  } as UserProfile;
};