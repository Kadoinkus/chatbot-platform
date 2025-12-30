-- Align api_calls_limit with messages_limit (1:1) per plan and update apply_plan_limits().

BEGIN;

-- Refresh apply_plan_limits() to emit the new API limits (matching messages).
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

  -- Messages (sessions * 5)
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

  -- API calls: align with messages
  IF NEW.api_calls_limit IS NULL THEN
    NEW.api_calls_limit := CASE NEW.plan
      WHEN 'starter' THEN 1000
      WHEN 'basic' THEN 15000
      WHEN 'premium' THEN 30000
      WHEN 'enterprise' THEN 50000
      WHEN 'custom' THEN 1000
      ELSE 1000
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Backfill existing rows that still have old API defaults to the new aligned values.
UPDATE public.workspaces
SET api_calls_limit = CASE plan
  WHEN 'starter' THEN 1000
  WHEN 'basic' THEN 15000
  WHEN 'premium' THEN 30000
  WHEN 'enterprise' THEN 50000
  WHEN 'custom' THEN 1000
  ELSE api_calls_limit
END
WHERE (plan = 'starter' AND api_calls_limit = 50000)
   OR (plan = 'basic' AND api_calls_limit = 250000)
   OR (plan = 'premium' AND api_calls_limit = 1000000)
   OR (plan = 'enterprise' AND api_calls_limit = 5000000)
   OR (plan = 'custom' AND api_calls_limit = 50000);

COMMIT;
