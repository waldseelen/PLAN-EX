ROL: Senior Product Engineer + Frontend Architect (React, TypeScript, Vite, IndexedDB, UX).
ÜRÜN: Plan.Ex (tek uygulama, web app).
AMAÇ: Aşağıda verilen özellik listesini projede **tek tek doğrula**, eksik veya yarım olanları **çalışır şekilde tamamla**, çakışmaları temizle, kullanılmayan kodu sil ve ürünü tutarlı, sürdürülebilir, erişilebilir ve performanslı hale getir.

============================================================================
ZORUNLU KURAL (EN ÖNEMLİSİ)
============================================================================
- Listede yazan bir özellik:
  - YA gerçekten çalışır olacak
  - YA tamamen kaldırılacak
  - YA da README’de açıkça “planned / disabled” olarak işaretlenecek
- Yarım özellik, boş ekran, fake UI BIRAKMA.
- Endpoint’i olmayan ama UI yazılmış kod KALMASIN.
- Tüm veriler tek **local data layer** üzerinden yönetilsin (localStorage + IndexedDB).

============================================================================
A) ÖZELLİK DOĞRULAMA & TAMAMLAMA (CHECKLIST)
============================================================================
Aşağıdaki başlıkları **tek tek kodda ara**, var mı yok mu kontrol et, yoksa implement et:

--------------------
1) Ders Yönetimi
--------------------
- Çoklu ders oluşturma (sınırsız)
- Ders → Ünite → Görev hiyerarşisi
- 9 renk paleti ile ders renklendirme
- Görevler için drag & drop sıralama
- Ders bazlı % ilerleme hesabı

Eksikse:
- Veri modeli kur
- UI + state + persist ekle

--------------------
2) PDF Ders Notları
--------------------
- Ders başına sınırsız PDF yükleme
- IndexedDB ile dosya saklama (large blob)
- Son yüklenen PDF’e tek tık erişim
- Upload progress bar
- Yeni sekmede açma
- İndirme

IndexedDB kullanılmıyorsa → ZORUNLU OLARAK ekle.

--------------------
3) Sınav Takibi
--------------------
- Midterm / Final tarihleri
- Geri sayım (kalan gün)
- Renkli uyarı sistemi:
  - 🔴 ≤3 gün → animasyon
  - 🟠 ≤7 gün → uyarı
- Ana ekranda “Yaklaşan sınavlar” listesi

--------------------
4) Pomodoro Timer
--------------------
- Çalışma / kısa mola / uzun mola ayarları
- Oturum sayacı
- Otomatik geçiş
- Toast bildirimi

--------------------
5) İstatistikler
--------------------
- Son 7 gün görev tamamlama
- Streak sistemi
- Haftalık özet
- Genel ilerleme yüzdesi

--------------------
6) Takvim Görünümü
--------------------
- Aylık takvim
- Ders renkleri
- Aylar arası navigasyon
- Sınav & event görünümü

--------------------
7) Arama
--------------------
- Görevler içinde anlık arama
- Debounced input
- Vurgulu sonuçlar

--------------------
8) Tema & Görünüm
--------------------
- Dark / Light
- System theme
- Smooth transition
- Glassmorphism

--------------------
9) Veri Yönetimi
--------------------
- 30 sn auto-save
- LocalStorage (küçük veri)
- IndexedDB (PDF)
- JSON export
- JSON import
- 7 gün yedekleme hatırlatıcısı

--------------------
10) Klavye Kısayolları
--------------------
Ctrl+S, Ctrl+Z, Ctrl+K, Ctrl+,, Ctrl+Shift+D, Ctrl+N, Esc
→ Hepsi global ve çakışmasız çalışmalı

--------------------
11) Responsive Tasarım
--------------------
- Mobile-first
- Hamburger menu
- Touch friendly
- Desktop optimize

--------------------
12) Ekstra Özellikler
--------------------
- Confetti (ders tamamlanınca)
- Completion sound
- Toast system
- Syllabus export (Markdown)
- Daily log export
- Quick Add modal

============================================================================
B) YENİ ZORUNLU ÖZELLİKLER (EKLENECEK)
============================================================================

--------------------
1) Ana Sayfa Global Search Box’lar
--------------------
Dashboard / Ana sayfada 3 ayrı search input olacak:

- 🔍 Google Search
- ▶️ YouTube Search
- 🤖 ChatGPT Search

Davranış:
- Input’a yaz → Enter
- Yeni sekmede arama açılır
  - Google: https://www.google.com/search?q=...
  - YouTube: https://www.youtube.com/results?search_query=...
  - ChatGPT: https://chat.openai.com/?q=... (query encoded)

--------------------
2) Görev & Course Task İçine Gömülü Arama Butonları
--------------------
Her task item içinde 3 küçük icon buton:

- Google
- YouTube
- ChatGPT

Davranış:
- Buton → task başlığı + açıklaması ile arama yapar
- Yeni sekmede açılır
- UI minimal, icon-only, hover tooltip’li

============================================================================
C) ROUTING & BOŞ EKRAN DENETİMİ
============================================================================
- Tüm route’ları tara
- Boş render olan sayfa KALMASIN
- `/planner/courses/:id` gibi dinamik route’larda:
  - loading
  - not found
  - error state ZORUNLU

============================================================================
D) LOCAL DATA LAYER (TEK KAYNAK)
============================================================================
- courses, units, tasks, events, habits, settings
- Tek CRUD interface
- UI doğrudan storage’a dokunmasın
- Migration stratejisi ekle (schema değişirse)

============================================================================
E) TEMİZLİK & SÜRDÜRÜLEBİLİRLİK
============================================================================
- Kullanılmayan component sil
- Kullanılmayan utils sil
- Kullanılmayan dependency sil
- Duplicate store/service kaldır
- Naming & folder consistency sağla

============================================================================
F) ERİŞİLEBİLİRLİK
============================================================================
- Keyboard navigation
- Modal focus trap
- ARIA role (dialog, button)
- Kontrast kontrolü
- Screen reader uyumu

============================================================================
G) README & RAPOR
============================================================================
README:
- SADECE GERÇEKTEN ÇALIŞAN özellikleri yaz
- Route haritası ekle
- Veri saklama açıklaması

SON RAPORDA ŞUNLAR OLSUN:
- ✔ Çalışan özellikler
- ✖ Kaldırılan özellikler
- ➕ Yeni eklenenler
- ⚠ Riskli alanlar
- 🧹 Temizlenen kodlar
- 📐 Mimari öneriler

============================================================================
TON & FORMAT
============================================================================
- Türkçe
- Teknik
- Net
- Maddeli
- Varsayım varsa açıkça “Varsayım:” de

AMAÇ:
Plan.Ex’i “yarı çalışan demo” değil, **ciddi, ölçeklenebilir, gerçek bir ürün** haline getirmek.
