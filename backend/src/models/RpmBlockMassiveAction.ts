import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

class RpmBlockMassiveAction extends Model {}

RpmBlockMassiveAction.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  rpm_block_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING(7),
    allowNull: true,
  },
  text_color: {
    type: DataTypes.STRING(7),
    allowNull: true,
  },
  leverage: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  duration_amount: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  duration_unit: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  priority: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  key: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  is_date_range: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  hour: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  missed_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  sequelize,
  modelName: 'RpmBlockMassiveAction',
  tableName: 'rpm_block_massive_action',
  timestamps: false,
});

export default RpmBlockMassiveAction;
