import { test, expect, type APIResponse } from '@playwright/test';

import { getEdgeCacheKeyHeader, isProdEdgeBaseUrl } from '@/tests/helpers/qf318-edge';

const parseEdgeCacheKey = (res: APIResponse): URL => {
  const raw = getEdgeCacheKeyHeader(res);
  expect(raw).toBeTruthy();
  return new URL(raw || 'https://ssr.quran.com');
};

test.describe('QF-318 (prod) — public cache key invariance', () => {
  test.skip(!isProdEdgeBaseUrl(), 'Requires PLAYWRIGHT_TEST_BASE_URL=https://ssr.quran.com');

  test(
    'Public page key is invariant with/without auth cookie (no __qdc_u)',
    { tag: ['@edge-matrix'] },
    async ({ request }) => {
      const token = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const path = `/vi/53?__edge_pubkey=${token}`;

      const guest = await request.get(path, {
        headers: {
          accept: 'text/html',
          'accept-language': 'vi-VN,vi;q=0.9,en;q=0.8',
        },
      });
      const withAuthCookie = await request.get(path, {
        headers: {
          accept: 'text/html',
          'accept-language': 'vi-VN,vi;q=0.9,en;q=0.8',
          cookie: 'id=111',
        },
      });

      const guestKey = parseEdgeCacheKey(guest);
      const authKey = parseEdgeCacheKey(withAuthCookie);

      expect(guestKey.toString()).toBe(authKey.toString());
      expect(guestKey.searchParams.get('__qdc_u')).toBeNull();
      expect(authKey.searchParams.get('__qdc_u')).toBeNull();
    },
  );

  test(
    'Public page key is invariant with/without auth cookie when prefsKey is present',
    { tag: ['@edge-matrix'] },
    async ({ request }) => {
      const token = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const path = `/vi/53?__edge_pubkey=${token}`;

      const guestWithPrefs = await request.get(path, {
        headers: {
          accept: 'text/html',
          cookie: 'QDC_PREFS_KEY=demo123; QDC_PREFS_VER=1',
        },
      });

      const authWithPrefs = await request.get(path, {
        headers: {
          accept: 'text/html',
          cookie: 'id=111; QDC_PREFS_KEY=demo123; QDC_PREFS_VER=1',
        },
      });

      const guestKey = parseEdgeCacheKey(guestWithPrefs);
      const authKey = parseEdgeCacheKey(authWithPrefs);

      expect(guestKey.toString()).toBe(authKey.toString());
      expect(guestKey.searchParams.get('__qdc_p')).toBe('demo123');
      expect(authKey.searchParams.get('__qdc_p')).toBe('demo123');
      expect(guestKey.searchParams.get('__qdc_u')).toBeNull();
      expect(authKey.searchParams.get('__qdc_u')).toBeNull();
    },
  );
});
