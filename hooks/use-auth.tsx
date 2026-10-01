'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@/types';
import { AuthService, LoginPayload, RegisterPayload } from '@/services/auth.service';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  login: (credentials: LoginPayload) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  verifyPhone: (phone: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const res = await AuthService.getMe();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const isOwner = Boolean(
    user?.roles?.some((r) => r === 'OWNER' || r === 'SUPER_ADMIN')
  );

  const isAdmin = Boolean(
    isOwner ||
    user?.roles?.some((r) => r === 'ADMIN' || r === 'TEACHER') ||
    user?.permissions?.includes('admin:access')
  );

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      if (isOwner) return true;
      return Boolean(user.permissions?.includes(permission));
    },
    [user, isOwner]
  );

  const hasAnyPermission = useCallback(
    (permissions: string[]): boolean => {
      if (!user) return false;
      if (isOwner) return true;
      return permissions.some((p) => user.permissions?.includes(p));
    },
    [user, isOwner]
  );

  const login = async (credentials: LoginPayload) => {
    const res = await AuthService.login(credentials);
    if (res.success && res.data?.user) {
      const loggedUser = res.data.user;
      setUser(loggedUser);
      const userIsAdmin = Boolean(
        loggedUser.roles?.some((r) => r === 'OWNER' || r === 'SUPER_ADMIN' || r === 'ADMIN' || r === 'TEACHER') ||
        loggedUser.permissions?.includes('admin:access')
      );
      if (userIsAdmin) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  };

  const register = async (data: RegisterPayload) => {
    const res = await AuthService.register(data);
    if (res.success) {
      router.push(`/auth/verify-otp?phone=${encodeURIComponent(data.phoneNumber)}`);
    }
  };

  const verifyPhone = async (phone: string, otp: string) => {
    const res = await AuthService.verifyPhone(phone, otp);
    if (res.success) {
      router.push('/auth/login?verified=true');
    }
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
    router.push('/auth/login');
  };

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isAdmin,
        isOwner,
        hasPermission,
        hasAnyPermission,
        login,
        register,
        verifyPhone,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
