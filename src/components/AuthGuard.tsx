'use client';
import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/Sidebar';

interface AuthGuardProps {
  children: ReactNode;
  clientId?: string;
  showSidebar?: boolean;
}

export default function AuthGuard({ children, clientId, showSidebar = true }: AuthGuardProps) {
  const { session, isLoading, redirectToLogin } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        {showSidebar && <Sidebar clientId={clientId} />}
        <main className={`flex-1 ${showSidebar ? 'ml-16' : ''} flex items-center justify-center`}>
          <div className="text-gray-500">Loading...</div>
        </main>
      </div>
    );
  }

  if (!session) {
    redirectToLogin();
    return null;
  }

  return <>{children}</>;
}