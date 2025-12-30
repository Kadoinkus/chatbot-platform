-- Drop legacy billing/limit/overage/cadence columns from workspaces now that subscriptions/plan hold billing
BEGIN;

-- Remove triggers/function that depend on workspace billing columns
DROP TRIGGER IF EXISTS trg_apply_plan_limits_ins ON public.workspaces;
DROP TRIGGER IF EXISTS trg_apply_plan_limits_upd ON public.workspaces;
DROP FUNCTION IF EXISTS public.apply_plan_limits();

-- Drop billing/limit/overage/cadence columns from workspaces
ALTER TABLE public.workspaces
  DROP COLUMN IF EXISTS plan,
  DROP COLUMN IF EXISTS status,
  DROP COLUMN IF EXISTS monthly_fee,
  DROP COLUMN IF EXISTS billing_cycle,
  DROP COLUMN IF EXISTS usage_reset_interval,
  DROP COLUMN IF EXISTS billing_reset_day,
  DROP COLUMN IF EXISTS subscription_start_date,
  DROP COLUMN IF EXISTS next_billing_date,
  DROP COLUMN IF EXISTS next_usage_reset_date,
  DROP COLUMN IF EXISTS bundle_loads_limit,
  DROP COLUMN IF EXISTS messages_limit,
  DROP COLUMN IF EXISTS sessions_limit,
  DROP COLUMN IF EXISTS wallet_credits,
  DROP COLUMN IF EXISTS overage_rate_bundle_loads,
  DROP COLUMN IF EXISTS overage_rate_messages,
  DROP COLUMN IF EXISTS overage_rate_sessions;

COMMIT;
