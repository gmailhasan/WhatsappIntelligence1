# Build stage
FROM node:20-alpine AS build
RUN apk add --no-cache curl iputils bind-tools
RUN echo "precedence ::ffff:0:0/96  100" >> /etc/gai.conf
WORKDIR /app
COPY package*.json ./
COPY dist ./dist
COPY client ./client
RUN npm install
ENTRYPOINT ["npm", "start"]