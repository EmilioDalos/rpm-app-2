#!/bin/bash

# Load environment variables
source .env

# Set colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up database...${NC}"

# Run the database sync script
echo -e "${GREEN}Syncing database schema...${NC}"
npx ts-node sync-db.ts

if [ $? -eq 0 ]; then
  echo -e "${GREEN}Database schema synced successfully!${NC}"
else
  echo -e "${RED}Database schema sync failed!${NC}"
  exit 1
fi

# Insert test data
echo -e "${GREEN}Inserting test data...${NC}"
PGPASSWORD=$(echo $DATABASE_URL | cut -d':' -f3 | cut -d'@' -f1) psql -h $(echo $DATABASE_URL | cut -d'@' -f2 | cut -d':' -f1) -U $(echo $DATABASE_URL | cut -d'/' -f3 | cut -d':' -f1) -d $(echo $DATABASE_URL | cut -d'/' -f4) -f database/insert-testdata.sql

if [ $? -eq 0 ]; then
  echo -e "${GREEN}Test data inserted successfully!${NC}"
else
  echo -e "${RED}Test data insertion failed!${NC}"
  exit 1
fi

echo -e "${GREEN}Database setup completed successfully!${NC}" 