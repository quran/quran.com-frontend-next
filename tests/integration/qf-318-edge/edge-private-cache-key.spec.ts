import { test, expect } from '@playwright/test';

import {
  getEdgeCacheKeyHeader,
  extractNextDataJson,
  isProdEdgeBaseUrl,
} from '@/tests/helpers/qf318-edge';

test.describe('QF-318 (prod) — private pages use per-user cache keys', () => {
  test.skip(!isProdEdgeBaseUrl(), 'Requires PLAYWRIGHT_TEST_BASE_URL=https://ssr.quran.com');

  test(
    'Different id cookies produce different edge cache keys for private routes',
    { tag: ['@edge-smoke'] },
    async ({ request }) => {
      const url = `/vi/profile?__edge_smoke=${Date.now()}`;
      const base = 'QDC_PREFS_KEY=demo123; QDC_PREFS_VER=1';

      const res1 = await request.get(url, { headers: { accept: 'text/html', cookie: `${base}; id=111` } });
      const res2 = await request.get(url, { headers: { accept: 'text/html', cookie: `${base}; id=222` } });

      const key1 = getEdgeCacheKeyHeader(res1);
      const key2 = getEdgeCacheKeyHeader(res2);

      expect(key1).toBeTruthy();
      expect(key2).toBeTruthy();
      expect(key1).not.toBe(key2);
      expect(key1).toContain('__qdc_u=');
      expect(key2).toContain('__qdc_u=');
    },
  );

  test(
    'Private routes include userKey even without prefsKey (HTML + _next/data)',
    { tag: ['@edge-smoke'] },
    async ({ request }) => {
      const token = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const cookie = 'id=111';

      const htmlRes = await request.get(`/vi/profile?__edge_smoke=${token}`, {
        headers: { accept: 'text/html', cookie },
      });
      const htmlKey = getEdgeCacheKeyHeader(htmlRes);
      expect(htmlKey).toBeTruthy();
      expect(htmlKey).toContain('__qdc_u=');
      expect(htmlKey).not.toContain('__qdc_p=');

      const baseHtmlRes = await request.get(`/vi/1?__edge_smoke=${token}`, {
        headers: { accept: 'text/html' },
      });
      const nextData = extractNextDataJson(await baseHtmlRes.text());
      const buildId = nextData?.buildId;
      expect(buildId).toBeTruthy();

      const dataRes = await request.get(
        `/_next/data/${buildId}/vi/profile.json?__edge_smoke=${token}`,
        { headers: { accept: 'application/json', cookie } },
      );
      const dataKey = getEdgeCacheKeyHeader(dataRes);
      expect(dataKey).toBeTruthy();
      expect(dataKey).toContain('__qdc_u=');
      expect(dataKey).not.toContain('__qdc_p=');
    },
  );
});
