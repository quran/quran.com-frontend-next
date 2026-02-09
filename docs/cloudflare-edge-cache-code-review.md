# Code Review: Cloudflare Edge Caching Snippet

**File**: `cloudflare/snippets/qdc-ssr-edge-cache.js`  
**Reviewed**: 2026-02-09

This doc is intentionally short and accuracy-first. It reflects the current snippet in this repo.

## Current Status

- The snippet’s cache-key construction and bypass rules match the QF-318 goals:
  - Guest HTML is bucketed by `(__qdc_d=deviceLanguage, __qdc_c=countryBucket)` when no `QDC_PREFS_KEY`.
  - Preference-set HTML is bucketed by `__qdc_p=QDC_PREFS_KEY`.
  - Private HTML is isolated per-user via `__qdc_u=<stableHash(id-cookie)>` and bypasses if no id cookie.
- Origin redirects are not cached in the HTML path (`cf.cacheTtlByStatus` sets `301-308: 0`).
- Safe locale redirects are cached separately via `caches.default` (`__qdc_t=redir`).
- `/_next/data/*` and a strict allowlist of public content APIs are cached via `caches.default`.

## Resolved Review Items (Previously Flagged)

All items in the earlier 2026-02-05 draft review are resolved in the current snippet:

- Private keys include `__qdc_u` regardless of whether `__qdc_p` exists.
- `/complete-signup` is only in the BYPASS list (not also in PRIVATE).
- BYPASS prefix matching is consistent (`/prefix` or `/prefix/...`), avoiding accidental bypass of
  lookalike routes (example: `/login-help` should not match `/login`).
- Removed/avoided unused helper functions that were previously dead code.
- User id cookie selection is an explicit allowlist (no broad `id_*` matching).
- Content API allowlist has an explicit “public only” warning.

## Non-Bug Risks To Watch

These are product constraints, not snippet bugs:

- **Public HTML must be user-agnostic**: public routes share cache across guest and logged-in users.
  If SSR starts rendering user-specific UI on a public route, the cache can leak it.
- **Allowlist discipline**: anything added to `CONTENT_API_ALLOWLIST_PREFIXES` must be truly public
  (no auth, no per-user personalization).
- **Locale variants**: `Accept-Language` parsing collapses to base tags (`en-US` -> `en`). If you
  ever need `zh-TW` vs `zh-CN` as distinct locales, this must change.
- **“HEAD looks broken”**: the snippet only runs on `GET`. `curl -I` will often be a false alarm.

## How To Validate Quickly

- Onboarding checklist + expected headers/key fields: `docs/qf-318-edge-cache-verification.md`
- One-command smoke verifier (curl, PASS/FAIL): `scripts/qf-318/onboard-verify.sh`
- Production edge behavior (Playwright): `tests/integration/qf-318-edge/*`
