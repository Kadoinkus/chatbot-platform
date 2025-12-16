-- ============================================================================
-- Fix Max sessions: Dutch language, bot greeting first, response metadata
-- Scope: UPDATE existing 5 sessions from dd_max_sessions.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- Session M1: Late store Utrecht (65c319ff-1cf9-467e-a448-db07ac419494)
-- memory_cache - no glb_transfer_size needed
-- ============================================================================

UPDATE chat_sessions SET
  total_bot_messages = 3,
  average_response_time_ms = 1400,
  full_transcript = '[{"author":"bot","easter":"","message":"Hoi! Ik ben Max, je winkelzoeker bij Jumbo. Waar kan ik je mee helpen?","timestamp":"2025-11-15T08:30:05+00:00"},{"author":"user","message":"Welke Jumbo bij Utrecht is vanavond laat open?","timestamp":"2025-11-15T08:30:10+00:00"},{"author":"bot","easter":"","message":"De Jaarbeurs Utrecht winkel is open tot 22:00. Wil je een routebeschrijving?","timestamp":"2025-11-15T08:30:45+00:00"},{"author":"user","message":"Ja graag.","timestamp":"2025-11-15T08:31:40+00:00"},{"author":"bot","easter":"","message":"Hier is de kaartlink: https://jumbo.com/stores/jaarbeurs. Er is parkeren op het terrein.","timestamp":"2025-11-15T08:32:30+00:00"}]'::jsonb,
  updated_at = NOW()
WHERE id = '65c319ff-1cf9-467e-a448-db07ac419494';

-- Insert bot greeting message for M1
INSERT INTO chat_messages (
  id, session_id, message, author, timestamp, created_at,
  mascot_slug, mascot_shortcut,
  response_time_ms, response_animation, wait_sequence,
  prompt_tokens, completion_tokens, total_tokens, model_used,
  cost_usd, cost_eur, finish_reason
) VALUES (
  'b2002002-0001-4002-8002-000000000001',
  '65c319ff-1cf9-467e-a448-db07ac419494',
  'Hoi! Ik ben Max, je winkelzoeker bij Jumbo. Waar kan ik je mee helpen?',
  'bot',
  '2025-11-15T08:30:05+00:00',
  '2025-11-15T08:30:05+00:00',
  'jumboDemo-ma-004', 'jumboDemo-Max',
  500, '{"name": "react_happy2type_T"}'::jsonb, 'wait_A',
  20, 26, 46, 'gpt-4.1-mini',
  0.0007, 0.0006, 'completed'
) ON CONFLICT (id) DO NOTHING;

-- Update M1 existing messages to Dutch with metadata
UPDATE chat_messages SET
  message = 'Welke Jumbo bij Utrecht is vanavond laat open?'
WHERE id = '0cc239cb-1efe-4557-92a4-b18dcab0b32a';

UPDATE chat_messages SET
  message = 'De Jaarbeurs Utrecht winkel is open tot 22:00. Wil je een routebeschrijving?',
  response_time_ms = 1450,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = 'wait_B',
  prompt_tokens = 42,
  completion_tokens = 38,
  total_tokens = 80,
  model_used = 'gpt-4.1-mini',
  cost_usd = 0.0012,
  cost_eur = 0.0011,
  finish_reason = 'completed'
WHERE id = '9dea28ae-cb8d-4828-aefc-0e4a74943848';

UPDATE chat_messages SET
  message = 'Ja graag.'
WHERE id = 'c66ce6c1-c604-45f1-b949-94604e9d51bd';

UPDATE chat_messages SET
  message = 'Hier is de kaartlink: https://jumbo.com/stores/jaarbeurs. Er is parkeren op het terrein.',
  response_time_ms = 1500,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = 'wait_C',
  prompt_tokens = 45,
  completion_tokens = 40,
  total_tokens = 85,
  model_used = 'gpt-4.1-mini',
  cost_usd = 0.0013,
  cost_eur = 0.0012,
  finish_reason = 'completed'
WHERE id = 'b324bef3-2c3c-48ee-a003-f1a77c92db9a';

-- Update M1 analysis
UPDATE chat_session_analyses SET
  language = 'nl',
  summary = 'Winkel met late openingstijden in Utrecht gevonden en routebeschrijving gedeeld.',
  custom_object1 = '{}'::jsonb,
  custom_object2 = '{}'::jsonb
WHERE session_id = '65c319ff-1cf9-467e-a448-db07ac419494';

-- ============================================================================
-- Session M2: Parking Rotterdam (b81e8dce-c38d-4cda-b363-10d28f67d96a)
-- cdn_fetch - needs glb_transfer_size
-- ============================================================================

UPDATE chat_sessions SET
  total_bot_messages = 3,
  average_response_time_ms = 1500,
  glb_transfer_size = 20456832,
  full_transcript = '[{"author":"bot","easter":"","message":"Hallo! Ik ben Max van Jumbo. Hoe kan ik je helpen met winkels vinden?","timestamp":"2025-11-15T12:40:10+00:00"},{"author":"user","message":"Heeft de Rotterdam Centrum winkel gratis parkeren?","timestamp":"2025-11-15T12:40:15+00:00"},{"author":"bot","easter":"","message":"Parkeren is betaald, maar het eerste uur is gratis met validatie bij de kassa.","timestamp":"2025-11-15T12:41:00+00:00"},{"author":"user","message":"Waar kan ik valideren?","timestamp":"2025-11-15T12:42:05+00:00"},{"author":"bot","easter":"","message":"Bij de servicebalie bij de uitgang; toon je bon en kenteken.","timestamp":"2025-11-15T12:43:10+00:00"}]'::jsonb,
  updated_at = NOW()
WHERE id = 'b81e8dce-c38d-4cda-b363-10d28f67d96a';

-- Insert bot greeting message for M2
INSERT INTO chat_messages (
  id, session_id, message, author, timestamp, created_at,
  mascot_slug, mascot_shortcut,
  response_time_ms, response_animation, wait_sequence,
  prompt_tokens, completion_tokens, total_tokens, model_used,
  cost_usd, cost_eur, finish_reason
) VALUES (
  'b2002002-0002-4002-8002-000000000001',
  'b81e8dce-c38d-4cda-b363-10d28f67d96a',
  'Hallo! Ik ben Max van Jumbo. Hoe kan ik je helpen met winkels vinden?',
  'bot',
  '2025-11-15T12:40:10+00:00',
  '2025-11-15T12:40:10+00:00',
  'jumboDemo-ma-004', 'jumboDemo-Max',
  500, '{"name": "react_happy2type_T"}'::jsonb, 'wait_A',
  20, 25, 45, 'gpt-4.1-mini',
  0.0007, 0.0006, 'completed'
) ON CONFLICT (id) DO NOTHING;

-- Update M2 existing messages
UPDATE chat_messages SET
  message = 'Heeft de Rotterdam Centrum winkel gratis parkeren?'
WHERE id = '56aad066-192c-47eb-9545-5a90919389ba';

UPDATE chat_messages SET
  message = 'Parkeren is betaald, maar het eerste uur is gratis met validatie bij de kassa.',
  response_time_ms = 1550,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = 'wait_B',
  prompt_tokens = 44,
  completion_tokens = 40,
  total_tokens = 84,
  model_used = 'gpt-4.1-mini',
  cost_usd = 0.0013,
  cost_eur = 0.0012,
  finish_reason = 'completed'
WHERE id = '0610a3fd-039c-4ff3-95bc-3c58b4fd0575';

UPDATE chat_messages SET
  message = 'Waar kan ik valideren?'
WHERE id = '744261c1-cce3-49a5-a547-d3d01c987c30';

UPDATE chat_messages SET
  message = 'Bij de servicebalie bij de uitgang; toon je bon en kenteken.',
  response_time_ms = 1600,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = 'wait_C',
  prompt_tokens = 48,
  completion_tokens = 35,
  total_tokens = 83,
  model_used = 'gpt-4.1-mini',
  cost_usd = 0.0012,
  cost_eur = 0.0011,
  finish_reason = 'completed'
WHERE id = '7ad96995-9698-4d16-8828-0fa0e913ecca';

-- Update M2 analysis
UPDATE chat_session_analyses SET
  language = 'nl',
  summary = 'Uitleg gegeven over parkeerbeleid en validatielocatie.',
  custom_object1 = '{}'::jsonb,
  custom_object2 = '{}'::jsonb
WHERE session_id = 'b81e8dce-c38d-4cda-b363-10d28f67d96a';

-- ============================================================================
-- Session M3: Pharmacy Delft (2872217e-248f-41d1-9394-aff9b02b3f21)
-- memory_cache - no glb_transfer_size needed
-- ============================================================================

UPDATE chat_sessions SET
  total_bot_messages = 3,
  average_response_time_ms = 1550,
  full_transcript = '[{"author":"bot","easter":"","message":"Hoi! Ik ben Max, je winkelgids. Waarmee kan ik je helpen?","timestamp":"2025-11-15T18:10:15+00:00"},{"author":"user","message":"Is er een Jumbo met een apotheek die zaterdagavond open is?","timestamp":"2025-11-15T18:10:20+00:00"},{"author":"bot","easter":"","message":"De Delft campus locatie heeft een apotheek die tot 19:00 open is op zaterdagen.","timestamp":"2025-11-15T18:11:10+00:00"},{"author":"user","message":"Kun je het adres sturen?","timestamp":"2025-11-15T18:12:00+00:00"},{"author":"bot","easter":"","message":"Natuurlijk: Zuidplantsoen 12, Delft. Ik kan de navigatie starten als je wilt.","timestamp":"2025-11-15T18:12:50+00:00"}]'::jsonb,
  updated_at = NOW()
WHERE id = '2872217e-248f-41d1-9394-aff9b02b3f21';

-- Insert bot greeting message for M3
INSERT INTO chat_messages (
  id, session_id, message, author, timestamp, created_at,
  mascot_slug, mascot_shortcut,
  response_time_ms, response_animation, wait_sequence,
  prompt_tokens, completion_tokens, total_tokens, model_used,
  cost_usd, cost_eur, finish_reason
) VALUES (
  'b2002002-0003-4002-8002-000000000001',
  '2872217e-248f-41d1-9394-aff9b02b3f21',
  'Hoi! Ik ben Max, je winkelgids. Waarmee kan ik je helpen?',
  'bot',
  '2025-11-15T18:10:15+00:00',
  '2025-11-15T18:10:15+00:00',
  'jumboDemo-ma-004', 'jumboDemo-Max',
  500, '{"name": "react_happy2type_T"}'::jsonb, 'wait_A',
  20, 22, 42, 'gpt-4.1-mini',
  0.0006, 0.0005, 'completed'
) ON CONFLICT (id) DO NOTHING;

-- Update M3 existing messages
UPDATE chat_messages SET
  message = 'Is er een Jumbo met een apotheek die zaterdagavond open is?'
WHERE id = 'ec3f00bd-c624-4091-abdb-21b51a5495f2';

UPDATE chat_messages SET
  message = 'De Delft campus locatie heeft een apotheek die tot 19:00 open is op zaterdagen.',
  response_time_ms = 1600,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = 'wait_B',
  prompt_tokens = 48,
  completion_tokens = 42,
  total_tokens = 90,
  model_used = 'gpt-4.1-mini',
  cost_usd = 0.0013,
  cost_eur = 0.0012,
  finish_reason = 'completed'
WHERE id = 'b427ac37-f2fd-467f-87a4-2b7922d099c5';

UPDATE chat_messages SET
  message = 'Kun je het adres sturen?'
WHERE id = 'aaeef79a-c97e-4c90-9725-a7c754b937c8';

UPDATE chat_messages SET
  message = 'Natuurlijk: Zuidplantsoen 12, Delft. Ik kan de navigatie starten als je wilt.',
  response_time_ms = 1650,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = 'wait_C',
  prompt_tokens = 50,
  completion_tokens = 38,
  total_tokens = 88,
  model_used = 'gpt-4.1-mini',
  cost_usd = 0.0013,
  cost_eur = 0.0012,
  finish_reason = 'completed'
WHERE id = 'cd0d398d-9605-41c2-ac15-cc0c28cd046f';

-- Update M3 analysis
UPDATE chat_session_analyses SET
  language = 'nl',
  summary = 'Apotheeklocatie en adres voor Delft gedeeld.',
  custom_object1 = '{}'::jsonb,
  custom_object2 = '{}'::jsonb
WHERE session_id = '2872217e-248f-41d1-9394-aff9b02b3f21';

-- ============================================================================
-- Session M4: Pickup Eindhoven (d4313dc1-5d27-48bb-bfdd-aab97d5cc6d8)
-- cdn_fetch - needs glb_transfer_size
-- ============================================================================

UPDATE chat_sessions SET
  total_bot_messages = 3,
  average_response_time_ms = 1450,
  glb_transfer_size = 19756432,
  full_transcript = '[{"author":"bot","easter":"","message":"Hallo! Ik ben Max van Jumbo. Waar zoek je naar?","timestamp":"2025-11-16T09:05:10+00:00"},{"author":"user","message":"Kan ik morgenochtend boodschappen ophalen bij Eindhoven?","timestamp":"2025-11-16T09:05:15+00:00"},{"author":"bot","easter":"","message":"Ja, de Woensel winkel heeft ophaaltijden van 08:00 tot 11:00.","timestamp":"2025-11-16T09:05:55+00:00"},{"author":"user","message":"Hoe reserveer ik een tijdslot?","timestamp":"2025-11-16T09:07:05+00:00"},{"author":"bot","easter":"","message":"Gebruik de app > Ophalen > kies Woensel. Vroegst beschikbaar morgen is 08:30-09:00.","timestamp":"2025-11-16T09:07:55+00:00"}]'::jsonb,
  updated_at = NOW()
WHERE id = 'd4313dc1-5d27-48bb-bfdd-aab97d5cc6d8';

-- Insert bot greeting message for M4
INSERT INTO chat_messages (
  id, session_id, message, author, timestamp, created_at,
  mascot_slug, mascot_shortcut,
  response_time_ms, response_animation, wait_sequence,
  prompt_tokens, completion_tokens, total_tokens, model_used,
  cost_usd, cost_eur, finish_reason
) VALUES (
  'b2002002-0004-4002-8002-000000000001',
  'd4313dc1-5d27-48bb-bfdd-aab97d5cc6d8',
  'Hallo! Ik ben Max van Jumbo. Waar zoek je naar?',
  'bot',
  '2025-11-16T09:05:10+00:00',
  '2025-11-16T09:05:10+00:00',
  'jumboDemo-ma-004', 'jumboDemo-Max',
  500, '{"name": "react_happy2type_T"}'::jsonb, 'wait_A',
  20, 20, 40, 'gpt-4.1-mini',
  0.0006, 0.0005, 'completed'
) ON CONFLICT (id) DO NOTHING;

-- Update M4 existing messages
UPDATE chat_messages SET
  message = 'Kan ik morgenochtend boodschappen ophalen bij Eindhoven?'
WHERE id = '600dee91-f8aa-4a3a-a9c9-d0f42e9405e8';

UPDATE chat_messages SET
  message = 'Ja, de Woensel winkel heeft ophaaltijden van 08:00 tot 11:00.',
  response_time_ms = 1500,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = 'wait_B',
  prompt_tokens = 45,
  completion_tokens = 38,
  total_tokens = 83,
  model_used = 'gpt-4.1-mini',
  cost_usd = 0.0012,
  cost_eur = 0.0011,
  finish_reason = 'completed'
WHERE id = 'fa9365ad-f502-4d34-9c12-087259f39f9b';

UPDATE chat_messages SET
  message = 'Hoe reserveer ik een tijdslot?'
WHERE id = 'd1057151-ca82-4658-b95b-0c7adce99463';

UPDATE chat_messages SET
  message = 'Gebruik de app > Ophalen > kies Woensel. Vroegst beschikbaar morgen is 08:30-09:00.',
  response_time_ms = 1550,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = 'wait_C',
  prompt_tokens = 50,
  completion_tokens = 42,
  total_tokens = 92,
  model_used = 'gpt-4.1-mini',
  cost_usd = 0.0014,
  cost_eur = 0.0013,
  finish_reason = 'completed'
WHERE id = 'bb8125b9-23a0-4ca6-9967-0dcf2878e9f0';

-- Update M4 analysis
UPDATE chat_session_analyses SET
  language = 'nl',
  summary = 'Begeleiding gegeven voor boodschappen ophalen bij Eindhoven Woensel.',
  custom_object1 = '{}'::jsonb,
  custom_object2 = '{}'::jsonb
WHERE session_id = 'd4313dc1-5d27-48bb-bfdd-aab97d5cc6d8';

-- ============================================================================
-- Session M5: Bakery Amersfoort (614c1a56-8f83-43d9-a7d4-af4637ce5dfb)
-- memory_cache - no glb_transfer_size needed
-- ============================================================================

UPDATE chat_sessions SET
  total_bot_messages = 3,
  average_response_time_ms = 1600,
  full_transcript = '[{"author":"bot","easter":"","message":"Hoi! Ik ben Max, je Jumbo winkelzoeker. Hoe kan ik je helpen?","timestamp":"2025-11-16T15:25:05+00:00"},{"author":"user","message":"Waar is de dichtstbijzijnde Jumbo met een bakkerij bij Amersfoort?","timestamp":"2025-11-16T15:25:10+00:00"},{"author":"bot","easter":"","message":"De Eemplein winkel heeft een volledige bakkerij-afdeling.","timestamp":"2025-11-16T15:25:55+00:00"},{"author":"user","message":"Is die bereikbaar met de bus?","timestamp":"2025-11-16T15:27:05+00:00"},{"author":"bot","easter":"","message":"Ja, bus 2 stopt op 200m afstand bij Eemplein. Openingstijden zijn 08:00-21:00.","timestamp":"2025-11-16T15:28:00+00:00"}]'::jsonb,
  updated_at = NOW()
WHERE id = '614c1a56-8f83-43d9-a7d4-af4637ce5dfb';

-- Insert bot greeting message for M5
INSERT INTO chat_messages (
  id, session_id, message, author, timestamp, created_at,
  mascot_slug, mascot_shortcut,
  response_time_ms, response_animation, wait_sequence,
  prompt_tokens, completion_tokens, total_tokens, model_used,
  cost_usd, cost_eur, finish_reason
) VALUES (
  'b2002002-0005-4002-8002-000000000001',
  '614c1a56-8f83-43d9-a7d4-af4637ce5dfb',
  'Hoi! Ik ben Max, je Jumbo winkelzoeker. Hoe kan ik je helpen?',
  'bot',
  '2025-11-16T15:25:05+00:00',
  '2025-11-16T15:25:05+00:00',
  'jumboDemo-ma-004', 'jumboDemo-Max',
  500, '{"name": "react_happy2type_T"}'::jsonb, 'wait_A',
  20, 24, 44, 'gpt-4.1-mini',
  0.0007, 0.0006, 'completed'
) ON CONFLICT (id) DO NOTHING;

-- Update M5 existing messages
UPDATE chat_messages SET
  message = 'Waar is de dichtstbijzijnde Jumbo met een bakkerij bij Amersfoort?'
WHERE id = '6c5afe1e-47ad-4d8e-bfc5-cf6502f55cab';

UPDATE chat_messages SET
  message = 'De Eemplein winkel heeft een volledige bakkerij-afdeling.',
  response_time_ms = 1650,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = 'wait_B',
  prompt_tokens = 46,
  completion_tokens = 35,
  total_tokens = 81,
  model_used = 'gpt-4.1-mini',
  cost_usd = 0.0012,
  cost_eur = 0.0011,
  finish_reason = 'completed'
WHERE id = 'd1950a33-1196-439e-8b84-d32fb9677304';

UPDATE chat_messages SET
  message = 'Is die bereikbaar met de bus?'
WHERE id = '262bba2a-27af-46a7-860f-3825686b9231';

UPDATE chat_messages SET
  message = 'Ja, bus 2 stopt op 200m afstand bij Eemplein. Openingstijden zijn 08:00-21:00.',
  response_time_ms = 1700,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = 'wait_C',
  prompt_tokens = 52,
  completion_tokens = 40,
  total_tokens = 92,
  model_used = 'gpt-4.1-mini',
  cost_usd = 0.0014,
  cost_eur = 0.0013,
  finish_reason = 'completed'
WHERE id = '775116da-330f-4aa6-90e0-b5c0a255343f';

-- Update M5 analysis
UPDATE chat_session_analyses SET
  language = 'nl',
  summary = 'Bakkerijlocatie in Amersfoort met busverbinding en openingstijden gedeeld.',
  custom_object1 = '{}'::jsonb,
  custom_object2 = '{}'::jsonb
WHERE session_id = '614c1a56-8f83-43d9-a7d4-af4637ce5dfb';

COMMIT;
