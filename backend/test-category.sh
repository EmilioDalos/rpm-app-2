#!/bin/bash
# Import the test-utils.sh file verifying the API calls
source "$(dirname "$0")/test-utils.sh"

# Enable error handling
set -e

echo "🧪 Starting Category API tests..."

# Fixed test ID for consistent testing
TEST_ID="88888888-8888-8888-8888-888888888888"

# Test 1: Create a category with all fields
echo -e "\nTest 1: Creating a category with all fields"
make_request "POST" "/categories" '{
  "id": "'$TEST_ID'",
  "name": "Test Category",
  "description": "A test category",
  "color": "#FF5733",
  "icon": "test-icon"
}'

# Verify the category was created in the database
check_database_record "categories" "$TEST_ID"

# Test 2: Create a category with minimal fields
echo -e "\nTest 2: Creating a category with minimal fields"
make_request "POST" "/categories" '{
  "name": "Minimal Category"
}'

# Test 3: Get all categories
echo -e "\nTest 3: Getting all categories"
make_request "GET" "/categories"

# Test 4: Get a specific category
echo -e "\nTest 4: Getting a specific category"
make_request "GET" "/categories/$TEST_ID"

# Test 5: Update a category
echo -e "\nTest 5: Updating a category"
make_request "PUT" "/categories/$TEST_ID" '{
  "name": "Updated Category",
  "description": "An updated test category",
  "color": "#33FF57",
  "icon": "updated-icon"
}'

# Verify the category was updated in the database
check_database_record "categories" "$TEST_ID"

# Test 6: Delete a category
echo -e "\nTest 6: Deleting a category"
make_request "DELETE" "/categories/$TEST_ID"

# Verify the category was deleted from the database
check_database_record "categories" "$TEST_ID"

# Test 7: Invalid category creation (missing required field)
echo -e "\nTest 7: Testing invalid category creation"
make_request "POST" "/categories" '{
  "description": "A category without a name"
}'

echo -e "\n\n✅ Category API tests completed!"