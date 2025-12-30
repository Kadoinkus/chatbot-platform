-- Remove API call fields from workspaces and the related trigger references
BEGIN;

-- Drop triggers that depend on api_calls_limit
DROP TRIGGER IF EXISTS trg_apply_plan_limits_ins ON public.workspaces;
DROP TRIGGER IF EXISTS trg_apply_plan_limits_upd ON public.workspaces;

-- Drop the function (will recreate without API fields)
DROP FUNCTION IF EXISTS public.apply_plan_limits();

-- Recreate apply_plan_limits without API call fields
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
      WHEN 'custom' THEN 100
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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the API call columns
ALTER TABLE public.workspaces
  DROP COLUMN IF EXISTS api_calls_limit,
  DROP COLUMN IF EXISTS api_calls_used,
  DROP COLUMN IF EXISTS overage_rate_api_calls;

-- Recreate triggers without API call references
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
     OR NEW.sessions_limit IS NULL)
  EXECUTE FUNCTION public.apply_plan_limits();

COMMIT;
