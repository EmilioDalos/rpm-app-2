import sequelize from '../config/db';
import RpmBlock from './RpmBlock';
import RpmBlockMassiveAction from './RpmBlockMassiveAction';
import RpmBlockPurpose from './RpmBlockPurpose';
import Category from './Category';
import CalendarEvent from './CalendarEvent';
import Role from './Role';
import CategoryThreeToThrive from './CategoryThreeToThrive';
import CategoryResult from './CategoryResult';
import CategoryActionPlan from './CategoryActionPlan';

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

  // CalendarEvent associations
  CalendarEvent.belongsTo(Category, {
    foreignKey: 'category_id',
    as: 'categoryRef',
  });

  Category.hasMany(CalendarEvent, {
    foreignKey: 'category_id',
    as: 'calendarEvents',
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
  CalendarEvent,
  Role,
  CategoryThreeToThrive,
  CategoryResult,
  CategoryActionPlan,
  setupAssociations,
  testDatabaseConnection
};