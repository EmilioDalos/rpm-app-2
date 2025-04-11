#!/bin/bash
# Import the test-utils.sh file verifying the API calls
source "$(dirname "$0")/test-utils.sh"

# Enable error handling
set -e

echo "🧪 Starting Calendar Events API tests..."

# Fixed test ID
TEST_ID="88888888-8888-8888-8888-888888888888"

# # Test 1: Create a calendar event (representing dragging an action to the calendar)
# echo -e "\nTest 1: Creating a calendar event"
# EVENT_RESPONSE=$(curl -s -X POST "${API_URL}/api/calendarevents" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "rpmBlockId": "1",
#     "title": "Team Meeting",
#     "description": "Weekly team sync",
#     "location": "Conference Room A",
#     "startDate": "2024-04-15T10:00:00Z",
#     "endDate": "2024-04-15T11:00:00Z",
#     "isDateRange": false,
#     "hour": 10,
#     "categoryId": "1"
#   }')

EVENT_ID=$(echo $EVENT_RESPONSE | jq -r '.id')
echo "Created event with ID: $EVENT_ID"

# Test 2: Get all calendar events (representing initial calendar load)
echo -e "\nTest 2: Getting all calendar events"
curl -s -X GET "${API_URL}/api/calendarevents" | jq '.'

# Test 3: Get calendar events by date range (representing week/month view)
echo -e "\nTest 3: Getting calendar events by date range"
curl -s -X GET "${API_URL}/api/calendarevents/range?startDate=2024-04-15T00:00:00Z&endDate=2024-04-21T23:59:59Z" | jq '.'

# Test 4: Update a calendar event (representing editing event details)
echo -e "\nTest 4: Updating calendar event"
curl -s -X PUT "${API_URL}/api/calendarevents/${EVENT_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Team Meeting",
    "description": "Updated weekly team sync with new agenda",
    "location": "Conference Room B",
    "startDate": "2024-04-15T11:00:00Z",
    "endDate": "2024-04-15T12:00:00Z",
    "isDateRange": false,
    "hour": 11,
    "categoryId": "1"
  }' | jq '.'

# Test 5: Create a recurring event (representing setting up recurring meetings)
echo -e "\nTest 5: Creating a recurring event"
curl -s -X POST "${API_URL}/api/calendarevents" \
  -H "Content-Type: application/json" \
  -d '{
    "rpmBlockId": "2",
    "title": "Weekly Standup",
    "description": "Daily team standup meeting",
    "location": "Virtual",
    "startDate": "2024-04-15T09:00:00Z",
    "endDate": "2024-04-15T09:30:00Z",
    "isDateRange": true,
    "hour": 9,
    "categoryId": "1",
    "recurrence": {
      "frequency": "weekly",
      "interval": 1,
      "daysOfWeek": ["monday", "wednesday", "friday"]
    }
  }' | jq '.'

# Test 6: Get events for a specific day (representing day view)
echo -e "\nTest 6: Getting events for a specific day"
curl -s -X GET "${API_URL}/api/calendarevents/range?startDate=2024-04-15T00:00:00Z&endDate=2024-04-15T23:59:59Z" | jq '.'

# Test 7: Create an all-day event
echo -e "\nTest 7: Creating an all-day event"
curl -s -X POST "${API_URL}/api/calendarevents" \
  -H "Content-Type: application/json" \
  -d '{
    "rpmBlockId": "3",
    "title": "Company Holiday",
    "description": "Office closed for holiday",
    "location": "N/A",
    "startDate": "2024-04-20T00:00:00Z",
    "endDate": "2024-04-20T23:59:59Z",
    "isDateRange": true,
    "isAllDay": true,
    "categoryId": "2"
  }' | jq '.'

# Test 8: Get events with category filter (representing category filtering)
echo -e "\nTest 8: Getting events filtered by category"
curl -s -X GET "${API_URL}/api/calendarevents?categoryId=1" | jq '.'

# Test 9: Delete a calendar event (representing removing an event)
echo -e "\nTest 9: Deleting calendar event"
curl -s -X DELETE "${API_URL}/api/calendarevents/${EVENT_ID}"

# Test 10: Verify event was deleted
echo -e "\nTest 10: Verifying event deletion"
curl -s -X GET "${API_URL}/api/calendarevents/${EVENT_ID}" | jq '.'

echo -e "\n✅ Calendar Events API tests completed!"