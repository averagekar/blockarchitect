# ==========================================
# Stage 1: Client Build
# ==========================================
FROM node:20-alpine AS client-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci --legacy-peer-deps

COPY client/ ./
RUN npm run build

# ==========================================
# Stage 2: Production Server Runner
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app/server

ENV NODE_ENV=production
ENV PORT=8787

COPY server/package*.json ./
RUN npm ci --omit=dev

COPY server/ ./
COPY --from=client-builder /app/client/dist /app/client/dist

EXPOSE 8787

CMD ["node", "src/index.js"]
