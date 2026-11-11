
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

type UserRole = 'admin' | 'customer';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let requestId = 0;

    const loadUser = async (currentUser: User | null) => {
      const currentRequest = ++requestId;

      if (!active) return;

      setLoading(true);
      setUser(currentUser);
      setRole(null);

      if (!currentUser) {
        setLoading(false);
        return;
      }

      console.log('Authenticated user ID:', currentUser.id);
      console.log('Authenticated email:', currentUser.email);

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', currentUser.id)
          .maybeSingle();

        if (!active || currentRequest !== requestId) return;

        if (error) {
          console.error('Unable to retrieve user role:', error);
          setRole(null);
          return;
        }

        console.log('Retrieved user role:', data?.role ?? 'No role found');

        if (data?.role === 'admin' || data?.role === 'customer') {
          setRole(data.role);
        } else {
          setRole(null);
        }
      } catch (error) {
        if (active && currentRequest === requestId) {
          console.error('Unexpected role retrieval error:', error);
          setRole(null);
        }
      } finally {
        if (active && currentRequest === requestId) {
          setLoading(false);
        }
      }
    };

    // Get the existing Supabase session.
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Unable to retrieve session:', error);
      }

      if (active) {
        void loadUser(data.session?.user ?? null);
      }
    });

    // Listen for login, logout, and session changes.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer the role query until after the auth callback.
      void Promise.resolve().then(() => {
        if (active) {
          void loadUser(session?.user ?? null);
        }
      });
    });

    return () => {
      active = false;
      requestId++;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}
