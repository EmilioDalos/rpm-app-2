import { Model } from 'sequelize';
import Category from './Category';
import Role from './Role';

// Define associations
Category.hasMany(Role, {
  foreignKey: 'category_id',
  as: 'roles',
  onDelete: 'CASCADE'
});

Role.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

export { Category, Role }; 