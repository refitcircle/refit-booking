-- ============================================================
-- Re:Fit — Schéma Supabase
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Tables
-- ============================================================

CREATE TABLE IF NOT EXISTS courses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  location    text,
  icon        text,
  tag         text,
  min_spots   integer DEFAULT 1,
  max_spots   integer NOT NULL,
  is_active   boolean DEFAULT true,
  coming_soon boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    uuid REFERENCES courses(id) ON DELETE CASCADE,
  label        text NOT NULL,
  session_date date NOT NULL,
  is_cancelled boolean DEFAULT false,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS prices (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id  uuid REFERENCES courses(id) ON DELETE CASCADE,
  label      text NOT NULL,
  price_key  text NOT NULL,   -- 'unit' | 'pack'
  amount     integer NOT NULL, -- en centimes
  note       text
);

CREATE TABLE IF NOT EXISTS bookings (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id     uuid REFERENCES sessions(id) ON DELETE CASCADE,
  first_name     text NOT NULL,
  last_name      text NOT NULL,
  email          text NOT NULL,
  phone          text,
  quantity       integer DEFAULT 1,
  price_key      text NOT NULL,   -- 'unit' | 'pack' | 'paid'
  payment_method text NOT NULL,   -- 'virement' | 'payconiq' | 'cash'
  total_amount   integer,         -- en centimes
  status         text DEFAULT 'confirmed', -- 'confirmed' | 'cancelled' | 'waitlist'
  waitlist_pos   integer,
  cancel_token   uuid DEFAULT gen_random_uuid(),
  created_at     timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sgt_slots (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  time_label text NOT NULL,
  max_spots  integer DEFAULT 4,
  is_active  boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sgt_interests (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id    uuid REFERENCES sgt_slots(id) ON DELETE CASCADE,
  name       text NOT NULL,
  email      text NOT NULL,
  level      text NOT NULL,  -- 'deb' | 'int' | 'con'
  message    text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS course_interests (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id  uuid REFERENCES courses(id) ON DELETE CASCADE,
  name       text NOT NULL,
  email      text NOT NULL,
  message    text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

ALTER TABLE courses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices         ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE sgt_slots      ENABLE ROW LEVEL SECURITY;
ALTER TABLE sgt_interests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_interests ENABLE ROW LEVEL SECURITY;

-- Lecture publique pour courses, sessions, prices, sgt_slots
CREATE POLICY "public_read_courses"    ON courses    FOR SELECT USING (true);
CREATE POLICY "public_read_sessions"   ON sessions   FOR SELECT USING (true);
CREATE POLICY "public_read_prices"     ON prices     FOR SELECT USING (true);
CREATE POLICY "public_read_sgt_slots"  ON sgt_slots  FOR SELECT USING (true);

-- Insertion publique pour bookings, sgt_interests, course_interests
CREATE POLICY "public_insert_bookings"          ON bookings          FOR INSERT WITH CHECK (true);
CREATE POLICY "public_insert_sgt_interests"     ON sgt_interests     FOR INSERT WITH CHECK (true);
CREATE POLICY "public_insert_course_interests"  ON course_interests  FOR INSERT WITH CHECK (true);

-- Lecture bookings par token (annulation)
CREATE POLICY "read_booking_by_token" ON bookings FOR SELECT
  USING (true);  -- filtré côté API par cancel_token

-- Service role : accès complet (API routes server-side)
-- Les routes API utilisent supabaseAdmin (service role) donc pas besoin de policies supplémentaires.
