CARA BUAT APK DARI PROYEK INI (TANPA ANDROID STUDIO)
1. Ekstrak file ZIP mentahan proyek ini ke komputer/HP kamu.
2. Buat repositori baru di github.com (boleh private), lalu upload SEMUA isi folder hasil ekstrak
   (PASTIKAN folder `.github`, `src`, `public`, serta file `package.json`, `capacitor.config.json`, `vite.config.ts`, `index.html`, `tsconfig.json` ikut terunggah).
3. Buka repositori di GitHub -> klik tab **Actions** -> pilih **Build Android APK** -> klik **Run workflow**.
4. Tunggu ~4-5 menit hingga selesai, buka run yang hijau, lalu unduh artifak **"kerajaan-1066-apk"** di bagian Artifacts.
5. Ekstrak zip artifak tersebut, lalu instal `app-debug.apk` di HP Android (izinkan pemasangan dari sumber tidak dikenal).
Save game menggunakan localStorage, jadi progres tetap tersimpan di dalam aplikasi.
