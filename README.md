# Plan.Ex

**Plan. Execute. Be Expert.**

Plan.Ex; dersler (course), görevler (task), sınav/etkinlikler (event/exam) ve alışkanlıkları tek bir SPA içinde, offline-first olarak yönetmek için tasarlanmış bir React + TypeScript + Vite uygulaması.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38BDF8)](https://tailwindcss.com/)

---

## Özellikler (çalışan)

### Planner (Courses / Tasks / Events)
- Ders oluşturma/düzenleme (ad, kod, renk)
- Ders detayında: ders bilgisi + “kalan gün” (en yakın sınav/etkinliğe)
- Derse bağlı görevler: listeleme + tamamlama + düzenleme + silme
- Derse bağlı sınav/etkinlikler: oluşturma + düzenleme + silme

### Takvim
- Ay görünümü + gün bazlı etkinlik sayıları
- Yaklaşan sınavlar listesi + kalan gün badge’leri
- Etkinlik/sınav oluşturma + düzenleme + silme
- Ders ile ilişkilendirme (`event.courseId`)

### Habits
- Alışkanlık oluşturma ve takip ekranları (offline)

### Smart FAB (+)
- Sağ altta global FAB
- Tıkla: “Ne oluşturmak istiyorsun?” modalı
- Seçenekler: Görev / Alışkanlık / Ders / Etkinlik-Sınav

### Ayarlar
- Tema (light/dark/system)
- Veri yedekleme (Export/Import) — IndexedDB içeriği için

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

## Route Haritası (canonical)

- `/planner` — Overview
- `/planner/courses` — Courses list
- `/planner/courses/:courseId` — Course detail
- `/planner/tasks` — Personal tasks
- `/calendar` — Calendar (events/exams)
- `/habits` — Habits dashboard
- `/habits/:habitId` — Habit detail
- `/settings` — Settings

Not: Legacy yollar `/tasks`, `/productivity`, `/statistics` ilgili `/planner/*` rotalarına yönlendirilir.

---

## Veri Saklama

- Planner verileri: Zustand persist + `localStorage` (tek kaynak: planner store; Calendar aynı veriyi kullanır)
- Settings ve bazı modüller: IndexedDB (Dexie)

---

## Proje Yapısı (özet)

```
src/
  app/                # Router + layout
  modules/
    planner/          # Courses / Tasks / Calendar / Habits (UI + stores)
    settings/         # Settings (Dexie export/import dahil)
  shared/             # Paylaşılan UI, hooks, utilities
  db/                 # Dexie/IndexedDB şeması
```

