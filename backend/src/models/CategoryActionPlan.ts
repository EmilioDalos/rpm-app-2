import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

interface CategoryActionPlanAttributes {
  id: string;
  categoryId: string;
  actionPlan: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CategoryActionPlanCreationAttributes extends Optional<CategoryActionPlanAttributes, 'id'> {}

class CategoryActionPlan
  extends Model<CategoryActionPlanAttributes, CategoryActionPlanCreationAttributes>
  implements CategoryActionPlanAttributes
{
  public id!: string;
  public categoryId!: string;
  public actionPlan!: string;
  public createdAt?: Date;
  public updatedAt?: Date;
}

CategoryActionPlan.init(
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
    actionPlan: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'action_plan'
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
    modelName: 'CategoryActionPlan',
    tableName: 'category_action_plan',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default CategoryActionPlan;
