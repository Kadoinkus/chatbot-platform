-- ============================================================================
-- FIX LIZA EXTRA SESSIONS
-- ============================================================================
-- Updates the 5 extra Liza sessions to:
-- - Dutch language (like original sessions)
-- - Bot greets first
-- - Warmer, more conversational tone
-- - Proper message counts
-- ============================================================================

BEGIN;

-- ============================================================================
-- UPDATE CHAT SESSIONS (full_transcript and message counts)
-- ============================================================================

-- Session L1: Bakery deals (glb_source = memory_cache, no transfer)
UPDATE chat_sessions SET
  total_bot_messages = 3,
  total_user_messages = 2,
  average_response_time_ms = 1600,
  full_transcript = '[{"author":"bot","easter":"","message":"Hallo! Welkom bij Jumbo. Ik ben Liza, waarmee kan ik je helpen?","timestamp":"2025-11-16T08:20:15+00:00"},{"author":"user","message":"Wat zijn de aanbiedingen voor vers brood vandaag?","timestamp":"2025-11-16T08:20:45+00:00"},{"author":"bot","easter":"","message":"Vandaag hebben we leuke acties! Croissants zijn 3 halen 2 betalen en zuurdesembrood is €2 korting. Deze aanbiedingen gelden tot middernacht.","timestamp":"2025-11-16T08:21:15+00:00"},{"author":"user","message":"Geldt dat ook voor afhaalbestellingen?","timestamp":"2025-11-16T08:22:30+00:00"},{"author":"bot","easter":"","message":"Ja, dezelfde kortingen gelden ook voor bestellingen die je vandaag ophaalt. Fijn winkelen!","timestamp":"2025-11-16T08:23:10+00:00"}]'::jsonb,
  updated_at = NOW()
WHERE id = '11111111-aaaa-4bbb-8ccc-000000000001';

-- Session L2: Store hours Kralingen (glb_source = cdn_fetch, needs transfer size)
UPDATE chat_sessions SET
  total_bot_messages = 3,
  total_user_messages = 2,
  average_response_time_ms = 1600,
  glb_transfer_size = 19845632,
  full_transcript = '[{"author":"bot","easter":"","message":"Hoi! Ik ben Liza van Jumbo. Hoe kan ik je helpen?","timestamp":"2025-11-16T15:05:20+00:00"},{"author":"user","message":"Is de winkel in Kralingen open op zondagavond?","timestamp":"2025-11-16T15:05:50+00:00"},{"author":"bot","easter":"","message":"Ja, de Jumbo Kralingen is op zondag geopend tot 21:00 uur. Handig als je nog even boodschappen wilt doen!","timestamp":"2025-11-16T15:06:20+00:00"},{"author":"user","message":"Hebben ze daar ook zelfscan?","timestamp":"2025-11-16T15:07:15+00:00"},{"author":"bot","easter":"","message":"Zeker! In die winkel kun je zowel zelfscannen als de Jumbo app gebruiken om je boodschappen te scannen. Scheelt wachten bij de kassa!","timestamp":"2025-11-16T15:08:00+00:00"}]'::jsonb,
  updated_at = NOW()
WHERE id = '22222222-bbbb-4ccc-8ddd-000000000002';

-- Session L3: Return damaged product (glb_source = memory_cache)
UPDATE chat_sessions SET
  total_bot_messages = 3,
  total_user_messages = 2,
  average_response_time_ms = 1700,
  full_transcript = '[{"author":"bot","easter":"","message":"Hallo! Welkom bij Jumbo, ik ben Liza. Waar kan ik je mee helpen?","timestamp":"2025-11-17T09:30:15+00:00"},{"author":"user","message":"Hoe kan ik een beschadigd product retourneren van een afhaalbestelling?","timestamp":"2025-11-17T09:30:45+00:00"},{"author":"bot","easter":"","message":"Vervelend dat je product beschadigd was! Je kunt het artikel samen met je kassabon binnen 14 dagen naar elke Jumbo winkel brengen. Je kunt ook via de app onder ''Bestellingen'' een retour starten.","timestamp":"2025-11-17T09:31:15+00:00"},{"author":"user","message":"Moet ik de originele verpakking nog hebben?","timestamp":"2025-11-17T09:32:00+00:00"},{"author":"bot","easter":"","message":"Bij voorkeur wel, maar als dat niet lukt is dat geen probleem. Neem het product en je aankoopbewijs mee, dan bekijken we het ter plekke. We lossen het graag voor je op!","timestamp":"2025-11-17T09:33:10+00:00"}]'::jsonb,
  updated_at = NOW()
WHERE id = '33333333-cccc-4ddd-8eee-000000000003';

-- Session L4: Allergen info (glb_source = cdn_fetch, needs transfer size)
UPDATE chat_sessions SET
  total_bot_messages = 3,
  total_user_messages = 2,
  average_response_time_ms = 1595,
  glb_transfer_size = 21048576,
  full_transcript = '[{"author":"bot","easter":"","message":"Hoi! Ik ben Liza. Waarmee kan ik je vandaag helpen?","timestamp":"2025-11-17T13:10:10+00:00"},{"author":"user","message":"Waar vind ik allergeneninformatie voor kant-en-klaar maaltijden?","timestamp":"2025-11-17T13:10:35+00:00"},{"author":"bot","easter":"","message":"Goede vraag! Op elke productpagina vind je onder ''Allergenen'' alle informatie. In de Jumbo app kun je ook de barcodescanner gebruiken om snel de allergenen te checken.","timestamp":"2025-11-17T13:11:00+00:00"},{"author":"user","message":"Zit er selderij in de spaghetti bolognese?","timestamp":"2025-11-17T13:12:00+00:00"},{"author":"bot","easter":"","message":"Ja, de spaghetti bolognese bevat selderij en melk. Goed dat je het vraagt! Als je wilt kan ik allergenen voor je markeren in je profiel zodat je gewaarschuwd wordt.","timestamp":"2025-11-17T13:12:45+00:00"}]'::jsonb,
  updated_at = NOW()
WHERE id = '44444444-dddd-4eee-8fff-000000000004';

-- Session L5: Pickup slot (glb_source = memory_cache)
UPDATE chat_sessions SET
  total_bot_messages = 3,
  total_user_messages = 2,
  average_response_time_ms = 1800,
  full_transcript = '[{"author":"bot","easter":"","message":"Hallo! Welkom bij Jumbo, ik ben Liza. Hoe kan ik je helpen?","timestamp":"2025-11-17T18:25:15+00:00"},{"author":"user","message":"De afhaaltijden zijn vol vanavond. Is er een winkel in de buurt met een eerder tijdslot?","timestamp":"2025-11-17T18:25:40+00:00"},{"author":"bot","easter":"","message":"Even kijken... Ja! Bij Jumbo Strijp-S is er nog een slot beschikbaar van 19:30 tot 20:00. Dat zou kunnen werken!","timestamp":"2025-11-17T18:26:10+00:00"},{"author":"user","message":"Kun je die voor mij reserveren?","timestamp":"2025-11-17T18:27:00+00:00"},{"author":"bot","easter":"","message":"Ik heb het tijdslot 10 minuten voor je vastgehouden. Rond je bestelling af om te bevestigen. Succes met je boodschappen!","timestamp":"2025-11-17T18:28:20+00:00"}]'::jsonb,
  updated_at = NOW()
WHERE id = '55555555-eeee-4fff-8000-000000000005';

-- ============================================================================
-- UPDATE CHAT SESSION ANALYSES (language to Dutch, summaries)
-- ============================================================================

UPDATE chat_session_analyses SET
  language = 'nl',
  summary = 'Klant vroeg naar broodaanbiedingen. Croissants en zuurdesem actie uitgelegd, bevestigd dat het ook voor afhalen geldt.',
  custom_object1 = '{}'::jsonb,
  custom_object2 = '{}'::jsonb,
  updated_at = NOW()
WHERE session_id = '11111111-aaaa-4bbb-8ccc-000000000001';

UPDATE chat_session_analyses SET
  language = 'nl',
  summary = 'Klant vroeg naar openingstijden Kralingen op zondag. Bevestigd tot 21:00 en zelfscan beschikbaar.',
  custom_object1 = '{}'::jsonb,
  custom_object2 = '{}'::jsonb,
  updated_at = NOW()
WHERE session_id = '22222222-bbbb-4ccc-8ddd-000000000002';

UPDATE chat_session_analyses SET
  language = 'nl',
  summary = 'Klant wilde beschadigd product retourneren. Retourproces uitgelegd, verpakking niet strikt nodig.',
  custom_object1 = '{}'::jsonb,
  custom_object2 = '{}'::jsonb,
  updated_at = NOW()
WHERE session_id = '33333333-cccc-4ddd-8eee-000000000003';

UPDATE chat_session_analyses SET
  language = 'nl',
  summary = 'Klant zocht allergeneninformatie. Uitgelegd waar te vinden en bevestigd dat spaghetti bolognese selderij en melk bevat.',
  custom_object1 = '{}'::jsonb,
  custom_object2 = '{}'::jsonb,
  updated_at = NOW()
WHERE session_id = '44444444-dddd-4eee-8fff-000000000004';

UPDATE chat_session_analyses SET
  language = 'nl',
  summary = 'Klant zocht alternatief afhaaltijdslot. Strijp-S slot gevonden en 10 minuten vastgehouden.',
  custom_object1 = '{}'::jsonb,
  custom_object2 = '{}'::jsonb,
  updated_at = NOW()
WHERE session_id = '55555555-eeee-4fff-8000-000000000005';

-- ============================================================================
-- UPDATE CHAT MESSAGES (Dutch, with bot greeting first + response metadata)
-- ============================================================================

-- L1: Bakery deals (5 messages)
-- Bot greeting
UPDATE chat_messages SET
  message = 'Hallo! Welkom bij Jumbo. Ik ben Liza, waarmee kan ik je helpen?',
  author = 'bot',
  response_time_ms = NULL,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = NULL,
  prompt_tokens = NULL,
  completion_tokens = NULL,
  total_tokens = NULL,
  model_used = NULL,
  cost_usd = NULL,
  cost_eur = NULL,
  finish_reason = NULL
WHERE id = 'aaa00001-1111-4aaa-8000-000000000001';

-- User message
UPDATE chat_messages SET
  message = 'Wat zijn de aanbiedingen voor vers brood vandaag?',
  author = 'user',
  timestamp = '2025-11-16T08:20:45+00:00'
WHERE id = 'aaa00002-1111-4aaa-8000-000000000002';

-- Bot response
UPDATE chat_messages SET
  message = 'Vandaag hebben we leuke acties! Croissants zijn 3 halen 2 betalen en zuurdesembrood is €2 korting. Deze aanbiedingen gelden tot middernacht.',
  author = 'bot',
  timestamp = '2025-11-16T08:21:15+00:00',
  response_time_ms = 1650,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = 'wait_A',
  prompt_tokens = 45,
  completion_tokens = 40,
  total_tokens = 85,
  model_used = 'gpt-4.1-mini',
  cost_usd = 0.0013,
  cost_eur = 0.0012,
  finish_reason = 'completed'
WHERE id = 'aaa00003-1111-4aaa-8000-000000000003';

-- User message
UPDATE chat_messages SET
  message = 'Geldt dat ook voor afhaalbestellingen?',
  author = 'user',
  timestamp = '2025-11-16T08:22:30+00:00'
WHERE id = 'aaa00004-1111-4aaa-8000-000000000004';

-- L2: Store hours (5 messages)
-- Bot greeting
UPDATE chat_messages SET
  message = 'Hoi! Ik ben Liza van Jumbo. Hoe kan ik je helpen?',
  author = 'bot',
  response_time_ms = NULL,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = NULL
WHERE id = 'aaa00005-1111-4aaa-8000-000000000005';

-- User message
UPDATE chat_messages SET
  message = 'Is de winkel in Kralingen open op zondagavond?',
  author = 'user',
  timestamp = '2025-11-16T15:05:50+00:00'
WHERE id = 'aaa00006-1111-4aaa-8000-000000000006';

-- Bot response
UPDATE chat_messages SET
  message = 'Ja, de Jumbo Kralingen is op zondag geopend tot 21:00 uur. Handig als je nog even boodschappen wilt doen!',
  author = 'bot',
  timestamp = '2025-11-16T15:06:20+00:00',
  response_time_ms = 1580,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = 'wait_A',
  prompt_tokens = 40,
  completion_tokens = 35,
  total_tokens = 75,
  model_used = 'gpt-4.1-mini',
  cost_usd = 0.0011,
  cost_eur = 0.001,
  finish_reason = 'completed'
WHERE id = 'aaa00007-1111-4aaa-8000-000000000007';

-- User message
UPDATE chat_messages SET
  message = 'Hebben ze daar ook zelfscan?',
  author = 'user',
  timestamp = '2025-11-16T15:07:15+00:00'
WHERE id = 'aaa00008-1111-4aaa-8000-000000000008';

-- L3: Returns (5 messages)
-- Bot greeting
UPDATE chat_messages SET
  message = 'Hallo! Welkom bij Jumbo, ik ben Liza. Waar kan ik je mee helpen?',
  author = 'bot',
  response_time_ms = NULL,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = NULL
WHERE id = 'aaa00009-1111-4aaa-8000-000000000009';

-- User message
UPDATE chat_messages SET
  message = 'Hoe kan ik een beschadigd product retourneren van een afhaalbestelling?',
  author = 'user',
  timestamp = '2025-11-17T09:30:45+00:00'
WHERE id = 'aaa00010-1111-4aaa-8000-00000000000a';

-- Bot response
UPDATE chat_messages SET
  message = 'Vervelend dat je product beschadigd was! Je kunt het artikel samen met je kassabon binnen 14 dagen naar elke Jumbo winkel brengen. Je kunt ook via de app onder ''Bestellingen'' een retour starten.',
  author = 'bot',
  timestamp = '2025-11-17T09:31:15+00:00',
  response_time_ms = 1720,
  response_animation = '{"name": "react_sad2type_T"}'::jsonb,
  wait_sequence = 'wait_B',
  prompt_tokens = 50,
  completion_tokens = 55,
  total_tokens = 105,
  model_used = 'gpt-4.1-mini',
  cost_usd = 0.0016,
  cost_eur = 0.0015,
  finish_reason = 'completed'
WHERE id = 'aaa00011-1111-4aaa-8000-00000000000b';

-- User message
UPDATE chat_messages SET
  message = 'Moet ik de originele verpakking nog hebben?',
  author = 'user',
  timestamp = '2025-11-17T09:32:00+00:00'
WHERE id = 'aaa00012-1111-4aaa-8000-00000000000c';

-- L4: Allergens (5 messages)
-- Bot greeting
UPDATE chat_messages SET
  message = 'Hoi! Ik ben Liza. Waarmee kan ik je vandaag helpen?',
  author = 'bot',
  response_time_ms = NULL,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = NULL
WHERE id = 'aaa00013-1111-4aaa-8000-00000000000d';

-- User message
UPDATE chat_messages SET
  message = 'Waar vind ik allergeneninformatie voor kant-en-klaar maaltijden?',
  author = 'user',
  timestamp = '2025-11-17T13:10:35+00:00'
WHERE id = 'aaa00014-1111-4aaa-8000-00000000000e';

-- Bot response
UPDATE chat_messages SET
  message = 'Goede vraag! Op elke productpagina vind je onder ''Allergenen'' alle informatie. In de Jumbo app kun je ook de barcodescanner gebruiken om snel de allergenen te checken.',
  author = 'bot',
  timestamp = '2025-11-17T13:11:00+00:00',
  response_time_ms = 1600,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = 'wait_A',
  prompt_tokens = 45,
  completion_tokens = 50,
  total_tokens = 95,
  model_used = 'gpt-4.1-mini',
  cost_usd = 0.0014,
  cost_eur = 0.0013,
  finish_reason = 'completed'
WHERE id = 'aaa00015-1111-4aaa-8000-00000000000f';

-- User message
UPDATE chat_messages SET
  message = 'Zit er selderij in de spaghetti bolognese?',
  author = 'user',
  timestamp = '2025-11-17T13:12:00+00:00'
WHERE id = 'aaa00016-1111-4aaa-8000-000000000010';

-- L5: Pickup slot (5 messages)
-- Bot greeting
UPDATE chat_messages SET
  message = 'Hallo! Welkom bij Jumbo, ik ben Liza. Hoe kan ik je helpen?',
  author = 'bot',
  response_time_ms = NULL,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = NULL
WHERE id = 'aaa00017-1111-4aaa-8000-000000000011';

-- User message
UPDATE chat_messages SET
  message = 'De afhaaltijden zijn vol vanavond. Is er een winkel in de buurt met een eerder tijdslot?',
  author = 'user',
  timestamp = '2025-11-17T18:25:40+00:00'
WHERE id = 'aaa00018-1111-4aaa-8000-000000000012';

-- Bot response
UPDATE chat_messages SET
  message = 'Even kijken... Ja! Bij Jumbo Strijp-S is er nog een slot beschikbaar van 19:30 tot 20:00. Dat zou kunnen werken!',
  author = 'bot',
  timestamp = '2025-11-17T18:26:10+00:00',
  response_time_ms = 1850,
  response_animation = '{"name": "react_think2type_T"}'::jsonb,
  wait_sequence = 'wait_C',
  prompt_tokens = 55,
  completion_tokens = 45,
  total_tokens = 100,
  model_used = 'gpt-4.1-mini',
  cost_usd = 0.0015,
  cost_eur = 0.0014,
  finish_reason = 'completed'
WHERE id = 'aaa00019-1111-4aaa-8000-000000000013';

-- User message
UPDATE chat_messages SET
  message = 'Kun je die voor mij reserveren?',
  author = 'user',
  timestamp = '2025-11-17T18:27:00+00:00'
WHERE id = 'aaa0001a-1111-4aaa-8000-000000000014';

-- ============================================================================
-- INSERT MISSING 5TH MESSAGES (bot's final response for each session)
-- ============================================================================
INSERT INTO chat_messages (
  id, session_id, message, author, timestamp, created_at,
  mascot_slug, mascot_shortcut,
  response_time_ms, response_animation, wait_sequence,
  prompt_tokens, completion_tokens, total_tokens, model_used,
  cost_usd, cost_eur, finish_reason
)
VALUES
  (
    'aaa00020-1111-4aaa-8000-000000000015',
    '11111111-aaaa-4bbb-8ccc-000000000001',
    'Ja, dezelfde kortingen gelden ook voor bestellingen die je vandaag ophaalt. Fijn winkelen!',
    'bot',
    '2025-11-16T08:23:10+00:00',
    '2025-11-16T08:23:10+00:00',
    'jumboDemo-ma-001',
    'jumboDemo-liza',
    1550,
    '{"name": "react_happy2type_T"}'::jsonb,
    'wait_B',
    35, 30, 65, 'gpt-4.1-mini',
    0.001, 0.0009, 'completed'
  ),
  (
    'aaa00021-1111-4aaa-8000-000000000016',
    '22222222-bbbb-4ccc-8ddd-000000000002',
    'Zeker! In die winkel kun je zowel zelfscannen als de Jumbo app gebruiken om je boodschappen te scannen. Scheelt wachten bij de kassa!',
    'bot',
    '2025-11-16T15:08:00+00:00',
    '2025-11-16T15:08:00+00:00',
    'jumboDemo-ma-001',
    'jumboDemo-liza',
    1620,
    '{"name": "react_happy2type_T"}'::jsonb,
    'wait_B',
    40, 45, 85, 'gpt-4.1-mini',
    0.0013, 0.0012, 'completed'
  ),
  (
    'aaa00022-1111-4aaa-8000-000000000017',
    '33333333-cccc-4ddd-8eee-000000000003',
    'Bij voorkeur wel, maar als dat niet lukt is dat geen probleem. Neem het product en je aankoopbewijs mee, dan bekijken we het ter plekke. We lossen het graag voor je op!',
    'bot',
    '2025-11-17T09:33:10+00:00',
    '2025-11-17T09:33:10+00:00',
    'jumboDemo-ma-001',
    'jumboDemo-liza',
    1680,
    '{"name": "react_happy2type_T"}'::jsonb,
    'wait_C',
    45, 50, 95, 'gpt-4.1-mini',
    0.0014, 0.0013, 'completed'
  ),
  (
    'aaa00023-1111-4aaa-8000-000000000018',
    '44444444-dddd-4eee-8fff-000000000004',
    'Ja, de spaghetti bolognese bevat selderij en melk. Goed dat je het vraagt! Als je wilt kan ik allergenen voor je markeren in je profiel zodat je gewaarschuwd wordt.',
    'bot',
    '2025-11-17T13:12:45+00:00',
    '2025-11-17T13:12:45+00:00',
    'jumboDemo-ma-001',
    'jumboDemo-liza',
    1590,
    '{"name": "react_happy2type_T"}'::jsonb,
    'wait_B',
    50, 55, 105, 'gpt-4.1-mini',
    0.0016, 0.0015, 'completed'
  ),
  (
    'aaa00024-1111-4aaa-8000-000000000019',
    '55555555-eeee-4fff-8000-000000000005',
    'Ik heb het tijdslot 10 minuten voor je vastgehouden. Rond je bestelling af om te bevestigen. Succes met je boodschappen!',
    'bot',
    '2025-11-17T18:28:20+00:00',
    '2025-11-17T18:28:20+00:00',
    'jumboDemo-ma-001',
    'jumboDemo-liza',
    1750,
    '{"name": "react_happy2type_T"}'::jsonb,
    'wait_D',
    45, 40, 85, 'gpt-4.1-mini',
    0.0013, 0.0012, 'completed'
  )
ON CONFLICT (id) DO UPDATE SET
  message = EXCLUDED.message,
  author = EXCLUDED.author,
  timestamp = EXCLUDED.timestamp,
  response_time_ms = EXCLUDED.response_time_ms,
  response_animation = EXCLUDED.response_animation,
  wait_sequence = EXCLUDED.wait_sequence,
  prompt_tokens = EXCLUDED.prompt_tokens,
  completion_tokens = EXCLUDED.completion_tokens,
  total_tokens = EXCLUDED.total_tokens,
  model_used = EXCLUDED.model_used,
  cost_usd = EXCLUDED.cost_usd,
  cost_eur = EXCLUDED.cost_eur,
  finish_reason = EXCLUDED.finish_reason;

COMMIT;

-- ============================================================================
-- DONE - Liza now speaks Dutch with proper greetings and warmth
-- ============================================================================
