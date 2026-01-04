FROM node:18-alpine

WORKDIR /app

# Install OpenSSL and libraries for Prisma, plus postgresql-client for health checks
RUN apk add --no-cache openssl libc6-compat postgresql-client

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose port
EXPOSE 5000

ENTRYPOINT ["/entrypoint.sh"]

# Start the application
CMD ["npm", "run", "dev"]

