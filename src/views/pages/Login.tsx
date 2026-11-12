import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';

import { handleLogin } from '../../controllers/authController';
import { AuthLayout } from '../components/Auth/AuthLayout';

interface LoginErrors {
  usernameOrEmail?: string;
  password?: string;
  general?: string;
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const from = location.state?.from;

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  // Login states
  const [credentials, setCredentials] = useState({
    usernameOrEmail: '',
    password: ''
  });

  const [errors, setErrors] = useState<LoginErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password states
  const [isForgotPassView, setIsForgotPassView] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

  const handleTabSwitch = (tab: 'login' | 'signup') => {
    setActiveTab(tab);
    navigate(`/${tab}`);
  };

  const validateLogin = (): boolean => {
    const newErrors: LoginErrors = {};

    const inputVal = credentials.usernameOrEmail.trim();
    const password = credentials.password;

    if (!inputVal) {
      newErrors.usernameOrEmail = 'Please enter your email, phone number, or username.';
    } else if (inputVal.includes('@')) {
      // Validate Email Format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputVal)) {
        newErrors.usernameOrEmail = 'Please enter a valid email address, such as name@example.com.';
      }
    } else if (/^[\d+\s()-]+$/.test(inputVal)) {
      // Validate Phone Format (Accepts 09..., 639..., +639...)
      const cleaned = inputVal.replace(/[\s()-]/g, '');
      if (!/^(\+639\d{9}|639\d{9}|09\d{9})$/.test(cleaned)) {
        newErrors.usernameOrEmail = 'Please enter a valid Philippine mobile number (e.g., 09123456789).';
      }
    } else if (inputVal.length < 3) {
      newErrors.usernameOrEmail = 'Your username must contain at least 3 characters.';
    }

    if (!password) {
      newErrors.password = 'Please enter your password.';
    } else if (!password.trim()) {
      newErrors.password = 'Your password cannot contain only spaces.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };



const onLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!validateLogin()) return;

  setIsLoading(true);
  setErrors({});

  try {
    const res = await handleLogin(credentials);

    if (!res.success) {
      setErrors({
        general: res.message || 'Invalid login credentials.',
      });
      return;
    }

    navigate(
      from?.pathname
        ? {
            pathname: from.pathname,
            search: from.search || '',
            hash: from.hash || '',
          }
        : '/',
      { replace: true }
    );


  } catch (error) {
    console.error('Login submission error:', error);

    setErrors({
      general: 'Something went wrong. Please try again.',
    });

  } finally {
    setIsLoading(false);
  }
};



  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();

    setResetMessage('');
    setResetError('');

    if (!resetEmail.trim()) {
      setResetError('Please enter your email address.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail.trim())) {
      setResetError('Please enter a valid email address.');
      return;
    }

    setResetMessage(
      `Demo mode: A password reset link would be sent to ${resetEmail.trim()}.`
    );
  };

  const inputClass = (hasError: boolean) =>
    `w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all
    ${
      hasError
        ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
        : 'border-slate-200 focus:border-[#123A8C] focus:ring-2 focus:ring-blue-100'
    }`;

  return (
    <AuthLayout activeTab={activeTab} onTabChange={handleTabSwitch}>
      <div className="w-full">

        {/* HEADER */}
        <div className="mb-7">
          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="h-1 w-7 rounded-full bg-[#D7192D]" />

            <span className="text-[10px] font-bold tracking-[3px] text-[#123A8C]">
              ACCOUNT
            </span>

            <span className="h-1 w-7 rounded-full bg-[#D7192D]" />
          </div>

          <h2 className="text-center text-3xl font-extrabold text-[#123A8C]">
            {isForgotPassView ? 'Reset Password' : 'Welcome Back'}
          </h2>

          <p className="mt-2 text-center text-sm text-slate-500">
            {isForgotPassView
              ? 'Enter your email to get password reset instructions.'
              : 'Sign in to continue your sneaker journey.'}
          </p>
        </div>

        {/* LOGIN / SIGNUP TABS */}
        {!isForgotPassView && (
          <div className="mb-7 flex justify-center">
            <div className="flex h-[46px] w-full rounded-xl bg-[#E2E8F0] p-1">

              <button
                type="button"
                onClick={() => handleTabSwitch('login')}
                className={`flex h-full w-1/2 items-center justify-center rounded-lg text-xs font-semibold transition-all duration-200 ${
                  activeTab === 'login'
                    ? 'bg-white text-[#123A8C] shadow-sm'
                    : 'bg-transparent text-slate-500'
                }`}
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => handleTabSwitch('signup')}
                className={`flex h-full w-1/2 items-center justify-center rounded-lg text-xs font-semibold transition-all duration-200 ${
                  activeTab === 'signup'
                    ? 'bg-white text-[#123A8C] shadow-sm'
                    : 'bg-transparent text-slate-500'
                }`}
              >
                Sign Up
              </button>

            </div>
          </div>
        )}

        {/* FORGOT PASSWORD */}
        {isForgotPassView ? (
          <form
            onSubmit={handleForgotPassword}
            className="space-y-5"
            noValidate
          >
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => {
                    setResetEmail(e.target.value);
                    setResetError('');
                    setResetMessage('');
                  }}
                  placeholder="name@example.com"
                  className={inputClass(!!resetError)}
                />
              </div>

              {resetError && (
                <p className="mt-2 flex items-start gap-1.5 text-xs text-red-600">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  {resetError}
                </p>
              )}
            </div>

            {resetMessage && (
              <div className="flex gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-xs text-green-700">
                <CheckCircle2 size={17} className="shrink-0" />
                <p>{resetMessage}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-[#123A8C] py-3.5 text-sm font-bold text-white transition hover:bg-blue-900"
            >
              Send Reset Link
            </button>

            <button
              type="button"
              onClick={() => {
                setIsForgotPassView(false);
                setResetMessage('');
                setResetError('');
              }}
              className="block w-full text-center text-xs font-semibold text-slate-500 hover:text-[#123A8C]"
            >
              ← Back to Login
            </button>
          </form>
        ) : (

          /* LOGIN FORM */
          <form
            onSubmit={onLoginSubmit}
            className="space-y-5"
            noValidate
          >
            {/* USERNAME / EMAIL / PHONE */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">
                Email or Phone Number
              </label>

              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  autoComplete="username"
                  value={credentials.usernameOrEmail}
                  onChange={(e) => {
                    setCredentials({
                      ...credentials,
                      usernameOrEmail: e.target.value
                    });

                    setErrors((prev) => ({
                      ...prev,
                      usernameOrEmail: undefined,
                      general: undefined
                    }));
                  }}
                  placeholder="Enter email or phone number"
                  className={inputClass(!!errors.usernameOrEmail)}
                />
              </div>

              {errors.usernameOrEmail && (
                <p className="mt-2 flex items-start gap-1.5 text-xs text-red-600">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  {errors.usernameOrEmail}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
                  Password
                </label>
              </div>

              <div className="relative">
                <Lock
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={credentials.password}
                  onChange={(e) => {
                    setCredentials({
                      ...credentials,
                      password: e.target.value
                    });

                    setErrors((prev) => ({
                      ...prev,
                      password: undefined,
                      general: undefined
                    }));
                  }}
                  placeholder="Enter your password"
                  className={`${inputClass(!!errors.password)} pr-12`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#123A8C]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {errors.password && (
                <p className="mt-2 flex items-start gap-1.5 text-xs text-red-600">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* GENERAL LOGIN ERROR */}
            {errors.general && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle size={17} className="mt-0.5 shrink-0" />

                <div>
                  <p className="font-bold">Unable to sign in</p>
                  <p className="mt-1 leading-5">{errors.general}</p>
                </div>
              </div>
            )}

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#123A8C] py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-900/10 transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                'Login to Your Account'
              )}
            </button>

            {/* FORGOT PASSWORD */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassView(true);
                  setErrors({});
                }}
                className="text-xs font-semibold text-[#123A8C] transition hover:text-[#D7192D] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 2FA LOGIN OTP MODAL */}
      {/* <OTPModal
        isOpen={showOTP}
        phone={otpPhone}
        purpose="login"
        hash={otpHash}
        createdAt={otpCreatedAt}
        onClose={() => {
          cancelPendingLogin();
          setShowOTP(false);
        }}
        onSuccess={async () => {
          const result = await completeLogin();
          setShowOTP(false);

          if (result.success) {
            navigate('/');
          } else {
            setErrors({ general: result.message });
          }
        }}
      /> */}
    </AuthLayout>
  );
};