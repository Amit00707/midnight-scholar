'use client';

/**
 * Auth Context — Global Authentication State
 * =============================================
 * Wraps the entire app. Provides login/signup/logout functions
 * and exposes the current user to all pages.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setTokens, clearTokens, getToken, type AuthResponse } from '@/lib/api/client';

interface User {
  id: number;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore user from localStorage on mount
  useEffect(() => {
    const token = getToken();
    const storedUser = localStorage.getItem('ms_user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        clearTokens();
      }
    }
    setIsLoading(false);
  }, []);

  const handleAuthResponse = useCallback((data: AuthResponse) => {
    setTokens(data.access_token, data.refresh_token);
    // Also set cookie so Next.js middleware can read it
    document.cookie = `ms_access_token=${data.access_token}; path=/; max-age=${60 * 60 * 24 * 7}`;
    const userData: User = { id: data.user_id, name: data.name, role: data.role };
    localStorage.setItem('ms_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const data = await api.login(email, password);
      handleAuthResponse(data);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  }, [handleAuthResponse]);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    try {
      const data = await api.signup(name, email, password);
      handleAuthResponse(data);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Signup failed' };
    }
  }, [handleAuthResponse]);

  const logout = useCallback(() => {
    clearTokens();
    document.cookie = 'ms_access_token=; path=/; max-age=0';
    setUser(null);
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
