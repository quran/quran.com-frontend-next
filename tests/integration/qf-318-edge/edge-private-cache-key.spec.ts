import { test, expect } from '@playwright/test';

import {
  getEdgeCacheKeyHeader,
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
});

