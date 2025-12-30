-- Enforce NOT NULL on workspace limit columns (after plan-based auto-fill is in place).
-- This keeps the table clean (no NULLs stored) while still relying on apply_plan_limits()
-- to populate values when inserts/updates provide NULLs.

BEGIN;

-- Ensure existing NULLs are populated via the trigger before setting NOT NULL.
UPDATE public.workspaces
SET plan = plan
WHERE bundle_loads_limit IS NULL
   OR messages_limit IS NULL
   OR api_calls_limit IS NULL
   OR sessions_limit IS NULL;

-- Enforce NOT NULL (no defaults; trigger/function still sets values when NULL is passed).
ALTER TABLE public.workspaces
  ALTER COLUMN bundle_loads_limit SET NOT NULL,
  ALTER COLUMN messages_limit SET NOT NULL,
  ALTER COLUMN api_calls_limit SET NOT NULL,
  ALTER COLUMN sessions_limit SET NOT NULL;

COMMIT;
