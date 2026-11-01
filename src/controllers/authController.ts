import type {
  LoginPayload,
  SignUpPayload,
  AuthResponse,
  UserProfile
} from '../models/Auth';

import { supabase } from '../lib/supabaseClient';
// import { sendPhilSMSOTP } from './otpController';


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

    // Authenticate using Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: credentials.password
    });

    if (error) {
      return {
        success: false,
        message: 'Invalid email or password.'
      };
    }

    if (!data.user) {
      return {
        success: false,
        message: 'Unable to retrieve your account.'
      };
    }

    // Retrieve registered phone number
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
    //ibalik lang ni mag api na
    // Send 2FA OTP to registered phone
    // await sendPhilSMSOTP(
    //   profile.phone_number,
    //   '2FA_LOGIN'
    // );

    // return {
    //   success: true,
    //   requiresOTP: true,
    //   message: 'OTP sent to your registered phone number.',
    //   phone: profile.phone_number,
    //   userId: data.user.id
    // };

    return {
      success: true,
      message: 'Login successful!',
      requiresOTP: false,
    };

  } catch (error) {
    console.error('Login error:', error);

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
    // Validate password
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
    const phone = data.phone.trim();

    if (!email || !phone || !data.firstName.trim() || !data.lastName.trim()) {
      return {
        success: false,
        message: 'Please complete all required fields.'
      };
    }

    // Create account through Supabase Auth
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
    //ibalik lang ni mag api na
    // Send registration OTP
    // await sendPhilSMSOTP(
    //   phone,
    //   'REGISTRATION'
    // );

    // return {
    //   success: true,
    //   requiresOTP: true,
    //   message: 'Account created. Please verify your phone number.',
    //   phone,
    //   userId: result.user.id
    // };

    return {
      success: true,
      message: 'Registration successful!',
      requiresOTP: false,
    };

  } catch (error) {
    console.error('Registration error:', error);

    return {
      success: false,
      message: 'An unexpected error occurred during registration.'
    };
  }
};

export const handleLogout = async (): Promise<AuthResponse> => {

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
    console.error('Password reset error:', error);

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
    console.error('Profile retrieval error:', error);
    return null;
  }

  return data as UserProfile;
};
