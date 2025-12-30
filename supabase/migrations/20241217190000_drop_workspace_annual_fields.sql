-- Drop legacy annual billing fields from workspaces
BEGIN;

ALTER TABLE public.workspaces
  DROP COLUMN IF EXISTS annual_discount_pct,
  DROP COLUMN IF EXISTS is_annual_prepaid;

COMMIT;
