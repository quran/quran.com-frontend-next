import { test, expect } from '@playwright/test';

const isLocalBaseUrl = () => {
  const base = process.env.PLAYWRIGHT_TEST_BASE_URL;
  return !base || base.includes('localhost') || base.includes('127.0.0.1');
};

test.describe('QF-318 (local) — SSR responses should not Set-Cookie by default', () => {
  test.skip(!isLocalBaseUrl(), 'Local deterministic test (requires localhost baseURL)');

  test(
    'Document SSR response for a normal page does not include Set-Cookie',
    { tag: ['@qf318-cache', '@headers'] },
    async ({ request }) => {
      const res = await request.get('/en/1', { headers: { accept: 'text/html' } });
      expect(res.ok()).toBe(true);

      const headers = res.headersArray();
      const setCookies = headers.filter((h) => h.name.toLowerCase() === 'set-cookie');
      expect(setCookies).toHaveLength(0);
    },
  );
});
