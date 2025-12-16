'use client';
import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui';

interface AuthGuardProps {
  children: ReactNode;
  clientId?: string;
}

/**
 * AuthGuard component - minimal client-side safety net for authenticated routes.
 *
 * Middleware (src/middleware.ts) owns all redirects:
 * - Unauthenticated users -> /login
 * - Superadmins without selected client -> /select-client
 *
 * AuthGuard handles:
 * - Loading states while auth context initializes
 * - Client-side navigation to wrong client (SPA navigation edge case)
 */
export default function AuthGuard({ children, clientId }: AuthGuardProps) {
  const { session, isLoading } = useAuth();

  // Gate on isLoading first - prevents hydration mismatch
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Middleware handles redirect, just show spinner until it happens
  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Minimal client-side mismatch check for SPA navigation
  // (e.g., user manually changes URL in browser without full page load)
  if (clientId && session.clientSlug !== clientId && session.clientId !== clientId) {
    if (typeof window !== 'undefined') {
      const correctedPath = window.location.pathname.replace(
        `/app/${clientId}`,
        `/app/${session.clientSlug}`
      );
      window.location.replace(correctedPath);
    }
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
