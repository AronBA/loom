---
layout: default
title: Integration Guide
---

# Integration Guide

Learn how to integrate Loom with your applications to centralize log collection.

## Overview

Loom accepts logs via its REST API. Any application that can make HTTP requests can send logs to Loom.

## Authentication Flow

1. Register a user (one-time setup)
2. Login to get a JWT token
3. Use the token to send logs

Tokens are valid for 24 hours by default.

---

## Integration Scripts

Loom provides ready-to-use scripts in the `scripts/` directory:

### Python Logger

```python
# scripts/python_logger.py
python3 scripts/python_logger.py <source> <level> <message>
```

**Example:**
```bash
python3 scripts/python_logger.py payment-service INFO "Payment processed"
```

### Bash Logger

```bash
# scripts/bash_logger.sh
./scripts/bash_logger.sh <source> <level> <message>
```

**Example:**
```bash
./scripts/bash_logger.sh auth-service WARN "Failed login attempt"
```

---

## Language-Specific Examples

### Python

```python
import requests
import json

class LoomLogger:
    def __init__(self, api_url, username, password):
        self.api_url = api_url
        self.token = self._authenticate(username, password)
    
    def _authenticate(self, username, password):
        url = f"{self.api_url}/auth/login"
        response = requests.post(url, json={
            "username": username,
            "password": password
        })
        return response.json()["token"]
    
    def log(self, source, level, message):
        url = f"{self.api_url}/logs"
        headers = {"Authorization": f"Bearer {self.token}"}
        requests.post(url, headers=headers, json={
            "source": source,
            "level": level,
            "message": message
        })

# Usage
logger = LoomLogger("http://localhost/api", "testuser", "password")
logger.log("my-app", "INFO", "Application started")
```

### Node.js

```javascript
const axios = require('axios');

class LoomLogger {
  constructor(apiUrl, username, password) {
    this.apiUrl = apiUrl;
    this.authenticate(username, password);
  }

  async authenticate(username, password) {
    const response = await axios.post(`${this.apiUrl}/auth/login`, {
      username,
      password
    });
    this.token = response.data.token;
  }

  async log(source, level, message) {
    await axios.post(`${this.apiUrl}/logs`, {
      source,
      level,
      message
    }, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
  }
}

// Usage
const logger = new LoomLogger('http://localhost/api', 'testuser', 'password');
await logger.log('my-app', 'INFO', 'Application started');
```

### Java

```java
import java.net.http.*;
import java.net.URI;
import com.google.gson.Gson;

public class LoomLogger {
    private String apiUrl;
    private String token;
    private HttpClient client;
    private Gson gson;

    public LoomLogger(String apiUrl, String username, String password) {
        this.apiUrl = apiUrl;
        this.client = HttpClient.newHttpClient();
        this.gson = new Gson();
        authenticate(username, password);
    }

    private void authenticate(String username, String password) {
        var loginRequest = Map.of("username", username, "password", password);
        var request = HttpRequest.newBuilder()
            .uri(URI.create(apiUrl + "/auth/login"))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(gson.toJson(loginRequest)))
            .build();
        
        try {
            var response = client.send(request, HttpResponse.BodyHandlers.ofString());
            var json = gson.fromJson(response.body(), Map.class);
            this.token = (String) json.get("token");
        } catch (Exception e) {
            throw new RuntimeException("Authentication failed", e);
        }
    }

    public void log(String source, String level, String message) {
        var logEntry = Map.of("source", source, "level", level, "message", message);
        var request = HttpRequest.newBuilder()
            .uri(URI.create(apiUrl + "/logs"))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer " + token)
            .POST(HttpRequest.BodyPublishers.ofString(gson.toJson(logEntry)))
            .build();
        
        try {
            client.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (Exception e) {
            System.err.println("Failed to send log: " + e.getMessage());
        }
    }
}

// Usage
LoomLogger logger = new LoomLogger("http://localhost/api", "testuser", "password");
logger.log("my-app", "INFO", "Application started");
```

### Go

```go
package main

import (
    "bytes"
    "encoding/json"
    "net/http"
)

type LoomLogger struct {
    apiURL string
    token  string
}

func NewLoomLogger(apiURL, username, password string) (*LoomLogger, error) {
    logger := &LoomLogger{apiURL: apiURL}
    if err := logger.authenticate(username, password); err != nil {
        return nil, err
    }
    return logger, nil
}

func (l *LoomLogger) authenticate(username, password string) error {
    body, _ := json.Marshal(map[string]string{
        "username": username,
        "password": password,
    })
    
    resp, err := http.Post(l.apiURL+"/auth/login", "application/json", bytes.NewBuffer(body))
    if err != nil {
        return err
    }
    defer resp.Body.Close()
    
    var result map[string]string
    json.NewDecoder(resp.Body).Decode(&result)
    l.token = result["token"]
    return nil
}

func (l *LoomLogger) Log(source, level, message string) error {
    body, _ := json.Marshal(map[string]string{
        "source":  source,
        "level":   level,
        "message": message,
    })
    
    req, _ := http.NewRequest("POST", l.apiURL+"/logs", bytes.NewBuffer(body))
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("Authorization", "Bearer "+l.token)
    
    _, err := http.DefaultClient.Do(req)
    return err
}

// Usage
logger, _ := NewLoomLogger("http://localhost/api", "testuser", "password")
logger.Log("my-app", "INFO", "Application started")
```

---

## Framework Integrations

### Spring Boot (Logback Appender)

Create a custom Logback appender to send logs to Loom:

```xml
<!-- logback-spring.xml -->
<configuration>
    <appender name="LOOM" class="com.yourcompany.LoomAppender">
        <apiUrl>http://localhost/api</apiUrl>
        <username>testuser</username>
        <password>password</password>
        <source>my-spring-app</source>
    </appender>
    
    <root level="INFO">
        <appender-ref ref="LOOM" />
    </root>
</configuration>
```

### Express.js Middleware

```javascript
const loomMiddleware = (logger) => {
  return (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const level = res.statusCode >= 400 ? 'ERROR' : 'INFO';
      
      logger.log('express-app', level, 
        `${req.method} ${req.path} ${res.statusCode} ${duration}ms`
      );
    });
    
    next();
  };
};

// Usage
app.use(loomMiddleware(logger));
```

---

## Best Practices

### 1. Token Caching

Cache JWT tokens to avoid re-authenticating on every log:

```python
import time

class LoomLogger:
    def __init__(self, api_url, username, password):
        self.api_url = api_url
        self.username = username
        self.password = password
        self.token = None
        self.token_expiry = 0
    
    def _ensure_token(self):
        if time.time() >= self.token_expiry:
            self._authenticate()
    
    def _authenticate(self):
        # ... authentication logic
        self.token = response.json()["token"]
        self.token_expiry = time.time() + 86400  # 24 hours
```

### 2. Async Logging

Don't block your application waiting for log responses:

```python
import asyncio
import aiohttp

async def log_async(source, level, message):
    async with aiohttp.ClientSession() as session:
        await session.post(
            f"{API_URL}/logs",
            headers={"Authorization": f"Bearer {token}"},
            json={"source": source, "level": level, "message": message}
        )
```

### 3. Error Handling

Handle logging failures gracefully:

```python
def log_safe(source, level, message):
    try:
        logger.log(source, level, message)
    except Exception as e:
        # Fallback to local logging
        print(f"Failed to send log to Loom: {e}")
        local_logger.error(message)
```

### 4. Batching

For high-volume logging, batch multiple logs:

```python
class BatchLoomLogger:
    def __init__(self, batch_size=100):
        self.batch = []
        self.batch_size = batch_size
    
    def log(self, source, level, message):
        self.batch.append({"source": source, "level": level, "message": message})
        if len(self.batch) >= self.batch_size:
            self.flush()
    
    def flush(self):
        # Send all logs in batch
        for log in self.batch:
            self._send_log(log)
        self.batch = []
```

---

## Monitoring Integration Health

Check if Loom is reachable:

```bash
curl -f http://localhost/api/auth/login || echo "Loom is down"
```

[← Back to Home](index.md)
