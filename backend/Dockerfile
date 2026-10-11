# ==================================================
# CareerLink - Production Dockerfile for Backend
# ==================================================
# Node.js 20 lightweight Alpine image
FROM node:20-alpine AS base

# Install curl for healthcheck
RUN apk add --no-cache curl

# Create application directory
WORKDIR /usr/src/app

# Install dependencies separately to leverage Docker layer caching
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Create uploads directory if not existing
RUN mkdir -p uploads logs && chmod 777 uploads logs

# Expose API port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start server
CMD ["node", "src/server.js"]
