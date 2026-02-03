#!/usr/bin/env bash
set -euo pipefail

# Real-world performance + caching comparison for QF-318 SSR site.
#
# Compares ssr.quran.com vs quran.com for a list of paths:
# - curl timing (DNS/connect/TLS/TTFB/total)
# - final response headers (edge cache + compression)
# - a sample of critical Next.js assets (/_next/static/*) caching headers
#
# Usage:
#   ./scripts/qf-318/real-world-perf-compare.sh
#
# Env vars:
#   BASE_SSR=https://ssr.quran.com
#   BASE_PROD=https://quran.com
#   PATHS="/ /vi /5 /vi/5"
#   RUNS=2
#   COOKIE=""                       # optional Cookie header value
#   EXTRA_HEADERS=""                # optional extra headers; newline-separated, e.g. $'accept-language: en\ncache-control: no-cache'
#   ASSET_LIMIT=5
#

BASE_SSR="${BASE_SSR:-https://ssr.quran.com}"
BASE_PROD="${BASE_PROD:-https://quran.com}"
RUNS="${RUNS:-2}"
ASSET_LIMIT="${ASSET_LIMIT:-5}"

COOKIE="${COOKIE:-}"
EXTRA_HEADERS="${EXTRA_HEADERS:-}"

if [[ -z "${PATHS:-}" ]]; then
  PATHS="/ /vi /5 /vi/5"
fi

read -r -a PATH_LIST <<<"$PATHS"

header_args=()
header_args+=(-H "accept: text/html")
if [[ -n "$COOKIE" ]]; then
  header_args+=(-H "cookie: $COOKIE")
fi
if [[ -n "$EXTRA_HEADERS" ]]; then
  while IFS= read -r line; do
    [[ -z "${line// /}" ]] && continue
    header_args+=(-H "$line")
  done <<<"$EXTRA_HEADERS"
fi

metrics() {
  local url="$1"
  curl -sS -L --compressed -o /dev/null "${header_args[@]}" \
    -w "code=%{http_code} dns=%{time_namelookup}s connect=%{time_connect}s tls=%{time_appconnect}s ttfb=%{time_starttransfer}s total=%{time_total}s size=%{size_download} url=%{url_effective}\n" \
    "$url"
}

final_url() {
  local url="$1"
  curl -sS -L --compressed -o /dev/null -w "%{url_effective}" "${header_args[@]}" "$url"
}

print_selected_headers() {
  local url="$1"
  local final
  final="$(final_url "$url")"
  echo "final: $final"
  curl -sS --compressed -D - -o /dev/null "${header_args[@]}" "$final" \
    | grep -Ei '^(HTTP/|x-qdc-edge-cache:|x-qdc-edge-cache-key:|cf-cache-status:|age:|cache-control:|content-type:|content-encoding:|vary:|server:|etag:|location:)' \
    || true
}

extract_next_assets() {
  local url="$1"
  local tmp
  tmp="$(mktemp)"
  curl -sS -L --compressed "${header_args[@]}" "$url" >"$tmp"

  # Extract a handful of critical assets referenced directly in HTML.
  # We prefer /_next/static/... files since these should be heavily cached.
  #
  # Use ripgrep for portability (BSD sed regex portability is painful on macOS).
  rg -o '/_next/static[^"'\'' ]+' "$tmp" \
    | head -n "$ASSET_LIMIT" \
    || true

  rm -f "$tmp"
}

probe_asset_headers() {
  local base="$1"
  local asset_path="$2"
  curl -sS -I --compressed "$base$asset_path" \
    | grep -Ei '^(HTTP/|cf-cache-status:|age:|cache-control:|content-type:|content-encoding:|etag:|vary:)' \
    || true
}

echo "== qf-318 real-world perf compare =="
echo "curl: $(curl --version | head -n 1)"
echo "runs: $RUNS"
echo "paths: ${PATH_LIST[*]}"
echo "ssr:  $BASE_SSR"
echo "prod: $BASE_PROD"
echo

for path in "${PATH_LIST[@]}"; do
  # ensure leading slash
  if [[ "$path" != /* ]]; then path="/$path"; fi

  ssr_url="${BASE_SSR}${path}"
  prod_url="${BASE_PROD}${path}"

  echo "============================================================"
  echo "PATH: $path"
  echo

  echo "-- SSR ($BASE_SSR)"
  for i in $(seq 1 "$RUNS"); do
    echo "try $i: $(metrics "$ssr_url")"
  done
  echo "-- SSR headers"
  print_selected_headers "$ssr_url"

  echo
  echo "-- PROD ($BASE_PROD)"
  for i in $(seq 1 "$RUNS"); do
    echo "try $i: $(metrics "$prod_url")"
  done
  echo "-- PROD headers"
  print_selected_headers "$prod_url"

  echo
  echo "-- Asset cache probe (first ${ASSET_LIMIT} /_next/static assets)"
  echo "SSR assets:"
  assets_ssr="$(extract_next_assets "$ssr_url" || true)"
  if [[ -z "${assets_ssr// /}" ]]; then
    echo "  (no assets found in HTML)"
  else
    while IFS= read -r asset; do
      [[ -z "$asset" ]] && continue
      echo "  $asset"
      probe_asset_headers "$BASE_SSR" "$asset" | sed 's/^/    /'
    done <<<"$assets_ssr"
  fi

  echo "PROD assets:"
  assets_prod="$(extract_next_assets "$prod_url" || true)"
  if [[ -z "${assets_prod// /}" ]]; then
    echo "  (no assets found in HTML)"
  else
    while IFS= read -r asset; do
      [[ -z "$asset" ]] && continue
      echo "  $asset"
      probe_asset_headers "$BASE_PROD" "$asset" | sed 's/^/    /'
    done <<<"$assets_prod"
  fi

  echo
done

echo "Done."
