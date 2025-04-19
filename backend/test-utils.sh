# Function to verify a specific field in a JSON response
verify_field_in_response() {
  local field=$1
  local expected_value=$2
  local json=$3

  # Trim whitespace
  json=$(echo "$json" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

  # Validate JSON
  echo "$json" | jq . >/dev/null 2>&1
  if [ $? -ne 0 ]; then
    echo "⚠️ Response is geen geldige JSON:"
    echo "$json"
    exit 1
  fi

  # Detect if JSON is an array and use the first element if needed
  local actual_value
  if echo "$json" | jq -e 'type == "array"' >/dev/null; then
    actual_value=$(echo "$json" | jq -r --arg key "$field" '.[0][$key]')
  else
    actual_value=$(echo "$json" | jq -r --arg key "$field" '.[$key]')
  fi

  echo "🔎 Verifying $field: expected '$expected_value', got '$actual_value'"
  if [ "$actual_value" == "$expected_value" ]; then
    echo "✅ Field '$field' verification passed."
  else
    echo "❌ Field '$field' verification failed. Expected: '$expected_value', Got: '$actual_value'"
    exit 1
  fi
}

API_URL="http://localhost:3001" # of welke base URL je API ook gebruikt