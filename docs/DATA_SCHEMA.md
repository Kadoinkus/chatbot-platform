# Data Schema Documentation

> Maps JSON files to future Supabase tables.

## Overview

Current data resides in `public/data/*.json` files. This document describes each file's structure and its corresponding Supabase table schema.

---

## clients.json → `clients` table

**Current JSON Structure:**
```json
{
  "id": "c1",
  "name": "Jumbo",
  "slug": "jumbo",
  "palette": {
    "primary": "#FFD700",
    "primaryDark": "#E6C200",
    "accent": "#111827"
  },
  "login": {
    "email": "jumbo@demo.app",
    "password": "jumbo123"
  }
}
```

**Supabase Table:**
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  palette JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: login credentials will be handled by Supabase Auth
-- Password storage is not needed in this table
```

**Transformations:**
- `id`: Change from `c1` string to UUID
- `login`: Remove - handled by Supabase Auth
- `palette`: Store as JSONB

---

## workspaces.json → `workspaces` table

**Current JSON Structure:**
```json
{
  "id": "ws_jumbo_customer_service",
  "clientId": "c1",
  "name": "Customer Service",
  "description": "Main customer service workspace",
  "plan": "growth",
  "usage": { "bots": 2, "maxBots": 5 }
}
```

**Supabase Table:**
```sql
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  plan TEXT DEFAULT 'starter',
  usage JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workspaces_client_id ON workspaces(client_id);
```

**Transformations:**
- `id`: Change from `ws_*` string to UUID
- `clientId`: Change to `client_id` (snake_case) and UUID reference

---

## bots.json → `bots` table

**Current JSON Structure:**
```json
{
  "id": "m1",
  "clientId": "c1",
  "workspaceId": "ws_jumbo_customer_service",
  "name": "Liza",
  "image": "/images/client-mascots/m1-liza.png",
  "status": "Live",
  "conversations": 482,
  "description": "Customer service bot for general inquiries",
  "metrics": {
    "responseTime": 1.2,
    "resolutionRate": 82,
    "csat": 4.5
  }
}
```

**Supabase Table:**
```sql
CREATE TABLE bots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  image TEXT,
  status TEXT DEFAULT 'Draft' CHECK (status IN ('Live', 'Paused', 'Draft', 'Training')),
  description TEXT,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bots_client_id ON bots(client_id);
CREATE INDEX idx_bots_workspace_id ON bots(workspace_id);
CREATE INDEX idx_bots_status ON bots(status);
```

**Transformations:**
- `id`: Change from `m*` string to UUID
- `clientId`, `workspaceId`: Change to snake_case and UUID references
- `conversations`: Remove - calculated from conversations table
- `metrics`: Remove - calculated from bot_sessions table

---

## users.json → `profiles` + `team_members` tables

**Current JSON Structure:**
```json
{
  "id": "u1",
  "clientId": "c1",
  "name": "John Doe",
  "email": "john@jumbo.com",
  "role": "owner",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Supabase Tables:**
```sql
-- User profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team member associations
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, client_id)
);

CREATE INDEX idx_team_members_client_id ON team_members(client_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
```

**Transformations:**
- `id`: Use auth.users UUID
- `email`: Stored in auth.users
- Split into profiles (user data) and team_members (client association)

---

## conversations.json → `conversations` table

**Current JSON Structure:**
```json
{
  "id": "conv1",
  "botId": "m1",
  "clientId": "c1",
  "userId": "visitor_123",
  "status": "resolved",
  "startedAt": "2024-01-15T10:30:00Z",
  "endedAt": "2024-01-15T10:45:00Z",
  "metadata": { "source": "website", "page": "/products" }
}
```

**Supabase Table:**
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID REFERENCES bots(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  visitor_id TEXT,  -- Anonymous visitor identifier
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'escalated', 'abandoned')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_bot_id ON conversations(bot_id);
CREATE INDEX idx_conversations_client_id ON conversations(client_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_started_at ON conversations(started_at DESC);
```

---

## messages.json → `messages` table

**Current JSON Structure:**
```json
{
  "id": "msg1",
  "conversationId": "conv1",
  "sender": "user",
  "content": "Hello, I need help",
  "timestamp": "2024-01-15T10:30:05Z"
}
```

**Supabase Table:**
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender TEXT CHECK (sender IN ('user', 'bot', 'agent')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

---

## bot_sessions.json → `bot_sessions` table

**Current JSON Structure:**
```json
{
  "id": "session1",
  "botId": "m1",
  "clientId": "c1",
  "startedAt": "2024-01-15T10:30:00Z",
  "endedAt": "2024-01-15T10:45:00Z",
  "messageCount": 8,
  "intent": "order_tracking",
  "resolved": true,
  "satisfaction": 5
}
```

**Supabase Table:**
```sql
CREATE TABLE bot_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID REFERENCES bots(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  message_count INTEGER DEFAULT 0,
  intent TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  satisfaction INTEGER CHECK (satisfaction >= 1 AND satisfaction <= 5),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_bot_sessions_bot_id ON bot_sessions(bot_id);
CREATE INDEX idx_bot_sessions_client_id ON bot_sessions(client_id);
CREATE INDEX idx_bot_sessions_started_at ON bot_sessions(started_at DESC);
CREATE INDEX idx_bot_sessions_intent ON bot_sessions(intent);
```

---

## metrics.json → `daily_metrics` materialized view

**Current JSON Structure:**
```json
{
  "clientId": "c1",
  "date": "2024-01-15",
  "totalSessions": 150,
  "resolvedSessions": 120,
  "avgResponseTime": 1.5,
  "avgSatisfaction": 4.3
}
```

**Supabase Implementation:**
```sql
-- Create materialized view for daily aggregates
CREATE MATERIALIZED VIEW daily_metrics AS
SELECT
  client_id,
  DATE(started_at) as date,
  COUNT(*) as total_sessions,
  COUNT(*) FILTER (WHERE resolved = TRUE) as resolved_sessions,
  AVG(EXTRACT(EPOCH FROM (ended_at - started_at))) as avg_duration_seconds,
  AVG(satisfaction) as avg_satisfaction
FROM bot_sessions
GROUP BY client_id, DATE(started_at);

CREATE UNIQUE INDEX idx_daily_metrics_client_date
  ON daily_metrics(client_id, date);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_daily_metrics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_metrics;
END;
$$ LANGUAGE plpgsql;
```

---

## billing.json → `subscriptions` + `invoices` tables

**Current JSON Structure:**
```json
{
  "clientId": "c1",
  "plan": "growth",
  "billingCycle": "monthly",
  "nextBillingDate": "2024-02-15",
  "paymentMethod": { "type": "card", "last4": "4242" }
}
```

**Supabase Tables:**
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('card', 'bank_transfer', 'paypal')),
  last4 TEXT,
  stripe_payment_method_id TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## sessions.json → Use Supabase Auth

**Current:** Custom session storage in JSON.

**Supabase:** Use built-in auth session management.

---

## Key Differences Summary

| JSON Field | Supabase Column | Notes |
|------------|-----------------|-------|
| `clientId` | `client_id` | Snake case for SQL |
| `workspaceId` | `workspace_id` | UUID reference |
| `botId` | `bot_id` | UUID reference |
| `userId` | `user_id` | UUID from auth.users |
| `id` (string) | `id` (UUID) | Auto-generated UUIDs |
| `createdAt` | `created_at` | TIMESTAMPTZ |

---

## Migration Order

1. `clients` - No dependencies
2. `profiles` - Depends on auth.users
3. `team_members` - Depends on profiles, clients
4. `workspaces` - Depends on clients
5. `bots` - Depends on clients, workspaces
6. `conversations` - Depends on bots, clients
7. `messages` - Depends on conversations
8. `bot_sessions` - Depends on bots, clients, conversations
9. `subscriptions` - Depends on clients
10. `payment_methods` - Depends on clients
