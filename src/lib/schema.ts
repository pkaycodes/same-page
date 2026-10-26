export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  phone_verified_at TIMESTAMPTZ,
  alias TEXT,
  birth_year INTEGER,
  gender TEXT CHECK (gender IS NULL OR gender IN ('woman', 'man')),
  seeking_gender TEXT CHECK (seeking_gender IS NULL OR seeking_gender IN ('woman', 'man')),
  city TEXT,
  region TEXT,
  bio TEXT CHECK (bio IS NULL OR length(bio) <= 1000),
  relationship_status TEXT CHECK (relationship_status IS NULL OR relationship_status IN ('single', 'divorced', 'separated', 'widowed')),
  children_status TEXT CHECK (children_status IS NULL OR children_status IN ('none', 'has_children', 'prefer_not_to_say')),
  wants_children TEXT CHECK (wants_children IS NULL OR wants_children IN ('yes', 'no', 'open', 'already_have')),
  partner_knowledge TEXT CHECK (partner_knowledge IS NULL OR partner_knowledge IN ('must_know', 'open', 'private')),
  exclusivity TEXT CHECK (exclusivity IS NULL OR exclusivity IN ('monogamous', 'open_to_discuss', 'non_monogamous')),
  communication_style TEXT CHECK (communication_style IS NULL OR communication_style IN ('direct', 'gentle', 'playful', 'reflective')),
  meeting_frequency TEXT CHECK (meeting_frequency IS NULL OR meeting_frequency IN ('slow', 'balanced', 'frequent')),
  emotional_closeness TEXT CHECK (emotional_closeness IS NULL OR emotional_closeness IN ('independent', 'balanced', 'close')),
  timeline TEXT CHECK (timeline IS NULL OR timeline IN ('no_timeline', 'within_year', 'within_two_years', 'slow')),
  openness TEXT CHECK (openness IS NULL OR openness IN ('guarded', 'balanced', 'open')),
  public_visibility TEXT CHECK (public_visibility IS NULL OR public_visibility IN ('private', 'discreet', 'open')),
  faith TEXT CHECK (faith IS NULL OR faith IN ('christian', 'muslim', 'spiritual', 'other', 'prefer_not_to_say')),
  occupation TEXT,
  smoking TEXT CHECK (smoking IS NULL OR smoking IN ('never', 'socially', 'regularly')),
  drinking TEXT CHECK (drinking IS NULL OR drinking IN ('never', 'socially', 'regularly')),
  height_cm INTEGER CHECK (height_cm IS NULL OR (height_cm >= 120 AND height_cm <= 230)),
  willing_to_travel SMALLINT NOT NULL DEFAULT 0 CHECK (willing_to_travel IN (0, 1)),
  age_min INTEGER NOT NULL DEFAULT 25 CHECK (age_min >= 18 AND age_min <= 99),
  age_max INTEGER NOT NULL DEFAULT 40 CHECK (age_max >= 18 AND age_max <= 99),
  onboarding_complete SMALLINT NOT NULL DEFAULT 0 CHECK (onboarding_complete IN (0, 1)),
  is_paused SMALLINT NOT NULL DEFAULT 0 CHECK (is_paused IN (0, 1)),
  account_state TEXT NOT NULL DEFAULT 'active' CHECK (account_state IN ('active', 'paused', 'suspended', 'deleted')),
  is_demo SMALLINT NOT NULL DEFAULT 0 CHECK (is_demo IN (0, 1)),
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (age_min <= age_max)
);

CREATE UNIQUE INDEX IF NOT EXISTS users_alias_lower_idx ON users (lower(alias)) WHERE alias IS NOT NULL;

CREATE TABLE IF NOT EXISTS user_intentions (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  is_primary SMALLINT NOT NULL DEFAULT 0 CHECK (is_primary IN (0, 1)),
  rank INTEGER NOT NULL DEFAULT 1 CHECK (rank BETWEEN 1 AND 3),
  PRIMARY KEY (user_id, code)
);

CREATE TABLE IF NOT EXISTS user_interests (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  PRIMARY KEY (user_id, code)
);

CREATE TABLE IF NOT EXISTS user_circumstances (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  PRIMARY KEY (user_id, code)
);

CREATE TABLE IF NOT EXISTS user_boundaries (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  PRIMARY KEY (user_id, code)
);

CREATE TABLE IF NOT EXISTS privacy_settings (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  allow_requests TEXT NOT NULL DEFAULT 'compatible_only' CHECK (allow_requests IN ('everyone', 'compatible_only')),
  show_age SMALLINT NOT NULL DEFAULT 1 CHECK (show_age IN (0, 1)),
  show_location SMALLINT NOT NULL DEFAULT 1 CHECK (show_location IN (0, 1)),
  show_intentions SMALLINT NOT NULL DEFAULT 1 CHECK (show_intentions IN (0, 1)),
  ai_text_matching SMALLINT NOT NULL DEFAULT 0 CHECK (ai_text_matching IN (0, 1)),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS consents (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  policy_type TEXT NOT NULL,
  version TEXT NOT NULL,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, policy_type, version)
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS otp_codes (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blocks (
  blocker_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  reporter_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS connection_requests (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  note TEXT NOT NULL CHECK (length(note) BETWEEN 1 AND 500),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ,
  CHECK (sender_id <> receiver_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS one_pending_request_direction
  ON connection_requests (sender_id, receiver_id) WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL UNIQUE REFERENCES connection_requests(id) ON DELETE CASCADE,
  user_a TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_b TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (user_a <> user_b)
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS user_intentions_user_idx ON user_intentions (user_id);
CREATE INDEX IF NOT EXISTS user_interests_user_idx ON user_interests (user_id);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (user_id);
CREATE INDEX IF NOT EXISTS otp_phone_idx ON otp_codes (phone, created_at DESC);
CREATE INDEX IF NOT EXISTS blocks_blocked_idx ON blocks (blocked_id);
CREATE INDEX IF NOT EXISTS requests_receiver_idx ON connection_requests (receiver_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS requests_sender_idx ON connection_requests (sender_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS messages_conversation_idx ON messages (conversation_id, created_at);
CREATE INDEX IF NOT EXISTS reports_reported_idx ON reports (reported_id, status);
`;
