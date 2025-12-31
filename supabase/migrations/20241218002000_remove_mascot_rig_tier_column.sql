-- Simplify mascot rig fields: rely on allowed catalog list + counts
BEGIN;

ALTER TABLE public.billing_plans
  DROP COLUMN IF EXISTS included_mascot_rig_tier;

COMMIT;
