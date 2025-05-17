# Stage 1: Build the Next.js application
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies.
# The '*' next to package-lock.json ensures it's copied if available.
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Run the production Next.js app
ENV NODE_ENV=production

# Expose the port Next.js will run on
EXPOSE 3001
ENV HOST=0.0.0.0
# Start the app in production mode.
CMD ["sh", "-c", "PORT=3001 npm run start"]