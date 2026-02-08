import { test, expect, type APIResponse } from '@playwright/test';

import { getEdgeCacheHeader, getEdgeCacheKeyHeader, isProdEdgeBaseUrl } from '@/tests/helpers/qf318-edge';

const expectSnippetBypass = (res: APIResponse) => {
  expect(getEdgeCacheHeader(res)).toBeUndefined();
  expect(getEdgeCacheKeyHeader(res)).toBeUndefined();
};

test.describe('QF-318 (prod) — method and allowlist bypass coverage', () => {
  test.skip(!isProdEdgeBaseUrl(), 'Requires PLAYWRIGHT_TEST_BASE_URL=https://ssr.quran.com');

  test(
    'Non-GET methods bypass snippet caching logic',
    { tag: ['@edge-matrix'] },
    async ({ request }) => {
      const token = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

      const postRes = await request.post(`/vi/1?__edge_method=${token}`, {
        headers: { accept: 'text/html', 'content-type': 'application/json' },
        data: { ping: 'pong' },
        failOnStatusCode: false,
      });
      expectSnippetBypass(postRes);

      const headRes = await request.fetch(`/vi/1?__edge_method=${token}`, {
        method: 'HEAD',
        headers: { accept: 'text/html' },
        failOnStatusCode: false,
      });
      expectSnippetBypass(headRes);

      const optionsRes = await request.fetch(`/vi/1?__edge_method=${token}`, {
        method: 'OPTIONS',
        headers: { accept: '*/*' },
        failOnStatusCode: false,
      });
      expectSnippetBypass(optionsRes);
    },
  );

  test(
    'Unknown content API endpoints are not cached by snippet allowlist logic',
    { tag: ['@edge-matrix'] },
    async ({ request }) => {
      const token = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

      const unknownApiRes = await request.get(
        `/api/proxy/content/api/qdc/resources/unknown_endpoint?language=vi&__edge_method=${token}`,
        {
          headers: { accept: 'application/json' },
          failOnStatusCode: false,
        },
      );

      expect(unknownApiRes.status()).toBeGreaterThanOrEqual(200);
      expect(unknownApiRes.status()).toBeLessThan(500);
      expectSnippetBypass(unknownApiRes);

      const nearMissAllowlistRes = await request.get(
        `/api/proxy/content/api/qdc/resources/translationsx?language=vi&__edge_method=${token}`,
        {
          headers: { accept: 'application/json' },
          failOnStatusCode: false,
        },
      );
      expect(nearMissAllowlistRes.status()).toBeGreaterThanOrEqual(200);
      expect(nearMissAllowlistRes.status()).toBeLessThan(500);
      expectSnippetBypass(nearMissAllowlistRes);
    },
  );

  test(
    'All token-like query keys bypass snippet caching',
    { tag: ['@edge-matrix'] },
    async ({ request }) => {
      const keys = ['token', 'code', 'redirectBack', 'redirect_to', 'visitedPlatform'] as const;

      for (const key of keys) {
        const token = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const url = `/vi/1?${key}=value&__edge_method=${token}`;

        const res = await request.get(url, {
          headers: { accept: 'text/html' },
          maxRedirects: 0,
          failOnStatusCode: false,
        });

        expect(res.status()).toBeGreaterThanOrEqual(200);
        expect(res.status()).toBeLessThan(500);
        expectSnippetBypass(res);
      }
    },
  );
});
