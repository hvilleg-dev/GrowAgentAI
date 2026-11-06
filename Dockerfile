FROM node:18-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --legacy-peer-deps 2>&1 || true

COPY backend/package.json backend/package-lock.json* ./backend/
WORKDIR /app/backend
RUN npm install --legacy-peer-deps 2>&1 || true

WORKDIR /app
COPY . .

EXPOSE 3000 3001

WORKDIR /app/backend
CMD ["npm", "run", "dev"]
