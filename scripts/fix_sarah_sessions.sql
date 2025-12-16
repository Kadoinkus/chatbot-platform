-- ============================================================================
-- Fix Sarah sessions: Dutch language, bot greeting first, response metadata
-- Scope: UPDATE existing 5 sessions from dd_sarah_sessions.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- Session S1: Vacation days (8475dc2a-ce44-4307-ad45-7be0ef109d37)
-- memory_cache - no glb_transfer_size needed
-- ============================================================================

UPDATE chat_sessions SET
  total_bot_messages = 3,
  average_response_time_ms = 1600,
  full_transcript = '[{"author":"bot","easter":"","message":"Hoi! Ik ben Sarah, je HR-assistent bij Jumbo. Waar kan ik je mee helpen?","timestamp":"2025-11-15T09:45:05+00:00"},{"author":"user","message":"Hoeveel vakantiedagen krijgen fulltime medewerkers?","timestamp":"2025-11-15T09:45:10+00:00"},{"author":"bot","easter":"","message":"Fulltime collega''s krijgen 25 vakantiedagen per jaar, plus de feestdagen.","timestamp":"2025-11-15T09:45:50+00:00"},{"author":"user","message":"Kan ik dagen meenemen naar volgend jaar?","timestamp":"2025-11-15T09:47:00+00:00"},{"author":"bot","easter":"","message":"Ja, je mag maximaal 5 dagen meenemen naar Q1 van volgend jaar. Dien het verzoek in via het HR-portaal.","timestamp":"2025-11-15T09:48:10+00:00"}]'::jsonb,
  updated_at = NOW()
WHERE id = '8475dc2a-ce44-4307-ad45-7be0ef109d37';

-- Insert bot greeting message for S1
INSERT INTO chat_messages (
  id, session_id, message, author, timestamp, created_at,
  mascot_slug, mascot_shortcut,
  response_time_ms, response_animation, wait_sequence,
  prompt_tokens, completion_tokens, total_tokens, model_used,
  cost_usd, cost_eur, finish_reason
) VALUES (
  'a1001001-0001-4001-8001-000000000001',
  '8475dc2a-ce44-4307-ad45-7be0ef109d37',
  'Hoi! Ik ben Sarah, je HR-assistent bij Jumbo. Waar kan ik je mee helpen?',
  'bot',
  '2025-11-15T09:45:05+00:00',
  '2025-11-15T09:45:05+00:00',
  'jumboDemo-ma-003', 'jumboDemo-Sarah',
  500, '{"name": "react_happy2type_T"}'::jsonb, 'wait_A',
  20, 25, 45, 'gpt-4.1-mini',
  0.0007, 0.0006, 'completed'
) ON CONFLICT (id) DO NOTHING;

-- Update S1 existing messages to Dutch with metadata
UPDATE chat_messages SET
  message = 'Hoeveel vakantiedagen krijgen fulltime medewerkers?'
WHERE id = '9491f506-33db-4c0a-a046-062042b9d650';

UPDATE chat_messages SET
  message = 'Fulltime collega''s krijgen 25 vakantiedagen per jaar, plus de feestdagen.',
  response_time_ms = 1650,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = 'wait_B',
  prompt_tokens = 45,
  completion_tokens = 40,
  total_tokens = 85,
  model_used = 'gpt-4.1-mini',
  cost_usd = 0.0013,
  cost_eur = 0.0012,
  finish_reason = 'completed'
WHERE id = '8d61f31d-de57-4cee-8971-e400d6a11033';

UPDATE chat_messages SET
  message = 'Kan ik dagen meenemen naar volgend jaar?'
WHERE id = '8f801b02-900a-40bc-a8de-2bd50ca82507';

UPDATE chat_messages SET
  message = 'Ja, je mag maximaal 5 dagen meenemen naar Q1 van volgend jaar. Dien het verzoek in via het HR-portaal.',
  response_time_ms = 1700,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = 'wait_C',
  prompt_tokens = 50,
  completion_tokens = 45,
  total_tokens = 95,
  model_used = 'gpt-4.1-mini',
  cost_usd = 0.0014,
  cost_eur = 0.0013,
  finish_reason = 'completed'
WHERE id = 'c2d1f8b8-046d-4290-b9ba-0fa78968a8c7';

-- Update S1 analysis
UPDATE chat_session_analyses SET
  language = 'nl',
  summary = 'Uitleg gegeven over vakantiedagen en de mogelijkheid om dagen over te dragen.',
  custom_object1 = '{}'::jsonb,
  custom_object2 = '{}'::jsonb
WHERE session_id = '8475dc2a-ce44-4307-ad45-7be0ef109d37';

-- ============================================================================
-- Session S2: Parental leave (5677d0fd-70e8-42d8-a7eb-65f7acb78162)
-- memory_cache - no glb_transfer_size needed
-- ============================================================================

UPDATE chat_sessions SET
  total_bot_messages = 3,
  average_response_time_ms = 1700,
  full_transcript = '[{"author":"bot","easter":"","message":"Hallo! Ik ben Sarah van HR. Hoe kan ik je vandaag helpen?","timestamp":"2025-11-15T12:05:10+00:00"},{"author":"user","message":"Wat is het betaald ouderschapsverlof beleid?","timestamp":"2025-11-15T12:05:15+00:00"},{"author":"bot","easter":"","message":"We volgen de Nederlandse regels: 9 weken met 70% salaris voor geboorte-ouders, met extra onbetaald verlof mogelijk.","timestamp":"2025-11-15T12:05:55+00:00"},{"author":"user","message":"Hoe vraag ik het aan?","timestamp":"2025-11-15T12:07:10+00:00"},{"author":"bot","easter":"","message":"Dien het ouderschapsverlofformulier in via het HR-portaal, minimaal 4 weken voor de startdatum.","timestamp":"2025-11-15T12:08:20+00:00"}]'::jsonb,
  updated_at = NOW()
WHERE id = '5677d0fd-70e8-42d8-a7eb-65f7acb78162';

-- Insert bot greeting message for S2
INSERT INTO chat_messages (
  id, session_id, message, author, timestamp, created_at,
  mascot_slug, mascot_shortcut,
  response_time_ms, response_animation, wait_sequence,
  prompt_tokens, completion_tokens, total_tokens, model_used,
  cost_usd, cost_eur, finish_reason
) VALUES (
  'a1001001-0002-4001-8001-000000000001',
  '5677d0fd-70e8-42d8-a7eb-65f7acb78162',
  'Hallo! Ik ben Sarah van HR. Hoe kan ik je vandaag helpen?',
  'bot',
  '2025-11-15T12:05:10+00:00',
  '2025-11-15T12:05:10+00:00',
  'jumboDemo-ma-003', 'jumboDemo-Sarah',
  500, '{"name": "react_happy2type_T"}'::jsonb, 'wait_A',
  20, 22, 42, 'gpt-4.1-mini',
  0.0006, 0.0005, 'completed'
) ON CONFLICT (id) DO NOTHING;

-- Update S2 existing messages
UPDATE chat_messages SET
  message = 'Wat is het betaald ouderschapsverlof beleid?'
WHERE id = '6a48f3f8-f1f2-49c9-a04a-85f8fedf25e9';

UPDATE chat_messages SET
  message = 'We volgen de Nederlandse regels: 9 weken met 70% salaris voor geboorte-ouders, met extra onbetaald verlof mogelijk.',
  response_time_ms = 1750,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = 'wait_B',
  prompt_tokens = 48,
  completion_tokens = 50,
  total_tokens = 98,
  model_used = 'gpt-4.1-mini',
  cost_usd = 0.0015,
  cost_eur = 0.0014,
  finish_reason = 'completed'
WHERE id = '10d890b0-5e8d-4f5c-ad57-3b7304f6a296';

UPDATE chat_messages SET
  message = 'Hoe vraag ik het aan?'
WHERE id = 'a1b0e5d2-17aa-40b6-b21b-e36bba118c81';

UPDATE chat_messages SET
  message = 'Dien het ouderschapsverlofformulier in via het HR-portaal, minimaal 4 weken voor de startdatum.',
  response_time_ms = 1650,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = 'wait_C',
  prompt_tokens = 52,
  completion_tokens = 42,
  total_tokens = 94,
  model_used = 'gpt-4.1-mini',
  cost_usd = 0.0014,
  cost_eur = 0.0013,
  finish_reason = 'completed'
WHERE id = '77ba8f6c-afe1-492e-bfec-57197a099f13';

-- Update S2 analysis
UPDATE chat_session_analyses SET
  language = 'nl',
  summary = 'Uitleg gegeven over betaald ouderschapsverlof en het aanvraagproces.',
  custom_object1 = '{}'::jsonb,
  custom_object2 = '{}'::jsonb
WHERE session_id = '5677d0fd-70e8-42d8-a7eb-65f7acb78162';

-- ============================================================================
-- Session S3: Benefits card (1aa4b247-4ae6-49f8-a995-cb2fea4ed983)
-- cdn_fetch - needs glb_transfer_size
-- ============================================================================

UPDATE chat_sessions SET
  total_bot_messages = 3,
  average_response_time_ms = 1700,
  glb_transfer_size = 20156432,
  full_transcript = '[{"author":"bot","easter":"","message":"Hoi! Ik ben Sarah, je HR-hulp. Waarmee kan ik je helpen?","timestamp":"2025-11-15T16:20:15+00:00"},{"author":"user","message":"Wanneer krijgen nieuwe medewerkers hun voordelenpas?","timestamp":"2025-11-15T16:20:20+00:00"},{"author":"bot","easter":"","message":"Passen worden binnen twee weken na de onboarding verstuurd.","timestamp":"2025-11-15T16:21:05+00:00"},{"author":"user","message":"De mijne is na 3 weken nog niet aangekomen.","timestamp":"2025-11-15T16:22:00+00:00"},{"author":"bot","easter":"","message":"Ik zal dit doorgeven aan HR-operations en een nieuwe pas aanvragen. Bevestig alsjeblieft je postadres.","timestamp":"2025-11-15T16:23:10+00:00"}]'::jsonb,
  updated_at = NOW()
WHERE id = '1aa4b247-4ae6-49f8-a995-cb2fea4ed983';

-- Insert bot greeting message for S3
INSERT INTO chat_messages (
  id, session_id, message, author, timestamp, created_at,
  mascot_slug, mascot_shortcut,
  response_time_ms, response_animation, wait_sequence,
  prompt_tokens, completion_tokens, total_tokens, model_used,
  cost_usd, cost_eur, finish_reason
) VALUES (
  'a1001001-0003-4001-8001-000000000001',
  '1aa4b247-4ae6-49f8-a995-cb2fea4ed983',
  'Hoi! Ik ben Sarah, je HR-hulp. Waarmee kan ik je helpen?',
  'bot',
  '2025-11-15T16:20:15+00:00',
  '2025-11-15T16:20:15+00:00',
  'jumboDemo-ma-003', 'jumboDemo-Sarah',
  500, '{"name": "react_happy2type_T"}'::jsonb, 'wait_A',
  20, 24, 44, 'gpt-4.1-mini',
  0.0007, 0.0006, 'completed'
) ON CONFLICT (id) DO NOTHING;

-- Update S3 existing messages
UPDATE chat_messages SET
  message = 'Wanneer krijgen nieuwe medewerkers hun voordelenpas?'
WHERE id = '54617bad-cc05-4e6b-aabf-116a30d8cd5d';

UPDATE chat_messages SET
  message = 'Passen worden binnen twee weken na de onboarding verstuurd.',
  response_time_ms = 1700,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = 'wait_B',
  prompt_tokens = 44,
  completion_tokens = 35,
  total_tokens = 79,
  model_used = 'gpt-4.1-mini',
  cost_usd = 0.0012,
  cost_eur = 0.0011,
  finish_reason = 'completed'
WHERE id = '03f6f179-6784-4f71-99cb-f251407ef156';

UPDATE chat_messages SET
  message = 'De mijne is na 3 weken nog niet aangekomen.'
WHERE id = '1f959252-bb07-4e91-b48a-1309c66aceed';

UPDATE chat_messages SET
  message = 'Ik zal dit doorgeven aan HR-operations en een nieuwe pas aanvragen. Bevestig alsjeblieft je postadres.',
  response_time_ms = 1850,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = 'wait_C',
  prompt_tokens = 55,
  completion_tokens = 48,
  total_tokens = 103,
  model_used = 'gpt-4.1-mini',
  cost_usd = 0.0015,
  cost_eur = 0.0014,
  finish_reason = 'completed'
WHERE id = 'bb1a79b3-f3e3-403e-be81-4ef23c3144b0';

-- Update S3 analysis
UPDATE chat_session_analyses SET
  language = 'nl',
  summary = 'Voordelenpas probleem gemeld en nieuwe pas aangevraagd.',
  custom_object1 = '{}'::jsonb,
  custom_object2 = '{}'::jsonb
WHERE session_id = '1aa4b247-4ae6-49f8-a995-cb2fea4ed983';

-- ============================================================================
-- Session S4: Payroll update (d8286d3a-1557-437d-8e66-4a2e246bf2ff)
-- memory_cache - no glb_transfer_size needed
-- ============================================================================

UPDATE chat_sessions SET
  total_bot_messages = 3,
  average_response_time_ms = 1800,
  full_transcript = '[{"author":"bot","easter":"","message":"Hallo! Ik ben Sarah van HR. Hoe kan ik je helpen vandaag?","timestamp":"2025-11-16T10:10:10+00:00"},{"author":"user","message":"Ik ben van bank gewisseld. Hoe update ik mijn salarisgegevens?","timestamp":"2025-11-16T10:10:15+00:00"},{"author":"bot","easter":"","message":"Werk je IBAN bij in het HR-portaal onder Profiel > Salaris, en upload een bewijs van je rekening.","timestamp":"2025-11-16T10:10:55+00:00"},{"author":"user","message":"Geldt het voor de volgende salarisbetaling?","timestamp":"2025-11-16T10:12:05+00:00"},{"author":"bot","easter":"","message":"Wijzigingen voor de 20e worden verwerkt voor de huidige maand; daarna gaan ze naar de volgende salarisronde.","timestamp":"2025-11-16T10:13:20+00:00"}]'::jsonb,
  updated_at = NOW()
WHERE id = 'd8286d3a-1557-437d-8e66-4a2e246bf2ff';

-- Insert bot greeting message for S4
INSERT INTO chat_messages (
  id, session_id, message, author, timestamp, created_at,
  mascot_slug, mascot_shortcut,
  response_time_ms, response_animation, wait_sequence,
  prompt_tokens, completion_tokens, total_tokens, model_used,
  cost_usd, cost_eur, finish_reason
) VALUES (
  'a1001001-0004-4001-8001-000000000001',
  'd8286d3a-1557-437d-8e66-4a2e246bf2ff',
  'Hallo! Ik ben Sarah van HR. Hoe kan ik je helpen vandaag?',
  'bot',
  '2025-11-16T10:10:10+00:00',
  '2025-11-16T10:10:10+00:00',
  'jumboDemo-ma-003', 'jumboDemo-Sarah',
  500, '{"name": "react_happy2type_T"}'::jsonb, 'wait_A',
  20, 23, 43, 'gpt-4.1-mini',
  0.0007, 0.0006, 'completed'
) ON CONFLICT (id) DO NOTHING;

-- Update S4 existing messages
UPDATE chat_messages SET
  message = 'Ik ben van bank gewisseld. Hoe update ik mijn salarisgegevens?'
WHERE id = '189ce0de-972e-44af-bbd0-fd9270f4716f';

UPDATE chat_messages SET
  message = 'Werk je IBAN bij in het HR-portaal onder Profiel > Salaris, en upload een bewijs van je rekening.',
  response_time_ms = 1800,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = 'wait_B',
  prompt_tokens = 50,
  completion_tokens = 45,
  total_tokens = 95,
  model_used = 'gpt-4.1-mini',
  cost_usd = 0.0014,
  cost_eur = 0.0013,
  finish_reason = 'completed'
WHERE id = '49bd9898-a7f8-487a-bc10-8f26c127e028';

UPDATE chat_messages SET
  message = 'Geldt het voor de volgende salarisbetaling?'
WHERE id = '0e3556e6-686d-4ab2-b125-30d9c0be8aef';

UPDATE chat_messages SET
  message = 'Wijzigingen voor de 20e worden verwerkt voor de huidige maand; daarna gaan ze naar de volgende salarisronde.',
  response_time_ms = 1900,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = 'wait_C',
  prompt_tokens = 55,
  completion_tokens = 50,
  total_tokens = 105,
  model_used = 'gpt-4.1-mini',
  cost_usd = 0.0016,
  cost_eur = 0.0015,
  finish_reason = 'completed'
WHERE id = '9645ce42-9ff4-4f9d-8793-5a5103b965df';

-- Update S4 analysis
UPDATE chat_session_analyses SET
  language = 'nl',
  summary = 'Uitleg gegeven over het bijwerken van bankgegevens en de verwerkingstermijn.',
  custom_object1 = '{}'::jsonb,
  custom_object2 = '{}'::jsonb
WHERE session_id = 'd8286d3a-1557-437d-8e66-4a2e246bf2ff';

-- ============================================================================
-- Session S5: Training budget (c4ce405f-abca-4c6c-a664-3efc9e42f4e0)
-- cdn_fetch - needs glb_transfer_size
-- ============================================================================

UPDATE chat_sessions SET
  total_bot_messages = 3,
  average_response_time_ms = 1850,
  glb_transfer_size = 19845632,
  full_transcript = '[{"author":"bot","easter":"","message":"Hoi! Ik ben Sarah, je HR-assistent. Waar kan ik je mee helpen?","timestamp":"2025-11-16T13:55:05+00:00"},{"author":"user","message":"Is er een opleidingsbudget voor parttime medewerkers?","timestamp":"2025-11-16T13:55:10+00:00"},{"author":"bot","easter":"","message":"Ja, naar rato beschikbaar na 3 maanden dienstverband.","timestamp":"2025-11-16T13:55:50+00:00"},{"author":"user","message":"Hoeveel kan ik besteden?","timestamp":"2025-11-16T13:57:00+00:00"},{"author":"bot","easter":"","message":"Meestal EUR 400 per jaar voor contracten van 20 uur. Dien de cursusdetails in via het Leerportaal voor goedkeuring.","timestamp":"2025-11-16T13:58:05+00:00"}]'::jsonb,
  updated_at = NOW()
WHERE id = 'c4ce405f-abca-4c6c-a664-3efc9e42f4e0';

-- Insert bot greeting message for S5
INSERT INTO chat_messages (
  id, session_id, message, author, timestamp, created_at,
  mascot_slug, mascot_shortcut,
  response_time_ms, response_animation, wait_sequence,
  prompt_tokens, completion_tokens, total_tokens, model_used,
  cost_usd, cost_eur, finish_reason
) VALUES (
  'a1001001-0005-4001-8001-000000000001',
  'c4ce405f-abca-4c6c-a664-3efc9e42f4e0',
  'Hoi! Ik ben Sarah, je HR-assistent. Waar kan ik je mee helpen?',
  'bot',
  '2025-11-16T13:55:05+00:00',
  '2025-11-16T13:55:05+00:00',
  'jumboDemo-ma-003', 'jumboDemo-Sarah',
  500, '{"name": "react_happy2type_T"}'::jsonb, 'wait_A',
  20, 24, 44, 'gpt-4.1-mini',
  0.0007, 0.0006, 'completed'
) ON CONFLICT (id) DO NOTHING;

-- Update S5 existing messages
UPDATE chat_messages SET
  message = 'Is er een opleidingsbudget voor parttime medewerkers?'
WHERE id = '1e31f032-5976-44c2-8223-5d47af96e65a';

UPDATE chat_messages SET
  message = 'Ja, naar rato beschikbaar na 3 maanden dienstverband.',
  response_time_ms = 1800,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = 'wait_B',
  prompt_tokens = 42,
  completion_tokens = 32,
  total_tokens = 74,
  model_used = 'gpt-4.1-mini',
  cost_usd = 0.0011,
  cost_eur = 0.0010,
  finish_reason = 'completed'
WHERE id = '02a9c650-b4a7-4c62-9ca3-4a2b7f0b09ab';

UPDATE chat_messages SET
  message = 'Hoeveel kan ik besteden?'
WHERE id = 'a969e0d9-b8e3-4c9d-b5ee-8d9776587125';

UPDATE chat_messages SET
  message = 'Meestal EUR 400 per jaar voor contracten van 20 uur. Dien de cursusdetails in via het Leerportaal voor goedkeuring.',
  response_time_ms = 1950,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = 'wait_C',
  prompt_tokens = 55,
  completion_tokens = 52,
  total_tokens = 107,
  model_used = 'gpt-4.1-mini',
  cost_usd = 0.0016,
  cost_eur = 0.0015,
  finish_reason = 'completed'
WHERE id = 'fd9ea5bc-b499-439d-aa84-9c7b2c4a3eff';

-- Update S5 analysis
UPDATE chat_session_analyses SET
  language = 'nl',
  summary = 'Uitleg gegeven over opleidingsbudget voor parttime medewerkers.',
  custom_object1 = '{}'::jsonb,
  custom_object2 = '{}'::jsonb
WHERE session_id = 'c4ce405f-abca-4c6c-a664-3efc9e42f4e0';

COMMIT;
