
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  AlertCircle,
  Loader2
} from 'lucide-react';

import { handleSignUp } from '../../controllers/authController';
import { AuthLayout } from '../components/Auth/AuthLayout';
import { OTPModal } from '../components/Auth/OTPModal';

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('signup');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleTabSwitch = (tab: 'login' | 'signup') => {
    setActiveTab(tab);
    navigate(`/${tab}`);
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: '',
      general: ''
    }));
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    // First Name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Please enter your first name.';
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.firstName.trim())) {
      newErrors.firstName = 'First name contains invalid characters.';
    }

    // Last Name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Please enter your last name.';
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.lastName.trim())) {
      newErrors.lastName = 'Last name contains invalid characters.';
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Philippine Phone Number
    const phone = formData.phone.replace(/[\s-]/g, '');

    if (!phone) {
      newErrors.phone = 'Please enter your phone number.';
    } else if (!/^(\+639\d{9}|09\d{9})$/.test(phone)) {
      newErrors.phone = 'Enter a valid PH number (09XXXXXXXXX or +639XXXXXXXXX).';
    }

    // Password
    if (!formData.password) {
      newErrors.password = 'Please create a password.';
    } else if (!formData.password.trim()) {
      newErrors.password = 'Password cannot contain only spaces.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    // Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const res = await handleSignUp({
        ...formData,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.replace(/[\s-]/g, '')
      });

      if (!res.success) {
        setErrors({
          general: res.message || 'Unable to create your account.'
        });
        return;
      }

      // Open OTP modal
      if (res.requiresOTP) {
        setShowOTP(true);
      }

    } catch (error) {
      console.error('Signup error:', error);

      setErrors({
        general: 'Something went wrong. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };


  // Input styling
  const inputClass = (hasError: boolean) =>
    `w-full p-2.5 border rounded-xl text-sm outline-none transition-colors ${
      hasError
        ? 'border-red-500 focus:border-red-500'
        : 'border-slate-300 focus:border-[#123A8C]'
    }`;

  return (
    <AuthLayout activeTab={activeTab} onTabChange={handleTabSwitch}>

      {/* Heading */}
      <div className="text-center mb-6">

        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="w-7 h-1 bg-[#D7192D] rounded-full"></span>

          <span className="text-[10px] font-bold tracking-[0.3em] text-[#123A8C]">
            ACCOUNT
          </span>

          <span className="w-7 h-1 bg-[#D7192D] rounded-full"></span>
        </div>

        <h2 className="text-3xl font-extrabold text-[#123A8C]">
          Create Account
        </h2>

        <p className="text-sm text-slate-500 mt-2">
          Join SOLE. and find your perfect pair.
        </p>
      </div>

      {/* Login and Sign Up Tabs */}
      <div className="flex justify-center mb-7">
        <div className="w-full h-[46px] bg-[#E2E8F0] p-1 rounded-xl flex">

          <button
            type="button"
            onClick={() => handleTabSwitch('login')}
            className={`w-1/2 h-full flex items-center justify-center text-xs font-semibold rounded-lg transition-all duration-200 ${
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
            className={`w-1/2 h-full flex items-center justify-center text-xs font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'signup'
                ? 'bg-white text-[#123A8C] shadow-sm'
                : 'bg-transparent text-slate-500'
            }`}
          >
            Sign Up
          </button>

        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={onSubmit} className="space-y-3" noValidate>

        {/* First Name and Last Name */}
        <div className="grid grid-cols-2 gap-3">

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              First Name
            </label>

            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className={inputClass(!!errors.firstName)}
              placeholder="First name"
            />

            {errors.firstName && (
              <p className="text-xs text-red-500 mt-1">
                {errors.firstName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              Last Name
            </label>

            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className={inputClass(!!errors.lastName)}
              placeholder="Last name"
            />

            {errors.lastName && (
              <p className="text-xs text-red-500 mt-1">
                {errors.lastName}
              </p>
            )}
          </div>

        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
            Email Address
          </label>

          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={inputClass(!!errors.email)}
            placeholder="example@email.com"
          />

          {errors.email && (
            <p className="text-xs text-red-500 mt-1">
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
            Phone Number
          </label>

          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={inputClass(!!errors.phone)}
            placeholder="+639123456789"
          />

          {errors.phone && (
            <p className="text-xs text-red-500 mt-1">
              {errors.phone}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
            Password
          </label>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className={`${inputClass(!!errors.password)} pr-10`}
              placeholder="At least 8 characters"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#123A8C]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {errors.password && (
            <p className="text-xs text-red-500 mt-1">
              {errors.password}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
            Confirm Password
          </label>

          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className={`${inputClass(!!errors.confirmPassword)} pr-10`}
              placeholder="Re-enter your password"
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#123A8C]"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {errors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-xs">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errors.general}</span>
          </div>
        )}

        {/* Create Account Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-[#123A8C] text-white font-bold rounded-xl mt-2 hover:bg-blue-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </button>

      </form>

      {/* OTP Verification Modal */}
      <OTPModal
        isOpen={showOTP}
        phone={formData.phone.replace(/[\s-]/g, '')}
        purpose="REGISTRATION"
        onClose={() => setShowOTP(false)}
        onSuccess={async () => {
          setShowOTP(false);

          alert('Phone verification successful! Please log in.');

          navigate('/login');
        }}
      />

    </AuthLayout>
  );
};


