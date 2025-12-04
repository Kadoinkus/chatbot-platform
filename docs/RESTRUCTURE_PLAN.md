# Restructure Plan: Mock API Phase

> **Goal:** Establish clean architecture with mock data that mirrors future Supabase structure.
> **Constraint:** All changes must work with static JSON files before database connection.

---

## Phase 1: Types & Domain Naming

### 1.1 Centralize Types
- Create `src/types/index.ts` as single source of truth
- Move all types from `src/lib/dataService.ts` to `src/types/`
- Export canonical types: `Client`, `Workspace`, `Bot`, `User`, `Conversation`, `Message`, `Session`, `BotSession`, `Metrics`

### 1.2 Standardize Terminology
| Old Term | New Term | Notes |
|----------|----------|-------|
| Mascot | Bot | Remove `Bot as Mascot` alias in `data.ts` |
| mascot_id | bot_id | Update any JSON keys if present |
| `/bot/[botId]/mascot` | `/bot/[botId]/customize` | Route rename for clarity |

### 1.3 Session Type Expansion
```typescript
// src/types/index.ts
export type AuthSession = {
  clientId: string;
  clientSlug: string;
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  defaultWorkspaceId?: string;
};
```

---

## Phase 2: Mock API Layer

### 2.1 Create API Routes
Location: `src/app/api/`

**Auth:**
```
POST /api/auth/login     → validate credentials, return session
POST /api/auth/logout    → clear session
GET  /api/auth/session   → return current session (from cookie/header)
```

**Clients:**
```
GET  /api/clients              → list all clients (admin only in future)
GET  /api/clients/:slug        → get client by slug (resolves slug→clientId)
```

**Workspaces:**
```
GET  /api/workspaces?clientId=         → list workspaces for client
GET  /api/workspaces/:workspaceId      → get single workspace
```

**Bots:**
```
GET  /api/bots?clientId=               → all bots for client
GET  /api/bots?workspaceId=            → bots in workspace
GET  /api/bots/:botId                  → single bot details
```

**Analytics:**
```
GET  /api/analytics/sessions?clientId=&from=&to=    → session metrics
GET  /api/analytics/daily?clientId=&from=&to=       → daily aggregates
GET  /api/analytics/intents?clientId=               → intent breakdown
```

**Conversations:**
```
GET  /api/conversations?clientId=&status=&botId=    → filtered list
GET  /api/conversations/:conversationId             → single with messages
```

**Users:**
```
GET  /api/users?clientId=              → team members for client
GET  /api/users/:userId                → single user
```

**Counters (for dashboard):**
```
GET  /api/counters?clientId=           → { totalBots, totalConversations, totalUsers, ... }
```

### 2.2 API Client Library
Create `src/lib/api.ts`:
```typescript
// Typed fetch wrapper for all API calls
// All UI components consume data through this layer ONLY
// No direct imports from dataService in components

export const api = {
  auth: {
    login: (email: string, password: string) => POST('/api/auth/login', { email, password }),
    logout: () => POST('/api/auth/logout'),
    getSession: () => GET('/api/auth/session'),
  },
  clients: {
    getBySlug: (slug: string) => GET(`/api/clients/${slug}`),
  },
  workspaces: {
    list: (clientId: string) => GET(`/api/workspaces?clientId=${clientId}`),
    get: (id: string) => GET(`/api/workspaces/${id}`),
  },
  bots: {
    list: (params: { clientId?: string; workspaceId?: string }) => GET('/api/bots', params),
    get: (id: string) => GET(`/api/bots/${id}`),
  },
  // ... etc
};
```

### 2.3 Slug Resolution Utility
Create `src/lib/slugResolver.ts`:
```typescript
// Resolves client slug to clientId
// Used by API routes and middleware
export async function resolveClientSlug(slug: string): Promise<{ clientId: string; client: Client } | null>
```

---

## Phase 3: Routing & Layout Backbone

### 3.1 Add Shared App Layout
Create `src/app/(app)/layout.tsx`:
```typescript
// Handles:
// - AuthGuard wrapper (redirects to /login if no session)
// - Sidebar (with client context from slug)
// - Theme provider
// - Error boundary wrapper
```

### 3.2 Normalize Route Structure
```
/login                                    → Public auth page
/help                                     → Public help page

/app/[clientSlug]                         → Dashboard (home)
/app/[clientSlug]/workspaces              → Workspace list
/app/[clientSlug]/workspaces/[workspaceId]→ Workspace detail
/app/[clientSlug]/bots                    → All bots list
/app/[clientSlug]/bots/[botId]            → Bot overview
/app/[clientSlug]/bots/[botId]/customize  → Bot appearance (was /mascot)
/app/[clientSlug]/bots/[botId]/brain      → Bot knowledge/training
/app/[clientSlug]/bots/[botId]/chat       → Test chat
/app/[clientSlug]/bots/[botId]/analytics  → Bot-specific analytics
/app/[clientSlug]/bots/[botId]/settings   → Bot settings
/app/[clientSlug]/analytics               → Client-wide analytics
/app/[clientSlug]/conversations           → All conversations
/app/[clientSlug]/users                   → Team management
/app/[clientSlug]/settings                → Client settings
/app/[clientSlug]/billing                 → Billing & plans
/app/[clientSlug]/marketplace             → Add-ons (keep cart for this)

/profile                                  → User profile (cross-client)
```

### 3.3 Remove Per-Page Wrappers
- Delete individual `AuthGuard` + `Sidebar` wrappers from each page
- Pages become pure content, layout handles chrome

---

## Phase 4: Middleware & Auth Flow

### 4.1 Add Next.js Middleware
Create `src/middleware.ts`:
```typescript
// Runs on every request to protected routes
// Checks for valid session cookie/token
// Redirects to /login if not authenticated
// Validates clientSlug matches session.clientId

export const config = {
  matcher: ['/app/:path*', '/profile/:path*']
};
```

### 4.2 Auth Flow
```
1. User visits /login
2. Submits credentials → POST /api/auth/login
3. API validates against mock data, returns session + sets cookie
4. Redirect to /app/{clientSlug} (or defaultWorkspaceId path)
5. Middleware validates session on subsequent requests
6. AuthGuard in layout provides session context to children
```

### 4.3 Session Storage (Mock Phase)
- Use HTTP-only cookie with JSON session (mock phase)
- Later: Replace with Supabase auth tokens

---

## Phase 5: Single Source of Mock Truth

### 5.1 Consolidate Data Files
**Keep:** `public/data/*.json` as the only mock data source
```
public/data/
├── clients.json      → Client accounts (add defaultWorkspaceId field)
├── workspaces.json   → Workspace configs
├── bots.json         → Bot definitions
├── users.json        → Team members (add role field)
├── conversations.json
├── messages.json
├── sessions.json     → User sessions
├── bot_sessions.json → Bot analytics sessions
├── metrics.json      → Daily/aggregate metrics
└── billing.json
```

### 5.2 Delete Redundant Data
- Delete `src/data/` directory entirely
- Update any imports that referenced `src/data/*`

### 5.3 Ensure Schema Consistency
All JSON files must use canonical keys:
- `clientId` (not `client_id`)
- `workspaceId` (not `workspace_id`)
- `botId` (not `bot_id` or `mascot_id`)
- `userId` (not `user_id`)

---

## Phase 6: Component Responsibility

### 6.1 Create Utility Libraries
**`src/lib/formatters.ts`:**
```typescript
export function formatPercentage(value: number): string
export function formatNumber(value: number): string
export function formatDate(date: string | Date): string
export function formatDuration(seconds: number): string
export function formatCurrency(amount: number): string
```

**`src/lib/filters.ts`:**
```typescript
export function filterBySearch<T>(items: T[], query: string, keys: (keyof T)[]): T[]
export function sortBy<T>(items: T[], key: keyof T, direction: 'asc' | 'desc'): T[]
export function filterByStatus<T>(items: T[], status: string): T[]
export function filterByDateRange<T>(items: T[], from: Date, to: Date, dateKey: keyof T): T[]
```

### 6.2 Make Components Presentational
Move business logic OUT of components:

| Component | Extract To |
|-----------|------------|
| `BotCard.tsx` bundle load calc | `lib/formatters.ts` |
| Page search/filter state | Custom hooks or page-level |
| Percentage calculations | `lib/formatters.ts` |
| Status derivation logic | `lib/helpers.ts` |

### 6.3 Rename Components to Domain Terms
| Current | New |
|---------|-----|
| Analytics sections | `AnalyticsOverview.tsx`, `SessionMetrics.tsx`, `IntentBreakdown.tsx` |
| Workspace usage display | `WorkspaceUsage.tsx` |
| Conversation list | `ConversationList.tsx`, `ConversationItem.tsx` |
| User list | `TeamMemberList.tsx` |

---

## Phase 7: Error Handling & Loading States

### 7.1 Enhanced Error Boundaries
Update `src/app/(app)/error.tsx`:
- Capture error details
- Provide retry mechanism
- Log errors (console for mock, service later)

### 7.2 Consistent Loading States
Create `src/components/ui/PageSkeleton.tsx`:
- Reusable skeleton for page loading
- Variants: dashboard, list, detail

### 7.3 API Error Handling
In `src/lib/api.ts`:
```typescript
// Standardized error response type
export type ApiError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

// All API calls return Result<T, ApiError>
```

---

## Phase 8: Documentation

### 8.1 Create `docs/SUPABASE_READINESS.md`
Document for each API endpoint:
```markdown
## Endpoint: GET /api/bots?clientId=

**Current (Mock):** Reads from public/data/bots.json, filters by clientId

**Supabase Migration:**
- Table: `bots`
- Query: `supabase.from('bots').select('*').eq('client_id', clientId)`
- RLS Policy: Users can only read bots belonging to their client

**Session Required:** Yes
**Slug Usage:** clientSlug resolved to clientId before query
```

### 8.2 Update README.md
- New route structure
- "Mock API now, Supabase later" explanation
- How to run locally
- Environment variables needed (prep for Supabase)

### 8.3 Create `docs/DATA_SCHEMA.md`
- Document each JSON file structure
- Map to future Supabase tables
- Note any transformations needed

---

## Execution Order

```
Phase 1: Types & Domain Naming
    └── Foundation for everything else

Phase 2: Mock API Layer
    └── Establishes data contract

Phase 3: Routing & Layout
    └── Depends on API being available

Phase 4: Middleware & Auth
    └── Depends on API auth endpoints

Phase 5: Single Source of Truth
    └── Safe after API handles all data access

Phase 6: Component Cleanup
    └── Can happen in parallel with Phase 5

Phase 7: Error Handling
    └── Polish after core structure is stable

Phase 8: Documentation
    └── Final step, documents completed architecture
```

---

## Success Criteria (Before Supabase)

- [ ] All pages load data via `lib/api.ts` only
- [ ] No direct imports from `dataService.ts` in components
- [ ] `src/data/` directory deleted
- [ ] Session includes `{ clientId, clientSlug, userId, role }`
- [ ] Middleware protects all `/app/*` routes
- [ ] Slug-based URLs working throughout
- [ ] Types centralized in `src/types/`
- [ ] No "Mascot" terminology in code (except marketplace if needed)
- [ ] Error boundaries catch and display API failures
- [ ] Loading skeletons on all data-fetching pages
- [ ] `SUPABASE_READINESS.md` documents all endpoints

---

## Files to Create

```
src/types/index.ts
src/lib/api.ts
src/lib/slugResolver.ts
src/lib/formatters.ts
src/lib/filters.ts
src/middleware.ts
src/app/(app)/layout.tsx
src/app/api/auth/login/route.ts
src/app/api/auth/logout/route.ts
src/app/api/auth/session/route.ts
src/app/api/clients/[slug]/route.ts
src/app/api/workspaces/route.ts
src/app/api/workspaces/[workspaceId]/route.ts
src/app/api/bots/route.ts
src/app/api/bots/[botId]/route.ts
src/app/api/analytics/sessions/route.ts
src/app/api/analytics/daily/route.ts
src/app/api/analytics/intents/route.ts
src/app/api/conversations/route.ts
src/app/api/conversations/[conversationId]/route.ts
src/app/api/users/route.ts
src/app/api/counters/route.ts
src/components/ui/PageSkeleton.tsx
docs/SUPABASE_READINESS.md
docs/DATA_SCHEMA.md
```

## Files to Delete

```
src/data/bots.json
src/data/clients.json
src/data/ (entire directory)
```

## Files to Rename/Move

```
src/app/(app)/app/[clientId]/* → src/app/(app)/app/[clientSlug]/*
src/app/(app)/app/[clientSlug]/bot/[botId]/mascot → .../customize
```
