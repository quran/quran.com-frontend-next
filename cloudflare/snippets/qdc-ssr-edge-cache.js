/**
 * Cloudflare Snippet: SSR HTML caching by preference-set (QDC_PREFS_KEY)
 *
 * Key properties:
 * - No Workers required (Snippets-only).
 * - Caches SSR HTML (GET document navigations) at the edge using Cloudflare's built-in cache
 *   (`fetch(..., { cf: { cacheEverything, cacheKey } })`).
 * - Cache key includes:
 *   - normalized URL (tracking params stripped)
 *   - locale
 *   - prefsKey (QDC_PREFS_KEY) when present
 *   - otherwise: device-language + country bucket (QF-318 rules)
 *   - for private/auth-required pages: userKey (hashed user id cookie)
 * - Canonicalizes trailing slashes (308) and caches safe locale redirects (307/308).
 * - Caches safe JSON second-wave requests (_next/data + public content API allowlist).
 * - Never caches auth/token routes or errors. JSON caching paths refuse unsafe Set-Cookie responses.
 */

const CONFIG = {
  HOSTNAME: 'ssr.quran.com',

  // Bump this when cache-key semantics change (emergency bust).
  CACHE_VERSION: '3',
  HTML_TTL_SECONDS: 60 * 60, // 1 hour
  REDIRECT_TTL_SECONDS: 60 * 60 * 24, // 24 hours
  NEXT_DATA_TTL_SECONDS: 60 * 60, // 1 hour
  CONTENT_API_DEFAULT_TTL_SECONDS: 60 * 60 * 24, // 24 hours

  DEFAULT_LOCALE: 'en',
  SUPPORTED_LOCALES: [
    'en',
    'ar',
    'bn',
    'fa',
    'fr',
    'id',
    'it',
    'nl',
    'pt',
    'ru',
    'sq',
    'th',
    'tr',
    'ur',
    'zh',
    'ms',
    'es',
    'sw',
    'vi',
  ],

  LOCALE_COOKIE: 'NEXT_LOCALE',
  MANUAL_LOCALE_COOKIE: 'QDC_MANUAL_LOCALE',
  PREFS_KEY_COOKIE: 'QDC_PREFS_KEY',

  PRIVATE_PATH_PREFIXES: [
    '/collections',
    '/profile',
    '/notes-and-reflections',
    '/reading-goal',
    '/notification-settings',
    '/my-learning-plans',
    '/my-quran',
    '/take-notes',
  ],

  BYPASS_PATH_PREFIXES: [
    '/auth',
    '/logout',
    '/login',
    '/complete-signup',
    '/forgot-password',
    '/reset-password',
  ],

  TOKEN_QUERY_KEYS: ['token', 'code', 'redirectBack', 'redirect_to', 'visitedPlatform'],

  CONTENT_API_ALLOWLIST_PREFIXES: [
    // WARNING: Only add truly public endpoints here.
    // User-specific APIs require separate handling with user context in the cache key.
    '/api/proxy/content/api/qdc/verses/by_chapter/',
    '/api/proxy/content/api/qdc/resources/translations',
    '/api/proxy/content/api/qdc/resources/country_language_preference',
  ],
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Only operate on the SSR host. Everything else passes through untouched.
    if (url.hostname !== CONFIG.HOSTNAME) return fetch(request);

    // Cache API only supports GET keys; avoid caching non-GET entirely.
    if (request.method !== 'GET') return fetch(request);

    if (shouldBypassQuery(url.searchParams)) return fetch(request);

    const cookieHeader = request.headers.get('Cookie') || '';
    const cookies = parseCookies(cookieHeader);

    // Canonicalize trailing slashes at the edge to avoid extra redirects:
    // /vi/ → /vi, /vi/5/ → /vi/5
    if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
      const canonicalPath = url.pathname.replace(/\/+$/, '');
      const location = canonicalPath ? `${canonicalPath}${url.search}` : `/${url.search}`;
      return makeRedirectResponse(308, location);
    }

    const acceptLanguage = request.headers.get('Accept-Language') || '';
    const deviceLanguage = getDeviceLanguageFromAcceptLanguage(
      acceptLanguage,
      CONFIG.SUPPORTED_LOCALES,
      CONFIG.DEFAULT_LOCALE,
    );
    const cfCountry = ((request.cf && request.cf.country) || 'US').toUpperCase();

    // Cache JSON: Next.js data endpoints used for client navigations/prefetch.
    if (isNextDataRequest(url.pathname)) {
      return handleNextDataRequest({ request, url, cookies, deviceLanguage, cfCountry, ctx });
    }

    // Cache JSON: public content APIs only (strict allowlist).
    if (isCacheableContentApiRequest(url.pathname)) {
      return handleContentApiRequest({ request, url, ctx });
    }

    // Only cache HTML document requests from here.
    if (!isHtmlDocumentRequest(request, url.pathname)) return fetch(request);

    const { urlLocale, restPath } = splitLocaleFromPath(url.pathname, CONFIG.SUPPORTED_LOCALES);

    // Bypass internal routes and auth/token flows.
    if (shouldBypassHtmlPath(restPath)) return fetch(request);

    const nextLocaleCookie = normalizeLocale(
      cookies[CONFIG.LOCALE_COOKIE],
      CONFIG.SUPPORTED_LOCALES,
    );
    const hasManualSelection = cookies[CONFIG.MANUAL_LOCALE_COOKIE] === '1';

    const localeKey = urlLocale || nextLocaleCookie || CONFIG.DEFAULT_LOCALE;

    const prefsKey = normalizeCacheToken(cookies[CONFIG.PREFS_KEY_COOKIE]);
    const isPrivate = isPrivatePath(restPath);

    // Private pages should be isolated per user. If we can't identify the user,
    // bypass caching to avoid caching login/intermediate states.
    const userId = getUserIdCookieValue(cookies);
    const userKey = userId ? stableHashToKey(userId) : null;
    if (isPrivate && !userKey) return fetch(request);

    // Guest bucketing inputs (QF-318):
    // - localeForPreferences: device language unless manual override
    // - countryForPreferences: real country for English/unsupported, otherwise US
    const localeForPreferences = hasManualSelection
      ? nextLocaleCookie || localeKey
      : deviceLanguage;
    const countryForPreferences = getCountryForPreferences(localeForPreferences, cfCountry);

    // Redirect cache for locale redirects (e.g. "/" -> "/vi" or manual locale).
    // This avoids repeated cold redirects for the same bucket.
    let redirectCacheKeyUrl = null;
    let redirectCacheReq = null;
    const manualLocale = hasManualSelection ? nextLocaleCookie || localeKey : null;
    const isManualDefaultLocale = Boolean(
      hasManualSelection && manualLocale && manualLocale === CONFIG.DEFAULT_LOCALE,
    );
    if (!urlLocale && !isManualDefaultLocale) {
      redirectCacheKeyUrl = buildRedirectCacheKeyUrl({
        url,
        localeForPreferences,
        countryForPreferences,
        hasManualSelection,
        manualLocale,
      });
      redirectCacheReq = new Request(redirectCacheKeyUrl.toString(), { method: 'GET' });
      const redirectCache = caches.default;
      const cachedRedirect = await redirectCache.match(redirectCacheReq);
      if (cachedRedirect) {
        return withEdgeCacheHeaders(cachedRedirect, 'HIT', redirectCacheKeyUrl.toString());
      }
    }

    // If user explicitly chose a locale and URL has no locale prefix, redirect to the manual locale.
    if (
      !urlLocale &&
      hasManualSelection &&
      nextLocaleCookie &&
      nextLocaleCookie !== CONFIG.DEFAULT_LOCALE &&
      redirectCacheKeyUrl &&
      redirectCacheReq
    ) {
      const manualPath = `/${nextLocaleCookie}${url.pathname === '/' ? '' : url.pathname}`;
      const redirectLocation = `${manualPath}${url.search}`;
      const headers = new Headers();
      headers.set('Location', redirectLocation);
      headers.set('Cache-Control', `public, max-age=0, s-maxage=${CONFIG.REDIRECT_TTL_SECONDS}`);
      const redirectRes = new Response(null, { status: 307, headers });
      const cachePutPromise = caches.default.put(redirectCacheReq, redirectRes.clone());
      if (ctx && typeof ctx.waitUntil === 'function') {
        ctx.waitUntil(cachePutPromise);
      } else {
        await cachePutPromise;
      }
      return withEdgeCacheHeaders(redirectRes, 'MISS', redirectCacheKeyUrl.toString());
    }

    // HTML cache key.
    const htmlCacheKeyUrl = buildHtmlCacheKeyUrl({
      url,
      localeKey,
      prefsKey,
      isPrivate,
      userKey,
      localeForPreferences,
      countryForPreferences,
    });

    // Cache SSR HTML via Cloudflare's built-in cache with "cache everything" + custom cache key.
    // This avoids Cache API quirks where HTML can remain effectively uncacheable.
    const cachedRes = await fetch(request, {
      cf: {
        cacheEverything: true,
        cacheKey: htmlCacheKeyUrl.toString(),
        cacheTtlByStatus: {
          '200-299': CONFIG.HTML_TTL_SECONDS,
          // Avoid caching origin redirects here. We cache only "safe" locale redirects via caches.default
          // (see isCacheableLocaleRedirect) to prevent redirect poisoning and loops.
          '301-308': 0,
          '400-499': 0,
          '500-599': 0,
        },
      },
    });

    if (redirectCacheKeyUrl && redirectCacheReq) {
      if (isCacheableLocaleRedirect(cachedRes, url, CONFIG.SUPPORTED_LOCALES)) {
        const location = normalizeRedirectLocation(cachedRes.headers.get('Location') || '', url);
        if (location) {
          const headers = new Headers();
          headers.set('Location', location);
          headers.set(
            'Cache-Control',
            `public, max-age=0, s-maxage=${CONFIG.REDIRECT_TTL_SECONDS}`,
          );
          const redirectRes = new Response(null, { status: cachedRes.status, headers });
          const cachePutPromise = caches.default.put(redirectCacheReq, redirectRes.clone());
          if (ctx && typeof ctx.waitUntil === 'function') {
            ctx.waitUntil(cachePutPromise);
          } else {
            await cachePutPromise;
          }
          return withEdgeCacheHeaders(redirectRes, 'MISS', redirectCacheKeyUrl.toString());
        }
      }
    }

    const qdcStatus = getQdcStatusFromCfCacheStatus(
      cachedRes.headers.get('CF-Cache-Status') || cachedRes.headers.get('cf-cache-status'),
    );
    return withEdgeCacheHeaders(cachedRes, qdcStatus, htmlCacheKeyUrl.toString());
  },
};

async function handleNextDataRequest({ request, url, cookies, deviceLanguage, cfCountry, ctx }) {
  const info = parseNextDataPath(url.pathname, CONFIG.SUPPORTED_LOCALES);
  if (!info || !info.localeKey) return fetch(request);

  const prefsKey = normalizeCacheToken(cookies[CONFIG.PREFS_KEY_COOKIE]);
  const isPrivate = isPrivatePath(info.pagePath);
  if (isBypassPath(info.pagePath)) return fetch(request);

  const userId = getUserIdCookieValue(cookies);
  const userKey = userId ? stableHashToKey(userId) : null;
  if (isPrivate && !userKey) return fetch(request);

  const nextLocaleCookie = normalizeLocale(cookies[CONFIG.LOCALE_COOKIE], CONFIG.SUPPORTED_LOCALES);
  const hasManualSelection = cookies[CONFIG.MANUAL_LOCALE_COOKIE] === '1';
  const localeForPreferences = hasManualSelection
    ? nextLocaleCookie || info.localeKey
    : deviceLanguage;
  const countryForPreferences = getCountryForPreferences(localeForPreferences, cfCountry);

  const normalizedUrl = normalizeUrlForCache(url);
  const cacheKeyUrl = new URL(normalizedUrl);
  cacheKeyUrl.searchParams.set('__qdc_v', CONFIG.CACHE_VERSION);
  cacheKeyUrl.searchParams.set('__qdc_t', 'data');
  cacheKeyUrl.searchParams.set('__qdc_l', info.localeKey);

  if (prefsKey) {
    cacheKeyUrl.searchParams.set('__qdc_p', prefsKey);
  } else {
    cacheKeyUrl.searchParams.set('__qdc_d', localeForPreferences);
    cacheKeyUrl.searchParams.set('__qdc_c', countryForPreferences);
  }
  if (isPrivate && userKey) cacheKeyUrl.searchParams.set('__qdc_u', userKey);

  const cacheKeyReq = new Request(cacheKeyUrl.toString(), { method: 'GET' });
  const cache = caches.default;
  const cached = await cache.match(cacheKeyReq);
  if (cached) return withEdgeCacheHeaders(cached, 'HIT', cacheKeyUrl.toString());

  const originRes = await fetch(request);
  if (!isCacheableJsonOriginResponse(originRes)) {
    return withEdgeCacheHeaders(originRes, 'BYPASS', cacheKeyUrl.toString());
  }

  const cacheRes = originRes.clone();
  const resToCache = new Response(cacheRes.body, cacheRes);
  resToCache.headers.delete('Set-Cookie');
  resToCache.headers.set(
    'Cache-Control',
    `public, max-age=0, s-maxage=${CONFIG.NEXT_DATA_TTL_SECONDS}`,
  );

  const cachePutPromise = cache.put(cacheKeyReq, resToCache.clone());
  if (ctx && typeof ctx.waitUntil === 'function') {
    ctx.waitUntil(cachePutPromise);
  } else {
    await cachePutPromise;
  }
  return withEdgeCacheHeaders(originRes, 'MISS', cacheKeyUrl.toString());
}

async function handleContentApiRequest({ request, url, ctx }) {
  const normalizedUrl = normalizeUrlForCache(url);
  const cacheKeyUrl = new URL(normalizedUrl);
  cacheKeyUrl.searchParams.set('__qdc_v', CONFIG.CACHE_VERSION);
  cacheKeyUrl.searchParams.set('__qdc_t', 'api');

  const cacheKeyReq = new Request(cacheKeyUrl.toString(), { method: 'GET' });
  const cache = caches.default;
  const cached = await cache.match(cacheKeyReq);
  if (cached) return withEdgeCacheHeaders(cached, 'HIT', cacheKeyUrl.toString());

  const originRes = await fetch(request);

  if (!isCacheablePublicContentApiResponse(originRes)) {
    return withEdgeCacheHeaders(originRes, 'BYPASS', cacheKeyUrl.toString());
  }

  const ttl =
    getPublicMaxAgeSeconds(originRes.headers.get('Cache-Control')) ||
    CONFIG.CONTENT_API_DEFAULT_TTL_SECONDS;

  const resToCache = new Response(originRes.body, originRes);
  // This header frequently appears from upstream with an unrelated domain and prevents caching.
  resToCache.headers.delete('Set-Cookie');
  resToCache.headers.set('Cache-Control', `public, max-age=0, s-maxage=${ttl}`);

  const cachePutPromise = cache.put(cacheKeyReq, resToCache.clone());
  if (ctx && typeof ctx.waitUntil === 'function') {
    ctx.waitUntil(cachePutPromise);
  } else {
    await cachePutPromise;
  }
  return withEdgeCacheHeaders(resToCache, 'MISS', cacheKeyUrl.toString());
}

function shouldBypassHtmlPath(pathname) {
  if (!pathname) return true;

  for (const prefix of CONFIG.BYPASS_PATH_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return true;
  }

  // Next internals: HTML caching doesn't apply.
  if (pathname.startsWith('/_next/')) return true;
  if (pathname.startsWith('/api/')) return true;

  // Static assets: let Cloudflare's default caching handle these.
  if (/\.(?:js|css|map|png|jpg|jpeg|gif|svg|webp|avif|ico|txt|xml|json|woff2?)$/i.test(pathname)) {
    return true;
  }

  return false;
}

function shouldBypassQuery(searchParams) {
  for (const key of CONFIG.TOKEN_QUERY_KEYS) {
    if (searchParams.has(key)) return true;
  }
  return false;
}

function isPrivatePath(pathname) {
  for (const prefix of CONFIG.PRIVATE_PATH_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return true;
  }
  return false;
}

function isBypassPath(pathname) {
  for (const prefix of CONFIG.BYPASS_PATH_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return true;
  }
  return false;
}

function isHtmlDocumentRequest(request, pathname) {
  // 1) Browsers send Sec-Fetch-Dest: document
  const dest = request.headers.get('Sec-Fetch-Dest') || '';
  if (dest === 'document') return true;

  // 2) Most crawlers/clients send Accept: text/html
  const accept = request.headers.get('Accept') || '';
  if (accept.includes('text/html')) return true;

  // 3) Fallback: if no headers hint at HTML, but the path looks like a page
  //    (not an asset, API, or internal route), treat it as HTML-eligible.
  //    This prevents crawlers/monitors without proper headers from bypassing cache.
  if (!pathname) return false;

  // Explicitly not HTML: assets, APIs, Next.js internals
  if (pathname.startsWith('/_next/')) return false;
  if (pathname.startsWith('/api/')) return false;
  if (
    /\.(?:js|css|map|png|jpg|jpeg|gif|svg|webp|avif|ico|txt|xml|json|woff2?|ttf|eot)$/i.test(
      pathname,
    )
  ) {
    return false;
  }

  // If it looks like a page path (/, /vi, /vi/5, /surah/1, etc.), assume HTML
  return true;
}

function parseCookies(cookieHeader) {
  const out = Object.create(null);
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
    } catch (e) {
      out[rawKey] = rawValue;
    }
  }
  return out;
}

function normalizeLocale(value, supportedLocales) {
  if (!value || typeof value !== 'string') return null;
  const lc = value.trim().toLowerCase();
  return supportedLocales.includes(lc) ? lc : null;
}

function splitLocaleFromPath(pathname, supportedLocales) {
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
}

function getCountryForPreferences(localeForPreferences, cfCountry) {
  const cc = (cfCountry || 'US').toUpperCase();
  const normalizedCountry = cc && cc.length === 2 ? cc : 'US';

  // QF-318: English => use real country. Supported non-English => use US.
  if (localeForPreferences === 'en') return normalizedCountry;
  return 'US';
}

function normalizeCacheToken(value) {
  if (!value || typeof value !== 'string') return null;
  const token = value.trim();
  if (!/^[0-9a-z]+$/i.test(token)) return null;
  // Keep tokens reasonably sized to avoid cache key abuse.
  if (token.length > 64) return null;
  return token;
}

function getUserIdCookieValue(cookies) {
  const allowedNames = ['id', 'id_test', 'id_staging', 'id_staging2', 'id_prelive'];
  for (const name of allowedNames) {
    if (cookies[name]) return cookies[name];
  }
  return null;
}

// Stable, fast, non-cryptographic hash (deterministic across JS engines).
// Produces a short key suitable for cache bucketing.
// Source pattern: cyrb53 (public domain).
function stableHashToKey(value) {
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
}

function normalizeUrlForCache(originalUrl) {
  const url = new URL(originalUrl.toString());

  const keep = [];
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
}

function isCacheableJsonOriginResponse(res) {
  if (!res) return false;
  if (res.status !== 200) return false;

  const contentType = res.headers.get('Content-Type') || '';
  if (!contentType.includes('application/json')) return false;

  const setCookie = res.headers.get('Set-Cookie');
  if (setCookie && !isSafeSetCookieForCaching(setCookie)) return false;

  return true;
}

function isCacheablePublicContentApiResponse(res) {
  if (!res) return false;
  if (res.status !== 200) return false;

  const contentType = res.headers.get('Content-Type') || '';
  if (!contentType.includes('application/json')) return false;

  const cacheControl = (res.headers.get('Cache-Control') || '').toLowerCase();
  if (!cacheControl.includes('public')) return false;
  if (
    cacheControl.includes('private') ||
    cacheControl.includes('no-store') ||
    cacheControl.includes('no-cache')
  ) {
    return false;
  }

  return true;
}

function getSetCookieNames(setCookieHeader) {
  if (!setCookieHeader) return [];
  const parts = setCookieHeader.split(/,(?=[^;]*=)/);
  return parts
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.split('=')[0]?.trim())
    .filter(Boolean);
}

function isSafeSetCookieForCaching(setCookieHeader) {
  const names = getSetCookieNames(setCookieHeader);
  if (names.length === 0) return true;
  const allowed = new Set([
    '__cf_bm',
    'cf_clearance',
    '__cfruid',
    '_cfuvid',
    '__cflb',
    CONFIG.LOCALE_COOKIE,
    CONFIG.MANUAL_LOCALE_COOKIE,
    CONFIG.PREFS_KEY_COOKIE,
    'QDC_PREFS',
    'QDC_PREFS_VER',
  ]);
  return names.every((name) => allowed.has(name));
}

function getPublicMaxAgeSeconds(cacheControlHeader) {
  if (!cacheControlHeader) return null;
  const m = cacheControlHeader.match(/max-age=(\d+)/i);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.min(n, 60 * 60 * 24 * 30); // cap at 30 days
}

function withEdgeCacheHeaders(res, status, cacheKey) {
  const out = new Response(res.body, res);
  out.headers.set('X-QDC-Edge-Cache', status);
  out.headers.set('X-QDC-Edge-Cache-Key', cacheKey);
  return out;
}

function makeRedirectResponse(status, location) {
  const headers = new Headers();
  headers.set('Location', location);
  headers.set('Cache-Control', 'no-store');
  return new Response(null, { status, headers });
}

function getQdcStatusFromCfCacheStatus(cfCacheStatus) {
  const v = (cfCacheStatus || '').toUpperCase();
  if (v === 'HIT') return 'HIT';
  if (v === 'MISS' || v === 'EXPIRED' || v === 'REVALIDATED') return 'MISS';
  return 'BYPASS';
}

function isNextDataRequest(pathname) {
  return pathname.startsWith('/_next/data/');
}

function parseNextDataPath(pathname, supportedLocales) {
  // Example:
  //  - /_next/data/<buildId>/vi.json
  //  - /_next/data/<buildId>/vi/5.json
  //  - /_next/data/<buildId>/vi/my-quran.json
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length < 3) return null;
  if (parts[0] !== '_next' || parts[1] !== 'data') return null;

  const rest = parts.slice(3); // after _next/data/<buildId>
  if (rest.length === 0) return null;

  let localeKey = null;
  let afterLocale = [];

  const first = rest[0];
  if (supportedLocales.includes(first)) {
    localeKey = first;
    afterLocale = rest.slice(1);
  } else {
    const maybeLocale = first.replace(/\.json$/i, '');
    if (supportedLocales.includes(maybeLocale)) {
      localeKey = maybeLocale;
      afterLocale = rest.slice(1);
    }
  }

  if (!localeKey) return null;

  let pagePath = '/';
  if (afterLocale.length > 0) {
    const joined = afterLocale.join('/');
    const withoutExt = joined.replace(/\.json$/i, '');
    pagePath = withoutExt ? `/${withoutExt}` : '/';
  }

  return { localeKey, pagePath };
}

function isCacheableContentApiRequest(pathname) {
  for (const prefix of CONFIG.CONTENT_API_ALLOWLIST_PREFIXES) {
    if (pathname === prefix) return true;
    if (prefix.endsWith('/')) {
      if (pathname.startsWith(prefix)) return true;
      continue;
    }
    if (pathname.startsWith(`${prefix}/`)) return true;
  }
  return false;
}

function getDeviceLanguageFromAcceptLanguage(
  acceptLanguageHeader,
  supportedLocales,
  defaultLocale,
) {
  if (!acceptLanguageHeader || typeof acceptLanguageHeader !== 'string') return defaultLocale;
  const first = acceptLanguageHeader.split(',')[0] || '';
  const tag = first.split(';')[0].trim().toLowerCase();
  if (!tag) return defaultLocale;
  const base = tag.split('-')[0];
  return supportedLocales.includes(base) ? base : defaultLocale;
}

function buildRedirectCacheKeyUrl({
  url,
  localeForPreferences,
  countryForPreferences,
  hasManualSelection,
  manualLocale,
}) {
  const normalizedUrl = normalizeUrlForCache(url);
  const cacheKeyUrl = new URL(normalizedUrl);
  cacheKeyUrl.searchParams.set('__qdc_v', CONFIG.CACHE_VERSION);
  cacheKeyUrl.searchParams.set('__qdc_t', 'redir');
  cacheKeyUrl.searchParams.set('__qdc_d', localeForPreferences);
  cacheKeyUrl.searchParams.set('__qdc_c', countryForPreferences);
  if (hasManualSelection) {
    cacheKeyUrl.searchParams.set('__qdc_m', '1');
    cacheKeyUrl.searchParams.set('__qdc_ml', manualLocale);
  }
  return cacheKeyUrl;
}

function buildHtmlCacheKeyUrl({
  url,
  localeKey,
  prefsKey,
  isPrivate,
  userKey,
  localeForPreferences,
  countryForPreferences,
}) {
  const normalizedUrl = normalizeUrlForCache(url);
  const cacheKeyUrl = new URL(normalizedUrl);
  cacheKeyUrl.searchParams.set('__qdc_v', CONFIG.CACHE_VERSION);
  cacheKeyUrl.searchParams.set('__qdc_l', localeKey);
  if (prefsKey) {
    cacheKeyUrl.searchParams.set('__qdc_p', prefsKey);
  } else {
    cacheKeyUrl.searchParams.set('__qdc_d', localeForPreferences);
    cacheKeyUrl.searchParams.set('__qdc_c', countryForPreferences);
  }
  if (isPrivate && userKey) cacheKeyUrl.searchParams.set('__qdc_u', userKey);
  return cacheKeyUrl;
}

function isCacheableLocaleRedirect(res, requestUrl, supportedLocales) {
  if (!res) return false;
  if (![301, 302, 307, 308].includes(res.status)) return false;
  const setCookie = res.headers.get('Set-Cookie');
  if (setCookie) return false;

  const location = res.headers.get('Location') || '';
  if (!location) return false;

  // Only allow same-origin (relative) or same-host absolute redirects.
  if (location.startsWith('/')) {
    const first = location.split('/').filter(Boolean)[0] || '';
    return supportedLocales.includes(first);
  }

  try {
    const u = new URL(location, requestUrl.toString());
    if (u.hostname !== requestUrl.hostname) return false;
    const first = u.pathname.split('/').filter(Boolean)[0] || '';
    return supportedLocales.includes(first);
  } catch {
    return false;
  }
}

function normalizeRedirectLocation(location, requestUrl) {
  if (!location) return null;

  // Relative path redirects are expected and safest.
  if (location.startsWith('/')) {
    if (location.length > 1 && location.endsWith('/')) return location.replace(/\/+$/, '');
    return location;
  }

  try {
    const u = new URL(location, requestUrl.toString());
    if (u.hostname !== requestUrl.hostname) return null;
    if (u.pathname.length > 1 && u.pathname.endsWith('/'))
      u.pathname = u.pathname.replace(/\/+$/, '');
    return u.pathname + u.search;
  } catch {
    return null;
  }
}
