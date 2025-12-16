-- ============================================================================
-- Migration: Add Superadmin Support
--
-- Adds 'superadmin' role to users table and accessible_client_slugs column
-- for multi-client access control.
--
-- accessible_client_slugs semantics:
--   NULL = access to ALL clients (full superadmin)
--   [] (empty array) = NO access (block login with error)
--   ['slug1', 'slug2'] = access to specific clients only
-- ============================================================================

BEGIN;

-- 1. Drop existing role constraint if it exists
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- 2. Add updated role constraint with 'superadmin' option
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer', 'superadmin'));

-- 3. Add accessible_client_slugs column for superadmin multi-client access
-- Only relevant when role = 'superadmin'
ALTER TABLE users ADD COLUMN IF NOT EXISTS accessible_client_slugs TEXT[];

-- 4. Add comment explaining the column
COMMENT ON COLUMN users.accessible_client_slugs IS
  'For superadmins: NULL=all clients, []=no access, array=specific clients only';

-- 5. Create index for efficient lookup of users by accessible clients
CREATE INDEX IF NOT EXISTS idx_users_accessible_clients
  ON users USING GIN (accessible_client_slugs)
  WHERE accessible_client_slugs IS NOT NULL;

-- 6. Set initial superadmin (max@notso.ai has access to all clients)
UPDATE users
SET role = 'superadmin', accessible_client_slugs = NULL
WHERE email = 'max@notso.ai';

COMMIT;
