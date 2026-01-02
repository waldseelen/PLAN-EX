# PLAN.EX - Vercel Deployment Guide

## 🎯 Deployment Özeti

PLAN.EX production-ready bir React + Vite SPA uygulamasıdır ve Vercel'de sorunsuz çalışacak şekilde yapılandırılmıştır.

## ✅ Pre-Deployment Checklist

### Build Kontrolü
```bash
# TypeScript kontrol
npm run typecheck

# Testleri çalıştır
npm test

# Production build
npm run build

# Preview build
npm run preview
```

### Dosya Kontrolü
- [x] `vercel.json` - Vercel yapılandırması
- [x] `package.json` - Build scripts
- [x] `vite.config.ts` - Vite yapılandırması
- [x] `.vercelignore` - Deploy edilmeyecek dosyalar
- [x] `.env.example` - Environment variables template
- [x] PWA assets (`public/` klasöründe)
  - [x] `pwa-192x192.png`
  - [x] `pwa-512x512.png`
  - [x] `apple-touch-icon.png`
  - [x] `favicon.svg`

## 🚀 Vercel'e Deploy

### Yöntem 1: GitHub Integration (Önerilen)

1. **GitHub'a Push Edin**
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

2. **Vercel Dashboard**
   - [vercel.com](https://vercel.com) adresine gidin
   - "Import Project" → GitHub repository'nizi seçin
   - Vercel otomatik olarak `vercel.json` ayarlarını algılar
   - "Deploy" butonuna tıklayın

3. **Otomatik Deploy**
   - Her `main` branch'e push otomatik deploy tetikler
   - Preview deploy'lar pull request'lerde çalışır

### Yöntem 2: Vercel CLI

1. **CLI Kurulumu**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   # İlk deploy ve yapılandırma
   vercel

   # Production deploy
   vercel --prod
   ```

3. **Environment Variables** (Gerekirse)
   ```bash
   vercel env add VITE_APP_NAME production
   ```

## ⚙️ Vercel Yapılandırması

### `vercel.json` Özellikleri

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm ci",
  "regions": ["fra1"]
}
```

### Cache Stratejisi

| Dosya Tipi | Cache Süresi | Açıklama |
|------------|--------------|----------|
| HTML | 0 | Her zaman fresh |
| JS/CSS | 1 yıl | Immutable hash'li dosyalar |
| Fonts | 1 yıl | Değişmeyen asset'ler |
| Images (PNG) | 1 gün | Potansiyel güncellemeler |
| Service Worker | 0 | Her zaman fresh |

### Security Headers

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy` - XSS koruması
- `Referrer-Policy: strict-origin-when-cross-origin`

### SPA Routing

Tüm route'lar (API ve asset'ler hariç) `index.html`'e yönlendirilir:
```
/calendar → index.html
/habits → index.html
/courses/123 → index.html
```

## 🔍 Post-Deployment Kontrol

### 1. Lighthouse Audit
```bash
# Chrome DevTools → Lighthouse
# Hedef: Performance, Accessibility, Best Practices, SEO > 90
```

### 2. PWA Testi
- [ ] Offline çalışıyor mu?
- [ ] "Add to Home Screen" görünüyor mu?
- [ ] Service Worker başarıyla yükleniyor mu?
- [ ] Manifest.json doğru mu?

### 3. Functional Test
- [ ] Ana sayfa yükleniyor
- [ ] Routing çalışıyor
- [ ] Ders ekleme/düzenleme
- [ ] Görev oluşturma
- [ ] Takvim görünümü
- [ ] Tema değiştirme
- [ ] Dil değiştirme (TR/EN)
- [ ] Veri export/import

### 4. Performance Metrikleri

| Metrik | Hedef | Kontrol |
|--------|-------|---------|
| FCP | < 1.8s | ✅ |
| LCP | < 2.5s | ✅ |
| TBT | < 200ms | ✅ |
| CLS | < 0.1 | ✅ |
| Speed Index | < 3.4s | ✅ |

## 🐛 Troubleshooting

### Build Hataları

**Problem**: TypeScript compilation error
```bash
# Çözüm
npm run typecheck
# Hataları düzelt ve tekrar dene
npm run build
```

**Problem**: Module not found
```bash
# Çözüm: Dependencies'leri temizle ve yeniden yükle
rm -rf node_modules package-lock.json
npm install
```

### Runtime Hataları

**Problem**: 404 on refresh
- `vercel.json` içinde `rewrites` ayarını kontrol edin
- SPA routing doğru yapılandırılmalı

**Problem**: Service Worker çalışmıyor
- HTTPS zorunlu (Vercel otomatik sağlar)
- Browser cache'i temizleyin
- DevTools → Application → Service Workers → Unregister

**Problem**: IndexedDB data loss
- IndexedDB browser tarafından yönetilir
- Privacy mode'da çalışmayabilir
- Export/Import özelliğini kullanın

## 📊 Monitoring

### Vercel Analytics
```bash
# Vercel Dashboard → Project → Analytics
- Page views
- Top pages
- Unique visitors
- Performance scores
```

### Error Tracking
```typescript
// src/shared/components/ErrorBoundary.tsx
// Hata yakalama zaten implement edilmiş
```

### Custom Metrics
```typescript
// Performance API kullanımı
performance.mark('custom-metric-start')
// ... operation
performance.mark('custom-metric-end')
performance.measure('custom-metric', 'custom-metric-start', 'custom-metric-end')
```

## 🔄 Rollback

### Git Revert
```bash
git revert HEAD
git push origin main
```

### Vercel Dashboard
1. Deployments → Önceki deployment'ı seçin
2. "Promote to Production" butonuna tıklayın

## 📈 Optimization Tips

### 1. Bundle Analizi
```bash
ANALYZE=true npm run build
# dist/stats.html dosyasını açın
```

### 2. Image Optimization
- WebP formatı kullanın
- Lazy loading (`loading="lazy"`)
- Responsive images (`srcset`)

### 3. Code Splitting
- Dynamic imports kullanılıyor
- Route-based splitting aktif
- Component-based splitting where needed

### 4. Caching Strategy
- Service Worker precache
- IndexedDB for data
- Browser cache headers

## 🌍 Multi-Region Setup

Varsayılan region: Frankfurt (fra1)

### Diğer region'lar eklemek için:
```json
{
  "regions": ["fra1", "iad1", "sfo1"]
}
```

## 📝 Environment Variables

Şu anda environment variable gerekmemektedir. Tüm veri client-side IndexedDB'de saklanır.

Gelecekte eklenebilir:
```bash
# Example
VITE_API_URL=https://api.example.com
VITE_FEATURE_FLAG_X=true
```

## 🎉 Deploy Tamamlandı!

Deployment başarılı olduğunda:
- Vercel size production URL verir
- Custom domain ekleyebilirsiniz
- SSL otomatik sağlanır
- CDN globally dağıtılır

---

**Son Güncelleme**: 2026-01-02
**Vercel Version**: Latest
**Node Version**: ≥18
