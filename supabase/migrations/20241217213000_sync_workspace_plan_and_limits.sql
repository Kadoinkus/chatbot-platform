-- Add plan/effective limits to workspaces for read-only visibility, synced from subscriptions
BEGIN;

-- 0) Drop legacy workspace triggers/functions that reference removed billing fields
DROP TRIGGER IF EXISTS trg_apply_plan_limits_ins ON public.workspaces;
DROP TRIGGER IF EXISTS trg_apply_plan_limits_upd ON public.workspaces;
DROP TRIGGER IF EXISTS trg_ensure_billing_dates ON public.workspaces;
DROP TRIGGER IF EXISTS tr_initialize_workspace_reset_date ON public.workspaces;
DROP FUNCTION IF EXISTS public.apply_plan_limits();
DROP FUNCTION IF EXISTS public.ensure_workspace_billing_dates();
DROP FUNCTION IF EXISTS public.initialize_workspace_reset_date();

-- 1) Add columns on workspaces (source of truth remains subscriptions)
ALTER TABLE public.workspaces
  ADD COLUMN IF NOT EXISTS plan_slug TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT,
  ADD COLUMN IF NOT EXISTS effective_bundle_limit NUMERIC,
  ADD COLUMN IF NOT EXISTS effective_conversations_limit NUMERIC,
  ADD COLUMN IF NOT EXISTS effective_messages_limit NUMERIC,
  ADD COLUMN IF NOT EXISTS next_usage_reset_date DATE,
  ADD COLUMN IF NOT EXISTS next_billing_date DATE;

-- 2) Trigger function to sync from subscriptions -> workspaces
CREATE OR REPLACE FUNCTION public.sync_workspace_plan_limits()
RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    UPDATE public.workspaces w
    SET plan_slug = NULL,
        effective_bundle_limit = NULL,
        effective_conversations_limit = NULL,
        effective_messages_limit = NULL
    WHERE w.slug = OLD.workspace_slug;
    RETURN OLD;
  ELSE
    UPDATE public.workspaces w
    SET plan_slug = NEW.plan_slug,
        subscription_status = NEW.status,
        effective_bundle_limit = NEW.effective_bundle_limit,
        effective_conversations_limit = NEW.effective_conversations_limit,
        effective_messages_limit = NEW.effective_messages_limit,
        next_usage_reset_date = NEW.next_usage_reset_date,
        next_billing_date = NEW.next_billing_date
    WHERE w.slug = NEW.workspace_slug;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_subscriptions_sync_workspace_plan_limits ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_sync_workspace_plan_limits
  AFTER INSERT OR UPDATE OR DELETE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_workspace_plan_limits();

-- 3) Backfill from existing subscriptions
UPDATE public.workspaces w
SET
  plan_slug = s.plan_slug,
  subscription_status = s.status,
  effective_bundle_limit = s.effective_bundle_limit,
  effective_conversations_limit = s.effective_conversations_limit,
  effective_messages_limit = s.effective_messages_limit,
  next_usage_reset_date = s.next_usage_reset_date,
  next_billing_date = s.next_billing_date
FROM public.subscriptions s
WHERE s.workspace_slug = w.slug;

COMMIT;
