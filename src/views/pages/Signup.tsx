import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleSignUp } from '../../controllers/authController';
import { AuthLayout } from '../components/Auth/AuthLayout';
// import { OTPModal } from '../components/Auth/OTPModal';

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
  const [formError, setFormError] = useState('');
  // const [showOTP, setShowOTP] = useState(false);

  const handleTabSwitch = (tab: 'login' | 'signup') => {
    setActiveTab(tab);
    navigate(`/${tab}`);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setFormError('');
    setIsLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        setFormError('Passwords do not match.');
        return;
      }

      if (formData.password.length < 8) {
        setFormError('Password must contain at least 8 characters.');
        return;
      }

      const res = await handleSignUp(formData);
      {/* ibalik lang ni mag api na */}
      // if (res.success && res.requiresOTP) {
      //   setShowOTP(true);
      // } else {
      //   setFormError(res.message);
      // }

          if (res.success) {
            alert('Account created successfully! Please log in.');
            navigate('/login');
          } else {
            setFormError(res.message);
          }

    } catch (error) {
      setFormError('Unable to create your account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  return (
    <AuthLayout activeTab={activeTab} onTabChange={handleTabSwitch}>
      <h2 className="text-3xl font-extrabold text-[#2B41A7] text-center mb-2">Create Account</h2>

      {/* Tab Switcher positioned directly below header */}
      <div className="flex justify-center mb-4">
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

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase">First Name</label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full p-2.5 border rounded-xl text-sm outline-none focus:border-[#2B41A7]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase">Last Name</label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full p-2.5 border rounded-xl text-sm outline-none focus:border-[#2B41A7]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase">Email Address</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full p-2.5 border rounded-xl text-sm outline-none focus:border-[#2B41A7]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase">Phone Number</label>
          <input
            type="tel"
            required
            placeholder="+639123456789"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full p-2.5 border rounded-xl text-sm outline-none focus:border-[#2B41A7]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase">Password</label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full p-2.5 border rounded-xl text-sm outline-none focus:border-[#2B41A7]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase">Confirm Password</label>
          <input
            type="password"
            required
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full p-2.5 border rounded-xl text-sm outline-none focus:border-[#2B41A7]"
          />
        </div>

        {formError && <p className="text-xs text-red-500 text-center">{formError}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-[#2B41A7] text-white font-bold rounded-xl mt-2 hover:bg-blue-900 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      {/* Registration Verification Modal */}
      {/* <OTPModal
        isOpen={showOTP}
        phone={formData.phone}
        purpose="REGISTRATION"
        onClose={() => setShowOTP(false)}
        onSuccess={async () => {
          setShowOTP(false);

          alert('Phone verification successful! Please log in.');

          navigate('/login');
        }}
      /> */}
    </AuthLayout>
  );
};