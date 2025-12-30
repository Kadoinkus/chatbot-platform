-- Add annual/prepaid billing flags and auto-apply monthly_fee from plan defaults.
-- Also reapply plan limits/fees on plan change or when null/zero, while allowing overrides.

BEGIN;

-- Add billing fields for annual/prepaid handling
ALTER TABLE public.workspaces
  ADD COLUMN IF NOT EXISTS is_annual_prepaid BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS annual_discount_pct NUMERIC NOT NULL DEFAULT 0;

-- Refresh apply_plan_limits to also set monthly_fee from plan defaults.
CREATE OR REPLACE FUNCTION public.apply_plan_limits()
RETURNS trigger AS $$
DECLARE
  v_plan_changed BOOLEAN := (TG_OP = 'UPDATE' AND NEW.plan IS DISTINCT FROM OLD.plan);
BEGIN
  -- Bundle loads
  IF v_plan_changed OR NEW.bundle_loads_limit IS NULL THEN
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
  IF v_plan_changed OR NEW.sessions_limit IS NULL THEN
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
  IF v_plan_changed OR NEW.messages_limit IS NULL THEN
    NEW.messages_limit := CASE NEW.plan
      WHEN 'starter' THEN 1000
      WHEN 'basic' THEN 15000
      WHEN 'premium' THEN 30000
      WHEN 'enterprise' THEN 50000
      WHEN 'custom' THEN 1000
      ELSE 1000
    END;
  END IF;

  -- API calls (aligned with messages)
  IF v_plan_changed OR NEW.api_calls_limit IS NULL THEN
    NEW.api_calls_limit := CASE NEW.plan
      WHEN 'starter' THEN 1000
      WHEN 'basic' THEN 15000
      WHEN 'premium' THEN 30000
      WHEN 'enterprise' THEN 50000
      WHEN 'custom' THEN 1000
      ELSE 1000
    END;
  END IF;

  -- Monthly fee (apply plan default when plan changes or fee is NULL/0)
  IF v_plan_changed OR NEW.monthly_fee IS NULL OR NEW.monthly_fee = 0 THEN
    NEW.monthly_fee := CASE NEW.plan
      WHEN 'starter' THEN 99
      WHEN 'basic' THEN 299
      WHEN 'premium' THEN 2499
      WHEN 'enterprise' THEN 0
      WHEN 'custom' THEN 0
      ELSE 0
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Backfill monthly_fee and limits where legacy defaults remain (non-overrides).
UPDATE public.workspaces
SET
  bundle_loads_limit = CASE plan
    WHEN 'starter' THEN 100
    WHEN 'basic' THEN 1000
    WHEN 'premium' THEN 2000
    WHEN 'enterprise' THEN 5000
    WHEN 'custom' THEN 100
    ELSE bundle_loads_limit
  END,
  sessions_limit = CASE plan
    WHEN 'starter' THEN 200
    WHEN 'basic' THEN 3000
    WHEN 'premium' THEN 6000
    WHEN 'enterprise' THEN 10000
    WHEN 'custom' THEN 200
    ELSE sessions_limit
  END,
  messages_limit = CASE plan
    WHEN 'starter' THEN 1000
    WHEN 'basic' THEN 15000
    WHEN 'premium' THEN 30000
    WHEN 'enterprise' THEN 50000
    WHEN 'custom' THEN 1000
    ELSE messages_limit
  END,
  api_calls_limit = CASE plan
    WHEN 'starter' THEN 1000
    WHEN 'basic' THEN 15000
    WHEN 'premium' THEN 30000
    WHEN 'enterprise' THEN 50000
    WHEN 'custom' THEN 1000
    ELSE api_calls_limit
  END,
  monthly_fee = CASE plan
    WHEN 'starter' THEN 99
    WHEN 'basic' THEN 299
    WHEN 'premium' THEN 2499
    WHEN 'enterprise' THEN 0
    WHEN 'custom' THEN 0
    ELSE monthly_fee
  END
WHERE bundle_loads_limit IN (1000, 5000, 25000, 100000, 1000000)
   OR sessions_limit IN (5000, 25000, 125000, 500000, 5000000)
   OR messages_limit IN (25000, 100000, 500000, 2000000, 10000000)
   OR api_calls_limit IN (50000, 250000, 1000000, 5000000, 50000000)
   OR monthly_fee = 0;

COMMIT;
