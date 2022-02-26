#!/bin/bash

if [[ $VERCEL_ENV == "production" ]]; then
    yarn build && yarn node scripts/purge-cloudflare-cache.js $CF_AUTH_KEY $CF_ZONE_ID
else
    yarn build
fi
