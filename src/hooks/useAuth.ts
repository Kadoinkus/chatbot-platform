'use client';
import { useState, useEffect, useCallback } from 'react';
import { getSession, signOut as authSignOut, type AuthResponse } from '@/lib/auth';
import type { AuthSession, Client } from '@/types';

interface UseAuthReturn {
  session: AuthSession | null;
  client: Omit<Client, 'login'> | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  redirectToLogin: () => void;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [authData, setAuthData] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    try {
      const data = await getSession();
      setAuthData(data);
    } catch (error) {
      console.error('Error fetching session:', error);
      setAuthData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const redirectToLogin = useCallback(() => {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      window.location.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    await authSignOut();
    setAuthData(null);
    if (typeof window !== 'undefined') {
      window.location.replace('/login');
    }
  }, []);

  return {
    session: authData?.session ?? null,
    client: authData?.client ?? null,
    isLoading,
    isAuthenticated: !!authData?.session,
    redirectToLogin,
    signOut: handleSignOut,
    refresh: fetchSession,
  };
}
