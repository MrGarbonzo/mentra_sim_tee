# Production Dockerfile for MentraOS Glasses Simulator
# Builds React frontend and runs WebSocket server for TEE deployment
#
# Build command: docker build -t mentraos-simulator-tee .

FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Build the React app
RUN npm run build

# ============================================
# Production Runtime
# ============================================
FROM node:20-slim AS runtime

WORKDIR /app

# Install production dependencies for server
COPY package.json ./
RUN npm install --production

# Copy built frontend from builder
COPY --from=builder /app/dist ./dist

# Copy WebSocket server
COPY server.js ./

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV HOST=0.0.0.0

# Expose ports (3001 for WebSocket, 5173 for HTTP if needed)
EXPOSE 3001

# Start the WebSocket server
CMD ["node", "server.js"]
