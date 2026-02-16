#!/bin/bash
set -e

BASE_URL="http://localhost/api"

echo "0. Registering a new user..."
curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"verifyuser", "password":"password"}' > /dev/null

echo "User registered (ignoring if already exists)"

echo "1. Logging in..."
TOKEN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"verifyuser", "password":"password"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Login failed"
  # debugging output
  curl -v -X POST $BASE_URL/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"verifyuser", "password":"password"}'
  exit 1
fi
echo "Token received"

# Wait a moment for services to fully stabilize
sleep 2

echo "2. Posting a test log..."
curl -s -X POST $BASE_URL/logs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"source":"verification-script", "level":"INFO", "message":"UniqueSearchTerm123"}' > /dev/null

echo "Log posted"
sleep 1

echo "3. Searching for 'UniqueSearchTerm123'..."
COUNT=$(curl -s -G "$BASE_URL/logs" \
  -H "Authorization: Bearer $TOKEN" \
  --data-urlencode "search=UniqueSearchTerm123" \
  --data-urlencode "page=0" \
  --data-urlencode "size=10" | grep -o 'UniqueSearchTerm123' | wc -l)

if [ "$COUNT" -ge 1 ]; then
  echo "SUCCESS: Found log with search term"
else
  echo "FAILURE: Did not find log with search term"
  # debugging output
  curl -v -G "$BASE_URL/logs" \
    -H "Authorization: Bearer $TOKEN" \
    --data-urlencode "search=UniqueSearchTerm123"
  exit 1
fi

echo "4. Searching for 'NonExistentTerm'..."
COUNT_FAIL=$(curl -s -G "$BASE_URL/logs" \
  -H "Authorization: Bearer $TOKEN" \
  --data-urlencode "search=NonExistentTerm" | grep -o 'content":\[\]' | wc -l)

# If empty content array found, count is 1
if [ "$COUNT_FAIL" -ge 1 ]; then
  echo "SUCCESS: Correctly returned no logs for non-existent term"
else
  echo "FAILURE: Found logs for non-existent term?"
    # debugging output
  curl -v -G "$BASE_URL/logs" \
    -H "Authorization: Bearer $TOKEN" \
    --data-urlencode "search=NonExistentTerm"
  exit 1
fi

echo "All verification tests passed!"
