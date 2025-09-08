FROM node:18-bookworm-slim

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends ca-certificates; \
    rm -rf /var/lib/apt/lists/*; \
    npm install -g pm2@6

SHELL ["/bin/bash", "-c"]

ENV LANG=en_US.utf8
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

# Install all dependencies (needed for build)
# Use yarn install with frozen lockfile for consistency
# Set NODE_ENV=development temporarily to get dev dependencies for build
RUN NODE_ENV=development yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
# Use NODE_ENV=production for the build to avoid React context issues
RUN NODE_ENV=production yarn build

# Remove dev dependencies after build
RUN yarn install --production --frozen-lockfile && yarn cache clean

EXPOSE 3000

CMD ["pm2-runtime", "start", "server-http.js", "-i", "max", "--max-memory-restart", "512M"]
