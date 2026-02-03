#!/usr/bin/env node
/**
 * Purge Cloudflare cache for ssr.quran.com (best-effort).
 *
 * Usage:
 *   CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ZONE_ID=... node scripts/cloudflare/purge-ssr-cache.mjs
 *
 * Optional:
 *   CLOUDFLARE_HOSTNAME=ssr.quran.com
 */

const zoneId = process.env.CLOUDFLARE_ZONE_ID;
const token = process.env.CLOUDFLARE_API_TOKEN;
const hostname = process.env.CLOUDFLARE_HOSTNAME || 'ssr.quran.com';

if (!zoneId || !token) {
  // eslint-disable-next-line no-console
  console.error('Missing CLOUDFLARE_ZONE_ID or CLOUDFLARE_API_TOKEN');
  process.exit(1);
}

const endpoint = `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`;

const res = await fetch(endpoint, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ hosts: [hostname] }),
});

const text = await res.text();
if (!res.ok) {
  // eslint-disable-next-line no-console
  console.error(`Purge failed: ${res.status} ${res.statusText}`);
  // eslint-disable-next-line no-console
  console.error(text);
  process.exit(1);
}

// eslint-disable-next-line no-console
console.log(`Purge succeeded for host ${hostname}`);
// eslint-disable-next-line no-console
console.log(text);
