# Plan.Ex

**Plan. Execute. Be Expert.**

Plan.Ex; dersler (course), görevler (task), sınav/etkinlikler (event/exam) ve alışkanlıkları tek bir SPA içinde, offline-first olarak yönetmek için tasarlanmış bir React + TypeScript + Vite uygulaması.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38BDF8)](https://tailwindcss.com/)

---

## ✔ Çalışan Özellikler

### 1) Ders Yönetimi
- ✅ Çoklu ders oluşturma (sınırsız)
- ✅ Ders → Ünite → Görev hiyerarşisi
- ✅ 9 renk paleti ile ders renklendirme
- ✅ Ders bazlı % ilerleme hesabı
- ✅ Görevler için drag & drop sıralama

### 2) PDF Ders Notları
- ✅ Ders başına sınırsız PDF yükleme
- ✅ IndexedDB ile dosya saklama (large blob, max 50MB)
- ✅ Upload progress bar
- ✅ Yeni sekmede açma
- ✅ İndirme
- ✅ Drag & drop yükleme

### 3) Sınav Takibi
- ✅ Midterm / Final tarihleri
- ✅ Geri sayım (kalan gün)
- ✅ Renkli uyarı sistemi (🔴 ≤3 gün, 🟠 ≤7 gün)
- ✅ Ana ekranda "Yaklaşan sınavlar" listesi
- ✅ Kritik sınav animasyonları (pulse, glow efektleri)
- ✅ Bugün/Yarın özel etiketleri

### 4) Pomodoro Timer
- ✅ Çalışma / kısa mola / uzun mola ayarları
- ✅ Oturum sayacı
- ✅ Otomatik geçiş
- ✅ Toast bildirimi
- ✅ Ses bildirim (açma/kapama)
- ✅ Oturum istatistiklerini kalıcı kaydetme

### 5) İstatistikler
- ✅ Son 7 gün görev/alışkanlık tamamlama grafiği
- ✅ Haftalık aktivite özeti
- ✅ Genel ilerleme yüzdesi
- ✅ Pomodoro istatistikleri (günlük/toplam)

### 6) Takvim Görünümü
- ✅ Aylık takvim
- ✅ Ders renkleri
- ✅ Aylar arası navigasyon
- ✅ Sınav & event görünümü

### 7) Arama
- ✅ Header'da görevler ve dersler içinde anlık arama
- ✅ Debounced input (300ms)
- ✅ Eşleşen metin vurgulama (highlight)
- ✅ Sonuç türüne göre kategorilendirme (Ders/Ünite/Görev)
- ✅ Global Search Box'lar (Google, YouTube, ChatGPT) - Ana sayfada
- ✅ Task içi arama butonları (Google, YouTube, ChatGPT)

### 8) Tema & Görünüm
- ✅ Dark / Light / System theme
- ✅ Smooth transition
- ✅ Modern glassmorphism tasarım

### 9) Veri Yönetimi
- ✅ LocalStorage ile otomatik persist (Zustand)
- ✅ IndexedDB (PDF blob'lar için)
- ✅ JSON export/import
- ✅ Veri yedekleme
- ✅ 7 gün yedekleme hatırlatıcısı (otomatik uyarı)

### 10) Klavye Kısayolları
- ✅ Space: Ana sayfa
- ✅ N: Yeni kayıt modalı
- ✅ Ctrl+,: Ayarlar
- ✅ Ctrl+K: Arama kutusuna odaklan
- ✅ Ctrl+Z: Geri al (undo)
- ✅ Esc: Modal kapat

### 11) Responsive Tasarım
- ✅ Mobile-first
- ✅ Bottom navigation (mobil)
- ✅ Sidebar (desktop/tablet)
- ✅ Touch friendly

### 12) Ekstra Özellikler
- ✅ Toast system
- ✅ Quick Add modal (FAB)
- ✅ Privacy mode
- ✅ Offline indicator
- ✅ Error boundary
- ✅ Görev tamamlama confetti animasyonu
- ✅ Haptic feedback (mobil)
- ✅ Completion sound efekti

---

## Başlangıç

### Gereksinimler
- Node.js 18+
- npm

### Kurulum

```bash
npm install
npm run dev
```

Varsayılan dev adresi: `http://localhost:3000` (port doluysa Vite otomatik farklı port seçebilir).

### Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Development sunucusu |
| `npm run build` | TypeScript build + Vite production build |
| `npm run preview` | Production önizleme |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (noEmit) |
| `npm run test` | Vitest |
| `npm run test:e2e` | Playwright |

---

## Route Haritası

| Route | Sayfa |
|-------|-------|
| `/planner` | Ana sayfa (Overview) |
| `/planner/courses` | Dersler listesi |
| `/planner/courses/:courseId` | Ders detay (görevler, sınavlar, PDF notlar) |
| `/planner/tasks` | Kişisel görevler |
| `/planner/productivity` | Pomodoro Timer |
| `/planner/statistics` | İstatistikler |
| `/calendar` | Takvim (events/exams) |
| `/habits` | Alışkanlıklar |
| `/habits/:habitId` | Alışkanlık detay |
| `/settings` | Ayarlar |

Not: Legacy yollar `/tasks`, `/productivity`, `/statistics` ilgili `/planner/*` rotalarına yönlendirilir.

---

## Klavye Kısayolları

| Kısayol | Açıklama |
|---------|----------|
| `Space` | Ana sayfaya git |
| `N` | Yeni kayıt modalını aç |
| `Ctrl + ,` | Ayarlara git |
| `Ctrl + K` | Arama kutusuna odaklan |
| `Ctrl + Z` | Son işlemi geri al |
| `Esc` | Açık modalı kapat |

---

## Veri Saklama

### Dexie (IndexedDB) - Birincil Veri Katmanı (v2.0+)

| Tablo | Açıklama |
|-------|----------|
| `courses` | Ders tanımları |
| `units` | Ünite tanımları |
| `tasks` | Görev tanımları + tamamlanma durumu |
| `events` | Sınav, ödev, etkinlikler |
| `personalTasks` | Kişisel görevler |
| `habits` | Alışkanlık tanımları |
| `habitLogs` | Günlük alışkanlık logları |
| `completionRecords` | Tamamlama geçmişi |
| `lectureNotesMeta` | PDF notları metadata |

**Index Stratejisi:**
- Compound index: `[courseId+order]`, `[type+dateISO]`
- O(1) sorgular için optimize edilmiş

### Zustand (UI State Only)

| Store | İçerik |
|-------|--------|
| `plannerUIStore` | Seçili ders/ünite, modal durumları, filtreler, sıralama |
| `uiPreferencesStore` | Tema, sidebar durumu |

### localStorage (Sadece Preferences)

| Key | Açıklama |
|-----|----------|
| `planex-ui-prefs` | UI tercihleri |
| `planex-migration-flags` | Migration durumu |

### Migration (v1 → v2)

Legacy `lifeflow-planner` verisi otomatik olarak Dexie'ye migrate edilir:
- Zod ile veri doğrulama
- Atomic transaction
- 7 gün rollback penceresi
- Corrupt veri kurtarma

---

## Proje Yapısı

```
src/
├── app/                    # Router + layout
│   ├── components/         # Header, Sidebar, Bottom Nav
│   ├── layouts/            # AppLayout
│   └── providers/          # ThemeProvider
├── db/                     # Dexie/IndexedDB katmanı
│   ├── database.ts         # LifeFlowDB (time tracking)
│   └── planner/            # Planner Dexie modülü
│       ├── database.ts     # PlannerDatabase sınıfı
│       ├── types.ts        # DB entity tipleri
│       ├── queries/        # useLiveQuery hook'ları
│       │   ├── courseQueries.ts
│       │   ├── taskQueries.ts
│       │   ├── eventQueries.ts
│       │   ├── habitQueries.ts
│       │   └── statsQueries.ts
│       └── migrations/     # localStorage → Dexie migration
│           ├── migrationService.ts
│           └── MigrationProvider.tsx
├── i18n/                   # Çoklu dil desteği
│   ├── locales/            # TR/EN çevirileri
│   ├── config.ts           # i18n yapılandırması
│   └── I18nProvider.tsx    # React context/hooks
├── modules/
│   ├── planner/            # Ders, Görev, Takvim modülleri
│   │   ├── components/     # UI bileşenleri
│   │   │   ├── features/   # GlobalSearchBoxes, LectureNotes, QuickNotes
│   │   │   └── ui/         # Button, Card, Input, Modal
│   │   ├── lib/            # Utils, hooks
│   │   │   └── hooks/      # useCalendarGrid, useCalendarEvents
│   │   ├── pages/          # Sayfa bileşenleri
│   │   ├── store/          # Zustand store (UI-only)
│   │   │   ├── plannerStore.ts    # Legacy (migration için)
│   │   │   └── plannerUIStore.ts  # UI state only
│   │   └── types/          # TypeScript tipleri
│   └── settings/           # Ayarlar modülü
└── shared/                 # Paylaşılan bileşenler
    ├── components/         # Toast, Modal, ErrorBoundary
    ├── hooks/              # useKeyboardShortcuts, useMediaQuery
    └── utils/              # Yardımcı fonksiyonlar
```

---

## Son Güncelleme (2026-01-27)

### ➕ Yeni Eklenenler (v2.0 - Dexie Refactor)
- **Dexie Veri Katmanı**: localStorage → IndexedDB migration tamamlandı
  - `PlannerDatabase` ile courses, units, tasks, events, habits tabloları
  - Compound index'ler ile O(1) sorgular
  - `useLiveQuery` hook'ları ile reaktif veri
- **Migration Servisi**: Legacy veri otomatik migration
  - Zod validasyonu
  - 7 gün rollback penceresi
  - Corrupt veri kurtarma
- **plannerUIStore**: UI-only state ayrıştırması
  - Seçili öğeler, modal durumları, filtreler
  - localStorage persist sadece tercihler için
- **CalendarPage Decomposition**: 500+ satır monolith → hook'lar
  - `useCalendarGrid`: 42 günlük grid hesaplama
  - `useCalendarEvents`: DB event sorguları
  - `useEventModal`: Modal state yönetimi
- **i18n Altyapısı**: Çoklu dil desteği
  - Türkçe (varsayılan) ve İngilizce
  - Namespace tabanlı çeviriler (common, planner, calendar, habits, settings)
  - `useTranslation`, `useDateFormatter` hook'ları

### 🧪 Test Coverage
- 236 test geçiyor
- Calendar grid testleri
- Progress/streak hesaplama testleri
- Dexie query testleri (fake-indexeddb)
- Migration testleri

### ⏳ Sonraki Adımlar
- Component entegrasyonu (yeni hook'lar + Dexie queries)
- Eski plannerStore kod temizliği
- Performance profiling
- E2E test güncellemeleri

---

## 🚀 Deployment

### Vercel'e Deploy Etme

#### Otomatik Deploy (Önerilen)
1. GitHub repository'nizi Vercel'e bağlayın
2. Vercel otomatik olarak `vercel.json` yapılandırmasını algılar
3. Her push otomatik olarak deploy edilir

#### Manuel Deploy
```bash
# Vercel CLI'yi yükleyin
npm i -g vercel

# Projeyi deploy edin
vercel

# Production'a deploy edin
vercel --prod
```

#### Deploy Kontrol Listesi
✅ TypeScript hataları yok (`npm run build` başarılı)
✅ Test dosyaları geçiyor (`npm test`)
✅ `vercel.json` yapılandırması mevcut
✅ `package.json` build script'i doğru
✅ PWA asset'leri (`public/` klasöründe)
✅ Environment variables (gerekiyorsa)

### Vercel Yapılandırması

Proje zaten production-ready olarak yapılandırılmıştır:

- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm ci`
- **Region**: Frankfurt (fra1)
- **Cache Headers**: Asset'ler için optimize edilmiş
- **Security Headers**: CSP, XSS Protection, Frame Options
- **SPA Routing**: Tüm route'lar `index.html`'e yönlendirilir

### PWA Desteği

Uygulama Progressive Web App olarak çalışır:
- Service Worker otomatik olarak generate edilir
- Offline çalışma
- 192x192 ve 512x512 PWA icon'ları
- Manifest.json konfigürasyonu
- iOS Safari desteği (apple-touch-icon)

---

## 📝 License

MIT
