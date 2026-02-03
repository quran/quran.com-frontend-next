# Snippets-Only Edge Locale Routing + SSR HTML Caching (From Scratch)

This document describes a clean, Snippets-only approach for `ssr.quran.com` that:

- Uses **Cloudflare Snippets** (edge JS) only: **no Workers**, **no Transform Rules**, **no Cache
  Rules**.
- Performs **API-driven locale resolution + redirects at the edge** (business rules remain in the
  API).
- Caches **anonymous SSR HTML** at the edge with a **custom cache key** that includes both:
  - `_cc` = country used for preference resolution (per product rules)
  - `_al` = primary language derived from `Accept-Language`
- Ensures **manual choice wins** (hard override).
- Never exposes `_cc/_al` in the user-visible URL.

This is written as a fresh guide: ignore any existing Cloudflare rules/snippets and treat this as
the new canonical design.

---

## Goals

1. **Edge locale routing (API-driven)**

   - First-time (no manual override) visitors are redirected to the locale returned by the Country
     Language Preference API.
   - Example: visitor in Vietnam can land on `/vi/*` but still be redirected to `/ar/*` if the API
     says so.
   - Redirect type: **307** (temporary).

2. **Anonymous SSR HTML edge caching**

   - Cache SSR HTML for anonymous users only.
   - Vary cache by **URL + `_cc` + `_al`**.
   - Authenticated users always bypass cache.

3. **Manual selection wins**

   - If user manually chose a locale, it overrides everything (country, accept-language, API
     default).
   - If the URL locale doesn’t match the manual locale, edge redirects to the manual locale.

4. **No query param sharding**
   - Do not add `_cc/_al` to the URL.
   - Use a synthetic/internal cache key only.

---

## Constraints / Assumptions

- Cloudflare plan: **Pro**.
- Allowed: **Cloudflare Snippets** (edge JS).
- Not allowed: Workers (until necessary).
- The authoritative decision comes from:
  - `GET /api/qdc/resources/country_language_preference?user_device_language=<al>&country=<cc>`
- SSR output is safe to cache for anonymous users as long as we bypass authenticated requests and
  don't cache user-specific cookies.

---

## Cloudflare Snippets Hard Limits (CRITICAL)

Snippets run on Cloudflare's Workers runtime but with **much tighter constraints** than full
Workers. These limits are non-negotiable and must be designed around.

Source: https://developers.cloudflare.com/rules/snippets/

### Subrequest Budget (Pro Plan)

| Plan       | Subrequests per request |
| ---------- | ----------------------- |
| Pro        | **2**                   |
| Business   | 3                       |
| Enterprise | 8                       |

**This design uses exactly 2 subrequests on cache MISS:**

1. Country Language Preference API fetch (edge-cached, but still counts on first call per
   datacenter)
2. Origin fetch

**⚠️ ZERO SLACK.** Any additional fetch would exceed the budget and fail the request.

Implications:

- Cannot add fallback fetches or retry logic
- Cannot fetch additional APIs (e.g., A/B test config)
- Redirect chains do NOT consume extra subrequests (redirects are returned to client, not followed)

### Runtime Limits

| Limit        | Value    | Notes                                |
| ------------ | -------- | ------------------------------------ |
| CPU time     | **5ms**  | Total execution time, not wall-clock |
| Memory       | **2MB**  | Heap allocation limit                |
| Package size | **32KB** | Total snippet code size              |

The reference snippet must stay well under these limits:

- Cookie parsing: O(n) where n = cookie header length
- JSON parse + base64 encode: kept minimal by using compact payload
- No recursive operations or large object allocations

### Cache API Behavior (Important Clarifications)

The Cache API (`caches.default`) has specific behaviors that differ from "global edge cache":

1. **Datacenter-local only**: `caches.default` is NOT globally replicated. Each CF datacenter has
   its own cache. A cache HIT in SFO doesn't mean HIT in LHR.

2. **No tiered caching**: `cache.put()` is incompatible with tiered caching. Content stored via
   Cache API only exists in the local datacenter, not in upper-tier caches.

3. **`cache.put()` constraints**:

   - Only accepts **GET** request keys (throws on POST, HEAD, etc.)
   - Responses with `Set-Cookie` are NOT cached unless you delete the header first
   - Responses with `Vary: *` cause `put()` to throw
   - Must clone response before put() since body can only be read once

4. **Cache key = Request object**: The cache key is the full Request URL. Our synthetic key approach
   (appending `__qdc_cc`, `__qdc_al`) works because we construct a new Request with method GET.

Source: https://developers.cloudflare.com/workers/runtime-apis/cache/

---

## Key API + Product Rules (must match codebase)

The codebase currently has explicit rules that impact which country is sent to the API:

- English (or unsupported languages that fall back to English): use the **actual detected country**.
- Supported non-English languages: ignore the user’s actual country and always use **US**.

This matters because `_cc` in the cache key should be the **country used for preference resolution**
(not always the raw `cf-ipcountry`).

In the repo this logic currently lives in:

- `src/utils/serverSideLanguageDetection.ts` (`getCountryCodeForPreferences`)

The Snippet must implement the same rules to stay aligned.

---

## Cookie Contract (Fix This First)

Today the codebase treats the presence of `NEXT_LOCALE` as “manual selection”, but server code can
also set `NEXT_LOCALE` automatically. That breaks “manual vs auto” semantics and can accidentally
disable redirects.

New contract:

1. `NEXT_LOCALE=<locale>`

   - “Preferred locale”, can be set by the user (manual) or by the edge (auto).

2. `QDC_MANUAL_LOCALE=1`
   - **Only** set when the user explicitly chooses a locale (or when a logged-in user’s remote
     preferences specify a locale).
   - This is the only signal that means “manual selection”.

Manual wins hard:

- If `QDC_MANUAL_LOCALE=1` and `NEXT_LOCALE=vi`, then requests to `/ar/*` should redirect to
  `/vi/*`.

---

## Precise Definitions (Spec)

These definitions MUST be followed exactly. Ambiguity here causes cache poisoning or auth bypass.

### Definition: "Anonymous User"

A request is considered **anonymous** (cacheable) if and only if it has **NONE** of these auth
cookies:

**Production cookies:**

- `at` - access token
- `id` - user ID token
- `rt` - refresh token

**Environment-specific cookies (must also check):**

- `at_staging`, `id_staging`, `rt_staging`
- `at_test`, `id_test`, `rt_test`
- `at_development`, `id_development`, `rt_development`

**Detection method**: Must use **exact cookie name matching** after parsing, NOT substring matching.
`includes('id=')` is WRONG because it matches `solid=123`. Use parsed cookie object:
`cookies['id']`.

**Other cookies that do NOT indicate auth** (safe to cache):

- `NEXT_LOCALE` - locale preference
- `QDC_MANUAL_LOCALE` - manual selection flag
- `_ga`, `_gid` - analytics (stripped by CF anyway)
- Consent/GDPR cookies

### Definition: "HTML Document Request"

A request is considered an **HTML document request** (eligible for locale routing + HTML caching)
if:

1. **Method**: `GET` only (not HEAD - see below)
2. **AND** one of:
   - `Sec-Fetch-Dest: document` header is present, OR
   - `Accept` header contains `text/html` AND `Sec-Fetch-Dest` is absent or `document`

**HEAD requests**: Must be handled specially or bypassed entirely (see "HEAD Request Handling"
below).

**What this excludes**:

- XHR/fetch requests that happen to accept HTML (they won't have `Sec-Fetch-Dest: document`)
- Image, script, stylesheet requests
- API calls

### Definition: "Geo Source"

Country detection uses `request.cf.country` (from the Workers runtime `cf` object), NOT a header.

```js
// CORRECT: Use request.cf object (available in Snippets)
const cfCountry = (request.cf?.country || 'US').toUpperCase();

// WRONG: Header may not exist or could be spoofed in some configs
const cfCountry = request.headers.get('cf-ipcountry');
```

Source: Snippets run on Workers runtime which provides `request.cf`:
https://blog.cloudflare.com/snippets/

### SSR HTML Invariants (Cache Safety)

The cache assumes anonymous SSR HTML varies **only** by:

- URL path + query string
- `_cc` (country for preferences)
- `_al` (accept-language primary)

**If SSR output varies by ANY of these, caching will serve wrong content:**

- A/B test assignments (must bypass cache or add to cache key)
- Feature flags (must bypass cache or add to cache key)
- Consent/GDPR state (must bypass cache or ensure no variation)
- Bot detection (must bypass cache for bots if output differs)

**Current assumption**: Quran.com SSR does NOT vary by these factors for anonymous users. If this
changes, update the cache key or bypass logic.

---

## Critical Blockers (Must Fix Before Shipping)

These are not theoretical: if you skip them, you will either get **no caching** or **conflicting
redirects**.

1. **Avoid `Set-Cookie` on cacheable SSR HTML**

   - If the origin sets `Set-Cookie` on every HTML response, the Snippet must (and should) treat it
     as uncacheable.
   - Today `src/utils/serverSideLanguageDetection.ts` calls `setServerLocaleCookie()`
     unconditionally, which causes `Set-Cookie` on every SSR response.
   - Result: the Snippet will bypass caching for all anonymous HTML (effectively **zero caching**).
   - Fix: remove/gate that call (see “Implementation Steps (Codebase) → Step B”).

2. **Introduce `QDC_MANUAL_LOCALE`**

   - The Snippet needs a reliable signal for “manual selection”.
   - The codebase currently only sets `NEXT_LOCALE`, and currently also _treats_ `NEXT_LOCALE` as
     “manual”.
   - Fix: set `QDC_MANUAL_LOCALE=1` when user explicitly chooses language (and update SSR logic
     accordingly) (see Step A).

3. **Single source of redirects**
   - If both the edge and origin redirect, you risk double redirects or fighting logic.
   - Fix: disable SSR redirects (recommended) or gate them behind an env flag (see Step C).

---

## High-Level Architecture

All requests to `ssr.quran.com/*` pass through the Snippet:

1. Detect auth cookies:

   - Authenticated => bypass cache and skip locale auto logic (or keep locale enforcement if you
     want; recommended: bypass all personalization).

2. For anonymous HTML document requests:

   - Resolve target locale:
     - Manual override cookie => use it.
     - Otherwise => call Country Language Preference API (cached at edge).
   - If URL locale != target locale => 307 redirect (no-store).
   - Else => serve HTML from edge cache (Cache API) keyed by URL + `_cc` + `_al`.

3. For non-HTML routes (assets, API endpoints, etc.):
   - Pass-through `fetch(request)` (no snippet caching).

---

## Implementation Steps (Codebase)

These changes make the origin SSR compatible with edge caching and align “manual vs auto”.

### Step A: Manual selection cookie

1. Update manual detection in:

- `src/utils/serverSideLanguageDetection.ts`

Change `hasManualLanguageSelection()` to check `QDC_MANUAL_LOCALE=1` instead of `NEXT_LOCALE`.

2. Update the client cookie setter:

- `src/utils/cookies.ts`

Update `setLocaleCookie(newLocale)` to set:

- `NEXT_LOCALE=<newLocale>`
- `QDC_MANUAL_LOCALE=1`

(Keep the long expiration for manual choice.)

3. Ensure “manual selection” code paths use `setLocaleCookie()`:

- `src/components/Navbar/LanguageSelector.tsx` (user explicitly chooses language)
- `src/utils/auth/syncPreferencesFromServer.ts` (remote preference locale should be treated as
  manual override)

### Step B: Stop origin from setting cookies on every SSR HTML response

If SSR sets `Set-Cookie` on every HTML response, it will either:

- prevent caching, or
- force the Snippet to strip `Set-Cookie` (which defeats why the server set it).

Action:

- In `src/utils/serverSideLanguageDetection.ts`, remove or gate the unconditional call:
  - `setServerLocaleCookie(effectiveLocale, context.res)`

Recommended: don’t set `NEXT_LOCALE` from SSR at all; let edge redirects + client code handle it.

### Step C: Disable server-side locale redirects (edge becomes source of truth)

Remove (or gate behind an env flag) SSR redirect behavior:

- `src/utils/withSsrRedux.ts` currently redirects when `performLanguageDetection()` says so.
- `src/utils/serverSideLanguageDetection.ts` (`withLanguageDetection`) similarly redirects.

Recommended for this design:

- No SSR redirects in the app. Edge handles locale redirects consistently and earlier.

Keep `performLanguageDetection()` (or replace it) only for fetching `countryLanguagePreference`
needed for defaults/Redux.

### Step D: Reuse edge-fetched preferences in SSR (eliminate double API call + layout shifts)

Because the Snippet already calls the Country Language Preference API, the origin SSR should not
repeat the same call for anonymous traffic. Instead, the Snippet injects a compact payload via a
request header, and SSR uses it to initialize Redux defaults synchronously.

What SSR needs for initial Redux state today (see `src/redux/defaultSettings/util.ts` and
`src/redux/Provider.tsx`):

- default mushaf id
- default translation ids
- default tafsir id
- default word-by-word iso code
- ayah reflections language iso codes
- learning plan language iso codes
- default reciter id
- country (the country used for preference resolution; matches `getCountryCodeForPreferences()`)
- userDeviceLanguage (the language used for preference resolution)

Notes:

- `defaultReciter` is applied in `src/redux/Provider.tsx` via the Audio Player XState service (guest
  defaults), not as Redux state. The payload should still include it so SSR can pass it through as
  `pageProps.countryLanguagePreference` and the provider can apply it without an extra API call.
- `src/redux/slices/defaultSettings.ts` expects `detectedCountry` and `detectedLanguage` to
  represent `countryPreference.country` and `countryPreference.userDeviceLanguage` respectively.
  Including `c` and `udl` in the compact payload lets SSR initialize these values correctly without
  a second API call.

Design:

- Snippet sets `x-qdc-country-language-preference` on the origin request (anonymous HTML only).
- Payload is `base64url(JSON)` in a compact “v1” shape (see the reference snippet).
- SSR parses and uses it; on parse/validation failure SSR falls back to calling the API.

Codebase change (recommended approach):

- In `src/utils/serverSideLanguageDetection.ts` (or in a helper it calls), before calling
  `getCountryLanguagePreference(...)`, attempt to read and parse the header.
- If present+valid, convert it into the shape expected by your Redux initial-state builder (either
  by enhancing `getStoreInitialState()` to accept the compact payload, or by mapping it into a
  minimal `CountryLanguagePreferenceResponse`-compatible object).

Example decode helper (Node/Next.js SSR):

```ts
type EdgeCountryPrefCompactV1 = {
  f: 'compact-v1';
  dm: number | null; // default mushaf id
  dt: number[]; // default translation ids
  dta: number | null; // default tafsir id
  dw: string | null; // default wbw iso code
  ar: string[]; // ayah reflections iso codes
  lp: string[]; // learning plan iso codes
  dr: number | null; // default reciter id
  c: string | null; // country (used for preference resolution)
  udl: string | null; // userDeviceLanguage (used for preference resolution)
};

const base64UrlToUtf8 = (value: string) => {
  const b64 = value
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(value.length / 4) * 4, '=');
  return Buffer.from(b64, 'base64').toString('utf8');
};

export const parseEdgeCountryPref = (headerValue?: string): EdgeCountryPrefCompactV1 | null => {
  if (!headerValue) return null;
  try {
    const json = JSON.parse(base64UrlToUtf8(headerValue));
    if (json?.f !== 'compact-v1') return null;
    return json as EdgeCountryPrefCompactV1;
  } catch {
    return null;
  }
};
```

Security notes:

- Treat the header as an optimization, not a security boundary.
- The Snippet must delete any client-supplied version of the header before setting its own (see
  snippet).

Known limitation:

- This optimization only helps **SSR**. Client-side flows that call
  `getCountryLanguagePreference(...)` (e.g. `src/components/Navbar/LanguageSelector.tsx` when a
  non-customized user changes locale) will still make client-side API calls. That’s usually
  acceptable since it happens on an explicit user action.

---

## Implementation Steps (Cloudflare)

### Step 1: Start clean for `ssr.quran.com`

Disable/remove any rules you previously used for SSR HTML:

- URL Rewrite / Transform rules that append `_cc/_al`.
- Cache Rules that cache SSR HTML.

The Snippet will own both routing and caching.

### Step 2: Create the Snippet

Create a snippet (e.g. `qdc-ssr-edge`) attached to `ssr.quran.com/*`.

The Snippet will:

- Bypass cache for authenticated users
- Do API-driven locale routing (307)
- Cache anonymous SSR HTML using a synthetic cache key

---

## Reference Snippet (Copy/Paste)

This is a reference implementation you can paste into Cloudflare Snippets and then adjust:

- `API_HOST` (prod vs staging)
- TTLs
- supported locales list (keep in sync with `i18n.json`)

```js
/**
 * Cloudflare Snippet: ssr.quran.com locale routing + HTML caching (Snippets-only)
 *
 * Key properties:
 * - No Transform Rules / Cache Rules required for SSR HTML.
 * - Anonymous HTML is cached with a synthetic cache key that includes:
 *   - __qdc_cc = country used for preference resolution
 *   - __qdc_al = primary accept-language (normalized)
 * - Locale redirects (307) are done at the edge using the Country Language Preference API.
 * - Manual selection wins hard via QDC_MANUAL_LOCALE=1 + NEXT_LOCALE=<locale>.
 */

const CONFIG = {
  HOSTNAME: 'ssr.quran.com',

  // Set this explicitly per environment.
  API_HOST: 'https://api.qurancdn.com',
  API_ROOT: '/api/qdc',

  // Bump on each deploy if you prefer "versioned cache keys" instead of purges.
  CACHE_VERSION: '1',

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

  // TTLs (tune as needed).
  HTML_TTL_SECONDS: 60 * 60, // 1 hour
  PREF_TTL_SECONDS: 15 * 60, // 15 minutes

  LOCALE_COOKIE: 'NEXT_LOCALE',
  MANUAL_LOCALE_COOKIE: 'QDC_MANUAL_LOCALE',

  // Snippet -> origin request header to avoid duplicate API calls on the server.
  // This should be treated as untrusted unless it comes from Cloudflare (we force-set it in the Snippet).
  COUNTRY_PREF_HEADER: 'x-qdc-country-language-preference',

  // Safety guard: keep header size predictable. If you switch to sending the full API response,
  // you must re-check header size limits.
  COUNTRY_PREF_FORMAT: 'compact-v1',

  DEBUG_PARAM: '__qdc_debug',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Only operate on ssr host.
    if (url.hostname !== CONFIG.HOSTNAME) {
      return fetch(request);
    }

    // IMPORTANT: Only handle GET requests for caching.
    // HEAD requests are problematic: cache.put() only accepts GET keys, and fetching
    // origin with HEAD then storing would cache empty bodies. Bypass HEAD entirely.
    if (request.method !== 'GET') {
      return fetch(request);
    }

    // Skip internal routes/assets. Keep this conservative.
    if (shouldBypassPath(url.pathname)) {
      return fetch(request);
    }

    const cookieHeader = request.headers.get('Cookie') || '';
    const cookies = parseCookies(cookieHeader);

    // Authenticated users: always bypass cache and skip edge locale routing.
    // Uses exact cookie name matching (not substring) to avoid false positives.
    if (hasAuthCookie(cookies)) {
      return fetch(request, { cf: { cacheTtl: 0, cacheEverything: false } });
    }

    // Only apply routing + caching to document navigations (GET + HTML).
    if (!isHtmlDocumentRequest(request)) {
      return fetch(request);
    }

    const { urlLocale, restPath, hadLocalePrefix } = splitLocaleFromPath(
      url.pathname,
      CONFIG.SUPPORTED_LOCALES,
    );

    const manualOverride = cookies[CONFIG.MANUAL_LOCALE_COOKIE] === '1';
    const manualLocale = normalizeLocale(cookies[CONFIG.LOCALE_COOKIE], CONFIG.SUPPORTED_LOCALES);

    const acceptLanguage = request.headers.get('Accept-Language') || '';
    const al =
      normalizeLocale(getPrimaryLanguage(acceptLanguage), CONFIG.SUPPORTED_LOCALES) ||
      CONFIG.DEFAULT_LOCALE;

    // Use request.cf.country (Workers runtime) instead of header for reliability.
    // Snippets run on Workers runtime and have access to request.cf object.
    const cfCountry = ((request.cf && request.cf.country) || 'US').toUpperCase();
    const languageForPreferences = manualOverride && manualLocale ? manualLocale : al;
    const ccForPreferences = getCountryForPreferences(
      languageForPreferences,
      cfCountry,
      CONFIG.SUPPORTED_LOCALES,
    );

    // Resolve target locale.
    let targetLocale = CONFIG.DEFAULT_LOCALE;
    let countryPreference = null;
    if (manualOverride && manualLocale) {
      targetLocale = manualLocale;
    } else {
      countryPreference = await getCountryPreference(ctx, languageForPreferences, ccForPreferences);
      const apiDefaultLocale = normalizeLocale(
        // API may return snake_case or camelCase.
        (countryPreference &&
          (countryPreference.defaultLocale || countryPreference.default_locale)) ||
          '',
        CONFIG.SUPPORTED_LOCALES,
      );
      targetLocale = apiDefaultLocale || al || CONFIG.DEFAULT_LOCALE;
    }

    // Canonicalize: on ssr.quran.com we prefer explicit locale prefix for all locales.
    // If URL has no locale prefix, treat it as needing a redirect to /<targetLocale>/...
    if (!urlLocale || urlLocale !== targetLocale) {
      const redirectUrl = new URL(url.toString());
      redirectUrl.pathname = `/${targetLocale}${restPath}`;
      // Preserve original query string.

      // Never cache redirects.
      const headers = new Headers();
      headers.set('Location', redirectUrl.toString());
      headers.set('Cache-Control', 'no-store');

      // Optional: set an "auto" NEXT_LOCALE cookie here (short-lived) if desired.
      // IMPORTANT: do NOT set QDC_MANUAL_LOCALE here.
      // headers.append('Set-Cookie', makeCookie(CONFIG.LOCALE_COOKIE, targetLocale, { maxAgeSeconds: 86400 }));

      return new Response(null, { status: 307, headers });
    }

    // Anonymous HTML caching using a synthetic cache key that includes _cc + _al.
    const cacheKeyUrl = new URL(url.toString());
    cacheKeyUrl.searchParams.set('__qdc_cc', ccForPreferences);
    // __qdc_al should reflect the language used for preference resolution:
    // - auto: primary Accept-Language
    // - manual: the manually selected locale
    cacheKeyUrl.searchParams.set('__qdc_al', languageForPreferences || CONFIG.DEFAULT_LOCALE);
    cacheKeyUrl.searchParams.set('__qdc_v', CONFIG.CACHE_VERSION);

    const cacheKeyReq = new Request(cacheKeyUrl.toString(), { method: 'GET' });
    const cache = caches.default;

    const cached = await cache.match(cacheKeyReq);
    if (cached) {
      const res = new Response(cached.body, cached);
      res.headers.set('x-qdc-edge-cache', 'HIT');
      res.headers.set('x-qdc-edge-locale', targetLocale);
      res.headers.set('x-qdc-edge-cc', ccForPreferences);
      res.headers.set('x-qdc-edge-al', languageForPreferences || CONFIG.DEFAULT_LOCALE);
      return res;
    }

    // Cache MISS: we will fetch from origin. If we haven't fetched country preference yet
    // (e.g. manual override path), fetch it now so SSR can initialize Redux without an extra API call.
    if (!countryPreference) {
      countryPreference = await getCountryPreference(ctx, languageForPreferences, ccForPreferences);
    }

    const originHeaders = new Headers(request.headers);
    // Prevent client-supplied cache poisoning of the injected header.
    originHeaders.delete(CONFIG.COUNTRY_PREF_HEADER);
    // Keep payload compact: only what SSR needs to build initial Redux defaults.
    // If countryPreference is null, SSR will fall back to its own API call (or locale defaults).
    if (countryPreference) {
      originHeaders.set(
        CONFIG.COUNTRY_PREF_HEADER,
        encodeCountryPreferenceCompactV1(countryPreference),
      );
    }

    const originReq = new Request(request, { headers: originHeaders });
    const originRes = await fetch(originReq, { cf: { cacheTtl: 0, cacheEverything: false } });

    // Cache only successful HTML responses without Set-Cookie.
    const contentType = originRes.headers.get('Content-Type') || '';
    const hasSetCookie = originRes.headers.has('Set-Cookie');
    const cacheable =
      originRes.status === 200 && contentType.includes('text/html') && !hasSetCookie;

    if (!cacheable) {
      const res = new Response(originRes.body, originRes);
      res.headers.set('x-qdc-edge-cache', 'BYPASS');
      res.headers.set('x-qdc-edge-locale', targetLocale);
      res.headers.set('x-qdc-edge-cc', ccForPreferences);
      res.headers.set('x-qdc-edge-al', languageForPreferences || CONFIG.DEFAULT_LOCALE);
      return res;
    }

    // Build a cacheable/sanitized response.
    const headers = new Headers(originRes.headers);
    headers.delete('Set-Cookie');
    headers.set('Cache-Control', `public, max-age=0, s-maxage=${CONFIG.HTML_TTL_SECONDS}`);
    headers.set('x-qdc-edge-cache', 'MISS');
    headers.set('x-qdc-edge-locale', targetLocale);
    headers.set('x-qdc-edge-cc', ccForPreferences);
    headers.set('x-qdc-edge-al', languageForPreferences || CONFIG.DEFAULT_LOCALE);

    const responseToReturn = new Response(originRes.body, {
      status: originRes.status,
      statusText: originRes.statusText,
      headers,
    });

    ctx.waitUntil(cache.put(cacheKeyReq, responseToReturn.clone()));
    return responseToReturn;
  },
};

function shouldBypassPath(pathname) {
  // These paths are "bypassed" by the SNIPPET, but NOT by Cloudflare's default caching!
  // When we return fetch(request) without cf options, the request still flows through
  // CF's standard cache layer. Static assets (JS, CSS, fonts, images) will be cached
  // by CF's default rules based on file extension and Cache-Control headers.
  //
  // This is intentional: we only want the snippet to handle HTML document caching
  // with custom cache keys. Assets use CF's default (and already-working) caching.
  if (pathname.startsWith('/_next/')) return true;
  if (pathname.startsWith('/api/')) return true;

  // Static assets: let CF's default caching handle these (they're already cached by extension).
  if (/\.(?:js|css|map|png|jpg|jpeg|gif|svg|webp|avif|ico|txt|xml|json|woff2?)$/i.test(pathname)) {
    return true;
  }

  return false;
}

function isHtmlDocumentRequest(request) {
  // Primary signal: Sec-Fetch-Dest header (most reliable for modern browsers)
  const dest = request.headers.get('Sec-Fetch-Dest') || '';
  if (dest === 'document') return true;

  // Fallback: Accept header contains text/html AND no conflicting dest
  // This catches older browsers that don't send Sec-Fetch-Dest
  const accept = request.headers.get('Accept') || '';
  if (accept.includes('text/html') && (dest === '' || dest === 'document')) {
    return true;
  }

  return false;
}

function parseCookies(cookieHeader) {
  // Defensively parse cookies - malformed values should not crash the snippet.
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
      // Malformed cookie value - store raw value instead of crashing
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

function getPrimaryLanguage(acceptLanguageHeader) {
  if (!acceptLanguageHeader) return CONFIG.DEFAULT_LOCALE;
  const primary = acceptLanguageHeader.split(',')[0] || '';
  const lang = primary.split('-')[0].split(';')[0].trim().toLowerCase();
  return lang || CONFIG.DEFAULT_LOCALE;
}

function splitLocaleFromPath(pathname, supportedLocales) {
  const hasTrailingSlash = pathname.length > 1 && pathname.endsWith('/');
  const parts = pathname.split('/').filter(Boolean);

  const first = parts[0] || '';
  const isLocale = supportedLocales.includes(first);

  if (!isLocale) {
    return { urlLocale: null, restPath: pathname, hadLocalePrefix: false };
  }

  const restParts = parts.slice(1);
  let restPath = `/${restParts.join('/')}`;
  if (restParts.length === 0) restPath = '/';
  if (hasTrailingSlash && restPath !== '/' && !restPath.endsWith('/')) restPath += '/';

  return { urlLocale: first, restPath, hadLocalePrefix: true };
}

function getCountryForPreferences(al, cfCountry, supportedLocales) {
  const isSupported = supportedLocales.includes(al);
  const isEnglish = al === 'en';

  // English or unsupported => use detected country (for country-specific English defaults).
  if (isEnglish || !isSupported) {
    const cc = (cfCountry || 'US').toUpperCase();
    return cc && cc.length === 2 ? cc : 'US';
  }

  // Supported non-English => ignore user country and use US.
  return 'US';
}

async function getCountryPreference(ctx, al, cc) {
  // Edge-cache the API JSON by (al, cc).
  const cacheKeyUrl = new URL(`https://${CONFIG.HOSTNAME}/__qdc_country_pref`);
  cacheKeyUrl.searchParams.set('al', al);
  cacheKeyUrl.searchParams.set('cc', cc);
  cacheKeyUrl.searchParams.set('v', CONFIG.CACHE_VERSION);

  const cacheKeyReq = new Request(cacheKeyUrl.toString(), { method: 'GET' });
  const cache = caches.default;

  const cached = await cache.match(cacheKeyReq);
  if (cached) {
    try {
      return await cached.json();
    } catch (e) {
      // fall through
    }
  }

  const apiUrl = new URL(
    `${CONFIG.API_HOST}${CONFIG.API_ROOT}/resources/country_language_preference`,
  );
  apiUrl.searchParams.set('user_device_language', al);
  apiUrl.searchParams.set('country', cc);

  const res = await fetch(apiUrl.toString(), {
    headers: { Accept: 'application/json' },
    cf: { cacheTtl: 0, cacheEverything: false },
  });

  if (!res.ok) return null;

  let json;
  try {
    json = await res.json();
  } catch (e) {
    return null;
  }

  const headers = new Headers();
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Cache-Control', `public, max-age=0, s-maxage=${CONFIG.PREF_TTL_SECONDS}`);

  // Store a serialized copy to ensure predictable cache semantics.
  ctx.waitUntil(
    cache.put(cacheKeyReq, new Response(JSON.stringify(json), { status: 200, headers })),
  );

  return json;
}

function hasAuthCookie(cookies) {
  // IMPORTANT: Use exact cookie name matching via parsed cookies object.
  // Substring matching (e.g., includes('id=')) is WRONG because it matches
  // unrelated cookies like 'solid=123' or 'android_id=xyz'.
  //
  // Auth cookie names by environment:
  // - Production: at, id, rt
  // - Staging: at_staging, id_staging, rt_staging
  // - Test: at_test, id_test, rt_test
  // - Development: at_development, id_development, rt_development
  const authCookieNames = [
    'at',
    'id',
    'rt',
    'at_staging',
    'id_staging',
    'rt_staging',
    'at_test',
    'id_test',
    'rt_test',
    'at_development',
    'id_development',
    'rt_development',
  ];
  // Check if ANY auth cookie exists with a non-empty value
  return authCookieNames.some((name) => {
    const value = cookies[name];
    return value !== undefined && value !== '';
  });
}

function encodeCountryPreferenceCompactV1(pref) {
  // Minimum fields needed by getStoreInitialState() + ReduxProvider guest defaults:
  // - defaultMushaf.id
  // - defaultTranslations[].id
  // - defaultTafsir.id
  // - defaultWbwLanguage.isoCode
  // - ayahReflectionsLanguages[].isoCode
  // - learningPlanLanguages[].isoCode
  // - defaultReciter.id
  // - country
  // - userDeviceLanguage
  //
  // We intentionally do not forward names/translatedName/etc to keep headers small.
  // NOTE: the API response may be snake_case or camelCase; support both.
  const defaultMushaf = pref?.defaultMushaf || pref?.default_mushaf;
  const defaultTranslations = pref?.defaultTranslations || pref?.default_translations || [];
  const defaultTafsir = pref?.defaultTafsir || pref?.default_tafsir;
  const defaultWbwLanguage = pref?.defaultWbwLanguage || pref?.default_wbw_language;
  const ayahReflectionsLanguages =
    pref?.ayahReflectionsLanguages || pref?.ayah_reflections_languages || [];
  const learningPlanLanguages = pref?.learningPlanLanguages || pref?.learning_plan_languages || [];
  const defaultReciter = pref?.defaultReciter || pref?.default_reciter;
  const country = pref?.country || null;
  const userDeviceLanguage = pref?.userDeviceLanguage || pref?.user_device_language || null;

  const payload = {
    f: CONFIG.COUNTRY_PREF_FORMAT,
    dm: defaultMushaf?.id || null,
    dt: defaultTranslations.map((t) => t?.id).filter((id) => typeof id === 'number'),
    dta: defaultTafsir?.id || null,
    dw: defaultWbwLanguage?.isoCode || defaultWbwLanguage?.iso_code || null,
    ar: ayahReflectionsLanguages
      .map((l) => l?.isoCode || l?.iso_code)
      .filter((code) => typeof code === 'string'),
    lp: learningPlanLanguages
      .map((l) => l?.isoCode || l?.iso_code)
      .filter((code) => typeof code === 'string'),
    dr: defaultReciter?.id || null,
    c: typeof country === 'string' ? country : null,
    udl: typeof userDeviceLanguage === 'string' ? userDeviceLanguage : null,
  };
  return base64UrlEncode(JSON.stringify(payload));
}

function base64UrlEncode(str) {
  // btoa is available in the runtime; convert to base64url.
  const b64 = btoa(unescape(encodeURIComponent(str)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
```

Notes:

- This snippet intentionally **does not** clean `_cc/_al` from redirect `Location` headers because
  we never put them in the URL.
- If your origin still sets `Set-Cookie` for anonymous HTML, fix that in the codebase (recommended)
  or the Snippet will bypass caching for those responses.
- The API query parameter name is `user_device_language` (snake_case). The codebase uses
  `userDeviceLanguage`, but it is decamelized by `makeUrl()` before it reaches the API. For the
  Snippet, use snake_case to be explicit.
- Redirect status: use **307** for temporary redirects. Next.js `getServerSideProps` temporary
  redirects are also 307 (not 302), so this aligns with current observed behavior.

---

## Snippet Design (Detailed)

### Inputs the Snippet uses

- `cf-ipcountry` header (Cloudflare-injected)
- `accept-language` header
- `Cookie` header (`NEXT_LOCALE`, `QDC_MANUAL_LOCALE`, auth cookies)

### How the Snippet determines `_al`

`_al` = primary language code:

- `accept-language: "vi-VN,vi;q=0.9,en-US;q=0.8"` => `_al = "vi"`
- If missing/invalid => `_al = "en"`

### How the Snippet determines `_cc`

`_cc` here means **countryForPreferences** (matches product rules), not always raw geo:

- If `_al === "en"` OR `_al` is unsupported => `_cc = cf-ipcountry` (fallback `US`)
- Else (supported non-English) => `_cc = "US"`

This must mirror `getCountryCodeForPreferences()` in `src/utils/serverSideLanguageDetection.ts`.

### Locale extraction from the URL

Decide what “URL locale” means:

- If the first path segment is one of `i18n.json` locales => that’s the URL locale.
- Otherwise treat it as “no locale in path”.

This design recommends canonicalizing URLs so **all locales include a prefix** on `ssr.quran.com`,
including English:

- `/` -> `/<resolvedLocale>/`
- `/some-page` -> `/<resolvedLocale>/some-page`

This avoids ambiguity and makes cache keys stable.

### Manual override logic (wins hard)

If `QDC_MANUAL_LOCALE=1` and `NEXT_LOCALE=<manualLocale>`:

- targetLocale = manualLocale
- If URL locale != targetLocale => redirect to targetLocale

No API call required.

### Auto locale logic (API-driven)

If no manual override:

- Determine `_al` + `_cc`
- Fetch country preference from API and read `defaultLocale`
- targetLocale = `defaultLocale` (validate against supported locales; fallback to `en`)
- If URL locale != targetLocale => redirect to targetLocale

API call caching:

- Cache the API response at the edge for a short TTL (e.g. 5–60 minutes), keyed by `_al + _cc`.
- This makes repeated locale decisions cheap without Workers.

### HTML caching logic

Cache anonymous HTML documents only:

- Only `GET`/`HEAD`
- Not authenticated
- Only document requests (Accept includes `text/html`)
- Exclude:
  - `/_next/`
  - `/api/`
  - file extensions (`.js`, `.css`, `.png`, etc.)

Cache key:

- Use a synthetic key that includes `_cc` + `_al` but never modifies the browser URL.
- Example internal key:
  - `https://ssr.quran.com/<targetLocale>/path?real=query&__qdc_cc=<cc>&__qdc_al=<al>&__qdc_v=<CACHE_VERSION>`

Store only cache-safe responses:

- Do not cache responses with `Set-Cookie`.
- Prefer caching a sanitized copy (remove `Set-Cookie`, set cache headers).

Debug headers:

- Add `x-qdc-edge-cache: HIT|MISS|BYPASS`
- Add `x-qdc-edge-locale: <targetLocale>`
- Add `x-qdc-edge-al: <al>`
- Add `x-qdc-edge-cc: <cc>`

---

## Deployment / Invalidation Strategy

Caching SSR HTML means HTML can reference build-hashed assets. After a deploy, stale HTML can
reference missing JS/CSS, breaking the page.

Choose one:

1. Purge Cloudflare cache on deploy (simple; already documented elsewhere).
2. Cache versioning (no purge required):
   - Define `CACHE_VERSION` in the Snippet and bump it on each deploy.
   - Include it in the synthetic cache key (`__qdc_v=<version>`).

Option (2) is often the cleanest operationally.

**Automating CACHE_VERSION bumps:**

- Use a CI/CD step that updates the Snippet via Cloudflare API after each deploy.
- Alternatively, use a build timestamp or git commit SHA as the version (e.g.,
  `CACHE_VERSION: Date.now().toString(36)` or inject via Cloudflare environment variable).
- If using Terraform/Pulumi for Cloudflare config, version the Snippet code in your IaC and let
  deploys auto-update it.

---

## Testing Checklist

### Locale routing

- Manual override wins:

  - Set cookies: `NEXT_LOCALE=vi; QDC_MANUAL_LOCALE=1`
  - Request `/ar/al-fatiha` => expect 307 to `/vi/al-fatiha`

- API-driven redirect:
  - Clear cookies
  - From a VN IP + `Accept-Language: en` => expect redirect to `/vi/...` if API returns `vi`
  - From a VN IP + `Accept-Language: ar` => expect redirect to `/ar/...` if API returns `ar`

### Caching behavior

- Anonymous HTML:

  - First request => `x-qdc-edge-cache: MISS`
  - Second request => `x-qdc-edge-cache: HIT`

- Auth bypass:

  - Send `Cookie: at=test`
  - Expect `x-qdc-edge-cache: BYPASS` (and no caching)

- Auth cookie exact matching:
  - Send `Cookie: solid=123` (contains "id=" as substring but not an auth cookie)
  - Expect caching to work (NOT bypassed)

### HEAD request handling

- HEAD requests should bypass snippet caching entirely:
  - `curl -I https://ssr.quran.com/en/al-fatiha`
  - Should NOT see `x-qdc-edge-cache` header (snippet didn't process it)
  - Should still work (returns headers from origin or CF default cache)

### Static assets (CRITICAL - verify CF default caching preserved)

- `/_next/static/*` assets should still be cached by Cloudflare's default caching:
  - Request `/_next/static/chunks/some-file.js` twice
  - Second request should show `CF-Cache-Status: HIT` (standard CF header, NOT x-qdc-edge-cache)
  - This proves the snippet's passthrough doesn't disable CF's built-in caching

### Safety

- Ensure you're not caching responses that include `Set-Cookie`.
- Ensure `/api/*` and `/_next/*` are never processed by the Snippet's custom caching logic.
- Ensure malformed cookies don't crash the snippet:
  - Send `Cookie: broken=%E0%A4%A` (invalid UTF-8 percent encoding)
  - Request should still work (snippet catches decode errors)

### Subrequest budget (Pro plan = 2 max)

- On cache MISS, verify we're not exceeding 2 subrequests:
  - 1: Country Preference API (only on first request per datacenter per al+cc combo)
  - 2: Origin fetch
- If API is cached, only 1 subrequest (origin fetch) should occur

---

## Migration Notes (from existing Transform Rules approach)

If you previously appended `_cc/_al` to the query string for cache key sharding:

- Remove those rules.
- Delete any code that cleans `_cc/_al` from redirect `Location` headers.
- Replace with synthetic cache key + edge redirects described here.

---

## Degraded Mode (API Failures)

If the Country Language Preference API is unavailable or returns an error:

1. **Locale Resolution Fallback**: The Snippet uses `_al` (primary Accept-Language) as the target
   locale instead of `defaultLocale` from the API.
2. **No Redirect Loop**: If fallback locale matches URL locale, no redirect occurs—user sees the
   page.
3. **Cache Behavior**: HTML is still cached (keyed by `_cc + _al`), but without API-derived
   preferences.
4. **SSR Fallback**: If `x-qdc-country-language-preference` header is missing/invalid, SSR calls the
   API itself (or uses hardcoded defaults if that also fails).

This ensures the site remains functional even during API outages, with graceful degradation to
browser language preferences.

---

## Open Decisions (defaults suggested)

1. Redirect status:

   - Use **307** for locale routing (keeps method semantics; consistent with current behavior).

2. Auto locale cookie:
   - Optional. You can avoid setting `NEXT_LOCALE` for auto-detection entirely and rely on edge API
     caching.
   - If you do set it, keep it short-lived and **do not** set `QDC_MANUAL_LOCALE`.

---

## Visual Summary: E2E Flow Diagrams

### Diagram 1: High-Level Overview (The Big Picture)

This shows the 5 possible outcomes for any request:

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           REQUEST TO ssr.quran.com                                  │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              CLOUDFLARE EDGE SNIPPET                                │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│   │   DEFAULT    │    │    BYPASS    │    │   REDIRECT   │    │    CACHED    │     │
│   │  CF CACHING  │    │              │    │              │    │              │     │
│   │              │    │ • Auth user  │    │ • URL locale │    │ • Cache HIT  │     │
│   │ • POST/PUT   │    │   (at=, id=) │    │   ≠ target   │    │ • Anonymous  │     │
│   │ • /_next/*   │    │              │    │ • 307 temp   │    │ • HTML doc   │     │
│   │ • /api/*     │    │              │    │              │    │              │     │
│   │ • Static     │    │              │    │              │    │              │     │
│   └──────┬───────┘    └──────┬───────┘    └──────┬───────┘    └──────┬───────┘     │
│          │                   │                   │                   │              │
│          ▼                   ▼                   ▼                   ▼              │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│   │ CF Default   │    │   Origin     │    │   Browser    │    │  Edge Cache  │     │
│   │ Cache (auto) │    │   (no cache) │    │  (redirect)  │    │   (1hr TTL)  │     │
│   └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘     │
│                                                                                     │
│   ┌──────────────────────────────────────────────────────────────────────────────┐ │
│   │                           5th OUTCOME: CACHE MISS                            │ │
│   │                                                                              │ │
│   │  Anonymous + HTML + URL matches target + Not in cache → Fetch from Origin   │ │
│   │  → If cacheable (200 + HTML + no Set-Cookie) → Store in cache (1hr)         │ │
│   │  → If not cacheable → Return as BYPASS                                      │ │
│   └──────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                     │
│   ⚠️  IMPORTANT LIMITATION: Cache API (caches.default) is DATACENTER-LOCAL.         │
│   A cache HIT in SFO doesn't mean HIT in LHR. Each CF datacenter has its own cache. │
│   This is NOT the same as tiered caching. First visitor per datacenter = MISS.     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Diagram 2: Request Classification Decision Tree

```
                                    REQUEST
                                       │
                    ┌──────────────────┴──────────────────┐
                    │           Method = GET?             │
                    │   (HEAD bypassed - see note below)  │
                    └──────────────────┬──────────────────┘
                           No ─────────┼───────── Yes
                            │          │            │
                            ▼          │            ▼
                      ┌─────────┐      │     ┌─────────────────────┐
                      │ DEFAULT │      │     │  Path = /_next/*    │
                      │CF CACHE │      │     │  or /api/* or       │
                      └─────────┘      │     │  static asset?      │
                                       │     └──────────┬──────────┘
                                       │       Yes ─────┼───── No
                                       │        │       │       │
                                       │        ▼       │       ▼
                                       │  ┌─────────┐   │  ┌─────────────────┐
                                       │  │ DEFAULT │   │  │ Has auth cookie │
                                       │  │CF CACHE │   │  │ (at=,id=,rt=)?  │
                                       │  │(JS,CSS) │   │  └────────┬────────┘
                                       │  └─────────┘   │   Yes ────┼──── No
                                       │                │    │      │      │
                                       │                │    ▼      │      ▼
                                       │                │ ┌──────┐  │ ┌─────────────┐
                                       │                │ │BYPASS│  │ │HTML document│
                                       │                │ │Origin│  │ │(Accept:html)│
                                       │                │ └──────┘  │ └──────┬──────┘
                                       │                │           │  No ───┼─── Yes
                                       │                │           │   │    │    │
                                       │                │           │   ▼    │    ▼
                                       │                │           │┌─────┐ │ ┌──────────┐
                                       │                │           ││ DEF │ │ │ LOCALE   │
                                       │                │           ││CACHE│ │ │ ROUTING  │
                                       │                │           │└─────┘ │ │ + CACHE  │
                                       │                │           │        │ └──────────┘
                                       │                │           │        │
                                       └────────────────┴───────────┴────────┘
```

**Important notes**:

- "DEFAULT CF CACHE" means the snippet delegates to Cloudflare's standard caching. Static assets
  (JS, CSS, fonts, images) are still cached by CF based on file extension.
- **HEAD requests bypass snippet entirely**: `cache.put()` only accepts GET request keys. Caching
  HEAD responses would store empty bodies. HEAD goes to CF default cache.

### Diagram 3: Locale Resolution Logic

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              LOCALE RESOLUTION                                       │
└─────────────────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────────────────┐
                    │   QDC_MANUAL_LOCALE=1 cookie set?   │
                    └─────────────────┬───────────────────┘
                           Yes ───────┼──────── No
                            │         │          │
                            ▼         │          ▼
                    ┌───────────────┐ │  ┌────────────────────────────────────┐
                    │ TARGET LOCALE │ │  │        COMPUTE _al and _cc         │
                    │ = NEXT_LOCALE │ │  ├────────────────────────────────────┤
                    │    cookie     │ │  │ _al = Accept-Language primary lang │
                    │               │ │  │       (e.g., "vi-VN" → "vi")       │
                    │ (Skip API!)   │ │  │       Fallback: "en"               │
                    └───────┬───────┘ │  ├────────────────────────────────────┤
                            │         │  │ _cc = Country for preferences:     │
                            │         │  │                                    │
                            │         │  │  if _al == "en" OR unsupported:    │
                            │         │  │    _cc = cf-ipcountry (geo)        │
                            │         │  │  else (supported non-English):     │
                            │         │  │    _cc = "US" (fixed)              │
                            │         │  └─────────────────┬──────────────────┘
                            │         │                    │
                            │         │                    ▼
                            │         │  ┌────────────────────────────────────┐
                            │         │  │   CALL COUNTRY PREFERENCE API      │
                            │         │  │   (edge-cached 15 min by al+cc)    │
                            │         │  │                                    │
                            │         │  │ GET /api/qdc/resources/            │
                            │         │  │     country_language_preference    │
                            │         │  │     ?user_device_language={_al}    │
                            │         │  │     &country={_cc}                 │
                            │         │  └─────────────────┬──────────────────┘
                            │         │                    │
                            │         │        ┌───────────┴───────────┐
                            │         │        │   API Success?        │
                            │         │        └───────────┬───────────┘
                            │         │           Yes ─────┼───── No (DEGRADED)
                            │         │            │       │        │
                            │         │            ▼       │        ▼
                            │         │     ┌────────────┐ │  ┌────────────┐
                            │         │     │TARGET =    │ │  │TARGET =    │
                            │         │     │API response│ │  │_al (Accept │
                            │         │     │defaultLoc  │ │  │ Language)  │
                            │         │     └─────┬──────┘ │  └─────┬──────┘
                            │         │           │        │        │
                            └─────────┴───────────┴────────┴────────┘
                                                  │
                                                  ▼
                                    ┌─────────────────────────┐
                                    │    TARGET LOCALE SET    │
                                    │  (proceed to redirect   │
                                    │   check or caching)     │
                                    └─────────────────────────┘
```

### Diagram 4: Cache Key Construction & Caching Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         CACHING FLOW (URL locale == Target)                         │
└─────────────────────────────────────────────────────────────────────────────────────┘

    INPUTS:
    ├── URL: https://ssr.quran.com/vi/al-fatiha?page=2
    ├── _cc: VN (or US for non-English)
    ├── _al: vi
    └── CACHE_VERSION: 1

                                        │
                                        ▼
        ┌───────────────────────────────────────────────────────────────┐
        │                    BUILD SYNTHETIC CACHE KEY                  │
        │                                                               │
        │   https://ssr.quran.com/vi/al-fatiha?page=2                  │
        │                     &__qdc_cc=VN                              │
        │                     &__qdc_al=vi                              │
        │                     &__qdc_v=1                                │
        │                                                               │
        │   ⚠️  These params are INTERNAL ONLY - never in browser URL   │
        └───────────────────────────────┬───────────────────────────────┘
                                        │
                                        ▼
                        ┌───────────────────────────────┐
                        │   CHECK CLOUDFLARE CACHE API  │
                        │   cache.match(syntheticKey)   │
                        └───────────────┬───────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    │                                       │
                HIT │                                       │ MISS
                    ▼                                       ▼
        ┌─────────────────────┐               ┌─────────────────────────────┐
        │   RETURN CACHED     │               │   FETCH FROM ORIGIN         │
        │                     │               │                             │
        │ x-qdc-edge-cache:   │               │ 1. Inject header:           │
        │   HIT               │               │    x-qdc-country-language-  │
        │ x-qdc-edge-locale:  │               │    preference (base64 JSON) │
        │   vi                │               │                             │
        │ x-qdc-edge-cc: VN   │               │ 2. Fetch origin (no CF      │
        │ x-qdc-edge-al: vi   │               │    caching: cacheTtl=0)     │
        └─────────────────────┘               └──────────────┬──────────────┘
                                                             │
                                                             ▼
                                              ┌──────────────────────────────┐
                                              │   IS RESPONSE CACHEABLE?     │
                                              │                              │
                                              │   ✓ Status = 200             │
                                              │   ✓ Content-Type = text/html │
                                              │   ✓ No Set-Cookie header     │
                                              └──────────────┬───────────────┘
                                                             │
                                        ┌────────────────────┴────────────────────┐
                                        │                                         │
                                   YES  │                                    NO   │
                                        ▼                                         ▼
                        ┌───────────────────────────┐           ┌───────────────────────────┐
                        │   STORE IN CACHE          │           │   RETURN AS-IS            │
                        │                           │           │                           │
                        │ 1. Strip Set-Cookie       │           │ x-qdc-edge-cache: BYPASS  │
                        │ 2. Set Cache-Control:     │           │                           │
                        │    s-maxage=3600 (1hr)    │           │ (Response has Set-Cookie  │
                        │ 3. cache.put(key, resp)   │           │  or non-200 or non-HTML)  │
                        │                           │           │                           │
                        │ x-qdc-edge-cache: MISS    │           └───────────────────────────┘
                        └───────────────────────────┘
```

### Diagram 5: Complete E2E Sequence (Happy Path - Anonymous User)

```
┌──────────┐        ┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│  Browser │        │  Cloudflare  │        │  Pref API    │        │   Origin     │
│          │        │  Edge        │        │  (cached)    │        │  (Next.js)   │
└────┬─────┘        └──────┬───────┘        └──────┬───────┘        └──────┬───────┘
     │                     │                       │                       │
     │  GET /al-fatiha     │                       │                       │
     │  Accept-Lang: vi    │                       │                       │
     │  cf-ipcountry: VN   │                       │                       │
     │ ───────────────────>│                       │                       │
     │                     │                       │                       │
     │                     │  (1) Classify: Anonymous HTML                 │
     │                     │  (2) No manual override                       │
     │                     │  (3) _al=vi, _cc=US (non-EN)                 │
     │                     │                       │                       │
     │                     │  GET pref?al=vi&cc=US │                       │
     │                     │ ─────────────────────>│                       │
     │                     │                       │                       │
     │                     │  {defaultLocale:"vi"} │                       │
     │                     │ <─────────────────────│                       │
     │                     │                       │                       │
     │                     │  (4) Target=vi, URL has no locale             │
     │                     │  (5) Redirect needed!                         │
     │                     │                       │                       │
     │  307 /vi/al-fatiha  │                       │                       │
     │  Cache-Control:     │                       │                       │
     │    no-store         │                       │                       │
     │ <───────────────────│                       │                       │
     │                     │                       │                       │
     │  GET /vi/al-fatiha  │                       │                       │
     │ ───────────────────>│                       │                       │
     │                     │                       │                       │
     │                     │  (6) URL locale=vi == Target=vi ✓             │
     │                     │  (7) Check cache → MISS                       │
     │                     │                       │                       │
     │                     │  GET /vi/al-fatiha    │                       │
     │                     │  x-qdc-country-lang-  │                       │
     │                     │    preference: <b64>  │                       │
     │                     │ ──────────────────────┼──────────────────────>│
     │                     │                       │                       │
     │                     │                       │  (8) Parse header     │
     │                     │                       │  (9) Skip API call    │
     │                     │                       │  (10) Build Redux     │
     │                     │                       │  (11) Render HTML     │
     │                     │                       │                       │
     │                     │  200 OK               │                       │
     │                     │  Content-Type: html   │                       │
     │                     │  (NO Set-Cookie!)     │                       │
     │                     │ <─────────────────────┼───────────────────────│
     │                     │                       │                       │
     │                     │  (12) Cacheable ✓     │                       │
     │                     │  (13) Store in cache  │                       │
     │                     │                       │                       │
     │  200 OK             │                       │                       │
     │  x-qdc-edge-cache:  │                       │                       │
     │    MISS             │                       │                       │
     │ <───────────────────│                       │                       │
     │                     │                       │                       │
┌────┴─────┐        ┌──────┴───────┐        ┌──────┴───────┐        ┌──────┴───────┐
│  Browser │        │  Cloudflare  │        │  Pref API    │        │   Origin     │
└──────────┘        └──────────────┘        └──────────────┘        └──────────────┘

    NEXT REQUEST (same user or different user with same _al/_cc):

     │  GET /vi/al-fatiha  │                       │                       │
     │ ───────────────────>│                       │                       │
     │                     │                       │                       │
     │                     │  Cache HIT!           │                       │
     │                     │  (No origin call)     │                       │
     │                     │                       │                       │
     │  200 OK             │                       │                       │
     │  x-qdc-edge-cache:  │                       │                       │
     │    HIT              │                       │                       │
     │ <───────────────────│                       │                       │
```

### Diagram 6: All Request Outcomes Summary Table

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  REQUEST OUTCOMES SUMMARY                                        │
├──────────────────┬──────────────────────────────────────────────────────────────────────────────┤
│ OUTCOME          │ CONDITIONS                              │ RESPONSE                          │
├──────────────────┼─────────────────────────────────────────┼───────────────────────────────────┤
│ DEFAULT CF CACHE │ • Method ≠ GET/HEAD                     │ fetch(request) - no cf options    │
│ (Snippet skips)  │ • Path: /_next/*, /api/*, *.js, etc.    │ CF's default caching still works! │
│                  │ • Non-HTML request (XHR, image, etc.)   │ Assets cached by file extension   │
│                  │                                         │ CF-Cache-Status: HIT/MISS         │
├──────────────────┼─────────────────────────────────────────┼───────────────────────────────────┤
│ BYPASS           │ • Has auth cookie (at=, id=, rt=)       │ fetch(request, {cacheTtl:0})      │
│ (No caching)     │                                         │ x-qdc-edge-cache: BYPASS          │
├──────────────────┼─────────────────────────────────────────┼───────────────────────────────────┤
│ 307 REDIRECT     │ • URL locale ≠ target locale            │ 307 Temporary Redirect            │
│                  │ • OR no URL locale prefix               │ Location: /{target}/...           │
│                  │                                         │ Cache-Control: no-store           │
├──────────────────┼─────────────────────────────────────────┼───────────────────────────────────┤
│ CACHE HIT        │ • Anonymous + HTML document             │ Return from snippet's edge cache  │
│ (Snippet cache)  │ • URL locale == target locale           │ x-qdc-edge-cache: HIT             │
│                  │ • Synthetic key exists in cache         │ (No origin call)                  │
├──────────────────┼─────────────────────────────────────────┼───────────────────────────────────┤
│ CACHE MISS       │ • Anonymous + HTML document             │ Fetch from origin                 │
│ (then STORE)     │ • URL locale == target locale           │ Store in snippet cache            │
│                  │ • Not in cache                          │ x-qdc-edge-cache: MISS            │
│                  │ • Origin returns 200 + HTML + no cookie │                                   │
├──────────────────┼─────────────────────────────────────────┼───────────────────────────────────┤
│ CACHE MISS       │ • Same as above BUT                     │ Fetch from origin                 │
│ (BYPASS)         │ • Origin returns Set-Cookie OR          │ Do NOT store                      │
│                  │   non-200 OR non-HTML                   │ x-qdc-edge-cache: BYPASS          │
└──────────────────┴─────────────────────────────────────────┴───────────────────────────────────┘

IMPORTANT DISTINCTION:
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ "DEFAULT CF CACHE" vs "SNIPPET CACHE" are DIFFERENT:                                           │
│                                                                                                │
│ • DEFAULT CF CACHE: Cloudflare's built-in caching based on file extension, Cache-Control      │
│   headers, and zone settings. Used for /_next/*, static assets. Cache key = URL (standard).  │
│                                                                                                │
│ • SNIPPET CACHE: Our custom caching via Cache API with synthetic keys including _cc + _al.    │
│   Used for HTML documents only. Cache key = URL + __qdc_cc + __qdc_al + __qdc_v.             │
│                                                                                                │
│ When snippet does `return fetch(request)` (no cf options), the request STILL goes through     │
│ CF's default cache layer. JS/CSS/fonts/images are cached normally - snippet just doesn't      │
│ interfere with them.                                                                           │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Diagram 7: Cookie Contract

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                               COOKIE CONTRACT                                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│   ┌─────────────────────────────────────────────────────────────────────────────┐  │
│   │                           NEXT_LOCALE=<locale>                               │  │
│   ├─────────────────────────────────────────────────────────────────────────────┤  │
│   │ Purpose:    "Preferred locale" - can be auto or manual                       │  │
│   │ Set by:     Client (language selector) OR Edge (optional, short-lived)       │  │
│   │ NOT set by: Origin SSR (would break caching!)                                │  │
│   │ Meaning:    "This is the user's current locale preference"                   │  │
│   │             Does NOT by itself indicate manual selection                     │  │
│   └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
│   ┌─────────────────────────────────────────────────────────────────────────────┐  │
│   │                          QDC_MANUAL_LOCALE=1                                 │  │
│   ├─────────────────────────────────────────────────────────────────────────────┤  │
│   │ Purpose:    "User explicitly chose this locale" flag                         │  │
│   │ Set by:     Client ONLY - when user clicks language selector                 │  │
│   │             OR when syncing logged-in user's remote preferences              │  │
│   │ NOT set by: Edge (ever!) or Origin SSR                                       │  │
│   │ Meaning:    "MANUAL SELECTION - ignore country, Accept-Language, API"        │  │
│   │             This is the ONLY signal that means "manual"                      │  │
│   └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
│   DECISION LOGIC:                                                                   │
│   ┌─────────────────────────────────────────────────────────────────────────────┐  │
│   │                                                                              │  │
│   │   if (QDC_MANUAL_LOCALE === "1" && NEXT_LOCALE is valid) {                  │  │
│   │       // MANUAL: Use NEXT_LOCALE directly, skip API                         │  │
│   │       targetLocale = NEXT_LOCALE;                                            │  │
│   │   } else {                                                                   │  │
│   │       // AUTO: Call Country Preference API                                   │  │
│   │       targetLocale = api.defaultLocale || acceptLanguage || "en";           │  │
│   │   }                                                                          │  │
│   │                                                                              │  │
│   └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
│   MANUAL WINS HARD (example):                                                       │
│   ┌─────────────────────────────────────────────────────────────────────────────┐  │
│   │ Cookies: NEXT_LOCALE=vi; QDC_MANUAL_LOCALE=1                                │  │
│   │ Request: GET /ar/al-fatiha                                                  │  │
│   │ Result:  307 Redirect → /vi/al-fatiha                                       │  │
│   │                                                                              │  │
│   │ Even though URL says /ar/*, user manually chose Vietnamese → force /vi/*    │  │
│   └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Diagram 8: Country (\_cc) Resolution Logic

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                          _cc (COUNTRY FOR PREFERENCES) LOGIC                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  This is NOT always the user's geo-location! It follows product rules:              │
│                                                                                     │
│  ┌────────────────────────────────────────────────────────────────────────────────┐│
│  │                                                                                ││
│  │   INPUT: _al (Accept-Language primary), cf-ipcountry (Cloudflare geo)         ││
│  │                                                                                ││
│  │   if (_al === "en" || _al is NOT in SUPPORTED_LOCALES) {                      ││
│  │       // English or unsupported language → use actual geo                     ││
│  │       // Reason: Country-specific English defaults (e.g., US vs UK vs IN)     ││
│  │       _cc = cf-ipcountry || "US";                                             ││
│  │   } else {                                                                     ││
│  │       // Supported non-English language → IGNORE geo, use "US"                ││
│  │       // Reason: Non-English users get language-specific defaults,            ││
│  │       //         not country-specific ones                                    ││
│  │       _cc = "US";                                                              ││
│  │   }                                                                            ││
│  │                                                                                ││
│  └────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                     │
│  EXAMPLES:                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │ Accept-Language  │  cf-ipcountry  │  _cc (result)  │  Reason               │   │
│  ├───────────────────┼────────────────┼────────────────┼───────────────────────┤   │
│  │ en               │  VN            │  VN            │  English uses geo     │   │
│  │ en               │  US            │  US            │  English uses geo     │   │
│  │ vi               │  VN            │  US            │  Non-EN → fixed US    │   │
│  │ vi               │  US            │  US            │  Non-EN → fixed US    │   │
│  │ ar               │  EG            │  US            │  Non-EN → fixed US    │   │
│  │ de (unsupported) │  DE            │  DE            │  Unsupported uses geo │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  WHY THIS MATTERS:                                                                  │
│  - Cache key includes _cc, so different _cc values = different cache entries       │
│  - English speakers in different countries may get different default translations  │
│  - Non-English speakers get consistent defaults regardless of location             │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```
