import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';
import Role from './Role';
import CategoryThreeToThrive from './CategoryThreeToThrive';
import CategoryResult from './CategoryResult';
import CategoryActionPlan from './CategoryActionPlan';

interface CategoryAttributes {
  id: string;
  name: string;
  type: string;
  description?: string;
  vision?: string;
  purpose?: string;
  resources?: string;
  color?: string;
  image_blob?: Buffer;
  created_at?: Date;
  updated_at?: Date;
}

interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'id'> {}

class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
  public id!: string;
  public name!: string;
  public type!: string;
  public description!: string;
  public vision!: string;
  public purpose!: string;
  public resources!: string;
  public color!: string;
  public image_blob!: Buffer;
  public created_at!: Date;
  public updated_at!: Date;
}

Category.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: DataTypes.TEXT,
    vision: DataTypes.TEXT,
    purpose: DataTypes.TEXT,
    resources: DataTypes.TEXT,
    color: DataTypes.STRING,
    image_blob: DataTypes.BLOB,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'Category',
    tableName: 'category',
    timestamps: true,
    underscored: true,
  }
);

// Define associations
Category.hasMany(Role, { foreignKey: 'category_id' });
Role.belongsTo(Category, { foreignKey: 'category_id' });

Category.hasMany(CategoryThreeToThrive, { foreignKey: 'category_id' });
CategoryThreeToThrive.belongsTo(Category, { foreignKey: 'category_id' });

Category.hasMany(CategoryResult, { foreignKey: 'category_id' });
CategoryResult.belongsTo(Category, { foreignKey: 'category_id' });

Category.hasMany(CategoryActionPlan, { foreignKey: 'category_id' });
CategoryActionPlan.belongsTo(Category, { foreignKey: 'category_id' });

export default Category;