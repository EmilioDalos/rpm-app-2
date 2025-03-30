import sequelize from '../config/db';
import './associations';

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

export { testDatabaseConnection };
export * from './associations';