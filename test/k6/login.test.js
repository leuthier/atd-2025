import http from 'k6/http';
import { check, sleep } from 'k6';
import { getBaseUrl } from './helpers/baseUrl.js';
import { SharedArray } from 'k6/data';

const users = new SharedArray('users', function () {
    return JSON.parse(open('./data/login.test.data.json'));
});

export let options = {
    vus: 7,
    iterations: 7,
    thresholds: {
        http_req_duration: ['p(95)<2000'], // 95% das requisições devem ser menores que 2s
    },
}

export default function () {

    //const user = users[__VU - 1]; // Numero VUS igual ao numero de itens no JSON
    const user = users[(__VU - 1) % users.length]; // Reaproveita usuarios se VUs exceder usuarios  

    const url = `${getBaseUrl()}/auth/login`;
    const payload = JSON.stringify({
        email: user.email,
        password: user.password,
    });
    const params = { headers: { 'Content-Type': 'application/json' } };
    
    // console.log(`VU: ${__VU} - Logging in with ${user.email}`);

    const res = http.post(
        url,
        payload,
        params
    );

    check(res, {
        'Login - Status is 200': (r) => r.status === 200,
        'Login - Success true': (r) => r.json('success') === true,
        'Login - Has token': (r) => !!r.json('data.token'),
    });
    sleep(1)
}