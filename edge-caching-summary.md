# Quran.com Edge Caching — Preference-Set SSR HTML Cache (QF-318)

This document summarizes the **current** SSR caching approach for `ssr.quran.com`:

- **No Workers**: Cloudflare **Snippets** only.
- **SSR personalization** comes from a cookie snapshot (`QDC_PREFS`) so the first paint matches user
  settings.
- **Edge HTML caching** buckets pages by a **stable preferences hash** (`QDC_PREFS_KEY`) so
  logged-in users can benefit too.

---

## Why this exists

SSR pages were expensive because defaults + preferences were computed server-side for every request.
With QF-318, defaults vary by country/device-language; and for logged-in users, settings may differ
per user.

Goal: **cache as much HTML at the edge as possible** while keeping QF-318 behavior intact (guest +
logged-in).

---

## What we cache

We cache only:

- `GET` requests
- HTML document navigations (`Sec-Fetch-Dest: document` or `Accept: text/html`)
- `2xx` responses
- responses that **do not** include `Set-Cookie`

We never cache:

- non-GET
- `/_next/*`, `/api/*`
- auth flows: `/auth`, `/logout`, `/login`, `/complete-signup`, `/forgot-password`,
  `/reset-password`
- requests with token-like query params (`token`, `code`, `redirectBack`, etc.)
- redirects/errors

---

## Cache key strategy

The edge cache key is based on:

1. **Normalized URL** (tracking params stripped; query sorted)
2. **Locale** (URL prefix if present, else `NEXT_LOCALE`, else `en`)
3. One of:
   - `QDC_PREFS_KEY` (preference-set bucket), or
   - `country bucket` (guest-first-visit bucket)
4. For **private/auth-required routes** only: `userKey` (hashed user id cookie) to prevent
   cross-user leakage

Country bucket rules (QF-318 aligned):

- `en` (or unsupported language): use real `request.cf.country`
- supported non-English locale: always use `US`

---

## Implementation pointers

### Edge snippet (Cloudflare)

- Source: `cloudflare/snippets/qdc-ssr-edge-cache.js`
- Debug headers:
  - `X-QDC-Edge-Cache: HIT|MISS|BYPASS`

### SSR cookie snapshot

Cookies:

- `QDC_PREFS` — base64url(JSON), SSR-relevant preferences snapshot
- `QDC_PREFS_KEY` — short stable hash used for cache bucketing
- `QDC_PREFS_VER=1` — schema version
- `QDC_MANUAL_LOCALE=1` — “user explicitly chose language” marker

Code:

- SSR reads cookie and applies preferences before rendering:
  - `src/utils/withSsrRedux.ts`
- Cookie utilities:
  - `src/utils/qdcPreferencesCookies.ts`
- Client keeps cookie in sync with Redux + audio context:
  - `src/redux/Provider.tsx`

### Purge on deploy

- Script: `scripts/cloudflare/purge-ssr-cache.mjs`

---

## How to verify

- SSR preferences applied:
  - `node scripts/qf-318/ssr-prefs.test.mjs`
- Edge cache smoke:
  - `BASE_URL=https://ssr.quran.com LOCALE=en ./scripts/qf-318/edge-cache-smoke.sh`

## Production verification (real-life)

- Edge smoke (safe, no mutations):
  - `PLAYWRIGHT_TEST_BASE_URL="https://ssr.quran.com" ./scripts/qf-318/run-edge-smoke.sh`
- Product smoke (mutating + cleanup, requires creds):
  - `PLAYWRIGHT_TEST_BASE_URL="https://ssr.quran.com" TEST_USER_EMAIL="..." TEST_USER_PASSWORD="..." ./scripts/qf-318/run-prod-product-smoke.sh`

Reports:

- `test-results/qf-318-real-world/` (real-world browser report)

## E2E flow (diagram + plain English)

- See: `docs/qf-318-edge-e2e-flow.md`
