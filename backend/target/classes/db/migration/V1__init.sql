CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    source VARCHAR(255) NOT NULL,
    level VARCHAR(50) NOT NULL,
    message VARCHAR(2048) NOT NULL,
    user_id INTEGER
);

-- Seed initial test user: testuser / password
-- Password hash for 'password' (bcrypt)
INSERT INTO users (username, password_hash, role) 
VALUES ('testuser', '$2a$10$wE/.7.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0', 'USER');
