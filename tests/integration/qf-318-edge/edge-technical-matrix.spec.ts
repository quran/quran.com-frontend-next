import { test, expect, type APIResponse } from '@playwright/test';

import {
  extractNextDataJson,
  getEdgeCacheHeader,
  getEdgeCacheKeyHeader,
  isProdEdgeBaseUrl,
  sleep,
} from '@/tests/helpers/qf318-edge';

const buildMatrixToken = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const parseEdgeCacheKey = (res: APIResponse): URL => {
  const raw = getEdgeCacheKeyHeader(res);
  expect(raw).toBeTruthy();
  return new URL(raw || 'https://ssr.quran.com');
};

const expectNoEdgeCacheHeaders = (res: APIResponse) => {
  expect(getEdgeCacheHeader(res)).toBeUndefined();
  expect(getEdgeCacheKeyHeader(res)).toBeUndefined();
};

test.describe('QF-318 (prod) — edge technical matrix', () => {
  test.skip(!isProdEdgeBaseUrl(), 'Requires PLAYWRIGHT_TEST_BASE_URL=https://ssr.quran.com');

  test(
    'Guest HTML (supported non-en) uses locale-country guest bucket (__qdc_d=vi, __qdc_c=US)',
    { tag: ['@edge-matrix'] },
    async ({ request }) => {
      const token = buildMatrixToken();
      const res = await request.get(`/vi/53?__edge_matrix=${token}`, {
        headers: {
          accept: 'text/html',
          'accept-language': 'vi-VN,vi;q=0.9,en;q=0.8',
        },
      });
      expect(res.status()).toBeGreaterThanOrEqual(200);
      expect(res.status()).toBeLessThan(500);

      const cacheKey = parseEdgeCacheKey(res);
      expect(cacheKey.searchParams.get('__qdc_l')).toBe('vi');
      expect(cacheKey.searchParams.get('__qdc_d')).toBe('vi');
      expect(cacheKey.searchParams.get('__qdc_c')).toBe('US');
      expect(cacheKey.searchParams.get('__qdc_p')).toBeNull();
    },
  );

  test(
    'Guest HTML with prefs cookie uses __qdc_p bucket and omits __qdc_d/__qdc_c',
    { tag: ['@edge-matrix'] },
    async ({ request }) => {
      const token = buildMatrixToken();
      const res = await request.get(`/vi/53?__edge_matrix=${token}`, {
        headers: {
          accept: 'text/html',
          cookie: 'QDC_PREFS_KEY=demo123; QDC_PREFS_VER=1',
        },
      });
      expect(res.status()).toBeGreaterThanOrEqual(200);
      expect(res.status()).toBeLessThan(500);

      const cacheKey = parseEdgeCacheKey(res);
      expect(cacheKey.searchParams.get('__qdc_l')).toBe('vi');
      expect(cacheKey.searchParams.get('__qdc_p')).toBe('demo123');
      expect(cacheKey.searchParams.get('__qdc_d')).toBeNull();
      expect(cacheKey.searchParams.get('__qdc_c')).toBeNull();
    },
  );

  test(
    'Private HTML with id + prefs includes both __qdc_u and __qdc_p',
    { tag: ['@edge-matrix'] },
    async ({ request }) => {
      const token = buildMatrixToken();
      const res = await request.get(`/vi/profile?__edge_matrix=${token}`, {
        headers: {
          accept: 'text/html',
          cookie: 'id=111; QDC_PREFS_KEY=demo123; QDC_PREFS_VER=1',
        },
        maxRedirects: 0,
      });

      const cacheKey = parseEdgeCacheKey(res);
      expect(cacheKey.searchParams.get('__qdc_l')).toBe('vi');
      expect(cacheKey.searchParams.get('__qdc_p')).toBe('demo123');
      expect(cacheKey.searchParams.get('__qdc_u')).toBeTruthy();
    },
  );

  test(
    'Private HTML without user cookie bypasses snippet caching',
    { tag: ['@edge-matrix'] },
    async ({ request }) => {
      const token = buildMatrixToken();
      const res = await request.get(`/vi/profile?__edge_matrix=${token}`, {
        headers: { accept: 'text/html' },
        maxRedirects: 0,
      });
      expectNoEdgeCacheHeaders(res);
    },
  );

  test(
    'Token query bypasses snippet caching',
    { tag: ['@edge-matrix'] },
    async ({ request }) => {
      const token = buildMatrixToken();
      const res = await request.get(`/vi/1?token=fake&__edge_matrix=${token}`, {
        headers: { accept: 'text/html' },
        maxRedirects: 0,
      });
      expectNoEdgeCacheHeaders(res);
    },
  );

  test(
    'Manual non-default locale redirect uses redirect cache key (__qdc_t=redir)',
    { tag: ['@edge-matrix'] },
    async ({ request }) => {
      const token = buildMatrixToken();
      const res = await request.get(`/?__edge_matrix=${token}`, {
        headers: {
          accept: 'text/html',
          cookie: 'QDC_MANUAL_LOCALE=1; NEXT_LOCALE=es',
        },
        maxRedirects: 0,
      });

      const location = res.headers().location;
      expect(location).toContain('/es');

      const cacheKey = parseEdgeCacheKey(res);
      expect(cacheKey.searchParams.get('__qdc_t')).toBe('redir');
      expect(cacheKey.searchParams.get('__qdc_m')).toBe('1');
      expect(cacheKey.searchParams.get('__qdc_ml')).toBe('es');
    },
  );

  test(
    'Manual default locale (en) does not force /en redirect bucket',
    { tag: ['@edge-matrix'] },
    async ({ request }) => {
      const token = buildMatrixToken();
      const res = await request.get(`/?__edge_matrix=${token}`, {
        headers: {
          accept: 'text/html',
          cookie: 'QDC_MANUAL_LOCALE=1; NEXT_LOCALE=en',
        },
        maxRedirects: 0,
      });

      const location = res.headers().location || '';
      expect(location).not.toMatch(/^\/en(?:\/|$)/);

      const cacheKey = parseEdgeCacheKey(res);
      expect(cacheKey.searchParams.get('__qdc_t')).not.toBe('redir');
      expect(cacheKey.searchParams.get('__qdc_l')).toBe('en');
    },
  );

  test(
    'Allowlisted content API uses api cache key and eventually becomes HIT',
    { tag: ['@edge-matrix'] },
    async ({ request }) => {
      const token = buildMatrixToken();
      const url = `/api/proxy/content/api/qdc/resources/country_language_preference?user_device_language=vi&country=VN&__edge_matrix=${token}`;

      let hit = false;
      for (let attempt = 0; attempt < 4; attempt += 1) {
        await sleep(300);
        const res = await request.get(url, {
          headers: {
            accept: 'application/json',
            referer: 'https://ssr.quran.com/vi',
          },
        });

        if (![200, 304].includes(res.status())) {
          const body = await res.text();
          throw new Error(`Unexpected status ${res.status()}: ${body.slice(0, 200)}`);
        }

        const cacheKey = parseEdgeCacheKey(res);
        expect(cacheKey.searchParams.get('__qdc_t')).toBe('api');

        if (getEdgeCacheHeader(res) === 'HIT') {
          hit = true;
          break;
        }
      }

      expect(hit).toBe(true);
    },
  );

  test(
    'Non-allowlisted content API path bypasses snippet API caching',
    { tag: ['@edge-matrix'] },
    async ({ request }) => {
      const token = buildMatrixToken();
      const res = await request.get(
        `/api/proxy/content/api/qdc/resources/translationsx?language=vi&__edge_matrix=${token}`,
        {
          headers: { accept: 'application/json' },
          maxRedirects: 0,
        },
      );

      expect(res.status()).toBeGreaterThanOrEqual(200);
      expect(res.status()).toBeLessThan(500);
      expectNoEdgeCacheHeaders(res);
    },
  );

  test(
    '_next/data private request with id+prefs includes __qdc_t=data + __qdc_u + __qdc_p',
    { tag: ['@edge-matrix'] },
    async ({ request }) => {
      const token = buildMatrixToken();
      const htmlRes = await request.get(`/vi/1?__edge_matrix=${token}`, {
        headers: { accept: 'text/html' },
      });
      expect(htmlRes.ok()).toBe(true);

      const nextData = extractNextDataJson(await htmlRes.text());
      const buildId = nextData?.buildId;
      expect(buildId).toBeTruthy();

      const dataRes = await request.get(`/_next/data/${buildId}/vi/profile.json?__edge_matrix=${token}`, {
        headers: {
          accept: 'application/json',
          cookie: 'id=111; QDC_PREFS_KEY=demo123; QDC_PREFS_VER=1',
        },
        maxRedirects: 0,
      });
      expect(dataRes.status()).toBeGreaterThanOrEqual(200);
      expect(dataRes.status()).toBeLessThan(500);

      const cacheKey = parseEdgeCacheKey(dataRes);
      expect(cacheKey.searchParams.get('__qdc_t')).toBe('data');
      expect(cacheKey.searchParams.get('__qdc_l')).toBe('vi');
      expect(cacheKey.searchParams.get('__qdc_p')).toBe('demo123');
      expect(cacheKey.searchParams.get('__qdc_u')).toBeTruthy();
    },
  );

  test(
    'English guest bucket uses real country code shape (__qdc_c is 2-letter country)',
    { tag: ['@edge-matrix'] },
    async ({ request }) => {
      const token = buildMatrixToken();
      const res = await request.get(`/en/53?__edge_matrix=${token}`, {
        headers: {
          accept: 'text/html',
          'accept-language': 'en-US,en;q=0.9',
        },
        maxRedirects: 0,
      });
      expect(res.status()).toBeGreaterThanOrEqual(200);
      expect(res.status()).toBeLessThan(500);

      const cacheKey = parseEdgeCacheKey(res);
      expect(cacheKey.searchParams.get('__qdc_l')).toBe('en');
      expect(cacheKey.searchParams.get('__qdc_d')).toBe('en');
      expect(cacheKey.searchParams.get('__qdc_c')).toMatch(/^[A-Z]{2}$/);
    },
  );

  test(
    'Login route (/login) bypasses snippet caching',
    { tag: ['@edge-matrix'] },
    async ({ request }) => {
      const token = buildMatrixToken();
      const res = await request.get(`/login?__edge_matrix=${token}`, {
        headers: { accept: 'text/html' },
        maxRedirects: 0,
      });

      expectNoEdgeCacheHeaders(res);
    },
  );
});
