-- ============================================================================
-- BACKFILL MASCOT_SHORTCUT SCRIPT
-- ============================================================================
-- Updates mascot_shortcut in chat_sessions, chat_messages, and
-- chat_session_analyses based on the mascot_slug → mascot_shortcut mapping.
--
-- Run this after you've already inserted demo data.
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. UPDATE chat_sessions
-- ============================================================================
UPDATE chat_sessions
SET mascot_shortcut = CASE mascot_slug
    WHEN 'jumboDemo-ma-001' THEN 'jumboDemo-liza'
    WHEN 'jumboDemo-ma-002' THEN 'jumboDemo-Remco'
    WHEN 'jumboDemo-ma-003' THEN 'jumboDemo-Sarah'
    WHEN 'jumboDemo-ma-004' THEN 'jumboDemo-max'
    WHEN 'hitapesDemo-ma-001' THEN 'hitapesDemo-vinny'
    WHEN 'hitapesDemo-ma-002' THEN 'hitapesDemo-tech'
    ELSE mascot_shortcut
END
WHERE mascot_slug LIKE '%Demo%'
  AND (mascot_shortcut IS NULL OR mascot_shortcut = '');

-- ============================================================================
-- 2. UPDATE chat_messages
-- ============================================================================
UPDATE chat_messages
SET mascot_shortcut = CASE mascot_slug
    WHEN 'jumboDemo-ma-001' THEN 'jumboDemo-liza'
    WHEN 'jumboDemo-ma-002' THEN 'jumboDemo-Remco'
    WHEN 'jumboDemo-ma-003' THEN 'jumboDemo-Sarah'
    WHEN 'jumboDemo-ma-004' THEN 'jumboDemo-max'
    WHEN 'hitapesDemo-ma-001' THEN 'hitapesDemo-vinny'
    WHEN 'hitapesDemo-ma-002' THEN 'hitapesDemo-tech'
    ELSE mascot_shortcut
END
WHERE mascot_slug LIKE '%Demo%'
  AND (mascot_shortcut IS NULL OR mascot_shortcut = '');

-- ============================================================================
-- 3. UPDATE chat_session_analyses
-- ============================================================================
UPDATE chat_session_analyses
SET mascot_shortcut = CASE mascot_slug
    WHEN 'jumboDemo-ma-001' THEN 'jumboDemo-liza'
    WHEN 'jumboDemo-ma-002' THEN 'jumboDemo-Remco'
    WHEN 'jumboDemo-ma-003' THEN 'jumboDemo-Sarah'
    WHEN 'jumboDemo-ma-004' THEN 'jumboDemo-max'
    WHEN 'hitapesDemo-ma-001' THEN 'hitapesDemo-vinny'
    WHEN 'hitapesDemo-ma-002' THEN 'hitapesDemo-tech'
    ELSE mascot_shortcut
END
WHERE mascot_slug LIKE '%Demo%'
  AND (mascot_shortcut IS NULL OR mascot_shortcut = '');

COMMIT;

-- ============================================================================
-- VERIFY RESULTS
-- ============================================================================
-- Run these queries after to verify the backfill worked:
--
-- SELECT mascot_slug, mascot_shortcut, COUNT(*)
-- FROM chat_sessions
-- WHERE mascot_slug LIKE '%Demo%'
-- GROUP BY mascot_slug, mascot_shortcut;
--
-- SELECT mascot_slug, mascot_shortcut, COUNT(*)
-- FROM chat_messages
-- WHERE mascot_slug LIKE '%Demo%'
-- GROUP BY mascot_slug, mascot_shortcut;
--
-- SELECT mascot_slug, mascot_shortcut, COUNT(*)
-- FROM chat_session_analyses
-- WHERE mascot_slug LIKE '%Demo%'
-- GROUP BY mascot_slug, mascot_shortcut;
-- ============================================================================
