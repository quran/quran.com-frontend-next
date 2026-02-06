# Code Review: Cloudflare Edge Caching Snippet

**File**: `cloudflare/snippets/qdc-ssr-edge-cache.js` **Reviewed**: 2026-02-05

---

## ✅ What's Done Well

| Aspect                | Notes                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Security**          | Private pages require `userKey`, auth routes always bypass, token queries bypass, Set-Cookie checked before caching |
| **Cache Key Design**  | Bucketing by prefs hash is clever — users with same preferences share cache without leaking data                    |
| **Redirect Safety**   | Only safe locale redirects cached, origin 3xx explicitly not cached to prevent poisoning                            |
| **Fallback Handling** | `ctx.waitUntil` checked before use, catches for URL parsing, guards for missing cookies                             |
| **URL Normalization** | UTM/tracking params stripped, query sorted for consistent keys                                                      |
| **Emergency Bust**    | `CACHE_VERSION` allows instant global cache invalidation                                                            |

---

## ⚠️ Issues & Recommendations

### 🔴 HIGH: Private Pages Without `prefsKey` Don't Include `userKey` in Cache Key

**Location**: Lines 746-752 (`buildHtmlCacheKeyUrl`) and Lines 289-295 (`handleNextDataRequest`)

**Current Code**:

```javascript
if (prefsKey) {
  cacheKeyUrl.searchParams.set('__qdc_p', prefsKey);
  if (isPrivate && userKey) cacheKeyUrl.searchParams.set('__qdc_u', userKey);
} else {
  cacheKeyUrl.searchParams.set('__qdc_d', localeForPreferences);
  cacheKeyUrl.searchParams.set('__qdc_c', countryForPreferences);
}
```

**Issue**: If `prefsKey` is null but `isPrivate && userKey` is true, `userKey` is NOT added to cache
key. This means different users without prefs cookies could share a private page cache.

**Impact**: Potential data leakage on private pages (e.g., `/profile`, `/collections`) for users who
don't have `QDC_PREFS_KEY` cookie set.

**Fix**:

```javascript
if (prefsKey) {
  cacheKeyUrl.searchParams.set('__qdc_p', prefsKey);
} else {
  cacheKeyUrl.searchParams.set('__qdc_d', localeForPreferences);
  cacheKeyUrl.searchParams.set('__qdc_c', countryForPreferences);
}
// Always add userKey for private pages, regardless of prefsKey
if (isPrivate && userKey) cacheKeyUrl.searchParams.set('__qdc_u', userKey);
```

---

### 🟡 MEDIUM: `/complete-signup` in Both PRIVATE and BYPASS Lists

**Location**: Lines 64 and 71

**Current Code**:

```javascript
PRIVATE_PATH_PREFIXES: [..., '/complete-signup'],
BYPASS_PATH_PREFIXES: [..., '/complete-signup'],
```

**Issue**: `/complete-signup` appears in both lists. The BYPASS check runs first (line 132), so it
works correctly, but this is confusing and could cause bugs if execution order changes.

**Recommendation**: Remove `/complete-signup` from `PRIVATE_PATH_PREFIXES` since it's always
bypassed anyway.

---

### 🟡 MEDIUM: `shouldBypassHtmlPath` vs `isBypassPath` Inconsistency

**Location**: Lines 359-376 vs Lines 392-396

**Current Code**:

```javascript
// shouldBypassHtmlPath (used for HTML) - Line 363
if (pathname === prefix || pathname.startsWith(prefix)) return true;

// isBypassPath (used for /_next/data) - Line 394
if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return true;
```

**Issue**: Different logic! `shouldBypassHtmlPath` matches `/authXYZ`, `/authCallback`, etc., but
`isBypassPath` only matches `/auth` or `/auth/...`. This inconsistency could allow bypass of auth
checks on `/_next/data` paths.

**Recommendation**: Make both functions consistent by using `pathname.startsWith(`${prefix}/`)` in
`shouldBypassHtmlPath`:

```javascript
// shouldBypassHtmlPath - consistent with isBypassPath
if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return true;
```

---

### 🟢 LOW: Dead Code - `isOnlyCloudflareCookies` Function

**Location**: Lines 595-600

**Current Code**:

```javascript
function isOnlyCloudflareCookies(setCookieHeader) {
  const names = getSetCookieNames(setCookieHeader);
  if (names.length === 0) return true;
  const allowed = new Set(['__cf_bm', 'cf_clearance', '__cfruid']);
  return names.every((name) => allowed.has(name));
}
```

**Issue**: This function is defined but never called anywhere in the file.

**Recommendation**: Remove it or add a comment explaining future intent.

---

### 🟢 LOW: Dead Code - `isCacheableHtmlOriginResponse` Function

**Location**: Lines 539-550

**Current Code**:

```javascript
function isCacheableHtmlOriginResponse(res) {
  if (!res) return false;
  if (res.status < 200 || res.status >= 300) return false;
  const contentType = res.headers.get('Content-Type') || '';
  if (!contentType.includes('text/html')) return false;
  const setCookie = res.headers.get('Set-Cookie');
  if (setCookie) return false;
  return true;
}
```

**Issue**: This function is defined but never called. Likely was used before switching to
`cf.cacheEverything`.

**Recommendation**: Remove it or document why it's kept for future use.

---

### 🟢 LOW: `getUserIdCookieValue` Matches Too Broadly

**Location**: Lines 486-492

**Current Code**:

```javascript
function getUserIdCookieValue(cookies) {
  if (cookies.id) return cookies.id;
  // Support env-suffixed cookie names (e.g. id_staging).
  for (const key in cookies) {
    if (key === 'id' || key.startsWith('id_')) return cookies[key];
  }
  return null;
}
```

**Issue**: Any cookie starting with `id_` is treated as user ID. A cookie like `id_tracker=foo` or
`id_campaign=123` would be incorrectly used as user identity.

**Risk**: Could cause cache key collisions or incorrect user isolation if third-party cookies match
this pattern.

**Recommendation**: Use an explicit allowlist of known cookie names:

```javascript
const ID_COOKIE_NAMES = ['id', 'id_staging', 'id_production', 'id_development'];

function getUserIdCookieValue(cookies) {
  for (const name of ID_COOKIE_NAMES) {
    if (cookies[name]) return cookies[name];
  }
  return null;
}
```

---

### 🟢 LOW: Content API Cache Key Doesn't Include User Context

**Location**: Lines 324-356 (`handleContentApiRequest`)

**Observation**: Content API caching uses only URL-based cache keys with no user/prefs bucketing:

```javascript
cacheKeyUrl.searchParams.set('__qdc_v', CONFIG.CACHE_VERSION);
cacheKeyUrl.searchParams.set('__qdc_t', 'api');
// No user/prefs context added
```

**Current Behavior**: This is correct IF the allowlisted endpoints are truly public.

**Risk**: If a user-specific API is added to `CONTENT_API_ALLOWLIST_PREFIXES` in the future, it
would be cached globally without user isolation.

**Recommendation**: Add a warning comment:

```javascript
CONTENT_API_ALLOWLIST_PREFIXES: [
  // WARNING: Only add truly public endpoints here.
  // User-specific APIs require separate handling with user context in cache key.
  '/api/proxy/content/api/qdc/verses/by_chapter/',
  '/api/proxy/content/api/qdc/resources/translations',
  '/api/proxy/content/api/qdc/resources/country_language_preference',
],
```

---

## 📋 Summary of Actionable Fixes

| Priority  | Issue                                                    | Location               | Action                                                    |
| --------- | -------------------------------------------------------- | ---------------------- | --------------------------------------------------------- |
| 🔴 HIGH   | Private pages without `prefsKey` don't include `userKey` | Lines 746-752, 289-295 | Move `userKey` addition outside the `if (prefsKey)` block |
| 🟡 MEDIUM | `/complete-signup` in both lists                         | Lines 64, 71           | Remove from `PRIVATE_PATH_PREFIXES`                       |
| 🟡 MEDIUM | `shouldBypassHtmlPath` matches too broadly               | Line 363               | Use `pathname.startsWith(`${prefix}/`)`                   |
| 🟢 LOW    | Dead code: `isOnlyCloudflareCookies`                     | Lines 595-600          | Remove or document                                        |
| 🟢 LOW    | Dead code: `isCacheableHtmlOriginResponse`               | Lines 539-550          | Remove or document                                        |
| 🟢 LOW    | `id_*` cookie matching too broad                         | Lines 486-492          | Use explicit allowlist                                    |
| 🟢 LOW    | Content API missing user context warning                 | Lines 78-82            | Add warning comment                                       |

---

## 📝 Language Variant Handling (en-GB vs en-US, etc.)

**Location**: Lines 700-711 (`getDeviceLanguageFromAcceptLanguage`)

**Current Code**:

```javascript
const base = tag.split('-')[0]; // "en-GB" → "en", "zh-TW" → "zh"
return supportedLocales.includes(base) ? base : defaultLocale;
```

**Behavior**: All regional variants are collapsed to the base language code:

| Accept-Language | Resolved To |
| --------------- | ----------- |
| `en-US`         | `en`        |
| `en-GB`         | `en`        |
| `zh-TW`         | `zh`        |
| `zh-CN`         | `zh`        |
| `pt-BR`         | `pt`        |
| `fr-CA`         | `fr`        |

**Status**: ✅ Working as designed for current `SUPPORTED_LOCALES` (which only contains base codes).

**⚠️ Future Consideration**: If you ever need to differentiate between variants (e.g., `zh-TW`
Traditional vs `zh-CN` Simplified as separate locales), this logic would need to be updated to check
for full locale codes before falling back to base codes:

```javascript
// Future: if regional variants become separate supported locales
if (supportedLocales.includes(tag)) return tag; // "zh-tw" exact match
const base = tag.split('-')[0];
return supportedLocales.includes(base) ? base : defaultLocale;
```

---

## ✅ No Action Needed (Working As Designed)

- **Trailing slash normalization** — Correctly returns 308 with `no-store`
- **Locale redirect caching** — Safely validates same-origin and locale prefix
- **Token bypass** — All OAuth/SSO query params trigger bypass
- **Cache version** — Allows emergency global cache bust
- **TTL configuration** — Sensible defaults (1h HTML, 24h redirects/API)
