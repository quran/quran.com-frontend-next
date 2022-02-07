# Install dependencies only when needed
FROM node:16-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# If using npm with a `package-lock.json` comment out above and use below instead
# COPY package.json package-lock.json ./
# RUN npm ci

# Rebuild the source code only when needed
FROM node:16-alpine AS builder
ARG NOTION_TOKEN
ARG NOTION_DATABASE_ID
ARG NEXT_PUBLIC_VERCEL_ENV
ARG NEXT_PUBLIC_VERCEL_URL
ARG NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
ARG NEXT_PUBLIC_TARTEEL_VS_API_KEY
ARG NEXT_PUBLIC_FS_API_KEY
ARG NEXT_PUBLIC_FS_AUTH_DOMAIN
ARG NEXT_PUBLIC_FS_PROJECT_ID
ARG NEXT_PUBLIC_FS_STORAGE_BUCKET
ARG NEXT_PUBLIC_FS_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FS_APP_ID
ARG NEXT_PUBLIC_FS_MEASUREMENT_ID
ENV NOTION_TOKEN=$NOTION_TOKEN
ENV NOTION_DATABASE_ID=$NOTION_DATABASE_ID
ENV NEXT_PUBLIC_VERCEL_ENV=$NEXT_PUBLIC_VERCEL_ENV
ENV NEXT_PUBLIC_VERCEL_URL=$NEXT_PUBLIC_VERCEL_URL
ENV NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=$NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
ENV NEXT_PUBLIC_TARTEEL_VS_API_KEY=$NEXT_PUBLIC_TARTEEL_VS_API_KEY
ENV NEXT_PUBLIC_FS_API_KEY=$NEXT_PUBLIC_FS_API_KEY
ENV NEXT_PUBLIC_FS_AUTH_DOMAIN=$NEXT_PUBLIC_FS_AUTH_DOMAIN
ENV NEXT_PUBLIC_FS_PROJECT_ID=$NEXT_PUBLIC_FS_PROJECT_ID
ENV NEXT_PUBLIC_FS_STORAGE_BUCKET=$NEXT_PUBLIC_FS_STORAGE_BUCKET
ENV NEXT_PUBLIC_FS_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FS_MESSAGING_SENDER_ID
ENV NEXT_PUBLIC_FS_APP_ID=$NEXT_PUBLIC_FS_APP_ID
ENV NEXT_PUBLIC_FS_MEASUREMENT_ID=$NEXT_PUBLIC_FS_MEASUREMENT_ID
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

# Production image, copy all the files and run next
FROM node:16-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# You only need to copy next.config.js if you are NOT using the default configuration
# COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry.
ENV NEXT_TELEMETRY_DISABLED 1

CMD ["node", "server.js"]
