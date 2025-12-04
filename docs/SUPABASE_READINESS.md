# Supabase Migration Readiness

> Documentation for migrating from mock JSON data to Supabase.

## Current Architecture

All data currently comes from JSON files in `public/data/`. The API layer (`src/app/api/`) reads from these files using server-side file reads. This documentation maps each endpoint to its future Supabase implementation.

---

## Auth Endpoints

### POST /api/auth/login

**Current (Mock):** Reads from `public/data/clients.json`, validates email/password, sets HTTP-only session cookie.

**Supabase Migration:**
```typescript
// Use Supabase Auth
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});
// Store session in cookie using Supabase's built-in session handling
```

**Session Required:** No
**Notes:** Replace custom session cookie with Supabase auth tokens.

---

### POST /api/auth/logout

**Current (Mock):** Clears session cookie.

**Supabase Migration:**
```typescript
await supabase.auth.signOut();
```

**Session Required:** Yes

---

### GET /api/auth/session

**Current (Mock):** Reads session from cookie, validates against clients.json.

**Supabase Migration:**
```typescript
const { data: { session } } = await supabase.auth.getSession();
// Session already includes user and access token
```

**Session Required:** Yes
**Notes:** Supabase handles session validation automatically.

---

## Client Endpoints

### GET /api/clients

**Current (Mock):** Reads from `public/data/clients.json`, returns all clients.

**Supabase Migration:**
- Table: `clients`
- Query: `supabase.from('clients').select('*')`
- RLS Policy: Admin only

**Session Required:** Yes (admin)

---

### GET /api/clients/[slug]

**Current (Mock):** Finds client by slug in clients.json.

**Supabase Migration:**
```typescript
supabase.from('clients').select('*').eq('slug', slug).single()
```
- RLS Policy: Users can only read their own client

**Session Required:** Yes

---

### GET /api/clients/id/[id]

**Current (Mock):** Finds client by ID in clients.json.

**Supabase Migration:**
```typescript
supabase.from('clients').select('*').eq('id', id).single()
```
- RLS Policy: Users can only read their own client

**Session Required:** Yes

---

## Workspace Endpoints

### GET /api/workspaces

**Current (Mock):** Reads from `public/data/workspaces.json`, filters by clientId query param.

**Supabase Migration:**
```typescript
supabase.from('workspaces').select('*').eq('client_id', clientId)
```
- RLS Policy: Users can read workspaces belonging to their client

**Session Required:** Yes

---

### GET /api/workspaces/[workspaceId]

**Current (Mock):** Finds workspace by ID in workspaces.json.

**Supabase Migration:**
```typescript
supabase.from('workspaces').select('*').eq('id', workspaceId).single()
```
- RLS Policy: Users can read workspaces belonging to their client

**Session Required:** Yes

---

## Bot Endpoints

### GET /api/bots

**Current (Mock):** Reads from `public/data/bots.json`, filters by clientId or workspaceId.

**Supabase Migration:**
```typescript
supabase.from('bots')
  .select('*')
  .eq('client_id', clientId)
  // Optional: .eq('workspace_id', workspaceId)
```
- RLS Policy: Users can read bots belonging to their client

**Session Required:** Yes

---

### GET /api/bots/[botId]

**Current (Mock):** Finds bot by ID in bots.json.

**Supabase Migration:**
```typescript
supabase.from('bots').select('*').eq('id', botId).single()
```
- RLS Policy: Users can read bots belonging to their client

**Session Required:** Yes

---

## Analytics Endpoints

### GET /api/analytics/sessions

**Current (Mock):** Reads from `public/data/bot_sessions.json`, filters by clientId and date range.

**Supabase Migration:**
```typescript
supabase.from('bot_sessions')
  .select('*')
  .eq('client_id', clientId)
  .gte('started_at', from)
  .lte('started_at', to)
```
- RLS Policy: Users can read sessions belonging to their client
- Consider using materialized views for aggregates

**Session Required:** Yes

---

### GET /api/analytics/daily

**Current (Mock):** Reads from `public/data/metrics.json`, returns daily aggregates.

**Supabase Migration:**
```typescript
// Option 1: Materialized view
supabase.from('daily_metrics').select('*').eq('client_id', clientId)

// Option 2: Aggregation function
supabase.rpc('get_daily_metrics', { p_client_id: clientId, p_from: from, p_to: to })
```

**Session Required:** Yes

---

### GET /api/analytics/intents

**Current (Mock):** Aggregates intent data from bot_sessions.json.

**Supabase Migration:**
```typescript
supabase.rpc('get_intent_breakdown', { p_client_id: clientId })
```

**Session Required:** Yes
**Notes:** Create a database function for efficient aggregation.

---

## Conversation Endpoints

### GET /api/conversations

**Current (Mock):** Reads from `public/data/conversations.json`, filters by clientId, status, botId.

**Supabase Migration:**
```typescript
supabase.from('conversations')
  .select('*, messages(*)')
  .eq('client_id', clientId)
  .eq('status', status)  // if provided
  .eq('bot_id', botId)   // if provided
  .order('created_at', { ascending: false })
```
- RLS Policy: Users can read conversations belonging to their client

**Session Required:** Yes

---

### GET /api/conversations/[conversationId]

**Current (Mock):** Finds conversation with messages.

**Supabase Migration:**
```typescript
supabase.from('conversations')
  .select('*, messages(*)')
  .eq('id', conversationId)
  .single()
```

**Session Required:** Yes

---

## User Endpoints

### GET /api/users

**Current (Mock):** Reads from `public/data/users.json`, filters by clientId.

**Supabase Migration:**
```typescript
supabase.from('team_members')
  .select('*, profiles(*)')
  .eq('client_id', clientId)
```

**Session Required:** Yes

---

### GET /api/users/[userId]

**Current (Mock):** Finds user by ID.

**Supabase Migration:**
```typescript
supabase.from('profiles').select('*').eq('id', userId).single()
```

**Session Required:** Yes

---

## Counter Endpoints

### GET /api/counters

**Current (Mock):** Calculates counts from various JSON files.

**Supabase Migration:**
```typescript
// Use database function for efficient counting
supabase.rpc('get_dashboard_counters', { p_client_id: clientId })
```

**Session Required:** Yes

---

## RLS Policy Templates

### Clients Table
```sql
-- Users can only read their own client
CREATE POLICY "Users can read own client" ON clients
  FOR SELECT USING (
    id = (SELECT client_id FROM team_members WHERE user_id = auth.uid())
  );
```

### Bots Table
```sql
-- Users can read bots belonging to their client
CREATE POLICY "Users can read client bots" ON bots
  FOR SELECT USING (
    client_id = (SELECT client_id FROM team_members WHERE user_id = auth.uid())
  );
```

### General Pattern
```sql
-- All resources scoped to client
CREATE POLICY "Client scope" ON <table>
  FOR ALL USING (
    client_id = (SELECT client_id FROM team_members WHERE user_id = auth.uid())
  );
```

---

## Migration Checklist

- [ ] Set up Supabase project
- [ ] Create database schema (see DATA_SCHEMA.md)
- [ ] Configure RLS policies
- [ ] Migrate auth to Supabase Auth
- [ ] Update middleware to use Supabase session
- [ ] Update API routes one by one
- [ ] Create database functions for aggregations
- [ ] Test all endpoints
- [ ] Update client-side data fetching
