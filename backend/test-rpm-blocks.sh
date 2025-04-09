#!/bin/bash
# Import the test-utils.sh file verifying the API calls
source "$(dirname "$0")/test-utils.sh"

# Enable error handling
set -e

echo "🧪 Starting RPM Blocks API tests..."

# Fixed test ID
TEST_ID="11111111-aaaa-aaaa-aaaa-111111111111"

# Test 1: Create an RPM block without category_id
echo -e "\nTest 1: Create RPM block without category_id"
echo "Executing: curl -X POST http://localhost:3001/api/rpmblocks"
response=$(curl -s -X POST http://localhost:3001/api/rpmblocks \
  -H "Content-Type: application/json" \
  -d '{
    "id": "'$TEST_ID'",
    "result": "Test Result",
    "type": "Day",
    "order": 1
  }')
echo "$response"

# Test 2: Create an RPM block with category_id
echo -e "\n\nTest 2: Create RPM block with category_id"
echo "Executing: curl -X POST http://localhost:3001/api/rpmblocks"
response=$(curl -s -X POST http://localhost:3001/api/rpmblocks \
  -H "Content-Type: application/json" \
  -d '{
    "id": "11111111-bbbb-bbbb-bbbb-111111111111",
    "result": "Test Result with Category",
    "type": "Day",
    "order": 2,
    "category_id": ""
  }')
echo "$response"

# Test 3: Create a complete RPM block with all action-plan-panel data
echo -e "\n\nTest 3: Create complete RPM block with action-plan-panel data"
echo "Executing: curl -X POST http://localhost:3001/api/rpmblocks"
response=$(curl -s -X POST http://localhost:3001/api/rpmblocks \
  -H "Content-Type: application/json" \
  -d '{
    "id": "11111111-cccc-cccc-cccc-111111111111",
    "result": "Complete Test Result",
    "type": "Day",
    "order": 3,
    "category_id": "",
    "content": {
      "massiveActions": [
        {
          "text": "Test Action 1",
          "leverage": "LB1",
          "durationAmount": 30,
          "durationUnit": "min",
          "priority": 1,
          "key": "?",
          "categoryId": ""
        },
        {
          "text": "Test Action 2",
          "leverage": "LB2",
          "durationAmount": 1,
          "durationUnit": "hr",
          "priority": 2,
          "key": "✔",
          "categoryId": ""
        }
      ],
      "purposes": [
        "Purpose 1",
        "Purpose 2"
      ],
      "result": "Complete Test Result"
    }
  }')
echo "$response"

# Test 3b: Create RPM block with detailed massive action content
echo -e "\n\nTest 3b: Create RPM block with detailed massive action content"
echo "Executing: curl -X POST http://localhost:3001/api/rpmblocks"
response=$(curl -s -X POST http://localhost:3001/api/rpmblocks \
  -H "Content-Type: application/json" \
  -d '{
    "id": "1744190610716",
    "result": "testgr6",
    "type": "Day",
    "order": 4,
    "category_id": "",
    "content": {
      "massiveActions": [
        {
          "id": "1744190603573",
          "text": "test",
          "leverage": "",
          "durationAmount": 0,
          "durationUnit": "min",
          "priority": 0,
          "key": "✘",
          "categoryId": "",
          "notes": []
        }
      ],
      "purposes": [
        "Purpose voor testgr6"
      ],
      "result": "testgr6"
    }
  }')
echo "$response"

# Test 4: Get all RPM blocks
echo -e "\n\nTest 4: Get all RPM blocks"
echo "Executing: curl -X GET http://localhost:3001/api/rpmblocks"
response=$(curl -s -X GET http://localhost:3001/api/rpmblocks)
echo "$response"
TEST_ID=$(echo "$response" | jq -r '.[0].id')
echo "Selected TEST_ID: $TEST_ID"

# Test 5: Get RPM block by ID
echo -e "\n\nTest 5: Get RPM block by ID"
echo "Executing: curl -X GET http://localhost:3001/api/rpmblocks/$TEST_ID"
response=$(curl -s -X GET http://localhost:3001/api/rpmblocks/$TEST_ID)
echo "$response"

# Test 6: Update RPM block
echo -e "\n\nTest 6: Update RPM block"
echo "Executing: curl -X PUT http://localhost:3001/api/rpmblocks/$TEST_ID"
response=$(curl -s -X PUT http://localhost:3001/api/rpmblocks/$TEST_ID \
  -H "Content-Type: application/json" \
  -d '{
    "result": "Updated Result",
    "type": "Day",
    "order": 3,
    "category_id": "22222222-2222-2222-2222-222222222222"
  }')
echo "$response"

# Test 7: Delete RPM block
echo -e "\n\nTest 7: Delete RPM block"
echo "Executing: curl -X DELETE http://localhost:3001/api/rpmblocks/$TEST_ID"
response=$(curl -s -X DELETE http://localhost:3001/api/rpmblocks/$TEST_ID)
echo "$response"

echo -e "\n\n✅ RPM Blocks API tests completed!"