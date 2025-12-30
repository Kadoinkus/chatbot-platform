-- Ensure enterprise monthly_fee uses the correct default (0) for rows that still carry old defaults.

BEGIN;

UPDATE public.workspaces
SET monthly_fee = 0
WHERE plan = 'enterprise'
  AND monthly_fee IN (9, 99, 299, 399, 699, 2499, 0.0);

COMMIT;
