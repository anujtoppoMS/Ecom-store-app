# Use official Node.js image for building
FROM node:18-alpine AS builder

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (for better caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Install required system dependencies
RUN apk add --no-cache openssl

# Generate Prisma client
RUN npx prisma generate

# Expose the correct port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Start the Node.js application
CMD ["node", "app.js"]