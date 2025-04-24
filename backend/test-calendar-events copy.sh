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
) | jq '.'

EVENT_ID=$(echo $EVENT_RESPONSE | jq -r '.id')
echo "Created event with ID: $EVENT_ID"

# Test 2: Get all calendar events (representing initial calendar load)
echo -e "\nTest 2: Getting all calendar events"
curl -s -X GET "${API_URL}/api/calendar-events" | jq '.'

# Test 3: Get calendar events by date range (representing week/month view)
echo -e "\nTest 3: Getting calendar events by date range"
curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2024-04-15T00:00:00Z&endDate=2024-04-21T23:59:59Z" | jq '.'

# Test 4: Update a calendar event (changing startDate, test occurrence moves or is replaced)
echo -e "\nTest 4: Updating calendar event (changing startDate)"
curl -s -X PUT "${API_URL}/api/calendar-events/${EVENT_ID}" \
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
EOF | jq '.'

echo -e "\nVerifying updated occurrence reflects new date..."
curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2024-04-16T00:00:00Z&endDate=2024-04-16T23:59:59Z" | jq '.'

# Test 4a: Delete a calendar event (representing removing an event)
#echo -e "\nTest 19: Deleting calendar event"
#curl -s -X DELETE "${API_URL}/api/calendar-events/${EVENT_ID}/2024-04-16T11:00:00Z"



# # Test 5: Create a recurring event (representing setting up recurring meetings)
# echo -e "\nTest 5: Creating a recurring event"
# RECURRING_EVENT_RESPONSE=$(curl -s -X POST "${API_URL}/api/calendar-events" \
#   -H "Content-Type: application/json" \
#   -d @- <<EOF
# {
#   "rpmBlockId": "${TEST_ID}",
#   "text": "Weekly Standup",
#   "description": "Daily team standup meeting",
#   "location": "Virtual",
#   "startDate": "2024-04-15T09:00:00Z",
#   "endDate": "2024-04-15T09:30:00Z",
#   "isDateRange": true,
#   "hour": 9,
#   "categoryId": "${CATEGORY_ID}",
#   "recurrencePattern": [
#     {"dayOfWeek": "Monday"},
#     {"dayOfWeek": "Wednesday"},
#     {"dayOfWeek": "Friday"}
#   ]
# }
# EOF
# ) | jq '.'

# RECURRING_EVENT_ID=$(echo $RECURRING_EVENT_RESPONSE | jq -r '.id')
# echo "Created recurring event with ID: $RECURRING_EVENT_ID"

# # Test 6: Get events for a specific day (representing day view)
# echo -e "\nTest 6: Getting events for a specific day"
# curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2024-04-15T00:00:00Z&endDate=2024-04-15T23:59:59Z" | jq '.'

# # Test 7: Create an all-day event
# echo -e "\nTest 7: Creating an all-day event"
# curl -s -X POST "${API_URL}/api/calendar-events" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "rpmBlockId": "3",
#     "text": "Company Holiday",
#     "description": "Office closed for holiday",
#     "location": "N/A",
#     "startDate": "2024-04-20T00:00:00Z",
#     "endDate": "2024-04-20T23:59:59Z",
#     "isDateRange": true,
#     "isAllDay": true,
#     "categoryId": "2"
#   }' | jq '.'

# # Test 8: Get events with category filter (representing category filtering)
# echo -e "\nTest 8: Getting events filtered by category"
# curl -s -X GET "${API_URL}/api/calendar-events?categoryId=1" | jq '.'

# # Test 9: Add an exception to a recurring event


# # Test 10: Verify the exception was added by checking events for the exception date
# echo -e "\nTest 10: Verifying exception was added (checking events for exception date)"
# curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2024-04-17T00:00:00Z&endDate=2024-04-17T23:59:59Z" | jq '.'

# # Test 11: Add multiple exceptions to a recurring event
# echo -e "\nTest 11: Adding multiple exceptions to a recurring event"
# curl -s -X PUT "${API_URL}/api/calendar-events/${RECURRING_EVENT_ID}" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "recurrenceExceptions": [
#       {
#         "exceptionDate": "2024-04-17",
#         "reason": "Team offsite"
#       },
#       {
#         "exceptionDate": "2024-04-22",
#         "reason": "Holiday"
#       },
#       {
#         "exceptionDate": "2024-04-24",
#         "reason": "Conference"
#       }
#     ]
#   }' | jq '.'

# # Test 12: Verify multiple exceptions were added
# echo -e "\nTest 12: Verifying multiple exceptions were added"
# curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2024-04-15T00:00:00Z&endDate=2024-04-30T23:59:59Z" | jq '.'

# # Test 13: Remove an exception from a recurring event
# echo -e "\nTest 13: Removing an exception from a recurring event"
# curl -s -X PUT "${API_URL}/api/calendar-events/${RECURRING_EVENT_ID}" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "recurrenceExceptions": [
#       {
#         "exceptionDate": "2024-04-22",
#         "reason": "Holiday"
#       },
#       {
#         "exceptionDate": "2024-04-24",
#         "reason": "Conference"
#       }
#     ]
#   }' | jq '.'

# # Test 14: Verify the exception was removed
# echo -e "\nTest 14: Verifying exception was removed"
# curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2024-04-17T00:00:00Z&endDate=2024-04-17T23:59:59Z" | jq '.'

# # Test 15: Remove an event from the calendar (should add an exception for recurring events)
# echo -e "\nTest 15: Removing an event from the calendar (should add an exception for recurring events)"
# curl -s -X PUT "${API_URL}/api/calendar-events/${RECURRING_EVENT_ID}" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "recurrenceExceptions": [
#       {
#         "exceptionDate": "2024-04-22",
#         "reason": "Holiday"
#       },
#       {
#         "exceptionDate": "2024-04-24",
#         "reason": "Conference"
#       },
#       {
#         "exceptionDate": "2024-04-19",
#         "reason": "Cancelled by user"
#       }
#     ]
#   }' | jq '.'

# # Test 16: Verify the event was removed from the calendar
# echo -e "\nTest 16: Verifying event was removed from the calendar"
# curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2024-04-19T00:00:00Z&endDate=2024-04-19T23:59:59Z" | jq '.'

# # Test 17: Create a recurring event with exceptions in the initial creation
# echo -e "\nTest 17: Creating a recurring event with exceptions in the initial creation"
# curl -s -X POST "${API_URL}/api/calendar-events" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "rpmBlockId": "4",
#     "text": "Monthly Review",
#     "description": "Monthly team review meeting",
#     "location": "Conference Room C",
#     "startDate": "2024-04-01T14:00:00Z",
#     "endDate": "2024-04-01T15:00:00Z",
#     "isDateRange": true,
#     "hour": 14,
#     "categoryId": "1",
#     "recurrencePattern": [
#       {"dayOfWeek": "Monday"}
#     ],
#     "recurrenceExceptions": [
#       {
#         "exceptionDate": "2024-04-01",
#         "reason": "Holiday"
#       },
#       {
#         "exceptionDate": "2024-05-06",
#         "reason": "Team offsite"
#       }
#     ]
#   }' | jq '.'

# # Test 18: Verify the recurring event with exceptions was created correctly
# echo -e "\nTest 18: Verifying recurring event with exceptions was created correctly"
# curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2024-04-01T00:00:00Z&endDate=2024-05-31T23:59:59Z" | jq '.'

# Test 19: Delete a calendar event (representing removing an event)
echo -e "\nTest 19: Deleting calendar event"
curl -s -X DELETE "${API_URL}/api/calendar-events/${EVENT_ID}"

# # Test 20: Verify event was deleted
# echo -e "\nTest 20: Verifying event deletion"
# curl -s -X GET "${API_URL}/api/calendar-events/${EVENT_ID}" | jq '.'

# # Test 21: Add a recurrence exception using the dedicated endpoint
# echo -e "\nTest 21: Adding a recurrence exception using the dedicated endpoint"
# EXCEPTION_RESPONSE=$(curl -s -X POST "${API_URL}/api/calendar-events/${RECURRING_EVENT_ID}/exceptions" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "exceptionDate": "2024-04-29",
#     "reason": "Team building day"
#   }')

# EXCEPTION_ID=$(echo $EXCEPTION_RESPONSE | jq -r '.id')
# echo "Created exception with ID: $EXCEPTION_ID"

# # Test 22: Verify the exception was added using the dedicated endpoint
# echo -e "\nTest 22: Verifying exception was added using the dedicated endpoint"
# curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2024-04-29T00:00:00Z&endDate=2024-04-29T23:59:59Z" | jq '.'

# # Test 23: Try to add an exception to a non-recurring event (should fail)
# echo -e "\nTest 23: Trying to add an exception to a non-recurring event (should fail)"
# curl -s -X POST "${API_URL}/api/calendar-events/${EVENT_ID}/exceptions" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "exceptionDate": "2024-04-16",
#     "reason": "Test failure case"
#   }' | jq '.'

# # Test 24: Try to add a duplicate exception (should fail)
# echo -e "\nTest 24: Trying to add a duplicate exception (should fail)"
# curl -s -X POST "${API_URL}/api/calendar-events/${RECURRING_EVENT_ID}/exceptions" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "exceptionDate": "2024-04-29",
#     "reason": "Duplicate exception"
#   }' | jq '.'

# # Test 25: Delete a recurrence exception using the dedicated endpoint
# echo -e "\nTest 25: Deleting a recurrence exception using the dedicated endpoint"
# curl -s -X DELETE "${API_URL}/api/calendar-events/${RECURRING_EVENT_ID}/exceptions/${EXCEPTION_ID}"

# # Test 26: Verify the exception was deleted using the dedicated endpoint
# echo -e "\nTest 26: Verifying exception was deleted using the dedicated endpoint"
# curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2024-04-29T00:00:00Z&endDate=2024-04-29T23:59:59Z" | jq '.'

# # Test 27: Try to delete a non-existent exception (should fail)
# echo -e "\nTest 27: Trying to delete a non-existent exception (should fail)"
# curl -s -X DELETE "${API_URL}/api/calendar-events/${RECURRING_EVENT_ID}/exceptions/non-existent-id" | jq '.'

# echo -e "\n✅ Calendar Events API tests completed!"