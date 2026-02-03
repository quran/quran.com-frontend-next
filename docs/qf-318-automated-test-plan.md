# QF-318 — Automated Test Plan (SSR personalization + edge caching)

This runbook documents **every automated test case we can run** to validate:

- QF‑318 localization + default settings behavior (guest, logged-out, logged-in).
- SSR personalization via `QDC_PREFS` (first paint matches preferences).
- Cloudflare Snippet edge caching correctness (HIT/MISS/BYPASS; no auth caching; no private leakage).

Sources of truth:

- Product/acceptance criteria: `jira-specs.md`
- QA suite mapping: `qdc-default-settings-test-matrix.md` + `QF-2026-02-02.json`
- Engineering smoke scripts: `scripts/qf-318/*`

---

## Scope

In scope:

- **Guest**: first-time defaults by country/language rules; later customized preferences.
- **Logged-out**: behaves like guest (except persistence flows).
- **Logged-in**: preferences persisted + SSR respects prefs on initial load.
- **Caching**:
  - Public pages cached by `URL + locale + prefsKey` (or `countryBucket` when no prefsKey).
  - Private pages cached **per user** (no cross-user leakage).
  - Auth/token routes are **never cached**.

Out of scope:

- Content correctness of Quran data itself (covered elsewhere).
- Cache purge/invalidation API tests (optional; requires Cloudflare API token).

---

## Environments

### Local deterministic (recommended for full functional coverage)

- Runs against `http://localhost:<PORT>` using Playwright’s `webServer`.
- Uses MSW (see `playwright.config.ts`) to make localization tests deterministic.
- Best for validating QF‑318 product behavior and cookie semantics.

### Production edge smoke (recommended for caching correctness)

- Runs against `https://ssr.quran.com` (real Cloudflare Snippet in front).
- Only runs **safe smoke tests** that:
  - do GET navigations/requests,
  - read response headers + `__NEXT_DATA__`,
  - avoid mutating user data.

---

## Secrets / inputs (never commit these)

### Required for logged-in automation

- `TEST_USER_EMAIL`
- `TEST_USER_PASSWORD`

Optional (stronger isolation proof):

- `TEST_USER2_EMAIL`
- `TEST_USER2_PASSWORD`

Optional (cache purge / deploy validation):

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ZONE_ID`
- `CLOUDFLARE_HOSTNAME` (defaults to `ssr.quran.com` in scripts)

---

## How to run (commands)

### Prereqs

- Node **18.x** (repo enforces this in `package.json`).
- Dependencies installed: `yarn install --frozen-lockfile`
- Playwright browsers (for local CI/dev):
  - `npx playwright install --with-deps`

### Unit/contract tests (Vitest)

```bash
yarn test
```

Optional:

```bash
yarn test:coverage
```

### Local Playwright (guest-only / deterministic)

```bash
yarn test:integration --project=chromium
```

### Local Playwright (include logged-in suites)

Provide credentials:

```bash
TEST_USER_EMAIL="..." TEST_USER_PASSWORD="..." yarn test:integration
```

### Production edge smoke (safe subset)

Run only `@edge-smoke` tests against production:

```bash
PLAYWRIGHT_TEST_BASE_URL="https://ssr.quran.com" \
TEST_USER_EMAIL="..." TEST_USER_PASSWORD="..." \
yarn test:integration --project=chromium --grep @edge-smoke
```

Convenience wrapper:

```bash
PLAYWRIGHT_TEST_BASE_URL="https://ssr.quran.com" \
TEST_USER_EMAIL="..." TEST_USER_PASSWORD="..." \
./scripts/qf-318/run-edge-smoke.sh
```

### Production product smoke (mutating + cleanup)

Runs real user flows against production and always resets settings back to defaults:

```bash
PLAYWRIGHT_TEST_BASE_URL="https://ssr.quran.com" \
TEST_USER_EMAIL="..." TEST_USER_PASSWORD="..." \
./scripts/qf-318/run-prod-product-smoke.sh
```

### Engineering smoke scripts (fast)

SSR reads cookie prefs:

```bash
node scripts/qf-318/ssr-prefs.test.mjs
```

Edge cache HIT/MISS basics:

```bash
BASE_URL="https://ssr.quran.com" LOCALE="vi" ./scripts/qf-318/edge-cache-smoke.sh
```

Real-world performance comparison (`ssr.quran.com` vs `quran.com`):

```bash
./scripts/qf-318/real-world-perf-compare.sh
```

---

## Automated test catalog

| ID | Persona | Env | Tool | Command/Spec | Assertions |
|---|---|---|---|---|---|
| UT-COOK-01 | any | local/CI | Vitest | `src/utils/qdcPreferencesCookies.test.ts` | Encode/decode roundtrip; rejects invalid/oversize; schema version; stable key |
| UT-SNIP-01 | any | local/CI | Vitest | `src/utils/qdcEdgeCacheSnippetHelpers.test.ts` | Locale parsing; bypass rules; country bucketing; URL normalization; userKey hashing |
| E2E-LOCAL-LOC-01 | guest | local | Playwright | `tests/integration/localization/qdc-localization.spec.ts` | QF‑318 defaults detection + reset + language switching flows (deterministic via MSW) |
| E2E-LOCAL-LANG-01 | guest | local | Playwright | `tests/integration/language/*` | Manual locale switch + persistence across pages |
| E2E-LOCAL-SSR-01 | guest | local | Playwright | `tests/integration/SSR/ssr-no-js.spec.ts` | Key pages render without JS |
| E2E-LOCAL-SSR-PREFS-01 | guest/logged-in | local | Playwright | `tests/integration/qf-318-cache/qf-318-ssr-prefs-cookie.spec.ts` | `QDC_PREFS` affects first paint (`ssrPreferencesApplied=true`, Redux state matches) |
| E2E-LOCAL-LOCALE-01 | guest | local | Playwright | `tests/integration/qf-318-cache/qf-318-manual-locale-cookie.spec.ts` | `NEXT_LOCALE` + `QDC_MANUAL_LOCALE=1` set on manual switch; navigation stays in locale |
| E2E-LOCAL-NOSETCOOKIE-01 | guest | local | Playwright | `tests/integration/qf-318-cache/qf-318-no-ssr-set-cookie.spec.ts` | Normal SSR pages don’t emit `Set-Cookie` (protects edge cache eligibility) |
| E2E-LOCAL-PROD-01 | guest | local | Playwright | `tests/integration/qf-318-product/change-language-when-customised.spec.ts` | Customised settings are preserved on locale switch |
| E2E-LOCAL-PROD-02 | guest | local | Playwright | `tests/integration/qf-318-product/change-language-when-not-customised.spec.ts` | Defaults update on locale switch when not customised |
| E2E-LOCAL-PROD-03 | guest | local | Playwright | `tests/integration/qf-318-product/reset-settings.spec.ts` | Reset restores detected defaults |
| EDGE-PUB-01 | guest | prod | Playwright | `tests/integration/qf-318-edge/edge-public-cache-hit.spec.ts` | Same URL twice → eventual `X-QDC-Edge-Cache: HIT` |
| EDGE-SSR-01 | any | prod | Playwright | `tests/integration/qf-318-edge/edge-ssr-prefs-applied.spec.ts` | Crafted `QDC_PREFS` applied server-side; validate `__NEXT_DATA__` |
| EDGE-AUTH-01 | any | prod | Playwright | `tests/integration/qf-318-edge/edge-auth-bypass.spec.ts` | Auth/token routes never return `HIT` |
| EDGE-LOCALE-01 | guest | prod | Playwright | `tests/integration/qf-318-edge/edge-manual-locale-root-redirect.spec.ts` | Manual locale cookie drives root redirect; redirect eventually HIT |
| EDGE-NEXTDATA-01 | guest | prod | Playwright | `tests/integration/qf-318-edge/edge-next-data-cache-hit.spec.ts` | `/_next/data` JSON becomes HIT after warm |
| EDGE-API-01 | guest | prod | Playwright | `tests/integration/qf-318-edge/edge-content-api-cache-hit.spec.ts` | Allowlisted content API becomes HIT and strips `Set-Cookie` |
| EDGE-NO-LEAK-01 | logged-in | prod | Playwright | `tests/integration/qf-318-edge/edge-public-no-user-leak.spec.ts` | Logged-in public HTML does not SSR-leak identity |
| EDGE-PRIV-KEY-01 | logged-in-like | prod | Playwright | `tests/integration/qf-318-edge/edge-private-cache-key.spec.ts` | Different `id` cookies → different `X-QDC-Edge-Cache-Key` |
| EDGE-PRIV-HIT-01 | logged-in | prod | Playwright | `tests/integration/qf-318-edge/edge-private-cache-hit.spec.ts` | After login: private page second request → `HIT` (per-user bucket) |
| PROD-PROD-01 | logged-in | prod | Playwright | `tests/integration/qf-318-prod-product/prod-product.spec.ts` | Pref change persists across reload |
| PROD-PROD-02 | logged-in | prod | Playwright | `tests/integration/qf-318-prod-product/prod-product.spec.ts` | Locale switch preserves settings when customised |
| PROD-PROD-03 | logged-in | prod | Playwright | `tests/integration/qf-318-prod-product/prod-product.spec.ts` | Locale switch updates defaults when not customised |
| PROD-PROD-04 | guest | prod | Playwright | `tests/integration/qf-318-prod-product/prod-product.spec.ts` | Guest locale switch applies defaults when not customised |
| PROD-PROD-05 | guest | prod | Playwright | `tests/integration/qf-318-prod-product/prod-product.spec.ts` | Guest locale switch preserves customised settings |
| SMOKE-SSR-CLI-01 | any | prod | Node script | `scripts/qf-318/ssr-prefs.test.mjs` | SSR reads `QDC_PREFS` and reflects in Redux state |
| SMOKE-EDGE-CLI-01 | guest | prod | Bash script | `scripts/qf-318/edge-cache-smoke.sh` | Guest bucket HIT; prefsKey bucket HIT; auth bypass; private-key isolation |

---

## Pass/Fail criteria

You can consider QF‑318 **verified** when:

- All **Vitest** tests pass.
- Local Playwright:
  - `qdc-localization.spec.ts` passes (core product logic),
  - language persistence passes,
  - SSR no-JS pages render,
  - QF‑318 cache integration specs pass.
- Production edge smoke:
  - public pages show `HIT` on repeat for the same bucket,
  - SSR applies cookie prefs on first paint,
  - auth routes never show `HIT`,
  - private route cache keys differ per user,
  - (with creds) private pages can reach `HIT` on repeat.
- Production product smoke:
  - logged-in persistence works,
  - reset restores defaults,
  - locale switch branching rules work for guest + logged-in.

If any production edge smoke test flakes:

- Re-run once (PoP / async cache put can cause transient MISS).
- If it still fails, treat as real regression and investigate headers:
  - `X-QDC-Edge-Cache`
  - `X-QDC-Edge-Cache-Key`
  - any unexpected `Set-Cookie` on document responses
