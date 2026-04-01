-- HMG Healthcare Platform — Database Schema
-- HIPAA-compliant patient data schema

\c hmg_healthcare;

-- ── Patients ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mrn           VARCHAR(20) UNIQUE NOT NULL,        -- Medical Record Number
  full_name     TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender        VARCHAR(10),
  nationality   VARCHAR(50),
  phone         VARCHAR(20),
  email         VARCHAR(120),
  address       TEXT,
  insurance_id  VARCHAR(50),
  blood_type    VARCHAR(5),
  allergies     JSONB DEFAULT '[]',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Doctors ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doctors (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  specialty     TEXT NOT NULL,
  hospital      TEXT NOT NULL,
  rating        NUMERIC(2,1) DEFAULT 4.5,
  available     BOOLEAN DEFAULT TRUE,
  avatar        VARCHAR(4),
  avatar_color  VARCHAR(10),
  license_no    VARCHAR(50),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Appointments ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id     UUID REFERENCES doctors(id),
  doctor_name   TEXT NOT NULL,
  specialty     TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status        VARCHAR(20) DEFAULT 'upcoming'
                  CHECK (status IN ('upcoming','completed','cancelled','no-show')),
  chief_complaint TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Lab Results ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lab_results (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    UUID REFERENCES patients(id) ON DELETE CASCADE,
  test_name     TEXT NOT NULL,
  result_value  TEXT,
  unit          VARCHAR(30),
  reference_low NUMERIC,
  reference_high NUMERIC,
  status        VARCHAR(20) DEFAULT 'normal'
                  CHECK (status IN ('normal','low','high','critical')),
  notes         TEXT,
  entities      JSONB DEFAULT '[]',   -- BiomedBERT extracted entities
  ordered_by    TEXT,
  result_date   TIMESTAMPTZ DEFAULT NOW(),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Medications ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS medications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    UUID REFERENCES patients(id) ON DELETE CASCADE,
  drug_name     TEXT NOT NULL,
  dosage        TEXT,
  frequency     TEXT,
  route         VARCHAR(30),
  start_date    DATE,
  end_date      DATE,
  prescriber    TEXT,
  indication    TEXT,
  status        VARCHAR(20) DEFAULT 'active'
                  CHECK (status IN ('active','discontinued','completed')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Clinical Notes ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clinical_notes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    UUID REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id),
  note_type     VARCHAR(30) DEFAULT 'SOAP',
  content       TEXT NOT NULL,
  ai_summary    TEXT,
  entities      JSONB DEFAULT '[]',   -- Bio_ClinicalBERT NER
  author        TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Audit Log (HIPAA) ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id            BIGSERIAL PRIMARY KEY,
  user_id       TEXT,
  action        VARCHAR(50) NOT NULL,
  resource      VARCHAR(50),
  resource_id   UUID,
  ip_address    INET,
  user_agent    TEXT,
  details       JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_appointments_patient  ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status   ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date     ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_lab_patient           ON lab_results(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_date              ON lab_results(result_date);
CREATE INDEX IF NOT EXISTS idx_medications_patient   ON medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_audit_resource        ON audit_log(resource, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_created         ON audit_log(created_at);

-- ── Seed doctors ─────────────────────────────────────────────────────────────
INSERT INTO doctors (name, specialty, hospital, rating, available, avatar, avatar_color, license_no) VALUES
  ('Dr. Reem Al-Faraj',          'Cardiologist',       'HMG Hospital Riyadh',  4.9, true,  'RF', '#2D7DD2', 'SA-MED-001'),
  ('Dr. Khalid Al-Otaibi',       'Neurologist',        'HMG Hospital Jeddah',  4.8, true,  'KO', '#0F9B8E', 'SA-MED-002'),
  ('Dr. Noura Al-Qahtani',       'Orthopedic Surgeon', 'HMG Hospital Riyadh',  4.7, false, 'NQ', '#C9954A', 'SA-MED-003'),
  ('Dr. Faisal Al-Harbi',        'Ophthalmologist',    'HMG Hospital Dammam',  4.9, true,  'FH', '#1A3A6B', 'SA-MED-004'),
  ('Dr. Samar Al-Zahrani',       'Dermatologist',      'HMG Hospital Jeddah',  4.6, true,  'SZ', '#E8335A', 'SA-MED-005'),
  ('Dr. Abdulrahman Al-Shammari','Gastroenterologist',  'HMG Hospital Riyadh',  4.8, true,  'AS', '#0F9B8E', 'SA-MED-006')
ON CONFLICT DO NOTHING;

-- ── Seed demo patient ─────────────────────────────────────────────────────────
INSERT INTO patients (mrn, full_name, date_of_birth, gender, nationality, phone, blood_type, allergies) VALUES
  ('HMG-001', 'Ahmed Al-Rashid', '1983-06-15', 'Male', 'Saudi', '+966-50-000-0001', 'O+',
   '[{"drug":"Penicillin","reaction":"Rash","severity":"moderate"}]')
ON CONFLICT DO NOTHING;
