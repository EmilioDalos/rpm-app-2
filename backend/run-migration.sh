#!/bin/bash

# Load environment variables
source .env

# Set colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Running database migration...${NC}"

# Run the migration
echo "Running migration to add action_id to notes..."
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f migrations/add_action_id_to_notes.sql

if [ $? -eq 0 ]; then
  echo "Migration completed successfully"
else
  echo "Migration failed"
  exit 1
fi

echo -e "${GREEN}Restarting the server...${NC}"
# Restart the server to apply changes
npm run dev 