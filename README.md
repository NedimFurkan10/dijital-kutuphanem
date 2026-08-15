# Dijital Kütüphanem

Open Library üzerinden kitap aramaya, kişisel kütüphane oluşturmaya ve okuma istatistiklerini takip etmeye yarayan statik web uygulaması.

## Kullanım

`index.html` dosyasını yerel bir web sunucusuyla açın veya GitHub Pages üzerinden yayınlayın.

## Önemli not

Bu sürümde kullanıcı ve kitap verileri yalnızca kullandığınız tarayıcının `localStorage` alanında tutulur. Veriler cihazlar arasında senkronize edilmez ve bu oturum sistemi gerçek güvenlik sağlamaz. Gerçek kullanıcı hesapları için backend, parola hashleme ve güvenli oturum yönetimi eklenmelidir.

## Sayfa sayıları

Uygulama, Open Library baskı verisinden sayfa sayısını almaya çalışır. Kaynakta bilgi yoksa kitap, sayfa sayısı kullanıcı tarafından girilmeden kütüphaneye eklenemez.
