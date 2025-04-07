import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

interface CategoryResultAttributes {
  id: string;
  categoryId: string;
  result: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CreationAttributes extends Optional<CategoryResultAttributes, 'id'> {}

class CategoryResult extends Model<CategoryResultAttributes, CreationAttributes> implements CategoryResultAttributes {
  public id!: string;
  public categoryId!: string;
  public result!: string;
  public createdAt?: Date;
  public updatedAt?: Date;
}

CategoryResult.init(
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
    result: {
      type: DataTypes.STRING,
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
    }
  },
  {
    sequelize,
    modelName: 'CategoryResult',
    tableName: 'category_result',
    timestamps: true
  }
);

export default CategoryResult;