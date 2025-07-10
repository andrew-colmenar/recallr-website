# Use an official Node.js image as the build environment
FROM node:18 AS build

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

# Copy the rest of the app
COPY . .

# Build the app
RUN pnpm run build

# Use a lightweight web server to serve the build (e.g., nginx)
FROM nginx:alpine

# Copy built files to nginx's public folder
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 