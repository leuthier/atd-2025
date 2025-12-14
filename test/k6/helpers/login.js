import http from 'k6/http';
import { getBaseUrl } from './baseUrl.js';

export function login(userEmail, userPassword) {
    const url = `${getBaseUrl()}/auth/login`;
    const payload = JSON.stringify({
        email: userEmail,
        password: userPassword,
    });
    const params = {
        headers: { 'Content-Type': 'application/json' },
    };

    const res = http.post(
        url,
        payload,
        params
    );

    const token = res.json('data.token');

    
    return token;
}