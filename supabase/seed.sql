-- ============================================================
-- Re:Fit — Seed (données initiales)
-- ============================================================

-- ============================================================
-- Cours
-- ============================================================

INSERT INTO courses (id, name, description, location, icon, tag, min_spots, max_spots, is_active, coming_soon) VALUES
(
  'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa',
  'Breath & Shock',
  'Immersion en breathwork et exposition au froid. Protocoles de respiration avancés, bain froid et travail sur la régulation du système nerveux.',
  'Forest (Rhode-Saint-Genèse)',
  '🧊',
  'Bien-être',
  5,
  8,
  true,
  false
),
(
  'aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa',
  'Ruck & Wild',
  'Marche sportive avec sac lesté en pleine nature. Cardio doux, renforcement fonctionnel et reconnexion à l'environnement.',
  'Château de La Hulpe',
  '🎒',
  'Outdoor',
  4,
  15,
  true,
  false
),
(
  'aaaaaaaa-0003-0003-0003-aaaaaaaaaaaa',
  'Build & Play Padel',
  'Session de renforcement musculaire et prévention spécifique au Padel. Joue mieux, joue sans douleur, joue plus longtemps.',
  'Padel 1640 (Rhode-Saint-Genèse)',
  '🎾',
  'Performance',
  4,
  8,
  true,
  true
);

-- ============================================================
-- Prix
-- ============================================================

-- Breath & Shock
INSERT INTO prices (course_id, label, price_key, amount, note) VALUES
('aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', 'Séance unique',       'unit', 4000,  NULL),
('aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', 'Pack 10 séances',     'pack', 36000, '36€/séance');

-- Ruck & Wild
INSERT INTO prices (course_id, label, price_key, amount, note) VALUES
('aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa', 'Séance unique',       'unit', 2700,  NULL),
('aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa', 'Pack 10 séances',     'pack', 25000, '25€/séance');

-- Build & Play Padel
INSERT INTO prices (course_id, label, price_key, amount, note) VALUES
('aaaaaaaa-0003-0003-0003-aaaaaaaaaaaa', 'Séance unique',       'unit', 3500,  NULL),
('aaaaaaaa-0003-0003-0003-aaaaaaaaaaaa', 'Pack 10 séances',     'pack', 32000, '32€/séance');

-- ============================================================
-- Sessions (6 prochaines semaines à partir d'aujourd'hui)
-- ============================================================

-- Breath & Shock — Samedi 9h00
INSERT INTO sessions (course_id, label, session_date) VALUES
('aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', 'Samedi — 9h00 à 10h45', CURRENT_DATE + ((6 - EXTRACT(DOW FROM CURRENT_DATE)::int) % 7 + 7) % 7 + 1),
('aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', 'Samedi — 9h00 à 10h45', CURRENT_DATE + ((6 - EXTRACT(DOW FROM CURRENT_DATE)::int) % 7 + 7) % 7 + 8),
('aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', 'Samedi — 9h00 à 10h45', CURRENT_DATE + ((6 - EXTRACT(DOW FROM CURRENT_DATE)::int) % 7 + 7) % 7 + 15),
('aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', 'Samedi — 9h00 à 10h45', CURRENT_DATE + ((6 - EXTRACT(DOW FROM CURRENT_DATE)::int) % 7 + 7) % 7 + 22),
('aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', 'Samedi — 9h00 à 10h45', CURRENT_DATE + ((6 - EXTRACT(DOW FROM CURRENT_DATE)::int) % 7 + 7) % 7 + 29);

-- Ruck & Wild — Vendredi 7h30
INSERT INTO sessions (course_id, label, session_date) VALUES
('aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa', 'Vendredi — 7h30 à 8h30', CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::int) % 7 + 7) % 7 + 1),
('aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa', 'Vendredi — 7h30 à 8h30', CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::int) % 7 + 7) % 7 + 8),
('aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa', 'Vendredi — 7h30 à 8h30', CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::int) % 7 + 7) % 7 + 15),
('aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa', 'Vendredi — 7h30 à 8h30', CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::int) % 7 + 7) % 7 + 22),
('aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa', 'Vendredi — 7h30 à 8h30', CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::int) % 7 + 7) % 7 + 29);

-- ============================================================
-- SGT — Créneaux
-- ============================================================

INSERT INTO sgt_slots (time_label, max_spots, is_active) VALUES
('Lundi — 7h00',    4, true),
('Mercredi — 12h30', 4, true),
('Jeudi — 18h30',   4, true);
