import type {
  LoginPayload,
  SignUpPayload,
  AuthResponse,
  UserProfile
} from '../views/types/AuthTypes';

import { sendPhilSMSOTP } from './otpController';
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

// Session from a correct password, held in memory until the OTP is verified.

export async function handleLogin(
  credentials: LoginPayload
): Promise<AuthResponse> {
  try {
    const identifier = credentials.usernameOrEmail?.trim();
    const password = credentials.password;

    if (!identifier || !password) {
      return {
        success: false,
        message: 'Please enter your email and password.',
      };
    }

    // Login directly through Supabase.
    // No login OTP should be sent here.
    const { data, error } = await supabase.auth.signInWithPassword({
      email: identifier,
      password,
      
    });

    

    if (error) {
      console.error('Supabase login error:', error);

      return {
        success: false,
        message: error.message,
      };
    }

    if (!data.user || !data.session) {
      return {
        success: false,
        message: 'Unable to establish your login session.',
      };
    }

    return {
      success: true,
      message: 'Login successful.',
    };

  } catch (error) {
    console.error('Login error:', error);

    return {
      success: false,
      message: 'An unexpected error occurred during login.',
    };
  }
}

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

export async function handleLogout(): Promise<AuthResponse> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  return {
    success: true,
    message: 'Logged out successfully.',
  };
}

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