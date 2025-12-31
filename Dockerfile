# Base image: Node.js Alpine (paling ringan, ~50MB)
FROM node:alpine

# Set working directory
WORKDIR /app

# Copy file server dan folder data
COPY server.js .
COPY data ./data

# Expose port 3000
EXPOSE 3000

# Command untuk menjalankan aplikasi
CMD ["node", "server.js"]
