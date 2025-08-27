# Data Structure Documentation

This document explains how the chatbot platform data is organized and how to replace fake data with real data.

## Overview

The fake data has been separated into JSON files in the `public/data/` directory. This makes it easy to:
- Replace with real data from APIs
- Modify test data without touching code
- Understand the data structure clearly
- Transition to database-backed data

## Data Files

### 1. `public/data/clients.json`
Contains client/company information:
```json
{
  "id": "c1",
  "name": "Company Name",
  "slug": "company-slug",
  "palette": {
    "primary": "#FFD700",
    "primaryDark": "#E6C200", 
    "accent": "#111827"
  },
  "login": {
    "email": "demo@company.com",
    "password": "demo123"
  }
}
```

### 2. `public/data/bots.json`
Contains bot/mascot information:
```json
{
  "id": "m1",
  "clientId": "c1",
  "name": "Bot Name",
  "image": "https://avatar-url.com/bot.svg",
  "status": "Live|Paused|Needs finalization",
  "conversations": 482,
  "description": "Bot description",
  "metrics": {
    "responseTime": 1.2,
    "resolutionRate": 82,
    "csat": 4.5
  }
}
```

### 3. `public/data/users.json`
Contains team member information:
```json
{
  "id": "1",
  "name": "User Name",
  "email": "user@company.com",
  "role": "admin|manager|agent|viewer",
  "status": "active|inactive|pending",
  "avatar": "https://avatar-url.com/user.svg",
  "lastActive": "2 minutes ago",
  "conversationsHandled": 1247,
  "joinedDate": "2023-01-15",
  "phone": "+1 (555) 123-4567",
  "clientId": "c1"
}
```

### 4. `public/data/metrics.json`
Contains time-series and analytics data:
```json
{
  "usageByDay": {
    "c1": [
      { "date": "2025-08-01", "conversations": 120, "resolved": 96 }
    ]
  },
  "topIntents": {
    "c1": [
      { "intent": "Opening hours", "count": 210 }
    ]
  },
  "csat": {
    "c1": 4.6
  }
}
```

## Data Service (`src/lib/dataService.ts`)

Provides functions to load and query data:

### Loading Functions
- `loadClients()` - Load all clients
- `loadBots()` - Load all bots
- `loadUsers()` - Load all users  
- `loadMetrics()` - Load all metrics

### Query Functions
- `getClientById(id)` - Get specific client
- `getBotsByClientId(clientId)` - Get bots for a client
- `getUsersByClientId(clientId)` - Get users for a client
- `getClientMetrics(clientId)` - Get metrics for a client

### Legacy Compatibility
- `getClientsWithBots()` - Returns the old nested structure for backward compatibility

## Migration Path

### Phase 1: JSON Files (Current)
✅ Data separated into JSON files
✅ Data service layer created
✅ Pages updated to use async loading

### Phase 2: API Integration (Next)
1. Replace JSON file URLs with API endpoints in `dataService.ts`:
```typescript
// Instead of:
const response = await fetch('/data/clients.json');

// Use:
const response = await fetch('/api/clients');
```

2. Add API route handlers in `src/app/api/`:
```typescript
// src/app/api/clients/route.ts
export async function GET() {
  const clients = await db.clients.findMany();
  return Response.json(clients);
}
```

### Phase 3: Database Integration (Future)
1. Set up database (Prisma + PostgreSQL)
2. Create database schema matching JSON structure
3. Update API routes to query database
4. Add authentication and authorization

## Usage Examples

### Using in Components
```typescript
import { getUsersByClientId, type User } from '@/lib/dataService';

function UsersPage({ params }) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function loadUsers() {
      const clientUsers = await getUsersByClientId(params.clientId);
      setUsers(clientUsers);
    }
    loadUsers();
  }, [params.clientId]);

  // ... rest of component
}
```

### Replacing with Real Data
To connect to real data, simply:

1. **Update `dataService.ts`** to point to your API endpoints
2. **Keep the same return types** - components will work unchanged
3. **Add error handling** for network failures
4. **Add caching** if needed for performance

## Benefits

- ✅ **Easy to understand** - Clear separation of data and logic
- ✅ **Easy to modify** - Change data without touching code
- ✅ **Easy to replace** - Swap JSON files for API calls
- ✅ **Type safe** - Full TypeScript support
- ✅ **Backward compatible** - Existing components work unchanged
- ✅ **Future proof** - Ready for real backend integration