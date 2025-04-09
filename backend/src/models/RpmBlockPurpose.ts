import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

interface RpmBlockPurposeAttributes {
  id: string;
  rpmBlockId: string;
  purpose: string;
  createdAt: Date;
  updatedAt: Date;
}

interface RpmBlockPurposeCreationAttributes extends Omit<RpmBlockPurposeAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class RpmBlockPurpose extends Model<RpmBlockPurposeAttributes, RpmBlockPurposeCreationAttributes> {
  public id!: string;
  public rpmBlockId!: string;
  public purpose!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RpmBlockPurpose.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    rpmBlockId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'rpm_block_id'
    },
    purpose: {
      type: DataTypes.TEXT,
      allowNull: false,
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
    },
  },
  {
    sequelize,
    tableName: 'rpm_block_purpose',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  }
);

// We'll set up associations in the index.ts file instead to avoid circular dependencies

export default RpmBlockPurpose;