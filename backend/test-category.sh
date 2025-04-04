#!/bin/bash

# Enable error handling
set -e

echo "🧪 Starting Category API tests..."

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
TEST_ID="11111111-1111-1111-1111-111111111111"

# Test 1: Create a category without optional fields
echo -e "\nTest 1: Create category without optional fields"
make_request "POST" "http://localhost:3001/api/categories" '{
  "id": "'$TEST_ID'",
  "name": "Test Category",
  "type": "personal",
  "description": "Test description"
}'

# Test 2: Create a category with all fields
echo -e "\n\nTest 2: Create category with all fields"
make_request "POST" "http://localhost:3001/api/categories" '{
  "name": "Complete Category",
  "type": "professional",
  "description": "Complete test description",
  "vision": "Test vision",
  "purpose": "Test purpose",
  "resources": "Test resources",
  "color": "#FF5733"
}'

# Test 3: Get all categories
echo -e "\n\nTest 3: Get all categories"
make_request "GET" "http://localhost:3001/api/categories"

# Test 4: Get category by ID
echo -e "\n\nTest 4: Get category by ID"
make_request "GET" "http://localhost:3001/api/categories/$TEST_ID"

# Test 5: Update category
echo -e "\n\nTest 5: Update category"
make_request "PUT" "http://localhost:3001/api/categories/$TEST_ID" '{
  "name": "Updated Category",
  "type": "professional",
  "description": "Updated description",
  "vision": "Updated vision",
  "purpose": "Updated purpose",
  "resources": "Updated resources",
  "color": "#33FF57"
}'

# Test 6: Delete category
echo -e "\n\nTest 6: Delete category"
make_request "DELETE" "http://localhost:3001/api/categories/$TEST_ID"

# Test 7: Create category with invalid type
echo -e "\n\nTest 7: Create category with invalid type"
make_request "POST" "http://localhost:3001/api/categories" '{
  "name": "Invalid Category",
  "type": "invalid_type",
  "description": "Test description"
}' || true

# Test 8: Create category with missing required fields
echo -e "\n\nTest 8: Create category with missing required fields"
make_request "POST" "http://localhost:3001/api/categories" '{
  "type": "personal"
}' || true

echo -e "\n\n✅ Category API tests completed!"