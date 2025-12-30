-- Update Enterprise monthly fee default to 2499 and refresh apply_plan_limits with current defaults.
-- Preserves overrides: only replaces values that are NULL or match old defaults.

BEGIN;

CREATE OR REPLACE FUNCTION public.apply_plan_limits()
RETURNS trigger AS $$
DECLARE
  v_plan_changed BOOLEAN := (TG_OP = 'UPDATE' AND NEW.plan IS DISTINCT FROM OLD.plan);
  -- Defaults for old plan (to detect overrides on plan change)
  v_old_bundle_default INTEGER := CASE WHEN TG_OP = 'UPDATE' THEN CASE OLD.plan
    WHEN 'starter' THEN 100
    WHEN 'basic' THEN 1000
    WHEN 'premium' THEN 2000
    WHEN 'enterprise' THEN 5000
    WHEN 'custom' THEN 100
    ELSE 100 END ELSE NULL END;
  v_old_sessions_default INTEGER := CASE WHEN TG_OP = 'UPDATE' THEN CASE OLD.plan
    WHEN 'starter' THEN 200
    WHEN 'basic' THEN 3000
    WHEN 'premium' THEN 6000
    WHEN 'enterprise' THEN 10000
    WHEN 'custom' THEN 200
    ELSE 200 END ELSE NULL END;
  v_old_messages_default INTEGER := CASE WHEN TG_OP = 'UPDATE' THEN CASE OLD.plan
    WHEN 'starter' THEN 1000
    WHEN 'basic' THEN 15000
    WHEN 'premium' THEN 30000
    WHEN 'enterprise' THEN 50000
    WHEN 'custom' THEN 1000
    ELSE 1000 END ELSE NULL END;
  v_old_api_default INTEGER := CASE WHEN TG_OP = 'UPDATE' THEN CASE OLD.plan
    WHEN 'starter' THEN 1000
    WHEN 'basic' THEN 15000
    WHEN 'premium' THEN 30000
    WHEN 'enterprise' THEN 50000
    WHEN 'custom' THEN 1000
    ELSE 1000 END ELSE NULL END;
  -- Old monthly defaults (Enterprise previously 0)
  v_old_monthly_default NUMERIC := CASE WHEN TG_OP = 'UPDATE' THEN CASE OLD.plan
    WHEN 'starter' THEN 99
    WHEN 'basic' THEN 399
    WHEN 'premium' THEN 699
    WHEN 'enterprise' THEN 0
    WHEN 'custom' THEN 2499
    ELSE 0 END ELSE NULL END;
  -- New defaults (Enterprise now 2499)
  v_new_bundle_default INTEGER := CASE NEW.plan
    WHEN 'starter' THEN 100
    WHEN 'basic' THEN 1000
    WHEN 'premium' THEN 2000
    WHEN 'enterprise' THEN 5000
    WHEN 'custom' THEN 100
    ELSE 100 END;
  v_new_sessions_default INTEGER := CASE NEW.plan
    WHEN 'starter' THEN 200
    WHEN 'basic' THEN 3000
    WHEN 'premium' THEN 6000
    WHEN 'enterprise' THEN 10000
    WHEN 'custom' THEN 200
    ELSE 200 END;
  v_new_messages_default INTEGER := CASE NEW.plan
    WHEN 'starter' THEN 1000
    WHEN 'basic' THEN 15000
    WHEN 'premium' THEN 30000
    WHEN 'enterprise' THEN 50000
    WHEN 'custom' THEN 1000
    ELSE 1000 END;
  v_new_api_default INTEGER := CASE NEW.plan
    WHEN 'starter' THEN 1000
    WHEN 'basic' THEN 15000
    WHEN 'premium' THEN 30000
    WHEN 'enterprise' THEN 50000
    WHEN 'custom' THEN 1000
    ELSE 1000 END;
  v_new_monthly_default NUMERIC := CASE NEW.plan
    WHEN 'starter' THEN 99
    WHEN 'basic' THEN 399
    WHEN 'premium' THEN 699
    WHEN 'enterprise' THEN 2499
    WHEN 'custom' THEN 2499
    ELSE 0 END;
BEGIN
  -- Bundle loads
  IF TG_OP = 'INSERT' THEN
    IF NEW.bundle_loads_limit IS NULL THEN
      NEW.bundle_loads_limit := v_new_bundle_default;
    END IF;
  ELSE
    IF v_plan_changed THEN
      IF NEW.bundle_loads_limit IS NULL OR OLD.bundle_loads_limit = v_old_bundle_default THEN
        NEW.bundle_loads_limit := v_new_bundle_default;
      END IF;
    ELSIF NEW.bundle_loads_limit IS NULL THEN
      NEW.bundle_loads_limit := v_new_bundle_default;
    END IF;
  END IF;

  -- Sessions
  IF TG_OP = 'INSERT' THEN
    IF NEW.sessions_limit IS NULL THEN
      NEW.sessions_limit := v_new_sessions_default;
    END IF;
  ELSE
    IF v_plan_changed THEN
      IF NEW.sessions_limit IS NULL OR OLD.sessions_limit = v_old_sessions_default THEN
        NEW.sessions_limit := v_new_sessions_default;
      END IF;
    ELSIF NEW.sessions_limit IS NULL THEN
      NEW.sessions_limit := v_new_sessions_default;
    END IF;
  END IF;

  -- Messages (sessions * 5)
  IF TG_OP = 'INSERT' THEN
    IF NEW.messages_limit IS NULL THEN
      NEW.messages_limit := v_new_messages_default;
    END IF;
  ELSE
    IF v_plan_changed THEN
      IF NEW.messages_limit IS NULL OR OLD.messages_limit = v_old_messages_default THEN
        NEW.messages_limit := v_new_messages_default;
      END IF;
    ELSIF NEW.messages_limit IS NULL THEN
      NEW.messages_limit := v_new_messages_default;
    END IF;
  END IF;

  -- API calls (aligned with messages)
  IF TG_OP = 'INSERT' THEN
    IF NEW.api_calls_limit IS NULL THEN
      NEW.api_calls_limit := v_new_api_default;
    END IF;
  ELSE
    IF v_plan_changed THEN
      IF NEW.api_calls_limit IS NULL OR OLD.api_calls_limit = v_old_api_default THEN
        NEW.api_calls_limit := v_new_api_default;
      END IF;
    ELSIF NEW.api_calls_limit IS NULL THEN
      NEW.api_calls_limit := v_new_api_default;
    END IF;
  END IF;

  -- Monthly fee (preserve overrides; update when NULL/0 or equal to old default)
  IF TG_OP = 'INSERT' THEN
    IF NEW.monthly_fee IS NULL OR NEW.monthly_fee = 0 THEN
      NEW.monthly_fee := v_new_monthly_default;
    END IF;
  ELSE
    IF v_plan_changed THEN
      IF NEW.monthly_fee IS NULL OR NEW.monthly_fee = 0 OR OLD.monthly_fee = v_old_monthly_default THEN
        NEW.monthly_fee := v_new_monthly_default;
      END IF;
    ELSIF NEW.monthly_fee IS NULL THEN
      NEW.monthly_fee := v_new_monthly_default;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Backfill Enterprise rows still at old defaults to the new 2499 monthly fee
UPDATE public.workspaces
SET monthly_fee = 2499
WHERE plan = 'enterprise'
  AND monthly_fee IN (0, 9, 99, 299, 399, 699);

COMMIT;
