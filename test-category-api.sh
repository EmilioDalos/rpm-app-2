#!/bin/bash

echo "======= Testing API Routes for Categories ======="

# Test connection to server
echo "Testing connection to server..."
curl -s http://localhost:3000/api/categories > /dev/null
if [ $? -ne 0 ]; then
  echo "Error: Cannot connect to server. Make sure the Next.js app is running on port 3000."
  exit 1
fi

# Create a test category
echo "Creating a test category..."
curl -s -X POST -H "Content-Type: application/json" -d '{
  "name": "Test Category",
  "type": "personal",
  "description": "Created via API test script",
  "vision": "Test vision",
  "purpose": "Test purpose",
  "roles": [],
  "threeToThrive": ["Test1", "Test2"],
  "resources": "Test resources",
  "results": [],
  "actionPlans": ["Test plan"],
  "imageBlob": "",
  "color": "#ff9900"
}' http://localhost:3000/api/categories > create_response.json

echo "Create response received. Extracting ID..."
cat create_response.json

# Extract the ID from the created category
ID=$(grep -o '"id":"[^"]*"' create_response.json | head -1 | sed 's/"id":"//g' | sed 's/"//g')
if [ -z "$ID" ]; then
  echo "Error: Failed to extract ID from response."
  echo "Response: $(cat create_response.json)"
  exit 1
fi

echo "Created category with ID: $ID"

# Get the created category
echo "Getting the created category..."
curl -s http://localhost:3000/api/categories/$ID > get_response.json
echo "Get response received."
cat get_response.json

# Update the category
echo "Updating the category..."
curl -s -X PUT -H "Content-Type: application/json" -d '{
  "name": "Updated Test Category",
  "type": "personal",
  "description": "Updated via API test script",
  "vision": "Updated test vision",
  "purpose": "Updated test purpose",
  "roles": [],
  "threeToThrive": ["Test1", "Test2", "Test3"],
  "resources": "Updated test resources",
  "results": [],
  "actionPlans": ["Updated test plan"],
  "imageBlob": "",
  "color": "#00ff99"
}' http://localhost:3000/api/categories/$ID > update_response.json

echo "Update response received."
cat update_response.json

# Get all categories
echo "Getting all categories..."
curl -s http://localhost:3000/api/categories | grep -o '"name":"[^"]*"' | head -5

# Delete the category
echo "Deleting the category..."
curl -s -X DELETE http://localhost:3000/api/categories/$ID > delete_response.json
echo "Delete response received."
cat delete_response.json

echo "======= Test complete ======="
echo "Check the JSON files for complete responses."
