---
layout: default
title: Deployment Guide
---

# Deployment Guide

Deploy Loom to production environments.

## Production Considerations

### Security

1. **Change Default Credentials**

Update the database migration to use a secure password:

```sql
-- backend/src/main/resources/db/migration/V3__update_test_user_password.sql
UPDATE users 
SET password_hash = '$2a$10$YOUR_SECURE_HASH_HERE' 
WHERE username = 'admin';
```

2. **JWT Secret**

Set a strong JWT secret in `application.properties`:

```properties
loom.app.jwtSecret=YOUR_VERY_LONG_RANDOM_SECRET_HERE_AT_LEAST_64_CHARACTERS
loom.app.jwtExpirationMs=86400000
```

3. **HTTPS**

Configure Nginx with SSL certificates:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # ... rest of config
}
```

### Environment Variables

Create a `.env` file for production:

```env
# Database
POSTGRES_DB=loom
POSTGRES_USER=loom
POSTGRES_PASSWORD=secure_password_here

# Backend
JWT_SECRET=your_jwt_secret_here
SPRING_PROFILES_ACTIVE=prod

# Frontend
API_URL=https://your-domain.com/api
```

Update `docker-compose.yml` to use these variables:

```yaml
services:
  postgres:
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
```

---

## Docker Deployment

### Using Docker Compose

1. **Clone the repository on your server**

```bash
git clone https://github.com/yourusername/loom.git
cd loom
```

2. **Create production environment file**

```bash
cp .env.example .env
# Edit .env with your production values
```

3. **Build and start**

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Docker Compose Production Configuration

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16
    restart: always
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - loom-network

  backend-1:
    build: ./backend
    restart: always
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/${POSTGRES_DB}
      SPRING_DATASOURCE_USERNAME: ${POSTGRES_USER}
      SPRING_DATASOURCE_PASSWORD: ${POSTGRES_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres
    networks:
      - loom-network

  backend-2:
    build: ./backend
    restart: always
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/${POSTGRES_DB}
      SPRING_DATASOURCE_USERNAME: ${POSTGRES_USER}
      SPRING_DATASOURCE_PASSWORD: ${POSTGRES_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres
    networks:
      - loom-network

  frontend:
    build: ./frontend
    restart: always
    networks:
      - loom-network

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend-1
      - backend-2
    networks:
      - loom-network

volumes:
  postgres_data:

networks:
  loom-network:
    driver: bridge
```

---

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (1.20+)
- kubectl configured
- Helm (optional)

### Deployment Files

Create `k8s/` directory with the following files:

#### Namespace

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: loom
```

#### PostgreSQL

```yaml
# k8s/postgres.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: loom
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: loom
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:16
        env:
        - name: POSTGRES_DB
          value: loom
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: loom-secrets
              key: db-user
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: loom-secrets
              key: db-password
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: loom
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
```

#### Backend

```yaml
# k8s/backend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: loom
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: your-registry/loom-backend:latest
        env:
        - name: SPRING_DATASOURCE_URL
          value: jdbc:postgresql://postgres:5432/loom
        - name: SPRING_DATASOURCE_USERNAME
          valueFrom:
            secretKeyRef:
              name: loom-secrets
              key: db-user
        - name: SPRING_DATASOURCE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: loom-secrets
              key: db-password
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: loom-secrets
              key: jwt-secret
        ports:
        - containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: loom
spec:
  selector:
    app: backend
  ports:
  - port: 8080
    targetPort: 8080
```

#### Deploy

```bash
# Create secrets
kubectl create secret generic loom-secrets \
  --from-literal=db-user=loom \
  --from-literal=db-password=secure_password \
  --from-literal=jwt-secret=your_jwt_secret \
  -n loom

# Apply configurations
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress.yaml
```

---

## Cloud Platforms

### AWS ECS

Use the provided `docker-compose.yml` with ECS CLI:

```bash
ecs-cli compose --file docker-compose.prod.yml up
```

### Google Cloud Run

Deploy each service separately:

```bash
# Backend
gcloud run deploy loom-backend \
  --image gcr.io/your-project/loom-backend \
  --platform managed \
  --region us-central1

# Frontend
gcloud run deploy loom-frontend \
  --image gcr.io/your-project/loom-frontend \
  --platform managed \
  --region us-central1
```

### Azure Container Instances

```bash
az container create \
  --resource-group loom-rg \
  --name loom \
  --image your-registry/loom:latest \
  --dns-name-label loom \
  --ports 80
```

---

## Monitoring

### Health Checks

Backend health endpoint:
```
GET /actuator/health
```

### Logging

View container logs:

```bash
# Docker
docker logs loom-backend-1

# Kubernetes
kubectl logs -f deployment/backend -n loom
```

### Metrics

Enable Spring Boot Actuator metrics:

```properties
management.endpoints.web.exposure.include=health,metrics,prometheus
```

---

## Backup

### Database Backup

```bash
# Backup
docker exec loom-postgres pg_dump -U loom loom > backup.sql

# Restore
docker exec -i loom-postgres psql -U loom loom < backup.sql
```

### Automated Backups

Add to crontab:

```bash
0 2 * * * docker exec loom-postgres pg_dump -U loom loom | gzip > /backups/loom-$(date +\%Y\%m\%d).sql.gz
```

---

## Scaling

### Horizontal Scaling

Add more backend instances in `docker-compose.yml`:

```yaml
services:
  backend-3:
    # ... same config as backend-1
```

Nginx will automatically load balance across all instances.

### Vertical Scaling

Increase container resources:

```yaml
services:
  backend-1:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

[← Back to Home](index.md)
