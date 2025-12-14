import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { getBaseUrl } from './helpers/baseUrl.js';
import { generateRandomEmail } from './helpers/randomData.js';
import { login } from './helpers/login.js';

let responseLogin = null;

export const options = {
  vus: 10,
  duration: '15s',
  thresholds: {
    http_req_duration: ['p(90)<=1000', 'p(95)<=1000'], // 90% of requests must complete below 1s and 95% below 1s
    http_req_failed: ['rate<0.2'], // error rate must be less than 20%
  }
};


export default function() {
  const email = generateRandomEmail();
  const password = 'password123';
  let responseRegisterUser = null;

  group('Register', function() {
    responseRegisterUser = http.post(
      `${getBaseUrl()}/auth/register`,
      JSON.stringify({
        email: email,
        password: password,
        name: 'John Doe'
      }),
      {
          headers: {
              'Content-Type': 'application/json'
          },
    });
    check(responseRegisterUser, {
      'Register done! Status must be 201': (res) => res.status === 201
    });
  });

  group('Login', function() {
    responseLogin = login(email, password);

    check(responseLogin, {
        // 'Login - Status must be 200': (res) => res.status === 200,
        // 'Login - Success': (res) => res.json('success') === true,
        // 'Login - Has token': (res) => !!res.json('data.token')
        'Login - Token must exist': (t) => !!t
    })
  });

  // cmd - npm run start-rest
  // cmd - k6 run test/k6/register_and_login.test.js
  // gitbash
  // K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_OPEN=true K6_WEB_DASHBOARD_EXPORT=test/k6/reports/dashboard-report.html K6_WEB_DASHBOARD_PERIOD=2s k6 run -e BASE_URL=http://localhost:3000 test/k6/register_and_login.test.js
  
  
  sleep(1);
}