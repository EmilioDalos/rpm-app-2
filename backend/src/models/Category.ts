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
  imageBlob?: Buffer;
  createdAt: Date;
  updatedAt: Date;
}

interface CategoryCreationAttributes extends Omit<CategoryAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Category extends Model<CategoryAttributes, CategoryCreationAttributes> {
  public id!: string;
  public name!: string;
  public type!: 'personal' | 'professional';
  public description?: string;
  public vision?: string;
  public purpose?: string;
  public resources?: string;
  public color?: string;
  public imageBlob?: Buffer;
  public createdAt!: Date;
  public updatedAt!: Date;

  // Define associations
  public roles?: Role[];
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
    imageBlob: {
      type: DataTypes.BLOB,
      allowNull: true,
      field: 'image_blob'
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
    }
  },
  {
    sequelize,
    modelName: 'Category',
    tableName: 'category',
    timestamps: true,
  }
);

export default Category;