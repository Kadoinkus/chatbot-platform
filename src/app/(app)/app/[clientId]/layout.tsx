'use client';

import { ReactNode } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';

interface ClientLayoutProps {
  children: ReactNode;
  params: { clientId: string };
}

/**
 * Shared layout for all /app/[clientId]/* routes
 *
 * Provides:
 * - AuthGuard for authentication
 * - Sidebar navigation
 * - Consistent page structure
 */
export default function ClientLayout({ children, params }: ClientLayoutProps) {
  return (
    <AuthGuard clientId={params.clientId}>
      <div className="flex min-h-screen bg-background">
        <Sidebar clientId={params.clientId} />
        {children}
      </div>
    </AuthGuard>
  );
}
