#!/bin/bash

# Ensure hey is installed
if ! command -v hey &> /dev/null; then
    echo "hey is not installed. Please install it (e.g., brew install hey or go install github.com/rakyll/hey@latest)"
    exit 1
fi

USERNAME="lt_$$_$(date +%s | tail -c 6)"
PASSWORD="password"

echo "Registering test user $USERNAME..."
REGISTER_RESP=$(curl -s -X POST http://127.0.0.1/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")
echo "Register response: $REGISTER_RESP"

if echo "$REGISTER_RESP" | grep -q "Error\|error\|Bad Request"; then
  echo "Registration failed. Aborting."
  exit 1
fi

echo "Logging in..."
# Get the loom_access_token cookie (strip \r to normalise CRLF headers from nginx)
LOGIN_RESP=$(curl -s -i -X POST http://127.0.0.1/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")

COOKIE_VAL=$(echo "$LOGIN_RESP" | tr -d '\r' \
  | grep -i "^set-cookie: loom_access_token=" \
  | sed 's/.*loom_access_token=\([^;]*\).*/\1/')

if [ -z "$COOKIE_VAL" ]; then
  echo "Failed to get auth cookie. Login response was:"
  echo "$LOGIN_RESP" | head -20
  exit 1
fi

echo "Successfully logged in."

echo "Starting load test with hey..."
echo "Target: GET http://127.0.0.1/api/logs"
echo "Concurrency: 50, Duration: 10s"

hey -m GET -c 50 -z 10s \
  -H "Cookie: loom_access_token=$COOKIE_VAL" \
  http://127.0.0.1/api/logs
