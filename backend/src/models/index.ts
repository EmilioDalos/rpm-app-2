import sequelize from '../config/db';
import RpmBlock from './RpmBlock';
import RpmBlockMassiveAction from './RpmBlockMassiveAction';
import RpmBlockPurpose from './RpmBlockPurpose';
import Category from './Category';
import Role from './Role';
import CategoryThreeToThrive from './CategoryThreeToThrive';
import CategoryResult from './CategoryResult';
import CategoryActionPlan from './CategoryActionPlan';
import RpmMassiveActionRecurrence from './RpmMassiveActionRecurrence';
import RpmMassiveActionRecurrenceException from './RpmMassiveActionRecurrenceException';
import RpmBlockMassiveActionNote from './RpmBlockMassiveActionNote';

// Define associations
const setupAssociations = () => {
  console.log('Setting up associations...');
  
  // Category - Role associations
  Category.hasMany(Role, {
    foreignKey: 'category_id',
    as: 'categoryRoles',
    onDelete: 'CASCADE'
  });

  Role.belongsTo(Category, {
    foreignKey: 'category_id',
    as: 'roleCategory'
  });

  // Category associations
  Category.hasMany(RpmBlock, {
    foreignKey: 'category_id',
    as: 'rpmBlocks',
  });
  
  // Category - CategoryThreeToThrive associations
  Category.hasMany(CategoryThreeToThrive, {
    foreignKey: 'category_id',
    as: 'CategoryThreeToThriveLists',
    onDelete: 'CASCADE'
  });

  // Category - CategoryResult associations
  Category.hasMany(CategoryResult, {
    foreignKey: 'category_id',
    as: 'CategoryResults',
    onDelete: 'CASCADE'
  });

  CategoryResult.belongsTo(Category, {
    foreignKey: 'category_id',
    as: 'category'
  });

  // Category - CategoryActionPlan associations
  Category.hasMany(CategoryActionPlan, {
    foreignKey: 'category_id',
    as: 'CategoryActionPlans',
    onDelete: 'CASCADE'
  });

  CategoryActionPlan.belongsTo(Category, {
    foreignKey: 'category_id',
    as: 'category'
  });


RpmBlock.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category',
});

RpmBlock.hasMany(RpmBlockMassiveAction, {
  as: 'massiveActions',
  foreignKey: 'rpmBlockId',
  onDelete: 'CASCADE'
});

RpmBlockMassiveAction.belongsTo(RpmBlock, {
  foreignKey: 'rpmBlockId',
  as: 'rpmBlock'
});

// Add the missing category association for RpmBlockMassiveAction
RpmBlockMassiveAction.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category'
});

Category.hasMany(RpmBlockMassiveAction, {
  foreignKey: 'categoryId',
  as: 'massiveActions'
});

// RpmBlockPurpose associaties
RpmBlock.hasMany(RpmBlockPurpose, {
  as: 'purposes',
  foreignKey: 'rpmBlockId',
  onDelete: 'CASCADE'
});

RpmBlockPurpose.belongsTo(RpmBlock, {
  foreignKey: 'rpmBlockId',
  as: 'rpmBlock'
});

RpmBlockMassiveAction.hasMany(RpmMassiveActionRecurrence, { 
  foreignKey: 'actionId', 
  as: 'recurrencePattern',
  onDelete: 'CASCADE'
});

RpmMassiveActionRecurrence.belongsTo(RpmBlockMassiveAction, { 
  foreignKey: 'actionId',
  as: 'action'
});

RpmBlockMassiveAction.hasMany(RpmMassiveActionRecurrenceException, { 
  foreignKey: 'actionId', 
  as: 'recurrenceExceptions',
  onDelete: 'CASCADE'
});

RpmMassiveActionRecurrenceException.belongsTo(RpmBlockMassiveAction, { 
  foreignKey: 'actionId',
  as: 'action'
});

RpmMassiveActionRecurrence.hasMany(RpmMassiveActionRecurrenceException, {
  foreignKey: 'actionRecurrenceId',
  as: 'exceptions',
  onDelete: 'CASCADE'
});

RpmMassiveActionRecurrenceException.belongsTo(RpmMassiveActionRecurrence, {
  foreignKey: 'actionRecurrenceId',
  as: 'recurrence'
});

// Add associations for notes
RpmBlockMassiveAction.hasMany(RpmBlockMassiveActionNote, {
  foreignKey: 'actionId',
  as: 'notes',
  onDelete: 'CASCADE'
});

RpmBlockMassiveActionNote.belongsTo(RpmBlockMassiveAction, {
  foreignKey: 'actionId',
  as: 'action'
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
  RpmBlockPurpose,
  Category,
  Role,
  CategoryThreeToThrive,
  CategoryResult,
  CategoryActionPlan,
  RpmMassiveActionRecurrence,
  RpmMassiveActionRecurrenceException,
  RpmBlockMassiveActionNote,
  setupAssociations,
  testDatabaseConnection
};