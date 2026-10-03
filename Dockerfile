# Production Multi-Stage Container for Web & Node Applications
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install || yarn install || pnpm install || true

COPY . .
RUN if grep -q '"build"' package.json; then npm run build; fi

FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html 2>/dev/null || \
COPY --from=builder /app/build /usr/share/nginx/html 2>/dev/null || \
COPY --from=builder /app /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
