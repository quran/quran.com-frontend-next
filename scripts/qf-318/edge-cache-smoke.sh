#!/usr/bin/env bash
set -euo pipefail

# QF-318 Edge cache smoke test (Cloudflare Snippet)
#
# Verifies:
# - Guest (no prefsKey): second request should HIT (country-bucketed)
# - With prefsKey: second request should HIT (prefs-bucketed)
# - Private route: per-user isolation (same prefsKey, different id cookie => MISS)
# - Auth routes are not cached (no HIT)
#
# Usage:
#   BASE_URL=https://ssr.quran.com LOCALE=en ./scripts/qf-318/edge-cache-smoke.sh

BASE_URL="${BASE_URL:-https://ssr.quran.com}"
LOCALE="${LOCALE:-en}"

read_header() {
  local url="$1"
  local cookie="${2:-}"
  if [[ -n "$cookie" ]]; then
    curl -sS -D - -o /dev/null -H "Accept: text/html" -H "Cookie: $cookie" "$url"
  else
    curl -sS -D - -o /dev/null -H "Accept: text/html" "$url"
  fi
}

get_edge_cache_status() {
  grep -i "^x-qdc-edge-cache:" | head -n 1 | awk '{print $2}' | tr -d '\r'
}

get_edge_cache_key() {
  grep -i "^x-qdc-edge-cache-key:" | head -n 1 | cut -d' ' -f2- | tr -d '\r'
}

echo "== Guest (no prefsKey) =="
URL="${BASE_URL}/${LOCALE}/1"
HEAD1="$(read_header "$URL" || true)"
HEAD2="$(read_header "$URL" || true)"
STATUS1="$(echo "$HEAD1" | get_edge_cache_status || true)"
STATUS2="$(echo "$HEAD2" | get_edge_cache_status || true)"
echo "1st: ${STATUS1:-<none>}  2nd: ${STATUS2:-<none>}"
if [[ "$STATUS2" != "HIT" ]]; then
  echo "Expected 2nd request to be HIT for guest (no prefsKey)."
  echo
  echo "---- 1st response headers ----"
  echo "$HEAD1" | sed -n '1,60p'
  echo "---- 2nd response headers ----"
  echo "$HEAD2" | sed -n '1,60p'
  exit 1
fi

echo "== Root redirect caching (/ → /<locale>) =="
ROOT_URL="${BASE_URL}/"
ROOT_HEAD1="$(read_header "$ROOT_URL" || true)"
ROOT_HEAD2="$(read_header "$ROOT_URL" || true)"
ROOT_STATUS1="$(echo "$ROOT_HEAD1" | get_edge_cache_status || true)"
ROOT_STATUS2="$(echo "$ROOT_HEAD2" | get_edge_cache_status || true)"
ROOT_LOC="$(echo "$ROOT_HEAD2" | grep -i '^location:' | head -n 1 | awk '{print $2}' | tr -d '\r')"
echo "1st: ${ROOT_STATUS1:-<none>}  2nd: ${ROOT_STATUS2:-<none>}  location: ${ROOT_LOC:-<none>}"
if [[ "$ROOT_STATUS2" != "HIT" ]]; then
  echo "Expected 2nd request to be HIT for the root redirect."
  exit 1
fi

echo "== Logged-in-like (prefsKey bucket) =="
PREFS_COOKIE="QDC_PREFS_KEY=demo123; QDC_PREFS_VER=1"
HEAD1="$(read_header "$URL" "$PREFS_COOKIE" || true)"
HEAD2="$(read_header "$URL" "$PREFS_COOKIE" || true)"
STATUS1="$(echo "$HEAD1" | get_edge_cache_status || true)"
STATUS2="$(echo "$HEAD2" | get_edge_cache_status || true)"
echo "1st: ${STATUS1:-<none>}  2nd: ${STATUS2:-<none>}"
if [[ "$STATUS2" != "HIT" ]]; then
  echo "Expected 2nd request to be HIT for prefsKey bucket."
  echo
  echo "---- 1st response headers ----"
  echo "$HEAD1" | sed -n '1,60p'
  echo "---- 2nd response headers ----"
  echo "$HEAD2" | sed -n '1,60p'
  exit 1
fi

echo "== Private route per-user isolation =="
PRIVATE_URL="${BASE_URL}/${LOCALE}/profile"
COOKIE_USER1="QDC_PREFS_KEY=demo123; QDC_PREFS_VER=1; id=111"
COOKIE_USER2="QDC_PREFS_KEY=demo123; QDC_PREFS_VER=1; id=222"

HEAD1="$(read_header "$PRIVATE_URL" "$COOKIE_USER1" || true)"
HEAD2="$(read_header "$PRIVATE_URL" "$COOKIE_USER2" || true)"
KEY1="$(echo "$HEAD1" | get_edge_cache_key || true)"
KEY2="$(echo "$HEAD2" | get_edge_cache_key || true)"

echo "user1 key: ${KEY1:-<none>}"
echo "user2 key: ${KEY2:-<none>}"

if [[ -z "$KEY1" || -z "$KEY2" ]]; then
  echo "Expected X-QDC-Edge-Cache-Key to be present for private route requests."
  exit 1
fi
if [[ "$KEY1" == "$KEY2" ]]; then
  echo "Expected different cache keys for different id cookies (per-user isolation)."
  exit 1
fi

if [[ -n "${PRIVATE_AUTH_COOKIE:-}" ]]; then
  echo "== Private route HIT (requires PRIVATE_AUTH_COOKIE) =="
  STATUS1="$(read_header "$PRIVATE_URL" "$PRIVATE_AUTH_COOKIE" | get_edge_cache_status || true)"
  STATUS2="$(read_header "$PRIVATE_URL" "$PRIVATE_AUTH_COOKIE" | get_edge_cache_status || true)"
  echo "auth 1st: ${STATUS1:-<none>}  auth 2nd: ${STATUS2:-<none>}"
  if [[ "$STATUS2" != "HIT" ]]; then
    echo "Expected 2nd request to be HIT for authenticated private route."
    exit 1
  fi
else
  echo "Skipping private-route HIT check (set PRIVATE_AUTH_COOKIE=... to enable)."
fi

echo "== Auth routes bypass =="
AUTH_URL="${BASE_URL}/auth?token=fake"
AUTH_STATUS1="$(read_header "$AUTH_URL" | get_edge_cache_status || true)"
AUTH_STATUS2="$(read_header "$AUTH_URL" | get_edge_cache_status || true)"
echo "auth 1st: ${AUTH_STATUS1:-<none>}  auth 2nd: ${AUTH_STATUS2:-<none>}"
if [[ "$AUTH_STATUS2" == "HIT" ]]; then
  echo "Expected /auth to never be HIT."
  exit 1
fi

echo "✅ Edge cache smoke tests passed"
