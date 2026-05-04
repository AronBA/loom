#!/usr/bin/env python3
import requests
import subprocess
import socket
import json

def get_hostname():
    return socket.gethostname()

def stream_logs(log_file_path="/var/log/system.log"):
    # 1. Login to get token
    login_url = "http://localhost/api/auth/login"
    credentials = {"username": "fortnite", "password": "fortnite"}
    print(f"Logging in to {login_url}...")
    try:
        response = requests.post(login_url, json=credentials)
        response.raise_for_status()
        token = response.json().get("token")
        if not token:
            print("Failed to retrieve token.")
            return
        print("Successfully authenticated.")
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to backend: {e}")
        return

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }

    hostname = get_hostname()
    
    # 2. Tail a log file and send each new line to the backend
    print(f"Listening for logs on {log_file_path}...")
    try:
        # Use subprocess to tail the file
        process = subprocess.Popen(
            ['tail', '-F', log_file_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        while True:
            line = process.stdout.readline()
            if not line:
                break
                
            log_message = line.decode("utf-8", errors="replace").strip()
            if not log_message:
                continue
                
            log_entry = {
                "source": hostname,
                "level": "INFO",
                "message": log_message
            }
            
            try:
                res = requests.post("http://localhost/api/logs", json=log_entry, headers=headers)
                res.raise_for_status()
                print(f"Sent: {log_message[:80]}...")
            except requests.exceptions.RequestException as e:
                print(f"Error sending log: {e}")
                
    except KeyboardInterrupt:
        print("\nStopping log stream...")
    finally:
        if 'process' in locals():
            process.terminate()

if __name__ == "__main__":
    stream_logs()
