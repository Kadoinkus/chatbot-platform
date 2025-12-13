-- =============================================================================
-- MIGRATION: Cleanup redundant workspace slug triggers
-- =============================================================================
-- The generate_workspace_slug() function already handles slug generation
-- correctly in format: {client_slug}-wp-{number:03d}
--
-- These functions/triggers are redundant and can be removed.
-- =============================================================================

DROP TRIGGER IF EXISTS trg_set_workspace_slug ON workspaces;
DROP FUNCTION IF EXISTS set_workspace_slug();
DROP FUNCTION IF EXISTS slugify_workspace(TEXT, TEXT);
