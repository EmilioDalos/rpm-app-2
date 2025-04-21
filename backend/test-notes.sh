#!/bin/bash

# Load environment variables
source .env

# Set API URL
API_URL="http://localhost:3001/api"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to make API calls
call_api() {
  local method=$1
  local endpoint=$2
  local data=$3
  
  echo -e "${BLUE}Calling $method $endpoint${NC}"
  
  if [ -n "$data" ]; then
    response=$(curl -s -X $method "$API_URL$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data")
  else
    response=$(curl -s -X $method "$API_URL$endpoint" \
      -H "Content-Type: application/json")
  fi
  
  echo "Response: $response"
  echo ""
}

# Test adding a note to an action
echo -e "${GREEN}Test 1: Adding a note to an action${NC}"
# First, get an action ID to use for testing
action_id=$(curl -s "$API_URL/calendar-events/date-range?startDate=2024-01-01&endDate=2025-12-31" | jq -r '.days[0].hourslots[0].events[0].id')
if [ -z "$action_id" ] || [ "$action_id" = "null" ]; then
  echo -e "${RED}No action found for testing. Please ensure there are actions in the database.${NC}"
  exit 1
fi

echo "Using action ID: $action_id"

# Add a note
call_api "POST" "/calendar-events/$action_id/notes" '{"text": "Test note", "type": "progress"}'

# Store the note ID for later tests
note_id=$(echo $response | jq -r '.id')
echo "Note ID: $note_id"

# Test updating a note
echo -e "${GREEN}Test 2: Updating a note${NC}"
call_api "PUT" "/calendar-events/notes/$note_id" '{"text": "Updated test note", "type": "remark"}'

# Test deleting a note
echo -e "${GREEN}Test 3: Deleting a note${NC}"
call_api "DELETE" "/calendar-events/notes/$note_id"

echo -e "${GREEN}All note management tests completed!${NC}" 