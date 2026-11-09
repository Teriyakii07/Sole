
import React, { useEffect, useRef, useState } from 'react';

import {
  ShieldCheck,
  LockKeyhole,
  AlertCircle,
  X,
  Loader2,
  CheckCircle2
} from 'lucide-react';

import { verifyPhilSMSOTP } from '../../../controllers/otpController';

// Replace line 15 with:
import type { OTPPayload } from '../../types/AuthTypes';

interface OTPModalProps {
  isOpen: boolean;
  phone: string;
  purpose: 'REGISTRATION' | '2FA_LOGIN';
  hash: string;
  createdAt: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const OTPModal: React.FC<OTPModalProps> = ({
  isOpen,
  phone,
  purpose,
  hash,
  createdAt,
  onClose,
  onSuccess
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const title =
    purpose === 'REGISTRATION'
      ? 'Verify Your Account'
      : 'Two-Step Verification';

  const description =
    purpose === 'REGISTRATION'
      ? 'Enter the verification code to complete your registration.'
      : 'Enter the security code to continue signing in.';

  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', '']);
      setError('');
      setIsLoading(false);

      inputRefs.current[0]?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    setError('');

    const digits = [...otp];

    if (value.length > 1) {
      const pastedDigits = value.replace(/\D/g, '').slice(0, 6);

      for (let i = 0; i < 6; i++) {
        digits[i] = pastedDigits[i] || '';
      }

      setOtp(digits);

      const nextIndex = Math.min(pastedDigits.length, 5);

      inputRefs.current[nextIndex]?.focus();

      return;
    }

    digits[index] = value;

    setOtp(digits);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const digits = [...otp];

        digits[index] = '';

        setOtp(digits);
        setError('');
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();

    const pastedDigits = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);

    if (!pastedDigits) return;

    const digits = Array.from(
      { length: 6 },
      (_, index) => pastedDigits[index] || ''
    );

    setOtp(digits);
    setError('');

    inputRefs.current[
      Math.min(pastedDigits.length, 5)
    ]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');

    const code = otp.join('');

    if (code.length !== 6) {
      setError(
        'Please enter all 6 digits of your verification code.'
      );

      const firstEmpty = otp.findIndex((digit) => !digit);

      inputRefs.current[
        firstEmpty === -1 ? 0 : firstEmpty
      ]?.focus();

      return;
    }

    if (!hash || !createdAt) {
      setError(
        'Verification session is missing. Please request a new OTP.'
      );

      return;
    }

    setIsLoading(true);

    try {
      const payload: OTPPayload = {
        phone,
        code,
        purpose,
        hash,
        createdAt
      };

      const res = await verifyPhilSMSOTP(payload);

      if (res.success) {
        onSuccess();
      } else {
        setError(
          res.message ||
          'The verification code is incorrect. Please try again.'
        );

        setOtp(['', '', '', '', '', '']);

        inputRefs.current[0]?.focus();
      }

    } catch (error) {
      console.error('OTP Verification Error:', error);

      setError(
        'Unable to verify your code right now. Please check your connection and try again.'
      );

    } finally {
      setIsLoading(false);
    }
  };

  const maskedPhone =
    phone.length > 4
      ? `${phone.slice(0, 4)}${'*'.repeat(
          Math.max(0, phone.length - 6)
        )}${phone.slice(-2)}`
      : phone;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071936]/70 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (
          e.target === e.currentTarget &&
          !isLoading
        ) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="otp-title"
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200"
      >
        {/* Top accent */}
        <div className="h-1.5 w-full bg-[#D7192D]" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          aria-label="Close verification"
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[#123A8C] disabled:opacity-50"
        >
          <X size={20} />
        </button>

        <div className="p-6 sm:p-8">

          {/* Icon */}
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#123A8C]">
            <ShieldCheck size={34} strokeWidth={1.8} />
          </div>

          {/* Heading */}
          <div className="text-center">
            <div className="mb-2 flex items-center justify-center gap-2">
              <span className="h-1 w-5 rounded-full bg-[#D7192D]" />

              <span className="text-[10px] font-bold tracking-[3px] text-[#123A8C]">
                SOLE SECURITY
              </span>

              <span className="h-1 w-5 rounded-full bg-[#D7192D]" />
            </div>

            <h2
              id="otp-title"
              className="text-2xl font-extrabold text-[#123A8C]"
            >
              {title}
            </h2>

            <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-500">
              {description}
            </p>
          </div>

          {/* Phone Information */}
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#123A8C] shadow-sm">
              <LockKeyhole size={19} />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Verification sent to
              </p>

              <p className="mt-0.5 text-sm font-bold text-[#123A8C]">
                {maskedPhone}
              </p>
            </div>

            <div className="ml-auto">
              <CheckCircle2 size={19} className="text-green-500" />
            </div>
          </div>

          {/* OTP FORM */}
          <form onSubmit={handleSubmit} className="mt-7">

            <label className="mb-3 block text-center text-xs font-bold uppercase tracking-wider text-slate-600">
              Enter your 6-digit code
            </label>

            {/* OTP INPUTS */}
            <div className="flex justify-center gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  id={`otp-input-${index}`}
                  type="text"
                  inputMode="numeric"
                  autoComplete={
                    index === 0 ? 'one-time-code' : 'off'
                  }
                  maxLength={6}
                  value={digit}
                  disabled={isLoading}
                  onChange={(e) =>
                    handleChange(e.target.value, index)
                  }
                  onKeyDown={(e) =>
                    handleKeyDown(e, index)
                  }
                  onPaste={handlePaste}
                  aria-label={`Verification digit ${index + 1}`}
                  className={`h-12 w-10 rounded-xl border text-center text-lg font-extrabold text-[#123A8C] outline-none transition-all sm:h-14 sm:w-12
                    ${
                      error
                        ? 'border-red-400 bg-red-50 focus:border-red-500'
                        : digit
                          ? 'border-[#123A8C] bg-blue-50'
                          : 'border-slate-200 bg-white focus:border-[#123A8C] focus:ring-2 focus:ring-blue-100'
                    }
                    disabled:opacity-60`}
                />
              ))}
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-left text-xs text-red-700">
                <AlertCircle
                  size={17}
                  className="mt-0.5 shrink-0"
                />

                <div>
                  <p className="font-bold">
                    Verification failed
                  </p>

                  <p className="mt-1 leading-5">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* VERIFY BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#123A8C] py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-900/10 transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Verifying Code...
                </>
              ) : (
                'Verify & Continue'
              )}
            </button>

          </form>

          {/* FOOTER */}
          <div className="mt-6 border-t border-slate-100 pt-5 text-center">
            <p className="text-xs leading-5 text-slate-400">
              Your verification code is private.
              <br />
              Never share it with anyone.
            </p>

            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="mt-4 text-xs font-bold text-[#123A8C] transition hover:text-[#D7192D] disabled:opacity-50"
            >
              Cancel Verification
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
