import http from 'k6/http';
import { getBaseUrl } from './baseUrl.js';

export function postCall(resource, payload) {
    let res = http.post(
        `${getBaseUrl()}${resource}`,
        JSON.stringify(payload),
        { headers: { 'Content-Type': 'application/json' } }
    );
    return res;
}

// Example usage:
// postCall('/auth/login', payload);
// postCall('auth/register', payload);