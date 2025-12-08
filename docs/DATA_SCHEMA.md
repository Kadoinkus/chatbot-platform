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
- `metrics`: Remove - calculated from chat_sessions/chat_session_analyses

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

## chat_sessions.json → `chat_sessions` table

**Current JSON Structure (mock aligned with Supabase):**
```json
{
  "id": "sess-001",
  "mascot_id": "m1",
  "client_id": "demo-jumbo",
  "domain": "jumbo.com",
  "session_started_at": "2025-11-15T09:15:00Z",
  "session_ended_at": "2025-11-15T09:22:00Z",
  "first_message_at": "2025-11-15T09:15:30Z",
  "last_message_at": "2025-11-15T09:21:45Z",
  "is_active": false,
  "end_reason": "user_inactive",
  "ip_address": "192.168.1.xxx",
  "country": "NL",
  "city": "Amsterdam",
  "user_agent": "Mozilla/5.0 ... Chrome/120.0",
  "device_type": "desktop",
  "browser": "Chrome 120.0",
  "os": "Windows 10",
  "referrer_url": "https://google.com",
  "page_url": "https://jumbo.com/contact",
  "user_id": "user-001",
  "widget_version": "0.0.3",
  "total_bot_messages": 4,
  "total_user_messages": 3,
  "total_tokens": 4500,
  "total_prompt_tokens": 3200,
  "total_completion_tokens": 1300,
  "total_cost_usd": 0.0050,
  "total_cost_eur": 0.0046,
  "average_response_time_ms": 2200,
  "easter_eggs_triggered": 0,
  "is_dev": false,
  "glb_source": "memory_cache",
  "glb_transfer_size": 0,
  "glb_encoded_body_size": 5242880,
  "glb_response_end": 1234.56,
  "glb_url": "https://cdn.example.com/model.glb",
  "full_transcript": [
    { "author": "user", "message": "Hello", "timestamp": "2025-11-15T09:15:30Z", "easter": "" },
    { "author": "assistant", "message": "Hi!", "timestamp": "2025-11-15T09:15:31Z", "easter": "" }
  ],
  "created_at": "2025-11-15T09:15:00Z",
  "updated_at": "2025-11-15T09:22:00Z"
}
```

**Supabase Table:**
```sql
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mascot_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  domain TEXT,
  session_started_at TIMESTAMPTZ NOT NULL,
  session_ended_at TIMESTAMPTZ,
  first_message_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT FALSE,
  end_reason TEXT,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  referrer_url TEXT,
  page_url TEXT,
  user_id TEXT,
  widget_version TEXT,
  total_bot_messages INTEGER DEFAULT 0,
  total_user_messages INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  total_prompt_tokens INTEGER DEFAULT 0,
  total_completion_tokens INTEGER DEFAULT 0,
  total_cost_usd NUMERIC(10,8) DEFAULT 0,
  total_cost_eur NUMERIC(10,8) DEFAULT 0,
  average_response_time_ms INTEGER,
  easter_eggs_triggered INTEGER DEFAULT 0,
  is_dev BOOLEAN DEFAULT FALSE,
  glb_source TEXT,
  glb_transfer_size INTEGER,
  glb_encoded_body_size INTEGER,
  glb_response_end DOUBLE PRECISION,
  glb_url TEXT,
  full_transcript JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_sessions_mascot_id ON chat_sessions(mascot_id);
CREATE INDEX idx_chat_sessions_client_id ON chat_sessions(client_id);
CREATE INDEX idx_chat_sessions_started_at ON chat_sessions(session_started_at DESC);
CREATE INDEX idx_chat_sessions_domain ON chat_sessions(domain);
```

---

## chat_messages.json → `chat_messages` table

**Current JSON Structure:**
```json
{
  "id": "msg-001-1",
  "session_id": "sess-001",
  "mascot_id": "m1",
  "message": "Hello, how can I help?",
  "author": "bot",
  "timestamp": "2025-11-15T09:15:31Z",
  "response_time_ms": 1200,
  "prompt_tokens": 150,
  "completion_tokens": 50,
  "total_tokens": 200,
  "model_used": "gpt-4.1-mini",
  "cost_usd": 0.00012345,
  "cost_eur": 0.00011234,
  "finish_reason": "completed",
  "response_animation": "happy",
  "easter_egg_animation": "dance",
  "wait_sequence": "thinking",
  "has_easter_egg": false,
  "raw_response": "{\"answer\":\"...\",\"animation\":...}"
}
```

**Supabase Table:**
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  mascot_id TEXT NOT NULL,
  message TEXT NOT NULL,
  author TEXT CHECK (author IN ('user','bot')),
  timestamp TIMESTAMPTZ NOT NULL,
  response_time_ms INTEGER,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  model_used TEXT,
  cost_usd NUMERIC(10,8),
  cost_eur NUMERIC(10,8),
  finish_reason TEXT,
  response_animation JSONB,
  easter_egg_animation TEXT,
  wait_sequence TEXT,
  has_easter_egg BOOLEAN DEFAULT FALSE,
  raw_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_mascot_id ON chat_messages(mascot_id);
CREATE INDEX idx_chat_messages_timestamp ON chat_messages(timestamp DESC);
```

---

## chat_session_analyses.json → `chat_session_analyses` table

**Current JSON Structure:**
```json
{
  "session_id": "sess-001",
  "mascot_id": "m1",
  "language": "nl",
  "sentiment": "positive",
  "escalated": false,
  "forwarded_email": false,
  "forwarded_url": true,
  "url_links": ["https://example.com/help"],
  "email_links": [],
  "category": "support",
  "questions": ["What are your opening hours?"],
  "unanswered_questions": [],
  "summary": "User asked about hours; answered.",
  "session_outcome": "completed",
  "resolution_status": "resolved",
  "engagement_level": "medium",
  "conversation_type": "goal_driven",
  "analytics_total_tokens": 120,
  "analytics_total_cost_eur": 0.0012,
  "analytics_model_used": "gpt-4.1-mini",
  "custom_object1": {},
  "custom_object2": {},
  "raw_response": { "payload": {}, "raw_text": "..." },
  "created_at": "2025-11-15T09:25:00Z",
  "updated_at": "2025-11-15T09:25:00Z"
}
```

**Supabase Table:**
```sql
CREATE TABLE chat_session_analyses (
  session_id UUID PRIMARY KEY REFERENCES chat_sessions(id) ON DELETE CASCADE,
  mascot_id TEXT NOT NULL,
  language TEXT,
  sentiment TEXT,
  escalated BOOLEAN DEFAULT FALSE,
  forwarded_email BOOLEAN DEFAULT FALSE,
  forwarded_url BOOLEAN DEFAULT FALSE,
  url_links JSONB DEFAULT '[]'::jsonb,
  email_links JSONB DEFAULT '[]'::jsonb,
  category TEXT,
  questions JSONB DEFAULT '[]'::jsonb,
  unanswered_questions JSONB DEFAULT '[]'::jsonb,
  summary TEXT,
  session_outcome TEXT,
  resolution_status TEXT,
  engagement_level TEXT,
  conversation_type TEXT,
  analytics_total_tokens INTEGER,
  analytics_total_cost_eur NUMERIC(10,8),
  analytics_model_used TEXT,
  custom_object1 JSONB DEFAULT '{}'::jsonb,
  custom_object2 JSONB DEFAULT '{}'::jsonb,
  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_session_analyses_mascot_id ON chat_session_analyses(mascot_id);
CREATE INDEX idx_chat_session_analyses_created_at ON chat_session_analyses(created_at DESC);
```

> Note: `bot_sessions` is deprecated in favor of `chat_sessions`/`chat_session_analyses`/`chat_messages`.

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
  DATE(session_started_at) AS date,
  COUNT(*) AS total_sessions,
  COUNT(*) FILTER (WHERE session_ended_at IS NOT NULL) AS resolved_sessions,
  AVG(EXTRACT(EPOCH FROM (session_ended_at - session_started_at))) AS avg_duration_seconds,
  AVG(total_cost_eur) AS avg_cost_eur
FROM chat_sessions
GROUP BY client_id, DATE(session_started_at);

CREATE UNIQUE INDEX idx_daily_metrics_client_date ON daily_metrics(client_id, date);

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
8. `chat_sessions` / `chat_messages` / `chat_session_analyses` - Depend on bots, clients (and chat_sessions for messages/analyses)
9. `subscriptions` - Depends on clients
10. `payment_methods` - Depends on clients
