import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import RpmBlockMassiveAction from './RpmBlockMassiveAction';

interface RpmMassiveActionRecurrenceAttributes {
  id: string;
  actionId: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  createdAt: Date;
  updatedAt: Date;
  
}

interface RpmMassiveActionRecurrenceCreationAttributes extends Omit<RpmMassiveActionRecurrenceAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class RpmMassiveActionRecurrence extends Model<RpmMassiveActionRecurrenceAttributes, RpmMassiveActionRecurrenceCreationAttributes> {
  public id!: string;
  public actionId!: string;
  public dayOfWeek!: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;


}

RpmMassiveActionRecurrence.init({
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
  dayOfWeek: {
    type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
    allowNull: false,
    field: 'day_of_week'
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
  modelName: 'RpmMassiveActionRecurrence',
  tableName: 'rpm_massive_action_recurrence',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
});

export default RpmMassiveActionRecurrence; 