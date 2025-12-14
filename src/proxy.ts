/**
 * @fileoverview Next.js Proxy (formerly Middleware) for Route Protection
 *
 * ⚠️  SECURITY WARNING - MOCK IMPLEMENTATION ONLY ⚠️
 *
 * This middleware has known security issues that MUST be fixed before production:
 *
 * 1. UNSIGNED COOKIE: Session is parsed from plain JSON cookie with no verification.
 *    Users can forge cookies to access any tenant's data.
 *    FIX: Verify signed JWT or Supabase session token.
 *
 * 2. NO TENANT VALIDATION: Only checks if clientId in URL matches cookie.
 *    No server-side verification that user belongs to the tenant.
 *    FIX: Validate user-tenant relationship against database.
 *
 * See: docs/SECURITY_NOTES.md for full details.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth.server';

// TODO: Replace with JWT verification before production
// TODO: Add server-side tenant membership validation

// Routes that require authentication
const PROTECTED_ROUTES = ['/app', '/profile'];

// Routes that should redirect to app if already authenticated
const AUTH_ROUTES = ['/login'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session from cookie using centralized auth
  const sessionResult = getSessionFromRequest(request);
  const session = sessionResult.isValid ? sessionResult : null;

  // Check if this is a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));

  // If accessing protected route without session, redirect to login
  if (isProtectedRoute && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing auth routes with valid session, redirect to app
  if (isAuthRoute && session) {
    const appUrl = new URL(`/app/${session.clientSlug}/home`, request.url);
    return NextResponse.redirect(appUrl);
  }

  // For protected routes, validate that the clientId in the URL matches the session
  if (isProtectedRoute && session && pathname.startsWith('/app/')) {
    // Extract clientId from path: /app/[clientId]/...
    const pathParts = pathname.split('/');
    const urlClientId = pathParts[2]; // /app/[clientId]/...

    // If URL uses a different tenant or uses the UUID while we have a slug, redirect to canonical slug
    const isWrongTenant =
      urlClientId &&
      urlClientId !== session.clientId &&
      urlClientId !== session.clientSlug;

    const isUuidWhenSlugAvailable =
      urlClientId &&
      session.clientSlug &&
      urlClientId === session.clientId &&
      session.clientSlug !== session.clientId;

    if (isWrongTenant || isUuidWhenSlugAvailable) {
      // User is trying to access a different client or using UUID; redirect to slug
      const correctUrl = new URL(
        pathname.replace(`/app/${urlClientId}`, `/app/${session.clientSlug}`),
        request.url
      );
      return NextResponse.redirect(correctUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all protected routes
    '/app/:path*',
    '/profile/:path*',
    // Match auth routes
    '/login',
  ],
};

// Ensure Next.js picks up the proxy as the default entry
export default proxy;
