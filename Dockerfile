FROM node:18 AS build
WORKDIR /app

#  package files and  dependencies
COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .
RUN pnpm run build
FROM nginx:alpine

# Copy built files to nginx
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 