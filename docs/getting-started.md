---
layout: default
title: Getting Started
---

# Getting Started

This guide will help you get Loom up and running on your local machine.

## Prerequisites

- Docker (version 20.10+)
- Docker Compose (version 2.0+)
- 4GB RAM minimum
- Ports 80, 5432, 8080, and 4200 available

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/loom.git
cd loom
```

### 2. Start the Application

```bash
docker-compose up --build
```

This command will:
- Build the backend Spring Boot application
- Build the frontend Angular application
- Start PostgreSQL database
- Start Nginx reverse proxy
- Run database migrations

### 3. Access the Application

Once all containers are running, open your browser and navigate to:

```
http://localhost
```

### 4. Login

Use the default credentials:
- **Username**: `testuser`
- **Password**: `password`

## First Steps

### Viewing Logs

After logging in, you'll be taken to the Dashboard where you can:
- View all logs in a paginated table
- Filter by log level (INFO, WARN, ERROR)
- Filter by source
- Search through log messages
- Filter by date range

### Adding a Test Log

Click the **"Add Test Log"** button in the dashboard to create a sample log entry.

### Using Filters

1. **Level Filter**: Select from INFO, WARN, or ERROR
2. **Source Filter**: Type a source name to filter
3. **Search**: Enter text to search in log messages
4. **Date Range**: Select start date to filter logs

## Development Setup

If you want to run the application in development mode:

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

The backend will be available at `http://localhost:8080`

### Frontend

```bash
cd frontend
npm install
npm start
```

The frontend will be available at `http://localhost:4200`

### Database

You'll need PostgreSQL running locally:

```bash
docker run -d \
  --name loom-postgres \
  -e POSTGRES_DB=loom \
  -e POSTGRES_USER=loom \
  -e POSTGRES_PASSWORD=loom123 \
  -p 5432:5432 \
  postgres:16
```

## Troubleshooting

### Port Already in Use

If you get a port conflict error:

```bash
# Check what's using port 80
sudo lsof -i :80

# Stop the conflicting service or change the port in docker-compose.yml
```

### Database Connection Issues

If the backend can't connect to the database:

```bash
# Check if PostgreSQL container is running
docker ps | grep postgres

# View PostgreSQL logs
docker logs loom-postgres
```

### Frontend Build Errors

If the frontend fails to build:

```bash
# Remove node_modules and rebuild
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

- [API Reference](api-reference.md) - Learn about the REST API
- [Integration Guide](integration.md) - Integrate Loom with your applications
- [Deployment Guide](deployment.md) - Deploy Loom to production

[← Back to Home](index.md)
