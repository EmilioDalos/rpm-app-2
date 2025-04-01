-- Enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Category Table
CREATE TABLE IF NOT EXISTS "category" (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('personal', 'professional')),
  description TEXT,
  vision TEXT,
  purpose TEXT,
  resources TEXT,
  color VARCHAR(7),
  image_blob BYTEA,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Role Table
CREATE TABLE IF NOT EXISTS "role" (
  id UUID PRIMARY KEY,
  category_id UUID REFERENCES "category"(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  purpose TEXT,
  description TEXT,
  identity_statement TEXT,
  image_blob BYTEA,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Other Tables
CREATE TABLE IF NOT EXISTS "role_core_quality" (
  role_id UUID REFERENCES "role"(id) ON DELETE CASCADE,
  quality INT
);

CREATE TABLE IF NOT EXISTS "role_incantation" (
  role_id UUID REFERENCES "role"(id) ON DELETE CASCADE,
  incantation TEXT
);

CREATE TABLE IF NOT EXISTS "category_result" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES "category"(id) ON DELETE CASCADE,
  result TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "category_action_plan" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES "category"(id) ON DELETE CASCADE,
  action_plan  TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "category_three_to_thrive" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES "category"(id) ON DELETE CASCADE,
  three_to_thrive TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "rpm_block" (
  id UUID PRIMARY KEY,
  category_id UUID REFERENCES "category"(id) ON DELETE CASCADE,
  result TEXT,
  type VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  saved BOOLEAN
);

CREATE TABLE IF NOT EXISTS "rpm_purpose" (
  rpm_block_id UUID REFERENCES "rpm_block"(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "massive_action" (
  id UUID PRIMARY KEY,
  category_id UUID REFERENCES "category"(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  color VARCHAR(7),
  text_color VARCHAR(7),
  leverage TEXT,
  duration_amount INT,
  duration_unit VARCHAR(50),
  priority INT,
  key VARCHAR(50),
  start_date DATE,
  end_date DATE,
  is_date_range BOOLEAN,
  hour INT,
  missed_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "massive_action_note" (
  id UUID PRIMARY KEY,
  massive_action_id UUID REFERENCES "massive_action"(id) ON DELETE CASCADE,
  text TEXT,
  type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "massive_action_note_metric" (
  note_id UUID REFERENCES "massive_action_note"(id) ON DELETE CASCADE,
  name TEXT,
  value NUMERIC,
  unit VARCHAR(50),
  timestamp TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "calendar_event" (
  id UUID PRIMARY KEY,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "calendar_event_massive_action" (
  calendar_event_id UUID REFERENCES "calendar_event"(id) ON DELETE CASCADE,
  massive_action_id UUID REFERENCES "massive_action"(id) ON DELETE CASCADE
);