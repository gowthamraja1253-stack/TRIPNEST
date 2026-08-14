# Build Stage
FROM node:20-alpine as build
WORKDIR /app
ENV NODE_OPTIONS="--max-old-space-size=256"
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Copy custom nginx configuration if needed, or rely on default
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
