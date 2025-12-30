-- Preserve custom overrides on plan change: only replace limits/fee when NULL or when equal to the old plan default.
-- Inserts still auto-fill from plan defaults when values are NULL/zero.

BEGIN;

CREATE OR REPLACE FUNCTION public.apply_plan_limits()
RETURNS trigger AS $$
DECLARE
  v_plan_changed BOOLEAN := (TG_OP = 'UPDATE' AND NEW.plan IS DISTINCT FROM OLD.plan);
  -- Defaults for old plan (only relevant on UPDATE)
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
  v_old_monthly_default NUMERIC := CASE WHEN TG_OP = 'UPDATE' THEN CASE OLD.plan
    WHEN 'starter' THEN 99
    WHEN 'basic' THEN 299
    WHEN 'premium' THEN 2499
    WHEN 'enterprise' THEN 0
    WHEN 'custom' THEN 0
    ELSE 0 END ELSE NULL END;
  -- Defaults for new plan (always used)
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
    WHEN 'basic' THEN 299
    WHEN 'premium' THEN 2499
    WHEN 'enterprise' THEN 0
    WHEN 'custom' THEN 0
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

  -- Monthly fee (apply default on plan change if it was default/NULL/0, otherwise keep override)
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

COMMIT;
