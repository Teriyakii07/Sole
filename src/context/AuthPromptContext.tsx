
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

import { useNavigate, useLocation } from 'react-router-dom';
import { X, LockKeyhole, ShoppingBag } from 'lucide-react';
import { useAuth } from './AuthContext';

interface AuthPromptContextType {
  requireLogin: () => boolean;
}

const AuthPromptContext = createContext<
  AuthPromptContextType | undefined
>(undefined);

export function useAuthPrompt() {
  const context = useContext(AuthPromptContext);

  if (!context) {
    throw new Error(
      'useAuthPrompt must be used inside AuthPromptProvider'
    );
  }

  return context;
}

export function AuthPromptProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);

  const requireLogin = () => {
    if (loading) return false;
    if (user) return true;

    setShowModal(true);
    return false;
  };

  const goToLogin = () => {
    setShowModal(false);
    navigate('/login', {
      state: { from: location },
    });
  };

  const goToSignup = () => {
    setShowModal(false);
    navigate('/signup', {
      state: { from: location },
    });
  };

  const continueBrowsing = () => {
    setShowModal(false);
    navigate('/');
  };

  return (
    <AuthPromptContext.Provider value={{ requireLogin }}>
      {children}

      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* Close Button */}
            <button
              type="button"
              aria-label="Close modal"
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#D7192D] text-white transition hover:bg-white hover:text-[#D7192D]"
            >
              <X size={20} />
            </button>

            {/* Blue Header */}
            <div className="bg-[#123A8C] px-6 pb-8 pt-8 text-center text-white">
              <h2 className="text-2xl font-black tracking-wide">
                SOLE<span className="text-[#D7192D]">.</span>
              </h2>

              <div className="mx-auto mt-6 flex h-16 w-16 items-center justify-center rounded-full bg-white">
                <ShoppingBag
                  size={30}
                  className="text-[#123A8C]"
                />
              </div>

              <div className="mx-auto mt-4 h-1 w-10 rounded-full bg-[#D7192D]" />

              <h3 className="mt-4 text-2xl font-black">
                Make every step count.
              </h3>

              <p className="mt-2 text-sm text-blue-100">
                Your next favorite pair is waiting.
              </p>
            </div>

            {/* White Content */}
            <div className="px-7 py-7">
              <div className="mb-6 text-center">
                <h3
                  id="auth-modal-title"
                  className="text-2xl font-black text-[#123A8C]"
                >
                  Welcome to SOLE<span className="text-[#D7192D]">.</span>
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  Log in or create an account to enjoy the complete
                  shopping experience, save your favorites, and
                  purchase your favorite shoes.
                </p>
              </div>

              {/* Login Button */}
              <button
                type="button"
                onClick={goToLogin}
                className="w-full rounded-lg bg-[#123A8C] px-5 py-3.5 font-bold tracking-wide text-white transition hover:bg-[#D7192D]"
              >
                LOG IN
              </button>

              {/* Signup Button */}
              <button
                type="button"
                onClick={goToSignup}
                className="mt-3 w-full rounded-lg border-2 border-[#D7192D] px-5 py-3.5 font-bold tracking-wide text-[#123A8C] transition hover:bg-[#D7192D] hover:text-white"
              >
                CREATE AN ACCOUNT
              </button>

              {/* Continue Browsing */}
              <button
                type="button"
                onClick={continueBrowsing}
                className="mt-6 w-full text-center text-sm font-semibold text-[#D7192D] transition hover:text-[#123A8C]"
              >
                Continue browsing instead
              </button>

              <div className="mt-5 flex items-center justify-center gap-2">
                <LockKeyhole
                  size={13}
                  className="text-[#123A8C]"
                />
                <p className="text-xs text-gray-400">
                  Your shopping experience starts here.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthPromptContext.Provider>
  );
}
