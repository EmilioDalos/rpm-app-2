-- Add action_id column to rpm_block_massive_action_note table
ALTER TABLE rpm_block_massive_action_note ADD COLUMN IF NOT EXISTS action_id UUID REFERENCES rpm_block_massive_action(id) ON DELETE CASCADE;

-- Update existing notes with action_id based on their occurrence
UPDATE rpm_block_massive_action_note n
SET action_id = o.action_id
FROM rpm_massive_action_occurrence o
WHERE n.occurrence_id = o.id;

-- Make action_id required after migration
ALTER TABLE rpm_block_massive_action_note ALTER COLUMN action_id SET NOT NULL; 