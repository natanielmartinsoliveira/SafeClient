FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build \
  && echo "✔ dist/main.js ok" \
  && ls dist/main.js \
  && npx tsc -p tsconfig.seed.json \
  && echo "✔ dist/database/seed.js ok" \
  && ls dist/database/seed.js

FROM node:20-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist ./dist
COPY package*.json ./
RUN npm ci --only=production
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh
EXPOSE 3000
CMD ["sh", "entrypoint.sh"]
