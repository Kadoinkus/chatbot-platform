-- ============================================================================
-- Fix Remco sessions: Dutch language, bot greeting first, response metadata
-- Scope: UPDATE existing 5 sessions from dd_remco_sessions.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- Session R1: Login issue (4cf3580e-72f8-456d-8d5c-d69f35a3c416)
-- memory_cache - no glb_transfer_size needed
-- ============================================================================

UPDATE chat_sessions SET
  total_bot_messages = 3,
  average_response_time_ms = 1800,
  full_transcript = '[{"author":"bot","easter":"","message":"Hoi! Ik ben Remco, je technische hulp bij Jumbo. Waar kan ik je mee helpen?","timestamp":"2025-11-15T08:10:15+00:00"},{"author":"user","message":"Ik kan niet inloggen op de app; hij blijft laden.","timestamp":"2025-11-15T08:10:20+00:00"},{"author":"bot","easter":"","message":"Sluit de app geforceerd af, wis de cache en controleer je WiFi of mobiele data.","timestamp":"2025-11-15T08:11:00+00:00"},{"author":"user","message":"Werkt nog steeds niet. Kan ik mijn wachtwoord resetten?","timestamp":"2025-11-15T08:12:00+00:00"},{"author":"bot","easter":"","message":"Ja. Ga naar https://jumbo.com/reset en check je spam als de email niet aankomt.","timestamp":"2025-11-15T08:13:30+00:00"}]'::jsonb,
  updated_at = NOW()
WHERE id = '4cf3580e-72f8-456d-8d5c-d69f35a3c416';

-- Insert bot greeting message for R1
INSERT INTO chat_messages (
  id, session_id, message, author, timestamp, created_at,
  mascot_slug, mascot_shortcut,
  response_time_ms, response_animation, wait_sequence,
  prompt_tokens, completion_tokens, total_tokens, model_used,
  cost_usd, cost_eur, finish_reason
) VALUES (
  'c3003003-0001-4003-8003-000000000001',
  '4cf3580e-72f8-456d-8d5c-d69f35a3c416',
  'Hoi! Ik ben Remco, je technische hulp bij Jumbo. Waar kan ik je mee helpen?',
  'bot',
  '2025-11-15T08:10:15+00:00',
  '2025-11-15T08:10:15+00:00',
  'jumboDemo-ma-002', 'jumboDemo-Remco',
  500, '{"name": "react_happy2type_T"}'::jsonb, 'wait_A',
  20, 28, 48, 'gpt-4.1-mini',
  0.0007, 0.0006, 'completed'
) ON CONFLICT (id) DO NOTHING;

-- Update R1 existing messages to Dutch with metadata
UPDATE chat_messages SET
  message = 'Ik kan niet inloggen op de app; hij blijft laden.'
WHERE id = 'df54a642-54c1-4777-afd9-13d8e30bf29c';

UPDATE chat_messages SET
  message = 'Sluit de app geforceerd af, wis de cache en controleer je WiFi of mobiele data.',
  response_time_ms = 1850,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = 'wait_B',
  prompt_tokens = 48,
  completion_tokens = 45,
  total_tokens = 93,
  model_used = 'gpt-4.1-mini',
  cost_usd = 0.0014,
  cost_eur = 0.0013,
  finish_reason = 'completed'
WHERE id = '50ab79ba-48e4-44ea-99f4-360ecf945015';

UPDATE chat_messages SET
  message = 'Werkt nog steeds niet. Kan ik mijn wachtwoord resetten?'
WHERE id = '2a5e8261-7f3c-46a6-830a-b9e2bdf11b30';

UPDATE chat_messages SET
  message = 'Ja. Ga naar https://jumbo.com/reset en check je spam als de email niet aankomt.',
  response_time_ms = 1900,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = 'wait_C',
  prompt_tokens = 52,
  completion_tokens = 42,
  total_tokens = 94,
  model_used = 'gpt-4.1-mini',
  cost_usd = 0.0014,
  cost_eur = 0.0013,
  finish_reason = 'completed'
WHERE id = 'e3e80cf1-280c-42fe-a706-65d116c454d2';

-- Update R1 analysis
UPDATE chat_session_analyses SET
  language = 'nl',
  summary = 'Inlogprobleem opgelost met cache wissen en wachtwoord reset instructies.',
  custom_object1 = '{}'::jsonb,
  custom_object2 = '{}'::jsonb
WHERE session_id = '4cf3580e-72f8-456d-8d5c-d69f35a3c416';

-- ============================================================================
-- Session R2: Payment error (62745cd2-0f01-4f96-96d6-169c04f83097)
-- cdn_fetch - needs glb_transfer_size
-- ============================================================================

UPDATE chat_sessions SET
  total_bot_messages = 3,
  average_response_time_ms = 2100,
  glb_transfer_size = 20345678,
  full_transcript = '[{"author":"bot","easter":"","message":"Hallo! Ik ben Remco van technische support. Hoe kan ik je helpen?","timestamp":"2025-11-15T11:05:05+00:00"},{"author":"user","message":"Mijn betaling mislukt met fout 102 bij het afrekenen.","timestamp":"2025-11-15T11:05:10+00:00"},{"author":"bot","easter":"","message":"Fout 102 betekent meestal dat de bank heeft geweigerd. Probeer opnieuw met 3D Secure en bijgewerkte kaartgegevens.","timestamp":"2025-11-15T11:05:50+00:00"},{"author":"user","message":"Kaart is goed. Kan ik PayPal gebruiken?","timestamp":"2025-11-15T11:07:00+00:00"},{"author":"bot","easter":"","message":"Ja, PayPal en iDEAL worden ondersteund. Als het opnieuw mislukt, probeer een andere browser en deel de laatste vier cijfers zodat ik de gateway logs kan checken.","timestamp":"2025-11-15T11:08:20+00:00"}]'::jsonb,
  updated_at = NOW()
WHERE id = '62745cd2-0f01-4f96-96d6-169c04f83097';

-- Insert bot greeting message for R2
INSERT INTO chat_messages (
  id, session_id, message, author, timestamp, created_at,
  mascot_slug, mascot_shortcut,
  response_time_ms, response_animation, wait_sequence,
  prompt_tokens, completion_tokens, total_tokens, model_used,
  cost_usd, cost_eur, finish_reason
) VALUES (
  'c3003003-0002-4003-8003-000000000001',
  '62745cd2-0f01-4f96-96d6-169c04f83097',
  'Hallo! Ik ben Remco van technische support. Hoe kan ik je helpen?',
  'bot',
  '2025-11-15T11:05:05+00:00',
  '2025-11-15T11:05:05+00:00',
  'jumboDemo-ma-002', 'jumboDemo-Remco',
  500, '{"name": "react_happy2type_T"}'::jsonb, 'wait_A',
  20, 24, 44, 'gpt-4.1-mini',
  0.0007, 0.0006, 'completed'
) ON CONFLICT (id) DO NOTHING;

-- Update R2 existing messages
UPDATE chat_messages SET
  message = 'Mijn betaling mislukt met fout 102 bij het afrekenen.'
WHERE id = '81485b7a-e93a-43b4-b7e8-355297990bb9';

UPDATE chat_messages SET
  message = 'Fout 102 betekent meestal dat de bank heeft geweigerd. Probeer opnieuw met 3D Secure en bijgewerkte kaartgegevens.',
  response_time_ms = 2150,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = 'wait_B',
  prompt_tokens = 50,
  completion_tokens = 52,
  total_tokens = 102,
  model_used = 'gpt-4.1-mini',
  cost_usd = 0.0015,
  cost_eur = 0.0014,
  finish_reason = 'completed'
WHERE id = '9e0badd2-119e-4a43-8e88-d24863a4723b';

UPDATE chat_messages SET
  message = 'Kaart is goed. Kan ik PayPal gebruiken?'
WHERE id = '975f75fc-9115-476e-a044-795ef328d26b';

UPDATE chat_messages SET
  message = 'Ja, PayPal en iDEAL worden ondersteund. Als het opnieuw mislukt, probeer een andere browser en deel de laatste vier cijfers zodat ik de gateway logs kan checken.',
  response_time_ms = 2200,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = 'wait_C',
  prompt_tokens = 58,
  completion_tokens = 60,
  total_tokens = 118,
  model_used = 'gpt-4.1-mini',
  cost_usd = 0.0018,
  cost_eur = 0.0017,
  finish_reason = 'completed'
WHERE id = '4010b98b-af82-4e74-aeac-89f0ebd5e66f';

-- Update R2 analysis
UPDATE chat_session_analyses SET
  language = 'nl',
  summary = 'Betalingsfout 102 uitgelegd; alternatieve betaalmethoden aangeboden.',
  custom_object1 = '{}'::jsonb,
  custom_object2 = '{}'::jsonb
WHERE session_id = '62745cd2-0f01-4f96-96d6-169c04f83097';

-- ============================================================================
-- Session R3: App slow (65795eaa-4e38-425e-8351-ba64c7909001)
-- memory_cache - no glb_transfer_size needed
-- ============================================================================

UPDATE chat_sessions SET
  total_bot_messages = 3,
  average_response_time_ms = 2000,
  full_transcript = '[{"author":"bot","easter":"","message":"Hoi! Ik ben Remco, technisch adviseur. Waar loop je tegenaan?","timestamp":"2025-11-15T14:45:05+00:00"},{"author":"user","message":"De app laadt mijn winkelwagen heel langzaam.","timestamp":"2025-11-15T14:45:10+00:00"},{"author":"bot","easter":"","message":"Wis de gecachte data in instellingen en update naar de nieuwste versie. Is je verbinding stabiel?","timestamp":"2025-11-15T14:45:55+00:00"},{"author":"user","message":"Verbinding is goed; nog steeds traag.","timestamp":"2025-11-15T14:47:00+00:00"},{"author":"bot","easter":"","message":"Ik heb zware afbeeldingen beperkt en een ticket aangemaakt. Probeer het over een minuut opnieuw en laat weten of het sneller is.","timestamp":"2025-11-15T14:48:20+00:00"}]'::jsonb,
  updated_at = NOW()
WHERE id = '65795eaa-4e38-425e-8351-ba64c7909001';

-- Insert bot greeting message for R3
INSERT INTO chat_messages (
  id, session_id, message, author, timestamp, created_at,
  mascot_slug, mascot_shortcut,
  response_time_ms, response_animation, wait_sequence,
  prompt_tokens, completion_tokens, total_tokens, model_used,
  cost_usd, cost_eur, finish_reason
) VALUES (
  'c3003003-0003-4003-8003-000000000001',
  '65795eaa-4e38-425e-8351-ba64c7909001',
  'Hoi! Ik ben Remco, technisch adviseur. Waar loop je tegenaan?',
  'bot',
  '2025-11-15T14:45:05+00:00',
  '2025-11-15T14:45:05+00:00',
  'jumboDemo-ma-002', 'jumboDemo-Remco',
  500, '{"name": "react_happy2type_T"}'::jsonb, 'wait_A',
  20, 22, 42, 'gpt-4.1-mini',
  0.0006, 0.0005, 'completed'
) ON CONFLICT (id) DO NOTHING;

-- Update R3 existing messages
UPDATE chat_messages SET
  message = 'De app laadt mijn winkelwagen heel langzaam.'
WHERE id = '00399ae8-2682-4a42-8275-ebfceea4d924';

UPDATE chat_messages SET
  message = 'Wis de gecachte data in instellingen en update naar de nieuwste versie. Is je verbinding stabiel?',
  response_time_ms = 2050,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = 'wait_B',
  prompt_tokens = 48,
  completion_tokens = 48,
  total_tokens = 96,
  model_used = 'gpt-4.1-mini',
  cost_usd = 0.0014,
  cost_eur = 0.0013,
  finish_reason = 'completed'
WHERE id = 'dfbca4c9-f74b-400c-8c88-297429f343e9';

UPDATE chat_messages SET
  message = 'Verbinding is goed; nog steeds traag.'
WHERE id = '839d7565-266b-4caa-ae70-6b9b6bd23b8a';

UPDATE chat_messages SET
  message = 'Ik heb zware afbeeldingen beperkt en een ticket aangemaakt. Probeer het over een minuut opnieuw en laat weten of het sneller is.',
  response_time_ms = 2100,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = 'wait_C',
  prompt_tokens = 55,
  completion_tokens = 55,
  total_tokens = 110,
  model_used = 'gpt-4.1-mini',
  cost_usd = 0.0016,
  cost_eur = 0.0015,
  finish_reason = 'completed'
WHERE id = 'cb6cc560-328a-41ba-b060-3a4faf184f7f';

-- Update R3 analysis
UPDATE chat_session_analyses SET
  language = 'nl',
  summary = 'Prestatieprobleem verholpen door cache te wissen en afbeeldingen te beperken.',
  custom_object1 = '{}'::jsonb,
  custom_object2 = '{}'::jsonb
WHERE session_id = '65795eaa-4e38-425e-8351-ba64c7909001';

-- ============================================================================
-- Session R4: Verification email (55d39914-4894-499c-9c6c-780826d91255)
-- cdn_fetch - needs glb_transfer_size
-- ============================================================================

UPDATE chat_sessions SET
  total_bot_messages = 3,
  average_response_time_ms = 1900,
  glb_transfer_size = 19876543,
  full_transcript = '[{"author":"bot","easter":"","message":"Hallo! Ik ben Remco van support. Waarmee kan ik je helpen?","timestamp":"2025-11-16T09:20:10+00:00"},{"author":"user","message":"Ik heb geen verificatie-email ontvangen na registratie.","timestamp":"2025-11-16T09:20:15+00:00"},{"author":"bot","easter":"","message":"Check je spam en controleer of het emailadres correct gespeld is. Wil je dat ik hem opnieuw verstuur?","timestamp":"2025-11-16T09:20:50+00:00"},{"author":"user","message":"Ja, verstuur naar remco.test@demo.com.","timestamp":"2025-11-16T09:22:05+00:00"},{"author":"bot","easter":"","message":"Opnieuw verstuurd. Als hij binnen 5 minuten niet aankomt, kan ik je overzetten naar SMS-verificatie.","timestamp":"2025-11-16T09:23:20+00:00"}]'::jsonb,
  updated_at = NOW()
WHERE id = '55d39914-4894-499c-9c6c-780826d91255';

-- Insert bot greeting message for R4
INSERT INTO chat_messages (
  id, session_id, message, author, timestamp, created_at,
  mascot_slug, mascot_shortcut,
  response_time_ms, response_animation, wait_sequence,
  prompt_tokens, completion_tokens, total_tokens, model_used,
  cost_usd, cost_eur, finish_reason
) VALUES (
  'c3003003-0004-4003-8003-000000000001',
  '55d39914-4894-499c-9c6c-780826d91255',
  'Hallo! Ik ben Remco van support. Waarmee kan ik je helpen?',
  'bot',
  '2025-11-16T09:20:10+00:00',
  '2025-11-16T09:20:10+00:00',
  'jumboDemo-ma-002', 'jumboDemo-Remco',
  500, '{"name": "react_happy2type_T"}'::jsonb, 'wait_A',
  20, 22, 42, 'gpt-4.1-mini',
  0.0006, 0.0005, 'completed'
) ON CONFLICT (id) DO NOTHING;

-- Update R4 existing messages
UPDATE chat_messages SET
  message = 'Ik heb geen verificatie-email ontvangen na registratie.'
WHERE id = '3f688bf1-2bc3-4d7a-ad80-64fdc0ccf788';

UPDATE chat_messages SET
  message = 'Check je spam en controleer of het emailadres correct gespeld is. Wil je dat ik hem opnieuw verstuur?',
  response_time_ms = 1950,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = 'wait_B',
  prompt_tokens = 50,
  completion_tokens = 48,
  total_tokens = 98,
  model_used = 'gpt-4.1-mini',
  cost_usd = 0.0015,
  cost_eur = 0.0014,
  finish_reason = 'completed'
WHERE id = '57e102b3-f5fa-4e25-af09-3c72d4467f9a';

UPDATE chat_messages SET
  message = 'Ja, verstuur naar remco.test@demo.com.'
WHERE id = '24e7e8c1-6973-448a-8000-5fa05e4a0211';

UPDATE chat_messages SET
  message = 'Opnieuw verstuurd. Als hij binnen 5 minuten niet aankomt, kan ik je overzetten naar SMS-verificatie.',
  response_time_ms = 1950,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = 'wait_C',
  prompt_tokens = 52,
  completion_tokens = 45,
  total_tokens = 97,
  model_used = 'gpt-4.1-mini',
  cost_usd = 0.0015,
  cost_eur = 0.0014,
  finish_reason = 'completed'
WHERE id = 'd31205ba-b23a-4e85-b383-1e484fd6571e';

-- Update R4 analysis
UPDATE chat_session_analyses SET
  language = 'nl',
  summary = 'Verificatie-email opnieuw verstuurd; SMS-optie aangeboden als backup.',
  custom_object1 = '{}'::jsonb,
  custom_object2 = '{}'::jsonb
WHERE session_id = '55d39914-4894-499c-9c6c-780826d91255';

-- ============================================================================
-- Session R5: 2FA issue (36c4ead3-d5d6-41f5-b86b-f0aa70bc22ed)
-- memory_cache - no glb_transfer_size needed
-- ============================================================================

UPDATE chat_sessions SET
  total_bot_messages = 3,
  average_response_time_ms = 2200,
  full_transcript = '[{"author":"bot","easter":"","message":"Hoi! Ik ben Remco, je tech support. Wat is het probleem?","timestamp":"2025-11-16T12:40:05+00:00"},{"author":"user","message":"De 2FA-code blijft falen als ik inlog op desktop.","timestamp":"2025-11-16T12:40:10+00:00"},{"author":"bot","easter":"","message":"Codes verlopen na 30 seconden. Synchroniseer de tijd op je apparaat automatisch en probeer opnieuw.","timestamp":"2025-11-16T12:40:55+00:00"},{"author":"user","message":"Geprobeerd; nog steeds ongeldig.","timestamp":"2025-11-16T12:42:05+00:00"},{"author":"bot","easter":"","message":"Ik heb je 2FA-geheim gereset en een nieuwe QR-code naar je email gestuurd. Scan hem en bevestig met de volgende code.","timestamp":"2025-11-16T12:43:25+00:00"}]'::jsonb,
  updated_at = NOW()
WHERE id = '36c4ead3-d5d6-41f5-b86b-f0aa70bc22ed';

-- Insert bot greeting message for R5
INSERT INTO chat_messages (
  id, session_id, message, author, timestamp, created_at,
  mascot_slug, mascot_shortcut,
  response_time_ms, response_animation, wait_sequence,
  prompt_tokens, completion_tokens, total_tokens, model_used,
  cost_usd, cost_eur, finish_reason
) VALUES (
  'c3003003-0005-4003-8003-000000000001',
  '36c4ead3-d5d6-41f5-b86b-f0aa70bc22ed',
  'Hoi! Ik ben Remco, je tech support. Wat is het probleem?',
  'bot',
  '2025-11-16T12:40:05+00:00',
  '2025-11-16T12:40:05+00:00',
  'jumboDemo-ma-002', 'jumboDemo-Remco',
  500, '{"name": "react_happy2type_T"}'::jsonb, 'wait_A',
  20, 22, 42, 'gpt-4.1-mini',
  0.0006, 0.0005, 'completed'
) ON CONFLICT (id) DO NOTHING;

-- Update R5 existing messages
UPDATE chat_messages SET
  message = 'De 2FA-code blijft falen als ik inlog op desktop.'
WHERE id = 'cda2d7f3-7c38-4e02-8600-6573078ff019';

UPDATE chat_messages SET
  message = 'Codes verlopen na 30 seconden. Synchroniseer de tijd op je apparaat automatisch en probeer opnieuw.',
  response_time_ms = 2250,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = 'wait_B',
  prompt_tokens = 48,
  completion_tokens = 45,
  total_tokens = 93,
  model_used = 'gpt-4.1-mini',
  cost_usd = 0.0014,
  cost_eur = 0.0013,
  finish_reason = 'completed'
WHERE id = '408bd873-788f-4dbc-877c-7950a52f3daa';

UPDATE chat_messages SET
  message = 'Geprobeerd; nog steeds ongeldig.'
WHERE id = '582e85c6-aeec-4209-a3eb-5bc02a8216f4';

UPDATE chat_messages SET
  message = 'Ik heb je 2FA-geheim gereset en een nieuwe QR-code naar je email gestuurd. Scan hem en bevestig met de volgende code.',
  response_time_ms = 2300,
  response_animation = '{"name": "react_happy2type_T"}'::jsonb,
  wait_sequence = 'wait_C',
  prompt_tokens = 55,
  completion_tokens = 52,
  total_tokens = 107,
  model_used = 'gpt-4.1-mini',
  cost_usd = 0.0016,
  cost_eur = 0.0015,
  finish_reason = 'completed'
WHERE id = '4e122ea0-72c9-4b05-b955-e21794415b29';

-- Update R5 analysis
UPDATE chat_session_analyses SET
  language = 'nl',
  summary = '2FA-codes vernieuwd en nieuwe QR-code verstuurd.',
  custom_object1 = '{}'::jsonb,
  custom_object2 = '{}'::jsonb
WHERE session_id = '36c4ead3-d5d6-41f5-b86b-f0aa70bc22ed';

COMMIT;
