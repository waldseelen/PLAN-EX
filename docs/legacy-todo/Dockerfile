# ===========================================
# GOOGLE CLOUD RUN OPTIMIZED DOCKERFILE
# Gelişim Planlayıcı - v2.2
# ===========================================

# ---- Stage 1: Build ----
FROM node:20-alpine AS builder

WORKDIR /app

# Bağımlılıkları önce kopyala (Docker cache için optimize)
COPY package*.json ./

# Production bağımlılıklarını yükle
RUN npm ci

# Kaynak kodları kopyala
COPY . .

# TypeScript build
RUN npm run build

# ---- Stage 2: Production (Google Cloud Run) ----
FROM nginx:alpine

# Güvenlik: nginx varsayılan configini temizle
RUN rm -rf /usr/share/nginx/html/* && \
    rm /etc/nginx/conf.d/default.conf

# Google Cloud Run için özel nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build çıktısını kopyala
COPY --from=builder /app/dist /usr/share/nginx/html

# Kullanıcı yetkilerini ayarla ve nginx optimize et
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    sed -i 's/worker_processes.*/worker_processes auto;/' /etc/nginx/nginx.conf

# Google Cloud Run varsayılan portu
ENV PORT=8080
EXPOSE 8080

# Cloud Run SIGTERM sinyalini düzgün işler
STOPSIGNAL SIGQUIT

# nginx'i foreground'da çalıştır
CMD ["nginx", "-g", "daemon off;"]
