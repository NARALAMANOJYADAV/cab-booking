FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY packages ./packages
COPY apps/api ./apps/api

RUN npm install
RUN npm run build --workspace=@fairride/types
RUN npm run build --workspace=@fairride/constants
RUN npm run build --workspace=@fairride/shared
RUN npm run build --workspace=@fairride/validation
RUN npm run build --workspace=@fairride/api

FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package*.json ./apps/api/

EXPOSE 5000

CMD ["node", "apps/api/dist/server.js"]
