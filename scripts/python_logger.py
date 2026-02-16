import requests
import json
import time
import sys

# Configuration
API_URL = "http://localhost/api"
USERNAME = "testuser"
PASSWORD = "password"

def get_token():
    """Authenticates and returns a JWT token."""
    url = f"{API_URL}/auth/login"
    payload = {"username": USERNAME, "password": PASSWORD}
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return response.json().get("token")
    except Exception as e:
        print(f"Error authenticating: {e}")
        sys.exit(1)

def send_log(token, source, level, message):
    """Sends a log entry to the API."""
    url = f"{API_URL}/logs"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    payload = {
        "source": source,
        "level": level,
        "message": message,
        # Timestamp is optional, backend defaults to now()
    }
    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        print(f"[{level}] Log sent from {source}: {message}")
    except Exception as e:
        print(f"Error sending log: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python3 python_logger.py <source> <level> <message>")
        print("Example: python3 python_logger.py payment-service INFO 'Payment processed successfully'")
        sys.exit(1)

    source = sys.argv[1]
    level = sys.argv[2]
    message = sys.argv[3]

    print("Authenticating...")
    token = get_token()
    
    print(f"Sending log...")
    send_log(token, source, level, message)
