'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@/types';
import { AuthService, LoginPayload } from '@/services/auth.service';
import { useRouter } from 'next/navigation';

// Mirrors the backend admin gate: requireRole([OWNER, SUPER_ADMIN, ADMIN])
const ADMIN_ROLES = ['OWNER', 'SUPER_ADMIN', 'ADMIN'];
// Mirrors the backend requireOwner gate: OWNER or SUPER_ADMIN
const OWNER_ROLES = ['OWNER', 'SUPER_ADMIN'];

/**
 * Reads the ?redirect= target set by the guarded layouts (/dashboard, /admin) and
 * rejects anything that is not a same-origin in-app path. Runs on the client at
 * click time, so it never touches useSearchParams (which would de-optimize every page).
 */
function resolveRedirectTarget(): string | null {
  if (typeof window === 'undefined') return null;

  const target = new URLSearchParams(window.location.search).get('redirect');
  if (!target) return null;
  // Must be a single-slash absolute path: reject '//evil.com', '/\evil.com', absolute URLs
  if (!target.startsWith('/') || target.startsWith('//') || target.includes('\\')) return null;
  if (target.includes(':')) return null;
  if (/[\x00-\x1f]/.test(target)) return null;

  return target;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  login: (credentials: LoginPayload) => Promise<void>;
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

  const isOwner = Boolean(user?.roles?.some((r) => OWNER_ROLES.includes(r)));

  const isAdmin = Boolean(user?.roles?.some((r) => ADMIN_ROLES.includes(r)));

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

      // Honour the ?redirect= target produced by the guarded layouts, otherwise fall back
      // to the landing page that matches the user's role.
      const redirectTarget = resolveRedirectTarget();
      if (redirectTarget) {
        router.push(redirectTarget);
        return;
      }

      const userIsAdmin = Boolean(loggedUser.roles?.some((r) => ADMIN_ROLES.includes(r)));
      router.push(userIsAdmin ? '/admin' : '/dashboard');
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
