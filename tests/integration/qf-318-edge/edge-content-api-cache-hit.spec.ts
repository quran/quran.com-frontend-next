import { test, expect } from '@playwright/test';

import { getEdgeCacheHeader, isProdEdgeBaseUrl, sleep } from '@/tests/helpers/qf318-edge';

test.describe('QF-318 (prod) — allowlisted content API cache', () => {
  test.skip(!isProdEdgeBaseUrl(), 'Requires PLAYWRIGHT_TEST_BASE_URL=https://ssr.quran.com');

  test(
    'country_language_preference endpoint becomes HIT and strips Set-Cookie',
    { tag: ['@edge-smoke'] },
    async ({ request }) => {
      const url = `/api/proxy/content/api/qdc/resources/country_language_preference?user_device_language=en&country=US`;

      let last: string | undefined;
      for (let attempt = 0; attempt < 4; attempt += 1) {
        await sleep(300);
        const res = await request.get(url, {
          headers: { accept: 'application/json', referer: 'https://ssr.quran.com/vi' },
        });
        if (![200, 304].includes(res.status())) {
          const body = await res.text();
          throw new Error(`Unexpected status ${res.status()}: ${body.slice(0, 200)}`);
        }
        last = getEdgeCacheHeader(res);
        if (last === 'HIT') {
          const headers = res.headers();
          const setCookie = headers['set-cookie'];
          if (setCookie) {
            const lower = setCookie.toLowerCase();
            const isCloudflareCookie =
              lower.includes('__cf_bm=') || lower.includes('cf_clearance=');
            expect(isCloudflareCookie).toBe(true);
            expect(lower).not.toContain('id=');
          }
          return;
        }
      }

      throw new Error(`Expected content API to become HIT but got: ${last || '<missing>'}`);
    },
  );
});
