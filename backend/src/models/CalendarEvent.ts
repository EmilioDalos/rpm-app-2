import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db';

interface CalendarEventAttributes {
  id: string;
  title: string;
  description: string;
  start_date: Date;
  end_date: Date;
  location?: string;
  category?: string;
  color?: string;
  created_at: Date;
  updated_at: Date;
}

interface CalendarEventCreationAttributes extends Omit<CalendarEventAttributes, 'id' | 'created_at' | 'updated_at'> {}

class CalendarEvent extends Model<CalendarEventAttributes, CalendarEventCreationAttributes> {
  public id!: string;
  public title!: string;
  public description!: string;
  public start_date!: Date;
  public end_date!: Date;
  public location?: string;
  public category?: string;
  public color?: string;
  public created_at!: Date;
  public updated_at!: Date;
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
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
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