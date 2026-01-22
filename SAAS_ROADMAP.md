# 🚀 Plan-Ex: SaaS Dönüşüm ve Özellik Yol Haritası

Bu belge, Plan-Ex projesinin mevcut "Local-First" yapısından, ticari ve ölçeklenebilir bir "Cloud-SaaS" ürününe dönüşümü için hazırlanmıştır.

**Mevcut Durum:** Local-First PWA (Dexie.js + IndexedDB)  
**Hedef:** Hybrid Cloud-SaaS (Supabase + Stripe + Multi-tenant)  
**Başlangıç Tarihi:** 23 Ocak 2026

---

## 📊 Genel Mimari Değişiklik

### Mevcut Mimari
```
React App → Dexie.js → IndexedDB (Browser)
```

### Hedef Mimari
```
React App → Supabase Client → PostgreSQL (Cloud)
     ↓
  Stripe → Webhook → Subscription Management
     ↓
  Auth → Social Login (Google, GitHub)
```

---

## 🏗️ Faz 0: SaaS Temelleri (Altyapı & Para Kazanma)

**Süre:** 3-4 hafta  
**Öncelik:** 🔴 Kritik  
**Durum:** 🟡 Planlandı

### 🔐 1. Kimlik ve Veri (Backend)

#### 1.1 Supabase Kurulumu
- [ ] Supabase projesi oluştur
- [ ] Environment variables yapılandırması (`.env`)
- [ ] Supabase client kurulumu (`@supabase/supabase-js`)
- [ ] Database schema tasarımı (PostgreSQL)
  - `users` (profil bilgileri)
  - `subscriptions` (abonelik durumu)
  - `courses`, `units`, `tasks`, `events`, `habits` (mevcut Dexie tablolarının cloud versiyonu)
  - Row Level Security (RLS) politikaları

#### 1.2 Hibrit Senkronizasyon
- [ ] Sync Service oluştur (`src/lib/sync/syncService.ts`)
  - Local-first: Offline çalışma devam etsin
  - Background sync: Online olunca Supabase'e gönder
  - Conflict resolution: Last-write-wins veya custom merge
- [ ] Sync durumu UI göstergesi (Header'da)
- [ ] Manual sync butonu (Ayarlar sayfasında)

#### 1.3 Auth Sistemi
- [ ] Login sayfası (`src/modules/auth/pages/LoginPage.tsx`)
- [ ] Register sayfası (`src/modules/auth/pages/RegisterPage.tsx`)
- [ ] Social Login entegrasyonu
  - Google OAuth
  - GitHub OAuth
- [ ] Şifre sıfırlama akışı
- [ ] Email doğrulama (Supabase Auth)
- [ ] Protected routes (Auth guard)
- [ ] Auth store (`src/modules/auth/store/authStore.ts`)

#### 1.4 Kullanıcı Profili
- [ ] Profil sayfası (`src/modules/profile/pages/ProfilePage.tsx`)
- [ ] Avatar yükleme (Supabase Storage)
- [ ] Profil bilgileri formu
  - İsim/Soyisim
  - Okul/Üniversite
  - Bölüm
  - Sınıf
- [ ] Profil güncelleme API

---

### 💳 2. Ödeme Altyapısı (Monetization)

#### 2.1 Stripe Entegrasyonu
- [ ] Stripe hesabı oluştur (Test mode)
- [ ] Stripe client kurulumu (`@stripe/stripe-js`)
- [ ] Stripe webhook endpoint (`/api/stripe-webhook`)
- [ ] Subscription lifecycle yönetimi
  - Yeni abonelik
  - Abonelik iptali
  - Abonelik yenileme
  - Ödeme başarısız

#### 2.2 Abonelik Sistemi
- [ ] Plan tanımları (`src/config/plans.ts`)
  ```typescript
  FREE_PLAN: {
    courses: 3,
    pdfPerCourse: 2,
    habits: 5,
    aiFeatures: false
  }
  PRO_PLAN: {
    courses: unlimited,
    pdfPerCourse: unlimited,
    habits: unlimited,
    aiFeatures: true,
    price: 49.99 TRY/ay
  }
  ```
- [ ] Feature gating middleware
- [ ] Limit kontrolü (courses, PDFs, habits)
- [ ] Upgrade prompt'ları (UI)

#### 2.3 Fiyatlandırma Sayfası
- [ ] Pricing page (`src/modules/pricing/pages/PricingPage.tsx`)
- [ ] Plan karşılaştırma tablosu
- [ ] Checkout flow
- [ ] Success/Cancel sayfaları

#### 2.4 Müşteri Portalı
- [ ] Billing page (`src/modules/billing/pages/BillingPage.tsx`)
- [ ] Mevcut plan gösterimi
- [ ] Abonelik iptal butonu
- [ ] Kart güncelleme
- [ ] Fatura geçmişi
- [ ] Fatura indirme (PDF)

---

### 📢 3. Pazarlama ve Yasal

#### 3.1 Landing Page
- [ ] Ayrı landing page projesi (Next.js önerisi)
- [ ] Hero section
- [ ] Özellikler showcase
- [ ] Testimonials
- [ ] CTA (Call to Action) butonları
- [ ] SEO optimizasyonu
  - Meta tags
  - Open Graph
  - Sitemap
  - robots.txt

#### 3.2 Yasal Sayfalar
- [ ] Terms of Service (ToS) sayfası
- [ ] Privacy Policy sayfası
- [ ] Cookie Policy
- [ ] KVKK uyumluluğu (Türkiye için)
- [ ] GDPR uyumluluğu (AB için)

---

## ⚡ Faz 1: Hızlı Kazanımlar (Quick Wins & UI Polish)

**Süre:** 2-3 hafta  
**Öncelik:** 🟠 Yüksek  
**Durum:** ⚪ Beklemede

### 🔔 1. Gelişmiş Bildirimler

#### 1.1 Browser Push Notifications
- [ ] Service Worker push notification desteği
- [ ] Push subscription yönetimi
- [ ] Notification permission UI
- [ ] Bildirim ayarları (Ayarlar sayfasında)

#### 1.2 Akıllı Hatırlatıcılar
- [ ] Sınav hatırlatıcıları (3 gün, 1 gün, 2 saat öncesi)
- [ ] Görev deadline hatırlatıcıları
- [ ] Alışkanlık hatırlatıcıları
- [ ] Özelleştirilebilir hatırlatma zamanları

#### 1.3 E-posta Özetleri (Pro)
- [ ] Email service entegrasyonu (SendGrid/Resend)
- [ ] Günlük özet email template
- [ ] Haftalık özet email template
- [ ] Email tercihleri (opt-in/opt-out)

---

### 💾 2. Veri Yönetimi & Export

#### 2.1 Syllabus Export
- [ ] Markdown export (`src/lib/export/markdownExport.ts`)
- [ ] Notion formatı
- [ ] Obsidian formatı
- [ ] Export butonu (Ders detay sayfasında)

#### 2.2 Takvim Çıktısı
- [ ] Canvas API ile takvim render
- [ ] Instagram Story boyutu (1080x1920)
- [ ] PNG export
- [ ] Özelleştirilebilir renkler/tema

#### 2.3 Ders Notu PDF
- [ ] Rich text editor notları → PDF
- [ ] PDF generation library (jsPDF/pdfmake)
- [ ] PDF export butonu

---

## 🔗 Faz 2: Entegrasyon ve Kolaborasyon (Büyüme)

**Süre:** 3-4 hafta  
**Öncelik:** 🟡 Orta  
**Durum:** ⚪ Beklemede

### 📅 1. Takvim Entegrasyonları

#### 1.1 Google Calendar Sync
- [ ] Google Calendar API entegrasyonu
- [ ] OAuth 2.0 flow
- [ ] Çift yönlü senkronizasyon
- [ ] Sync ayarları (hangi dersler sync edilsin)

#### 1.2 iCal Export
- [ ] .ics dosya oluşturma
- [ ] Subscription URL (read-only)
- [ ] Outlook/Apple Calendar uyumluluğu

---

### 🤝 2. Sosyal ve Paylaşım

#### 2.1 Ders Programı Paylaş
- [ ] Public share link oluşturma
- [ ] Read-only view sayfası
- [ ] Embed code (iframe)
- [ ] Social media preview (Open Graph)

#### 2.2 Grup Çalışma (Study Rooms)
- [ ] Real-time Pomodoro sync (Supabase Realtime)
- [ ] Study room oluşturma/katılma
- [ ] Katılımcı listesi
- [ ] Chat (opsiyonel)

#### 2.3 Leaderboard (Gamification)
- [ ] Haftalık/aylık sıralama
- [ ] Puan sistemi (tamamlanan görevler, Pomodoro sayısı)
- [ ] Rozet sistemi (achievements)
- [ ] Gizlilik ayarları (leaderboard'a katılma/çıkma)

---

## 🧠 Faz 3: Yapay Zeka ve İleri Analitik (Premium Değer)

**Süre:** 4-6 hafta  
**Öncelik:** 🟢 Düşük (Pro özelliği)  
**Durum:** ⚪ Beklemede

### 🤖 1. AI Asistan (Pro)

#### 1.1 Sınav Sorusu Üretimi
- [ ] OpenAI API entegrasyonu
- [ ] Ders notlarından soru üretme
- [ ] Çoktan seçmeli/açık uçlu soru tipleri
- [ ] Soru bankası kaydetme

#### 1.2 Özet Çıkarma
- [ ] Uzun notları özetleme
- [ ] Bullet point formatı
- [ ] Önemli kavramları vurgulama

#### 1.3 Akıllı Planlayıcı
- [ ] Sınav tarihlerine göre çalışma planı oluşturma
- [ ] Mevcut yoğunluğu dikkate alma
- [ ] Kişiselleştirilmiş öneriler

---

### 📈 2. Derinlemesine Analiz

#### 2.1 Trend Analizi
- [ ] Günlük/haftalık verimlilik grafikleri
- [ ] Düşük performans tespiti
- [ ] Öneriler (hangi günler daha verimli)

#### 2.2 Kıyaslama (Benchmarking)
- [ ] Anonim kullanıcı ortalamaları
- [ ] Bölüm/okul bazlı karşılaştırma
- [ ] Percentile gösterimi

#### 2.3 Burnout Uyarısı
- [ ] Aşırı çalışma tespiti
- [ ] Dinlenme önerileri
- [ ] Mola hatırlatıcıları

---

## 📱 Faz 4: Çoklu Platform (Scale)

**Süre:** 6-8 hafta  
**Öncelik:** 🟢 Düşük  
**Durum:** ⚪ Beklemede

### 1. Native Mobile App

#### 1.1 Capacitor Entegrasyonu
- [ ] Capacitor kurulumu
- [ ] iOS build
- [ ] Android build
- [ ] Native plugin'ler (push notifications, file system)

#### 1.2 App Store Yayınlama
- [ ] App Store Connect hesabı
- [ ] Google Play Console hesabı
- [ ] App screenshots ve açıklamalar
- [ ] Review süreci

---

### 2. Offline-First Sync

#### 2.1 Conflict Resolution
- [ ] Last-write-wins stratejisi
- [ ] Custom merge logic
- [ ] Conflict UI (kullanıcıya göster)

#### 2.2 Background Sync
- [ ] Service Worker background sync
- [ ] Retry logic
- [ ] Sync queue yönetimi

---

## 📦 Teknik Bağımlılıklar

### Yeni Paketler (Faz 0)
```json
{
  "@supabase/supabase-js": "^2.39.0",
  "@stripe/stripe-js": "^2.4.0",
  "stripe": "^14.10.0",
  "zod": "^3.22.4" // (zaten var)
}
```

### Yeni Paketler (Faz 1+)
```json
{
  "@sendgrid/mail": "^8.1.0",
  "jspdf": "^2.5.1",
  "html2canvas": "^1.4.1",
  "ical-generator": "^6.0.0"
}
```

### Yeni Paketler (Faz 3)
```json
{
  "openai": "^4.24.0"
}
```

---

## 🎯 Başarı Metrikleri

### Faz 0 (SaaS Temelleri)
- [ ] Kullanıcı kaydı çalışıyor
- [ ] Ödeme altyapısı test edildi
- [ ] Free → Pro upgrade akışı sorunsuz
- [ ] Sync çalışıyor (local ↔ cloud)

### Faz 1 (Quick Wins)
- [ ] Push notification gönderimi başarılı
- [ ] Export özellikleri kullanılıyor
- [ ] Kullanıcı memnuniyeti artışı

### Faz 2 (Entegrasyon)
- [ ] Google Calendar sync aktif
- [ ] Paylaşım özelliği kullanılıyor
- [ ] Study rooms beta testi

### Faz 3 (AI)
- [ ] AI soru üretimi doğruluğu >80%
- [ ] Pro abonelik dönüşüm oranı >5%

### Faz 4 (Mobile)
- [ ] App Store/Play Store'da yayında
- [ ] Mobile kullanıcı oranı >30%

---

## 🚀 Hemen Başlayalım!

### İlk Adımlar (Bu Hafta)
1. ✅ Supabase projesi oluştur
2. ✅ Environment variables ayarla
3. ✅ Auth sayfaları tasarla (UI mockup)
4. ✅ Database schema tasarla
5. ✅ Stripe test hesabı aç

### Sonraki Adımlar (Gelecek Hafta)
1. Auth flow implementasyonu
2. Supabase client entegrasyonu
3. Sync service geliştirme
4. Feature gating sistemi

---

**Son Güncelleme:** 23 Ocak 2026  
**Versiyon:** 1.0  
**Durum:** 🟡 Aktif Geliştirme
