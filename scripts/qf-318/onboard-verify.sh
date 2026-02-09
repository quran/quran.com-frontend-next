#!/usr/bin/env bash
set -euo pipefail

# QF-318 Onboarding Verifier (curl)
#
# Purpose: quick, deterministic-ish checks for what headers/cache keys should look like
# on ssr.quran.com for guest/manual/auth/api scenarios.
#
# Usage:
#   BASE_URL=https://ssr.quran.com ./scripts/qf-318/onboard-verify.sh
#
# Notes:
# - Do NOT use curl -I/HEAD. The snippet runs on GET only.
# - Some cases use "eventual HIT" loops because edge fill can be async.

BASE_URL="${BASE_URL:-https://ssr.quran.com}"
RUNS="${RUNS:-4}"
SLEEP_MS="${SLEEP_MS:-300}"

ACCEPT_LANGUAGE_VI="${ACCEPT_LANGUAGE_VI:-vi-VN,vi;q=0.9,en;q=0.8}"
ACCEPT_LANGUAGE_EN="${ACCEPT_LANGUAGE_EN:-en-US,en;q=0.9}"

PREFS_KEY="${PREFS_KEY:-demo123}"

PASS_COUNT=0
FAIL_COUNT=0

sleep_ms() {
  local ms="$1"
  local seconds
  seconds="$(awk "BEGIN { printf \"%.3f\", (${ms} / 1000) }")"
  sleep "${seconds}"
}

mk_token() {
  echo "$(date +%s)-$RANDOM"
}

curl_headers() {
  local url="$1"
  local accept="$2"
  local accept_language="${3:-}"
  local cookie="${4:-}"
  local referer="${5:-}"

  local -a args
  args=(-sS -D - -o /dev/null -H "Accept: ${accept}")

  if [[ -n "$accept_language" ]]; then
    args+=(-H "Accept-Language: ${accept_language}")
  fi
  if [[ -n "$cookie" ]]; then
    args+=(-H "Cookie: ${cookie}")
  fi
  if [[ -n "$referer" ]]; then
    args+=(-H "Referer: ${referer}")
  fi

  curl "${args[@]}" "${BASE_URL%/}${url}"
}

header_val() {
  local headers="$1"
  local key="$2"
  echo "$headers" | sed -n "s/^${key}:[[:space:]]*//Ip" | head -n 1 | tr -d '\r'
}

status_line() {
  echo "$1" | head -n 1 | tr -d '\r'
}

require_absent() {
  local name="$1"
  local value="$2"
  if [[ -n "$value" ]]; then
    echo "Expected ${name} to be absent but got: ${value}"
    return 1
  fi
  return 0
}

require_present() {
  local name="$1"
  local value="$2"
  if [[ -z "$value" ]]; then
    echo "Expected ${name} to be present but it was missing"
    return 1
  fi
  return 0
}

require_contains() {
  local name="$1"
  local haystack="$2"
  local needle="$3"
  if [[ "$haystack" != *"$needle"* ]]; then
    echo "Expected ${name} to contain: ${needle}"
    echo "Actual: ${haystack}"
    return 1
  fi
  return 0
}

require_not_contains() {
  local name="$1"
  local haystack="$2"
  local needle="$3"
  if [[ "$haystack" == *"$needle"* ]]; then
    echo "Expected ${name} to NOT contain: ${needle}"
    echo "Actual: ${haystack}"
    return 1
  fi
  return 0
}

eventual_hit() {
  local url="$1"
  local accept="$2"
  local accept_language="${3:-}"
  local cookie="${4:-}"
  local referer="${5:-}"

  local last="" headers qdc
  for ((i = 1; i <= RUNS; i++)); do
    headers="$(curl_headers "$url" "$accept" "$accept_language" "$cookie" "$referer" || true)"
    qdc="$(header_val "$headers" "x-qdc-edge-cache")"
    last="${qdc:-<none>}"
    if [[ "$qdc" == "HIT" ]]; then
      return 0
    fi
    sleep_ms "$SLEEP_MS"
  done
  echo "Expected eventual HIT, last=${last}"
  return 1
}

run_check() {
  local title="$1"
  shift

  echo "== ${title} =="

  if "$@"; then
    echo "PASS"
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    echo "FAIL"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
  echo
}

check_guest_vi_bucket() {
  local token url headers key qdc
  token="$(mk_token)"
  url="/vi/53?__onboard=${token}"
  headers="$(curl_headers "$url" "text/html" "$ACCEPT_LANGUAGE_VI")"
  qdc="$(header_val "$headers" "x-qdc-edge-cache")"
  key="$(header_val "$headers" "x-qdc-edge-cache-key")"

  require_present "X-QDC-Edge-Cache" "$qdc" || return 1
  require_present "X-QDC-Edge-Cache-Key" "$key" || return 1

  require_contains "cache key" "$key" "__qdc_l=vi" || return 1
  require_contains "cache key" "$key" "__qdc_d=vi" || return 1
  require_contains "cache key" "$key" "__qdc_c=US" || return 1
  require_not_contains "cache key" "$key" "__qdc_p=" || return 1
  require_not_contains "cache key" "$key" "__qdc_u=" || return 1

  eventual_hit "$url" "text/html" "$ACCEPT_LANGUAGE_VI" "" "" || return 1
  return 0
}

check_guest_with_prefs_bucket() {
  local token url headers key qdc cookie
  token="$(mk_token)"
  url="/vi/53?__onboard=${token}"
  cookie="QDC_PREFS_KEY=${PREFS_KEY}; QDC_PREFS_VER=1"

  headers="$(curl_headers "$url" "text/html" "" "$cookie")"
  qdc="$(header_val "$headers" "x-qdc-edge-cache")"
  key="$(header_val "$headers" "x-qdc-edge-cache-key")"

  require_present "X-QDC-Edge-Cache" "$qdc" || return 1
  require_present "X-QDC-Edge-Cache-Key" "$key" || return 1

  require_contains "cache key" "$key" "__qdc_l=vi" || return 1
  require_contains "cache key" "$key" "__qdc_p=${PREFS_KEY}" || return 1
  require_not_contains "cache key" "$key" "__qdc_d=" || return 1
  require_not_contains "cache key" "$key" "__qdc_c=" || return 1
  require_not_contains "cache key" "$key" "__qdc_u=" || return 1

  eventual_hit "$url" "text/html" "" "$cookie" "" || return 1
  return 0
}

check_public_key_invariance_with_auth_cookie() {
  local token url head_guest head_auth key_guest key_auth
  token="$(mk_token)"
  url="/vi/53?__onboard=${token}"

  head_guest="$(curl_headers "$url" "text/html" "$ACCEPT_LANGUAGE_VI")"
  head_auth="$(curl_headers "$url" "text/html" "$ACCEPT_LANGUAGE_VI" "id=111")"

  key_guest="$(header_val "$head_guest" "x-qdc-edge-cache-key")"
  key_auth="$(header_val "$head_auth" "x-qdc-edge-cache-key")"

  require_present "guest X-QDC-Edge-Cache-Key" "$key_guest" || return 1
  require_present "auth X-QDC-Edge-Cache-Key" "$key_auth" || return 1

  if [[ "$key_guest" != "$key_auth" ]]; then
    echo "Expected identical public cache keys with/without auth cookie"
    echo "guest: $key_guest"
    echo "auth:  $key_auth"
    return 1
  fi

  require_not_contains "cache key" "$key_auth" "__qdc_u=" || return 1
  return 0
}

check_private_without_id_bypasses() {
  local token url headers qdc key
  token="$(mk_token)"
  url="/vi/profile?__onboard=${token}"
  headers="$(curl_headers "$url" "text/html" "")"
  qdc="$(header_val "$headers" "x-qdc-edge-cache")"
  key="$(header_val "$headers" "x-qdc-edge-cache-key")"

  require_absent "X-QDC-Edge-Cache" "$qdc" || return 1
  require_absent "X-QDC-Edge-Cache-Key" "$key" || return 1
  return 0
}

check_token_query_bypasses() {
  local token url headers qdc key
  token="$(mk_token)"
  url="/vi/1?token=fake&__onboard=${token}"
  headers="$(curl_headers "$url" "text/html" "")"
  qdc="$(header_val "$headers" "x-qdc-edge-cache")"
  key="$(header_val "$headers" "x-qdc-edge-cache-key")"

  require_absent "X-QDC-Edge-Cache" "$qdc" || return 1
  require_absent "X-QDC-Edge-Cache-Key" "$key" || return 1
  return 0
}

check_manual_locale_redirect_es() {
  local token url headers loc key qdc
  token="$(mk_token)"
  url="/?__onboard=${token}"
  headers="$(curl_headers "$url" "text/html" "" "QDC_MANUAL_LOCALE=1; NEXT_LOCALE=es")"

  qdc="$(header_val "$headers" "x-qdc-edge-cache")"
  key="$(header_val "$headers" "x-qdc-edge-cache-key")"
  loc="$(header_val "$headers" "location")"

  require_present "X-QDC-Edge-Cache" "$qdc" || return 1
  require_present "X-QDC-Edge-Cache-Key" "$key" || return 1
  require_contains "Location" "$loc" "/es" || return 1

  require_contains "cache key" "$key" "__qdc_t=redir" || return 1
  require_contains "cache key" "$key" "__qdc_m=1" || return 1
  require_contains "cache key" "$key" "__qdc_ml=es" || return 1
  return 0
}

check_manual_default_locale_does_not_force_en() {
  local token url headers loc key qdc
  token="$(mk_token)"
  url="/?__onboard=${token}"
  headers="$(curl_headers "$url" "text/html" "$ACCEPT_LANGUAGE_VI" "QDC_MANUAL_LOCALE=1; NEXT_LOCALE=en")"

  qdc="$(header_val "$headers" "x-qdc-edge-cache")"
  key="$(header_val "$headers" "x-qdc-edge-cache-key")"
  loc="$(header_val "$headers" "location")"

  require_present "X-QDC-Edge-Cache" "$qdc" || return 1
  require_present "X-QDC-Edge-Cache-Key" "$key" || return 1

  if [[ -n "$loc" ]]; then
    require_not_contains "Location" "$loc" "/en" || return 1
  fi
  return 0
}

check_allowlisted_content_api_key_and_hit() {
  local token url headers key qdc
  token="$(mk_token)"
  url="/api/proxy/content/api/qdc/resources/country_language_preference?user_device_language=vi&country=VN&__onboard=${token}"

  headers="$(curl -sS -D - -o /dev/null \
    -H 'Accept: application/json' \
    -H 'User-Agent: Mozilla/5.0' \
    -H 'Referer: https://ssr.quran.com/vi' \
    "${BASE_URL%/}${url}")"

  qdc="$(header_val "$headers" "x-qdc-edge-cache")"
  key="$(header_val "$headers" "x-qdc-edge-cache-key")"

  require_present "X-QDC-Edge-Cache" "$qdc" || return 1
  require_present "X-QDC-Edge-Cache-Key" "$key" || return 1
  require_contains "cache key" "$key" "__qdc_t=api" || return 1
  require_not_contains "cache key" "$key" "__qdc_u=" || return 1
  require_not_contains "cache key" "$key" "__qdc_p=" || return 1

  # Warm to HIT (best-effort).
  local last="${qdc:-<none>}"
  for ((i = 1; i <= RUNS; i++)); do
    headers="$(curl -sS -D - -o /dev/null \
      -H 'Accept: application/json' \
      -H 'User-Agent: Mozilla/5.0' \
      -H 'Referer: https://ssr.quran.com/vi' \
      "${BASE_URL%/}${url}" || true)"
    last="$(header_val "$headers" "x-qdc-edge-cache")"
    if [[ "$last" == "HIT" ]]; then
      return 0
    fi
    sleep_ms "$SLEEP_MS"
  done
  echo "Expected eventual HIT for allowlisted content API, last=${last:-<none>}"
  return 1
}

check_preference_api_contract_basic() {
  local token url json
  token="$(mk_token)"
  url="/api/proxy/content/api/qdc/resources/country_language_preference?user_device_language=en&country=VN&__onboard=${token}"

  json="$(curl -sS \
    -H 'Accept: application/json' \
    -H 'User-Agent: Mozilla/5.0' \
    -H 'Referer: https://ssr.quran.com/en' \
    "${BASE_URL%/}${url}" || true)"

  if [[ -z "$json" || "$json" == *"Forbidden"* ]]; then
    echo "Preference API request failed or returned Forbidden."
    return 1
  fi

  # Contract we rely on (current prod config):
  # - en + VN should return default_locale vi (VN-specific) and qr_default_locale en.
  require_contains "country_language_preference JSON" "$json" "\"default_locale\":\"vi\"" || return 1
  require_contains "country_language_preference JSON" "$json" "\"qr_default_locale\":\"en\"" || return 1
  return 0
}

check_no_redirect_loops_for_default_locale_paths() {
  local token
  token="$(mk_token)"

  curl -sS -o /dev/null -L --max-redirs 10 \
    -H "Accept: text/html" \
    -H "Accept-Language: ${ACCEPT_LANGUAGE_EN}" \
    "${BASE_URL%/}/en/1?__onboard=${token}"

  curl -sS -o /dev/null -L --max-redirs 10 \
    -H "Accept: text/html" \
    -H "Accept-Language: ${ACCEPT_LANGUAGE_EN}" \
    "${BASE_URL%/}/1?__onboard=${token}"

  return 0
}

main() {
  echo "Base: ${BASE_URL}"
  echo "RUNS: ${RUNS} (eventual HIT attempts)"
  echo

  run_check "Guest HTML (vi) bucket key + eventual HIT" check_guest_vi_bucket
  run_check "Guest HTML (prefsKey) bucket key + eventual HIT" check_guest_with_prefs_bucket
  run_check "Public key invariance with auth cookie (no __qdc_u)" check_public_key_invariance_with_auth_cookie
  run_check "Private path without id bypasses snippet headers" check_private_without_id_bypasses
  run_check "Token query bypasses snippet headers" check_token_query_bypasses
  run_check "Manual locale redirect (es) uses __qdc_t=redir" check_manual_locale_redirect_es
  run_check "Manual default locale (en) does not force /en" check_manual_default_locale_does_not_force_en
  run_check "Allowlisted content API uses __qdc_t=api + eventual HIT" check_allowlisted_content_api_key_and_hit
  run_check "Preference API basic contract (en+VN => default_locale vi)" check_preference_api_contract_basic
  run_check "No redirect loops for /en/1 and /1" check_no_redirect_loops_for_default_locale_paths

  echo "Summary: PASS=${PASS_COUNT} FAIL=${FAIL_COUNT}"
  if [[ "$FAIL_COUNT" -gt 0 ]]; then
    exit 1
  fi
}

main "$@"
