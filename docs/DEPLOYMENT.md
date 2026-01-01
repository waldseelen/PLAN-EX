# 🚀 LifeFlow - Vercel Deployment Rehberi

## Genel Bakış

Bu rehber, LifeFlow projesini Vercel'e deploy etme sürecini ve yüksek Lighthouse skoru elde etmek için yapılan optimizasyonları açıklamaktadır.

---

## 📋 Ön Gereksinimler

1. **Node.js** v18+ kurulu olmalı
2. **npm** veya **pnpm** paket yöneticisi
3. **Vercel CLI** (opsiyonel, local test için)
4. **GitHub** hesabı (otomatik deployment için)

---

## 🛠️ Local Build ve Test

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. Development Sunucusu

```bash
npm run dev
```

### 3. Production Build

```bash
npm run build
```

### 4. Production Preview

```bash
npm run preview
```

### 5. Type Check

```bash
npm run typecheck
```

### 6. Lint

```bash
npm run lint
```

---

## 🌐 Vercel Deployment

### Yöntem 1: GitHub Entegrasyonu (Önerilen)

1. [Vercel Dashboard](https://vercel.com/dashboard) üzerinden yeni proje oluştur
2. GitHub reposunu bağla
3. Framework olarak **Vite** seçildiğinden emin ol
4. Ayarlar otomatik algılanacaktır:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### Yöntem 2: Vercel CLI

```bash
# Vercel CLI kurulumu
npm i -g vercel

# Giriş yap
vercel login

# Deploy et
vercel

# Production deployment
vercel --prod
```

---

## ⚡ Performans Optimizasyonları

### Yapılan İyileştirmeler

#### 1. Kod Bölümleme (Code Splitting)

```typescript
// vite.config.ts - Manuel chunk'lar
manualChunks: {
    'echarts': ['echarts'],
    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
    'ui-vendor': ['clsx', '@heroicons/react', '@headlessui/react'],
    'db-vendor': ['dexie', 'dexie-react-hooks'],
    'time-vendor': ['luxon'],
    'state-vendor': ['zustand']
}
```

#### 2. Lazy Loading

- Büyük sayfalar lazy load edilir (Calendar, Statistics)
- Görseller için `OptimizedImage` bileşeni kullanılır
- Native lazy loading + IntersectionObserver fallback

#### 3. Font Optimizasyonu

```html
<!-- Kritik font preload -->
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" />

<!-- Non-blocking font yükleme -->
<link href="..." rel="stylesheet" media="print" onload="this.media='all'" />
```

#### 4. Kritik CSS

- İlk yükleme için inline kritik CSS
- Loading skeleton ile CLS önleme

#### 5. PWA ve Service Worker

- Workbox ile offline desteği
- Runtime caching stratejileri
- Pre-caching kritik kaynaklar

---

## 📊 Lighthouse Hedefleri

| Metrik | Hedef | Açıklama |
|--------|-------|----------|
| Performance | 95+ | Kod bölümleme, lazy loading, cache stratejileri |
| Accessibility | 100 | WCAG 2.1 uyumlu, 44x44px dokunmatik hedefler |
| Best Practices | 100 | HTTPS, güvenlik başlıkları, modern API kullanımı |
| SEO | 100 | Meta etiketler, semantic HTML, responsive tasarım |
| PWA | ✓ | Offline desteği, manifest, installable |

---

## 🔧 vercel.json Açıklaması

```json
{
  "framework": "vite",

  // Static asset'ler için 1 yıl cache
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ],

  // SPA için rewrite kuralları
  "rewrites": [
    { "source": "/((?!api|assets).*)", "destination": "/index.html" }
  ]
}
```

---

## 🖼️ Görsel Optimizasyonu Önerileri

### WebP Kullanımı

```bash
# WebP dönüşümü için (cwebp gerekli)
cwebp input.png -o output.webp -q 80

# Veya Sharp kullanarak Node.js script
npm install sharp
```

### Önerilen Görsel Boyutları

| Kullanım | Boyut | Format |
|----------|-------|--------|
| Thumbnail | 150x150 | WebP |
| Card görseli | 400x300 | WebP |
| Hero banner | 1200x600 | WebP (+ JPEG fallback) |
| PWA icon | 512x512 | PNG |

### OptimizedImage Kullanımı

```tsx
import { OptimizedImage } from '@/shared/components'

<OptimizedImage
  src="/images/hero.jpg"
  webpSrc="/images/hero.webp"
  alt="Hero görsel"
  width={1200}
  height={600}
  aspectRatio="16/9"
/>
```

---

## 🔒 Güvenlik Başlıkları

Vercel.json'da tanımlanan güvenlik başlıkları:

- **X-Content-Type-Options:** nosniff
- **X-Frame-Options:** DENY
- **X-XSS-Protection:** 1; mode=block
- **Referrer-Policy:** strict-origin-when-cross-origin

---

## 📱 PWA Yapılandırması

### manifest.webmanifest

PWA özellikleri Vite PWA plugin ile otomatik oluşturulur:

- Installable uygulama
- Offline desteği
- Splash screen
- Theme renkleri

### Service Worker

Workbox stratejileri:
- **CacheFirst:** Fontlar, görseller
- **NetworkFirst:** API istekleri
- **StaleWhileRevalidate:** Dinamik içerik

---

## 🧪 Deployment Öncesi Kontrol Listesi

- [ ] `npm run build` başarılı
- [ ] `npm run typecheck` hatasız
- [ ] `npm run lint` uyarısız
- [ ] Lighthouse local testi 90+ skor
- [ ] Mobil responsive kontrol
- [ ] PWA install testi
- [ ] Offline mod testi

---

## 🔄 CI/CD (Opsiyonel)

GitHub Actions ile otomatik deployment:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npm run typecheck
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 📞 Destek

Sorun yaşarsanız:
1. `npm run build` çıktısını kontrol edin
2. Vercel deployment loglarını inceleyin
3. Browser console'da hata mesajlarını kontrol edin

---

**Son Güncelleme:** Aralık 2025
