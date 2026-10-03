'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Profile, UserRole } from '@fertilizer/shared';
import { apiRequest } from './api-client';

export interface UserSession {
  id: string;
  email: string;
}

interface AuthContextType {
  user: UserSession | null;
  profile: Profile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Load session from localStorage on startup
  const initAuth = useCallback(async () => {
    try {
      const savedToken = localStorage.getItem('fertilizer_token');
      const savedUser = localStorage.getItem('fertilizer_user');
      const savedProfile = localStorage.getItem('fertilizer_profile');

      if (savedToken && savedUser && savedProfile) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setProfile(JSON.parse(savedProfile));

        // Optionally verify token in background
        try {
          const res = await apiRequest('/auth/me', {
            headers: { Authorization: `Bearer ${savedToken}` },
          });
          if (res?.data) {
            setProfile(res.data);
            localStorage.setItem('fertilizer_profile', JSON.stringify(res.data));
          }
        } catch {
          // Token expired or invalid
          console.warn('Session expired, logging out');
          logout();
        }
      }
    } catch (e) {
      console.error('Auth initialization error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Route protection
  useEffect(() => {
    if (isLoading) return;

    const publicRoutes = ['/login', '/register'];
    const isPublic = publicRoutes.some((route) => pathname?.startsWith(route));

    if (!user && !isPublic) {
      router.push('/login');
    } else if (user && isPublic) {
      router.push('/dashboard');
    }
  }, [user, isLoading, pathname, router]);

  const login = async (email: string, password: string) => {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res?.data) {
      const { user: userData, profile: profileData, accessToken, refreshToken } = res.data;

      setUser(userData);
      setProfile(profileData);
      setToken(accessToken);

      localStorage.setItem('fertilizer_token', accessToken);
      localStorage.setItem('fertilizer_refresh_token', refreshToken);
      localStorage.setItem('fertilizer_user', JSON.stringify(userData));
      localStorage.setItem('fertilizer_profile', JSON.stringify(profileData));

      router.push('/dashboard');
    }
  };

  const register = async (data: any) => {
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (res?.data) {
      const { user: userData, profile: profileData, accessToken, refreshToken } = res.data;

      if (accessToken) {
        setUser(userData);
        setProfile(profileData);
        setToken(accessToken);

        localStorage.setItem('fertilizer_token', accessToken);
        localStorage.setItem('fertilizer_refresh_token', refreshToken);
        localStorage.setItem('fertilizer_user', JSON.stringify(userData));
        localStorage.setItem('fertilizer_profile', JSON.stringify(profileData));

        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    setToken(null);
    localStorage.removeItem('fertilizer_token');
    localStorage.removeItem('fertilizer_refresh_token');
    localStorage.removeItem('fertilizer_user');
    localStorage.removeItem('fertilizer_profile');
    router.push('/login');
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await apiRequest('/auth/me');
      if (res?.data) {
        setProfile(res.data);
        localStorage.setItem('fertilizer_profile', JSON.stringify(res.data));
      }
    } catch (e) {
      console.error('Failed to refresh profile:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
