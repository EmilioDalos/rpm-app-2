'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      // First try to create the ENUM type
      await queryInterface.sequelize.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_rpm_block_massive_action_recurrence_type') THEN
            CREATE TYPE "enum_rpm_block_massive_action_recurrence_type" AS ENUM ('day', 'week', 'month', 'year');
          END IF;
        END$$;
      `);

      // Add recurrence_pattern column if it doesn't exist
      await queryInterface.sequelize.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'rpm_block_massive_action'
            AND column_name = 'recurrence_pattern'
          ) THEN
            ALTER TABLE rpm_block_massive_action ADD COLUMN recurrence_pattern TEXT;
          END IF;
        END$$;
      `);

      // Add recurrence_type column if it doesn't exist
      await queryInterface.sequelize.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'rpm_block_massive_action'
            AND column_name = 'recurrence_type'
          ) THEN
            ALTER TABLE rpm_block_massive_action ADD COLUMN recurrence_type "enum_rpm_block_massive_action_recurrence_type";
          END IF;
        END$$;
      `);
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  },

  async down (queryInterface, Sequelize) {
    try {
      // Remove the columns if they exist
      await queryInterface.sequelize.query(`
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'rpm_block_massive_action'
            AND column_name = 'recurrence_pattern'
          ) THEN
            ALTER TABLE rpm_block_massive_action DROP COLUMN recurrence_pattern;
          END IF;

          IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'rpm_block_massive_action'
            AND column_name = 'recurrence_type'
          ) THEN
            ALTER TABLE rpm_block_massive_action DROP COLUMN recurrence_type;
          END IF;
        END$$;
      `);

      // Drop the ENUM type if it exists
      await queryInterface.sequelize.query(`
        DROP TYPE IF EXISTS "enum_rpm_block_massive_action_recurrence_type";
      `);
    } catch (error) {
      console.error('Migration rollback failed:', error);
      throw error;
    }
  }
};
