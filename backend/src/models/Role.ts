import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';
import Category from './Category';

interface RoleAttributes {
  id: string;
  category_id: string;
  name: string;
  purpose?: string;
  description?: string;
  identity_statement?: string;
  image_blob?: Buffer;
  created_at?: Date;
  updated_at?: Date;
  category?: {
    id: string;
    name: string;
    type: string;
  };
}

interface RoleCreationAttributes extends Optional<RoleAttributes, 'id' | 'category'> {}

class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  public id!: string;
  public category_id!: string;
  public name!: string;
  public purpose?: string;
  public description?: string;
  public identity_statement?: string;
  public image_blob?: Buffer;
  public created_at?: Date;
  public updated_at?: Date;
  public category?: {
    id: string;
    name: string;
    type: string;
  };

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
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'category',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    purpose: DataTypes.TEXT,
    description: DataTypes.TEXT,
    identity_statement: DataTypes.TEXT,
    image_blob: DataTypes.BLOB,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'Role',
    tableName: 'role',
    timestamps: true,
    underscored: true,
  }
);

export default Role;