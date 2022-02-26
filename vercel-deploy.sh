#!/bin/bash

echo "VERCEL_ENV $VERCEL_ENV"
echo "CF_AUTH_KEY $CF_AUTH_KEY"
echo "CF_ZONE_ID $CF_ZONE_ID"

# if [[ $VERCEL_ENV == "production" ]]; then
if [[ $VERCEL_ENV == "development" ]]; then
    yarn node scripts/purge-cloudflare-cache.js $CF_AUTH_KEY $CF_ZONE_ID && yarn build
else
    yarn build
fi
