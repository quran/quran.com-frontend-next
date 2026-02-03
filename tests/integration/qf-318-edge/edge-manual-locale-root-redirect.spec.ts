import { test, expect } from '@playwright/test';

import {
  extractNextDataJson,
  getEdgeCacheHeader,
  isProdEdgeBaseUrl,
  sleep,
} from '@/tests/helpers/qf318-edge';

test.describe('QF-318 (prod) — manual locale root redirect', () => {
  test.skip(!isProdEdgeBaseUrl(), 'Requires PLAYWRIGHT_TEST_BASE_URL=https://ssr.quran.com');

  test(
    'Root redirect honors QDC_MANUAL_LOCALE and eventually becomes HIT',
    { tag: ['@edge-smoke'] },
    async ({ request }) => {
      const qs = `__edge_smoke=${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const url = `/?${qs}`;
      const cookie = 'QDC_MANUAL_LOCALE=1; NEXT_LOCALE=es';

      const res1 = await request.get(url, {
        headers: { accept: 'text/html', cookie },
        maxRedirects: 0,
      });
      const loc1 = res1.headers().location;
      if (loc1) {
        expect(loc1).toContain('/es');
      } else {
        const html = await res1.text();
        expect(html).toContain('__NEXT_DATA__');
        const nextData = extractNextDataJson(html);
        const resolvedLocale = nextData?.locale || nextData?.defaultLocale;
        expect(resolvedLocale).toBe('es');
      }

      let last: string | undefined;
      for (let attempt = 0; attempt < 4; attempt += 1) {
        await sleep(300);
        const res = await request.get(url, {
          headers: { accept: 'text/html', cookie },
          maxRedirects: 0,
        });
        const loc = res.headers().location;
        if (loc) {
          expect(loc).toContain('/es');
        }
        last = getEdgeCacheHeader(res);
        if (last === 'HIT') return;
      }

      throw new Error(
        `Expected eventual HIT for manual locale redirect but got: ${last || '<missing>'}`,
      );
    },
  );
});
