import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import RpmBlock from './RpmBlock';
import Category from './Category';

interface RpmBlockMassiveActionAttributes {
  id: string;
  rpmBlockId: string;
  text: string;
  color?: string;
  textColor?: string;
  leverage?: string;
  durationAmount?: number;
  durationUnit?: string;
  priority?: number;
  key?: string;
  startDate?: Date;
  endDate?: Date;
  isDateRange?: boolean;
  hour?: number;
  missedDate?: Date;
  description?: string;
  location?: string;
  categoryId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface RpmBlockMassiveActionCreationAttributes extends Omit<RpmBlockMassiveActionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class RpmBlockMassiveAction extends Model<RpmBlockMassiveActionAttributes, RpmBlockMassiveActionCreationAttributes> {
  public id!: string;
  public rpmBlockId!: string;
  public text!: string;
  public color?: string;
  public textColor?: string;
  public leverage?: string;
  public durationAmount?: number;
  public durationUnit?: string;
  public priority?: number;
  public key?: string;
  public startDate?: Date;
  public endDate?: Date;
  public isDateRange?: boolean;
  public hour?: number;
  public missedDate?: Date;
  public description?: string;
  public location?: string;
  public categoryId?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
  priority: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  key: {
    type: DataTypes.STRING(50),
    allowNull: true,
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
    field: 'is_date_range',
    defaultValue: false
  },
  hour: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  missedDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'missed_date'
  },
  description: {
    type: DataTypes.TEXT,
  },
  location: {
    type: DataTypes.STRING(255),
  },
  categoryId: {
    type: DataTypes.UUID,
    references: {
      model: Category,
      key: 'id',
    },
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

// We'll set up associations in the index.ts file instead to avoid circular dependencies

export default RpmBlockMassiveAction;
