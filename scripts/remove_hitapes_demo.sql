-- ============================================================================
-- REMOVE HITAPES DEMO DATA
-- ============================================================================
-- Removes all hitapesDemo client data including:
-- - chat_session_analyses
-- - chat_messages
-- - chat_sessions
-- - credit_transactions
-- - usage_resets
-- - usage_history
-- - workspace_members
-- - mascots
-- - workspaces
-- - users (hitapesDemo users only)
-- - client
--
-- WARNING: This is destructive. Review before running.
-- ============================================================================

BEGIN;

-- ============================================================================
-- GUARD: Check that hitapesDemo exists before proceeding
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM clients WHERE slug = 'hitapesDemo') THEN
    RAISE EXCEPTION 'hitapesDemo client not found. Aborting to prevent accidental execution.';
  END IF;
END $$;

-- ============================================================================
-- 1. DELETE chat_session_analyses (for hitapesDemo sessions)
-- ============================================================================
DELETE FROM chat_session_analyses
WHERE session_id IN (
  SELECT id FROM chat_sessions WHERE client_slug = 'hitapesDemo'
);

-- ============================================================================
-- 2. DELETE chat_messages (for hitapesDemo sessions)
-- ============================================================================
DELETE FROM chat_messages
WHERE session_id IN (
  SELECT id FROM chat_sessions WHERE client_slug = 'hitapesDemo'
);

-- ============================================================================
-- 3. DELETE chat_sessions
-- ============================================================================
DELETE FROM chat_sessions
WHERE client_slug = 'hitapesDemo';

-- ============================================================================
-- 4. DELETE credit_transactions (for hitapesDemo workspaces)
-- ============================================================================
DELETE FROM credit_transactions
WHERE workspace_slug LIKE 'hitapesDemo%';

-- ============================================================================
-- 5. DELETE usage_resets (for hitapesDemo workspaces)
-- ============================================================================
DELETE FROM usage_resets
WHERE workspace_slug LIKE 'hitapesDemo%';

-- ============================================================================
-- 6. DELETE usage_history (for hitapesDemo workspaces)
-- ============================================================================
DELETE FROM usage_history
WHERE workspace_slug LIKE 'hitapesDemo%';

-- ============================================================================
-- 7. DELETE workspace_members
-- ============================================================================
DELETE FROM workspace_members
WHERE workspace_slug LIKE 'hitapesDemo%';

-- ============================================================================
-- 8. DELETE mascots
-- ============================================================================
DELETE FROM mascots
WHERE client_slug = 'hitapesDemo';

-- ============================================================================
-- 9. DELETE workspaces
-- ============================================================================
DELETE FROM workspaces
WHERE client_slug = 'hitapesDemo';

-- ============================================================================
-- 10. DELETE users (hitapesDemo specific users)
-- ============================================================================
DELETE FROM users
WHERE client_slug = 'hitapesDemo';

-- ============================================================================
-- 11. DELETE client
-- ============================================================================
DELETE FROM clients
WHERE slug = 'hitapesDemo';

COMMIT;

-- ============================================================================
-- VERIFY DELETION
-- ============================================================================
-- Run these queries to verify:
--
-- SELECT * FROM clients WHERE slug = 'hitapesDemo';
-- SELECT * FROM workspaces WHERE client_slug = 'hitapesDemo';
-- SELECT * FROM mascots WHERE client_slug = 'hitapesDemo';
-- SELECT * FROM users WHERE client_slug = 'hitapesDemo';
-- SELECT * FROM chat_sessions WHERE client_slug = 'hitapesDemo';
-- ============================================================================
