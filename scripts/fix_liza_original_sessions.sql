-- ============================================================================
-- Fix Original 5 Liza sessions: Add easter field, mascot_shortcut
-- Scope: UPDATE existing 5 sessions from add_demo_chat_data_SAFE.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- Session 1: Store hours (c0053249-1d22-4da2-a5c0-4cb5b428dff1)
-- ============================================================================

UPDATE chat_sessions SET
  mascot_shortcut = 'jumboDemo-liza',
  full_transcript = '[{"author":"bot","easter":"","message":"Hallo! Welkom bij Jumbo. Hoe kan ik je helpen?","timestamp":"2025-11-15T09:15:30+00:00"},{"author":"user","message":"Hoi! Wat zijn jullie openingstijden?","timestamp":"2025-11-15T09:16:00+00:00"},{"author":"bot","easter":"","message":"Onze winkels zijn over het algemeen geopend van maandag t/m zaterdag van 8:00 tot 21:00. De exacte tijden kunnen per winkel verschillen. Je kunt je dichtstbijzijnde winkel bekijken op https://jumbo.com/stores/hours","timestamp":"2025-11-15T09:16:15+00:00"},{"author":"user","message":"En op zondag?","timestamp":"2025-11-15T09:18:00+00:00"},{"author":"bot","easter":"","message":"De meeste Jumbo winkels zijn ook op zondag geopend, meestal van 10:00 tot 18:00 of 12:00 tot 18:00. Dit verschilt per locatie.","timestamp":"2025-11-15T09:18:20+00:00"},{"author":"user","message":"Top, bedankt!","timestamp":"2025-11-15T09:21:45+00:00"},{"author":"bot","easter":"","message":"Graag gedaan! Fijne dag nog!","timestamp":"2025-11-15T09:21:50+00:00"}]'::jsonb,
  updated_at = NOW()
WHERE id = 'c0053249-1d22-4da2-a5c0-4cb5b428dff1';

UPDATE chat_session_analyses SET
  mascot_shortcut = 'jumboDemo-liza',
  custom_object1 = '{}'::jsonb,
  custom_object2 = '{}'::jsonb
WHERE session_id = 'c0053249-1d22-4da2-a5c0-4cb5b428dff1';

UPDATE chat_messages SET
  mascot_shortcut = 'jumboDemo-liza'
WHERE session_id = 'c0053249-1d22-4da2-a5c0-4cb5b428dff1';

-- ============================================================================
-- Session 2: Product inquiry (e63b4047-d0a2-422e-9005-b71cb132edf0)
-- ============================================================================

UPDATE chat_sessions SET
  mascot_shortcut = 'jumboDemo-liza',
  full_transcript = '[{"author":"bot","easter":"","message":"Hallo! Welkom bij Jumbo. Waarmee kan ik je helpen vandaag?","timestamp":"2025-11-15T10:30:15+00:00"},{"author":"user","message":"Hebben jullie biologische bananen?","timestamp":"2025-11-15T10:31:00+00:00"},{"author":"bot","easter":"","message":"Ja! Wij hebben biologische bananen in ons assortiment. Je kunt ze vinden in onze biologische afdeling. Bekijk ons biologische aanbod op https://jumbo.com/products/organic","timestamp":"2025-11-15T10:31:30+00:00"},{"author":"user","message":"Ze waren niet beschikbaar bij mij. Wanneer worden ze weer aangevuld?","timestamp":"2025-11-15T10:35:00+00:00"},{"author":"bot","easter":"","message":"De voorraad wordt dagelijks aangevuld, maar de exacte timing verschilt per winkel. Ik kan je helaas geen precieze datum geven voor wanneer ze weer beschikbaar zijn.","timestamp":"2025-11-15T10:35:45+00:00"},{"author":"user","message":"Welke andere biologische fruit hebben jullie?","timestamp":"2025-11-15T10:40:00+00:00"},{"author":"bot","easter":"","message":"We hebben een breed assortiment biologisch fruit: appels, peren, sinaasappels, citroenen, kiwis, druiven en meer. Het aanbod kan per seizoen variëren.","timestamp":"2025-11-15T10:40:30+00:00"},{"author":"user","message":"Oké bedankt","timestamp":"2025-11-15T10:44:30+00:00"},{"author":"bot","easter":"meditate","message":"Geen probleem! Als je nog vragen hebt, ben ik er voor je.","timestamp":"2025-11-15T10:44:45+00:00"}]'::jsonb,
  updated_at = NOW()
WHERE id = 'e63b4047-d0a2-422e-9005-b71cb132edf0';

UPDATE chat_session_analyses SET
  mascot_shortcut = 'jumboDemo-liza',
  custom_object1 = '{}'::jsonb,
  custom_object2 = '{}'::jsonb
WHERE session_id = 'e63b4047-d0a2-422e-9005-b71cb132edf0';

UPDATE chat_messages SET
  mascot_shortcut = 'jumboDemo-liza'
WHERE session_id = 'e63b4047-d0a2-422e-9005-b71cb132edf0';

-- ============================================================================
-- Session 3: Complaint - escalated (4d335ace-7f06-41ce-baad-817801104985)
-- ============================================================================

UPDATE chat_sessions SET
  mascot_shortcut = 'jumboDemo-liza',
  full_transcript = '[{"author":"bot","easter":"","message":"Hallo! Welkom bij Jumbo klantenservice. Hoe kan ik je helpen?","timestamp":"2025-11-15T14:00:20+00:00"},{"author":"user","message":"Ik heb een beschadigd product ontvangen!","timestamp":"2025-11-15T14:01:00+00:00"},{"author":"bot","easter":"","message":"Dat spijt me om te horen! Kan je me vertellen welk product beschadigd was en wanneer je het hebt gekocht?","timestamp":"2025-11-15T14:01:30+00:00"},{"author":"user","message":"Het was een glazen pot pasta saus, gisteren gekocht. De pot was gebarsten en alles lekte eruit.","timestamp":"2025-11-15T14:05:00+00:00"},{"author":"bot","easter":"","message":"Dat is echt vervelend. Mijn excuses hiervoor. Je hebt recht op vervanging of terugbetaling. Heb je je kassabon nog?","timestamp":"2025-11-15T14:05:45+00:00"},{"author":"user","message":"Ik wil mijn geld terug. Hoe krijg ik dat?","timestamp":"2025-11-15T14:10:00+00:00"},{"author":"bot","easter":"","message":"Je kunt naar de klantenservice balie in de winkel gaan met het product en je kassabon. Zij kunnen je direct helpen met de terugbetaling.","timestamp":"2025-11-15T14:10:30+00:00"},{"author":"user","message":"Hoe retourneer ik dit precies?","timestamp":"2025-11-15T14:15:00+00:00"},{"author":"bot","easter":"","message":"Voor specifieke vragen over retourneren kan ik je doorverbinden met onze klantenservice. Zij kunnen je verder helpen. Ik stuur je vraag door naar support@jumbo.com","timestamp":"2025-11-15T14:15:30+00:00"},{"author":"user","message":"Oké, doe maar","timestamp":"2025-11-15T14:17:45+00:00"},{"author":"bot","easter":"","message":"Je vraag is doorgestuurd naar onze klantenservice. Zij nemen zo snel mogelijk contact met je op. Sterkte!","timestamp":"2025-11-15T14:18:00+00:00"}]'::jsonb,
  updated_at = NOW()
WHERE id = '4d335ace-7f06-41ce-baad-817801104985';

UPDATE chat_session_analyses SET
  mascot_shortcut = 'jumboDemo-liza',
  custom_object1 = '{}'::jsonb,
  custom_object2 = '{}'::jsonb
WHERE session_id = '4d335ace-7f06-41ce-baad-817801104985';

UPDATE chat_messages SET
  mascot_shortcut = 'jumboDemo-liza'
WHERE session_id = '4d335ace-7f06-41ce-baad-817801104985';

-- ============================================================================
-- Session 4: Recipe Help (db540c07-209b-41f5-a306-3833939f842b)
-- ============================================================================

UPDATE chat_sessions SET
  mascot_shortcut = 'jumboDemo-liza',
  full_transcript = '[{"author":"bot","easter":"","message":"Hallo! Op zoek naar een lekker recept? Ik help je graag!","timestamp":"2025-11-16T08:45:10+00:00"},{"author":"user","message":"Welke recepten hebben jullie voor pasta?","timestamp":"2025-11-16T08:46:00+00:00"},{"author":"bot","easter":"","message":"We hebben honderden pasta recepten! Van klassieke spaghetti bolognese tot romige pasta carbonara en vegetarische opties. Bekijk onze pasta recepten op https://jumbo.com/recipes/pasta","timestamp":"2025-11-16T08:46:30+00:00"},{"author":"user","message":"Super, ga ik bekijken!","timestamp":"2025-11-16T08:51:30+00:00"},{"author":"bot","easter":"","message":"Eet smakelijk! Als je hulp nodig hebt bij het vinden van ingrediënten, laat het me weten.","timestamp":"2025-11-16T08:51:45+00:00"}]'::jsonb,
  updated_at = NOW()
WHERE id = 'db540c07-209b-41f5-a306-3833939f842b';

UPDATE chat_session_analyses SET
  mascot_shortcut = 'jumboDemo-liza',
  custom_object1 = '{}'::jsonb,
  custom_object2 = '{}'::jsonb
WHERE session_id = 'db540c07-209b-41f5-a306-3833939f842b';

UPDATE chat_messages SET
  mascot_shortcut = 'jumboDemo-liza'
WHERE session_id = 'db540c07-209b-41f5-a306-3833939f842b';

-- ============================================================================
-- Session 5: Store Information (a74fbb7d-bd43-4f3f-80e5-210c8600e959)
-- ============================================================================

UPDATE chat_sessions SET
  mascot_shortcut = 'jumboDemo-liza',
  full_transcript = '[{"author":"bot","easter":"","message":"Hallo! Welkom bij Jumbo. Kan ik je ergens mee helpen?","timestamp":"2025-11-16T12:15:20+00:00"},{"author":"user","message":"Waar is de dichtstbijzijnde winkel bij mij?","timestamp":"2025-11-16T12:16:00+00:00"},{"author":"bot","easter":"","message":"Je kunt onze winkelzoeker gebruiken om de dichtstbijzijnde Jumbo te vinden. Ga naar https://jumbo.com/stores of voer je postcode in op onze website.","timestamp":"2025-11-16T12:16:30+00:00"},{"author":"user","message":"Hebben jullie parkeergelegenheid?","timestamp":"2025-11-16T12:20:00+00:00"},{"author":"bot","easter":"","message":"De meeste van onze grotere winkels hebben gratis parkeergelegenheid. De beschikbaarheid verschilt per locatie - je kunt dit checken op de winkelpagina.","timestamp":"2025-11-16T12:20:30+00:00"},{"author":"user","message":"Is er ook een bakkerij afdeling?","timestamp":"2025-11-16T12:25:00+00:00"},{"author":"bot","easter":"","message":"Ja! De meeste Jumbo winkels hebben een verse bakkerij met brood, broodjes, gebak en taarten. Dagelijks vers gebakken!","timestamp":"2025-11-16T12:25:30+00:00"},{"author":"user","message":"Top, bedankt voor de info!","timestamp":"2025-11-16T12:27:45+00:00"},{"author":"bot","easter":"showLaptop","message":"Graag gedaan! Veel plezier met je bezoek aan Jumbo!","timestamp":"2025-11-16T12:28:00+00:00"}]'::jsonb,
  updated_at = NOW()
WHERE id = 'a74fbb7d-bd43-4f3f-80e5-210c8600e959';

UPDATE chat_session_analyses SET
  mascot_shortcut = 'jumboDemo-liza',
  custom_object1 = '{}'::jsonb,
  custom_object2 = '{}'::jsonb
WHERE session_id = 'a74fbb7d-bd43-4f3f-80e5-210c8600e959';

UPDATE chat_messages SET
  mascot_shortcut = 'jumboDemo-liza'
WHERE session_id = 'a74fbb7d-bd43-4f3f-80e5-210c8600e959';

COMMIT;
