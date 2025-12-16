'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import type { AuthSession, Client } from '@/types';

interface UseAuthReturn {
  session: AuthSession | null;
  client: Omit<Client, 'login'> | null;
  accessibleClients: Omit<Client, 'login'>[] | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  redirectToLogin: () => void;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Hook to access authentication state.
 *
 * Now consumes shared state from AuthContext instead of fetching independently.
 * This ensures all components see the same auth state and prevents multiple API calls.
 */
export function useAuth(): UseAuthReturn {
  return useAuthContext();
}
