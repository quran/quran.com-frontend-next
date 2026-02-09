# QF-318 Edge Cache Verification (Onboarding)

Goal: onboard someone to verify `ssr.quran.com` edge caching behavior quickly and consistently.

Do not use `curl -I` (`HEAD`). The snippet only runs on `GET`, so `HEAD` will usually show missing
`X-QDC-*` headers and look like a false failure.

## Headers (Response)

| Header | Meaning | Notes |
| --- | --- | --- |
| `X-QDC-Edge-Cache` | Snippet result: `HIT | MISS | BYPASS` | Header is **absent** when the snippet bypasses entirely |
| `X-QDC-Edge-Cache-Key` | Full computed cache key URL | Source of truth for which bucket you hit |
| `CF-Cache-Status` | Cloudflare cache result | Useful for HTML `cf.cacheEverything`; not the primary signal |
| `Age` | Cache age (seconds) | Usually only meaningful when the response is cacheable |
| `Location` | Redirect target | Expected for locale/manual redirects |

## Cache-Key Fields (Inside `X-QDC-Edge-Cache-Key`)

| Field | Meaning | When present |
| --- | --- | --- |
| `__qdc_v` | Cache key version | Always when snippet handles |
| `__qdc_l` | Locale of the response | Always for HTML + `/_next/data` |
| `__qdc_p` | Preferences bucket (`QDC_PREFS_KEY`) | When cookie `QDC_PREFS_KEY=<token>` exists |
| `__qdc_d` | Device-language bucket | When **no** `__qdc_p` |
| `__qdc_c` | Country bucket | When **no** `__qdc_p` |
| `__qdc_u` | User bucket (hashed `id` cookie) | Private pages only |
| `__qdc_t` | Cache API key type: `redir | data | api` | For redirect cache, `/_next/data`, and allowlisted content API |
| `__qdc_m` | Manual selection flag | Only for `__qdc_t=redir` |
| `__qdc_ml` | Manual locale | Only for `__qdc_t=redir` |

## Locale And Bucketing Rules (What “Looks Weird” But Is Correct)

These rules explain common “why is it US?” questions.

| Item | Rule | Where to observe |
| --- | --- | --- |
| Locale of the response | `__qdc_l` comes from URL prefix first (`/vi/...`), otherwise `NEXT_LOCALE`, otherwise default (`en`). | `X-QDC-Edge-Cache-Key` |
| Guest “device language” bucket | `__qdc_d` is the base language from `Accept-Language` (e.g., `vi-VN` -> `vi`). If `QDC_MANUAL_LOCALE=1`, the manual locale is used instead of `Accept-Language`. | `X-QDC-Edge-Cache-Key` |
| Guest “country” bucket | `__qdc_c` is a cache bucketing value, not “your real country”. QF-318 bucketing forces `US` for supported non-English device languages to reduce cache fragmentation. Only English buckets use the real 2-letter country code. | `X-QDC-Edge-Cache-Key` |

If you see `__qdc_d=vi&__qdc_c=US` while physically in Vietnam, that is expected.

## API Defaults Sanity Checks (Country + Device Language)

Defaults come from the content API `country_language_preference` contract. Fast checks:

| Input | Expected fields |
| --- | --- |
| `user_device_language=vi&country=VN` | `default_locale=vi`, `qr_default_locale=vi` |
| `user_device_language=vi&country=US` | Same as VN (Vietnamese defaults are stable across country input) |
| `user_device_language=en&country=VN` | `default_locale=vi`, `qr_default_locale=en` |

## Expected Matrix (Most Common Checks)

| Case | Example | `X-QDC-Edge-Cache` | `X-QDC-Edge-Cache-Key` must contain | Must NOT contain |
| --- | --- | --- | --- | --- |
| Guest HTML, supported non-English (example `vi`) | `GET /vi/53` + `Accept-Language: vi` | Present (`MISS` then may become `HIT`) | `__qdc_l=vi`, `__qdc_d=vi`, `__qdc_c=US` | `__qdc_p`, `__qdc_u` |
| Guest HTML with prefs cookie | `GET /vi/53` + `Cookie: QDC_PREFS_KEY=demo123` | Present | `__qdc_l=vi`, `__qdc_p=demo123` | `__qdc_d`, `__qdc_c`, `__qdc_u` |
| Public HTML with auth cookie should not change key | `GET /vi/53` + `Cookie: id=...` | Present | Same key as guest for same URL | `__qdc_u` |
| Private HTML requires `id` cookie for snippet caching | `GET /vi/profile` (no `id`) | Header absent | (absent) | (n/a) |
| Token/auth query bypass | `GET /vi/1?token=...` | Header absent | (absent) | (n/a) |
| Manual locale redirect (non-default) | `GET /` + `QDC_MANUAL_LOCALE=1; NEXT_LOCALE=es` | Present | `__qdc_t=redir`, `__qdc_m=1`, `__qdc_ml=es` | (n/a) |
| Manual locale = default (`en`) should not force `/en` | `GET /` + `QDC_MANUAL_LOCALE=1; NEXT_LOCALE=en` | Present | Not required to be `redir` | `Location: /en...` |
| Allowlisted content API | `GET /api/proxy/content/.../country_language_preference?...` | Present | `__qdc_t=api` | `__qdc_u`, `__qdc_p` |
| Non-allowlisted content API | Any other `/api/proxy/content/...` not on allowlist | Header absent | (absent) | (n/a) |

## Quick Run

Use the automated onboarding verifier:

```bash
BASE_URL=https://ssr.quran.com ./scripts/qf-318/onboard-verify.sh
```

It prints PASS/FAIL per case and shows the relevant headers when a check fails.
