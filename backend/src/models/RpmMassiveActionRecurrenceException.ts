import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import RpmBlockMassiveAction from './RpmBlockMassiveAction';
import RpmMassiveActionRecurrence from './RpmMassiveActionRecurrence';

interface RpmMassiveActionRecurrenceExceptionAttributes {
  id: string;
  actionId: string;
  actionRecurrenceId: string;
  exceptionDate: Date;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface RpmMassiveActionRecurrenceExceptionCreationAttributes extends Omit<RpmMassiveActionRecurrenceExceptionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class RpmMassiveActionRecurrenceException extends Model<RpmMassiveActionRecurrenceExceptionAttributes, RpmMassiveActionRecurrenceExceptionCreationAttributes> {
  public id!: string;
  public actionId!: string;
  public actionRecurrenceId!: string;
  public exceptionDate!: Date;
  public reason?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RpmMassiveActionRecurrenceException.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  actionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: RpmBlockMassiveAction,
      key: 'id',
    },
    field: 'action_id'
  },
  actionRecurrenceId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: RpmMassiveActionRecurrence,
      key: 'id',
    },
    field: 'action_recurrence_id'
  },
  exceptionDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'exception_date'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  sequelize,
  modelName: 'RpmMassiveActionRecurrenceException',
  tableName: 'rpm_massive_action_recurrence_exception',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
});

export default RpmMassiveActionRecurrenceException; 