import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import RpmBlockMassiveAction from './RpmBlockMassiveAction';
import RpmBlockMassiveActionNote from './RpmBlockMassiveActionNote';

interface RpmMassiveActionOccurrenceAttributes {
  id: string;
  actionId: string;
  date: Date;
  hour?: number;
  location?: string;
  leverage?: string;
  durationAmount?: number;
  durationUnit?: string;
  createdAt: Date;
  updatedAt: Date;
  notes?: RpmBlockMassiveActionNote[];
}

interface RpmMassiveActionOccurrenceCreationAttributes extends Omit<RpmMassiveActionOccurrenceAttributes, 'id' | 'createdAt' | 'updatedAt' | 'notes'> {}

class RpmMassiveActionOccurrence extends Model<RpmMassiveActionOccurrenceAttributes, RpmMassiveActionOccurrenceCreationAttributes> {
  public id!: string;
  public actionId!: string;
  public date!: Date;
  public hour?: number;
  public location?: string;
  public leverage?: string;
  public durationAmount?: number;
  public durationUnit?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  // Define associations
  public notes?: RpmBlockMassiveActionNote[];
  public readonly action?: RpmBlockMassiveAction;
}

RpmMassiveActionOccurrence.init({
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
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  hour: {
    type: DataTypes.DECIMAL,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  leverage: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  durationAmount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'duration_amount'
  },
  durationUnit: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'duration_unit'
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
  modelName: 'RpmMassiveActionOccurrence',
  tableName: 'rpm_massive_action_occurrence',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
});

export default RpmMassiveActionOccurrence; 