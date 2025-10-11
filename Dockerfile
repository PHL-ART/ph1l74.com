# =========================================
# Stage 1: Build the React Application
# =========================================
ARG NODE_VERSION=22-alpine
ARG NGINX_VERSION=alpine3.20

FROM node:${NODE_VERSION} AS builder

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package.json package-lock.json ./

# Install dependencies with caching
RUN --mount=type=cache,target=/root/.npm \
    npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# =========================================
# Stage 2: Serve with Nginx
# =========================================
FROM nginxinc/nginx-unprivileged:${NGINX_VERSION} AS runner

# Use non-root user for security
USER nginx

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built files from builder stage
COPY --chown=nginx:nginx --from=builder /app/dist /usr/share/nginx/html

# Expose port 8080 (Nginx unprivileged uses 8080 instead of 80)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# Start Nginx
ENTRYPOINT ["nginx", "-c", "/etc/nginx/nginx.conf"]
CMD ["-g", "daemon off;"]

