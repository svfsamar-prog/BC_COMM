'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { UserSession } from '@/types/commission';

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  login: (username: string, password: string, captchaEntered?: string, captchaExpected?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check server session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUser(data.user);
            localStorage.setItem('svf_auth_session', JSON.stringify(data.user));
          } else {
            setUser(null);
            localStorage.removeItem('svf_auth_session');
          }
        } else {
          // Fallback to local storage if API is momentarily unreachable
          const saved = localStorage.getItem('svf_auth_session');
          if (saved) {
            setUser(JSON.parse(saved));
          }
        }
      } catch (e) {
        console.warn('Session verification warning:', e);
      } finally {
        setIsLoading(false);
      }
    }
    checkSession();
  }, []);

  // Protected route guard
  useEffect(() => {
    if (!isLoading) {
      const isPublicRoute =
        pathname.startsWith('/verify') ||
        pathname === '/login' ||
        pathname === '/terms' ||
        pathname === '/privacy';

      if (!user && !isPublicRoute) {
        router.push('/login');
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = async (
    username: string,
    password: string,
    captchaEntered: string = '',
    captchaExpected: string = ''
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          captchaEntered,
          captchaExpected,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Authentication failed. Please verify your credentials.' };
      }

      setUser(data.user);
      localStorage.setItem('svf_auth_session', JSON.stringify(data.user));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during login' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Logout API error:', e);
    }
    setUser(null);
    localStorage.removeItem('svf_auth_session');
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
