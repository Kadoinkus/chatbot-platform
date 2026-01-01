-- ============================================================================
-- MIGRATION: Drop legacy palette_* columns from clients
-- ----------------------------------------------------------------------------
-- Prereq: brand_color_* columns have been added and backfilled.
-- After this migration, only brand_color_* remain on clients.
-- ============================================================================

BEGIN;

ALTER TABLE public.clients
  DROP COLUMN IF EXISTS palette_primary,
  DROP COLUMN IF EXISTS palette_primary_dark,
  DROP COLUMN IF EXISTS palette_accent;

COMMIT;

