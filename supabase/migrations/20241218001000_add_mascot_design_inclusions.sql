-- Document included custom mascot designs and rig tiers per plan
BEGIN;

-- Add columns if they don't exist
ALTER TABLE public.billing_plans
  ADD COLUMN IF NOT EXISTS included_custom_mascot_designs INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS included_mascot_rig_tier TEXT,
  ADD COLUMN IF NOT EXISTS allowed_mascot_rig_catalogs TEXT[],
  ADD COLUMN IF NOT EXISTS included_custom_rig_count INT DEFAULT 0;

-- Starter/Basic: one design on basic rig catalog
UPDATE public.billing_plans
SET included_custom_mascot_designs = 1,
    included_mascot_rig_tier = 'basic_rig_catalog',
    allowed_mascot_rig_catalogs = ARRAY['basic'],
    included_custom_rig_count = 0
WHERE plan_slug IN ('starter', 'basic');

-- Premium: two designs on premium rig catalog
UPDATE public.billing_plans
SET included_custom_mascot_designs = 2,
    included_mascot_rig_tier = 'premium_rig_catalog',
    allowed_mascot_rig_catalogs = ARRAY['premium'],
    included_custom_rig_count = 0
WHERE plan_slug = 'premium';

-- Enterprise: bespoke rig and skin included
UPDATE public.billing_plans
SET included_custom_mascot_designs = 1,
    included_mascot_rig_tier = 'custom_rig_and_skin',
    allowed_mascot_rig_catalogs = ARRAY['basic','premium','custom'],
    included_custom_rig_count = 1
WHERE plan_slug = 'enterprise';

COMMIT;
