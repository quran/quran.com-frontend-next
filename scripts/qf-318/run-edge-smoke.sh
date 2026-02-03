#!/usr/bin/env bash
set -euo pipefail

# Runs the production edge smoke suite (real-life tests) against ssr.quran.com.
#
# Usage:
#   PLAYWRIGHT_TEST_BASE_URL="https://ssr.quran.com" ./scripts/qf-318/run-edge-smoke.sh
#
# Optional (enables private-page HIT test):
#   TEST_USER_EMAIL="..." TEST_USER_PASSWORD="..." ./scripts/qf-318/run-edge-smoke.sh
#

export PLAYWRIGHT_TEST_BASE_URL="${PLAYWRIGHT_TEST_BASE_URL:-https://ssr.quran.com}"

echo "Running edge smoke against: ${PLAYWRIGHT_TEST_BASE_URL}"

yarn -s test:integration --project=chromium --grep @edge-smoke

