'use client';
import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui';

interface AuthGuardProps {
  children: ReactNode;
  clientId?: string;
}

/**
 * AuthGuard component that protects routes from unauthenticated access.
 *
 * This component works in conjunction with the middleware:
 * - Middleware handles server-side redirects for unauthenticated requests
 * - AuthGuard handles client-side loading states and session validation
 *
 * The layout.tsx provides Sidebar, so AuthGuard only handles auth state.
 */
export default function AuthGuard({ children, clientId }: AuthGuardProps) {
  const { session, isLoading, redirectToLogin } = useAuth();

  // Show loading spinner while checking session
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // If no session, redirect to login
  // Note: Middleware should catch this first, but this is a fallback
  if (!session) {
    redirectToLogin();
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Validate clientId matches session if provided
  if (clientId && session.clientId !== clientId && session.clientSlug !== clientId) {
    // Redirect to correct client URL
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const correctedPath = currentPath.replace(
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
