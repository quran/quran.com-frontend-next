#!/usr/bin/env bash
set -euo pipefail

# Runs production product smoke suite (mutating, with cleanup).
#
# Usage:
#   PLAYWRIGHT_TEST_BASE_URL="https://ssr.quran.com" \
#   TEST_USER_EMAIL="..." TEST_USER_PASSWORD="..." \
#   ./scripts/qf-318/run-prod-product-smoke.sh

export PLAYWRIGHT_TEST_BASE_URL="${PLAYWRIGHT_TEST_BASE_URL:-https://ssr.quran.com}"

echo "Running prod product smoke against: ${PLAYWRIGHT_TEST_BASE_URL}"

yarn -s test:integration --project=chromium --grep @prod-product
