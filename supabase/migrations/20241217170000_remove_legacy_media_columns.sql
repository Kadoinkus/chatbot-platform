-- Remove legacy media columns after backfilling into client_assets
BEGIN;

-- Drop unused logo and avatar URL columns now that client_assets holds media
ALTER TABLE public.clients DROP COLUMN IF EXISTS logo_url;
ALTER TABLE public.mascots DROP COLUMN IF EXISTS image_url;

COMMIT;
