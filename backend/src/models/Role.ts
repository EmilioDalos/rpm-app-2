import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';
import Category from './Category';

interface RoleAttributes {
  id: string;
  categoryId: string;
  name: string;
  purpose?: string;
  description?: string;
  identityStatement?: string;
  imageBlob?: Buffer;
  createdAt?: Date;
  updatedAt?: Date;
  category?: Category;
}

interface RoleCreationAttributes extends Optional<RoleAttributes, 'id' | 'category'> {}

class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  public id!: string;
  public categoryId!: string;
  public name!: string;
  public purpose?: string;
  public description?: string;
  public identityStatement?: string;
  public imageBlob?: Buffer;
  public createdAt?: Date;
  public updatedAt?: Date;
  public category?: Category;

  // Add type definitions for related data
  public readonly coreQualities?: { quality: string }[];
  public readonly incantations?: { incantation: string }[];
}

Role.init(
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    purpose: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    identityStatement: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'identity_statement'
    },
    imageBlob: {
      type: DataTypes.BLOB,
      allowNull: true,
      field: 'image_blob'
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
    modelName: 'Role',
    tableName: 'role',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);


export default Role;