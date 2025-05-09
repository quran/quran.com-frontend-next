FROM node:18-bookworm-slim

ENV LANG=en_US.utf8
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0

EXPOSE 80

WORKDIR /app
COPY . .

RUN cp .env ./env.sh && sed -i 's/^/export /g' env.sh
RUN --mount=type=cache,target=/root/.cache/yarn yarn --frozen-lockfile --prod
RUN yarn build

ENTRYPOINT ["bash", "-c", ". /app/env.sh && exec node /app/server.js"]
