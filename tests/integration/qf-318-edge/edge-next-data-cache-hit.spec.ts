import { test, expect } from '@playwright/test';

import {
  extractNextDataJson,
  getEdgeCacheHeader,
  isProdEdgeBaseUrl,
  sleep,
} from '@/tests/helpers/qf318-edge';

test.describe('QF-318 (prod) — _next/data cache', () => {
  test.skip(!isProdEdgeBaseUrl(), 'Requires PLAYWRIGHT_TEST_BASE_URL=https://ssr.quran.com');

  test('_next/data JSON becomes HIT after warm', { tag: ['@edge-smoke'] }, async ({ request }) => {
    const token = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const htmlRes = await request.get(`/vi/1?__edge_smoke=${token}`, {
      headers: { accept: 'text/html' },
    });
    expect(htmlRes.ok()).toBe(true);

    const html = await htmlRes.text();
    const nextData = extractNextDataJson(html);
    const buildId = nextData?.buildId;
    expect(buildId).toBeTruthy();

    const dataUrl = `/_next/data/${buildId}/vi/1.json?__edge_smoke=${token}`;

    let last: string | undefined;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      await sleep(300);
      const res = await request.get(dataUrl, { headers: { accept: 'application/json' } });
      expect(res.ok()).toBe(true);
      last = getEdgeCacheHeader(res);
      if (last === 'HIT') return;
    }

    throw new Error(`Expected _next/data to become HIT but got: ${last || '<missing>'}`);
  });
});
