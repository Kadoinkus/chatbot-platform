# Supabase Data Requirements Report

**Platform:** NotsoAI Chatbot Platform
**Date:** December 3, 2025
**Focus Areas:** Login, Workspaces & Bots, Analytics, Conversation Counters

---

## Table of Contents

1. [Overview](#1-overview)
2. [Login per Client](#2-login-per-client)
3. [Workspaces & Bots (Mascots)](#3-workspaces--bots-mascots)
4. [Analytics](#4-analytics)
5. [Conversation Counters & Bundles](#5-conversation-counters--bundles)
6. [Recommended Supabase Tables](#6-recommended-supabase-tables)
7. [API Endpoints Summary](#7-api-endpoints-summary)

---

## 1. Overview

Your platform currently uses static JSON files in `/public/data/`. To connect Supabase, you need to provide data matching these structures. The key relationships are:

```
Client (1) ──────┬──────> Workspace (many)
                 │              │
                 │              └──────> Bot/Mascot (many)
                 │                            │
                 │                            └──────> BotSession (many)
                 │                            └──────> Conversation (many)
                 │
                 └──────> User (many)
```

---

## 2. Login per Client

### What the Platform Needs

The login system requires client credentials and branding information.

### Required Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique client identifier |
| `name` | string | Yes | Display name (e.g., "Jumbo") |
| `slug` | string | Yes | URL-friendly name (e.g., "jumbo") |
| `email` | string | Yes | Login email |
| `password` | string | Yes | Login password (hash in production) |
| `palette.primary` | string | Yes | Primary brand color (hex) |
| `palette.primaryDark` | string | Yes | Dark variant (hex) |
| `palette.accent` | string | Yes | Accent color (hex) |
| `defaultWorkspaceId` | string | No | Default workspace to load |

### JSON Example (from Supabase)

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
  },
  "defaultWorkspaceId": "ws_jumbo_customer_service"
}
```

### Supabase Table: `clients`

```sql
CREATE TABLE clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  palette_primary TEXT DEFAULT '#FFD700',
  palette_primary_dark TEXT DEFAULT '#E6C200',
  palette_accent TEXT DEFAULT '#111827',
  default_workspace_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### API Response Format

```json
// GET /api/clients (for login dropdown)
[
  {
    "id": "c1",
    "name": "Jumbo",
    "slug": "jumbo",
    "email": "jumbo@demo.app"
  },
  {
    "id": "c2",
    "name": "HiTapes",
    "slug": "hitapes",
    "email": "hitapes@demo.app"
  }
]

// POST /api/auth/login
// Request: { "email": "jumbo@demo.app", "password": "jumbo123" }
// Response:
{
  "success": true,
  "client": {
    "id": "c1",
    "name": "Jumbo",
    "slug": "jumbo",
    "palette": {
      "primary": "#FFD700",
      "primaryDark": "#E6C200",
      "accent": "#111827"
    },
    "defaultWorkspaceId": "ws_jumbo_customer_service"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## 3. Workspaces & Bots (Mascots)

### 3.1 Workspaces

Workspaces are resource pools that contain bots and track usage limits.

### Required Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique workspace ID |
| `clientId` | string | Yes | Parent client reference |
| `name` | string | Yes | Workspace name |
| `description` | string | No | Description |
| `plan` | enum | Yes | 'starter' \| 'growth' \| 'premium' \| 'enterprise' |
| `status` | enum | Yes | 'active' \| 'suspended' \| 'trial' |
| `bundleLoads` | object | Yes | 3D rendering usage tracking |
| `messages` | object | Yes | Chat message usage tracking |
| `apiCalls` | object | Yes | API call usage tracking |
| `walletCredits` | number | Yes | Prepaid credits balance |
| `overageRates` | object | Yes | Cost per overage unit |
| `billingCycle` | enum | Yes | 'monthly' \| 'quarterly' \| 'annual' |
| `monthlyFee` | number | Yes | Subscription cost |
| `nextBillingDate` | string | Yes | ISO date string |
| `createdAt` | string | Yes | ISO date string |

### JSON Example

```json
{
  "id": "ws_jumbo_customer_service",
  "clientId": "c1",
  "name": "Customer Service",
  "description": "Main customer support workspace",
  "plan": "premium",
  "status": "active",

  "bundleLoads": {
    "limit": 25000,
    "used": 18500,
    "remaining": 6500
  },

  "messages": {
    "limit": 500000,
    "used": 234000,
    "remaining": 266000
  },

  "apiCalls": {
    "limit": 1000000,
    "used": 445000,
    "remaining": 555000
  },

  "walletCredits": 50.00,

  "overageRates": {
    "bundleLoads": 0.25,
    "messages": 0.0015,
    "apiCalls": 0.0001
  },

  "billingCycle": "monthly",
  "monthlyFee": 2499.00,
  "nextBillingDate": "2024-02-01",
  "createdAt": "2024-01-01"
}
```

### Supabase Table: `workspaces`

```sql
CREATE TABLE workspaces (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id),
  name TEXT NOT NULL,
  description TEXT,
  plan TEXT CHECK (plan IN ('starter', 'growth', 'premium', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial')),

  -- Bundle Loads (3D rendering)
  bundle_loads_limit INT DEFAULT 1000,
  bundle_loads_used INT DEFAULT 0,

  -- Chat Messages
  messages_limit INT DEFAULT 50000,
  messages_used INT DEFAULT 0,

  -- API Calls
  api_calls_limit INT DEFAULT 100000,
  api_calls_used INT DEFAULT 0,

  -- Billing
  wallet_credits DECIMAL(10,2) DEFAULT 0,
  overage_rate_bundle_loads DECIMAL(6,4) DEFAULT 0.25,
  overage_rate_messages DECIMAL(6,4) DEFAULT 0.0015,
  overage_rate_api_calls DECIMAL(6,4) DEFAULT 0.0001,
  billing_cycle TEXT DEFAULT 'monthly',
  monthly_fee DECIMAL(10,2) DEFAULT 0,
  next_billing_date DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 3.2 Bots (Mascots)

Bots are the chatbot characters assigned to workspaces.

### Required Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique bot ID |
| `clientId` | string | Yes | Parent client reference |
| `workspaceId` | string | Yes | Parent workspace reference |
| `name` | string | Yes | Bot display name |
| `image` | string | Yes | Avatar image URL |
| `status` | enum | Yes | 'Live' \| 'Paused' \| 'Needs finalization' |
| `conversations` | number | Yes | Total conversation count |
| `description` | string | Yes | Bot description |
| `metrics.responseTime` | number | Yes | Avg response time (seconds) |
| `metrics.resolutionRate` | number | Yes | Resolution rate (percentage) |
| `metrics.csat` | number | Yes | Customer satisfaction (1-5) |

### JSON Example

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

### Supabase Table: `bots`

```sql
CREATE TABLE bots (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  name TEXT NOT NULL,
  image TEXT,
  status TEXT DEFAULT 'Paused' CHECK (status IN ('Live', 'Paused', 'Needs finalization')),
  conversations INT DEFAULT 0,
  description TEXT,

  -- Metrics
  metric_response_time DECIMAL(4,2) DEFAULT 0,
  metric_resolution_rate DECIMAL(5,2) DEFAULT 0,
  metric_csat DECIMAL(3,2) DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### API Response Format

```json
// GET /api/workspaces?clientId=c1
[
  {
    "id": "ws_jumbo_customer_service",
    "clientId": "c1",
    "name": "Customer Service",
    "plan": "premium",
    "status": "active",
    "bundleLoads": { "limit": 25000, "used": 18500, "remaining": 6500 },
    "messages": { "limit": 500000, "used": 234000, "remaining": 266000 },
    "bots": [
      {
        "id": "m1",
        "name": "Liza",
        "status": "Live",
        "conversations": 482
      }
    ]
  }
]
```

---

## 4. Analytics

### 4.1 Usage Data (Daily Metrics)

Tracks daily conversation volume per client and per bot.

### Required Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `date` | string | Yes | Date in YYYY-MM-DD format |
| `conversations` | number | Yes | Total conversations that day |
| `resolved` | number | Yes | Successfully resolved count |

### JSON Example (Grouped by Client)

```json
{
  "usageByDay": {
    "c1": [
      { "date": "2025-11-27", "conversations": 170, "resolved": 145 },
      { "date": "2025-11-26", "conversations": 162, "resolved": 138 },
      { "date": "2025-11-25", "conversations": 155, "resolved": 132 },
      { "date": "2025-11-24", "conversations": 140, "resolved": 118 },
      { "date": "2025-11-23", "conversations": 125, "resolved": 106 },
      { "date": "2025-11-22", "conversations": 180, "resolved": 153 },
      { "date": "2025-11-21", "conversations": 175, "resolved": 149 }
    ]
  },
  "botUsageByDay": {
    "m1": [
      { "date": "2025-11-27", "conversations": 45, "resolved": 38 },
      { "date": "2025-11-26", "conversations": 42, "resolved": 36 }
    ]
  }
}
```

### Supabase Table: `daily_metrics`

```sql
CREATE TABLE daily_metrics (
  id SERIAL PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id),
  bot_id TEXT REFERENCES bots(id),  -- NULL for client-level aggregates
  date DATE NOT NULL,
  conversations INT DEFAULT 0,
  resolved INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(client_id, bot_id, date)
);
```

---

### 4.2 Intent Data (Top Queries)

Tracks what users are asking about most frequently.

### Required Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `intent` | string | Yes | The detected intent/topic |
| `count` | number | Yes | Number of occurrences |

### JSON Example

```json
{
  "topIntents": {
    "c1": [
      { "intent": "Opening hours", "count": 145 },
      { "intent": "Product availability", "count": 98 },
      { "intent": "Order status", "count": 87 },
      { "intent": "Return policy", "count": 65 },
      { "intent": "Delivery info", "count": 52 }
    ]
  },
  "botIntents": {
    "m1": [
      { "intent": "Opening hours", "count": 45 },
      { "intent": "Product availability", "count": 32 }
    ]
  }
}
```

### Supabase Table: `intent_stats`

```sql
CREATE TABLE intent_stats (
  id SERIAL PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id),
  bot_id TEXT REFERENCES bots(id),
  intent TEXT NOT NULL,
  count INT DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  UNIQUE(client_id, bot_id, intent, period_start)
);
```

---

### 4.3 Bot Sessions (Detailed Analytics)

Individual session records with full metrics.

### Required Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `session_id` | string | Yes | Unique session identifier |
| `bot_id` | string | Yes | Bot that handled the session |
| `client_id` | string | Yes | Client reference |
| `start_time` | string | Yes | ISO timestamp |
| `end_time` | string | Yes | ISO timestamp |
| `messages_sent` | number | Yes | Message count in session |
| `sentiment` | enum | Yes | 'positive' \| 'neutral' \| 'negative' |
| `escalated` | enum | Yes | 'Yes' \| 'No' |
| `avg_response_time` | number | Yes | Milliseconds |
| `tokens` | number | Yes | LLM tokens used |
| `tokens_eur` | number | Yes | Token cost in EUR |
| `category` | string | Yes | Session category |
| `user_rating` | number | No | 1-5 rating |
| `country` | string | No | User country |
| `language` | string | No | Session language |
| `channel` | enum | Yes | 'webchat' \| 'whatsapp' \| 'facebook' \| 'telegram' |
| `device_type` | enum | Yes | 'desktop' \| 'mobile' \| 'tablet' |
| `resolution_type` | enum | Yes | 'self_service' \| 'escalated' \| 'partial' \| 'unresolved' |
| `goal_achieved` | boolean | Yes | Whether user goal was met |

### JSON Example

```json
{
  "session_id": "bs001",
  "bot_id": "m1",
  "client_id": "c1",
  "start_time": "2025-11-27T09:15:00Z",
  "end_time": "2025-11-27T09:22:00Z",
  "ip_address": "192.168.1.45",
  "country": "Netherlands",
  "language": "nl",
  "messages_sent": 6,
  "sentiment": "positive",
  "escalated": "No",
  "forwarded_hr": "No",
  "full_transcript": "User: Hi, what are your opening hours?\nBot: Hello! Our stores are open...",
  "avg_response_time": 1200,
  "tokens": 450,
  "tokens_eur": 0.0045,
  "category": "General Inquiry",
  "questions": ["What are your opening hours?", "Are you open on Sunday?"],
  "user_rating": 5,
  "summary": "User inquired about store opening hours",
  "intent_confidence": 0.95,
  "resolution_type": "self_service",
  "completion_status": "completed",
  "user_type": "returning",
  "channel": "webchat",
  "device_type": "desktop",
  "browser": "Chrome 127.0",
  "session_steps": 3,
  "goal_achieved": true,
  "error_occurred": false,
  "bot_handoff": false,
  "human_cost_equivalent": 2.50,
  "automation_saving": 2.45
}
```

### Supabase Table: `bot_sessions`

```sql
CREATE TABLE bot_sessions (
  session_id TEXT PRIMARY KEY,
  bot_id TEXT NOT NULL REFERENCES bots(id),
  client_id TEXT NOT NULL REFERENCES clients(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  ip_address INET,
  country TEXT,
  language TEXT DEFAULT 'en',
  messages_sent INT DEFAULT 0,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  escalated BOOLEAN DEFAULT FALSE,
  forwarded_hr BOOLEAN DEFAULT FALSE,
  full_transcript TEXT,
  avg_response_time INT,  -- milliseconds
  tokens INT DEFAULT 0,
  tokens_eur DECIMAL(10,4) DEFAULT 0,
  category TEXT,
  questions JSONB,
  user_rating INT CHECK (user_rating BETWEEN 1 AND 5),
  summary TEXT,
  intent_confidence DECIMAL(3,2),
  resolution_type TEXT CHECK (resolution_type IN ('self_service', 'escalated', 'partial', 'unresolved')),
  completion_status TEXT CHECK (completion_status IN ('completed', 'incomplete', 'escalated', 'partial')),
  user_type TEXT CHECK (user_type IN ('new', 'returning', 'existing')),
  channel TEXT CHECK (channel IN ('webchat', 'whatsapp', 'facebook', 'telegram')),
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  browser TEXT,
  session_steps INT DEFAULT 0,
  goal_achieved BOOLEAN DEFAULT FALSE,
  error_occurred BOOLEAN DEFAULT FALSE,
  bot_handoff BOOLEAN DEFAULT FALSE,
  human_cost_equivalent DECIMAL(10,2) DEFAULT 0,
  automation_saving DECIMAL(10,2) DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bot_sessions_client ON bot_sessions(client_id);
CREATE INDEX idx_bot_sessions_bot ON bot_sessions(bot_id);
CREATE INDEX idx_bot_sessions_time ON bot_sessions(start_time);
```

---

## 5. Conversation Counters & Bundles

### 5.1 Bundle Usage Tracking

The platform tracks three types of usage per workspace:

| Metric | Description | Typical Limits |
|--------|-------------|----------------|
| **Bundle Loads** | 3D avatar rendering (expensive) | 1,000 - 100,000/month |
| **Messages** | Chat messages (OpenAI costs) | 50,000 - 1,000,000/month |
| **API Calls** | Backend API requests | 100,000 - 10,000,000/month |

### JSON Format for Usage Display

```json
{
  "workspaceId": "ws_jumbo_customer_service",
  "usage": {
    "bundleLoads": {
      "limit": 25000,
      "used": 18500,
      "remaining": 6500,
      "percentage": 74
    },
    "messages": {
      "limit": 500000,
      "used": 234000,
      "remaining": 266000,
      "percentage": 46.8
    },
    "apiCalls": {
      "limit": 1000000,
      "used": 445000,
      "remaining": 555000,
      "percentage": 44.5
    }
  },
  "billing": {
    "walletCredits": 50.00,
    "overageRates": {
      "bundleLoads": 0.25,
      "messages": 0.0015,
      "apiCalls": 0.0001
    },
    "estimatedOverageCost": 0.00
  }
}
```

---

### 5.2 Conversation Tracking

Individual conversation records.

### Required Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique conversation ID |
| `botId` | string | Yes | Bot that handled it |
| `clientId` | string | Yes | Client reference |
| `userId` | string | Yes | End-user identifier |
| `userName` | string | Yes | End-user display name |
| `status` | enum | Yes | 'active' \| 'resolved' \| 'escalated' |
| `startedAt` | string | Yes | ISO timestamp |
| `endedAt` | string | No | ISO timestamp |
| `messages` | number | Yes | Message count |
| `satisfaction` | number | No | 1-5 rating |
| `intent` | string | Yes | Primary intent detected |
| `channel` | enum | Yes | 'webchat' \| 'whatsapp' \| 'facebook' \| 'telegram' |
| `preview` | string | Yes | First message preview |

### JSON Example

```json
{
  "id": "conv_abc123",
  "botId": "m1",
  "clientId": "c1",
  "userId": "user_xyz789",
  "userName": "Alex Johnson",
  "status": "resolved",
  "startedAt": "2025-11-27T14:30:00Z",
  "endedAt": "2025-11-27T14:35:00Z",
  "messages": 6,
  "satisfaction": 5,
  "intent": "Opening hours",
  "channel": "webchat",
  "preview": "Hi, what are your opening hours for tomorrow?"
}
```

### Supabase Table: `conversations`

```sql
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  bot_id TEXT NOT NULL REFERENCES bots(id),
  client_id TEXT NOT NULL REFERENCES clients(id),
  user_id TEXT NOT NULL,
  user_name TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'escalated')),
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  messages INT DEFAULT 0,
  satisfaction INT CHECK (satisfaction BETWEEN 1 AND 5),
  intent TEXT,
  channel TEXT CHECK (channel IN ('webchat', 'whatsapp', 'facebook', 'telegram')),
  preview TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_client ON conversations(client_id);
CREATE INDEX idx_conversations_bot ON conversations(bot_id);
CREATE INDEX idx_conversations_status ON conversations(status);
```

---

### 5.3 Counter Summary Endpoints

The platform needs aggregated counts for dashboards.

```json
// GET /api/counters?clientId=c1
{
  "clientId": "c1",
  "totals": {
    "workspaces": 3,
    "bots": 5,
    "activeConversations": 12,
    "totalConversations": 1247,
    "resolvedToday": 45,
    "escalatedToday": 3
  },
  "usage": {
    "bundleLoadsUsed": 18500,
    "bundleLoadsLimit": 25000,
    "messagesUsed": 234000,
    "messagesLimit": 500000
  },
  "trends": {
    "conversationsChange": "+12%",
    "resolutionRateChange": "+5%",
    "csatChange": "+0.2"
  }
}
```

---

## 6. Recommended Supabase Tables

### Complete Schema Overview

```sql
-- 1. Clients (Authentication)
CREATE TABLE clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  palette JSONB DEFAULT '{"primary":"#FFD700","primaryDark":"#E6C200","accent":"#111827"}',
  default_workspace_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Workspaces (Resource Pools)
CREATE TABLE workspaces (
  id TEXT PRIMARY KEY,
  client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  plan TEXT DEFAULT 'starter',
  status TEXT DEFAULT 'active',
  bundle_loads_limit INT DEFAULT 1000,
  bundle_loads_used INT DEFAULT 0,
  messages_limit INT DEFAULT 50000,
  messages_used INT DEFAULT 0,
  api_calls_limit INT DEFAULT 100000,
  api_calls_used INT DEFAULT 0,
  wallet_credits DECIMAL(10,2) DEFAULT 0,
  overage_rates JSONB DEFAULT '{"bundleLoads":0.25,"messages":0.0015,"apiCalls":0.0001}',
  billing_cycle TEXT DEFAULT 'monthly',
  monthly_fee DECIMAL(10,2) DEFAULT 0,
  next_billing_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bots (Mascots)
CREATE TABLE bots (
  id TEXT PRIMARY KEY,
  client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
  workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image TEXT,
  status TEXT DEFAULT 'Paused',
  conversations INT DEFAULT 0,
  description TEXT,
  metrics JSONB DEFAULT '{"responseTime":0,"resolutionRate":0,"csat":0}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Bot Sessions (Analytics)
CREATE TABLE bot_sessions (
  session_id TEXT PRIMARY KEY,
  bot_id TEXT REFERENCES bots(id) ON DELETE CASCADE,
  client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  country TEXT,
  language TEXT DEFAULT 'en',
  messages_sent INT DEFAULT 0,
  sentiment TEXT,
  escalated BOOLEAN DEFAULT FALSE,
  avg_response_time INT,
  tokens INT DEFAULT 0,
  tokens_eur DECIMAL(10,4) DEFAULT 0,
  category TEXT,
  user_rating INT,
  resolution_type TEXT,
  channel TEXT DEFAULT 'webchat',
  device_type TEXT DEFAULT 'desktop',
  goal_achieved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Conversations
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  bot_id TEXT REFERENCES bots(id) ON DELETE CASCADE,
  client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT,
  status TEXT DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  messages INT DEFAULT 0,
  satisfaction INT,
  intent TEXT,
  channel TEXT DEFAULT 'webchat',
  preview TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Daily Metrics (Aggregated)
CREATE TABLE daily_metrics (
  id SERIAL PRIMARY KEY,
  client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
  bot_id TEXT REFERENCES bots(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  conversations INT DEFAULT 0,
  resolved INT DEFAULT 0,
  UNIQUE(client_id, bot_id, date)
);

-- Indexes for performance
CREATE INDEX idx_workspaces_client ON workspaces(client_id);
CREATE INDEX idx_bots_workspace ON bots(workspace_id);
CREATE INDEX idx_bot_sessions_time ON bot_sessions(start_time);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_daily_metrics_date ON daily_metrics(date);
```

---

## 7. API Endpoints Summary

| Endpoint | Method | Description | Returns |
|----------|--------|-------------|---------|
| `/auth/login` | POST | Client login | Session + client data |
| `/clients` | GET | List all clients | Client[] (for dropdown) |
| `/clients/:id` | GET | Get single client | Client with palette |
| `/workspaces?clientId=` | GET | Workspaces for client | Workspace[] with usage |
| `/bots?clientId=` | GET | All bots for client | Bot[] with metrics |
| `/bots?workspaceId=` | GET | Bots in workspace | Bot[] |
| `/analytics/sessions?clientId=` | GET | Bot sessions | BotSession[] |
| `/analytics/daily?clientId=` | GET | Daily metrics | UsageData[] |
| `/analytics/intents?clientId=` | GET | Top intents | IntentData[] |
| `/conversations?clientId=` | GET | Conversations | Conversation[] |
| `/counters?clientId=` | GET | Summary counts | CounterSummary |

---

## Quick Reference: Required JSON Responses

### Minimum Viable Data for Each Feature

**1. Login:**
```json
{ "id": "c1", "name": "Jumbo", "email": "...", "palette": {...} }
```

**2. Workspaces:**
```json
{ "id": "ws1", "clientId": "c1", "name": "...", "bundleLoads": { "limit": 1000, "used": 500, "remaining": 500 } }
```

**3. Bots:**
```json
{ "id": "m1", "workspaceId": "ws1", "name": "Liza", "status": "Live", "conversations": 100 }
```

**4. Analytics:**
```json
{ "session_id": "s1", "bot_id": "m1", "messages_sent": 5, "sentiment": "positive", "user_rating": 4 }
```

**5. Counters:**
```json
{ "bundleLoads": { "used": 500, "limit": 1000 }, "totalConversations": 1247 }
```

---

*This document serves as the specification for Supabase integration with the NotsoAI chatbot platform.*
