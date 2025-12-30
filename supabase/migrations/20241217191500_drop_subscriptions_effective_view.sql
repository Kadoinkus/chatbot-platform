-- Drop the subscriptions_effective view (no longer needed since effective fields are stored)
BEGIN;

DROP VIEW IF EXISTS subscriptions_effective CASCADE;

COMMIT;
