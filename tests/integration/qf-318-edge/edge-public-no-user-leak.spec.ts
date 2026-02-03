import { test, expect } from '@playwright/test';

import { loginWithEmail } from '@/tests/helpers/auth';
import { isProdEdgeBaseUrl } from '@/tests/helpers/qf318-edge';
import { TestId } from '@/tests/test-ids';

test.describe('QF-318 (prod) — public HTML does not leak user identity', () => {
  test.skip(!isProdEdgeBaseUrl(), 'Requires PLAYWRIGHT_TEST_BASE_URL=https://ssr.quran.com');

  test(
    'Logged-in HTML for public page does not include user email or profile avatar SSR marker',
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

      const res = await page.request.get('/vi/1?__edge_smoke=no-user-leak', {
        headers: { accept: 'text/html' },
      });
      expect(res.ok()).toBe(true);

      const html = await res.text();
      expect(html).not.toContain(process.env.TEST_USER_EMAIL || '');
      expect(html).not.toContain(TestId.PROFILE_AVATAR_BUTTON);
    },
  );
});
