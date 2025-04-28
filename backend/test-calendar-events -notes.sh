#!/bin/bash
# Import the test-utils.sh file verifying the API calls
source "$(dirname "$0")/test-utils.sh"

# Enable error handling
set -e

echo "🧪 Starting Calendar Events API tests..."

# Preparation block: comment out Tests 1–4 (uncomment if you need full setup)
: <<'PREP'
# Test 1: Create a calendar event (representing dragging an action to the calendar)
echo -e "\nTest 1: Creating a calendar event"
EVENT_RESPONSE=$(curl -s -X POST "${API_URL}/api/calendar-events" \
  -H "Content-Type: application/json" \
  -d @- <<EOF
{
  "rpmBlockId": "${TEST_ID}",
  "text": "Team Meeting",
  "description": "Weekly team sync",
  "location": "Conference Room A",
  "startDate": "2024-04-15T10:00:00Z",
  "endDate": "2024-04-15T11:00:00Z",
  "isDateRange": false,
  "hour": 10,
  "categoryId": "${CATEGORY_ID}"
}
EOF
)
echo "$EVENT_RESPONSE" | jq '.'

EVENT_ID=$(echo $EVENT_RESPONSE | jq -r '.id')
echo "Created event with ID: $EVENT_ID"
if [ -n "$EVENT_ID" ] && [ "$EVENT_ID" != "null" ]; then
  echo "✅ Test 1 passed"
else
  echo "❌ Test 1 failed"
fi

# Test 2: Get all calendar events (representing initial calendar load)
echo -e "\nTest 2: Getting all calendar events"
ALL_EVENTS_RESPONSE=$(curl -s -X GET "${API_URL}/api/calendar-events")
echo "$ALL_EVENTS_RESPONSE" | jq '.'
if echo "$ALL_EVENTS_RESPONSE" | jq -e . >/dev/null 2>&1; then
  echo "✅ Test 2 passed"
else
  echo "❌ Test 2 failed"
fi

# Test 3: Get calendar events by date range (representing week/month view)
echo -e "\nTest 3: Getting calendar events by date range"
DATE_RANGE_RESPONSE=$(curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2024-04-15T00:00:00Z&endDate=2024-04-21T23:59:59Z")
echo "$DATE_RANGE_RESPONSE" | jq '.'
COUNT=$(echo "$DATE_RANGE_RESPONSE" | jq '.[0].events | length')
if [ "$COUNT" -gt 0 ]; then
  echo "✅ Test 3 passed"
else
  echo "❌ Test 3 failed"
fi

# Test 4: Update a calendar event (changing startDate)
echo -e "\nTest 4: Updating calendar event (changing startDate)"
UPDATE_RESPONSE=$(curl -s -X PUT "${API_URL}/api/calendar-events/${EVENT_ID}" \
  -H "Content-Type: application/json" \
  -d @- <<EOF
{
  "text": "Updated Team Meeting",
  "description": "Updated weekly team sync with new agenda",
  "location": "Conference Room B",
  "startDate": "2024-04-16T11:00:00Z",
  "endDate": "2024-04-16T12:00:00Z",
  "isDateRange": false,
  "hour": 11,
  "categoryId": "${CATEGORY_ID}"
}
EOF
)
echo "$UPDATE_RESPONSE" | jq '.'
UPDATED_ID=$(echo "$UPDATE_RESPONSE" | jq -r '.id')
if [ "$UPDATED_ID" == "$EVENT_ID" ]; then
  echo "✅ Test 4 passed"
else
  echo "❌ Test 4 failed"
fi

echo -e "\nVerifying updated occurrence reflects new date..."
curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2024-04-16T00:00:00Z&endDate=2024-04-16T23:59:59Z" | jq '.'

PREP


# Test 5: Adding a note to calendar event
echo -e "\nTest 5: Adding a note to calendar event"
NOTE_RESPONSE=$(curl -s -X POST "${API_URL}/api/calendar-events/${EVENT_ID}/notes" \
  -H "Content-Type: application/json" \
  -d @- <<EOF
{
  "text": "Making good progress on this task",
  "type": "progress"
}
EOF
)
echo "$NOTE_RESPONSE" | jq '.'
NOTE_ID=$(echo "$NOTE_RESPONSE" | jq -r '.note.id')
if [ -n "$NOTE_ID" ] && [ "$NOTE_ID" != "null" ]; then
  echo "✅ Test 5 passed"
else
  echo "❌ Test 5 failed"
fi

echo -e "\nVerifying note attached to occurrence..."
curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2024-04-16T00:00:00Z&endDate=2024-04-16T23:59:59Z" | jq '.'
