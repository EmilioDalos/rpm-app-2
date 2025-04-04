import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db';
import Role from './Role';
import CategoryThreeToThrive from './CategoryThreeToThrive';
import CategoryResult from './CategoryResult';
import CategoryActionPlan from './CategoryActionPlan';

interface CategoryAttributes {
  id: string;
  name: string;
  type: 'personal' | 'professional';
  description?: string;
  vision?: string;
  purpose?: string;
  resources?: string;
  color?: string;
  image_blob?: Buffer;
  created_at: Date;
  updated_at: Date;
}

interface CategoryCreationAttributes extends Omit<CategoryAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Category extends Model<CategoryAttributes, CategoryCreationAttributes> {
  public id!: string;
  public name!: string;
  public type!: 'personal' | 'professional';
  public description?: string;
  public vision?: string;
  public purpose?: string;
  public resources?: string;
  public color?: string;
  public image_blob?: Buffer;
  public created_at!: Date;
  public updated_at!: Date;

  // Define associations
  public readonly roles?: Role[];
  public readonly CategoryThreeToThrives?: CategoryThreeToThrive[];
  public readonly CategoryResults?: CategoryResult[];
  public readonly CategoryActionPlans?: CategoryActionPlan[];
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
      type: DataTypes.ENUM('personal', 'professional'),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    vision: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    purpose: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    resources: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image_blob: {
      type: DataTypes.BLOB,
      allowNull: true,
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
    modelName: 'Category',
    tableName: 'category',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
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