#!/usr/bin/env bash
set -euo pipefail

# QF-318 Live edge debug (curl)
#
# Prints a step-by-step trace (redirect chain + key cache headers) for real traffic
# against ssr.quran.com.
#
# Usage:
#   BASE_URL=https://ssr.quran.com \
#   PATHS="/ /vi /vi/5 /vi/1" \
#   RUNS=2 \
#   ACCEPT_LANGUAGE="en-US,en;q=0.9" \
#   COOKIE="QDC_PREFS_KEY=demo123; QDC_PREFS_VER=1" \
#   ./scripts/qf-318/edge-live-debug.sh
#
# Notes:
# - For JSON endpoints, set ACCEPT="application/json" (and optionally REFERER=...).
# - For HTML, default ACCEPT is "text/html".

BASE_URL="${BASE_URL:-https://ssr.quran.com}"
PATHS="${PATHS:-/ /vi /vi/5 /vi/1}"
RUNS="${RUNS:-2}"
ACCEPT_LANGUAGE="${ACCEPT_LANGUAGE:-en-US,en;q=0.9}"
ACCEPT="${ACCEPT:-text/html}"
COOKIE="${COOKIE:-}"
REFERER="${REFERER:-}"

curl_once() {
  local url="$1"
  local -a args
  args=(
    -sS
    -D -
    -o /dev/null
    -H "Accept: ${ACCEPT}"
    -H "Accept-Language: ${ACCEPT_LANGUAGE}"
    -w "\n__CURL__ time_total=%{time_total} ttfb=%{time_starttransfer} remote_ip=%{remote_ip} http_code=%{http_code}\n"
  )

  if [[ -n "$COOKIE" ]]; then
    args+=(-H "Cookie: ${COOKIE}")
  fi

  if [[ -n "$REFERER" ]]; then
    args+=(-H "Referer: ${REFERER}")
  fi

  curl "${args[@]}" "$url"
}

get_header_val() {
  local headers="$1"
  local key="$2"
  echo "$headers" | awk -v key="$key" '
    BEGIN { IGNORECASE = 1 }
    $0 ~ "^" key ":" {
      sub("\r$", "");
      sub("^[^:]+:[[:space:]]*", "");
      print;
      exit;
    }
  '
}

get_status_line() {
  local headers="$1"
  echo "$headers" | head -n 1 | tr -d '\r'
}

get_http_code() {
  local statusLine="$1"
  # "HTTP/2 200" -> 200
  echo "$statusLine" | awk '{print $2}'
}

resolve_location() {
  local location="$1"
  if [[ -z "$location" ]]; then
    return 1
  fi
  if [[ "$location" == http* ]]; then
    echo "$location"
    return 0
  fi
  if [[ "$location" == /* ]]; then
    echo "${BASE_URL%/}${location}"
    return 0
  fi
  # relative path without leading slash (rare)
  echo "${BASE_URL%/}/$location"
}

trace_url() {
  local url="$1"
  local depth="${2:-0}"
  if (( depth > 6 )); then
    echo "  [stop] too many redirects"
    return 0
  fi

  local out statusLine httpCode qdc cf age cacheControl location serverTiming curlLine
  out="$(curl_once "$url")"
  statusLine="$(get_status_line "$out")"
  httpCode="$(get_http_code "$statusLine")"
  qdc="$(get_header_val "$out" "x-qdc-edge-cache")"
  cf="$(get_header_val "$out" "cf-cache-status")"
  age="$(get_header_val "$out" "age")"
  cacheControl="$(get_header_val "$out" "cache-control")"
  location="$(get_header_val "$out" "location")"
  serverTiming="$(get_header_val "$out" "server-timing")"
  curlLine="$(echo "$out" | grep '^__CURL__' | tail -n 1 | tr -d '\r')"

  printf '%s%s\n' "$(printf '%*s' $((depth * 2)) '')" "${statusLine}  qdc=${qdc:--}  cf=${cf:--}  age=${age:--}"
  printf '%s%s\n' "$(printf '%*s' $((depth * 2)) '')" "${curlLine}"
  if [[ -n "$location" ]]; then
    printf '%s%s\n' "$(printf '%*s' $((depth * 2)) '')" "location: ${location}"
  fi
  printf '%s%s\n' "$(printf '%*s' $((depth * 2)) '')" "cache-control: ${cacheControl:-<none>}"
  if [[ -n "$serverTiming" ]]; then
    printf '%s%s\n' "$(printf '%*s' $((depth * 2)) '')" "server-timing: ${serverTiming}"
  fi

  if [[ "$httpCode" == "301" || "$httpCode" == "302" || "$httpCode" == "307" || "$httpCode" == "308" ]]; then
    local nextUrl
    nextUrl="$(resolve_location "$location" || true)"
    if [[ -n "$nextUrl" ]]; then
      trace_url "$nextUrl" $((depth + 1))
    fi
  fi
}

normalize_path_to_url() {
  local path="$1"
  if [[ "$path" == http* ]]; then
    echo "$path"
    return 0
  fi
  if [[ "$path" == /* ]]; then
    echo "${BASE_URL%/}${path}"
    return 0
  fi
  echo "${BASE_URL%/}/$path"
}

main() {
  echo "Base: ${BASE_URL}"
  echo "Accept: ${ACCEPT}"
  echo "Accept-Language: ${ACCEPT_LANGUAGE}"
  if [[ -n "$COOKIE" ]]; then
    echo "Cookie: (set)"
  else
    echo "Cookie: (none)"
  fi
  if [[ -n "$REFERER" ]]; then
    echo "Referer: ${REFERER}"
  fi
  echo

  for path in $PATHS; do
    local url
    url="$(normalize_path_to_url "$path")"
    echo "== ${path} (${url}) =="
    for ((i = 1; i <= RUNS; i++)); do
      echo "-- run ${i}/${RUNS} --"
      trace_url "$url" 0
    done
    echo
  done
}

main "$@"
