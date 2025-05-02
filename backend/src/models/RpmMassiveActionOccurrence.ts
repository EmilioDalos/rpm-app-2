import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import RpmBlockMassiveAction from './RpmBlockMassiveAction';
import RpmBlockMassiveActionNote from './RpmBlockMassiveActionNote';

type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

interface RecurrencePattern {
  type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number;

  // Daily options
  dailyOption?: 'everyX' | 'workdays';
  dailyInterval?: number;

  // Weekly options
  weeklyDays?: DayOfWeek[];
  weeklyInterval?: number;

  // Monthly options
  monthlyOption?: 'fixedDay' | 'relativeDay';
  monthlyDay?: number;
  monthlyOrdinal?: 'first' | 'second' | 'third' | 'fourth' | 'last';
  monthlyDayType?: 'day' | 'workday' | 'weekend' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  monthlyInterval?: number;

  // Yearly options
  yearlyOption?: 'fixedDate' | 'relativeDay';
  yearlyMonth?: number;
  yearlyDay?: number;
  yearlyOrdinal?: 'first' | 'second' | 'third' | 'fourth' | 'last';
  yearlyDayType?: 'day' | 'workday' | 'weekend' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  yearlyRelativeMonth?: number;
  yearlyInterval?: number;
}

interface RecurrenceRange {
  type: 'noEnd' | 'endAfter' | 'endBy';
  occurrences?: number;
  endDate?: string;
}

interface RpmMassiveActionOccurrenceAttributes {
  id: string;
  actionId: string;
  date: Date;
  hour?: number;
  location?: string;
  durationAmount?: number;
  durationUnit?: string;
  recurrencePattern?: RecurrencePattern;
  recurrenceRange?: RecurrenceRange;
  isRecurring?: boolean;
  recurrenceEndDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  notes?: RpmBlockMassiveActionNote[];
  action?: RpmBlockMassiveAction;
}

interface RpmMassiveActionOccurrenceCreationAttributes extends Omit<RpmMassiveActionOccurrenceAttributes, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'action'> {}

class RpmMassiveActionOccurrence extends Model<RpmMassiveActionOccurrenceAttributes, RpmMassiveActionOccurrenceCreationAttributes> {
  public id!: string;
  public actionId!: string;
  public date!: Date;
  public hour?: number;
  public location?: string;
  public durationAmount?: number;
  public durationUnit?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public notes?: RpmBlockMassiveActionNote[];
  public action?: RpmBlockMassiveAction;
}

RpmMassiveActionOccurrence.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  actionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: RpmBlockMassiveAction,
      key: 'id'
    },
    field: 'action_id'
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  hour: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true
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
  recurrencePattern: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'recurrence_pattern'
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
  underscored: true
});

// Associations are defined in index.ts
// This ensures proper model initialization order

export default RpmMassiveActionOccurrence; 