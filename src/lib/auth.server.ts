/**
 * Server-Side Authentication Utilities
 *
 * Single source of truth for session validation on the server.
 * All API routes and server components should use these functions.
 *
 * ⚠️  MIGRATION NOTE:
 * When switching to Supabase Auth, update the getSession() function
 * to verify Supabase JWT tokens instead of reading the plain cookie.
 */

import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { config } from './config';
import { logger } from './api-utils';
import type { AuthSession } from '@/types';

const SESSION_COOKIE_NAME = 'notsoai-session';

// ============================================
// Session Types
// ============================================

export interface ValidatedSession extends AuthSession {
  isValid: true;
}

export interface InvalidSession {
  isValid: false;
  reason: 'missing' | 'expired' | 'invalid' | 'unauthorized';
}

export type SessionResult = ValidatedSession | InvalidSession;

// ============================================
// Session Retrieval
// ============================================

/**
 * Get the current session from cookies (for API routes)
 *
 * TODO: Replace with Supabase Auth verification:
 * ```
 * const supabase = createServerClient(...)
 * const { data: { user }, error } = await supabase.auth.getUser()
 * ```
 */
export async function getSession(): Promise<SessionResult> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      return { isValid: false, reason: 'missing' };
    }

    // TODO: Replace JSON.parse with JWT verification
    // const { payload } = await jwtVerify(sessionCookie.value, secret);
    const session = JSON.parse(sessionCookie.value) as AuthSession;

    // Basic validation (allow superadmin without selected client)
    if (!session.userId) {
      return { isValid: false, reason: 'invalid' };
    }
    if (!session.isSuperadmin && !session.clientId) {
      return { isValid: false, reason: 'invalid' };
    }

    // TODO: Add expiry check
    // if (session.exp && session.exp < Date.now()) {
    //   return { isValid: false, reason: 'expired' };
    // }

    return {
      ...session,
      isValid: true,
    };
  } catch (error) {
    logger.error('Session parse error', error);
    return { isValid: false, reason: 'invalid' };
  }
}

/**
 * Get session from a NextRequest (for middleware)
 */
export function getSessionFromRequest(request: NextRequest): SessionResult {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      return { isValid: false, reason: 'missing' };
    }

    const session = JSON.parse(sessionCookie.value) as AuthSession;

    // Superadmins can have empty clientId/clientSlug before selecting a client
    if (!session.userId) {
      return { isValid: false, reason: 'invalid' };
    }

    // Non-superadmins must have a clientId
    if (!session.isSuperadmin && !session.clientId) {
      return { isValid: false, reason: 'invalid' };
    }

    return {
      ...session,
      isValid: true,
    };
  } catch {
    return { isValid: false, reason: 'invalid' };
  }
}

// ============================================
// Authorization Helpers
// ============================================

/**
 * Require a valid session - throws if not authenticated
 */
export async function requireSession(): Promise<ValidatedSession> {
  const session = await getSession();

  if (!session.isValid) {
    throw new Error('Unauthorized: No valid session');
  }

  return session;
}

/**
 * Require access to a specific client/tenant
 */
export async function requireTenantAccess(clientIdOrSlug: string): Promise<ValidatedSession> {
  const session = await requireSession();

  // Check if session clientId or slug matches the requested tenant
  if (session.clientId !== clientIdOrSlug && session.clientSlug !== clientIdOrSlug) {
    logger.audit('Tenant access denied', {
      userId: session.userId,
      sessionClientId: session.clientId,
      requestedClientId: clientIdOrSlug,
    });
    throw new Error('Forbidden: Access to this tenant is not allowed');
  }

  return session;
}

/**
 * Require access to a specific client (superadmin-aware)
 *
 * For superadmins: validates they have access via accessible_client_slugs
 * For regular users: validates their session client matches the requested client
 */
export async function requireClientAccess(routeClientSlug: string): Promise<ValidatedSession> {
  const session = await requireSession();

  if (session.isSuperadmin) {
    // Superadmins: must have the correct client selected in their session
    // The actual accessible_client_slugs validation happens during client selection
    if (session.clientSlug !== routeClientSlug) {
      logger.audit('Superadmin client access mismatch', {
        userId: session.userId,
        sessionClientSlug: session.clientSlug,
        requestedClientSlug: routeClientSlug,
      });
      throw new Error('Forbidden: Switch to this client first');
    }
    return session;
  }

  // Regular users: session client must match the route client
  if (session.clientSlug !== routeClientSlug && session.clientId !== routeClientSlug) {
    logger.audit('Client access denied', {
      userId: session.userId,
      sessionClientSlug: session.clientSlug,
      requestedClientSlug: routeClientSlug,
    });
    throw new Error('Forbidden: Access to this client is not allowed');
  }

  return session;
}

/**
 * Require a specific role or higher
 */
const roleHierarchy: Record<string, number> = {
  viewer: 1,
  member: 2,
  admin: 3,
  owner: 4,
  superadmin: 5,
};

export async function requireRole(
  minRole: 'viewer' | 'member' | 'admin' | 'owner'
): Promise<ValidatedSession> {
  const session = await requireSession();

  const sessionRoleLevel = roleHierarchy[session.role] || 0;
  const requiredRoleLevel = roleHierarchy[minRole];

  if (sessionRoleLevel < requiredRoleLevel) {
    logger.audit('Role access denied', {
      userId: session.userId,
      userRole: session.role,
      requiredRole: minRole,
    });
    throw new Error(`Forbidden: Requires ${minRole} role or higher`);
  }

  return session;
}

// ============================================
// Session Management
// ============================================

/**
 * Clear the session cookie
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Check if we're using mock auth (for conditional behavior)
 */
export function isUsingMockAuth(): boolean {
  return !config.supabase.isConfigured;
}

// ============================================
// Future Supabase Auth Integration
// ============================================

/**
 * Placeholder for Supabase Auth session retrieval
 *
 * TODO: Implement when wiring Supabase Auth:
 * ```
 * import { createServerClient } from '@supabase/ssr'
 *
 * export async function getSupabaseSession() {
 *   const cookieStore = await cookies()
 *   const supabase = createServerClient(
 *     config.supabase.url!,
 *     config.supabase.anonKey!,
 *     { cookies: { ... } }
 *   )
 *   return supabase.auth.getUser()
 * }
 * ```
 */
