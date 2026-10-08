'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface UserProfile {
  username: string;
  name: string;
  role: string;
  avatar?: string;
  lastLogin: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (username: string, password: string, captchaEntered: string, captchaExpected: string) => { success: boolean; error?: string };
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Load session from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('svf_auth_session');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.warn('Auth session restore error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Protected route guard
  useEffect(() => {
    if (!isLoading) {
      const isPublicRoute = pathname.startsWith('/verify') || pathname === '/login' || pathname === '/terms' || pathname === '/privacy';
      if (!user && !isPublicRoute) {
        router.push('/login');
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = (username: string, password: string, captchaEntered: string, captchaExpected: string) => {
    const cleanUser = username.trim().toUpperCase();
    const cleanPass = password.trim();
    const cleanCaptcha = captchaEntered.trim().toUpperCase();
    const targetCaptcha = captchaExpected.trim().toUpperCase();

    // 1. Verify Captcha
    if (cleanCaptcha !== targetCaptcha) {
      return { success: false, error: 'Invalid security code. Please try again.' };
    }

    // 2. Validate Credentials (SANJ00103S / admin / samar)
    const validUsers = ['SANJ00103S', 'ADMIN', 'SAMAR', 'SAMAR RAJ', 'SUPERVISOR'];
    const validPasswords = ['Sanjivani@2026', 'admin123', 'admin', 'password', 'svf2026'];

    const isValidUser = validUsers.includes(cleanUser) || cleanUser.startsWith('SANJ');
    const isValidPass = validPasswords.includes(cleanPass) || cleanPass === 'Sanjivani@2026';

    if (!isValidUser || !isValidPass) {
      return { success: false, error: 'Invalid username or password. Default password is Sanjivani@2026' };
    }

    const newUser: UserProfile = {
      username: cleanUser,
      name: cleanUser === 'SANJ00103S' || cleanUser.includes('SAMAR') ? 'SAMAR RAJ' : cleanUser,
      role: 'Administrator / State Head',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
      lastLogin: new Date().toISOString(),
    };

    setUser(newUser);
    try {
      localStorage.setItem('svf_auth_session', JSON.stringify(newUser));
    } catch (e) {}

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('svf_auth_session');
    } catch (e) {}
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
