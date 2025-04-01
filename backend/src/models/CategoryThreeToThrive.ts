import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

interface CategoryThreeToThriveAttributes {
  id: string;
  category_id: string;
  three_to_thrive: string;
  created_at?: Date;
  updated_at?: Date;
}

interface CreationAttributes extends Optional<CategoryThreeToThriveAttributes, 'id'> {}

class CategoryThreeToThrive extends Model<CategoryThreeToThriveAttributes, CreationAttributes> implements CategoryThreeToThriveAttributes {
  public id!: string;
  public category_id!: string;
  public three_to_thrive!: string;
  public created_at?: Date;
  public updated_at?: Date;
}

CategoryThreeToThrive.init(
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
    three_to_thrive: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'CategoryThreeToThrive',
    tableName: 'category_three_to_thrive',
    timestamps: false,
  }
);

export default CategoryThreeToThrive;