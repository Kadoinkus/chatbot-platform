'use client';

import { ReactNode, use } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';
import BrandWrapper from '@/components/BrandWrapper';

interface ClientLayoutProps {
  children: ReactNode;
  params: Promise<{ clientId: string }>;
}

/**
 * Shared layout for all /app/[clientId]/* routes
 *
 * Provides:
 * - AuthGuard for authentication
 * - BrandWrapper for client-specific colors
 * - Sidebar navigation
 * - Consistent page structure
 */
export default function ClientLayout({ children, params }: ClientLayoutProps) {
  const { clientId } = use(params);

  return (
    <AuthGuard clientId={clientId}>
      <BrandWrapper clientId={clientId}>
        <div className="flex min-h-screen bg-background">
          <Sidebar clientId={clientId} />
          {children}
        </div>
      </BrandWrapper>
    </AuthGuard>
  );
}
