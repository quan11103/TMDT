FROM node:20-alpine

WORKDIR /app

# Cài tool cần thiết
RUN apk add --no-cache python3 make g++ bash git

# Copy package files để cài dependencies
COPY package*.json ./

# Cài dependencies (Dùng npm vì project có package-lock.json)
RUN npm install

# Copy source code
COPY . .

# Build app
RUN npm run build

# Expose port cho preview server
EXPOSE 5173

# Chạy preview server sau khi build
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]