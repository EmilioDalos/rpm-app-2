#!/bin/bash

# Enable error handling
set -e

echo "🧪 Starting RPM Blocks API tests..."

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
TEST_ID="11111111-aaaa-aaaa-aaaa-111111111111"

# Test 1: Create an RPM block without category_id
echo -e "\nTest 1: Create RPM block without category_id"
make_request "POST" "http://localhost:3001/api/rpmblocks" '{
  "id": "'$TEST_ID'",
  "result": "Test Result",
  "type": "text",
  "order": 1
}'

# Test 2: Create an RPM block with category_id
echo -e "\n\nTest 2: Create RPM block with category_id"
make_request "POST" "http://localhost:3001/api/rpmblocks" '{
    "id": "11111111-bbbb-bbbb-bbbb-111111111111",
    "result": "Test Result with Category",
    "type": "text",
    "order": 2,
    "category_id": ""
}'

# Test 3: Get all RPM blocks
echo -e "\n\nTest 3: Get all RPM blocks"
make_request "GET" "http://localhost:3001/api/rpmblocks"

# Test 4: Get RPM block by ID
echo -e "\n\nTest 4: Get RPM block by ID"
make_request "GET" "http://localhost:3001/api/rpmblocks/$TEST_ID"

# Test 5: Update RPM block
echo -e "\n\nTest 5: Update RPM block"
make_request "PUT" "http://localhost:3001/api/rpmblocks/$TEST_ID" '{
  "result": "Updated Result",
  "type": "text",
  "order": 3,
  "category_id": "22222222-2222-2222-2222-222222222222"
}'

# Test 6: Delete RPM block
echo -e "\n\nTest 6: Delete RPM block"
make_request "DELETE" "http://localhost:3001/api/rpmblocks/$TEST_ID"


echo -e "\n\n✅ RPM Blocks API tests completed!"