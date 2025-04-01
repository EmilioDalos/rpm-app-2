import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

interface CategoryResultAttributes {
  id: string;
  category_id: string;
  result: string;
  created_at?: Date;
  updated_at?: Date;
}

interface CreationAttributes extends Optional<CategoryResultAttributes, 'id'> {}

class CategoryResult extends Model<CategoryResultAttributes, CreationAttributes> implements CategoryResultAttributes {
  public id!: string;
  public category_id!: string;
  public result!: string;
  public created_at?: Date;
  public updated_at?: Date;
}

CategoryResult.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    result: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'CategoryResult',
    tableName: 'category_result',
    timestamps: false,
  }
);

export default CategoryResult;