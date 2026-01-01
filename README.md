# Plan.Ex �

**Plan. Execute. Be Expert.**

Görevlerinizi, derslerinizi ve günlük planınızı tek bir dark-mode deneyiminde yönetin. Aviation panel discipline ve cybersecurity refinement ile tasarlandı.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38BDF8)](https://tailwindcss.com/)

---

## ✨ Özellikler

### 📖 Ders & Kurs Yönetimi
- Ders ekleme ve düzenleme
- Ünite ve görev takibi
- Sınav takvimi ve geri sayım (kalan gün göstergesi)
- Her ders için ilerleme çubukları
- Sınav tarihleri renk kodlu (acil: kırmızı, yaklaşan: turuncu)

### ✅ Alışkanlık Takibi
- Günlük alışkanlık yönetimi
- Streak hesaplama
- Heatmap görünümü
- Detaylı istatistikler

### 📅 Birleşik Takvim
- Tüm etkinlikleri tek ekranda görün
- Sınav tarihlerine kalan günler
- Etkinlikleri düzenleme ve silme
- Renk kodlu kategoriler

### ⏱️ Pomodoro Timer
- Özelleştirilebilir süreler
- Çalışma/mola döngüleri
- Session istatistikleri

### 📊 İstatistikler & Insights
- Haftalık/aylık görünümler
- İlerleme grafikleri
- Verimlilik analizleri
- Sağ panel ile anlık istatistikler

### 🎨 Dark-Tech UI
- Elektrik cyan ve altın gold renk paleti
- Glass panel ve circuit pattern efektleri
- Responsive 3 kolonlu layout
- Animasyonlu geçişler

### ✨ Akıllı Oluştur (+) Butonu
- Sağ altta yuvarlak FAB (Floating Action Button)
- Basma: Ne oluşturmak istediğinizi soran modal açılır
  - Görev
  - Alışkanlık
  - Ders
  - Etkinlik / Sınav
- Uzun basma: Hızlı menü (Görev Ekle, Ders Ekle, Alışkanlık Ekle, Etkinlik/Sınav)

### ⚙️ Ayarlar
- Koyu tema varsayılan
- Veri yedekleme (Export/Import)
- Gizlilik modu
- Arayüz kişileştirme

## 🚀 Başlangıç

### Gereksinimler
- Node.js 18+
- npm, yarn veya pnpm

### Kurulum

```bash
# Repoyu klonla
git clone https://github.com/waldseelen/PLAN.EX.git
cd PLAN.EX

# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

### Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Development sunucusu (http://localhost:3000) |
| `npm run build` | Production build |
| `npm run preview` | Production önizleme |
| `npm run lint` | ESLint kontrolü |
| `npm run typecheck` | TypeScript kontrolü |
| `npm run test` | Vitest testleri |

## 📁 Proje Yapısı

```
src/
├── app/                    # App shell, layout, providers
│   ├── components/         # Sidebar, BottomNavigation
│   ├── layouts/           # AppLayout
│   └── providers/         # ThemeProvider
├── modules/               # Feature modülleri
│   ├── planner/           # Dersler, Görevler, Takvim, Pomodoro
│   │   ├── pages/         # Sayfa componentleri
│   │   ├── components/    # UI componentleri
│   │   ├── store/         # Zustand stores
│   │   └── types/         # TypeScript tipleri
│   ├── habits/            # Alışkanlık takibi
│   │   ├── pages/         # HabitsDashboard, HabitDetail
│   │   └── store/         # habitsStore
│   └── settings/          # Uygulama ayarları
│       ├── pages/         # Settings
│       └── store/         # settingsStore
├── shared/                # Paylaşılan yardımcılar
│   ├── components/        # ErrorBoundary, Modal, Toast
│   ├── hooks/             # useMediaQuery, useOnlineStatus
│   ├── store/             # UI preferences store
│   └── utils/             # Yardımcı fonksiyonlar
├── db/                    # Dexie/IndexedDB
├── lib/                   # DI container, backup, validation
└── config/                # Sabitler, varsayılanlar
```

## 🏗️ Mimari

### State Management
- **Zustand** ile global state
- LocalStorage persistence
- Module-specific stores

### Routing
- **React Router v6** ile tek sayfa uygulama
- Lazy loading ile route-based code splitting
- Nested routes

### Veri Katmanı
- **Dexie** (IndexedDB wrapper)
- Offline-first yaklaşım
- Export/Import desteği

### PWA
- Service Worker ile önbellek
- Offline çalışma
- Install prompt

## 📱 Ekranlar

| Ekran | Yol | Açıklama |
|-------|-----|----------|
| Ana Sayfa | `/` | Dashboard özeti, devam eden etkinlikler |
| Dersler | `/courses` | Tüm dersler listesi, hızlı erişim |
| Ders Detay | `/courses/:id` | Üniteler, görevler, sınavlar, ders notları |
| Takvim | `/calendar` | Birleşik etkinlik takvimi (sınav + etkinlik) |
| Görevler | `/tasks` | Tüm kişisel görevler listesi |
| Alışkanlıklar | `/habits` | Alışkanlık listesi |
| Alışkanlık Detay | `/habits/:id` | Detaylı istatistik, heatmap |
| Pomodoro | `/productivity` | Pomodoro timer ve session geçmişi |
| İstatistikler | `/statistics` | Çalışma, alışkanlık ve ders grafikleri |
| Ayarlar | `/settings` | Tercihler, yedekleme, gizlilik |

## 🛠️ Tech Stack

| Kategori | Teknoloji |
|----------|-----------|
| Framework | React 18, TypeScript 5.7 |
| Build | Vite 6.4 |
| Styling | TailwindCSS 3.4 |
| State | Zustand 5 |
| Database | Dexie 4 (IndexedDB) |
| Icons | Heroicons, Lucide |
| Animation | Framer Motion |
| PWA | VitePWA, Workbox |

## 🗺️ Roadmap

### v1.1
- [ ] Pomodoro bildirim sesleri
- [ ] Alışkanlık hatırlatıcıları
- [ ] Daha fazla grafik türü

### v1.2
- [ ] Bulut senkronizasyon
- [ ] Paylaşım özellikleri
- [ ] Widget desteği

### v2.0
- [ ] AI destekli öneriler
- [ ] Çoklu dil desteği
- [ ] Tema özelleştirme

## 📄 Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

**Plan.Ex** ile zamanınızı yönetin, hedeflerinize ulaşın! 🚀
