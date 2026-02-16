# Loom - Log Aggregation System

A distributed log aggregation system with a Spring Boot backend and Angular frontend.

## Prerequisites

-   Docker
-   Docker Compose

## How to Run

The entire stack (Frontend, Backend, Database, Nginx) is containerized.

1.  **Start the application:**
    ```bash
    docker-compose up -d --build
    ```
    *(The `--build` flag ensures you are running the latest version of the code)*

2.  **Check status:**
    ```bash
    docker-compose ps
    ```
    Wait until all containers (`loom-frontend`, `loom-backend`, `loom-postgres`, `nginx`) are `Up` or `healthy`.

3.  **Access the Application:**
    -   **Frontend Dashboard**: [http://localhost](http://localhost)
    -   **Backend API**: [http://localhost/api](http://localhost/api) (e.g., [http://localhost/api/actuator/health](http://localhost/api/actuator/health))

4.  **Stop the application:**
    ```bash
    docker-compose down
    ```

## Development

-   **Backend**: Located in `backend/`. Spring Boot application.
-   **Frontend**: Located in `frontend/`. Angular application.
-   **Database**: PostgreSQL 16.

## Default User

-   **Username**: `testuser`
-   **Password**: `password`

## Verification

You can run the included verification script to test the core functionality (Registration, Login, Logging, Search):
```bash
./verification_search.sh
```
