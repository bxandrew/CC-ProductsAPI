import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { randomIntBetween, randomItem } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";
import { URL } from 'https://jslib.k6.io/url/1.0.0/index.js';

// export const options = {
//   vus: 10,
//   duration: '30s',
// };

export const options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 1000,
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 1000,
      maxVUs: 1000,
    },
  },
};

export default function () {
  const url = new URL('http://localhost:3000/products');

  let randomPage = randomIntBetween(1, 10000);
  let randomCount = randomIntBetween(5, 100);

  url.searchParams.append('page', randomPage); // Any page
  url.searchParams.append('count', randomCount); // Any count up to 1000

  http.get(url.toString());
  // sleep(1);
}