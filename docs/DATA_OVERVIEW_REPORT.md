# Platform Data Overview Report

This report explains how the product uses data, page by page, with concise intros so non-technical stakeholders can see what powers each view. A compact mock JSON snapshot is included for quick reference (`docs/mock_data_snapshot.json`).

---

## Data domains at a glance
- Clients: who owns the account, brand slug, login credentials.
- Workspaces: containers for bots with plan, usage, billing cycle, and credit balances.
- Bots: assistants linked to a workspace, with status, imagery, descriptions, and performance metrics.
- People: users/team members with roles, status, and activity.
- Activity: conversations, messages, live sessions, and bot sessions (analytics).
- Billing & plans: subscription tier, shared usage pools, wallet credits, invoices, marketplace purchases.
- Marketplace: catalog of mascot templates and add-ons.

---

## Page-by-page data overview

### Login
Short intro: Lets a user pick a demo account and sign in.  
Data used: client list (`id`, `name`, `slug`, `login.email/password`).

### Client home (Dashboard)
Short intro: High-level overview of all workspaces for the selected client.  
Data used: client; all workspaces (`plan`, `status`, usage blocks for bundle loads/messages/API calls, wallet credits, billing cycle/dates); bots per workspace (names, images, status counts).

### All bots
Short intro: Cross-workspace bot catalog with search/filter.  
Data used: client; workspaces; bots with workspace name (`id`, `workspaceId`, `name`, `description`, `status`, `image`).

### Workspace detail
Short intro: Deep dive into one workspace—its bots, usage, billing details, and settings.  
Data used: workspace (`plan`, `status`, usage numbers, overage rates, wallet credits, billing cycle/dates); bots under the workspace.

### Client analytics
Short intro: Performance across all bots/workspaces for a client.  
Data used: bot sessions (`bot_id`, `client_id`, timestamps, messages_sent, sentiment, escalation, avg_response_time, tokens, tokens_eur, category, questions[], user_rating, confidence, resolution/completion, user_type, channel/device/browser, automation_saving, human_cost_equivalent); workspaces and bots for filtering.

### Bot analytics
Short intro: Performance of a single bot.  
Data used: bot; client; bot sessions filtered by date; bot metrics (`usageByDay`, `topIntents`).

### Billing & workspaces
Short intro: Workspace-level costs, usage warnings, and plan pricing.  
Data used: workspaces (usage, overage rates, wallet credits, plan name/price); bots per workspace (for mascot pricing); aggregated monthly total.

### Plans
Short intro: Compare plan tiers and assign to a workspace.  
Data used: plan catalog (starter/basic/growth/premium/enterprise); list of workspaces to target.

### Marketplace
Short intro: Catalog of 3D mascot templates to add to cart.  
Data used: template list (`id`, `name`, `appearance`, `studio`, `description`, `image`, `rating`, `reviews`, `animations`, `expressions`, `features[]`, `price`, `popular`, `new`).

### Checkout
Short intro: Reviews cart items and selects billing/payment method.  
Data used: cart items (`id`, `name`, `description`, `image`, `price`, `quantity`, `category`); selected billing/payment method; client for routing.

### Conversations
Short intro: Conversation history with filters by bot/status/date.  
Data used: conversations (`id`, `botId`, `clientId`, `userId`, `userName`, `lastMessage`, `timestamp`, `status`, `duration`, `messages`, `satisfaction`, `tags[]`); bots for filters; messages for drill-down.

### Users
Short intro: User directory for the client.  
Data used: users (`id`, `name`, `email`, `role`, `status`, `avatar`, `phone?`, `lastActive`, `conversationsHandled`, `joinedDate`, `clientId`).

### Team
Short intro: Team management with roles and permissions.  
Data used: similar to Users plus `permissions[]`, `status` (active/invited/inactive), `role`, `lastActive`, `joinedDate`.

### Settings (client-level)
Short intro: Company-wide preferences (general, notifications, security, billing, API/webhooks, data).  
Data used: client info; notification toggles; security rules (2FA, session timeout, IP whitelist); billing email/cycle/payment method; API keys; webhook endpoints.

### Profile (user)
Short intro: Personal profile and notification/security preferences.  
Data used: current user info (name, email, phone, bio, avatar), client slug for derived email, notification and security preferences.

### Bot studio pages (Brain / Mascot / Settings / Support / Chat)
Short intro: Configure bot personality/knowledge, visual mascot, technical settings, support tickets, and chat preview.  
Data used: bot + client; brain config (personality sliders/presets, flows/nodes, knowledge items); mascot config (template, sub-template, options, owned packs); bot settings (API key, webhook URL, rate limits, business hours, security, data retention); support tickets (`id`, `subject`, `category`, `priority`, `status`, `created`, `lastUpdate`, `assignee`); chat messages (`id`, `sender`, `content`, `timestamp`, `status`, attachments?).

---

## Mock JSON snapshot

Use this as a quick mental model or to seed a small demo. Full file is in `docs/mock_data_snapshot.json`.

```json
{
  "clients": [
    {
      "id": "c1",
      "name": "Acme Corp",
      "slug": "acme",
      "login": { "email": "admin@acme.com", "password": "password123" },
      "defaultWorkspaceId": "w1"
    }
  ],
  "workspaces": [
    {
      "id": "w1",
      "clientId": "c1",
      "name": "Acme Support",
      "plan": "growth",
      "status": "active",
      "bundleLoads": { "limit": 5000, "used": 1800, "remaining": 3200 },
      "messages": { "limit": 100000, "used": 24000, "remaining": 76000 },
      "apiCalls": { "limit": 250000, "used": 40000, "remaining": 210000 },
      "walletCredits": 245.5,
      "overageRates": { "bundleLoads": 0.04, "messages": 0.0015, "apiCalls": 0.0001 },
      "billingCycle": "monthly",
      "nextBillingDate": "2025-09-01",
      "description": "Customer support bots"
    }
  ],
  "bots": [
    {
      "id": "b1",
      "clientId": "c1",
      "workspaceId": "w1",
      "name": "Acme Helper",
      "image": "/images/bots/acme.png",
      "status": "Live",
      "description": "Answers customer questions",
      "conversations": 1240,
      "metrics": { "responseTime": 1.8, "resolutionRate": 92, "csat": 4.6 }
    }
  ],
  "users": [
    {
      "id": "u1",
      "clientId": "c1",
      "name": "Jane Doe",
      "email": "jane@acme.com",
      "role": "admin",
      "status": "active",
      "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
      "lastActive": "2025-08-30T10:00:00Z",
      "conversationsHandled": 320,
      "joinedDate": "2024-10-01"
    }
  ],
  "metrics": {
    "usageByDay": {
      "c1": [
        { "date": "2025-08-28", "conversations": 140, "resolved": 128 },
        { "date": "2025-08-29", "conversations": 155, "resolved": 142 }
      ]
    },
    "botUsageByDay": {
      "b1": [
        { "date": "2025-08-28", "conversations": 90, "resolved": 82 },
        { "date": "2025-08-29", "conversations": 110, "resolved": 101 }
      ]
    },
    "topIntents": { "c1": [ { "intent": "shipping", "count": 320 }, { "intent": "returns", "count": 210 } ] },
    "botIntents": { "b1": [ { "intent": "shipping", "count": 140 }, { "intent": "returns", "count": 90 } ] },
    "csat": { "c1": 4.5 }
  },
  "conversations": [
    {
      "id": "conv1",
      "botId": "b1",
      "clientId": "c1",
      "userId": "user123",
      "userName": "John Smith",
      "status": "resolved",
      "preview": "Thanks for your help!",
      "startedAt": "2025-08-29T09:00:00Z",
      "messages": 8,
      "satisfaction": 5,
      "tags": ["shipping"]
    }
  ],
  "messages": [
    {
      "id": "m1",
      "conversationId": "conv1",
      "sender": "bot",
      "senderName": "Acme Helper",
      "content": "Hi John, how can I help?",
      "timestamp": "2025-08-29T09:00:05Z"
    }
  ],
  "bot_sessions": [
    {
      "session_id": "s1",
      "bot_id": "b1",
      "client_id": "c1",
      "start_time": "2025-08-29T09:00:00Z",
      "end_time": "2025-08-29T09:05:00Z",
      "ip_address": "203.0.113.1",
      "country": "NL",
      "language": "en",
      "messages_sent": 10,
      "sentiment": "positive",
      "escalated": "No",
      "avg_response_time": 1500,
      "tokens_eur": 0.08,
      "category": "shipping",
      "questions": ["Where is my order?"],
      "user_rating": 5,
      "intent_confidence": 0.91,
      "resolution_type": "self_service",
      "completion_status": "completed",
      "user_type": "returning",
      "channel": "webchat",
      "device_type": "desktop",
      "session_steps": 5,
      "goal_achieved": true,
      "automation_saving": 2.5,
      "human_cost_equivalent": 4.0
    }
  ]
}
```

Use this snapshot to sanity-check schemas and payloads when wiring Supabase or APIs; expand it as needed for broader test coverage.
