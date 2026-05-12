FROM node:22-alpine
RUN apk update && apk upgrade --no-cache && rm -rf /var/cache/apk/*
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
EXPOSE 5000
CMD ["node", "server.js"]