import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 50 }, // Ramp up to 50 users
        { duration: '1m', target: 50 },  // Stay at 50 users
        { duration: '30s', target: 0 },  // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    },
};

const BASE_URL = 'http://localhost/api';

export default function () {
    // 1. Register/Login (simulated by using a pre-seeded user or registering a new one per VU)
    // For simplicity, we use the pre-seeded 'testuser'

    const loginPayload = JSON.stringify({
        username: 'testuser',
        password: 'password',
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const loginRes = http.post(`${BASE_URL}/auth/login`, loginPayload, params);

    check(loginRes, {
        'login successful': (r) => r.status === 200,
        'has token': (r) => r.json('token') !== undefined,
    });

    const token = loginRes.json('token');

    const authParams = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    };

    // 2. Post a log
    const logPayload = JSON.stringify({
        source: 'k6-load-test',
        level: 'INFO',
        message: 'Load test log message',
    });

    const postRes = http.post(`${BASE_URL}/logs`, logPayload, authParams);

    check(postRes, {
        'post log successful': (r) => r.status === 200,
    });

    // 3. Get logs
    const getRes = http.get(`${BASE_URL}/logs?page=0&size=10`, authParams);

    check(getRes, {
        'get logs successful': (r) => r.status === 200,
    });

    sleep(1);
}
