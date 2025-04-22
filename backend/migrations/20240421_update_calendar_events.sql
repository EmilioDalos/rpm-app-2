-- Migration to update calendar events structure

-- 1. Rename rpm_massive_action_recurrence to rpm_massive_action_occurrence
ALTER TABLE IF EXISTS "rpm_massive_action_recurrence" RENAME TO "rpm_massive_action_occurrence";

-- 2. Update the rpm_block_massive_action_note table to reference occurrence_id instead of action_id
ALTER TABLE IF EXISTS "rpm_block_massive_action_note" 
  DROP CONSTRAINT IF EXISTS "rpm_block_massive_action_note_action_id_fkey",
  ADD COLUMN IF NOT EXISTS "occurrence_id" UUID,
  ADD CONSTRAINT "rpm_block_massive_action_note_occurrence_id_fkey" 
    FOREIGN KEY ("occurrence_id") 
    REFERENCES "rpm_massive_action_occurrence"("id") 
    ON DELETE CASCADE;

-- 3. Drop the rpm_massive_action_recurrence_exception table
DROP TABLE IF EXISTS "rpm_massive_action_recurrence_exception";

-- 4. Remove columns from rpm_block_massive_action that are now in rpm_massive_action_occurrence
ALTER TABLE IF EXISTS "rpm_block_massive_action" 
  DROP COLUMN IF EXISTS "leverage",
  DROP COLUMN IF EXISTS "duration_amount",
  DROP COLUMN IF EXISTS "duration_unit",
  DROP COLUMN IF EXISTS "location";

-- 5. Add columns to rpm_massive_action_occurrence if they don't exist
ALTER TABLE IF EXISTS "rpm_massive_action_occurrence" 
  ADD COLUMN IF NOT EXISTS "location" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "leverage" TEXT,
  ADD COLUMN IF NOT EXISTS "duration_amount" INTEGER,
  ADD COLUMN IF NOT EXISTS "duration_unit" VARCHAR(50);

-- 6. Migrate data from rpm_block_massive_action to rpm_massive_action_occurrence
-- This is a placeholder for data migration logic that would need to be implemented
-- based on the specific data in your database

-- 7. After data migration, remove the action_id column from rpm_block_massive_action_note
-- ALTER TABLE IF EXISTS "rpm_block_massive_action_note" DROP COLUMN IF EXISTS "action_id";
-- Uncomment this line after data migration is complete 