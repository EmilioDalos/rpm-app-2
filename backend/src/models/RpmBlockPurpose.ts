import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import RpmBlock from './RpmBlock';

class RpmBlockPurpose extends Model {
  public id!: string;
  public rpm_block_id!: string;
  public purpose!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

RpmBlockPurpose.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    rpm_block_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    purpose: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'rpm_block_purpose',
    timestamps: false,
  }
);

// Associations
RpmBlockPurpose.belongsTo(RpmBlock, { foreignKey: 'rpm_block_id' });

export default RpmBlockPurpose;