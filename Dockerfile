FROM node:20-alpine AS base
WORKDIR /app

FROM base AS builder
# Copy dependency files
COPY package.json package-lock.json ./
# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .
# Build the Next.js application
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy the built application from the builder stage
COPY --from=builder /app/.next ./.next
# (Optional) if you have a public folder uncomment below
# COPY --from=builder /app/public ./public

EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]
