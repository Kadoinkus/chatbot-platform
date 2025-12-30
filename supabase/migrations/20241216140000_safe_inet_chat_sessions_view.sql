-- Harden chat_sessions_custom1 view against malformed IP values

-- Safely converts text to inet, returns NULL on failure
CREATE OR REPLACE FUNCTION safe_inet(p TEXT)
RETURNS inet AS $$
BEGIN
  IF p IS NULL OR trim(p) = '' THEN
    RETURN NULL;
  END IF;
  RETURN p::inet;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Recreate chat_sessions_custom1 with safe inet casting
CREATE OR REPLACE VIEW chat_sessions_custom1 AS
SELECT
  s.id AS session_id,
  s.mascot_slug,
  to_char((s.session_start AT TIME ZONE 'Europe/Amsterdam'), 'FMDD-FMMM-YYYY FMHH24:MI:SS') AS start_time,
  to_char((COALESCE(s.last_activity, s.session_end) AT TIME ZONE 'Europe/Amsterdam'), 'FMDD-FMMM-YYYY FMHH24:MI:SS') AS end_time,
  safe_inet(NULLIF(s.ip_address, '')) AS ip_address,
  NULLIF(s.country, '') AS country,
  NULLIF(a.language, '') AS language,
  safe_int((s.total_bot_messages)::text) AS messages_sent,
  NULLIF(a.sentiment, '') AS sentiment,
  a.escalated,
  a.forwarded_email,
  s.full_transcript,
  CASE
    WHEN NULLIF((s.average_response_time_ms)::text, '') IS NOT NULL
    THEN replace(to_char((safe_int((s.average_response_time_ms)::text))::numeric / 1000.0, 'FM999999990.999'), '.', ',')
    ELSE NULL
  END AS avg_response_time,
  safe_int((s.total_tokens)::text) AS tokens,
  safe_numeric((s.total_cost_eur)::text) AS tokens_eur,
  NULLIF(a.category, '') AS category,
  try_jsonb_array_text((a.questions)::text) AS questions,
  NULL::smallint AS user_rating,
  NULLIF(a.summary, '') AS summary
FROM chat_sessions s
LEFT JOIN chat_session_analyses a ON a.session_id = s.id;
