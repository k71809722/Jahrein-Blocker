# Jahrein Engelleyici (Chrome/Edge Eklentisi)

İnternette (Twitter/X, YouTube, Kick vb.) **Jahrein** veya **Ahmet Sonuç** ile ilgili içerikleri, gönderileri ve yayınları otomatik olarak gizleyen basit bir tarayıcı eklentisi.

![Eklenti Logosu](icons/icon128.png)

## Özellikler
- **Anahtar Kelime Engelleyici**: İçinde "Jahrein", "Ahmet Sonuç" geçen gönderileri gizler.
- **Link Engelleyici**: Belirtilen linklere (örn: `twitter.com/jahreindota`) girildiğinde "Erişim Engellendi" sayfası çıkarır.
- **Akıllı Gizleme**: Sadece yazıyı değil, gönderinin tamamını (Tweet kartı, Video kutusu vb.) temizler.
- **Kick/YouTube/Twitter Desteği**: Bu platformların yapılarına özel olarak optimize edilmiştir.

## Kurulum (Geliştirici Modu)
Bu eklenti henüz Chrome Web Mağazası'nda yayınlanmamıştır. Manuel olarak yükleyebilirsiniz:

1. Bu projeyi bilgisayarınıza indirin (ZIP olarak indirip klasöre çıkartın).
2. Tarayıcınızda (Chrome veya Edge) `chrome://extensions` adresine gidin.
3. Sağ üstteki **Geliştirici Modu** (Developer Mode) anahtarını açın.
4. **Paketlenmemiş öğe yükle** (Load unpacked) butonuna tıklayın.
5. İndirdiğiniz `jahrein_blocker` klasörünü seçin.

## Kullanım
- Tarayıcınızın sağ üst köşesindeki eklenti menüsünden **Jahrein Engelleyici** ikonuna tıklayın.
- **Aktif/Pasif**: Eklentiyi buradan tamamen kapatıp açabilirsiniz.
- **Kelime Ekleme**: Engellenecek yeni kelimeler ekleyebilirsiniz.
- **Link Ekleme**: Engellenecek profil linklerini ekleyebilirsiniz.

## Katkıda Bulunma
Kodları düzenleyerek kendi filtrelerinizi oluşturabilirsiniz.
- `popup.js`: Varsayılan kelime listesi buradadır.
- `content.js`: Engelleme mantığı ve algoritması buradadır.

## Lisans
MIT License - İstediğiniz gibi kullanabilir ve dağıtabilirsiniz.
