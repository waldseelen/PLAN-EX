# 📚 Academic Planner - Ders Takip ve Görev Yönetimi

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![React](https://img.shields.io/badge/React-19.2-61DAFB.svg?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6.svg?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.2-646CFF.svg?logo=vite)

**Modern, hızlı ve kullanıcı dostu bir akademik planlama uygulaması**

[Özellikler](#-özellikler) • [Kurulum](#-kurulum) • [Klavye Kısayolları](#-klavye-kısayolları)

</div>

---

## 🎯 Özellikler

### 📖 Ders Yönetimi
- **Çoklu Ders Desteği**: Sınırsız sayıda ders oluşturma ve yönetme
- **Ünite & Görev Sistemi**: Her ders için üniteler ve görevler
- **Özelleştirilebilir Renkler**: 9 farklı renk paleti ile ders renklendirme
- **Sürükle-Bırak Sıralama**: Görevleri sürükleyerek yeniden sıralama
- **İlerleme Takibi**: Her ders için yüzdelik ilerleme göstergesi

### 📄 PDF Ders Notları
- **PDF Yükleme**: Her ders için sınırsız PDF yükleme
- **Kalıcı Depolama**: IndexedDB ile büyük dosyaların kalıcı saklanması
- **Hızlı Erişim**: Son yüklenen PDF'e tek tıkla erişim
- **Progress Bar**: Yükleme durumu göstergesi
- **Yeni Sekmede Açma**: PDF'leri tarayıcının yeni sekmesinde görüntüleme
- **İndirme**: PDF'leri bilgisayara indirme

### 📅 Sınav Takibi
- **Sınav Tarihleri**: Her ders için midterm ve final tarihleri
- **Geri Sayım**: Sınava kalan gün göstergesi
- **Renk Kodlu Uyarılar**: 
  - 🔴 3 gün veya az kala animasyonlu kırmızı uyarı
  - 🟠 7 gün veya az kala turuncu uyarı
- **Yaklaşan Sınavlar Listesi**: Overview'da tüm sınavları görme

### ⏱️ Pomodoro Timer
- **Özelleştirilebilir Süreler**: Çalışma, kısa mola, uzun mola süreleri
- **Oturum Takibi**: Kaç pomodoro tamamlandığını sayma
- **Otomatik Geçiş**: Çalışma ve mola arasında otomatik geçiş
- **Bildirimler**: Her oturum sonunda toast bildirimi

### 🎵 Ambient Sound Player
- **Arka Plan Sesleri**: Yağmur, orman, kahve dükkanı, dalga sesleri
- **Ses Kontrolü**: Ses seviyesi ayarı
- **Focus Mode**: Odaklanma modu için ses desteği

### 📊 İstatistikler
- **Günlük Aktivite**: Son 7 günlük görev tamamlama grafiği
- **Streak Takibi**: Ardışık gün serisi ve rozet sistemi
- **Haftalık Özet**: Bu hafta tamamlanan görev sayısı
- **Toplam İlerleme**: Tüm derslerin genel ilerleme yüzdesi

### 📆 Takvim Görünümü
- **Aylık Takvim**: Sınavları takvim üzerinde görme
- **Renkli Göstergeler**: Her ders kendi rengiyle
- **Navigasyon**: Aylar arası geçiş

### 🔍 Arama
- **Anlık Arama**: Görevler içinde hızlı arama
- **Debounced Input**: Performans için geciktirilmiş arama
- **Sonuç Vurgulama**: Eşleşen metinlerin vurgulanması

### 🎨 Tema & Görünüm
- **Dark/Light Mode**: Karanlık ve aydınlık tema
- **System Theme**: Sistem temasına otomatik uyum
- **Smooth Transitions**: Yumuşak tema geçişleri
- **Glassmorphism UI**: Modern cam efekti tasarımı

### 💾 Veri Yönetimi
- **Otomatik Kayıt**: 30 saniyede bir otomatik kaydetme
- **LocalStorage**: Görevler ve ayarlar için kalıcı depolama
- **IndexedDB**: Büyük PDF dosyaları için ayrı depolama
- **JSON Yedekleme**: Tüm verileri JSON olarak dışa aktarma
- **Veri İçe Aktarma**: JSON yedeklerini geri yükleme
- **Yedekleme Hatırlatıcısı**: 7 gün sonra yedekleme uyarısı

### ⌨️ Klavye Kısayolları
| Kısayol | İşlev |
|---------|-------|
| `Ctrl + S` | Verileri yedekle |
| `Ctrl + Z` | Son işlemi geri al |
| `Ctrl + K` | Arama kutusuna odaklan |
| `Ctrl + ,` | Ayarları aç |
| `Ctrl + Shift + D` | Tema değiştir |
| `Ctrl + N` | Yeni görev ekle |
| `Escape` | Açık modali kapat |

### 📱 Responsive Tasarım
- **Mobile First**: Mobil cihazlar için optimize
- **Hamburger Menü**: Mobilde yan menü
- **Touch Friendly**: Dokunmatik ekranlar için uygun
- **Desktop Optimized**: Geniş ekranlarda tam deneyim

### 🎉 Ekstra Özellikler
- **Confetti Animasyonu**: Ders tamamlandığında kutlama
- **Completion Sound**: Görev tamamlandığında ses efekti
- **Toast Notifications**: Bildirim sistemi
- **Syllabus Export**: Ders müfredatını Markdown olarak kopyalama
- **Daily Log Export**: Günlük ilerlemeyi kopyalama
- **Quick Add**: Hızlı görev ekleme modalı

---

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- npm veya yarn

### Adımlar

```bash
# Repository'yi klonla
git clone https://github.com/waldseelen/TO-DO.git
cd TO-DO

# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Production build
npm run build
```

---

## 📁 Proje Yapısı

```
src/
├── components/
│   ├── features/
│   │   ├── Calendar/          # Takvim görünümü
│   │   ├── CourseDetail/      # Ders detay sayfası & PDF yönetimi
│   │   ├── DailyPlan/         # Günlük plan
│   │   ├── Layout/            # Sidebar ve layout
│   │   ├── Overview/          # Ana sayfa overview
│   │   ├── Productivity/      # Pomodoro & Ambient Sound
│   │   ├── QuickAdd/          # Hızlı görev ekleme
│   │   ├── Search/            # Arama sonuçları
│   │   ├── Settings/          # Ayarlar modalı
│   │   ├── Statistics/        # İstatistikler
│   │   └── Task/              # Görev detay modalı
│   └── ui/                    # Yeniden kullanılabilir UI bileşenleri
├── context/
│   └── AppContext.tsx         # Global state yönetimi
├── hooks/                     # Custom React hooks
├── types/                     # TypeScript tipleri
├── utils/                     # Yardımcı fonksiyonlar
└── data/                      # Başlangıç verileri
```

---

## 🛠️ Teknolojiler

- **React 19.2** - UI framework
- **TypeScript 5.8** - Type safety
- **Vite 6.2** - Build tool & dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **IndexedDB** - Large file storage
- **LocalStorage** - Settings & tasks

---

## 📊 Performans

- ⚡ **Hızlı Yükleme**: Vite ile optimized build
- 🔄 **Debounced Operations**: Gereksiz render'ları önleme
- 💾 **Efficient Storage**: IndexedDB ile büyük dosyalar
- 🎯 **Memoization**: useMemo ve useCallback ile optimizasyon

---

## 🔒 Gizlilik

- Tüm veriler tarayıcıda saklanır
- Sunucuya veri gönderilmez
- IndexedDB ile güvenli depolama
- JSON export ile tam veri kontrolü

---

## 📝 Lisans

MIT License

---

<div align="center">

**Made with ❤️ for students**

</div>
