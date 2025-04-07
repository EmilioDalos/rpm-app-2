import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db';

interface CalendarEventAttributes {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  categoryId?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CalendarEventCreationAttributes extends Omit<CalendarEventAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class CalendarEvent extends Model<CalendarEventAttributes, CalendarEventCreationAttributes> {
  public id!: string;
  public title!: string;
  public description!: string;
  public startDate!: Date;
  public endDate!: Date;
  public location?: string;
  public categoryId?: string;
  public color?: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

CalendarEvent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_date'
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'end_date'
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'category',
        key: 'id',
      },
      field: 'category_id',
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    },
  },
  {
    sequelize,
    modelName: 'CalendarEvent',
    tableName: 'calendar_event',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default CalendarEvent;