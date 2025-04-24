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
echo -e "\nChecking if non-dateRange event's dates were reset and status changed to 'new'..."
NON_RANGE_EVENT_AFTER_DELETE=$(curl -s -X GET "${API_URL}/api/calendar-events/${EVENT_ID}" | jq '.')
echo $NON_RANGE_EVENT_AFTER_DELETE | jq '.'

# Verify status and dates
HAS_NULL_START_DATE=$(echo $NON_RANGE_EVENT_AFTER_DELETE | jq '.events[0].startDate == null')
HAS_NULL_END_DATE=$(echo $NON_RANGE_EVENT_AFTER_DELETE | jq '.events[0].endDate == null')
HAS_NEW_STATUS=$(echo $NON_RANGE_EVENT_AFTER_DELETE | jq '.events[0].status == "new"')

echo -e "\nVerification results:"
echo "StartDate is null: $HAS_NULL_START_DATE"
echo "EndDate is null: $HAS_NULL_END_DATE"
if [ "$HAS_NULL_START_DATE" != "true" ]; then
  START_DATE=$(echo $NON_RANGE_EVENT_AFTER_DELETE | jq -r '.events[0].startDate')
  echo "Current StartDate value: $START_DATE (should be null)"
fi
if [ "$HAS_NULL_END_DATE" != "true" ]; then
  END_DATE=$(echo $NON_RANGE_EVENT_AFTER_DELETE | jq -r '.events[0].endDate')
  echo "Current EndDate value: $END_DATE (should be null)"
fi
echo "Status is 'new': $HAS_NEW_STATUS"

# Test 7: Create a date range event over 3 days
echo -e "\nTest 7: Creating a date range event over 3 days"
RANGE_EVENT_RESPONSE=$(curl -s -X POST "${API_URL}/api/calendar-events" \
  -H "Content-Type: application/json" \
  -d '{
    "rpmBlockId": "'"${TEST_ID}"'",
    "text": "Three Day Conference",
    "status": "planned",
    "description": "Annual industry conference",
    "location": "Convention Center",
    "startDate": "2025-05-01T09:00:00Z",
    "endDate": "2025-05-03T17:00:00Z",
    "isDateRange": true,
    "hour": 9,
    "categoryId": "'"${CATEGORY_ID}"'",
    "leverage": "High Value",
    "durationAmount": 480,
    "durationUnit": "minutes"
  }' | jq '.')

RANGE_EVENT_ID=$(echo $RANGE_EVENT_RESPONSE | jq -r '.id')
echo "Created date range event with ID: $RANGE_EVENT_ID"

# Test 8: Verify occurrences for each day in the range
echo -e "\nTest 8: Verifying occurrences for each day in the date range"
DAY_1_RESPONSE=$(curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2024-05-01T00:00:00Z&endDate=2024-05-01T23:59:59Z" | jq '.')
DAY_2_RESPONSE=$(curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2024-05-02T00:00:00Z&endDate=2024-05-02T23:59:59Z" | jq '.')
DAY_3_RESPONSE=$(curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2024-05-03T00:00:00Z&endDate=2024-05-03T23:59:59Z" | jq '.')

echo -e "\nOccurrences on May 1st:"
echo $DAY_1_RESPONSE | jq '.'
echo -e "\nOccurrences on May 2nd:"
echo $DAY_2_RESPONSE | jq '.'
echo -e "\nOccurrences on May 3rd:"
echo $DAY_3_RESPONSE | jq '.'

# Get all dates at once
echo -e "\nAll occurrences for the date range:"
curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2024-05-01T00:00:00Z&endDate=2024-05-03T23:59:59Z" | jq '.'

# Test 9: Delete one day from the date range event and verify other days still exist
echo -e "\nTest 9: Deleting one day from date range event"
DAY_1_OCCURRENCE_ID=$(echo $DAY_1_RESPONSE | jq -r '.[0].events[0].id')
echo "Deleting day 1 occurrence with ID: $DAY_1_OCCURRENCE_ID"
curl -s -X DELETE "${API_URL}/api/calendar-events/${DAY_1_OCCURRENCE_ID}/2024-05-01"

echo -e "\nVerifying only day 1 was deleted but days 2-3 still exist..."
curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2024-05-01T00:00:00Z&endDate=2024-05-03T23:59:59Z" | jq '.'

# # Check if date range event still has its dates (they should NOT be reset)
# echo -e "\nChecking if dateRange event's dates were preserved (should NOT be reset)..."
# RANGE_EVENT_AFTER_DELETE=$(curl -s -X GET "${API_URL}/api/calendar-events/${RANGE_EVENT_ID}" | jq '.')
# echo $RANGE_EVENT_AFTER_DELETE | jq '.'

# # Test 10: Delete the remaining date range event
# echo -e "\nTest 10: Deleting the date range event"
# curl -s -X DELETE "${API_URL}/api/calendar-events/${RANGE_EVENT_ID}"

# # Test 11: Delete the entire calendar event
# echo -e "\nTest 11: Deleting entire calendar event"
# curl -s -X DELETE "${API_URL}/api/calendar-events/${EVENT_ID}"

# # Verify event deletion
# echo -e "\nVerifying events were completely deleted..."
# curl -s -X GET "${API_URL}/api/calendar-events/${EVENT_ID}" | jq '.'
# curl -s -X GET "${API_URL}/api/calendar-events/${RANGE_EVENT_ID}" | jq '.'


