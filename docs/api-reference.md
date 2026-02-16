---
layout: default
title: API Reference
---

# API Reference

Loom provides a RESTful API for authentication and log management.

## Base URL

```
http://localhost/api
```

## Authentication

All endpoints except `/auth/*` require JWT authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Auth Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:** `200 OK`
```json
{
  "message": "User registered successfully!"
}
```

**Error Responses:**
- `400 Bad Request` - Username already exists

---

### Login

Authenticate and receive a JWT token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "username": "testuser"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials

---

## Log Endpoints

### Get Logs

Retrieve logs with optional filtering and pagination.

**Endpoint:** `GET /api/logs`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (default: 0) |
| `size` | integer | No | Page size (default: 10) |
| `level` | string | No | Filter by level (INFO, WARN, ERROR) |
| `source` | string | No | Filter by source (partial match) |
| `search` | string | No | Search in message content |
| `startDate` | datetime | No | Filter logs after this date (ISO 8601) |
| `endDate` | datetime | No | Filter logs before this date (ISO 8601) |
| `sort` | string[] | No | Sort field and direction (default: timestamp,desc) |

**Example Request:**
```bash
curl -X GET "http://localhost/api/logs?page=0&size=10&level=ERROR&search=payment" \
  -H "Authorization: Bearer <token>"
```

**Response:** `200 OK`
```json
{
  "content": [
    {
      "id": 1,
      "timestamp": "2026-02-16T14:30:00",
      "source": "payment-service",
      "level": "ERROR",
      "message": "Payment processing failed",
      "userId": 1
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    }
  },
  "totalPages": 5,
  "totalElements": 42,
  "last": false,
  "first": true,
  "numberOfElements": 10,
  "size": 10,
  "number": 0,
  "empty": false
}
```

---

### Create Log

Create a new log entry.

**Endpoint:** `POST /api/logs`

**Request Body:**
```json
{
  "source": "string",
  "level": "string",
  "message": "string",
  "timestamp": "2026-02-16T14:30:00" // Optional, defaults to now
}
```

**Example Request:**
```bash
curl -X POST "http://localhost/api/logs" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "my-service",
    "level": "INFO",
    "message": "Application started successfully"
  }'
```

**Response:** `200 OK`
```json
{
  "id": 123,
  "timestamp": "2026-02-16T14:30:00",
  "source": "my-service",
  "level": "INFO",
  "message": "Application started successfully",
  "userId": 1
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token
- `400 Bad Request` - Invalid request body

---

## Log Levels

Loom supports three log levels:

- **INFO**: Informational messages
- **WARN**: Warning messages
- **ERROR**: Error messages

---

## Date Format

All datetime fields use ISO 8601 format:

```
2026-02-16T14:30:00
```

For filtering, you can use:
```
2026-02-16T14:30:00Z  // UTC
2026-02-16T14:30:00+01:00  // With timezone
```

---

## Rate Limiting

Currently, there are no rate limits enforced. This may change in future versions.

---

## Error Responses

All error responses follow this format:

```json
{
  "timestamp": "2026-02-16T14:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/logs"
}
```

---

## Examples

### Complete Workflow

```bash
# 1. Register a user
curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "myuser", "password": "mypass"}'

# 2. Login and get token
TOKEN=$(curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "myuser", "password": "mypass"}' \
  | jq -r '.token')

# 3. Create a log
curl -X POST http://localhost/api/logs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "my-app",
    "level": "INFO",
    "message": "User logged in"
  }'

# 4. Query logs
curl -X GET "http://localhost/api/logs?search=logged&level=INFO" \
  -H "Authorization: Bearer $TOKEN"
```

[← Back to Home](index.md)
