
import type {
  LoginPayload,
  SignUpPayload,
  AuthResponse,
  UserProfile
} from '../views/types/AuthTypes';

import { supabase } from '../lib/supabaseClient';
import { sendPhilSMSOTP } from './otpController';

export const handleLogin = async (
  credentials: LoginPayload
): Promise<AuthResponse> => {
  try {
    const email = credentials.usernameOrEmail.trim().toLowerCase();

    if (!email || !credentials.password) {
      return {
        success: false,
        message: 'Please enter your email and password.'
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: credentials.password
    });

    if (error || !data.user) {
      return {
        success: false,
        message: 'Invalid email or password.'
      };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('phone_number')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile?.phone_number) {
      await supabase.auth.signOut();

      return {
        success: false,
        message: 'Your account does not have a registered phone number.'
      };
    }

    const otpResult = await sendPhilSMSOTP(
      profile.phone_number,
      '2FA_LOGIN'
    );

    if (!otpResult.success) {
      await supabase.auth.signOut();

      return {
        success: false,
        message: otpResult.message ?? 'Unable to send OTP. Please try again.'
      };
    }

    // Do not leave an authenticated session active while
    // the user has not completed OTP verification.
    await supabase.auth.signOut();

    return {
      success: true,
      requiresOTP: true,
      message: otpResult.message ?? 'OTP sent successfully.',
      phone: otpResult.phone,
      userId: data.user.id,
      otpHash: otpResult.otpHash,
      createdAt: otpResult.createdAt
    };

  } catch (error) {
    console.error('Login Error:', error);

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
    const phone = data.phone.replace(/[\s-]/g, '');

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

    if (!/^(\+639\d{9}|09\d{9})$/.test(phone)) {
      return {
        success: false,
        message: 'Please enter a valid Philippine phone number.'
      };
    }

    const { data: result, error } = await supabase.auth.signUp({
      email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName.trim(),
          last_name: data.lastName.trim(),
          phone_number: phone
        }
      }
    });

    if (error) {
      return {
        success: false,
        message: error.message
      };
    }

    if (!result.user) {
      return {
        success: false,
        message: 'Unable to create your account.'
      };
    }

    const otpResult = await sendPhilSMSOTP(
      phone,
      'REGISTRATION'
    );

    if (!otpResult.success) {
      return {
        success: false,
        message: otpResult.message ?? 'Unable to send OTP. Please try again.'
      };
    }

    return {
      success: true,
      requiresOTP: true,
      message: 'Account created. Please verify your phone number.',
      phone: otpResult.phone,
      userId: result.user.id,
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

export const handleLogout = async (): Promise<AuthResponse> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        message: error.message
      };
    }

    return {
      success: true,
      message: 'Successfully logged out.'
    };

  } catch (error) {
    console.error('Logout Error:', error);

    return {
      success: false,
      message: 'Unable to log out.'
    };
  }
};

export const handleForgotPassword = async (
  email: string
): Promise<AuthResponse> => {
  try {
    if (!email.trim()) {
      return {
        success: false,
        message: 'Please enter your email address.'
      };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        redirectTo: `${window.location.origin}/reset-password`
      }
    );

    if (error) {
      return {
        success: false,
        message: error.message
      };
    }

    return {
      success: true,
      message: 'If an account exists, a password reset email will be sent.'
    };

  } catch (error) {
    console.error('Password Reset Error:', error);

    return {
      success: false,
      message: 'Unable to process your password reset request.'
    };
  }
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return data.user;
};

export const getUserProfile = async (): Promise<UserProfile | null> => {
  const { data: userData, error: userError } =
    await supabase.auth.getUser();

  if (userError || !userData.user) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userData.user.id)
    .single();

  if (error) {
    console.error('Profile Retrieval Error:', error);
    return null;
  }

  return data as UserProfile;
};
