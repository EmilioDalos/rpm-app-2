import sequelize from '../config/db';
import './associations';

// Synchronize all models
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection established successfully.');

    await sequelize.sync({ force: true });
    console.log('✅ All models were synchronized successfully.');

    // Import and run the SQL files
    const { execSync } = require('child_process');
    console.log('Running create-db.sql...');
    execSync('docker exec -i postgres_container psql -U my_rpm_app -d my_rpm_db < database/create-db.sql');
    console.log('Running insert-testdata.sql...');
    execSync('docker exec -i postgres_container psql -U my_rpm_app -d my_rpm_db < database/insert-testdata.sql');
    console.log('✅ Test data inserted successfully.');
  } catch (error) {
    console.error('❌ Unable to sync database:', error);
    process.exit(1);
  }
};

export { syncDatabase };
export * from './associations';