'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (emailOrUser: string | User, name?: string) => Promise<boolean>;
  register: (name: string, email: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  register: async () => false,
  logout: () => {},
});

const AUTH_STORAGE_KEY = 'locable_user_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initUserSession() {
      try {
        const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);

          // Auto-sync live approval status from WordPress backend
          if (parsed?.email) {
            try {
              const res = await fetch(`/api/user/status?email=${encodeURIComponent(parsed.email)}`, { cache: 'no-store' });
              if (res.ok) {
                const data = await res.json();
                if (data.accountStatus && data.accountStatus !== parsed.accountStatus) {
                  const updatedUser = { ...parsed, accountStatus: data.accountStatus };
                  setUser(updatedUser);
                  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
                }
              }
            } catch (err) {
              console.warn('[AuthContext] Error syncing status:', err);
            }
          }
        }
      } catch (e) {
        console.warn('Failed to load user session:', e);
      } finally {
        setLoading(false);
      }
    }

    initUserSession();
  }, []);

  const login = async (emailOrUser: string | User, name?: string): Promise<boolean> => {
    // If a full User object is passed (e.g. from /verify-email or /login API)
    if (typeof emailOrUser === 'object' && emailOrUser !== null && 'email' in emailOrUser) {
      const userObj = emailOrUser as User;
      setUser(userObj);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userObj));
      } catch (e) {}
      return true;
    }

    const emailStr = typeof emailOrUser === 'string' ? emailOrUser : '';
    if (!emailStr) return false;

    const cleanEmail = emailStr.toLowerCase().trim();
    const userName = name || cleanEmail.split('@')[0];

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userName, email: cleanEmail }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
          return true;
        }
      }
    } catch (e) {
      console.warn('[AuthContext] Sync on login error:', e);
    }

    const fallbackUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email: cleanEmail,
      name: userName,
      role: 'user',
      accountStatus: 'pending',
      createdAt: new Date().toISOString(),
    };

    setUser(fallbackUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(fallbackUser));
    return true;
  };

  const register = async (name: string, email: string): Promise<boolean> => {
    return login(email, name);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
