#!/bin/bash
# Import the test-utils.sh file verifying the API calls
source "$(dirname "$0")/test-utils.sh"

# Enable error handling
set -e

echo "🧪 Starting Calendar Events API tests..."

# Fixed test ID
TEST_ID="11111111-aaaa-aaaa-aaaa-111111111111"
CATEGORY_ID="11111111-1111-1111-1111-111111111111"

echo -e "\nTest 1: Creating a calendar event"
EVENT_RESPONSE=$(curl -s -X POST "http://localhost:3001/api/calendar-events" \
  -H "Content-Type: application/json" \
  -d '{
    "actionId": "33333333-ffff-ffff-ffff-333333333333",
    "text": "Team Meeting",
    "description": "Weekly team sync",
    "location": "Conference Room A",
    "startDate": "2025-04-15T10:00:00Z",
    "endDate": "2025-04-15T11:00:00Z",
    "isDateRange": false,
    "hour": 10,
    "categoryId": "11111111-1111-1111-1111-111111111111",
    "leverage": "High Priority",
    "durationAmount": 60,
    "durationUnit": "minutes"
  }')

# Laat de volledige JSON-response zien
echo "$EVENT_RESPONSE" | jq '.'

# Haal het nieuwe event ID eruit en toon het één keer
EVENT_ID=$(echo "$EVENT_RESPONSE" | jq -r '.id')
echo "Created event with ID: $EVENT_ID"

# Test 2: Get calendar event by ID
echo -e "\nTest 2: Getting calendar event by ID"
EVENT_DETAILS=$(curl -s -X GET "${API_URL}/api/calendar-events/${EVENT_ID}" | jq '.')
echo "$EVENT_DETAILS"

# Get info for the actual occurrence from the date range endpoint
echo -e "\nFinding occurrence ID before tests..."
OCCURRENCES_RESPONSE=$(curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2025-04-15T00:00:00Z&endDate=2025-04-15T23:59:59Z" | jq '.')
OCCURRENCE_ID=$(echo $OCCURRENCES_RESPONSE | jq -r '.[0].events[0].id')
echo "Found occurrence with ID: $OCCURRENCE_ID for date 2025-04-15"

# Test 3: Get calendar events by date range (representing week/month view)
echo -e "\nTest 3: Getting calendar events by date range"
curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2025-04-01T00:00:00.000Z&endDate=2025-04-30T23:59:59.999Z" | jq '.'

# Test 4: Update a calendar event (changing startDate, test occurrence moves or is replaced)
echo -e "\nTest 4: Updating calendar event (changing startDate)"
UPDATE_RESPONSE=$(curl -s -X PUT "${API_URL}/api/calendar-events/${EVENT_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Updated Team Meeting",
    "description": "Updated weekly team sync with new agenda",
    "location": "Conference Room B",
    "startDate": "2025-04-16T11:00:00Z",
    "endDate": "2025-04-16T12:00:00Z",
    "isDateRange": false,
    "hour": 11,
    "categoryId": "'"${CATEGORY_ID}"'",
    "leverage": "Super High Priority",
    "durationAmount": 90,
    "durationUnit": "minutes",
    "status": "in_progress"
  }' | jq '.')

echo "$UPDATE_RESPONSE"

echo -e "\nVerifying updated occurrence reflects new date..."
NEW_OCCURRENCES_RESPONSE=$(curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2025-04-16T00:00:00Z&endDate=2025-04-16T23:59:59Z" | jq '.')
echo "$NEW_OCCURRENCES_RESPONSE"

# Check that original date no longer has an occurrence
echo -e "\nVerifying original date (2025-04-15) no longer has an occurrence for this event..."
ORIGINAL_DATE_RESPONSE=$(curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2025-04-15T00:00:00Z&endDate=2025-04-15T23:59:59Z" | jq '.')
echo "$ORIGINAL_DATE_RESPONSE"

# Check if the event is present on the original date
EVENT_ON_ORIGINAL_DATE=$(echo $ORIGINAL_DATE_RESPONSE | jq -r --arg id "$EVENT_ID" '.[0]?.events[]? | select(.actionId==$id) | .actionId // empty')

if [ -z "$EVENT_ON_ORIGINAL_DATE" ]; then
  echo -e "\n✅ Test passed: Original occurrence (2025-04-15) correctly removed when date changed"
else
  echo -e "\n❌ Test failed: Original occurrence (2025-04-15) still exists after date change"
  echo "ActionId found: $EVENT_ON_ORIGINAL_DATE"
fi

# Get the new occurrence ID after update
NEW_OCCURRENCE_ID=$(echo $NEW_OCCURRENCES_RESPONSE | jq -r '.[0]?.events[0]?.id')
if [ "$NEW_OCCURRENCE_ID" == "null" ] || [ -z "$NEW_OCCURRENCE_ID" ]; then
  echo "Warning: Could not find new occurrence ID after update. Falling back to original event ID."
  NEW_OCCURRENCE_ID=$EVENT_ID
else
  echo "Found new occurrence ID: $NEW_OCCURRENCE_ID for date 2025-04-16"
fi

# Test 5: Testing recurrence pattern
echo -e "\nTest 5: Testing recurrence pattern"
echo "Creating a recurring event..."

RECURRING_EVENT_RESPONSE=$(curl -s -X POST "${API_URL}/api/calendar-events" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Recurring Event",
    "actionId": "33333333-ffff-ffff-ffff-333333333333",
    "description": "Event that repeats every Monday and Wednesday",
    "startDate": "2024-05-01T10:00:00Z",
    "endDate": "2024-05-31T23:59:59Z",
    "isDateRange": true,
    "hour": 10,
    "categoryId": "'"${CATEGORY_ID}"'",
    "location": "Meeting Room",
    "leverage": "High",
    "durationAmount": 60,
    "durationUnit": "minutes",
    "recurrencePattern": [
      {"dayOfWeek": "MONDAY"},
      {"dayOfWeek": "WEDNESDAY"}
    ]
  }' | jq '.')

echo "$RECURRING_EVENT_RESPONSE"

RECURRING_EVENT_ID=$(echo $RECURRING_EVENT_RESPONSE | jq -r '.id')
if [ -z "$RECURRING_EVENT_ID" ]; then
  echo "❌ Test failed: Could not create recurring event"
  exit 1
fi

echo "✅ Test passed: Recurring event created with ID: $RECURRING_EVENT_ID"

# Verify occurrences were created for the recurring pattern
echo -e "\nVerifying recurring occurrences..."
RECURRING_OCCURRENCES_RESPONSE=$(curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2024-05-01T00:00:00Z&endDate=2024-05-31T23:59:59Z" | jq '.')
echo "$RECURRING_OCCURRENCES_RESPONSE"

# Count occurrences for this event in May 2024
OCCURRENCE_COUNT=$(echo $RECURRING_OCCURRENCES_RESPONSE | jq -r --arg id "$RECURRING_EVENT_ID" '[.[].events[] | select(.actionId==$id)] | length')

# In May 2024, there should be 9 occurrences (4 Mondays and 5 Wednesdays)
if [ "$OCCURRENCE_COUNT" -eq 9 ]; then
  echo "✅ Test passed: Found correct number of recurring occurrences (9)"
else
  echo "❌ Test failed: Expected 9 occurrences, found $OCCURRENCE_COUNT"
  exit 1
fi

# Verify specific dates have occurrences
echo -e "\nVerifying specific dates have occurrences..."
MAY_6_RESPONSE=$(curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2024-05-06T00:00:00Z&endDate=2024-05-06T23:59:59Z" | jq '.')
MAY_8_RESPONSE=$(curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2024-05-08T00:00:00Z&endDate=2024-05-08T23:59:59Z" | jq '.')
MAY_7_RESPONSE=$(curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2024-05-07T00:00:00Z&endDate=2024-05-07T23:59:59Z" | jq '.')

MAY_6_OCCURRENCE=$(echo "$MAY_6_RESPONSE" | jq -r --arg id "$RECURRING_EVENT_ID" '(.[0] // {events: []}).events[] | select(.actionId==$id) | .id // empty')
echo "MAY_7_OCCURRENCE: $MAY_6_RESPONSE"
if [ -n "$MAY_6_OCCURRENCE" ]; then
  echo "✅ Test passed: Found occurrence for Tuesdag May 7"
else
  echo "❌ Test failed: No occurrence found for Tuesday May 7"
  exit 1
fi

MAY_8_OCCURRENCE=$(echo "$MAY_8_RESPONSE" | jq -r --arg id "$RECURRING_EVENT_ID" '(.[0] // {events: []}).events[] | select(.actionId==$id) | .id // empty')
if [ -n "$MAY_8_OCCURRENCE" ]; then
  echo "✅ Test passed: Found occurrence for Wednesday May 8"
else
  echo "❌ Test failed: No occurrence found for Wednesday May 8"
  exit 1
fi

MAY_7_OCCURRENCE=$(echo "$MAY_7_RESPONSE" | jq -r --arg id "$RECURRING_EVENT_ID" '(.[0] // {events: []}).events[] | select(.actionId==$id) | .id // empty')
if [ -z "$MAY_7_OCCURRENCE" ]; then
  echo "✅ Test passed: Correctly no occurrence for Tuesday May 7"
else
  echo "❌ Test failed: Found unexpected occurrence for Tuesday May 7"
  exit 1
fi

# Update the recurring event to change the pattern
echo -e "\nUpdating recurring event pattern..."
curl -s -X PUT "${API_URL}/api/calendar-events/${RECURRING_EVENT_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Recurring Event",
    "description": "Event that repeats every Tuesday and Thursday",
    "startDate": "2024-05-01T10:00:00Z",
    "endDate": "2024-05-31T23:59:59Z",
    "isDateRange": true,
    "hour": "10",
    "categoryId": "'"${CATEGORY_ID}"'",
    "location": "Meeting Room",
    "leverage": "High",
    "durationAmount": 60,
    "durationUnit": "minutes",
    "recurrencePattern": [
      {"dayOfWeek": "TUESDAY"},
      {"dayOfWeek": "THURSDAY"}
    ]
  }'

# Verify the pattern was updated
echo -e "\nVerifying updated pattern..."
UPDATED_OCCURRENCES_RESPONSE=$(curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2024-05-01T00:00:00Z&endDate=2024-05-31T23:59:59Z" | jq '.')
UPDATED_OCCURRENCE_COUNT=$(echo $UPDATED_OCCURRENCES_RESPONSE | jq -r --arg id "$RECURRING_EVENT_ID" '[.[].events[] | select(.actionId==$id)] | length')

# In May 2024, there should be 9 occurrences (4 Tuesdays and 5 Thursdays)
if [ "$UPDATED_OCCURRENCE_COUNT" -eq 9 ]; then
  echo "✅ Test passed: Found correct number of updated recurring occurrences (9)"
else
  echo "❌ Test failed: Expected 9 occurrences after update, found $UPDATED_OCCURRENCE_COUNT"
  exit 1
fi

# Verify specific dates after update
MAY_7_RESPONSE=$(curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2024-05-07T00:00:00Z&endDate=2024-05-07T23:59:59Z" | jq '.')
MAY_9_RESPONSE=$(curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2024-05-09T00:00:00Z&endDate=2024-05-09T23:59:59Z" | jq '.')

# May 7 (Tuesday) should now have an occurrence
MAY_7_OCCURRENCE=$(echo $MAY_7_RESPONSE | jq -r --arg id "$RECURRING_EVENT_ID" '.[0]?.events[]? | select(.actionId==$id) | .id // empty')
if [ -n "$MAY_7_OCCURRENCE" ]; then
  echo "✅ Test passed: Found occurrence for Tuesday May 7 after update"
else
  echo "❌ Test failed: No occurrence found for Tuesday May 7 after update"
  exit 1
fi

# May 9 (Thursday) should have an occurrence
MAY_9_OCCURRENCE=$(echo $MAY_9_RESPONSE | jq -r --arg id "$RECURRING_EVENT_ID" '.[0]?.events[]? | select(.actionId==$id) | .id // empty')
if [ -n "$MAY_9_OCCURRENCE" ]; then
  echo "✅ Test passed: Found occurrence for Thursday May 9 after update"
else
  echo "❌ Test failed: No occurrence found for Thursday May 9 after update"
  exit 1
fi

echo -e "\n✅ All recurrence pattern tests passed!"

# Test 6: Delete a calendar event by date
echo -e "\nTest 6: Deleting calendar event by date $NEW_OCCURRENCE_ID"
curl -s -X DELETE "${API_URL}/api/calendar-events/${NEW_OCCURRENCE_ID}/2025-04-16"

# Verify deletion of occurrence but event should still exist
echo -e "\nVerifying occurrence was deleted but event still exists..."
curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2025-04-16T00:00:00Z&endDate=2025-04-16T23:59:59Z" | jq '.'
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

# Test A: Create a specific test for isDateRange=false date change
echo -e "\nTest A: Creating a non-date-range event for testing date changes"
SINGLE_EVENT_RESPONSE=$(curl -s -X POST "${API_URL}/api/calendar-events" \
  -H "Content-Type: application/json" \
  -d '{
    "rpmBlockId": "'"${TEST_ID}"'",
    "text": "Single Day Event",
    "description": "Single day event for testing",
    "location": "Meeting Room",
    "startDate": "2025-05-10T10:00:00Z",
    "endDate": "2025-05-10T11:00:00Z",
    "isDateRange": false,
    "hour": 10,
    "categoryId": "'"${CATEGORY_ID}"'",
    "leverage": "High Priority",
    "durationAmount": 60,
    "durationUnit": "minutes"
  }' | jq '.')

SINGLE_EVENT_ID=$(echo $SINGLE_EVENT_RESPONSE | jq -r '.id')
echo "Created single event with ID: $SINGLE_EVENT_ID"

# Verify occurrence created for original date
echo -e "\nVerifying occurrence was created for May 10th..."
MAY_10_RESPONSE=$(curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2025-05-10T00:00:00Z&endDate=2025-05-10T23:59:59Z" | jq '.')
echo "$MAY_10_RESPONSE"
MAY_10_OCCURRENCE=$(echo $MAY_10_RESPONSE | jq -r --arg id "$SINGLE_EVENT_ID" '.[0]?.events[]? | select(.actionId==$id) | .id // empty')

if [ -z "$MAY_10_OCCURRENCE" ]; then
  echo "❌ Test setup failed: No occurrence found for May 10th"
else
  echo "✅ Found occurrence for May 10th: $MAY_10_OCCURRENCE"
  
  # Now update the event to a new date
  echo -e "\nUpdating single event to May 15th..."
  curl -s -X PUT "${API_URL}/api/calendar-events/${SINGLE_EVENT_ID}" \
    -H "Content-Type: application/json" \
    -d '{
      "text": "Single Day Event",
      "description": "Single day event for testing",
      "location": "Meeting Room",
      "startDate": "2025-05-15T10:00:00Z",
      "endDate": "2025-05-15T11:00:00Z",
      "isDateRange": false,
      "hour": 10,
      "categoryId": "'"${CATEGORY_ID}"'",
      "leverage": "High Priority",
      "durationAmount": 60,
      "durationUnit": "minutes"
    }' | jq '.'
  
  # Verify occurrence now exists for May 15th
  echo -e "\nVerifying occurrence was created for May 15th..."
  MAY_15_RESPONSE=$(curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2025-05-15T00:00:00Z&endDate=2025-05-15T23:59:59Z" | jq '.')
  echo "$MAY_15_RESPONSE"
  MAY_15_OCCURRENCE=$(echo $MAY_15_RESPONSE | jq -r --arg id "$SINGLE_EVENT_ID" '.[0]?.events[]? | select(.actionId==$id) | .id // empty')
  
  # Verify original May 10th occurrence is gone
  echo -e "\nVerifying May 10th occurrence is gone..."
  UPDATED_MAY_10_RESPONSE=$(curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2025-05-10T00:00:00Z&endDate=2025-05-10T23:59:59Z" | jq '.')
  echo "$UPDATED_MAY_10_RESPONSE"
  UPDATED_MAY_10_OCCURRENCE=$(echo $UPDATED_MAY_10_RESPONSE | jq -r --arg id "$SINGLE_EVENT_ID" '.[0]?.events[]? | select(.actionId==$id) | .id // empty')
  
  # Print test results
  if [ -z "$MAY_15_OCCURRENCE" ]; then
    echo "❌ Test failed: No occurrence found for new date (May 15th)"
  else
    echo "✅ Found occurrence for new date (May 15th): $MAY_15_OCCURRENCE"
  fi
  
  if [ -z "$UPDATED_MAY_10_OCCURRENCE" ]; then
    echo "✅ Test passed: Original occurrence (May 10th) correctly removed"
  else
    echo "❌ Test failed: Original occurrence (May 10th) still exists: $UPDATED_MAY_10_OCCURRENCE"
   fi
fi

# Cleanup this test
echo -e "\nCleaning up the single day event test..."
curl -s -X DELETE "${API_URL}/api/calendar-events/${SINGLE_EVENT_ID}"

# Test B: Geïsoleerde test voor het verplaatsen van een isDateRange=false event
echo -e "\nTest B: Geïsoleerde test voor verplaatsen van een single-day event"
echo -e "\n1. Aanmaken van een single day event op 2025-06-01"
MOVE_EVENT_RESPONSE=$(curl -s -X POST "${API_URL}/api/calendar-events" \
  -H "Content-Type: application/json" \
  -d '{
    "rpmBlockId": "'"${TEST_ID}"'",
    "text": "Verplaatsbaar Event",
    "description": "Event dat verplaatst zal worden",
    "location": "Locatie A",
    "startDate": "2025-06-01T09:00:00Z",
    "endDate": "2025-06-01T10:00:00Z",
    "isDateRange": false,
    "hour": 9,
    "categoryId": "'"${CATEGORY_ID}"'",
    "leverage": "Medium Priority",
    "durationAmount": 60,
    "durationUnit": "minutes"
  }' | jq '.')

MOVE_EVENT_ID=$(echo $MOVE_EVENT_RESPONSE | jq -r '.id')
echo "Aangemaakt event met ID: $MOVE_EVENT_ID"

# Controleer of het event is aangemaakt op 1 juni 2025
echo -e "\n2. Controleren of event aanwezig is op 2025-06-01"
JUNE_1_RESPONSE=$(curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2025-06-01T00:00:00Z&endDate=2025-06-01T23:59:59Z" | jq '.')
echo "$JUNE_1_RESPONSE"

JUNE_1_EVENT=$(echo $JUNE_1_RESPONSE | jq -r --arg id "$MOVE_EVENT_ID" '.[0]?.events[]? | select(.actionId==$id) | .id // empty')

if [ -z "$JUNE_1_EVENT" ]; then
  echo "❌ Test gefaald: Event niet gevonden op 1 juni 2025"
else
  echo "✅ Event gevonden op 1 juni 2025: $JUNE_1_EVENT"
  
  # Controleer dat het event NIET op 15 juni staat (vóór verplaatsing)
  echo -e "\n3. Controleren dat event NIET aanwezig is op 2025-06-15 (vóór verplaatsing)"
  JUNE_15_RESPONSE=$(curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2025-06-15T00:00:00Z&endDate=2025-06-15T23:59:59Z" | jq '.')
  echo "$JUNE_15_RESPONSE"
  
  JUNE_15_PRE_EVENT=$(echo $JUNE_15_RESPONSE | jq -r --arg id "$MOVE_EVENT_ID" '.[0]?.events[]? | select(.actionId==$id) | .id // empty')
  
  if [ -z "$JUNE_15_PRE_EVENT" ]; then
    echo "✅ Juist: Event is niet aanwezig op 15 juni (vóór verplaatsing)"
    
    # Verplaats nu het event van 1 juni naar 15 juni
    echo -e "\n4. Verplaatsen van event van 2025-06-01 naar 2025-06-15"
    UPDATE_MOVE_RESPONSE=$(curl -s -X PUT "${API_URL}/api/calendar-events/${MOVE_EVENT_ID}" \
      -H "Content-Type: application/json" \
      -d '{
        "text": "Verplaatst Event",
        "description": "Event dat verplaatst is",
        "location": "Locatie B",
        "startDate": "2025-06-15T14:00:00Z",
        "endDate": "2025-06-15T15:30:00Z",
        "isDateRange": false,
        "hour": 14,
        "categoryId": "'"${CATEGORY_ID}"'",
        "leverage": "High Priority",
        "durationAmount": 90,
        "durationUnit": "minutes"
      }' | jq '.')
    echo "$UPDATE_MOVE_RESPONSE"
    
    # Controleer dat het event nu WEL op 15 juni staat
    echo -e "\n5. Controleren dat event WEL aanwezig is op 2025-06-15 (na verplaatsing)"
    JUNE_15_POST_RESPONSE=$(curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2025-06-15T00:00:00Z&endDate=2025-06-15T23:59:59Z" | jq '.')
    echo "$JUNE_15_POST_RESPONSE"
    
    JUNE_15_POST_EVENT=$(echo $JUNE_15_POST_RESPONSE | jq -r --arg id "$MOVE_EVENT_ID" '.[0]?.events[]? | select(.actionId==$id) | .id // empty')
    
    if [ -z "$JUNE_15_POST_EVENT" ]; then
      echo "❌ Test gefaald: Event niet gevonden op 15 juni (na verplaatsing)"
    else
      echo "✅ Event gevonden op 15 juni (na verplaatsing): $JUNE_15_POST_EVENT"
      
      # Controleer dat de details correct zijn gewijzigd
      JUNE_15_HOUR=$(echo $JUNE_15_POST_RESPONSE | jq -r --arg id "$MOVE_EVENT_ID" '.[0].events[] | select(.actionId==$id) | .hour')
      JUNE_15_DURATION=$(echo $JUNE_15_POST_RESPONSE | jq -r --arg id "$MOVE_EVENT_ID" '.[0].events[] | select(.actionId==$id) | .durationAmount')
      
      echo "   - Nieuw tijdstip: $JUNE_15_HOUR (moet 14 zijn)"
      echo "   - Nieuwe duur: $JUNE_15_DURATION minuten (moet 90 zijn)"
    fi
    
    # Controleer dat het event NIET meer op 1 juni staat
    echo -e "\n6. Controleren dat event NIET meer aanwezig is op 2025-06-01 (na verplaatsing)"
    JUNE_1_POST_RESPONSE=$(curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2025-06-01T00:00:00Z&endDate=2025-06-01T23:59:59Z" | jq '.')
    echo "$JUNE_1_POST_RESPONSE"
    
    JUNE_1_POST_EVENT=$(echo $JUNE_1_POST_RESPONSE | jq -r --arg id "$MOVE_EVENT_ID" '.[0]?.events[]? | select(.actionId==$id) | .id // empty')
    
    if [ -z "$JUNE_1_POST_EVENT" ]; then
      echo "✅ Test geslaagd: Event is niet meer aanwezig op 1 juni (oude occurrence is verwijderd)"
      echo -e "\n==> Test geslaagd: Event is correct verplaatst van 1 juni naar 15 juni en oude occurrence is verwijderd"
    else
      echo "❌ Test gefaald: Event nog steeds aanwezig op 1 juni: $JUNE_1_POST_EVENT"
    fi
  else
    echo "❌ Test setup gefaald: Event al aanwezig op 15 juni vóór verplaatsing: $JUNE_15_PRE_EVENT"
  fi
fi

# Opruimen
echo -e "\nOpruimen van het verplaatsings-test event..."
curl -s -X DELETE "${API_URL}/api/calendar-events/${MOVE_EVENT_ID}"

# Test C: Test voor het dubbele occurrences probleem met isDateRange=false
echo -e "\nTest C: Test voor duplicatie van occurrences met isDateRange=false"
echo -e "\n1. Aanmaken van een single day event op 2025-07-01"
DUPLICATE_EVENT_RESPONSE=$(curl -s -X POST "${API_URL}/api/calendar-events" \
  -H "Content-Type: application/json" \
  -d '{
    "rpmBlockId": "'"${TEST_ID}"'",
    "text": "Morning Workout",
    "description": "Event dat voor duplicatie test wordt gebruikt",
    "location": "Gym",
    "startDate": "2025-07-01T07:00:00Z",
    "endDate": "2025-07-01T08:00:00Z",
    "isDateRange": false,
    "hour": 7,
    "categoryId": "'"${CATEGORY_ID}"'",
    "leverage": "High Priority",
    "durationAmount": 60,
    "durationUnit": "minutes"
  }' | jq '.')

DUPLICATE_EVENT_ID=$(echo $DUPLICATE_EVENT_RESPONSE | jq -r '.id')
echo "Aangemaakt event met ID: $DUPLICATE_EVENT_ID"

# Controleer de initiële occurrence
echo -e "\n2. Controleren of event aanwezig is op 2025-07-01"
JULY_1_RESPONSE=$(curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2025-07-01T00:00:00Z&endDate=2025-07-01T23:59:59Z" | jq '.')
echo "$JULY_1_RESPONSE"
JULY_1_EVENT=$(echo $JULY_1_RESPONSE | jq -r --arg id "$DUPLICATE_EVENT_ID" '.[0]?.events[]? | select(.actionId==$id) | .id // empty')

if [ -z "$JULY_1_EVENT" ]; then
  echo "❌ Test gefaald: Event niet gevonden op 1 juli 2025"
else
  echo "✅ Event gevonden op 1 juli 2025: $JULY_1_EVENT"

  # Simuleer het duplicatieprobleem door een PUT request te doen naar tweede datum, 
  # maar zonder de oorspronkelijke datum te wijzigen (dit zou niet moeten kunnen, maar testen of het systeem het afhandelt)
  echo -e "\n3. Poging om tweede occurrence aan te maken zonder de eerste te verwijderen"
  DUPLICATE_UPDATE_RESPONSE=$(curl -s -X PUT "${API_URL}/api/calendar-events/${DUPLICATE_EVENT_ID}" \
    -H "Content-Type: application/json" \
    -d '{
      "text": "Morning Workout",
      "description": "Event dat voor duplicatie test wordt gebruikt",
      "location": "Gym",
      "startDate": "2025-07-02T07:00:00Z",
      "endDate": "2025-07-02T08:00:00Z",
      "isDateRange": false,
      "hour": 7,
      "categoryId": "'"${CATEGORY_ID}"'",
      "leverage": "High Priority",
      "durationAmount": 60,
      "durationUnit": "minutes"
    }' | jq '.')
  echo "$DUPLICATE_UPDATE_RESPONSE"

  # Controleer nu of de eerste occurrence weg is
  echo -e "\n4. Controleren of de oorspronkelijke occurrence op 2025-07-01 is verwijderd"
  JULY_1_POST_RESPONSE=$(curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2025-07-01T00:00:00Z&endDate=2025-07-01T23:59:59Z" | jq '.')
  echo "$JULY_1_POST_RESPONSE"
  JULY_1_POST_EVENT=$(echo $JULY_1_POST_RESPONSE | jq -r --arg id "$DUPLICATE_EVENT_ID" '.[0]?.events[]? | select(.actionId==$id) | .id // empty')

  # Controleer of de nieuwe occurrence is aangemaakt
  echo -e "\n5. Controleren of nieuwe occurrence correct is aangemaakt op 2025-07-02"
  JULY_2_RESPONSE=$(curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2025-07-02T00:00:00Z&endDate=2025-07-02T23:59:59Z" | jq '.')
  echo "$JULY_2_RESPONSE"
  JULY_2_EVENT=$(echo $JULY_2_RESPONSE | jq -r --arg id "$DUPLICATE_EVENT_ID" '.[0]?.events[]? | select(.actionId==$id) | .id // empty')

  # Resultaat van de test
  if [ -z "$JULY_1_POST_EVENT" ] && [ ! -z "$JULY_2_EVENT" ]; then
    echo "✅ Test geslaagd: Oorspronkelijke occurrence is verwijderd en nieuwe occurrence is aangemaakt"
  elif [ ! -z "$JULY_1_POST_EVENT" ] && [ ! -z "$JULY_2_EVENT" ]; then
    echo "❌ Duplicatie probleem: Beide occurrences bestaan tegelijkertijd (bug gevonden)"
    echo "   - Occurrence op 1 juli ID: $JULY_1_POST_EVENT"
    echo "   - Occurrence op 2 juli ID: $JULY_2_EVENT"
  elif [ ! -z "$JULY_1_POST_EVENT" ] && [ -z "$JULY_2_EVENT" ]; then
    echo "❌ Test gefaald: Alleen oorspronkelijke occurrence bestaat, nieuwe is niet aangemaakt"
  else
    echo "❌ Test gefaald: Geen occurrences gevonden op beide data"
  fi

  # Extra verificatie: probeer het event op te halen en controleer de startDate
  echo -e "\n6. Controleren van de huidige startDate van het event"
  CURRENT_EVENT=$(curl -s -X GET "${API_URL}/api/calendar-events/${DUPLICATE_EVENT_ID}" | jq '.')
  echo "$CURRENT_EVENT"
  CURRENT_START_DATE=$(echo $CURRENT_EVENT | jq -r '.events[0].startDate')
  echo "Huidige startDate van het event: $CURRENT_START_DATE"
  
  # Is er maar één occurrence (via nieuwe API call)
  echo -e "\n7. Controleren of er niet nog andere occurrences bestaan"
  ALL_OCCURRENCES=$(curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2025-07-01T00:00:00Z&endDate=2025-07-10T23:59:59Z" | jq '.')
  echo "$ALL_OCCURRENCES" | jq '.[] | select(.events[].actionId == "'"$DUPLICATE_EVENT_ID"'")'
  
  OCCURRENCE_COUNT=$(echo "$ALL_OCCURRENCES" | jq '[.[] | .events[] | select(.actionId == "'"$DUPLICATE_EVENT_ID"'")]' | jq 'length')
  echo "Totaal aantal occurrences gevonden: $OCCURRENCE_COUNT (zou 1 moeten zijn)"
  
  if [ "$OCCURRENCE_COUNT" -eq 1 ]; then
    echo "✅ Correct: Er bestaat slechts één occurrence voor dit isDateRange=false event"
  else
    echo "❌ Probleem: Er bestaan $OCCURRENCE_COUNT occurrences voor dit isDateRange=false event"
  fi
fi

# Opruimen
echo -e "\nOpruimen van de duplicatie-test event..."
curl -s -X DELETE "${API_URL}/api/calendar-events/${DUPLICATE_EVENT_ID}"

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
DAY_1_RESPONSE=$(curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2025-05-01T00:00:00Z&endDate=2025-05-01T23:59:59Z" | jq '.')
DAY_2_RESPONSE=$(curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2025-05-02T00:00:00Z&endDate=2025-05-02T23:59:59Z" | jq '.')
DAY_3_RESPONSE=$(curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2025-05-03T00:00:00Z&endDate=2025-05-03T23:59:59Z" | jq '.')

echo -e "\nOccurrences on May 1st 2025:"
echo $DAY_1_RESPONSE | jq '.'
echo -e "\nOccurrences on May 2nd 2025:"
echo $DAY_2_RESPONSE | jq '.'
echo -e "\nOccurrences on May 3rd 2025:"
echo $DAY_3_RESPONSE | jq '.'

# Extract occurrence IDs for each day
DAY_1_OCCURRENCE_ID=$(echo $DAY_1_RESPONSE | jq -r '.[0]?.events[0]?.id // empty')
DAY_2_OCCURRENCE_ID=$(echo $DAY_2_RESPONSE | jq -r '.[0]?.events[0]?.id // empty')
DAY_3_OCCURRENCE_ID=$(echo $DAY_3_RESPONSE | jq -r '.[0]?.events[0]?.id // empty')

if [ -z "$DAY_2_OCCURRENCE_ID" ]; then
  echo "Warning: Could not find occurrence ID for day 2. Skipping update test."
else
  # Test 9: Update time for the second day occurrence
  echo -e "\nTest 9: Updating time for day 2 occurrence (ID: ${DAY_2_OCCURRENCE_ID})"
  echo "Current hour for day 2: $(echo $DAY_2_RESPONSE | jq -r '.[0].events[0].hour')"

  # Update the time from 9:00 to 14:00 and change duration
  curl -s -X PUT "${API_URL}/api/calendar-events/occurrences/${DAY_2_OCCURRENCE_ID}" \
    -H "Content-Type: application/json" \
    -d '{
      "hour": 14,
      "durationAmount": 120,
      "durationUnit": "minutes",
      "location": "Main Conference Hall",
      "leverage": "Very High Priority"
    }' | jq '.'

  # Verify day 2 occurrence was updated but days 1 and 3 remain unchanged
  echo -e "\nVerifying only day 2 occurrence was updated with new time..."
  UPDATED_DAY_1_RESPONSE=$(curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2025-05-01T00:00:00Z&endDate=2025-05-01T23:59:59Z" | jq '.')
  UPDATED_DAY_2_RESPONSE=$(curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2025-05-02T00:00:00Z&endDate=2025-05-02T23:59:59Z" | jq '.')
  UPDATED_DAY_3_RESPONSE=$(curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2025-05-03T00:00:00Z&endDate=2025-05-03T23:59:59Z" | jq '.')

  DAY1_HOUR=$(echo $UPDATED_DAY_1_RESPONSE | jq -r '.[0]?.events[0]?.hour // "N/A"')
  DAY2_HOUR=$(echo $UPDATED_DAY_2_RESPONSE | jq -r '.[0]?.events[0]?.hour // "N/A"')
  DAY2_LOCATION=$(echo $UPDATED_DAY_2_RESPONSE | jq -r '.[0]?.events[0]?.location // "N/A"')
  DAY2_DURATION=$(echo $UPDATED_DAY_2_RESPONSE | jq -r '.[0]?.events[0]?.durationAmount // "N/A"')
  DAY2_DURATION_UNIT=$(echo $UPDATED_DAY_2_RESPONSE | jq -r '.[0]?.events[0]?.durationUnit // "N/A"')
  DAY3_HOUR=$(echo $UPDATED_DAY_3_RESPONSE | jq -r '.[0]?.events[0]?.hour // "N/A"')

  echo -e "\nDay 1 hour (should still be 9): $DAY1_HOUR"
  echo "Day 2 hour (should now be 14): $DAY2_HOUR"
  echo "Day 2 location (should be updated): $DAY2_LOCATION"
  echo "Day 2 duration (should be 120 minutes): $DAY2_DURATION $DAY2_DURATION_UNIT"
  echo "Day 3 hour (should still be 9): $DAY3_HOUR"
fi

if [ -z "$DAY_1_OCCURRENCE_ID" ]; then
  echo "Warning: Could not find occurrence ID for day 1. Skipping delete test."
else
  # Test 10: Delete one day from the date range event and verify other days still exist
  echo -e "\nTest 10: Deleting one day from date range event"
  echo "Deleting day 1 occurrence with ID: $DAY_1_OCCURRENCE_ID"
  curl -s -X DELETE "${API_URL}/api/calendar-events/${DAY_1_OCCURRENCE_ID}/2025-05-01"

  echo -e "\nVerifying only day 1 was deleted but days 2-3 still exist..."
  curl -s -X GET "${API_URL}/api/calendar-events/date-range?startDate=2025-05-01T00:00:00Z&endDate=2025-05-03T23:59:59Z" | jq '.'

  # Check if date range event still has its dates (they should NOT be reset)
  echo -e "\nChecking if dateRange event's dates were preserved (should NOT be reset)..."
  RANGE_EVENT_AFTER_DELETE=$(curl -s -X GET "${API_URL}/api/calendar-events/${RANGE_EVENT_ID}" | jq '.')
  echo $RANGE_EVENT_AFTER_DELETE | jq '.'
fi

# Test 11: Delete the remaining date range event
echo -e "\nTest 11: Deleting the date range event"
curl -s -X DELETE "${API_URL}/api/calendar-events/${RANGE_EVENT_ID}"

# Test 12: Delete the entire calendar event
echo -e "\nTest 12: Deleting entire calendar event"
curl -s -X DELETE "${API_URL}/api/calendar-events/${EVENT_ID}"

# Verify event deletion
echo -e "\nVerifying events were completely deleted..."
curl -s -X GET "${API_URL}/api/calendar-events/${EVENT_ID}" | jq '.'
curl -s -X GET "${API_URL}/api/calendar-events/${RANGE_EVENT_ID}" | jq '.'


