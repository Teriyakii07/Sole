import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  handleLogin,
  handleForgotPassword
} from '../../controllers/authController';

import { AuthLayout } from '../components/Auth/AuthLayout';
import { OTPModal } from '../components/Auth/OTPModal';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [credentials, setCredentials] = useState({ usernameOrEmail: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [otpPhone, setOtpPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassView, setIsForgotPassView] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const handleTabSwitch = (tab: 'login' | 'signup') => {
    setActiveTab(tab);
    navigate(`/${tab}`);
  };

  const onLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoginError('');
    setIsLoading(true);

    try {
      if (!credentials.usernameOrEmail || !credentials.password) {
        setLoginError('Please enter both email and password.');
        return;
      }

      const res = await handleLogin(credentials);
      if (res.success && res.requiresOTP) {
        setOtpPhone(res.phone || '');
        setShowOTP(true);
      } else {
        setLoginError(res.message);
      }


    } catch (error) {
      setLoginError('Unable to log in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setResetMessage('');

    const result = await handleForgotPassword(resetEmail);

    setResetMessage(result.message);
  };

  return (
    <AuthLayout activeTab={activeTab} onTabChange={handleTabSwitch}>
      <div className="w-full">
        <h2 className="text-3xl font-extrabold text-[#2B41A7] text-center mb-2">
          {isForgotPassView ? 'Reset Password' : 'Welcome Back'}
        </h2>

        {/* Tab Switcher positioned directly below header */}
        {!isForgotPassView && (
          <div className="flex justify-center mb-6">
            <div className="bg-slate-200 p-1 rounded-xl flex gap-1 w-full max-w-xs">
              <button
                type="button"
                onClick={() => handleTabSwitch('login')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'login' ? 'bg-white text-[#2B41A7] shadow-sm' : 'text-slate-500'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => handleTabSwitch('signup')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'signup' ? 'bg-white text-[#2B41A7] shadow-sm' : 'text-slate-500'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>
        )}

        {isForgotPassView ? (
          /* Forgot Password View */
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Enter your email address
              </label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full p-2.5 border rounded-xl text-sm outline-none focus:border-[#2B41A7]"
                required
              />
            </div>

            {resetMessage && (
              <p className={`text-xs text-center font-medium ${resetMessage.includes('sent') ? 'text-green-600' : 'text-red-500'}`}>
                {resetMessage}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#2B41A7] text-white font-bold rounded-xl hover:bg-blue-900 transition-colors"
            >
              Send Reset Link
            </button>

            <button
              type="button"
              onClick={() => {
                setIsForgotPassView(false);
                setResetMessage('');
              }}
              className="w-full text-xs text-slate-500 font-semibold text-center hover:underline mt-2 block"
            >
              Back to Login
            </button>
          </form>
        ) : (
          /* Main Login View */
            <form onSubmit={onLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="text"
                  value={credentials.usernameOrEmail}
                  onChange={(e) => setCredentials({ ...credentials, usernameOrEmail: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-sm outline-none focus:border-[#2B41A7]"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-sm outline-none focus:border-[#2B41A7]"
                  placeholder="••••••••"
                />
              </div>

              {loginError && <p className="text-xs text-red-500 text-center">{loginError}</p>}

              {/* Login Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#2B41A7] text-white font-bold rounded-xl hover:bg-blue-900 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>

              {/* Right-aligned Forgot Password link directly below the Login button */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setIsForgotPassView(true)}
                  className="text-xs font-semibold text-[#2B41A7] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
        )}
      </div>
      {/* ibalik lang ni mag api na */}
      {/* 2FA Login OTP Modal */}
        <OTPModal
          isOpen={showOTP}
          phone={otpPhone}
          purpose="2FA_LOGIN"
          onClose={() => setShowOTP(false)}
          onSuccess={() => {
            setShowOTP(false);
            navigate('/');
          }}
        />
    </AuthLayout>
  );
};