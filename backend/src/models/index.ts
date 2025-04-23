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
    foreignKey: 'category_id',
    as: 'category'
  });

  // Category associations
  Category.hasMany(RpmBlock, {
    foreignKey: 'category_id',
    as: 'rpmBlocks',
  });
  
  // Category - CategoryThreeToThrive associations
  Category.hasMany(CategoryThreeToThrive, {
    foreignKey: 'category_id',
    as: 'threeToThrive',
    onDelete: 'CASCADE'
  });

  // Category - CategoryResult associations
  Category.hasMany(CategoryResult, {
    foreignKey: 'category_id',
    as: 'results',
    onDelete: 'CASCADE'
  });

  CategoryResult.belongsTo(Category, {
    foreignKey: 'category_id',
    as: 'category'
  });

  // Category - CategoryActionPlan associations
  Category.hasMany(CategoryActionPlan, {
    foreignKey: 'category_id',
    as: 'actionPlans',
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
  foreignKey: 'rpm_block_id',
  as: 'massiveActions',
  onDelete: 'CASCADE'
});

RpmBlockMassiveAction.belongsTo(RpmBlock, {
  foreignKey: 'rpm_block_id',
  as: 'rpmBlock'
});

// Add the missing category association for RpmBlockMassiveAction
RpmBlockMassiveAction.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

Category.hasMany(RpmBlockMassiveAction, {
  foreignKey: 'category_id',
  as: 'massiveActions'
});

// RpmBlockPurpose associaties
RpmBlock.hasMany(RpmBlockPurpose, {
  foreignKey: 'rpm_block_id',
  as: 'purposes',
  onDelete: 'CASCADE'
});

RpmBlockPurpose.belongsTo(RpmBlock, {
  foreignKey: 'rpm_block_id',
  as: 'rpmBlock'
});

RpmBlockMassiveAction.hasMany(RpmMassiveActionOccurrence, { 
  foreignKey: 'action_id', 
  as: 'occurrences',
  onDelete: 'CASCADE'
});

RpmMassiveActionOccurrence.belongsTo(RpmBlockMassiveAction, { 
  foreignKey: 'action_id',
  as: 'action'
});

// Add direct notes association for RpmBlockMassiveAction
RpmBlockMassiveAction.hasMany(RpmBlockMassiveActionNote, {
  foreignKey: 'action_id',
  as: 'notes',
  onDelete: 'CASCADE'
});

RpmBlockMassiveActionNote.belongsTo(RpmBlockMassiveAction, {
  foreignKey: 'action_id',
  as: 'action'
});

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