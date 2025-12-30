-- Update plan-based defaults: messages_limit now follows sessions_limit * 5.
-- Also refresh the apply_plan_limits() helper to return the new values.

BEGIN;

-- Refresh the function to emit the new message defaults (other limits unchanged).
CREATE OR REPLACE FUNCTION public.apply_plan_limits()
RETURNS trigger AS $$
BEGIN
  -- Bundle loads (unchanged)
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

  -- Sessions (unchanged)
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

  -- Messages: now sessions_limit * 5
  IF NEW.messages_limit IS NULL THEN
    NEW.messages_limit := CASE NEW.plan
      WHEN 'starter' THEN 1000
      WHEN 'basic' THEN 15000
      WHEN 'premium' THEN 30000
      WHEN 'enterprise' THEN 50000
      WHEN 'custom' THEN 1000
      ELSE 1000
    END;
  END IF;

  -- API calls (unchanged for now)
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

-- Update existing rows that still have the old message defaults (plan-specific)
UPDATE public.workspaces
SET messages_limit = CASE plan
  WHEN 'starter' THEN 1000
  WHEN 'basic' THEN 15000
  WHEN 'premium' THEN 30000
  WHEN 'enterprise' THEN 50000
  WHEN 'custom' THEN 1000
  ELSE messages_limit
END
WHERE (plan = 'starter' AND messages_limit = 25000)
   OR (plan = 'basic' AND messages_limit = 100000)
   OR (plan = 'premium' AND messages_limit = 500000)
   OR (plan = 'enterprise' AND messages_limit = 2000000)
   OR (plan = 'custom' AND messages_limit = 25000);

COMMIT;
