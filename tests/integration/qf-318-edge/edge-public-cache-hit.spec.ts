import { test, expect } from '@playwright/test';

import { isProdEdgeBaseUrl, getEdgeCacheHeader, sleep } from '@/tests/helpers/qf318-edge';

test.describe('QF-318 (prod) — edge cache public HIT', () => {
  test.skip(!isProdEdgeBaseUrl(), 'Requires PLAYWRIGHT_TEST_BASE_URL=https://ssr.quran.com');

  test(
    'Same public URL bucket eventually becomes HIT',
    { tag: ['@edge-smoke'] },
    async ({ request }) => {
      const url = `/vi/1?__edge_smoke=${Date.now()}-${Math.random().toString(16).slice(2)}`;

      const res1 = await request.get(url, { headers: { accept: 'text/html' } });
      expect(res1.ok()).toBe(true);

      let last: string | undefined;
      for (let attempt = 0; attempt < 4; attempt += 1) {
        await sleep(300);
        const res = await request.get(url, { headers: { accept: 'text/html' } });
        expect(res.ok()).toBe(true);
        last = getEdgeCacheHeader(res);
        if (last === 'HIT') return;
      }

      throw new Error(`Expected eventual HIT but got: ${last || '<missing>'}`);
    },
  );
});

