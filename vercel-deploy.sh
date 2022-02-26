#!/bin/bash

if [[ $VERCEL_ENV == "production" ]]; then
    yarn node scripts/purge-cloudflare-cache.js $CF_AUTH_KEY $CF_ZONE_ID && yarn build
else
    yarn build
fi
