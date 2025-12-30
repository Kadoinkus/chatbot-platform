-- Move wallet credits to subscriptions (no drop of workspace column yet)
BEGIN;

-- Add wallet_credits to subscriptions
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS wallet_credits NUMERIC DEFAULT 0;

-- Backfill from workspaces (match on workspace_slug)
UPDATE public.subscriptions s
SET wallet_credits = w.wallet_credits
FROM public.workspaces w
WHERE w.slug = s.workspace_slug
  AND s.wallet_credits = 0;

COMMIT;
