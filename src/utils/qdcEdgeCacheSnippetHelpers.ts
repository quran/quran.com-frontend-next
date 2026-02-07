/* eslint-disable no-bitwise */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
export const splitLocaleFromPath = (
  pathname: string,
  supportedLocales: string[],
): { urlLocale: string | null; restPath: string } => {
  const hasTrailingSlash = pathname.length > 1 && pathname.endsWith('/');
  const parts = pathname.split('/').filter(Boolean);
  const first = parts[0] || '';
  const isLocale = supportedLocales.includes(first);
  if (!isLocale) return { urlLocale: null, restPath: pathname };

  const restParts = parts.slice(1);
  let restPath = `/${restParts.join('/')}`;
  if (restParts.length === 0) restPath = '/';
  if (hasTrailingSlash && restPath !== '/' && !restPath.endsWith('/')) restPath += '/';
  return { urlLocale: first, restPath };
};

export const getCountryForDefaults = (
  localeKey: string,
  cfCountry: string,
  supportedLocales: string[],
): string => {
  const isSupported = supportedLocales.includes(localeKey);
  const isEnglish = localeKey === 'en';

  if (isEnglish || !isSupported) {
    const cc = (cfCountry || 'US').toUpperCase();
    return cc && cc.length === 2 ? cc : 'US';
  }

  return 'US';
};

export const normalizeCacheToken = (value?: string | null): string | null => {
  if (!value || typeof value !== 'string') return null;
  const token = value.trim();
  if (!/^[0-9a-z]+$/i.test(token)) return null;
  if (token.length > 64) return null;
  return token;
};

export const stableHashToKey = (value: string): string => {
  let h1 = 0xdeadbeef ^ value.length;
  let h2 = 0x41c6ce57 ^ value.length;

  for (let i = 0; i < value.length; i += 1) {
    const ch = value.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const hash = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  return hash.toString(36);
};

export const normalizeUrlForCache = (originalUrl: URL): string => {
  const url = new URL(originalUrl.toString());

  const keep: Array<[string, string]> = [];
  // @ts-ignore
  for (const [k, v] of url.searchParams.entries()) {
    if (k.startsWith('utm_')) continue;
    if (k === 'gclid' || k === 'fbclid' || k === 'msclkid') continue;
    keep.push([k, v]);
  }

  keep.sort((a, b) => {
    if (a[0] < b[0]) return -1;
    if (a[0] > b[0]) return 1;
    if (a[1] < b[1]) return -1;
    if (a[1] > b[1]) return 1;
    return 0;
  });

  url.search = '';
  for (const [k, v] of keep) url.searchParams.append(k, v);
  return url.toString();
};

export const parseCookies = (cookieHeader: string): Record<string, string> => {
  const out: Record<string, string> = Object.create(null);
  if (!cookieHeader) return out;
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const eqIndex = part.indexOf('=');
    if (eqIndex === -1) continue;
    const rawKey = part.slice(0, eqIndex).trim();
    const rawValue = part.slice(eqIndex + 1).trim();
    if (!rawKey) continue;
    try {
      out[rawKey] = decodeURIComponent(rawValue);
    } catch {
      out[rawKey] = rawValue;
    }
  }
  return out;
};

const USER_ID_COOKIE_NAMES = ['id', 'id_test', 'id_staging', 'id_staging2', 'id_prelive'];

export const getUserIdCookieValue = (cookies: Record<string, string>): string | null => {
  for (const name of USER_ID_COOKIE_NAMES) {
    if (cookies[name]) return cookies[name];
  }
  return null;
};

export const isPrivatePath = (pathname: string, privatePrefixes: string[]): boolean =>
  privatePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

export const shouldBypassPath = (pathname: string, bypassPrefixes: string[]): boolean => {
  if (!pathname) return true;
  for (const prefix of bypassPrefixes) {
    if (pathname === prefix) return true;
    if (prefix.endsWith('/')) {
      if (pathname.startsWith(prefix)) return true;
      continue;
    }
    if (pathname.startsWith(`${prefix}/`)) return true;
  }
  if (/\.(?:js|css|map|png|jpg|jpeg|gif|svg|webp|avif|ico|txt|xml|json|woff2?)$/i.test(pathname)) {
    return true;
  }
  return false;
};

export const shouldBypassQuery = (
  searchParams: URLSearchParams,
  tokenQueryKeys: string[],
): boolean => tokenQueryKeys.some((key) => searchParams.has(key));
