# Base Image
FROM node:18-alpine

# Install OpenSSL for Prisma on Alpine
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code and Prisma schema
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose backend port
EXPOSE 5000

# Push DB schema and start backend
CMD ["sh", "-c", "npx prisma db push --skip-generate && npm start"]
