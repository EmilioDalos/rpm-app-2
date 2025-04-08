#!/bin/bash
# Import the test-utils.sh file verifying the API calls
source "$(dirname "$0")/test-utils.sh"

# Enable error handling
set -e

echo "🧪 Starting Calendar Events API tests..."

# Fixed test ID
TEST_ID="88888888-8888-8888-8888-888888888888"

# Test 1: Create a calendar event without optional fields
echo -e "\nTest 1: Create calendar event without optional fields"
response=$(curl -s -X POST http://localhost:3001/api/calendar-events \
  -H "Content-Type: application/json" \
  -d '{
    "id": "'$TEST_ID'",
    "title": "Test Event",
    "startDate": "2025-04-01T09:00:00Z",
    "endDate": "2025-04-01T10:00:00Z",
    "categoryId": null
  }')

# Test 2: Create and verify calendar event title
echo -e "\n\nTest 2: Create and verify calendar event title"

TEST_VERIFY_TITLE="Complete Event"
TEST_START_DATE="2025-04-02T14:00:00Z"
TEST_END_DATE="2025-04-02T15:00:00Z"

response=$(curl -s -X POST http://localhost:3001/api/calendar-events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "'"$TEST_VERIFY_TITLE"'",
    "description": "Complete test description",
    "startDate": "'"$TEST_START_DATE"'",
    "endDate": "'"$TEST_END_DATE"'",
    "location": "Conference Room A",
    "category": "Review",
    "color": "#FF5733"
  }')

verify_field_in_response "title" "$TEST_VERIFY_TITLE" "$response"

# Test 3: Get all calendar events
echo -e "\n\nTest 3: Get all calendar events"

TEST_VERIFY_TITLE="Test Event"

response=$(curl -s -X GET "http://localhost:3001/api/calendar-events")
verify_field_in_response "title" "$TEST_VERIFY_TITLE" "$(echo "$response" | jq '.[0]')"

# Test 4: Get calendar event by ID
TEST_VERIFY_TITLE="Test Event"
tmp_response=$(curl -s -X GET "http://localhost:3001/api/calendar-events/$CREATED_ID")

verify_field_in_response "title" "$TEST_VERIFY_TITLE" "$tmp_response"

# Test 5: Update calendar event
echo -e "\n\nTest 5: Update calendar event"
response=$(curl -s -X PUT "http://localhost:3001/api/calendar-events/$CREATED_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Event",
    "description": "Updated description",
    "startDate": "2025-04-01T10:00:00Z",
    "endDate": "2025-04-01T11:00:00Z",
    "location": "Conference Room B",
    "category": "Workshop",
    "color": "#33FF57"
  }')

# Test 6: Delete calendar event
echo -e "\n\nTest 6: Delete calendar event"
response=$(curl -s -X DELETE "http://localhost:3001/api/calendar-events/$CREATED_ID")
verify_field_in_response "" "" "$response"

# Test 8: Create calendar event with missing required fields
echo -e "\n\nTest 8: Create calendar event with missing required fields"
response=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:3001/api/calendar-events" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2025-04-01T09:00:00Z"
  }')

status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

echo "Status code: $status_code"
echo "Response: $body"

if [ "$status_code" -ge 400 ]; then
  echo "✅ Expected failure occurred. Validation for required fields works."
else
  echo "❌ Test failed. Missing required fields should have caused an error."
  exit 1
fi

# Test 9: Create and verify calendar event title
echo -e "\n\nTest 9: Create and verify calendar event title"

TEST_ID=$(uuidgen)
TEST_VERIFY_TITLE="Verification Test Event"
TEST_START_DATE="2025-04-05T10:00:00Z"
TEST_END_DATE="2025-04-05T11:00:00Z"

response=$(curl -s -X POST http://localhost:3001/api/calendar-events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "'"$TEST_VERIFY_TITLE"'",
    "description": "Complete test description",
    "startDate": "'"$TEST_START_DATE"'",
    "endDate": "'"$TEST_END_DATE"'",
    "location": "Conference Room A",
    "category": "Review",
    "color": "#FF5733"
  }')

verify_field_in_response "title" "$TEST_VERIFY_TITLE" "$response"

echo -e "\n\n✅ Calendar Events API tests completed!"