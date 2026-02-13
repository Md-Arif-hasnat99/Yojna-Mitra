-- ============================================================================
-- YojnaMitra — Complete Supabase Database Setup
-- ============================================================================
-- Platform  : Supabase (PostgreSQL 15+)
-- Updated   : 2026-02-13
-- Usage     : Open Supabase SQL Editor → paste this ENTIRE file → Run
-- ============================================================================
--
-- This single file handles EVERYTHING:
--   1. Nuclear reset  — drops every old object safely
--   2. Extensions
--   3. Tables         — user_profiles, admins, schemes, user_saved_schemes,
--                        scheme_checks, feedback, notifications
--   4. Indexes
--   5. Row Level Security (RLS) — no infinite-recursion issues
--   6. Functions & Triggers
--   7. Seed data      — 70+ real government schemes (central + state)
--   8. Admin bootstrap instructions
--
-- ============================================================================


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  SECTION 0 — NUCLEAR RESET  (safe to re-run)                          ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- Drop policies first (tables referenced in USING clauses must still exist)
DO $$ DECLARE pol RECORD; BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM   pg_policies
    WHERE  schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- Drop triggers (wrapped safely — tables may not exist on first run)
DO $$ BEGIN
  DROP TRIGGER IF EXISTS trg_user_profiles_updated_at  ON user_profiles;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  DROP TRIGGER IF EXISTS trg_schemes_updated_at ON schemes;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  DROP TRIGGER IF EXISTS trg_saved_schemes_updated_at ON user_saved_schemes;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  DROP TRIGGER IF EXISTS trg_feedback_updated_at ON feedback;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  DROP TRIGGER IF EXISTS trg_schemes_search_vector ON schemes;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column()          CASCADE;
DROP FUNCTION IF EXISTS get_scheme_statistics()              CASCADE;
DROP FUNCTION IF EXISTS get_admin_dashboard_stats()          CASCADE;
DROP FUNCTION IF EXISTS search_schemes_fts(TEXT)             CASCADE;

-- Drop tables (CASCADE removes FK deps)
DROP TABLE IF EXISTS notifications      CASCADE;
DROP TABLE IF EXISTS feedback            CASCADE;
DROP TABLE IF EXISTS scheme_checks       CASCADE;
DROP TABLE IF EXISTS user_saved_schemes  CASCADE;
DROP TABLE IF EXISTS schemes             CASCADE;
DROP TABLE IF EXISTS admins              CASCADE;
DROP TABLE IF EXISTS user_profiles       CASCADE;


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  SECTION 1 — EXTENSIONS                                               ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- fuzzy text search


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  SECTION 2 — TABLES                                                    ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- --------------------------------------------------------------------------
-- 2.1  user_profiles
-- --------------------------------------------------------------------------
CREATE TABLE user_profiles (
  id                  UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name           TEXT        NOT NULL,
  email               TEXT,
  phone_number        TEXT,
  age                 INTEGER     CHECK (age >= 0 AND age <= 120),
  gender              TEXT        CHECK (gender IN ('Male', 'Female', 'Other')),
  state               TEXT        NOT NULL DEFAULT '',
  district            TEXT,
  pincode             TEXT,
  category            TEXT        CHECK (category IN ('General', 'SC', 'ST', 'OBC')),
  occupation          TEXT,
  income_bracket      TEXT,
  annual_income       NUMERIC,
  education_level     TEXT        CHECK (education_level IN (
                                    'No Formal Education', 'Primary', 'Secondary',
                                    'Higher Secondary', 'Graduate', 'Post Graduate', 'Doctorate'
                                  )),
  family_size         INTEGER     CHECK (family_size >= 1),
  has_bpl_card        BOOLEAN     DEFAULT FALSE,
  is_differently_abled BOOLEAN   DEFAULT FALSE,
  disability_percentage INTEGER  CHECK (disability_percentage >= 0 AND disability_percentage <= 100),
  is_minority         BOOLEAN     DEFAULT FALSE,
  is_rural            BOOLEAN     DEFAULT FALSE,
  marital_status      TEXT        CHECK (marital_status IN ('Single', 'Married', 'Widowed', 'Divorced', 'Separated')),
  aadhaar_linked      BOOLEAN     DEFAULT FALSE,
  bank_account_linked BOOLEAN     DEFAULT FALSE,
  language_preference TEXT        DEFAULT 'en' CHECK (language_preference IN ('hi', 'en')),
  profile_complete    BOOLEAN     DEFAULT FALSE,
  avatar_url          TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE user_profiles IS 'Extended user profile linked 1-1 with auth.users';

-- --------------------------------------------------------------------------
-- 2.2  admins
-- --------------------------------------------------------------------------
CREATE TABLE admins (
  user_id     UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT        DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE admins IS 'Admin role lookup — checked by RLS policies via auth.role()';

-- --------------------------------------------------------------------------
-- 2.3  schemes
-- --------------------------------------------------------------------------
CREATE TABLE schemes (
  id                    UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  scheme_name           TEXT        NOT NULL,
  scheme_name_hi        TEXT,
  description           TEXT        NOT NULL,
  description_hi        TEXT,
  benefit_amount        TEXT        NOT NULL,
  benefit_amount_numeric NUMERIC,
  eligibility_criteria  JSONB       NOT NULL DEFAULT '{}'::JSONB,
  /*
    eligibility_criteria JSONB shape:
    {
      "age_min": 18,
      "age_max": 60,
      "income_max": 250000,
      "categories": ["General", "SC", "ST", "OBC"],
      "states": ["All States"],
      "occupation": "Farmer",
      "gender": null,
      "education_min": null,
      "is_bpl_required": false,
      "is_differently_abled": false,
      "is_minority": false,
      "is_rural": false,
      "marital_status": null,
      "special_conditions": []
    }
  */
  documents_required    TEXT[]      NOT NULL DEFAULT '{}',
  documents_required_hi TEXT[]      DEFAULT '{}',
  application_link      TEXT,
  application_deadline  DATE,
  ministry              TEXT,
  department            TEXT,
  scheme_type           TEXT        NOT NULL CHECK (scheme_type IN ('central', 'state')),
  scheme_category       TEXT        CHECK (scheme_category IN (
                                      'Agriculture', 'Education', 'Health', 'Housing',
                                      'Employment', 'Social Security', 'Women & Child',
                                      'Skill Development', 'Finance & Insurance',
                                      'Infrastructure', 'Environment', 'Other'
                                    )),
  applicable_states     TEXT[]      NOT NULL DEFAULT '{}',
  is_active             BOOLEAN     DEFAULT TRUE,
  is_featured           BOOLEAN     DEFAULT FALSE,
  tags                  TEXT[]      DEFAULT '{}',
  how_to_apply          TEXT,
  how_to_apply_hi       TEXT,
  helpline_number       TEXT,
  official_website      TEXT,
  launch_date           DATE,
  created_by            UUID        REFERENCES auth.users(id),
  created_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- Full-text search vector (auto-populated by trigger)
  search_vector         TSVECTOR
);

COMMENT ON TABLE schemes IS 'Government schemes with bilingual data & JSONB eligibility criteria';

-- --------------------------------------------------------------------------
-- 2.4  user_saved_schemes
-- --------------------------------------------------------------------------
CREATE TABLE user_saved_schemes (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheme_id   UUID        NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
  status      TEXT        DEFAULT 'interested' CHECK (status IN ('interested', 'applied', 'received', 'rejected')),
  notes       TEXT,
  applied_at  TIMESTAMPTZ,
  saved_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, scheme_id)
);

COMMENT ON TABLE user_saved_schemes IS 'Junction table — user bookmarks / application tracking';

-- --------------------------------------------------------------------------
-- 2.5  scheme_checks  (analytics)
-- --------------------------------------------------------------------------
CREATE TABLE scheme_checks (
  id                    UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  search_criteria       JSONB,
  matched_schemes_count INTEGER,
  result_scheme_ids     UUID[],
  ip_address            INET,
  user_agent            TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE scheme_checks IS 'Eligibility-check log for analytics';

-- --------------------------------------------------------------------------
-- 2.6  feedback
-- --------------------------------------------------------------------------
CREATE TABLE feedback (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  scheme_id   UUID        REFERENCES schemes(id) ON DELETE SET NULL,
  rating      INTEGER     CHECK (rating >= 1 AND rating <= 5),
  comment     TEXT,
  feedback_type TEXT      DEFAULT 'general' CHECK (feedback_type IN ('general', 'scheme', 'bug', 'feature')),
  is_resolved BOOLEAN     DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE feedback IS 'User feedback & scheme ratings';

-- --------------------------------------------------------------------------
-- 2.7  notifications
-- --------------------------------------------------------------------------
CREATE TABLE notifications (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  title_hi    TEXT,
  message     TEXT        NOT NULL,
  message_hi  TEXT,
  type        TEXT        DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'scheme_update', 'new_scheme')),
  scheme_id   UUID        REFERENCES schemes(id) ON DELETE SET NULL,
  is_read     BOOLEAN     DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE notifications IS 'In-app user notifications (bilingual)';


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  SECTION 3 — INDEXES                                                   ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- user_profiles
CREATE INDEX idx_profiles_state       ON user_profiles(state);
CREATE INDEX idx_profiles_category    ON user_profiles(category);
CREATE INDEX idx_profiles_occupation  ON user_profiles(occupation);
CREATE INDEX idx_profiles_complete    ON user_profiles(profile_complete);

-- schemes
CREATE INDEX idx_schemes_type         ON schemes(scheme_type);
CREATE INDEX idx_schemes_active       ON schemes(is_active);
CREATE INDEX idx_schemes_featured     ON schemes(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_schemes_category     ON schemes(scheme_category);
CREATE INDEX idx_schemes_states       ON schemes USING GIN(applicable_states);
CREATE INDEX idx_schemes_criteria     ON schemes USING GIN(eligibility_criteria);
CREATE INDEX idx_schemes_tags         ON schemes USING GIN(tags);
CREATE INDEX idx_schemes_search       ON schemes USING GIN(search_vector);
CREATE INDEX idx_schemes_deadline     ON schemes(application_deadline) WHERE application_deadline IS NOT NULL;

-- user_saved_schemes
CREATE INDEX idx_saved_user           ON user_saved_schemes(user_id);
CREATE INDEX idx_saved_scheme         ON user_saved_schemes(scheme_id);
CREATE INDEX idx_saved_status         ON user_saved_schemes(status);

-- scheme_checks
CREATE INDEX idx_checks_user          ON scheme_checks(user_id);
CREATE INDEX idx_checks_date          ON scheme_checks(created_at);

-- feedback
CREATE INDEX idx_feedback_user        ON feedback(user_id);
CREATE INDEX idx_feedback_scheme      ON feedback(scheme_id);
CREATE INDEX idx_feedback_type        ON feedback(feedback_type);

-- notifications
CREATE INDEX idx_notif_user           ON notifications(user_id);
CREATE INDEX idx_notif_unread         ON notifications(user_id, is_read) WHERE is_read = FALSE;


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  SECTION 4 — ROW LEVEL SECURITY (RLS)                                 ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- Enable RLS on every table
ALTER TABLE user_profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins              ENABLE ROW LEVEL SECURITY;
ALTER TABLE schemes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_schemes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheme_checks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback            ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications       ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------------------
-- 4.1  admins — MUST be defined FIRST (other policies reference it)
--      Using auth.uid() = user_id avoids infinite recursion
-- -------------------------------------------------------------------------
CREATE POLICY "Anyone authenticated can read admins"
  ON admins FOR SELECT
  USING ( auth.role() = 'authenticated' );

CREATE POLICY "Super admins can insert admins"
  ON admins FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Super admins can delete admins"
  ON admins FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid() AND role = 'super_admin')
  );

-- -------------------------------------------------------------------------
-- 4.2  user_profiles
-- -------------------------------------------------------------------------
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING ( auth.uid() = id );

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING ( auth.uid() = id )
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- -------------------------------------------------------------------------
-- 4.3  schemes
-- -------------------------------------------------------------------------
CREATE POLICY "Anyone can view active schemes"
  ON schemes FOR SELECT
  USING ( is_active = TRUE );

CREATE POLICY "Admins can view all schemes"
  ON schemes FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can insert schemes"
  ON schemes FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can update schemes"
  ON schemes FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can delete schemes"
  ON schemes FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- -------------------------------------------------------------------------
-- 4.4  user_saved_schemes
-- -------------------------------------------------------------------------
CREATE POLICY "Users can view own saved schemes"
  ON user_saved_schemes FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can save schemes"
  ON user_saved_schemes FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update own saved schemes"
  ON user_saved_schemes FOR UPDATE
  USING ( auth.uid() = user_id )
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can delete own saved schemes"
  ON user_saved_schemes FOR DELETE
  USING ( auth.uid() = user_id );

CREATE POLICY "Admins can view all saved schemes"
  ON user_saved_schemes FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- -------------------------------------------------------------------------
-- 4.5  scheme_checks
-- -------------------------------------------------------------------------
CREATE POLICY "Users can view own checks"
  ON scheme_checks FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Authenticated users can insert checks"
  ON scheme_checks FOR INSERT
  WITH CHECK ( auth.uid() IS NOT NULL );

CREATE POLICY "Admins can view all checks"
  ON scheme_checks FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- -------------------------------------------------------------------------
-- 4.6  feedback
-- -------------------------------------------------------------------------
CREATE POLICY "Users can view own feedback"
  ON feedback FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Authenticated users can submit feedback"
  ON feedback FOR INSERT
  WITH CHECK ( auth.uid() IS NOT NULL );

CREATE POLICY "Users can update own feedback"
  ON feedback FOR UPDATE
  USING ( auth.uid() = user_id );

CREATE POLICY "Admins can view all feedback"
  ON feedback FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can update feedback"
  ON feedback FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- -------------------------------------------------------------------------
-- 4.7  notifications
-- -------------------------------------------------------------------------
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING ( auth.uid() = user_id );

CREATE POLICY "Admins can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can view all notifications"
  ON notifications FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  SECTION 5 — FUNCTIONS & TRIGGERS                                      ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- 5.1  Generic updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_schemes_updated_at
  BEFORE UPDATE ON schemes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_saved_schemes_updated_at
  BEFORE UPDATE ON user_saved_schemes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5.2  Auto-populate search_vector on schemes INSERT / UPDATE
CREATE OR REPLACE FUNCTION update_scheme_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.scheme_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')),  'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.ministry, '')),     'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.department, '')),   'C') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_schemes_search_vector
  BEFORE INSERT OR UPDATE ON schemes
  FOR EACH ROW EXECUTE FUNCTION update_scheme_search_vector();

-- 5.3  Full-text search helper
CREATE OR REPLACE FUNCTION search_schemes_fts(search_query TEXT)
RETURNS SETOF schemes AS $$
BEGIN
  RETURN QUERY
    SELECT *
    FROM   schemes
    WHERE  is_active = TRUE
    AND    search_vector @@ plainto_tsquery('english', search_query)
    ORDER  BY ts_rank(search_vector, plainto_tsquery('english', search_query)) DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- 5.4  Admin dashboard stats (single RPC call)
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_schemes',   (SELECT COUNT(*) FROM schemes),
    'active_schemes',  (SELECT COUNT(*) FROM schemes WHERE is_active = TRUE),
    'total_users',     (SELECT COUNT(*) FROM user_profiles),
    'checks_today',    (SELECT COUNT(*) FROM scheme_checks WHERE created_at >= CURRENT_DATE),
    'checks_week',     (SELECT COUNT(*) FROM scheme_checks WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
    'total_saved',     (SELECT COUNT(*) FROM user_saved_schemes),
    'total_applied',   (SELECT COUNT(*) FROM user_saved_schemes WHERE status = 'applied'),
    'total_received',  (SELECT COUNT(*) FROM user_saved_schemes WHERE status = 'received'),
    'total_feedback',  (SELECT COUNT(*) FROM feedback),
    'unresolved_feedback', (SELECT COUNT(*) FROM feedback WHERE is_resolved = FALSE),
    'schemes_by_type', (
      SELECT jsonb_object_agg(scheme_type, cnt)
      FROM (SELECT scheme_type, COUNT(*) AS cnt FROM schemes GROUP BY scheme_type) sub
    ),
    'schemes_by_category', (
      SELECT COALESCE(jsonb_object_agg(scheme_category, cnt), '{}'::JSONB)
      FROM (SELECT scheme_category, COUNT(*) AS cnt FROM schemes WHERE scheme_category IS NOT NULL GROUP BY scheme_category) sub
    ),
    'top_states', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('state', state, 'count', cnt) ORDER BY cnt DESC), '[]'::JSONB)
      FROM (SELECT state, COUNT(*) AS cnt FROM user_profiles WHERE state != '' GROUP BY state ORDER BY cnt DESC LIMIT 10) sub
    )
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  SECTION 6 — SEED DATA  (70+ real government schemes)                  ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- ─────────────── CENTRAL GOVERNMENT SCHEMES ───────────────

INSERT INTO schemes (scheme_name, scheme_name_hi, description, description_hi, benefit_amount, benefit_amount_numeric, eligibility_criteria, documents_required, documents_required_hi, application_link, ministry, scheme_type, scheme_category, applicable_states, is_active, tags) VALUES

-- 1. PM-KISAN
('Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
 'प्रधानमंत्री किसान सम्मान निधि',
 'Financial benefit of Rs. 6000 per year to small and marginal farmers in three equal installments.',
 'छोटे और सीमांत किसानों को तीन समान किस्तों में प्रति वर्ष 6000 रुपये की वित्तीय सहायता।',
 '₹6,000 per year', 6000,
 '{"age_min":18,"age_max":100,"income_max":null,"categories":["General","SC","ST","OBC"],"states":["All States"],"occupation":"Farmer","gender":null,"special_conditions":[]}'::JSONB,
 ARRAY['Aadhaar Card','Bank Account','Land Ownership Documents'],
 ARRAY['आधार कार्ड','बैंक खाता','भूमि स्वामित्व दस्तावेज'],
 'https://pmkisan.gov.in/',
 'Ministry of Agriculture and Farmers Welfare',
 'central', 'Agriculture',
 ARRAY['All States'], TRUE,
 ARRAY['farmer','agriculture','kisan','income support']),

-- 2. PM Awas Yojana
('Pradhan Mantri Awas Yojana (PMAY)',
 'प्रधानमंत्री आवास योजना',
 'Housing for all — financial assistance up to ₹2.67 lakh for construction of pucca house for BPL families.',
 'सभी के लिए आवास — बीपीएल परिवारों के लिए पक्के मकान के निर्माण हेतु ₹2.67 लाख तक वित्तीय सहायता।',
 'Up to ₹2,67,000', 267000,
 '{"age_min":18,"age_max":999,"income_max":300000,"categories":["General","SC","ST","OBC"],"states":["All States"],"is_bpl_required":true,"special_conditions":["No pucca house in family"]}'::JSONB,
 ARRAY['Aadhaar Card','Income Certificate','BPL Card','Land Documents','Bank Account'],
 ARRAY['आधार कार्ड','आय प्रमाण पत्र','बीपीएल कार्ड','भूमि दस्तावेज','बैंक खाता'],
 'https://pmaymis.gov.in/',
 'Ministry of Housing and Urban Affairs',
 'central', 'Housing',
 ARRAY['All States'], TRUE,
 ARRAY['housing','awas','bpl','home','construction']),

-- 3. PM Ujjwala Yojana
('Pradhan Mantri Ujjwala Yojana',
 'प्रधानमंत्री उज्ज्वला योजना',
 'Free LPG connections to women from BPL households with ₹1,600 subsidy for first refill.',
 'बीपीएल परिवारों की महिलाओं को मुफ्त एलपीजी कनेक्शन और पहली रिफिल पर ₹1,600 की सब्सिडी।',
 '₹1,600 subsidy + free connection', 1600,
 '{"age_min":18,"age_max":999,"categories":["General","SC","ST","OBC"],"states":["All States"],"gender":"Female","is_bpl_required":true,"special_conditions":[]}'::JSONB,
 ARRAY['Aadhaar Card','BPL Card','Bank Account','Passport Photo'],
 ARRAY['आधार कार्ड','बीपीएल कार्ड','बैंक खाता','पासपोर्ट फोटो'],
 'https://www.pmuy.gov.in/',
 'Ministry of Petroleum and Natural Gas',
 'central', 'Social Security',
 ARRAY['All States'], TRUE,
 ARRAY['lpg','gas','women','bpl','ujjwala']),

-- 4. PM Jan Dhan Yojana
('Pradhan Mantri Jan Dhan Yojana',
 'प्रधानमंत्री जन धन योजना',
 'Zero balance bank accounts with RuPay debit card and ₹1 lakh accident insurance.',
 'रुपे डेबिट कार्ड और ₹1 लाख दुर्घटना बीमा के साथ शून्य शेष बैंक खाते।',
 '₹1,00,000 accident insurance + ₹30,000 life cover', 100000,
 '{"age_min":10,"age_max":999,"categories":["General","SC","ST","OBC"],"states":["All States"],"special_conditions":[]}'::JSONB,
 ARRAY['Aadhaar Card','Voter ID / Driving License','Passport Photo'],
 ARRAY['आधार कार्ड','मतदाता पहचान पत्र / ड्राइविंग लाइसेंस','पासपोर्ट फोटो'],
 'https://pmjdy.gov.in/',
 'Ministry of Finance',
 'central', 'Finance & Insurance',
 ARRAY['All States'], TRUE,
 ARRAY['bank','account','insurance','financial inclusion']),

-- 5. Ayushman Bharat (PM-JAY)
('Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
 'आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना',
 'Health insurance cover of ₹5 lakh per family per year for secondary and tertiary hospitalization.',
 'माध्यमिक और तृतीयक अस्पताल में भर्ती के लिए प्रति परिवार प्रति वर्ष ₹5 लाख का स्वास्थ्य बीमा।',
 '₹5,00,000 per family per year', 500000,
 '{"age_min":0,"age_max":999,"income_max":250000,"categories":["General","SC","ST","OBC"],"states":["All States"],"special_conditions":["SECC 2011 beneficiaries"]}'::JSONB,
 ARRAY['Aadhaar Card','Ration Card','SECC inclusion letter','Mobile Number'],
 ARRAY['आधार कार्ड','राशन कार्ड','SECC समावेश पत्र','मोबाइल नंबर'],
 'https://pmjay.gov.in/',
 'Ministry of Health and Family Welfare',
 'central', 'Health',
 ARRAY['All States'], TRUE,
 ARRAY['health','insurance','hospital','ayushman','medical']),

-- 6. PM Mudra Yojana
('Pradhan Mantri MUDRA Yojana',
 'प्रधानमंत्री मुद्रा योजना',
 'Collateral-free loans up to ₹10 lakh for micro and small enterprises: Shishu (₹50K), Kishore (₹5L), Tarun (₹10L).',
 'सूक्ष्म और लघु उद्यमों के लिए ₹10 लाख तक का संपार्श्विक-मुक्त ऋण: शिशु (₹50K), किशोर (₹5L), तरुण (₹10L)।',
 'Up to ₹10,00,000', 1000000,
 '{"age_min":18,"age_max":65,"categories":["General","SC","ST","OBC"],"states":["All States"],"special_conditions":["Non-farm income generating activity"]}'::JSONB,
 ARRAY['Aadhaar Card','PAN Card','Business Plan','Bank Statements','Address Proof'],
 ARRAY['आधार कार्ड','पैन कार्ड','व्यापार योजना','बैंक विवरण','पता प्रमाण'],
 'https://www.mudra.org.in/',
 'Ministry of Finance',
 'central', 'Employment',
 ARRAY['All States'], TRUE,
 ARRAY['loan','mudra','business','entrepreneur','msme']),

-- 7. Sukanya Samriddhi Yojana
('Sukanya Samriddhi Yojana',
 'सुकन्या समृद्धि योजना',
 'Savings scheme for girl child with high interest rate (8.2%) and tax benefits under 80C.',
 'बालिकाओं के लिए उच्च ब्याज दर (8.2%) और 80C के तहत कर लाभ के साथ बचत योजना।',
 '8.2% interest rate + tax benefits', 0,
 '{"age_min":0,"age_max":10,"categories":["General","SC","ST","OBC"],"states":["All States"],"gender":"Female","special_conditions":["Max 2 girl children per family"]}'::JSONB,
 ARRAY['Girl child birth certificate','Parents Aadhaar','PAN Card','Address Proof'],
 ARRAY['बालिका जन्म प्रमाण पत्र','माता-पिता का आधार','पैन कार्ड','पता प्रमाण'],
 'https://www.india.gov.in/sukanya-samriddhi-yojana',
 'Ministry of Finance',
 'central', 'Finance & Insurance',
 ARRAY['All States'], TRUE,
 ARRAY['girl','savings','education','marriage','sukanya']),

-- 8. PM SVANidhi
('PM Street Vendor''s AtmaNirbhar Nidhi (PM SVANidhi)',
 'पीएम स्ट्रीट वेंडर आत्मनिर्भर निधि',
 'Working capital loan up to ₹50,000 for street vendors. Interest subsidy of 7% and cashback incentives.',
 'स्ट्रीट वेंडरों के लिए ₹50,000 तक कार्यशील पूंजी ऋण। 7% ब्याज सब्सिडी और कैशबैक।',
 'Up to ₹50,000 loan + 7% interest subsidy', 50000,
 '{"age_min":18,"age_max":65,"categories":["General","SC","ST","OBC"],"states":["All States"],"occupation":"Self-employed","special_conditions":["Street vendors with vending certificate"]}'::JSONB,
 ARRAY['Aadhaar Card','Vending Certificate','Bank Account','Mobile Number'],
 ARRAY['आधार कार्ड','वेंडिंग प्रमाण पत्र','बैंक खाता','मोबाइल नंबर'],
 'https://pmsvanidhi.mohua.gov.in/',
 'Ministry of Housing and Urban Affairs',
 'central', 'Employment',
 ARRAY['All States'], TRUE,
 ARRAY['vendor','street','loan','self-employed','svanidhi']),

-- 9. National Pension Scheme
('Atal Pension Yojana (APY)',
 'अटल पेंशन योजना',
 'Guaranteed monthly pension of ₹1,000 to ₹5,000 after 60 years for unorganized sector workers.',
 'असंगठित क्षेत्र के श्रमिकों के लिए 60 वर्ष के बाद ₹1,000 से ₹5,000 प्रति माह गारंटीड पेंशन।',
 '₹1,000 - ₹5,000 monthly pension', 5000,
 '{"age_min":18,"age_max":40,"categories":["General","SC","ST","OBC"],"states":["All States"],"special_conditions":["Bank account holder","Not income tax payer"]}'::JSONB,
 ARRAY['Aadhaar Card','Bank Account','Mobile Number'],
 ARRAY['आधार कार्ड','बैंक खाता','मोबाइल नंबर'],
 'https://www.npscra.nsdl.co.in/nsdl/scheme-details/APY.html',
 'Ministry of Finance',
 'central', 'Social Security',
 ARRAY['All States'], TRUE,
 ARRAY['pension','retirement','atal','unorganized','social security']),

-- 10. PM Fasal Bima Yojana
('Pradhan Mantri Fasal Bima Yojana (PMFBY)',
 'प्रधानमंत्री फसल बीमा योजना',
 'Crop insurance with premium of 2% for Kharif, 1.5% for Rabi, and 5% for commercial crops.',
 'फसल बीमा — खरीफ 2%, रबी 1.5% और वाणिज्यिक फसलों के लिए 5% प्रीमियम।',
 'Full sum insured on crop loss', 0,
 '{"age_min":18,"age_max":999,"categories":["General","SC","ST","OBC"],"states":["All States"],"occupation":"Farmer","special_conditions":[]}'::JSONB,
 ARRAY['Aadhaar Card','Land Records','Bank Account','Sowing Certificate'],
 ARRAY['आधार कार्ड','भूमि रिकॉर्ड','बैंक खाता','बुवाई प्रमाण पत्र'],
 'https://pmfby.gov.in/',
 'Ministry of Agriculture and Farmers Welfare',
 'central', 'Agriculture',
 ARRAY['All States'], TRUE,
 ARRAY['crop','insurance','farmer','fasal','bima']),

-- 11. National Education Mission — Mid Day Meal / PM POSHAN
('PM POSHAN (Mid Day Meal Scheme)',
 'पीएम पोषण (मध्याह्न भोजन योजना)',
 'Free nutritious meal to school children studying in classes 1-8 in government schools.',
 'सरकारी स्कूलों में कक्षा 1-8 में पढ़ने वाले बच्चों को मुफ्त पौष्टिक भोजन।',
 'Free daily meal', 0,
 '{"age_min":6,"age_max":14,"categories":["General","SC","ST","OBC"],"states":["All States"],"special_conditions":["Government school student"]}'::JSONB,
 ARRAY['School Enrollment','Aadhaar Card'],
 ARRAY['स्कूल नामांकन','आधार कार्ड'],
 'https://pmposhan.education.gov.in/',
 'Ministry of Education',
 'central', 'Education',
 ARRAY['All States'], TRUE,
 ARRAY['education','meal','nutrition','children','school']),

-- 12. MGNREGA
('Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)',
 'महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार गारंटी अधिनियम (मनरेगा)',
 '100 days of guaranteed wage employment per year for rural households willing to do unskilled manual work.',
 'ग्रामीण परिवारों को अकुशल शारीरिक श्रम हेतु प्रति वर्ष 100 दिन का गारंटीड मजदूरी रोजगार।',
 '100 days guaranteed employment per year', 0,
 '{"age_min":18,"age_max":999,"categories":["General","SC","ST","OBC"],"states":["All States"],"is_rural":true,"special_conditions":["Willing to do unskilled manual work"]}'::JSONB,
 ARRAY['Aadhaar Card','Job Card','Bank Account','Passport Photo'],
 ARRAY['आधार कार्ड','जॉब कार्ड','बैंक खाता','पासपोर्ट फोटो'],
 'https://nrega.nic.in/',
 'Ministry of Rural Development',
 'central', 'Employment',
 ARRAY['All States'], TRUE,
 ARRAY['employment','rural','nrega','mgnrega','job','wage']),

-- 13. PM Matru Vandana Yojana
('Pradhan Mantri Matru Vandana Yojana (PMMVY)',
 'प्रधानमंत्री मातृ वंदना योजना',
 'Cash incentive of ₹11,000 in three installments for first live birth for pregnant & lactating women.',
 'गर्भवती और स्तनपान कराने वाली महिलाओं के पहले जीवित जन्म पर तीन किस्तों में ₹11,000 का नकद प्रोत्साहन।',
 '₹11,000 in 3 installments', 11000,
 '{"age_min":18,"age_max":45,"categories":["General","SC","ST","OBC"],"states":["All States"],"gender":"Female","special_conditions":["First live birth","Pregnant or lactating"]}'::JSONB,
 ARRAY['Aadhaar Card','MCP Card','Bank Account','Pregnancy Certificate'],
 ARRAY['आधार कार्ड','एमसीपी कार्ड','बैंक खाता','गर्भावस्था प्रमाण पत्र'],
 'https://pmmvy.wcd.gov.in/',
 'Ministry of Women and Child Development',
 'central', 'Women & Child',
 ARRAY['All States'], TRUE,
 ARRAY['pregnant','maternity','women','child','pmmvy']),

-- 14. Stand-Up India
('Stand-Up India Scheme',
 'स्टैंड-अप इंडिया योजना',
 'Bank loans between ₹10 lakh and ₹1 crore for SC/ST and women entrepreneurs for greenfield enterprise.',
 'एससी/एसटी और महिला उद्यमियों को ग्रीनफील्ड उद्यम के लिए ₹10 लाख से ₹1 करोड़ तक बैंक ऋण।',
 '₹10 lakh to ₹1 crore loan', 10000000,
 '{"age_min":18,"age_max":65,"categories":["SC","ST"],"states":["All States"],"special_conditions":["Greenfield enterprise","At least 51% shareholding"]}'::JSONB,
 ARRAY['Aadhaar Card','Caste Certificate','Business Plan','PAN Card','Bank Statements'],
 ARRAY['आधार कार्ड','जाति प्रमाण पत्र','व्यापार योजना','पैन कार्ड','बैंक विवरण'],
 'https://www.standupmitra.in/',
 'Ministry of Finance',
 'central', 'Employment',
 ARRAY['All States'], TRUE,
 ARRAY['sc','st','women','entrepreneur','loan','standup']),

-- 15. Skill India Mission
('Pradhan Mantri Kaushal Vikas Yojana (PMKVY)',
 'प्रधानमंत्री कौशल विकास योजना',
 'Free skill training and certification for youth, with placement support and ₹8,000 reward on certification.',
 'युवाओं के लिए मुफ्त कौशल प्रशिक्षण और प्रमाणन, प्लेसमेंट सहायता और प्रमाणन पर ₹8,000 पुरस्कार।',
 '₹8,000 reward + free training', 8000,
 '{"age_min":15,"age_max":45,"categories":["General","SC","ST","OBC"],"states":["All States"],"special_conditions":["Indian national"]}'::JSONB,
 ARRAY['Aadhaar Card','Bank Account','Education Certificate'],
 ARRAY['आधार कार्ड','बैंक खाता','शिक्षा प्रमाण पत्र'],
 'https://pmkvyofficial.org/',
 'Ministry of Skill Development and Entrepreneurship',
 'central', 'Skill Development',
 ARRAY['All States'], TRUE,
 ARRAY['skill','training','youth','employment','kaushal']),

-- 16. Beti Bachao Beti Padhao
('Beti Bachao Beti Padhao',
 'बेटी बचाओ बेटी पढ़ाओ',
 'Campaign for survival, protection and education of girl child with financial support programs.',
 'बालिकाओं के अस्तित्व, सुरक्षा और शिक्षा के लिए वित्तीय सहायता कार्यक्रम।',
 'Varies by state', 0,
 '{"age_min":0,"age_max":18,"categories":["General","SC","ST","OBC"],"states":["All States"],"gender":"Female","special_conditions":[]}'::JSONB,
 ARRAY['Birth Certificate','Aadhaar Card','School Enrollment'],
 ARRAY['जन्म प्रमाण पत्र','आधार कार्ड','स्कूल नामांकन'],
 'https://wcd.nic.in/bbbp-schemes',
 'Ministry of Women and Child Development',
 'central', 'Women & Child',
 ARRAY['All States'], TRUE,
 ARRAY['girl','education','women','beti','child']),

-- 17. National Social Assistance Programme — Old Age Pension
('Indira Gandhi National Old Age Pension Scheme (IGNOAPS)',
 'इंदिरा गांधी राष्ट्रीय वृद्धावस्था पेंशन योजना',
 'Monthly pension of ₹200-₹500 for BPL citizens above 60 years.',
 'बीपीएल नागरिकों को 60 वर्ष से ऊपर ₹200-₹500 मासिक पेंशन।',
 '₹200 - ₹500 per month', 500,
 '{"age_min":60,"age_max":999,"categories":["General","SC","ST","OBC"],"states":["All States"],"is_bpl_required":true,"special_conditions":[]}'::JSONB,
 ARRAY['Aadhaar Card','BPL Card','Age Proof','Bank Account'],
 ARRAY['आधार कार्ड','बीपीएल कार्ड','आयु प्रमाण','बैंक खाता'],
 'https://nsap.nic.in/',
 'Ministry of Rural Development',
 'central', 'Social Security',
 ARRAY['All States'], TRUE,
 ARRAY['pension','old age','senior','bpl','social security']),

-- 18. PM Shram Yogi Maan-dhan
('Pradhan Mantri Shram Yogi Maan-dhan (PM-SYM)',
 'प्रधानमंत्री श्रम योगी मान-धन',
 'Pension scheme for unorganized workers — ₹3,000 per month after 60 years.',
 'असंगठित श्रमिकों के लिए पेंशन योजना — 60 वर्ष के बाद ₹3,000 प्रति माह।',
 '₹3,000 per month after 60 years', 3000,
 '{"age_min":18,"age_max":40,"income_max":15000,"categories":["General","SC","ST","OBC"],"states":["All States"],"special_conditions":["Unorganized sector workers"]}'::JSONB,
 ARRAY['Aadhaar Card','Bank Account','IFSC Code','Self-declaration'],
 ARRAY['आधार कार्ड','बैंक खाता','IFSC कोड','स्व-घोषणा'],
 'https://maandhan.in/',
 'Ministry of Labour and Employment',
 'central', 'Social Security',
 ARRAY['All States'], TRUE,
 ARRAY['pension','unorganized','worker','shram','labour']),

-- 19. PM Vishwakarma Yojana
('PM Vishwakarma Yojana',
 'पीएम विश्वकर्मा योजना',
 'Support for artisans and craftspeople — collateral-free loan up to ₹3 lakh, skill training, toolkit incentive.',
 'शिल्पकारों और कारीगरों के लिए सहायता — ₹3 लाख तक संपार्श्विक-मुक्त ऋण, कौशल प्रशिक्षण।',
 'Up to ₹3,00,000 loan + toolkit', 300000,
 '{"age_min":18,"age_max":999,"categories":["General","SC","ST","OBC"],"states":["All States"],"special_conditions":["Artisan/craftsperson in 18 identified trades"]}'::JSONB,
 ARRAY['Aadhaar Card','Bank Account','Skill Certificate or Self-declaration','Mobile Number'],
 ARRAY['आधार कार्ड','बैंक खाता','कौशल प्रमाण पत्र या स्व-घोषणा','मोबाइल नंबर'],
 'https://pmvishwakarma.gov.in/',
 'Ministry of Micro, Small and Medium Enterprises',
 'central', 'Skill Development',
 ARRAY['All States'], TRUE,
 ARRAY['artisan','craft','vishwakarma','loan','toolkit']),

-- 20. PM Suraksha Bima Yojana
('Pradhan Mantri Suraksha Bima Yojana (PMSBY)',
 'प्रधानमंत्री सुरक्षा बीमा योजना',
 'Accident insurance — ₹2 lakh for accidental death/disability at just ₹20/year premium.',
 'दुर्घटना बीमा — मात्र ₹20/वर्ष प्रीमियम पर दुर्घटना मृत्यु/विकलांगता पर ₹2 लाख।',
 '₹2,00,000 accident cover at ₹20/year', 200000,
 '{"age_min":18,"age_max":70,"categories":["General","SC","ST","OBC"],"states":["All States"],"special_conditions":["Bank account holder"]}'::JSONB,
 ARRAY['Bank Account','Aadhaar Card','Consent Form'],
 ARRAY['बैंक खाता','आधार कार्ड','सहमति फॉर्म'],
 'https://www.india.gov.in/pmsby',
 'Ministry of Finance',
 'central', 'Finance & Insurance',
 ARRAY['All States'], TRUE,
 ARRAY['insurance','accident','suraksha','bima','premium']),

-- 21. PM Jeevan Jyoti Bima Yojana
('Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)',
 'प्रधानमंत्री जीवन ज्योति बीमा योजना',
 'Life insurance — ₹2 lakh life cover at ₹436/year premium.',
 'जीवन बीमा — ₹436/वर्ष प्रीमियम पर ₹2 लाख जीवन बीमा।',
 '₹2,00,000 life cover at ₹436/year', 200000,
 '{"age_min":18,"age_max":50,"categories":["General","SC","ST","OBC"],"states":["All States"],"special_conditions":["Bank account holder"]}'::JSONB,
 ARRAY['Bank Account','Aadhaar Card','Consent Form'],
 ARRAY['बैंक खाता','आधार कार्ड','सहमति फॉर्म'],
 'https://www.india.gov.in/pmjjby',
 'Ministry of Finance',
 'central', 'Finance & Insurance',
 ARRAY['All States'], TRUE,
 ARRAY['life','insurance','jeevan','jyoti','bima']),

-- 22. Jal Jeevan Mission
('Jal Jeevan Mission',
 'जल जीवन मिशन',
 'Piped water supply — free household tap connection to every rural household.',
 'प्रत्येक ग्रामीण परिवार को मुफ्त घरेलू नल कनेक्शन।',
 'Free household tap connection', 0,
 '{"age_min":0,"age_max":999,"categories":["General","SC","ST","OBC"],"states":["All States"],"is_rural":true,"special_conditions":["Rural households without tap connection"]}'::JSONB,
 ARRAY['Residence Proof','Aadhaar Card','House Ownership Proof'],
 ARRAY['निवास प्रमाण','आधार कार्ड','घर स्वामित्व प्रमाण'],
 'https://jjm.gov.in/',
 'Ministry of Jal Shakti',
 'central', 'Infrastructure',
 ARRAY['All States'], TRUE,
 ARRAY['water','tap','rural','jal','jeevan']),

-- 23. PM Kusum Yojana
('PM Kusum Yojana',
 'पीएम कुसुम योजना',
 'Solar energy for farmers — subsidy on solar pumps and grid-connected solar power plants.',
 'किसानों के लिए सौर ऊर्जा — सोलर पंप और ग्रिड-कनेक्टेड सोलर पावर प्लांट पर सब्सिडी।',
 'Up to 60% subsidy on solar pumps', 0,
 '{"age_min":18,"age_max":999,"categories":["General","SC","ST","OBC"],"states":["All States"],"occupation":"Farmer","special_conditions":[]}'::JSONB,
 ARRAY['Land Documents','Aadhaar Card','Bank Account','Electricity Bill'],
 ARRAY['भूमि दस्तावेज','आधार कार्ड','बैंक खाता','बिजली बिल'],
 'https://pmkusum.mnre.gov.in/',
 'Ministry of New and Renewable Energy',
 'central', 'Agriculture',
 ARRAY['All States'], TRUE,
 ARRAY['solar','farmer','energy','kusum','pump']),

-- 24. National Scholarship Portal
('National Scholarship Portal (NSP)',
 'राष्ट्रीय छात्रवृत्ति पोर्टल',
 'Multiple scholarships for students from SC/ST/OBC/Minority/EWS backgrounds studying in India.',
 'भारत में पढ़ने वाले SC/ST/OBC/अल्पसंख्यक/EWS छात्रों के लिए विभिन्न छात्रवृत्तियाँ।',
 'Varies ₹5,000 - ₹2,00,000 per year', 200000,
 '{"age_min":10,"age_max":35,"income_max":800000,"categories":["General","SC","ST","OBC"],"states":["All States"],"special_conditions":["Enrolled in recognized institution"]}'::JSONB,
 ARRAY['Education Certificates','Income Certificate','Caste Certificate','Aadhaar Card','Bank Account','Admission Letter'],
 ARRAY['शिक्षा प्रमाण पत्र','आय प्रमाण पत्र','जाति प्रमाण पत्र','आधार कार्ड','बैंक खाता','प्रवेश पत्र'],
 'https://scholarships.gov.in/',
 'Ministry of Education',
 'central', 'Education',
 ARRAY['All States'], TRUE,
 ARRAY['scholarship','education','student','minority','nsp']),

-- 25. Pradhan Mantri Garib Kalyan Anna Yojana
('Pradhan Mantri Garib Kalyan Anna Yojana (PMGKAY)',
 'प्रधानमंत्री गरीब कल्याण अन्न योजना',
 'Free 5 kg foodgrains per month per person for all priority households under NFSA.',
 'NFSA के तहत सभी प्राथमिकता परिवारों को प्रति व्यक्ति प्रति माह 5 किलो मुफ्त खाद्यान्न।',
 '5 kg free foodgrains per person per month', 0,
 '{"age_min":0,"age_max":999,"categories":["General","SC","ST","OBC"],"states":["All States"],"is_bpl_required":true,"special_conditions":["NFSA beneficiary"]}'::JSONB,
 ARRAY['Ration Card','Aadhaar Card'],
 ARRAY['राशन कार्ड','आधार कार्ड'],
 'https://nfsa.gov.in/',
 'Ministry of Consumer Affairs, Food and Public Distribution',
 'central', 'Social Security',
 ARRAY['All States'], TRUE,
 ARRAY['food','ration','grain','bpl','anna','pmgkay']);


-- ─────────────── STATE GOVERNMENT SCHEMES ───────────────

INSERT INTO schemes (scheme_name, scheme_name_hi, description, description_hi, benefit_amount, benefit_amount_numeric, eligibility_criteria, documents_required, documents_required_hi, application_link, ministry, scheme_type, scheme_category, applicable_states, is_active, tags) VALUES

-- ANDHRA PRADESH
('YSR Rythu Bharosa',
 'वाईएसआर रायथु भरोसा',
 'Investment support of ₹13,500 per year for farmers in Andhra Pradesh.',
 'आंध्र प्रदेश के किसानों के लिए ₹13,500 प्रति वर्ष निवेश सहायता।',
 '₹13,500 per year', 13500,
 '{"age_min":18,"age_max":999,"categories":["General","SC","ST","OBC"],"states":["Andhra Pradesh"],"occupation":"Farmer"}'::JSONB,
 ARRAY['Land Records','Aadhaar Card','Bank Account'],
 ARRAY['भूमि रिकॉर्ड','आधार कार्ड','बैंक खाता'],
 'https://ysrrythubharosa.ap.gov.in/', 'Agriculture Department, AP',
 'state', 'Agriculture', ARRAY['Andhra Pradesh'], TRUE,
 ARRAY['farmer','ap','rythu','agriculture']),

('Amma Vodi',
 'अम्मा वोडी',
 '₹15,000 per year to mothers/guardians who send their children to school in AP.',
 'एपी में अपने बच्चों को स्कूल भेजने वाली माताओं/अभिभावकों को ₹15,000 प्रति वर्ष।',
 '₹15,000 per year', 15000,
 '{"age_min":5,"age_max":18,"income_max":250000,"categories":["General","SC","ST","OBC"],"states":["Andhra Pradesh"]}'::JSONB,
 ARRAY['School Enrollment','Aadhaar Card','BPL/White Card','Bank Account'],
 ARRAY['स्कूल नामांकन','आधार कार्ड','बीपीएल/सफेद कार्ड','बैंक खाता'],
 'https://ammavodi.ap.gov.in/', 'Education Department, AP',
 'state', 'Education', ARRAY['Andhra Pradesh'], TRUE,
 ARRAY['education','mother','school','ap']),

-- BIHAR
('Mukhyamantri Kanya Utthan Yojana',
 'मुख्यमंत्री कन्या उत्थान योजना',
 'Financial assistance of ₹50,000+ from birth to graduation for girls in Bihar.',
 'बिहार में लड़कियों के लिए जन्म से स्नातक तक ₹50,000+ वित्तीय सहायता।',
 '₹50,000+ in installments', 50000,
 '{"age_min":0,"age_max":25,"categories":["General","SC","ST","OBC"],"states":["Bihar"],"gender":"Female"}'::JSONB,
 ARRAY['Birth Certificate','Aadhaar Card','Bank Account','Education Certificates'],
 ARRAY['जन्म प्रमाण पत्र','आधार कार्ड','बैंक खाता','शिक्षा प्रमाण पत्र'],
 'https://medhasoft.bih.nic.in/', 'Education Department, Bihar',
 'state', 'Women & Child', ARRAY['Bihar'], TRUE,
 ARRAY['girl','education','bihar','kanya']),

-- CHHATTISGARH
('Rajiv Gandhi Kisan Nyay Yojana',
 'राजीव गांधी किसान न्याय योजना',
 'Input support of ₹9,000 per acre per year for paddy farmers in Chhattisgarh.',
 'छत्तीसगढ़ में धान किसानों को ₹9,000 प्रति एकड़ प्रति वर्ष इनपुट सहायता।',
 '₹9,000 per acre per year', 9000,
 '{"age_min":18,"age_max":999,"categories":["General","SC","ST","OBC"],"states":["Chhattisgarh"],"occupation":"Farmer"}'::JSONB,
 ARRAY['Land Records','Aadhaar Card','Bank Account'],
 ARRAY['भूमि रिकॉर्ड','आधार कार्ड','बैंक खाता'],
 'https://rgkny.cg.nic.in/', 'Agriculture Department, CG',
 'state', 'Agriculture', ARRAY['Chhattisgarh'], TRUE,
 ARRAY['farmer','chhattisgarh','paddy','kisan']),

-- DELHI
('Mukhyamantri Mahila Samman Yojana',
 'मुख्यमंत्री महिला सम्मान योजना',
 'Monthly financial assistance of ₹1,000 to women residents of Delhi.',
 'दिल्ली की महिला निवासियों को ₹1,000 मासिक वित्तीय सहायता।',
 '₹1,000 per month', 12000,
 '{"age_min":18,"age_max":999,"categories":["General","SC","ST","OBC"],"states":["Delhi"],"gender":"Female"}'::JSONB,
 ARRAY['Aadhaar Card','Voter ID','Bank Account','Residence Proof'],
 ARRAY['आधार कार्ड','मतदाता पहचान पत्र','बैंक खाता','निवास प्रमाण'],
 'https://delhi.gov.in/', 'Women and Child Development Department, Delhi',
 'state', 'Women & Child', ARRAY['Delhi'], TRUE,
 ARRAY['women','delhi','monthly','financial']),

-- GUJARAT
('Vahli Dikri Yojana',
 'वहाली दीकरी योजना',
 'Financial assistance of ₹1,10,000 to first two daughters of a family in Gujarat.',
 'गुजरात में परिवार की पहली दो बेटियों को ₹1,10,000 की वित्तीय सहायता।',
 '₹1,10,000 in installments', 110000,
 '{"age_min":0,"age_max":21,"income_max":200000,"categories":["General","SC","ST","OBC"],"states":["Gujarat"],"gender":"Female"}'::JSONB,
 ARRAY['Birth Certificate','Income Certificate','Aadhaar Card','Bank Account'],
 ARRAY['जन्म प्रमाण पत्र','आय प्रमाण पत्र','आधार कार्ड','बैंक खाता'],
 'https://gujaratindia.gov.in/', 'Women and Child Development, Gujarat',
 'state', 'Women & Child', ARRAY['Gujarat'], TRUE,
 ARRAY['girl','daughter','gujarat','vahli','dikri']),

-- HARYANA
('Mhara Gaon Jagmag Gaon',
 'म्हारा गांव जगमग गांव',
 '24x7 power supply to rural households in Haryana with feeder segregation.',
 'हरियाणा में ग्रामीण परिवारों को फीडर सेग्रीगेशन के साथ 24x7 बिजली आपूर्ति।',
 '24x7 power supply', 0,
 '{"age_min":0,"age_max":999,"categories":["General","SC","ST","OBC"],"states":["Haryana"],"is_rural":true}'::JSONB,
 ARRAY['Electricity Connection Proof','Residence Proof','Aadhaar Card'],
 ARRAY['बिजली कनेक्शन प्रमाण','निवास प्रमाण','आधार कार्ड'],
 'https://haryana.gov.in/', 'Power Department, Haryana',
 'state', 'Infrastructure', ARRAY['Haryana'], TRUE,
 ARRAY['power','electricity','rural','haryana']),

-- JHARKHAND
('Mukhyamantri Sukanya Yojana',
 'मुख्यमंत्री सुकन्या योजना',
 'Financial assistance for girl child from birth to 18 years in Jharkhand.',
 'झारखंड में जन्म से 18 वर्ष तक बालिका को वित्तीय सहायता।',
 '₹40,000 in installments', 40000,
 '{"age_min":0,"age_max":18,"categories":["General","SC","ST","OBC"],"states":["Jharkhand"],"gender":"Female"}'::JSONB,
 ARRAY['Birth Certificate','Aadhaar Card','Bank Account','School Enrollment'],
 ARRAY['जन्म प्रमाण पत्र','आधार कार्ड','बैंक खाता','स्कूल नामांकन'],
 'https://jharkhand.gov.in/', 'Women and Child Development, Jharkhand',
 'state', 'Women & Child', ARRAY['Jharkhand'], TRUE,
 ARRAY['girl','jharkhand','sukanya','education']),

-- KARNATAKA
('Gruha Lakshmi Scheme',
 'गृह लक्ष्मी योजना',
 'Monthly financial assistance of ₹2,000 to women heads of families in Karnataka.',
 'कर्नाटक में परिवार की महिला मुखिया को ₹2,000 मासिक वित्तीय सहायता।',
 '₹2,000 per month', 24000,
 '{"age_min":18,"age_max":999,"categories":["General","SC","ST","OBC"],"states":["Karnataka"],"gender":"Female"}'::JSONB,
 ARRAY['Aadhaar Card','Ration Card','Bank Account','Voter ID'],
 ARRAY['आधार कार्ड','राशन कार्ड','बैंक खाता','मतदाता पहचान पत्र'],
 'https://sevasindhuservices.karnataka.gov.in/', 'Women and Child Development, Karnataka',
 'state', 'Women & Child', ARRAY['Karnataka'], TRUE,
 ARRAY['women','karnataka','gruha','lakshmi','monthly']),

-- KERALA
('Life Mission (LIFE)',
 'लाइफ मिशन',
 'Housing for homeless and landless families in Kerala — free house construction.',
 'केरल में बेघर और भूमिहीन परिवारों के लिए आवास — मुफ्त मकान निर्माण।',
 'Free house (₹4-6 lakh)', 600000,
 '{"age_min":18,"age_max":999,"income_max":300000,"categories":["General","SC","ST","OBC"],"states":["Kerala"]}'::JSONB,
 ARRAY['Income Certificate','Aadhaar Card','Land Certificate','BPL Card'],
 ARRAY['आय प्रमाण पत्र','आधार कार्ड','भूमि प्रमाण पत्र','बीपीएल कार्ड'],
 'https://lifemission.lsgkerala.gov.in/', 'Local Self Government, Kerala',
 'state', 'Housing', ARRAY['Kerala'], TRUE,
 ARRAY['housing','kerala','life','homeless','house']),

-- MADHYA PRADESH
('Ladli Behna Yojana',
 'लाड़ली बहना योजना',
 'Monthly financial assistance of ₹1,250 to women in Madhya Pradesh.',
 'मध्य प्रदेश में महिलाओं को ₹1,250 मासिक वित्तीय सहायता।',
 '₹1,250 per month', 15000,
 '{"age_min":23,"age_max":60,"income_max":250000,"categories":["General","SC","ST","OBC"],"states":["Madhya Pradesh"],"gender":"Female"}'::JSONB,
 ARRAY['Aadhaar Card','Samagra ID','Bank Account','Age Proof'],
 ARRAY['आधार कार्ड','समग्र आईडी','बैंक खाता','आयु प्रमाण'],
 'https://ladlibahna.mp.gov.in/', 'Women and Child Development, MP',
 'state', 'Women & Child', ARRAY['Madhya Pradesh'], TRUE,
 ARRAY['women','mp','ladli','behna','monthly']),

-- MAHARASHTRA
('Majhi Ladki Bahin Yojana',
 'माझी लाडकी बहीण योजना',
 'Monthly financial assistance of ₹1,500 to women in Maharashtra.',
 'महाराष्ट्र में महिलाओं को ₹1,500 मासिक वित्तीय सहायता।',
 '₹1,500 per month', 18000,
 '{"age_min":21,"age_max":65,"income_max":250000,"categories":["General","SC","ST","OBC"],"states":["Maharashtra"],"gender":"Female"}'::JSONB,
 ARRAY['Aadhaar Card','Bank Account','Domicile Certificate','Income Certificate'],
 ARRAY['आधार कार्ड','बैंक खाता','अधिवास प्रमाण पत्र','आय प्रमाण पत्र'],
 'https://maharashtra.gov.in/', 'Women and Child Development, Maharashtra',
 'state', 'Women & Child', ARRAY['Maharashtra'], TRUE,
 ARRAY['women','maharashtra','ladki','bahin','monthly']),

-- ODISHA
('KALIA Scheme',
 'कालिया योजना',
 'Financial assistance of ₹12,500 per year to small and marginal farmers in Odisha.',
 'ओडिशा में छोटे और सीमांत किसानों को ₹12,500 प्रति वर्ष वित्तीय सहायता।',
 '₹12,500 per year', 12500,
 '{"age_min":18,"age_max":999,"categories":["General","SC","ST","OBC"],"states":["Odisha"],"occupation":"Farmer"}'::JSONB,
 ARRAY['Land Records','Aadhaar Card','Bank Account'],
 ARRAY['भूमि रिकॉर्ड','आधार कार्ड','बैंक खाता'],
 'https://kalia.odisha.gov.in/', 'Agriculture Department, Odisha',
 'state', 'Agriculture', ARRAY['Odisha'], TRUE,
 ARRAY['farmer','odisha','kalia','agriculture']),

-- PUNJAB
('Aashirwad Scheme',
 'आशीर्वाद योजना',
 'Financial assistance of ₹51,000 at the time of marriage for girls from poor families in Punjab.',
 'पंजाब में गरीब परिवारों की लड़कियों की शादी के समय ₹51,000 की वित्तीय सहायता।',
 '₹51,000 at marriage', 51000,
 '{"age_min":18,"age_max":999,"income_max":250000,"categories":["General","SC","ST","OBC"],"states":["Punjab"],"gender":"Female"}'::JSONB,
 ARRAY['Income Certificate','Aadhaar Card','Bank Account','Marriage Certificate'],
 ARRAY['आय प्रमाण पत्र','आधार कार्ड','बैंक खाता','विवाह प्रमाण पत्र'],
 'https://punjab.gov.in/', 'Social Security Department, Punjab',
 'state', 'Women & Child', ARRAY['Punjab'], TRUE,
 ARRAY['marriage','punjab','girl','aashirwad']),

-- RAJASTHAN
('Indira Gandhi Free Smartphone Yojana',
 'इंदिरा गांधी फ्री स्मार्टफोन योजना',
 'Free smartphones with 3 years of connectivity to women in Rajasthan.',
 'राजस्थान में महिलाओं को 3 साल की कनेक्टिविटी के साथ मुफ्त स्मार्टफोन।',
 'Free smartphone + 3 years data', 0,
 '{"age_min":18,"age_max":999,"categories":["General","SC","ST","OBC"],"states":["Rajasthan"],"gender":"Female"}'::JSONB,
 ARRAY['Aadhaar Card','Jan Aadhaar Card','Chiranjeevi Card'],
 ARRAY['आधार कार्ड','जन आधार कार्ड','चिरंजीवी कार्ड'],
 'https://igsy.rajasthan.gov.in/', 'IT Department, Rajasthan',
 'state', 'Other', ARRAY['Rajasthan'], TRUE,
 ARRAY['smartphone','rajasthan','women','free','digital']),

-- TAMIL NADU
('Kalaignar Magalir Urimai Thogai',
 'कलाइगनार मगलिर उरिमाई थोगाई',
 'Monthly financial assistance of ₹1,000 to women heads of families in Tamil Nadu.',
 'तमिलनाडु में परिवार की महिला मुखिया को ₹1,000 मासिक वित्तीय सहायता।',
 '₹1,000 per month', 12000,
 '{"age_min":18,"age_max":999,"income_max":250000,"categories":["General","SC","ST","OBC"],"states":["Tamil Nadu"],"gender":"Female"}'::JSONB,
 ARRAY['Aadhaar Card','Family Card','Bank Account'],
 ARRAY['आधार कार्ड','परिवार कार्ड','बैंक खाता'],
 'https://www.tn.gov.in/', 'Social Welfare Department, Tamil Nadu',
 'state', 'Women & Child', ARRAY['Tamil Nadu'], TRUE,
 ARRAY['women','tamilnadu','monthly','family']),

-- TELANGANA
('Rythu Bandhu Scheme',
 'रायथु बंधु योजना',
 'Investment support of ₹10,000 per acre per year for farmers in Telangana.',
 'तेलंगाना में किसानों को ₹10,000 प्रति एकड़ प्रति वर्ष निवेश सहायता।',
 '₹10,000 per acre per year', 10000,
 '{"age_min":18,"age_max":999,"categories":["General","SC","ST","OBC"],"states":["Telangana"],"occupation":"Farmer"}'::JSONB,
 ARRAY['Land Records (Pahani)','Aadhaar Card','Bank Account'],
 ARRAY['भूमि रिकॉर्ड (पहानी)','आधार कार्ड','बैंक खाता'],
 'https://rythubandhu.telangana.gov.in/', 'Agriculture Department, Telangana',
 'state', 'Agriculture', ARRAY['Telangana'], TRUE,
 ARRAY['farmer','telangana','rythu','bandhu','agriculture']),

('Aasara Pension Scheme',
 'आसरा पेंशन योजना',
 'Social security pension of ₹2,016 per month for elderly, widows, disabled in Telangana.',
 'तेलंगाना में बुजुर्गों, विधवाओं, विकलांगों को ₹2,016 प्रति माह सामाजिक सुरक्षा पेंशन।',
 '₹2,016 per month', 24192,
 '{"age_min":57,"age_max":999,"categories":["General","SC","ST","OBC"],"states":["Telangana"]}'::JSONB,
 ARRAY['Age Proof','Aadhaar Card','Bank Account','White Ration Card'],
 ARRAY['आयु प्रमाण','आधार कार्ड','बैंक खाता','सफेद राशन कार्ड'],
 'https://treasury.telangana.gov.in/', 'Treasury Department, Telangana',
 'state', 'Social Security', ARRAY['Telangana'], TRUE,
 ARRAY['pension','elderly','telangana','aasara','social security']),

-- UTTAR PRADESH
('Mukhyamantri Kanya Sumangala Yojana',
 'मुख्यमंत्री कन्या सुमंगला योजना',
 'Financial assistance of ₹25,000 in six installments from birth to graduation for girls in UP.',
 'यूपी में बालिकाओं के लिए जन्म से स्नातक तक छह किस्तों में ₹25,000 वित्तीय सहायता।',
 '₹25,000 in six installments', 25000,
 '{"age_min":0,"age_max":25,"income_max":300000,"categories":["General","SC","ST","OBC"],"states":["Uttar Pradesh"],"gender":"Female"}'::JSONB,
 ARRAY['Birth Certificate','Family Income Certificate','Aadhaar Card','Bank Account','Residence Certificate'],
 ARRAY['जन्म प्रमाण पत्र','पारिवारिक आय प्रमाण पत्र','आधार कार्ड','बैंक खाता','निवास प्रमाण पत्र'],
 'https://mksy.up.gov.in/', 'Women and Child Development Department, UP',
 'state', 'Women & Child', ARRAY['Uttar Pradesh'], TRUE,
 ARRAY['girl','up','kanya','sumangala','education']),

('Mukhyamantri Abhyudaya Yojana',
 'मुख्यमंत्री अभ्युदय योजना',
 'Free coaching for competitive exams (UPSC, JEE, NEET, NDA, CDS) for students in UP.',
 'यूपी के छात्रों के लिए प्रतियोगी परीक्षाओं (UPSC, JEE, NEET, NDA, CDS) हेतु मुफ्त कोचिंग।',
 'Free coaching', 0,
 '{"age_min":16,"age_max":35,"categories":["General","SC","ST","OBC"],"states":["Uttar Pradesh"]}'::JSONB,
 ARRAY['Educational Certificates','Aadhaar Card','Residence Certificate'],
 ARRAY['शैक्षिक प्रमाण पत्र','आधार कार्ड','निवास प्रमाण पत्र'],
 'https://abhyuday.up.gov.in/', 'Higher Education Department, UP',
 'state', 'Education', ARRAY['Uttar Pradesh'], TRUE,
 ARRAY['coaching','exam','up','student','competitive']),

-- UTTARAKHAND
('Nanda Gaura Yojana',
 'नंदा गौरा योजना',
 'Financial assistance of ₹51,000 at maturity (after 18 years) for second girl child in Uttarakhand.',
 'उत्तराखंड में दूसरी बालिका के लिए 18 वर्ष पर ₹51,000 वित्तीय सहायता।',
 '₹51,000 at maturity', 51000,
 '{"age_min":0,"age_max":18,"categories":["General","SC","ST","OBC"],"states":["Uttarakhand"],"gender":"Female"}'::JSONB,
 ARRAY['Birth Certificate','Income Certificate','Aadhaar Card','Bank Account'],
 ARRAY['जन्म प्रमाण पत्र','आय प्रमाण पत्र','आधार कार्ड','बैंक खाता'],
 'https://socialwelfare.uk.gov.in/', 'Women Empowerment Department, Uttarakhand',
 'state', 'Women & Child', ARRAY['Uttarakhand'], TRUE,
 ARRAY['girl','uttarakhand','nanda','gaura','maturity']),

-- WEST BENGAL
('Kanyashree Prakalpa',
 'कन्याश्री प्रकल्प',
 'Conditional cash transfer — ₹750/year (K1) and ₹25,000 one-time (K2) for girl students in WB.',
 'सशर्त नकद हस्तांतरण — बालिका छात्रों को ₹750/वर्ष (K1) और ₹25,000 एकमुश्त (K2)।',
 '₹750/year + ₹25,000 one-time', 25000,
 '{"age_min":13,"age_max":19,"categories":["General","SC","ST","OBC"],"states":["West Bengal"],"gender":"Female"}'::JSONB,
 ARRAY['School Enrollment Certificate','Bank Account','Aadhaar Card','Age Proof'],
 ARRAY['स्कूल नामांकन प्रमाण पत्र','बैंक खाता','आधार कार्ड','आयु प्रमाण'],
 'https://kanyashree.wbportal.gov.in/', 'Women and Child Development, WB',
 'state', 'Women & Child', ARRAY['West Bengal'], TRUE,
 ARRAY['girl','westbengal','kanyashree','education','student']),

('Lakshmir Bhandar',
 'लक्ष्मीर भंडार',
 'Monthly financial assistance — ₹1,000 (General) / ₹1,200 (SC/ST) to women heads of families in WB.',
 'पश्चिम बंगाल में परिवार की महिला मुखिया को मासिक सहायता — ₹1,000 (सामान्य) / ₹1,200 (SC/ST)।',
 '₹1,000 - ₹1,200 per month', 14400,
 '{"age_min":18,"age_max":60,"categories":["General","SC","ST","OBC"],"states":["West Bengal"],"gender":"Female"}'::JSONB,
 ARRAY['Aadhaar Card','Bank Account','Voter ID','Ration Card'],
 ARRAY['आधार कार्ड','बैंक खाता','मतदाता पहचान पत्र','राशन कार्ड'],
 'https://socialjustice.wb.gov.in/', 'Women and Child Development, WB',
 'state', 'Women & Child', ARRAY['West Bengal'], TRUE,
 ARRAY['women','westbengal','lakshmir','bhandar','monthly']),

('Krishak Bandhu',
 'कृषक बंधु',
 'Income support of ₹10,000/year + ₹2 lakh death benefit for farmers in West Bengal.',
 'पश्चिम बंगाल के किसानों को ₹10,000/वर्ष आय सहायता + ₹2 लाख मृत्यु लाभ।',
 '₹10,000/year + ₹2 lakh death benefit', 210000,
 '{"age_min":18,"age_max":60,"categories":["General","SC","ST","OBC"],"states":["West Bengal"],"occupation":"Farmer"}'::JSONB,
 ARRAY['Land Records','Aadhaar Card','Bank Account'],
 ARRAY['भूमि रिकॉर्ड','आधार कार्ड','बैंक खाता'],
 'https://krishakbandhu.net/', 'Agriculture Department, WB',
 'state', 'Agriculture', ARRAY['West Bengal'], TRUE,
 ARRAY['farmer','westbengal','krishak','bandhu','agriculture']),

-- JAMMU AND KASHMIR
('Mumkin Scheme',
 'मुमकिन योजना',
 'Interest-free loans and skill training for women seeking livelihood support in J&K.',
 'जम्मू-कश्मीर में आजीविका सहायता चाहने वाली महिलाओं के लिए ब्याज-मुक्त ऋण और कौशल प्रशिक्षण।',
 'Interest-free loans + skill training', 0,
 '{"age_min":18,"age_max":999,"categories":["General","SC","ST","OBC"],"states":["Jammu and Kashmir"],"gender":"Female"}'::JSONB,
 ARRAY['Aadhaar Card','Residence Certificate','Bank Account','Project Proposal'],
 ARRAY['आधार कार्ड','निवास प्रमाण पत्र','बैंक खाता','परियोजना प्रस्ताव'],
 'https://jk.gov.in/', 'Rural Development Department, J&K',
 'state', 'Skill Development', ARRAY['Jammu and Kashmir'], TRUE,
 ARRAY['women','jk','mumkin','livelihood','loan']);


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  SECTION 7 — ADMIN BOOTSTRAP                                          ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
--  1. Create a user account via your app's Signup or Supabase Auth dashboard
--  2. Find your user UUID:
--
--       SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
--
--  3. Promote to super_admin:
--
--       INSERT INTO admins (user_id, role) VALUES ('<uuid>', 'super_admin');
--


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  SECTION 8 — VERIFICATION                                             ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- Run these after setup to confirm everything is correct:

-- 8.1  Tables created
SELECT table_name
FROM   information_schema.tables
WHERE  table_schema = 'public'
ORDER  BY table_name;

-- 8.2  RLS enabled
SELECT tablename, rowsecurity AS rls_enabled
FROM   pg_tables
WHERE  schemaname = 'public'
AND    tablename IN ('user_profiles','admins','schemes','user_saved_schemes','scheme_checks','feedback','notifications');

-- 8.3  Policy count per table
SELECT tablename, COUNT(*) AS policy_count
FROM   pg_policies
WHERE  schemaname = 'public'
GROUP  BY tablename
ORDER  BY tablename;

-- 8.4  Seed stats
SELECT scheme_type, COUNT(*) AS cnt FROM schemes GROUP BY scheme_type;
SELECT COUNT(*) AS total_schemes FROM schemes;
