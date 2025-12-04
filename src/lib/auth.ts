import type { AuthSession, Client } from '@/types';

export type Session = AuthSession | null;

export interface AuthResponse {
  session: AuthSession | null;
  client: Omit<Client, 'login'> | null;
}

/**
 * Sign in with email and password
 * Uses the API route which sets an HTTP-only cookie
 */
export async function signIn(email: string, password: string): Promise<AuthResponse | null> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Sign in error:', error);
    return null;
  }
}

/**
 * Sign out - clears the session cookie
 */
export async function signOut(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Sign out error:', error);
  }
}

/**
 * Get current session from the server
 * Session is stored in an HTTP-only cookie, so we need to call the API
 */
export async function getSession(): Promise<AuthResponse | null> {
  try {
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'include', // Include cookies
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
}

/**
 * Check if the current user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const authData = await getSession();
  return authData?.session !== null;
}
