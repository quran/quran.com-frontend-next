# Cloudflare Configuration Guide (SSR HTML cache by preference-set)

This guide configures **Cloudflare Snippets** (no Workers) to cache SSR HTML for `ssr.quran.com`
while keeping QF-318 behavior intact for guests + logged-in users.

> Source snippet: `cloudflare/snippets/qdc-ssr-edge-cache.js`

---

## Step 1: Create/Update the Snippet

**Cloudflare Dashboard → Rules → Snippets**

- Create (or update) a snippet named: `qdc-ssr-edge-cache`
- Paste the contents of `cloudflare/snippets/qdc-ssr-edge-cache.js`
- Attach it to: `ssr.quran.com/*`

---

## Step 2: Verify the origin is cacheable

The snippet **will not cache** an HTML response if:

- the origin sends `Set-Cookie` (to avoid caching per-request mutations)
- the response is not `2xx`

Important repo-side requirement (already implemented in this plan):

- Server-side language detection must **not** `Set-Cookie` on every SSR response.

Important Cloudflare requirement:

- Disable any Cache Rules/Page Rules that cache **HTML by URL only** (the Snippet is the source of truth for HTML caching and uses a custom cache key).

---

## Step 3: Validate caching behavior

### Quick curl checks

```bash
curl -sS -D - -o /dev/null -H "Accept: text/html" https://ssr.quran.com/en/1 | grep -i x-qdc-edge-cache
curl -sS -D - -o /dev/null -H "Accept: text/html" https://ssr.quran.com/en/1 | grep -i x-qdc-edge-cache
```

Expected: first request `MISS`, second request `HIT`.

### Redirect caching (fixes slow `/` and `/5`)

```bash
curl -sS -D - -o /dev/null -H "Accept: text/html" https://ssr.quran.com/ | grep -Ei '^(HTTP/|location:|x-qdc-edge-cache:)'
curl -sS -D - -o /dev/null -H "Accept: text/html" https://ssr.quran.com/ | grep -Ei '^(HTTP/|location:|x-qdc-edge-cache:)'
```

Expected: second request shows `X-QDC-Edge-Cache: HIT` for the redirect response.

### Full smoke script

```bash
BASE_URL=https://ssr.quran.com LOCALE=en ./scripts/qf-318/edge-cache-smoke.sh
```

---

## Step 4: Invalidation strategy

You have two options:

1. **Purge on deploy** (recommended):

```bash
CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ZONE_ID=... node scripts/cloudflare/purge-ssr-cache.mjs
```

2. **Cache version bump**:

- Update `CACHE_VERSION` inside `cloudflare/snippets/qdc-ssr-edge-cache.js`
- Re-deploy the snippet

---

## Notes

- Guest (no `QDC_PREFS_KEY`) caching uses **country bucketing** per QF-318 rules.
- Once `QDC_PREFS_KEY` exists, caching buckets by **preference-set**, improving HIT rate even for
  logged-in users with the same preference-set.
