import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

interface CategoryActionPlanAttributes {
  id: string;
  category_id: string;
  action_plan: string;
  created_at?: Date;
  updated_at?: Date;
}

interface CategoryActionPlanCreationAttributes extends Optional<CategoryActionPlanAttributes, 'id'> {}

class CategoryActionPlan
  extends Model<CategoryActionPlanAttributes, CategoryActionPlanCreationAttributes>
  implements CategoryActionPlanAttributes
{
  public id!: string;
  public category_id!: string;
  public action_plan!: string;
  public created_at?: Date;
  public updated_at?: Date;
}

CategoryActionPlan.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    action_plan: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'CategoryActionPlan',
    tableName: 'category_action_plan',
    timestamps: false,
  }
);

export default CategoryActionPlan;
