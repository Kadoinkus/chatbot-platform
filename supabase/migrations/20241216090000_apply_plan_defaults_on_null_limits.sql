-- Auto-apply plan limits when limit columns are NULL, while allowing explicit overrides.
-- This migration:
-- 1) Makes workspace limit columns nullable and removes their defaults so inserts can pass NULL.
-- 2) Adds a trigger to fill NULL limits from the selected plan (using current PLAN_CONFIG values).

BEGIN;

-- Step 1: Allow NULLs and drop defaults on limit columns so NULL can mean "use plan defaults".
ALTER TABLE public.workspaces
  ALTER COLUMN bundle_loads_limit DROP DEFAULT,
  ALTER COLUMN messages_limit DROP DEFAULT,
  ALTER COLUMN api_calls_limit DROP DEFAULT,
  ALTER COLUMN sessions_limit DROP DEFAULT,
  ALTER COLUMN bundle_loads_limit DROP NOT NULL,
  ALTER COLUMN messages_limit DROP NOT NULL,
  ALTER COLUMN api_calls_limit DROP NOT NULL,
  ALTER COLUMN sessions_limit DROP NOT NULL;

-- Step 2: Function that applies plan defaults to any NULL limits (explicit values are respected).
CREATE OR REPLACE FUNCTION public.apply_plan_limits()
RETURNS trigger AS $$
BEGIN
  -- Bundle loads
  IF NEW.bundle_loads_limit IS NULL THEN
    NEW.bundle_loads_limit := CASE NEW.plan
      WHEN 'starter' THEN 100
      WHEN 'basic' THEN 1000
      WHEN 'premium' THEN 2000
      WHEN 'enterprise' THEN 5000
      WHEN 'custom' THEN 100   -- Defaults align with starter-like custom in app config
      ELSE 100
    END;
  END IF;

  -- Sessions
  IF NEW.sessions_limit IS NULL THEN
    NEW.sessions_limit := CASE NEW.plan
      WHEN 'starter' THEN 200
      WHEN 'basic' THEN 3000
      WHEN 'premium' THEN 6000
      WHEN 'enterprise' THEN 10000
      WHEN 'custom' THEN 200
      ELSE 200
    END;
  END IF;

  -- Messages
  IF NEW.messages_limit IS NULL THEN
    NEW.messages_limit := CASE NEW.plan
      WHEN 'starter' THEN 25000
      WHEN 'basic' THEN 100000
      WHEN 'premium' THEN 500000
      WHEN 'enterprise' THEN 2000000
      WHEN 'custom' THEN 25000
      ELSE 25000
    END;
  END IF;

  -- API calls
  IF NEW.api_calls_limit IS NULL THEN
    NEW.api_calls_limit := CASE NEW.plan
      WHEN 'starter' THEN 50000
      WHEN 'basic' THEN 250000
      WHEN 'premium' THEN 1000000
      WHEN 'enterprise' THEN 5000000
      WHEN 'custom' THEN 50000
      ELSE 50000
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Triggers to apply the defaults on insert and on plan changes (or when limits are reset to NULL).
DROP TRIGGER IF EXISTS trg_apply_plan_limits_ins ON public.workspaces;
DROP TRIGGER IF EXISTS trg_apply_plan_limits_upd ON public.workspaces;

CREATE TRIGGER trg_apply_plan_limits_ins
  BEFORE INSERT ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.apply_plan_limits();

CREATE TRIGGER trg_apply_plan_limits_upd
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW
  WHEN (NEW.plan IS DISTINCT FROM OLD.plan
     OR NEW.bundle_loads_limit IS NULL
     OR NEW.messages_limit IS NULL
     OR NEW.api_calls_limit IS NULL
     OR NEW.sessions_limit IS NULL)
  EXECUTE FUNCTION public.apply_plan_limits();

-- Optional: If you want existing rows that still have the old defaults to pick up plan-based values,
-- you can uncomment and run the following updates (adjust the predicates if you need finer control):
-- UPDATE public.workspaces SET bundle_loads_limit = NULL WHERE bundle_loads_limit = 1000;
-- UPDATE public.workspaces SET sessions_limit      = NULL WHERE sessions_limit      = 5000;
-- UPDATE public.workspaces SET messages_limit      = NULL WHERE messages_limit      = 25000;
-- UPDATE public.workspaces SET api_calls_limit     = NULL WHERE api_calls_limit     = 50000;

COMMIT;
