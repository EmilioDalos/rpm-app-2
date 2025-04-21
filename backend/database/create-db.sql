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
  category_id UUID REFERENCES "category"(id) ON DELETE SET NULL,
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
  leverage TEXT,
  duration_amount INTEGER,
  duration_unit VARCHAR(50),
  priority INTEGER,
  key VARCHAR(50),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_date_range BOOLEAN DEFAULT FALSE,
  hour NUMERIC,
  missed_date TIMESTAMP WITH TIME ZONE,
  description TEXT,
  location VARCHAR(255),
  category_id UUID REFERENCES "category"(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "rpm_massive_action_recurrence" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_id UUID REFERENCES rpm_block_massive_action(id) ON DELETE CASCADE,
  day_of_week VARCHAR(9) CHECK (day_of_week IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "rpm_massive_action_recurrence_exception" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_id UUID REFERENCES rpm_block_massive_action(id) ON DELETE CASCADE,
  action_recurrence_id UUID REFERENCES rpm_massive_action_recurrence(id) ON DELETE CASCADE,
  exception_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "rpm_block_massive_action_note" (
  id UUID PRIMARY KEY,
  action_id UUID REFERENCES "rpm_block_massive_action"(id) ON DELETE CASCADE,
  text TEXT,
  type VARCHAR(50),
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
