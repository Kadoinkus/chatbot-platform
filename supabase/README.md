# Supabase Database Management

This folder contains SQL migrations that document and manage the database schema.

## Quick Start

### 1. First-Time Setup (One Time)

```bash
# Link to your Supabase project
pnpm db:link

# When prompted, enter your project reference (from Supabase dashboard URL)
# Example: if URL is https://supabase.com/dashboard/project/abc123xyz
# Your project ref is: abc123xyz
```

### 2. Making Database Changes

Instead of using the Supabase SQL Editor, create a migration file:

```bash
# Create a new migration file
# Example: supabase/migrations/001_add_user_preferences.sql
```

Write your SQL in the file, then push to database:

```bash
pnpm db:push
```

## Available Commands

| Command | What it does |
|---------|--------------|
| `pnpm db:link` | Connect to your Supabase project |
| `pnpm db:push` | Apply migrations to database |
| `pnpm db:pull` | Download current schema from database |
| `pnpm db:diff` | Generate migration from database changes |
| `pnpm db:status` | Show which migrations have been applied |

## Migration Naming

Use numbered prefixes to ensure order:

```
supabase/migrations/
├── 000_baseline_schema.sql      <- Current schema (already applied)
├── 001_add_feature_x.sql        <- Next change
├── 002_update_feature_y.sql     <- After that
└── ...
```

## File Structure

```
supabase/
├── config.toml           <- Supabase CLI configuration
├── README.md             <- This file
└── migrations/
    └── 000_baseline_schema.sql  <- Documents current schema
```

## Important Notes

- **000_baseline_schema.sql** documents the existing schema. Do NOT run it on your current database (it's already applied).
- Always create a new numbered file for new changes.
- The `mascot_slug` field is IMMUTABLE - it cannot be changed after creation.
- Migrations are tracked by Supabase - each runs only once.

## Example: Adding a New Column

1. Create file: `supabase/migrations/001_add_mascot_priority.sql`

```sql
-- Add priority field to mascots
ALTER TABLE mascots
ADD COLUMN priority INTEGER DEFAULT 0;

-- Add index for sorting
CREATE INDEX idx_mascots_priority ON mascots(priority);
```

2. Apply it:

```bash
pnpm db:push
```

Done! The change is applied AND documented.
