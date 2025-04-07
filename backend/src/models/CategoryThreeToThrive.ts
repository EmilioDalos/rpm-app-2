import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';
import Category from './Category';

interface CategoryThreeToThriveAttributes {
  id: string;
  categoryId: string;
  threeToThrive: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CreationAttributes extends Optional<CategoryThreeToThriveAttributes, 'id'> {}

class CategoryThreeToThrive extends Model<CategoryThreeToThriveAttributes, CreationAttributes> implements CategoryThreeToThriveAttributes {
  public id!: string;
  public categoryId!: string;
  public threeToThrive!: string;
  public createdAt?: Date;
  public updatedAt?: Date;
}

CategoryThreeToThrive.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
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
    threeToThrive: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'three_to_thrive'
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
  },
  {
    sequelize,
    modelName: 'CategoryThreeToThrive',
    tableName: 'category_three_to_thrive',
    timestamps: true
  }
);

export default CategoryThreeToThrive;