# LifeFlow

Offline-first zaman ve alışkanlık takip PWA uygulaması.

## 🚀 Başlangıç

### Gereksinimler
- Node.js 18+
- npm veya pnpm

### Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Testleri çalıştır
npm run test

# Production build
npm run build
```

## 📁 Proje Yapısı

```
src/
├── app/                    # App shell, layout, providers
│   ├── components/         # Global layout components
│   ├── layouts/           # Page layouts
│   └── providers/         # Context providers (Theme, etc.)
├── modules/               # Feature modules
│   ├── core-time/         # Timer & Activities
│   ├── habits/            # Habit tracking
│   ├── insights/          # Statistics & Charts
│   ├── calendar/          # Calendar view
│   ├── dashboard/         # Dashboard
│   └── settings/          # App settings
├── shared/                # Shared utilities
│   ├── hooks/             # Custom React hooks
│   └── utils/             # Utility functions
├── db/                    # Database (Dexie/IndexedDB)
├── events/                # Event bus system
└── infra/                 # Infrastructure (SW, crypto, export)
```

## 🏗️ Mimari

### Katmanlar
- **UI**: React components, presentational
- **Application**: Use-case orchestration (stores)
- **Domain**: Pure functions, business logic
- **Data**: Dexie repositories
- **Infra**: Platform-specific (SW, notifications)

### Event-Driven
Tüm önemli aksiyonlar domain event üretir:
- `TIMER_STARTED`, `TIMER_STOPPED`
- `HABIT_CHECKED`, `HABIT_SKIPPED`
- `SESSION_CREATED`, `SESSION_MERGED`
- `GOAL_REACHED`, `DAY_ROLLOVER`

## 🛠️ Tech Stack

- **React 18** + TypeScript
- **Vite** (build tool)
- **TailwindCSS** (styling)
- **Zustand** (state management)
- **Dexie** (IndexedDB wrapper)
- **Luxon** (date/time)
- **ECharts** (charts)
- **Workbox** (PWA/service worker)

## ✅ MVP Özellikleri

### Zaman Takibi
- [x] Timer başlat/durdur
- [x] Aktivite yönetimi
- [ ] Manuel session ekleme
- [ ] Session düzenleme/birleştirme
- [ ] Pomodoro modu

### Alışkanlıklar
- [x] Alışkanlık oluşturma
- [x] Günlük check/skip
- [x] Streak hesaplama
- [ ] Haftalık schedule
- [ ] Custom periyot

### Diğer
- [x] Dark/Light tema
- [x] Responsive layout
- [ ] İstatistikler
- [ ] Export/Import
- [ ] PWA offline

## 📄 Lisans

MIT
