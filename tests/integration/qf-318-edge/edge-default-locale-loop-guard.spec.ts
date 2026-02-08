import { test, expect, type APIRequestContext } from '@playwright/test';

import { isProdEdgeBaseUrl } from '@/tests/helpers/qf318-edge';

type RedirectHop = {
  url: string;
  status: number;
  location: string | null;
};

const REDIRECT_STATUSES = new Set([301, 302, 307, 308]);

const getBaseOrigin = (): string => {
  const base = process.env.PLAYWRIGHT_TEST_BASE_URL || 'https://ssr.quran.com';
  return new URL(base).origin;
};

const toAbsoluteUrl = (currentUrl: string, location: string): string =>
  new URL(location, currentUrl).toString();

const traceRedirectChain = async (
  request: APIRequestContext,
  startPath: string,
  headers: Record<string, string>,
  maxHops = 6,
): Promise<{ hops: RedirectHop[]; loopDetected: boolean; exceededMaxHops: boolean }> => {
  const hops: RedirectHop[] = [];
  const seenUrls = new Set<string>();

  let currentUrl = new URL(startPath, getBaseOrigin()).toString();

  for (let index = 0; index < maxHops; index += 1) {
    const response = await request.get(currentUrl, {
      headers,
      maxRedirects: 0,
    });
    const location = response.headers().location || null;

    hops.push({
      url: currentUrl,
      status: response.status(),
      location,
    });

    const isRedirect = REDIRECT_STATUSES.has(response.status()) && Boolean(location);
    if (!isRedirect) {
      return { hops, loopDetected: false, exceededMaxHops: false };
    }

    const nextUrl = toAbsoluteUrl(currentUrl, location || '/');
    if (seenUrls.has(nextUrl)) {
      return { hops, loopDetected: true, exceededMaxHops: false };
    }

    seenUrls.add(currentUrl);
    currentUrl = nextUrl;
  }

  return { hops, loopDetected: false, exceededMaxHops: true };
};

const pathFromUrl = (url: string): string => new URL(url).pathname;

const hasPingPongPattern = (paths: string[]): boolean => {
  for (let index = 0; index + 2 < paths.length; index += 1) {
    if (paths[index] === paths[index + 2] && paths[index] !== paths[index + 1]) {
      return true;
    }
  }
  return false;
};

test.describe('QF-318 (prod) — default locale redirect loop guard', () => {
  test.skip(!isProdEdgeBaseUrl(), 'Requires PLAYWRIGHT_TEST_BASE_URL=https://ssr.quran.com');

  test(
    'Canonical default-locale path does not loop (/en/1)',
    { tag: ['@edge-matrix'] },
    async ({ request }) => {
      const headers = {
        accept: 'text/html',
        'accept-language': 'en-US,en;q=0.9',
      };

      for (let attempt = 0; attempt < 3; attempt += 1) {
        const result = await traceRedirectChain(request, '/en/1', headers);

        expect(result.loopDetected).toBe(false);
        expect(result.exceededMaxHops).toBe(false);

        const paths = result.hops.map((hop) => pathFromUrl(hop.url));
        expect(hasPingPongPattern(paths)).toBe(false);

        const terminal = result.hops[result.hops.length - 1];
        expect(REDIRECT_STATUSES.has(terminal.status)).toBe(false);
      }
    },
  );

  test(
    'Default locale canonical path does not ping-pong (/1 <-> /en/1)',
    { tag: ['@edge-matrix'] },
    async ({ request }) => {
      const headers = {
        accept: 'text/html',
        'accept-language': 'en-US,en;q=0.9',
      };

      for (let attempt = 0; attempt < 3; attempt += 1) {
        const result = await traceRedirectChain(request, '/1', headers);

        expect(result.loopDetected).toBe(false);
        expect(result.exceededMaxHops).toBe(false);

        const paths = result.hops.map((hop) => pathFromUrl(hop.url));
        expect(hasPingPongPattern(paths)).toBe(false);
      }
    },
  );
});
