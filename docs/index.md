---
layout: default
title: Home
---

# Loom - Log Aggregation System

A modern, full-featured log aggregation system built with Spring Boot and Angular, featuring real-time search, filtering, and a beautiful dark-mode UI.

## Features

- **🔍 Full-Text Search**: Search through log messages with instant results
- **📅 Date Range Filtering**: Filter logs by time range with precision
- **🎨 Modern UI**: Beautiful dark-mode interface with glassmorphism effects
- **🔐 Secure Authentication**: JWT-based authentication system
- **📊 Pagination**: Efficient handling of large log datasets
- **🚀 High Performance**: Built on Spring Boot with optimized queries
- **🐳 Docker Ready**: Complete Docker Compose setup for easy deployment

## Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/loom.git
cd loom

# Start the application
docker-compose up --build

# Access the application
open http://localhost
```

**Default Credentials:**
- Username: `testuser`
- Password: `password`

## Architecture

Loom consists of three main components:

- **Backend**: Spring Boot REST API with PostgreSQL database
- **Frontend**: Angular 17 application with Tailwind CSS
- **Nginx**: Reverse proxy for routing and load balancing

## Screenshots

### Dashboard
The main dashboard provides a comprehensive view of all logs with advanced filtering capabilities.

### Search & Filter
Real-time search with support for level, source, and date range filtering.

## Documentation

- [Getting Started Guide](getting-started.md)
- [API Reference](api-reference.md)
- [Integration Guide](integration.md)
- [Deployment Guide](deployment.md)

## Technology Stack

**Backend:**
- Spring Boot 3.2
- Spring Security with JWT
- PostgreSQL 16
- JPA/Hibernate

**Frontend:**
- Angular 17
- Tailwind CSS
- RxJS

**DevOps:**
- Docker & Docker Compose
- Nginx
- Flyway (Database Migrations)

## License

This project is licensed under the MIT License.
