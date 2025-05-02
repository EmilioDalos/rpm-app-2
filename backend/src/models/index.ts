import sequelize from '../config/db';
import RpmBlock from './RpmBlock';
import RpmBlockMassiveAction from './RpmBlockMassiveAction';
import RpmMassiveActionOccurrence from './RpmMassiveActionOccurrence';
import RpmBlockMassiveActionNote from './RpmBlockMassiveActionNote';
import Category from './Category';
import Role from './Role';
import CategoryResult from './CategoryResult';
import CategoryActionPlan from './CategoryActionPlan';
import CategoryThreeToThrive from './CategoryThreeToThrive';
import RpmBlockPurpose from './RpmBlockPurpose';

// Define associations
const setupAssociations = () => {
  console.log('Setting up associations...');
  
  // Category - Role associations
  Category.hasMany(Role, {
    foreignKey: 'category_id',
    as: 'roles',
    onDelete: 'CASCADE'
  });

  Role.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'category'
  });

  // Category associations
  Category.hasMany(RpmBlock, {
    foreignKey: 'categoryId',
    as: 'rpmBlocks',
  });
  
  // Category - CategoryThreeToThrive associations
  Category.hasMany(CategoryThreeToThrive, {
    foreignKey: 'categoryId',
    as: 'threeToThrive',
    onDelete: 'CASCADE'
  });

  // Category - CategoryResult associations
  Category.hasMany(CategoryResult, {
    foreignKey: 'categoryId',
    as: 'results',
    onDelete: 'CASCADE'
  });

  CategoryResult.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'category'
  });

  // Category - CategoryActionPlan associations
  Category.hasMany(CategoryActionPlan, {
    foreignKey: 'categoryId',
    as: 'actionPlans',
    onDelete: 'CASCADE'
  });

  CategoryActionPlan.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'category'
  });


RpmBlock.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category',
});

RpmBlock.hasMany(RpmBlockMassiveAction, {
  foreignKey: 'rpmBlockId',
  as: 'massiveActions',
  onDelete: 'CASCADE'
});

RpmBlockMassiveAction.belongsTo(RpmBlock, {
  foreignKey: 'rpmBlockId',
  as: 'rpmBlock'
});

// Category - RpmBlockMassiveAction associations
Category.hasMany(RpmBlockMassiveAction, {
  foreignKey: 'categoryId',
  as: 'massiveActions'
});

RpmBlockMassiveAction.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category'
});

// RpmBlockPurpose associations
RpmBlock.hasMany(RpmBlockPurpose, {
  foreignKey: 'rpmBlockId',
  as: 'purposes',
  onDelete: 'CASCADE'
});

RpmBlockPurpose.belongsTo(RpmBlock, {
  foreignKey: 'rpmBlockId',
  as: 'rpmBlock'
});

// RpmBlockMassiveAction - RpmMassiveActionOccurrence associations
RpmBlockMassiveAction.hasMany(RpmMassiveActionOccurrence, { 
  foreignKey: 'actionId', 
  as: 'occurrences',
  onDelete: 'CASCADE'
});

RpmMassiveActionOccurrence.belongsTo(RpmBlockMassiveAction, { 
  foreignKey: 'actionId',
  as: 'action'
});

// RpmBlockMassiveAction - RpmBlockMassiveActionNote associations
RpmBlockMassiveAction.hasMany(RpmBlockMassiveActionNote, {
  foreignKey: 'actionId',
  as: 'notes',
  onDelete: 'CASCADE'
});

// RpmMassiveActionOccurrence - RpmBlockMassiveActionNote associations
RpmMassiveActionOccurrence.hasMany(RpmBlockMassiveActionNote, {
  foreignKey: 'occurrence_id',
  as: 'notes',
  onDelete: 'CASCADE'
});

RpmBlockMassiveActionNote.belongsTo(RpmMassiveActionOccurrence, {
  foreignKey: 'occurrence_id',
  as: 'occurrence'
});

console.log('Associations set up successfully');
};

// Optioneel: alleen connectie testen (zonder sync)
const testDatabaseConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};

// Exporteer alle modellen
export {
  RpmBlock,
  RpmBlockMassiveAction,
  RpmMassiveActionOccurrence,
  RpmBlockMassiveActionNote,
  Category,
  Role,
  CategoryResult,
  CategoryActionPlan,
  CategoryThreeToThrive,
  RpmBlockPurpose,
  setupAssociations,
  testDatabaseConnection
};