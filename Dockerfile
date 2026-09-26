# Stage 1: Build the frontend (Vite React App)
FROM node:18-alpine AS frontend-builder
WORKDIR /app/web
COPY web/package*.json ./
RUN npm ci
COPY web ./
RUN npm run build

# Stage 2: Build the backend (Express TS API)
FROM node:18-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
COPY backend/prisma ./prisma/
RUN npm ci
COPY backend ./
RUN npx prisma generate
RUN npm run build

# Stage 3: Production Server
FROM node:18-alpine AS production
WORKDIR /app

# Install production dependencies for backend
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

# Copy built artifacts from builders
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/prisma ./backend/prisma
COPY --from=frontend-builder /app/web/dist ./web/dist

# Generate Prisma Client in production image
RUN cd backend && npx prisma generate

# Expose port and start
EXPOSE 5001
ENV NODE_ENV=production
ENV PORT=5001

# The compiled output of backend uses dist/src/server.js
CMD ["node", "backend/dist/server.js"]
