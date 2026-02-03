#!/usr/bin/env bash
set -euo pipefail

# Convenience wrapper for the Playwright real-world browser report.
#
# Usage:
#   RUNS=2 URLS="https://ssr.quran.com/ https://ssr.quran.com/vi" ./scripts/qf-318/real-world-browser-report.sh
#
# Env vars (optional):
#   URLS="..."  RUNS=1  OUT_DIR="test-results/qf-318-real-world"  HEADLESS=1  COOKIE="name=value; ..."

node scripts/qf-318/real-world-browser-report.mjs

