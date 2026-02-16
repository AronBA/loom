#!/bin/bash

# Configuration
API_URL="http://localhost/api"
USERNAME="testuser"
PASSWORD="password"

if [ "$#" -ne 3 ]; then
    echo "Usage: ./bash_logger.sh <source> <level> <message>"
    echo "Example: ./bash_logger.sh payment-service INFO 'Payment processed'"
    exit 1
fi

SOURCE=$1
LEVEL=$2
MESSAGE=$3

# 1. Authenticate and get Token
# Uses jq to parse JSON. If jq is not installed, this will fail.
if ! command -v jq &> /dev/null; then
    echo "Error: jq is required for this script."
    exit 1
fi

echo "Authenticating..."
TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
     -H "Content-Type: application/json" \
     -d "{\"username\": \"$USERNAME\", \"password\": \"$PASSWORD\"}" | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
    echo "Authentication failed."
    exit 1
fi

# 2. Send Log
echo "Sending log..."
curl -s -X POST "$API_URL/logs" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d "{\"source\": \"$SOURCE\", \"level\": \"$LEVEL\", \"message\": \"$MESSAGE\"}"

echo # Newline for clean output
echo "Done."
