import { test, expect } from '@playwright/test';

import { loginWithEmail } from '@/tests/helpers/auth';
import { isProdEdgeBaseUrl, sleep } from '@/tests/helpers/qf318-edge';

test.describe('QF-318 (prod) — private page can be cached per-user', () => {
  test.skip(!isProdEdgeBaseUrl(), 'Requires PLAYWRIGHT_TEST_BASE_URL=https://ssr.quran.com');

  test(
    'After login, private page bucket eventually becomes HIT',
    { tag: ['@edge-smoke'] },
    async ({ page }) => {
      test.skip(
        !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD,
        'Missing TEST_USER_EMAIL/TEST_USER_PASSWORD',
      );

      await loginWithEmail(page, {
        email: process.env.TEST_USER_EMAIL || '',
        password: process.env.TEST_USER_PASSWORD || '',
      });

      const url = `/vi/profile?__edge_smoke=${Date.now()}-${Math.random().toString(16).slice(2)}`;

      const res1 = await page.goto(url, { waitUntil: 'domcontentloaded' });
      expect(res1).toBeTruthy();
      expect(res1!.status()).toBeGreaterThanOrEqual(200);
      expect(res1!.status()).toBeLessThan(400);

      let last: string | undefined;
      for (let attempt = 0; attempt < 4; attempt += 1) {
        await sleep(400);
        const res = await page.goto(url, { waitUntil: 'domcontentloaded' });
        last = res?.headers()['x-qdc-edge-cache'];
        if (last === 'HIT') return;
      }

      throw new Error(`Expected eventual HIT on private route but got: ${last || '<missing>'}`);
    },
  );
});
