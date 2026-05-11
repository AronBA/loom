# Loom - Distributed Log Aggregation System

A distributed log aggregation system with a Spring Boot backend and Angular frontend. This system is designed for high availability with automated failover and health monitoring.

## Architecture

-   **Nginx**: Load balancer and reverse proxy with automated failover logic.
-   **Backend**: Dual Spring Boot instances (`backend-1`, `backend-2`) for horizontal scaling.
-   **Frontend**: Angular application served via Nginx.
-   **Database**: PostgreSQL for persistent log storage.

## Prerequisites

-   Docker
-   Docker Compose

## How to Run

The entire stack is containerized and pre-configured for high availability.

1.  **Start the application:**
    ```bash
    docker-compose up -d --build
    ```

2.  **Verify health status:**
    ```bash
    docker-compose ps
    ```
    Wait until `loom-backend-1` and `loom-backend-2` show as `(healthy)`.

3.  **Access the Application:**
    -   **Frontend Dashboard**: [http://localhost](http://localhost)
    -   **Backend API**: [http://localhost/api](http://localhost/api)
    -   **Health Check**: [http://localhost/api/actuator/health](http://localhost/api/actuator/health)

4.  **Stop the application:**
    ```bash
    docker-compose down
    ```

## High Availability & Failover

The system is configured to handle backend crashes gracefully. Nginx monitors the health of the backends and will automatically fail over if one instance becomes unresponsive.

### Simulating a Crash
To test the failover logic:
1.  Start a load test (see below).
2.  Kill one of the backend instances:
    ```bash
    docker kill loom-backend-1
    ```
3.  Observe that the system remains operational via `backend-2`.

## Testing

### Load Testing
A load test script is included to verify performance and failover resilience:
```bash
./scripts/loadtest.sh
```
*Note: Requires `hey` to be installed.*

### Log Generation
To generate sample logs for the dashboard:
```bash
python3 scripts/generate_random_logs.py
```

## Development

-   **Backend**: Located in `backend/`. Uses Spring Boot, Spring Security (JWT), and Flyway.
-   **Frontend**: Located in `frontend/`. Angular application with Tailwind CSS.
-   **Database**: PostgreSQL 18.

## Default User

-   **Username**: `testuser`
-   **Password**: `password`
