# Security Notes - Pre-Production Checklist

> **CRITICAL**: This document lists security issues in the current mock implementation that MUST be resolved before production deployment.

---

## 1. Unsigned Session Cookie (HIGH RISK)

**Current State:**
- `api/auth/login` writes the full session as plain JSON into `notsoai-session` cookie
- No signature, encryption, or HMAC validation
- Middleware and API routes trust whatever is in the cookie

**Risk:**
A user can forge a cookie to impersonate any client/role and bypass tenant isolation.

**Files Affected:**
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/session/route.ts`
- `src/middleware.ts`

**Fix Required:**
```typescript
// Option 1: Use signed cookies with a secret
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.SESSION_SECRET);

// Sign session
const token = await new SignJWT(session)
  .setProtectedHeader({ alg: 'HS256' })
  .setExpirationTime('7d')
  .sign(secret);

// Verify session
const { payload } = await jwtVerify(token, secret);

// Option 2: Use Supabase Auth (recommended)
// Supabase handles session tokens automatically with proper signing
```

**Environment Variable Needed:**
```env
SESSION_SECRET=your-256-bit-secret-key-here
```

---

## 2. Plaintext Credentials (HIGH RISK)

**Current State:**
- Passwords stored in plain text in `public/data/clients.json`
- `loadClients()` reads JSON and compares passwords directly
- No hashing, no rate limiting, no brute force protection

**Risk:**
- Anyone with access to JSON files can see all passwords
- No protection against brute force attacks
- Passwords exposed in version control

**Files Affected:**
- `public/data/clients.json`
- `src/app/api/auth/login/route.ts`
- `src/lib/dataLoader.server.ts`

**Fix Required:**
```typescript
// Use Supabase Auth instead of custom auth
// Supabase handles:
// - Password hashing (bcrypt)
// - Rate limiting
// - Brute force protection
// - Secure session tokens

const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});
```

---

## 3. Tenant Isolation via Unsigned Cookie (HIGH RISK)

**Current State:**
- Middleware relies solely on `clientId/clientSlug` from the unsigned cookie
- No server-side validation that user belongs to the tenant
- Combined with unsigned cookie = full cross-tenant access

**Risk:**
User can access any tenant's data by modifying the cookie.

**Files Affected:**
- `src/middleware.ts`
- All API routes that use `clientId` from session

**Fix Required:**
1. Sign/encrypt cookies (see #1)
2. Validate user-tenant relationship on every request:
```typescript
// In middleware or API routes
const { data: membership } = await supabase
  .from('team_members')
  .select('client_id, role')
  .eq('user_id', session.userId)
  .eq('client_id', requestedClientId)
  .single();

if (!membership) {
  return NextResponse.redirect('/unauthorized');
}
```

---

## 4. Missing Security Headers

**Current State:**
- No CSP (Content Security Policy)
- No rate limiting on API routes
- No CSRF protection

**Fix Required:**
Add to `next.config.js`:
```javascript
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Content-Security-Policy', value: "default-src 'self'; ..." },
];
```

Add rate limiting middleware (e.g., `@upstash/ratelimit`).

---

## 5. API Routes Without Auth Validation

**Current State:**
- Some API routes may not validate session before returning data
- Rely on middleware, but direct API calls could bypass

**Fix Required:**
Every API route should validate session:
```typescript
export async function GET(request: NextRequest) {
  const session = await getValidatedSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Validate tenant access
  if (session.clientId !== requestedClientId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // ... rest of handler
}
```

---

## Pre-Production Checklist

- [ ] Replace plaintext cookies with signed JWT or Supabase sessions
- [ ] Migrate auth to Supabase Auth
- [ ] Remove plaintext passwords from JSON files
- [ ] Add user-tenant relationship validation
- [ ] Add rate limiting to auth endpoints
- [ ] Add security headers
- [ ] Add CSRF protection for mutations
- [ ] Audit all API routes for auth validation
- [ ] Remove `public/data/clients.json` login credentials
- [ ] Set up proper environment variables for secrets
- [ ] Enable Supabase RLS policies

---

## Acceptable for Mock Phase

The following is **acceptable only during development with mock data**:
- Plaintext passwords in JSON (demo accounts only)
- Unsigned session cookies (localhost only)
- No rate limiting (development only)

**These MUST be fixed before any production deployment or when real user data is involved.**
