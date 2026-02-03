import { test, expect } from '@playwright/test';

import { isProdEdgeBaseUrl } from '@/tests/helpers/qf318-edge';

test.describe('QF-318 (prod) — auth routes are not edge cached', () => {
  test.skip(!isProdEdgeBaseUrl(), 'Requires PLAYWRIGHT_TEST_BASE_URL=https://ssr.quran.com');

  test(
    '/auth never returns HIT',
    { tag: ['@edge-smoke'] },
    async ({ request }) => {
      const res = await request.get('/auth?token=fake', { headers: { accept: 'text/html' } });
      // /auth might redirect or error; this test only asserts we never cache it.
      const headers = res.headers();
      const edge = headers['x-qdc-edge-cache'];
      expect(edge).not.toBe('HIT');
    },
  );
});

