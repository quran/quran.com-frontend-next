# QF-318 SSR + Cloudflare Edge Caching (Notion Pack)

Purpose: one page you can paste into Notion to onboard engineers/QA and align on the source of
truth.

## Source Of Truth (Order Of Precedence)

1. Implementation (code)
   - Cloudflare Snippet: `cloudflare/snippets/qdc-ssr-edge-cache.js`
   - SSR preferences application: `src/utils/withSsrRedux.ts` (SSR reads `QDC_PREFS`)
2. Executable specs (tests)
   - Production edge behavior: `tests/integration/qf-318-edge/*`
   - Production product behavior: `tests/integration/qf-318-prod-product/*`
   - Local deterministic behavior: `tests/integration/qf-318-cache/*`, `tests/integration/qf-318-product/*`, `tests/integration/localization/*`
3. Engineering docs (accurate if kept in sync with (1) and (2))
   - E2E flow: `docs/qf-318-edge-e2e-flow.md`
   - Automated test plan: `docs/qf-318-automated-test-plan.md`
   - Onboarding verification: `docs/qf-318-edge-cache-verification.md`
4. Supporting docs (useful context, not authoritative)
   - Edge caching summary: `docs/cloudflare-edge-caching-summary.md` (summary)
   - Edge snippet code review: `docs/cloudflare-edge-cache-code-review.md` (review notes)
   - Product acceptance criteria: `jira-specs.md`

If anything conflicts: trust (1) and (2) first.

---

## What To Verify (Fast)

Always capture these response headers:
- `X-QDC-Edge-Cache` (snippet: `HIT | MISS | BYPASS`; absent means snippet bypassed entirely)
- `X-QDC-Edge-Cache-Key` (computed key URL; inspect query params)
- `CF-Cache-Status`, `Age` (Cloudflare cache; secondary signals)
- `Location` (redirect verification)

### Cache-Key Fields (Inside `X-QDC-Edge-Cache-Key`)

| Field | Meaning | When present |
| --- | --- | --- |
| `__qdc_v` | cache key version | whenever snippet handles |
| `__qdc_l` | response locale key | HTML + `/_next/data` |
| `__qdc_p` | prefs bucket (`QDC_PREFS_KEY`) | when `QDC_PREFS_KEY=<token>` exists |
| `__qdc_d` | device-language bucket | when no `__qdc_p` |
| `__qdc_c` | country bucket | when no `__qdc_p` |
| `__qdc_u` | user bucket (hashed `id`) | private pages only |
| `__qdc_t` | Cache API key type: `redir | data | api` | redirect cache, `/_next/data`, allowlisted content API |
| `__qdc_m` | manual locale flag | only for `__qdc_t=redir` |
| `__qdc_ml` | manual locale | only for `__qdc_t=redir` |

### “Why Is `__qdc_c=US` In Vietnam?” (Expected)

- `__qdc_c` is a **cache bucketing value**, not “your real country”.
- QF-318 bucketing forces `US` for **supported non-English** device languages to reduce cache fragmentation.
- Only English buckets use the real 2-letter country code (because defaults can vary by country).

Quick API sanity checks (content API contract):

| Input | Expected fields |
| --- | --- |
| `user_device_language=vi&country=VN` | `default_locale=vi`, `qr_default_locale=vi` |
| `user_device_language=vi&country=US` | same as VN (stable) |
| `user_device_language=en&country=VN` | `default_locale=vi`, `qr_default_locale=en` |

### Expected Matrix (Common Scenarios)

| Case | Example | Expect `X-QDC-Edge-Cache-Key` contains | Must NOT contain |
| --- | --- | --- | --- |
| Guest HTML, supported non-English (example `vi`) | `GET /vi/53` + `Accept-Language: vi` | `__qdc_l=vi`, `__qdc_d=vi`, `__qdc_c=US` | `__qdc_p`, `__qdc_u` |
| Guest HTML with prefs cookie | `GET /vi/53` + `QDC_PREFS_KEY=demo123` | `__qdc_l=vi`, `__qdc_p=demo123` | `__qdc_d`, `__qdc_c`, `__qdc_u` |
| Public HTML with auth cookie | `GET /vi/53` + `id=...` | (same key as guest for same URL) | `__qdc_u` |
| Private HTML with auth | `GET /vi/profile` + `id=...` | `__qdc_u=<hash>` (and `__qdc_p` if prefs exists) | (n/a) |
| Private HTML without `id` | `GET /vi/profile` | (snippet bypass; header absent) | (n/a) |
| Token/auth query bypass | `GET /vi/1?token=...` | (snippet bypass; header absent) | (n/a) |
| Manual locale redirect (non-default) | `GET /` + `QDC_MANUAL_LOCALE=1; NEXT_LOCALE=es` | `__qdc_t=redir`, `__qdc_m=1`, `__qdc_ml=es` | (n/a) |
| `/_next/data` JSON | `GET /_next/data/<buildId>/vi/1.json` | `__qdc_t=data`, `__qdc_l=vi` | (n/a) |
| Allowlisted content API | `GET /api/proxy/content/.../country_language_preference?...` | `__qdc_t=api` | `__qdc_u`, `__qdc_p` |
| Non-allowlisted content API | other `/api/proxy/content/...` | (snippet bypass; header absent) | (n/a) |

---

## How To Run Verification (Recommended)

### 1) Onboarding verifier (curl, PASS/FAIL)

```bash
BASE_URL=https://ssr.quran.com bash scripts/qf-318/onboard-verify.sh
```

### 2) Production edge integration suite (Playwright)

```bash
PLAYWRIGHT_TEST_BASE_URL=https://ssr.quran.com \\
TEST_USER_EMAIL=\"...\" TEST_USER_PASSWORD=\"...\" \\
yarn test:integration --reporter=list tests/integration/qf-318-edge
```

### 3) Production product regression suite (Playwright, mutating + cleanup)

```bash
PLAYWRIGHT_TEST_BASE_URL=https://ssr.quran.com \\
TEST_USER_EMAIL=\"...\" TEST_USER_PASSWORD=\"...\" \\
yarn test:integration --reporter=list tests/integration/qf-318-prod-product
```

---

## Notes / Known Gotchas

- `curl -I` uses `HEAD` and will usually miss `X-QDC-*` because the snippet only runs on `GET`.
- The allowlisted content API endpoint may return `403` unless you send a normal `User-Agent` and a
  `Referer` header.
- For private routes: without an `id` cookie the snippet intentionally bypasses caching (no
  `X-QDC-*` headers).
