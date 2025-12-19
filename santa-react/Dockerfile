# Stage 1: Build the React Frontend
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Build Arg for Vite
ARG VITE_GEMINI_API_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
# Build the production assets to /app/dist
RUN npm run build

# Stage 2: Serve the App (Node.js)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
# Only install production dependencies
RUN npm ci --only=production
COPY . .
# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Expose port (Cloud Run sets PORT env var, defaults to 8080 usually, 
# but our app defaults to 3001. We need to respect process.env.PORT in server.js 
# or configure Cloud Run to forward to 3001. We'll verify server.js handles PORT env.)

# Check server.js port logic: "const port = 3001;" 
# We should probably update server.js to use process.env.PORT for Cloud Run compatibility.
# For now, we will expose 3001 and tell Cloud Run to listen on 3001.
EXPOSE 3001

CMD ["node", "server.js"]
