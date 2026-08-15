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
COPY nginx.conf /etc/nginx/templates/default.conf.template
CMD ["nginx", "-g", "daemon off;"]
