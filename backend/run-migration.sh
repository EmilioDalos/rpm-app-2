#!/bin/bash

# Load environment variables
source .env

# Set colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Running database migration...${NC}"

# Run the migration SQL file
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f migrations/20240421_update_calendar_events.sql

if [ $? -eq 0 ]; then
  echo -e "${GREEN}Migration completed successfully!${NC}"
else
  echo -e "${RED}Migration failed!${NC}"
  exit 1
fi

echo -e "${GREEN}Restarting the server...${NC}"
# Restart the server to apply changes
npm run dev 