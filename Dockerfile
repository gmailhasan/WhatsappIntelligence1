# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY dist ./dist
COPY client ./client
RUN npm install
ENTRYPOINT ["npm", "start"]