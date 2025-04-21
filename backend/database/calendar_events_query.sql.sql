CREATE TABLE IF NOT EXISTS "rpm_massive_action_recurrence_exception" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_id UUID REFERENCES rpm_block_massive_action(id) ON DELETE CASCADE,
  action_recurrence_id UUID REFERENCES rpm_massive_action_recurrence(id) ON DELETE CASCADE,
  exception_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRTIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMPENT_
);
