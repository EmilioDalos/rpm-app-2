import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.addColumn('rpm_massive_action_occurrence', 'text', {
    type: DataTypes.STRING,
    allowNull: true,
  });

  await queryInterface.addColumn('rpm_massive_action_occurrence', 'color', {
    type: DataTypes.STRING,
    allowNull: true,
  });

  await queryInterface.addColumn('rpm_massive_action_occurrence', 'textColor', {
    type: DataTypes.STRING,
    allowNull: true,
  });

  await queryInterface.addColumn('rpm_massive_action_occurrence', 'priority', {
    type: DataTypes.INTEGER,
    allowNull: true,
  });

  await queryInterface.addColumn('rpm_massive_action_occurrence', 'status', {
    type: DataTypes.ENUM('new', 'planned', 'in_progress', 'leveraged', 'completed', 'cancelled', 'not_needed', 'moved'),
    allowNull: true,
  });

  await queryInterface.addColumn('rpm_massive_action_occurrence', 'description', {
    type: DataTypes.TEXT,
    allowNull: true,
  });

  await queryInterface.addColumn('rpm_massive_action_occurrence', 'categoryId', {
    type: DataTypes.STRING,
    allowNull: true,
  });

  await queryInterface.addColumn('rpm_massive_action_occurrence', 'dayOfWeek', {
    type: DataTypes.ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'),
    allowNull: true,
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('rpm_massive_action_occurrence', 'text');
  await queryInterface.removeColumn('rpm_massive_action_occurrence', 'color');
  await queryInterface.removeColumn('rpm_massive_action_occurrence', 'textColor');
  await queryInterface.removeColumn('rpm_massive_action_occurrence', 'priority');
  await queryInterface.removeColumn('rpm_massive_action_occurrence', 'status');
  await queryInterface.removeColumn('rpm_massive_action_occurrence', 'description');
  await queryInterface.removeColumn('rpm_massive_action_occurrence', 'categoryId');
  await queryInterface.removeColumn('rpm_massive_action_occurrence', 'dayOfWeek');
} 