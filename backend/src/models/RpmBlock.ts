import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db';
import Category from './Category';
import RpmBlockPurpose from './RpmBlockPurpose';
import RpmBlockMassiveAction from './RpmBlockMassiveAction';

interface RpmBlockAttributes {
  id: string;
  categoryId: string | null;
  result: string;
  type: 'text' | 'image' | 'video' | 'link';
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

interface RpmBlockCreationAttributes extends Omit<RpmBlockAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class RpmBlock extends Model<RpmBlockAttributes, RpmBlockCreationAttributes> {
  public id!: string;
  public categoryId!: string | null;
  public result!: string;
  public type!: 'text' | 'image' | 'video' | 'link';
  public order!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

RpmBlock.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'category_id',
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
    modelName: 'RPMBlock',
    tableName: 'rpm_block',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Associations 
// RPMBlock associations
RpmBlock.hasMany(RpmBlockMassiveAction, {
  foreignKey: 'rpm_block_id',
  as: 'massiveActions',
 });

RpmBlock.hasMany(RpmBlockPurpose, {
  foreignKey: 'rpm_block_id',
  as: 'purposes',
});

RpmBlock.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category',
});

  

export default RpmBlock;