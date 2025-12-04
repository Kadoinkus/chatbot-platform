'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui';

/**
 * App Home Page
 *
 * This page redirects authenticated users to their client dashboard.
 * The middleware should handle most redirects, but this is a fallback
 * for client-side navigation.
 */
export default function AppHome() {
  const router = useRouter();
  const { session, isLoading, redirectToLogin } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!session) {
      redirectToLogin();
      return;
    }

    // Redirect to client dashboard
    router.push(`/app/${session.clientSlug}/home`);
  }, [session, isLoading, router, redirectToLogin]);

  return (
    <div className="flex-1 flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
