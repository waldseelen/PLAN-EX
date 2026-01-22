# 🚀 Plan-Ex SaaS Kurulum Rehberi

Bu rehber, Plan-Ex'i local-first uygulamadan SaaS ürününe dönüştürmek için gerekli adımları içerir.

---

## 📋 Ön Gereksinimler

- Node.js 18+
- npm veya yarn
- Supabase hesabı (ücretsiz)
- Stripe hesabı (test mode)
- Git

---

## 🏗️ Adım 1: Supabase Projesi Oluşturma

### 1.1 Supabase'e Kaydolun
1. [supabase.com](https://supabase.com) adresine gidin
2. "Start your project" butonuna tıklayın
3. GitHub ile giriş yapın

### 1.2 Yeni Proje Oluşturun
1. "New Project" butonuna tıklayın
2. Proje bilgilerini doldurun:
   - **Name:** plan-ex
   - **Database Password:** Güçlü bir şifre oluşturun (kaydedin!)
   - **Region:** Europe West (Frankfurt) - Türkiye'ye en yakın
   - **Pricing Plan:** Free tier (başlangıç için yeterli)
3. "Create new project" butonuna tıklayın
4. Proje hazırlanırken bekleyin (~2 dakika)

### 1.3 API Keys'i Alın
1. Sol menüden "Settings" > "API" seçin
2. Şu bilgileri kopyalayın:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** `eyJhbGc...` (uzun bir token)

### 1.4 Database Schema'yı Yükleyin
1. Sol menüden "SQL Editor" seçin
2. "New query" butonuna tıklayın
3. `supabase/schema.sql` dosyasının içeriğini kopyalayıp yapıştırın
4. "Run" butonuna tıklayın
5. Başarılı mesajı görmelisiniz: "Success. No rows returned"

### 1.5 Storage Bucket'ı Kontrol Edin
1. Sol menüden "Storage" seçin
2. "lecture-notes" bucket'ının oluşturulduğunu görmelisiniz
3. Bucket ayarlarından "Public" seçeneğinin **kapalı** olduğundan emin olun

---

## 💳 Adım 2: Stripe Hesabı Kurulumu

### 2.1 Stripe'a Kaydolun
1. [stripe.com](https://stripe.com) adresine gidin
2. "Start now" butonuna tıklayın
3. E-posta ve şifre ile kayıt olun

### 2.2 Test Mode'u Aktif Edin
1. Dashboard'da sağ üstteki "Test mode" toggle'ının **açık** olduğundan emin olun
2. Test mode'da gerçek para alınmaz, sadece test kartları çalışır

### 2.3 Product ve Price Oluşturun

#### Pro Monthly Plan
1. Sol menüden "Products" > "Add product" seçin
2. Bilgileri doldurun:
   - **Name:** Plan-Ex Pro (Monthly)
   - **Description:** Sınırsız özellikler, AI asistan, öncelikli destek
   - **Pricing model:** Recurring
   - **Price:** 49.99 TRY
   - **Billing period:** Monthly
3. "Save product" butonuna tıklayın
4. **Price ID'yi kopyalayın:** `price_xxxxx` (environment variable'da kullanacağız)

#### Pro Yearly Plan
1. Aynı product'a "Add another price" butonuna tıklayın
2. Bilgileri doldurun:
   - **Price:** 499.99 TRY
   - **Billing period:** Yearly
3. "Save price" butonuna tıklayın
4. **Price ID'yi kopyalayın:** `price_yyyyy`

### 2.4 Webhook Endpoint Oluşturun (Sonra)
> Not: Bu adım uygulamayı deploy ettikten sonra yapılacak.
> Şimdilik atlayabilirsiniz.

### 2.5 API Keys'i Alın
1. Sol menüden "Developers" > "API keys" seçin
2. **Publishable key'i kopyalayın:** `pk_test_xxxxx`
3. **Secret key'i kopyalayın:** `sk_test_xxxxx` (GİZLİ tutun!)

---

## ⚙️ Adım 3: Environment Variables Ayarlama

### 3.1 .env.local Dosyası Oluşturun
Proje kök dizininde `.env.local` dosyası oluşturun:

```bash
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
VITE_STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxxx
VITE_STRIPE_PRO_YEARLY_PRICE_ID=price_yyyyy

# App
VITE_APP_URL=http://localhost:3000
VITE_API_URL=http://localhost:3000/api

# Feature Flags
VITE_ENABLE_SYNC=true
VITE_ENABLE_AI_FEATURES=false
VITE_ENABLE_SOCIAL_FEATURES=false

# Environment
VITE_ENV=development
```

### 3.2 Değerleri Doldurun
- `xxxxx` yerine kendi Supabase URL'inizi yazın
- `eyJhbGc...` yerine kendi anon key'inizi yazın
- `pk_test_xxxxx` yerine kendi Stripe publishable key'inizi yazın
- `price_xxxxx` yerine kendi price ID'lerinizi yazın

---

## 📦 Adım 4: Bağımlılıkları Yükleyin

```bash
npm install
```

Yeni eklenen paketler:
- `@supabase/supabase-js` - Supabase client
- `@stripe/stripe-js` - Stripe client

---

## 🧪 Adım 5: Test Edin

### 5.1 Development Server'ı Başlatın
```bash
npm run dev
```

### 5.2 Supabase Bağlantısını Test Edin
1. Tarayıcıda `http://localhost:3000` adresine gidin
2. Console'u açın (F12)
3. Şu mesajı görmelisiniz: `[Supabase] Connected`
4. Hata varsa environment variables'ları kontrol edin

### 5.3 Auth Flow'u Test Edin (Yakında)
> Not: Auth sayfaları henüz oluşturulmadı.
> Sonraki adımlarda oluşturulacak.

---

## 🎨 Adım 6: Auth UI Oluşturma (Sonraki Adım)

Şimdi auth sayfalarını oluşturacağız:

### Oluşturulacak Sayfalar
- [ ] `/auth/login` - Giriş sayfası
- [ ] `/auth/register` - Kayıt sayfası
- [ ] `/auth/forgot-password` - Şifre sıfırlama
- [ ] `/auth/reset-password` - Yeni şifre belirleme
- [ ] `/auth/callback` - OAuth callback

### Oluşturulacak Componentler
- [ ] `LoginForm` - Email/password giriş formu
- [ ] `RegisterForm` - Kayıt formu
- [ ] `SocialLoginButtons` - Google/GitHub butonları
- [ ] `AuthGuard` - Protected route wrapper

---

## 🔄 Adım 7: Sync Service Oluşturma (Sonraki Adım)

Local Dexie ↔ Cloud Supabase senkronizasyonu:

### Oluşturulacak Servisler
- [ ] `syncService.ts` - Ana sync logic
- [ ] `conflictResolver.ts` - Çakışma çözümü
- [ ] `syncQueue.ts` - Offline queue yönetimi

### Sync Stratejisi
1. **Local-first:** Tüm işlemler önce local'de yapılır
2. **Background sync:** Online olunca otomatik sync
3. **Conflict resolution:** Last-write-wins (başlangıç için)
4. **Manual sync:** Kullanıcı isterse manuel sync

---

## 📊 Adım 8: Feature Gating (Sonraki Adım)

Free vs Pro plan limitleri:

### Oluşturulacak Componentler
- [ ] `UpgradePrompt` - Upgrade modal
- [ ] `FeatureGate` - Feature wrapper
- [ ] `PlanBadge` - Plan göstergesi

### Kontrol Edilecek Limitler
- Ders sayısı (Free: 3, Pro: unlimited)
- PDF sayısı (Free: 2/ders, Pro: unlimited)
- Alışkanlık sayısı (Free: 5, Pro: unlimited)
- AI özellikleri (Free: ❌, Pro: ✅)

---

## 🚀 Adım 9: Deployment (En Son)

### Vercel'e Deploy
1. GitHub'a push edin
2. Vercel'e bağlayın
3. Environment variables'ları ekleyin
4. Deploy edin

### Stripe Webhook Ayarlama
1. Vercel URL'inizi alın: `https://plan-ex.vercel.app`
2. Stripe Dashboard > Webhooks > Add endpoint
3. URL: `https://plan-ex.vercel.app/api/stripe-webhook`
4. Events: `customer.subscription.*`, `invoice.*`
5. Webhook secret'i kopyalayın
6. Vercel'de environment variable ekleyin: `STRIPE_WEBHOOK_SECRET`

---

## 🎯 Başarı Kriterleri

### Faz 0 Tamamlandı ✅
- [ ] Supabase projesi oluşturuldu
- [ ] Database schema yüklendi
- [ ] Stripe hesabı kuruldu
- [ ] Environment variables ayarlandı
- [ ] Bağımlılıklar yüklendi
- [ ] Development server çalışıyor

### Faz 0.1 (Auth) Tamamlandı ✅
- [ ] Login sayfası çalışıyor
- [ ] Register sayfası çalışıyor
- [ ] Social login çalışıyor
- [ ] Protected routes çalışıyor
- [ ] Profile sayfası çalışıyor

### Faz 0.2 (Sync) Tamamlandı ✅
- [ ] Local → Cloud sync çalışıyor
- [ ] Cloud → Local sync çalışıyor
- [ ] Offline queue çalışıyor
- [ ] Conflict resolution çalışıyor

### Faz 0.3 (Payment) Tamamlandı ✅
- [ ] Pricing sayfası çalışıyor
- [ ] Checkout flow çalışıyor
- [ ] Subscription yönetimi çalışıyor
- [ ] Feature gating çalışıyor

---

## 🆘 Sorun Giderme

### Supabase Bağlantı Hatası
```
Error: Invalid Supabase URL
```
**Çözüm:** `.env.local` dosyasında `VITE_SUPABASE_URL` değerini kontrol edin.

### Stripe Publishable Key Hatası
```
Error: You must provide a Stripe publishable key
```
**Çözüm:** `.env.local` dosyasında `VITE_STRIPE_PUBLISHABLE_KEY` değerini kontrol edin.

### CORS Hatası
```
Access to fetch at 'https://xxxxx.supabase.co' has been blocked by CORS policy
```
**Çözüm:** Supabase Dashboard > Settings > API > CORS'ta `http://localhost:3000` ekleyin.

### Database Schema Hatası
```
Error: relation "profiles" does not exist
```
**Çözüm:** `supabase/schema.sql` dosyasını tekrar çalıştırın.

---

## 📚 Kaynaklar

- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)
- [React Router Docs](https://reactrouter.com/)

---

## 🎉 Tebrikler!

Temel altyapı kurulumu tamamlandı. Şimdi auth sayfalarını oluşturmaya başlayabilirsiniz.

**Sonraki Adım:** `docs/AUTH_IMPLEMENTATION.md` dosyasını okuyun.

---

**Son Güncelleme:** 23 Ocak 2026  
**Versiyon:** 1.0
