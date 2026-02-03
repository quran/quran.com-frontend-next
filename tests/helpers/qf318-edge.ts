import type { APIResponse } from '@playwright/test';

export const isProdEdgeBaseUrl = (): boolean => {
  const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || '';
  const hostHeader = process.env.PLAYWRIGHT_TEST_HOST_HEADER || '';
  return baseUrl.includes('ssr.quran.com') || hostHeader === 'ssr.quran.com';
};

export const base64UrlEncodeUtf8 = (value: string): string =>
  Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

export const extractNextDataJson = (html: string): any | null => {
  const marker = '<script id="__NEXT_DATA__" type="application/json">';
  const start = html.indexOf(marker);
  if (start === -1) return null;
  const after = start + marker.length;
  const end = html.indexOf('</script>', after);
  if (end === -1) return null;
  return JSON.parse(html.slice(after, end));
};

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const getHeader = (
  headers: Record<string, string>,
  name: string,
): string | undefined => headers[name.toLowerCase()];

export const getEdgeCacheHeader = (res: APIResponse): string | undefined =>
  getHeader(res.headers(), 'x-qdc-edge-cache');

export const getEdgeCacheKeyHeader = (res: APIResponse): string | undefined =>
  getHeader(res.headers(), 'x-qdc-edge-cache-key');
