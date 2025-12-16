'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react';
import { getSession, signOut as authSignOut, type AuthResponse } from '@/lib/auth';
import type { AuthSession, Client } from '@/types';

interface AuthContextType {
  session: AuthSession | null;
  client: Omit<Client, 'login'> | null;
  accessibleClients: Omit<Client, 'login'>[] | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  redirectToLogin: () => void;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authData, setAuthData] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);

  // Single fetch function used for both initial load and refresh
  const fetchSession = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      const data = await getSession();
      if (isMountedRef.current) {
        setAuthData(data);
      }
    } catch (error) {
      console.error('Auth fetch failed:', error);
      if (isMountedRef.current) {
        setAuthData(null);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Fetch session on mount
  useEffect(() => {
    isMountedRef.current = true;
    fetchSession(false); // Don't show loading on initial (already true)

    return () => {
      isMountedRef.current = false;
    };
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

  // Memoize context value to prevent unnecessary re-renders of consumers
  const value = useMemo<AuthContextType>(() => ({
    session: authData?.session ?? null,
    client: authData?.client ?? null,
    accessibleClients: authData?.accessibleClients ?? null,
    isLoading,
    isAuthenticated: !!authData?.session,
    redirectToLogin,
    signOut: handleSignOut,
    refresh: () => fetchSession(true),
  }), [authData, isLoading, redirectToLogin, handleSignOut, fetchSession]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };
