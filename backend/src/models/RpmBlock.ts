import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db';

interface RPMBlockAttributes {
  id: string;
  category_id: string | null;
  result: string;
  type: 'text' | 'image' | 'video' | 'link';
  order: number;
  created_at: Date;
  updated_at: Date;
}

interface RPMBlockCreationAttributes extends Omit<RPMBlockAttributes, 'id' | 'created_at' | 'updated_at'> {}

class RPMBlock extends Model<RPMBlockAttributes, RPMBlockCreationAttributes> {
  public id!: string;
  public category_id!: string | null;
  public result!: string;
  public type!: 'text' | 'image' | 'video' | 'link';
  public order!: number;
  public created_at!: Date;
  public updated_at!: Date;
}

RPMBlock.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'category',
        key: 'id'
      }
    },
    result: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('text', 'image', 'video', 'link'),
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    modelName: 'RPMBlock',
    tableName: 'rpm_block',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default RPMBlock;