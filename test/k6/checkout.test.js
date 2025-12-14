import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { generateRandomEmail } from './helpers/randomData.js';
import { getBaseUrl } from './helpers/baseUrl.js';
import { login } from './helpers/login.js';
import faker from 'k6/x/faker';
import { Trend } from 'k6/metrics';

const postCheckoutDurationTrend = new Trend('post_checkout_duration');

export const options = {
  vus: 1, // Users testing in the same time
  // duration: '15s', // Using 'duration' and 'iterations' and 'stages' options simultaneously is not allowed
  // iterations: 1, // Num vezes o script foi executado no total (entre todos os VUs)
  thresholds: {
    http_req_duration: ['p(95)<9000'], // 95th percentile must be under 7s
    http_req_failed: ['rate<0.1']
  },
  stages: [
    { duration: '3s', target: 10 }, // Ramp up
    { duration: '15s', target: 10 }, // Average
    { duration: '2s', target: 100 }, // Spike to 100 users
    { duration: '3s', target: 100 }, // Spike hold
    { duration: '5s', target: 10 },  // Average
    { duration: '5s', target: 0 }  // Ramp down
  ]
};

export default function () {
  let email, password, name, token;

  group('Register', function () {
    email = generateRandomEmail();
    password = faker.internet.password();
    name = faker.person.firstName();
    
    const url = `${getBaseUrl()}/auth/register`;
    const payload = JSON.stringify({ email: email, password: password, name: name })
    const params = { headers: { 'Content-Type': 'application/json' } }
    
    const res = http.post(
      url,
      payload,
      params
    );

    check(res, {
      'register - status is 201': (r) => r.status === 201,
      'register - success true': (r) => r.json('success') === true
    });
  });

  group('Login', function () {
    token = login(email, password);

    check(token, {
      // login.test.js already check login, so only need to check if token exists here
      // 'login - status is 200': (r) => r.status === 200,
      // 'login - success true': (r) => r.json('success') === true,
      // 'login - has token': (r) => !!r.json('data.token')
      'token exists': (t) => !!t
    });

  });

  group('Checkout', function () {
    const url = `${getBaseUrl()}/checkout`;
    const payload = JSON.stringify({
      items: [{ productId: 1, quantity: 1 }],
      paymentMethod: 'cash'
    });

    const params = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
    }

    const res = http.post(url, payload, params);
    // console.log(`Token: ${token}`);
    // console.log(`Checkout response: ${res.body}`);

    check(res, {
      'checkout - status is 200': (r) => r.status === 200,
      'checkout - success true': (r) => r.json('success') === true
    });

    postCheckoutDurationTrend.add(res.timings.duration);

  });

  sleep(1);
}
