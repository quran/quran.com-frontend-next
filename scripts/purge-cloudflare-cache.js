/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */

const request = require('superagent');

const CF_AUTH_KEY = process.argv[2];
const CF_ZONE_ID = process.argv[3];

console.log('Cloudflare cache purging process started...');
console.log(`CF_AUTH_KEY = ${CF_AUTH_KEY}, CF_ZONE_ID=${CF_ZONE_ID}`);
// request
//   .post(`https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache`)
//   .send({ purge_everything: true })
//   .set({
//     'Content-Type': 'application/json',
//     Authorization: `Bearer ${CF_AUTH_KEY}`,
//   })
//   .then(() => {
//     console.log('Cloudflare cache purged successfully!');
//   })
//   .catch((error) => {
//     const test = JSON.parse(error.response.text);
//     throw Error(
//       `Cloudflare cache purging error (${test.errors[0].code}) ${test.errors[0].message}`,
//     );
//   });
