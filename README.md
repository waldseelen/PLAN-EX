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

| Veri Tipi | Depolama |
|-----------|----------|
| Planner verileri (courses, tasks, events) | Zustand persist + localStorage |
| Alışkanlıklar ve loglar | Zustand persist + localStorage |
| PDF dosyaları | IndexedDB (Dexie) - ayrı DB |
| Pomodoro oturumları | localStorage (`pomodoroSessions`) |
| Settings ve diğer modüller | IndexedDB (Dexie) |

---

## Proje Yapısı

```
src/
├── app/                    # Router + layout
│   ├── components/         # Header, Sidebar, Bottom Nav
│   ├── layouts/            # AppLayout
│   └── providers/          # ThemeProvider
├── modules/
│   ├── planner/            # Ders, Görev, Takvim modülleri
│   │   ├── components/     # UI bileşenleri
│   │   │   ├── features/   # GlobalSearchBoxes, LectureNotes, QuickNotes
│   │   │   └── ui/         # Button, Card, Input, Modal
│   │   ├── lib/            # Utils, pdfStorage
│   │   ├── pages/          # Sayfa bileşenleri
│   │   ├── store/          # Zustand store
│   │   └── types/          # TypeScript tipleri
│   └── settings/           # Ayarlar modülü
├── shared/                 # Paylaşılan bileşenler
│   ├── components/         # Toast, Modal, ErrorBoundary
│   ├── hooks/              # useKeyboardShortcuts, useMediaQuery, useCompletionFeedback
│   └── utils/              # Yardımcı fonksiyonlar
└── db/                     # Dexie/IndexedDB şeması
```

---

## Son Güncelleme (2026-01-02)

### ➕ Yeni Eklenenler
- **Gelişmiş Arama**: Header'da debounced arama, eşleşen metin vurgulama, ders/ünite/görev kategorilendirmesi
- **Drag & Drop**: Görevleri sürükle-bırak ile yeniden sıralama
- **Confetti Animasyonu**: Görev tamamlandığında kutlama efekti
- **Completion Sound**: Görev tamamlama ses efekti
- **Sınav Alarm Animasyonları**: ≤3 gün kalan sınavlar için pulse/glow efektleri
- **Backup Hatırlatıcı**: 7 gün yedekleme yapılmadığında otomatik uyarı
- **Pomodoro İstatistik Kaydı**: Oturumlar localStorage'a kalıcı kaydediliyor
- **Gelişmiş Klavye Kısayolları**: Ctrl+K (ara), Ctrl+Z (geri al), Esc (modal kapat)

### 🧹 Temizlenen/Düzeltilen
- Button bileşeni type safety düzeltmesi
- Import optimizasyonları
- Pomodoro istatistik bağlantısı düzeltildi

### ⏳ Planlanan
- Syllabus export (Markdown)
- Daily log export
- Veri katmanı birleştirme (Zustand → Dexie adapter)
- Auto-save (30 saniyede bir)
