import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import RpmBlock from './RpmBlock';
import Category from './Category';
import RpmMassiveActionOccurrence from './RpmMassiveActionOccurrence';

interface RpmBlockMassiveActionAttributes {
  id: string;
  rpmBlockId: string;
  text: string;
  color?: string;
  textColor?: string;
  priority?: number;
  status: 'new' | 'planned' | 'in_progress' | 'leveraged' | 'completed' | 'cancelled' | 'not_needed' | 'moved';
  startDate?: Date;
  endDate?: Date;
  isDateRange?: boolean;
  hour?: number;
  leverage?: string;
  missedDate?: Date;
  description?: string;
  categoryId?: string;
  recurrencePattern?: string;
  recurrenceType?: 'day' | 'week' | 'month' | 'year';
  createdAt: Date;
  updatedAt: Date;
  occurrences?: RpmMassiveActionOccurrence[];
}

interface RpmBlockMassiveActionCreationAttributes extends Omit<RpmBlockMassiveActionAttributes, 'id' | 'createdAt' | 'updatedAt' | 'occurrences'> {}

class RpmBlockMassiveAction extends Model<RpmBlockMassiveActionAttributes, RpmBlockMassiveActionCreationAttributes> {
  public id!: string;
  public rpmBlockId!: string;
  public text!: string;
  public color?: string;
  public textColor?: string;
  public priority?: number;
  public status!: 'new' | 'planned' | 'in_progress' | 'leveraged' | 'completed' | 'cancelled' | 'not_needed' | 'moved';
  public startDate?: Date;
  public endDate?: Date;
  public leverage?: string;
  public isDateRange?: boolean;
  public hour?: number;
  public missedDate?: Date;
  public description?: string;
  public categoryId?: string;
  public recurrencePattern?: string;
  public recurrenceType?: 'day' | 'week' | 'month' | 'year';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public occurrences?: RpmMassiveActionOccurrence[];
}

RpmBlockMassiveAction.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  rpmBlockId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: RpmBlock,
      key: 'id',
    },
    field: 'rpm_block_id'
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING(7),
    allowNull: true,
  },
  textColor: {
    type: DataTypes.STRING(7),
    allowNull: true,
    field: 'text_color'
  },
  priority: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('new', 'planned', 'in_progress', 'leveraged', 'completed', 'cancelled', 'not_needed', 'moved'),
    allowNull: false,
    defaultValue: 'new',
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'start_date'
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'end_date'
  },
  isDateRange: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    field: 'is_date_range'
  },
  hour: {
    type: DataTypes.DECIMAL,
    allowNull: true,
  },
  missedDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'missed_date'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  leverage: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: Category,
      key: 'id',
    },
    field: 'category_id'
  },
  recurrencePattern: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  recurrenceType: {
    type: DataTypes.ENUM('day', 'week', 'month', 'year'),
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
  modelName: 'RpmBlockMassiveAction',
  tableName: 'rpm_block_massive_action',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
});

// Associations are defined in index.ts
// This ensures proper model initialization order

export default RpmBlockMassiveAction;
