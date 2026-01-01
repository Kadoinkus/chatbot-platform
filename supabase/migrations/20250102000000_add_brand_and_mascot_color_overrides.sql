-- ============================================================================
-- MIGRATION: Add brand + mascot color fields (with overrides)
-- ----------------------------------------------------------------------------
-- Adds a two-level color system:
--   - Brand defaults on clients (brand_color_*)
--   - Optional mascot overrides on mascots (mascot_color_*)
-- Resolution (in app code): mascot -> brand -> system defaults.
-- Note: background/mode are stored for parity but not currently used by UI.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1) Brand-level colors (clients)
-- ---------------------------------------------------------------------------
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS brand_color_primary    TEXT,
  ADD COLUMN IF NOT EXISTS brand_color_secondary  TEXT,
  ADD COLUMN IF NOT EXISTS brand_color_background TEXT,
  ADD COLUMN IF NOT EXISTS brand_color_mode       TEXT CHECK (brand_color_mode IN ('light', 'dark'));

-- Backfill brand_color_primary from existing palette so NOT NULL can be applied safely
UPDATE public.clients
SET
  brand_color_primary = COALESCE(brand_color_primary, palette_primary, '#6366F1'),
  brand_color_secondary = COALESCE(brand_color_secondary, palette_primary_dark);

ALTER TABLE public.clients
  ALTER COLUMN brand_color_primary SET NOT NULL;

-- Helpful metadata
COMMENT ON COLUMN public.clients.brand_color_primary    IS 'Brand primary color (required)';
COMMENT ON COLUMN public.clients.brand_color_secondary  IS 'Brand secondary/accent color (optional)';
COMMENT ON COLUMN public.clients.brand_color_background IS 'Brand background color (optional, stored only)';
COMMENT ON COLUMN public.clients.brand_color_mode       IS 'Brand color mode hint: light | dark (optional, stored only)';

-- ---------------------------------------------------------------------------
-- 2) Mascot-level overrides (mascots)
-- ---------------------------------------------------------------------------
ALTER TABLE public.mascots
  ADD COLUMN IF NOT EXISTS mascot_color_primary    TEXT,
  ADD COLUMN IF NOT EXISTS mascot_color_secondary  TEXT,
  ADD COLUMN IF NOT EXISTS mascot_color_background TEXT,
  ADD COLUMN IF NOT EXISTS mascot_color_mode       TEXT CHECK (mascot_color_mode IN ('light', 'dark'));

COMMENT ON COLUMN public.mascots.mascot_color_primary    IS 'Override primary color for this mascot (optional)';
COMMENT ON COLUMN public.mascots.mascot_color_secondary  IS 'Override secondary/accent color for this mascot (optional)';
COMMENT ON COLUMN public.mascots.mascot_color_background IS 'Override background color for this mascot (optional, stored only)';
COMMENT ON COLUMN public.mascots.mascot_color_mode       IS 'Override color mode hint: light | dark (optional, stored only)';

COMMIT;

