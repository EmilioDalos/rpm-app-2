-- Define action_status enum type
DO $$ BEGIN
  CREATE TYPE action_status AS ENUM (
    'new',
    'planned',
    'in_progress',
    'leveraged',
    'completed',
    'cancelled',
    'not_needed',
    'moved'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

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

CREATE TABLE IF NOT EXISTS "role" (
  id UUID PRIMARY KEY,
  category_id UUID REFERENCES "category"(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  purpose TEXT,
  description TEXT,
  identity_statement TEXT,
  image_blob BYTEA,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Define recurrence type enum for rpm_block_massive_action
DO $$ BEGIN
  CREATE TYPE "enum_rpm_block_massive_action_recurrence_type" AS ENUM ('day', 'week', 'month', 'year');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES "category"(id) ON DELETE SET NULL,
  result TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('Day', 'Week', 'Month', 'Quarter', 'Project', 'Category')),
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "rpm_block_purpose" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rpm_block_id UUID REFERENCES "rpm_block"(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "rpm_block_massive_action" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rpm_block_id UUID NOT NULL REFERENCES "rpm_block"(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  color VARCHAR(7),
  text_color VARCHAR(7),
  priority INTEGER,
  leverage TEXT,
  status action_status NOT NULL DEFAULT 'new',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_date_range BOOLEAN DEFAULT FALSE,
  hour NUMERIC,
  missed_date TIMESTAMP WITH TIME ZONE,
  description TEXT,
  recurrence_pattern JSONB DEFAULT '{}'::JSONB,
  recurrence_type "enum_rpm_block_massive_action_recurrence_type",
  recurrence_range JSONB,
  category_id UUID REFERENCES "category"(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "rpm_massive_action_occurrence" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_id UUID REFERENCES rpm_block_massive_action(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE,
  hour NUMERIC,
  location VARCHAR(255),
  duration_amount INTEGER,
  duration_unit VARCHAR(50),
  recurrence_pattern JSONB DEFAULT '{}'::jsonb,
  recurrence_range JSONB,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Gestructureerde uitzonderingen voor terugkerende acties
CREATE TABLE IF NOT EXISTS "rpm_massive_action_exception" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_id UUID NOT NULL REFERENCES "rpm_block_massive_action"(id) ON DELETE CASCADE,
  exception_date TIMESTAMPTZ NOT NULL,
  exception_type VARCHAR(50) NOT NULL,    -- 'overgeslagen', 'gewijzigd', 'verplaatst'
  modified_data JSONB,                     -- opgeslagen aangepaste velden
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "rpm_block_massive_action_note" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  occurrence_id UUID NOT NULL REFERENCES rpm_massive_action_occurrence(id) ON DELETE CASCADE,
  action_id     UUID NOT NULL REFERENCES rpm_block_massive_action(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  type VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "rpm_block_massive_action_note_metric" (
  note_id UUID REFERENCES "rpm_block_massive_action_note"(id) ON DELETE CASCADE,
  name TEXT,
  value NUMERIC,
  unit VARCHAR(50),
  timestamp TIMESTAMP
);
