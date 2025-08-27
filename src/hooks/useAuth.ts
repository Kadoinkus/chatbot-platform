'use client';
import { useState, useEffect } from 'react';
import { getSession, type Session } from '@/lib/auth';

export function useAuth() {
  const [session, setSession] = useState<Session>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentSession = getSession();
    setSession(currentSession);
    setIsLoading(false);
  }, []);

  const redirectToLogin = () => {
    if (typeof window !== 'undefined') {
      window.location.replace('/login');
    }
  };

  return {
    session,
    isLoading,
    isAuthenticated: !!session,
    redirectToLogin
  };
}