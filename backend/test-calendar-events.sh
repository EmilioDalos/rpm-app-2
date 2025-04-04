#!/bin/bash

# Enable error handling
set -e

echo "🧪 Starting Calendar Events API tests..."

# Function to make API calls with error handling
make_request() {
  local method=$1
  local url=$2
  local data=$3
  local response

  echo -e "\nMaking $method request to $url"
  if [ -n "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X $method "$url" \
      -H "Content-Type: application/json" \
      -d "$data")
  else
    response=$(curl -s -w "\n%{http_code}" -X $method "$url")
  fi

  local status_code=$(echo "$response" | tail -n1)
  local body=$(echo "$response" | sed '$d')

  echo "Status code: $status_code"
  echo "Response: $body"

  if [ "$status_code" -ge 400 ]; then
    echo "❌ Request failed with status code $status_code"
    return 1
  fi

  return 0
}

# Fixed test ID
TEST_ID="88888888-8888-8888-8888-888888888888"

# Test 1: Create a calendar event without optional fields
echo -e "\nTest 1: Create calendar event without optional fields"
make_request "POST" "http://localhost:3001/api/calendar-events" '{
  "id": "'$TEST_ID'",
  "title": "Test Event",
  "start_date": "2025-04-01T09:00:00Z",
  "end_date": "2025-04-01T10:00:00Z",
  "category": "Meeting"
}'

# Test 2: Create a calendar event with all fields
echo -e "\n\nTest 2: Create calendar event with all fields"
make_request "POST" "http://localhost:3001/api/calendar-events" '{
  "title": "Complete Event",
  "description": "Complete test description",
  "start_date": "2025-04-02T14:00:00Z",
  "end_date": "2025-04-02T15:00:00Z",
  "location": "Conference Room A",
  "category": "Review",
  "color": "#FF5733"
}'

# Test 3: Get all calendar events
echo -e "\n\nTest 3: Get all calendar events"
make_request "GET" "http://localhost:3001/api/calendar-events"

# Test 4: Get calendar event by ID
echo -e "\n\nTest 4: Get calendar event by ID"
make_request "GET" "http://localhost:3001/api/calendar-events/$TEST_ID"

# Test 5: Update calendar event
echo -e "\n\nTest 5: Update calendar event"
make_request "PUT" "http://localhost:3001/api/calendar-events/$TEST_ID" '{
  "title": "Updated Event",
  "description": "Updated description",
  "start_date": "2025-04-01T10:00:00Z",
  "end_date": "2025-04-01T11:00:00Z",
  "location": "Conference Room B",
  "category": "Workshop",
  "color": "#33FF57"
}'

# Test 6: Delete calendar event
echo -e "\n\nTest 6: Delete calendar event"
make_request "DELETE" "http://localhost:3001/api/calendar-events/$TEST_ID"

# Test 7: Create calendar event with invalid date format
echo -e "\n\nTest 7: Create calendar event with invalid date format"
make_request "POST" "http://localhost:3001/api/calendar-events" '{
  "title": "Invalid Date Event",
  "start_date": "invalid-date",
  "end_date": "2025-04-01T10:00:00Z",
  "category": "Meeting"
}'

# Test 8: Create calendar event with missing required fields
echo -e "\n\nTest 8: Create calendar event with missing required fields"
make_request "POST" "http://localhost:3001/api/calendar-events" '{
  "start_date": "2025-04-01T09:00:00Z"
}'

echo -e "\n\n✅ Calendar Events API tests completed!" 