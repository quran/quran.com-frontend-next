FROM node:18-bookworm-slim

RUN apt-get update && apt-get install -y ca-certificates && npm install -g pm2

SHELL ["/bin/bash", "-c"]

ENV LANG=en_US.utf8
# set here, and _not_ in .env, since it causes issues with deps if set in .env
ENV NODE_ENV=production

COPY . /app
WORKDIR /app

RUN cp .env env.sh && sed -i 's/^/export /g' env.sh && source env.sh
RUN yarn build

ENV HOSTNAME=0.0.0.0
EXPOSE 80

ENTRYPOINT ["bash", "-c", ". /app/env.sh && exec pm2-runtime /app/server-http.js -i max --max-memory-restart 512M"]
