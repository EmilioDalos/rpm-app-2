#!/bin/bash
# Import the test-utils.sh file verifying the API calls
source "$(dirname "$0")/test-utils.sh"

# Enable error handling
set -e

echo "🧪 Starting Calendar Events API tests..."

# Fixed test ID
TEST_ID="11111111-aaaa-aaaa-aaaa-111111111111"
CATEGORY_ID="11111111-1111-1111-1111-111111111111"

# Test 1: Create a calendar event (representing dragging an action to the calendar)
echo -e "\nTest 1: Creating a calendar event"
EVENT_RESPONSE=$(curl -s -X POST "${API_URL}/api/calendar-events" \
  -H "Content-Type: application/json" \
  -d '{
    "rpmBlockId": "'"${TEST_ID}"'",
    "text": "Team Meeting",
    "description": "Weekly team sync",
    "location": "Conference Room A",
    "startDate": "2024-04-15T10:00:00Z",
    "endDate": "2024-04-15T11:00:00Z",
    "isDateRange": false,
    "hour": 10,
    "categoryId": "'"${CATEGORY_ID}"'",
    "leverage": "High Priority",
    "durationAmount": 60,
    "durationUnit": "minutes"
  }' | jq '.')

EVENT_ID=$(echo $EVENT_RESPONSE | jq -r '.id')
echo "Created event with ID: $EVENT_ID"

# Test 2: Get calendar event by ID
echo -e "\nTest 2: Getting calendar event by ID"
curl -s -X GET "${API_URL}/api/calendar-events/${EVENT_ID}" | jq '.'

# Test 3: Get calendar events by date range (representing week/month view)
echo -e "\nTest 3: Getting calendar events by date range"
curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2024-04-01T00:00:00.000Z&endDate=2024-04-30T23:59:59.999Z" | jq '.'

# Test 4: Update a calendar event (changing startDate, test occurrence moves or is replaced)
echo -e "\nTest 4: Updating calendar event (changing startDate)"
curl -s -X PUT "${API_URL}/api/calendar-events/${EVENT_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Updated Team Meeting",
    "description": "Updated weekly team sync with new agenda",
    "location": "Conference Room B",
    "startDate": "2024-04-16T11:00:00Z",
    "endDate": "2024-04-16T12:00:00Z",
    "isDateRange": false,
    "hour": 11,
    "categoryId": "'"${CATEGORY_ID}"'",
    "leverage": "Super High Priority",
    "durationAmount": 90,
    "durationUnit": "minutes",
    "status": "in_progress"
  }' | jq '.'

echo -e "\nVerifying updated occurrence reflects new date..."
curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2024-04-16T00:00:00Z&endDate=2024-04-16T23:59:59Z" | jq '.'

# Test 5: Add a note to the calendar event
echo -e "\nTest 5: Adding a note to calendar event"
curl -s -X POST "${API_URL}/api/calendar-events/${EVENT_ID}/notes" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Making good progress on this task",
    "type": "progress"
  }' | jq '.'

# Find an occurrence ID for the event 
echo -e "\nFinding occurrence ID for the event..."
OCCURRENCES_RESPONSE=$(curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2024-04-16T00:00:00Z&endDate=2024-04-16T23:59:59Z" | jq '.')
OCCURRENCE_ID=$(echo $OCCURRENCES_RESPONSE | jq -r '.[0].events[0].id')
echo "Found occurrence with ID: $OCCURRENCE_ID for date 2024-04-16"

# Test 6: Delete a calendar event by date
echo -e "\nTest 6: Deleting calendar event with date ${OCCURRENCE_ID} 
"
curl -s -X DELETE "${API_URL}/api/calendar-events/${OCCURRENCE_ID}/2024-04-16"

# Verify deletion of occurrence but event should still exist
echo -e "\nVerifying occurrence was deleted but event still exists..."
curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2024-04-16T00:00:00Z&endDate=2024-04-16T23:59:59Z" | jq '.'
curl -s -X GET "${API_URL}/api/calendar-events/${EVENT_ID}" | jq '.'

# Test 7: Delete the entire calendar event
echo -e "\nTest 7: Deleting entire calendar event"
curl -s -X DELETE "${API_URL}/api/calendar-events/${EVENT_ID}"

# Verify event deletion
echo -e "\nVerifying event was completely deleted..."
curl -s -X GET "${API_URL}/api/calendar-events/${EVENT_ID}" | jq '.'


