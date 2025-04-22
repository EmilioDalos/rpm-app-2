import { syncDatabase } from './src/config/db';
import { setupAssociations } from './src/models';

async function main() {
  try {
    // Set up model associations
    setupAssociations();
    
    // Sync database (force: true will drop and recreate all tables)
    await syncDatabase(true);
    
    console.log('Database sync completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error syncing database:', error);
    process.exit(1);
  }
}

main(); 