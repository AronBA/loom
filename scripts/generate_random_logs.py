#!/usr/bin/env python3
import requests
import time
import random

def generate_random_logs():
    session = requests.Session()
    login_url = "http://localhost/api/auth/login"
    
    # Try the two users we know about
    credentials = {"username": "myadmin", "password": "myadmin"}
    print(f"Logging in to {login_url}...")
    
    try:
        response = session.post(login_url, json=credentials)
        if response.status_code == 401:
             print("Login failed with 'admin'. Trying 'testuser'...")
             credentials = {"username": "testuser", "password": "password"}
             response = session.post(login_url, json=credentials)
             
        response.raise_for_status()
        print("Successfully authenticated.")
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to backend: {e}")
        return

    sources = ["payment-service", "auth-service", "web-frontend", "database-worker", "email-service"]
    levels = ["INFO", "INFO", "INFO", "WARN", "ERROR", "DEBUG"]
    
    messages = {
        "INFO": ["User logged in successfully", "Job processed", "Email sent", "Payment success", "Session renewed"],
        "WARN": ["High memory usage", "API rate limit approaching", "Retrying connection"],
        "ERROR": ["Database failed", "Null pointer exception", "Payment failed", "Timeout"],
        "DEBUG": ["Entering method", "Cache miss", "Query took 45ms", "Payload size: 1024"]
    }

    print("Starting to generate random logs... Press Ctrl+C to stop.")
    
    try:
        while True:
            level = random.choice(levels)
            source = random.choice(sources)
            message = random.choice(messages[level])
            
            if random.random() > 0.5:
                message += f" (ID: {random.randint(1000, 9999)})"

            log_entry = {"source": source, "level": level, "message": message}
            
            try:
                # CSRF is now disabled for /api/logs, so this simple post will work
                resp = session.post("http://localhost/api/logs", json=log_entry)
                resp.raise_for_status()
                print(f"Sent [{level}] from {source}: {message}")
            except requests.exceptions.RequestException as e:
                print(f"Error sending log: {e}")
                
            time.sleep(random.uniform(0.5, 2.0))
            
    except KeyboardInterrupt:
        print("\nStopping random log generation...")

if __name__ == "__main__":
    generate_random_logs()