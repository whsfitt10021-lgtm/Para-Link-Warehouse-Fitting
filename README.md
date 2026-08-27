
# Pusat Data Operasional — React + TypeScript

Versi React/TypeScript dari halaman Apps Script "Pusat Data Operasional".
Tampilan (HTML/CSS) dipertahankan sama persis dengan versi asli, hanya
strukturnya dipindah jadi komponen React, dan pemanggilan data diubah dari
`google.script.run` (yang cuma jalan di dalam Apps Script) menjadi `fetch()`
ke Web App Apps Script — supaya bisa di-hosting terpisah di Netlify.

## Struktur proyek

```
src/
  api.ts                    -> semua pemanggilan ke backend Apps Script
  types.ts                  -> tipe data (LinkItem, dll)
  App.tsx                   -> komponen utama (state, search, render list)
  index.css                 -> semua styling (dipindah 1:1 dari <style> asli)
  components/
    LinkRow.tsx              -> satu baris data di daftar
    AddLinkModal.tsx          -> modal "Tambah Link Baru"
    DeleteConfirmModal.tsx    -> modal konfirmasi hapus (ketik ulang nama)
apps-script/
  Code.gs                   -> backend baru (ganti isi Code.gs di project Apps Script kamu)
```

## 1. Kenapa backend Apps Script perlu diubah?

`google.script.run` hanya bisa dipanggil dari HTML yang **disajikan langsung
oleh Apps Script** (lewat `HtmlService`). Begitu frontend dipindah ke Netlify,
`google.script.run` tidak ada lagi — jadi backend harus diakses sebagai
**Web App biasa lewat HTTP** (`fetch`), dengan `doGet` / `doPost` yang
mengembalikan JSON.

File `apps-script/Code.gs` di folder ini adalah versi barunya:

| Aksi lama (`google.script.run`) | Endpoint baru |
|---|---|
| `refreshLinks()` | `GET  {url}?action=list` |
| `addLink(nama,url,kategori,detail)` | `POST {url}` body `{ action:"add", nama, url, kategori, detail }` |
| `deleteLink(rowNumber, nama)` | `POST {url}` body `{ action:"delete", rowNumber, nama }` |

**Cara pasang:**
1. Buka project Apps Script yang sudah menyimpan Sheet-mu.
2. Ganti/tambahkan isi `Code.gs` dengan isi file `apps-script/Code.gs` di sini.
   (Sesuaikan `SHEET_NAME` di baris atas kalau nama sheet-mu bukan `"Links"`,
   dan sesuaikan urutan kolom di `readLinks_()` / `addLinkRow_()` kalau
   struktur sheet lama kamu berbeda.)
3. **Deploy > New deployment > Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Salin URL `.../exec` yang muncul — itu yang dipakai frontend.
   URL yang kamu berikan sudah dipasang sebagai default di `src/api.ts`:
   ```
   https://script.google.com/macros/s/AKfycbx-xzMzTMx_jw2mYizOL9hAGT75v_6C6Q-IeG5yXBikA9gzk4g5AqKun-FlfRBlSw_I/exec
   ```
   Kalau URL berubah (misalnya deploy ulang membuat URL baru), update
   `APPS_SCRIPT_URL` di `src/api.ts`, atau isi env var `VITE_APPS_SCRIPT_URL`
   (lihat `.env.example`) tanpa perlu mengubah kode.

> Catatan CORS: request GET dikirim tanpa header custom, dan request POST
> dikirim dengan `Content-Type: text/plain;charset=utf-8` (bukan
> `application/json`). Ini supaya browser menganggapnya "simple request" dan
> tidak mengirim preflight `OPTIONS` — karena Apps Script Web App tidak bisa
> merespons preflight itu. Body POST tetap JSON string dan di-parse manual di
> `doPost`. Selama kamu tidak mengubah `Content-Type` di `src/api.ts`, ini akan
> tetap berfungsi.

## 2. Jalankan secara lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

## 3. Simpan ke GitHub

```bash
git add -A
git commit -m "Convert to React + TypeScript"
git branch -M main
git remote add origin <URL_REPO_GITHUB_KAMU>
git push -u origin main
```

## 4. Deploy ke Netlify

**Opsi A — lewat dashboard Netlify:**
1. New site from Git > pilih repo GitHub-mu.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. (Opsional) tambahkan environment variable `VITE_APPS_SCRIPT_URL` di
   Site settings > Environment variables kalau mau override URL backend
   tanpa mengubah kode.
5. Deploy.

File `netlify.toml` di root sudah berisi konfigurasi build & redirect di atas,
jadi Netlify akan otomatis memakainya.

**Opsi B — Netlify CLI:**
```bash
npm run build
npx netlify-cli deploy --prod --dir=dist
```

## 5. Menyesuaikan struktur Sheet

Backend baru mengasumsikan sheet bernama `Links` dengan header:

| A (Nama) | B (URL) | C (Kategori) | D (Detail) |
|---|---|---|---|

Kalau sheet lamamu punya nama/urutan kolom berbeda, sesuaikan konstanta
`SHEET_NAME` dan fungsi `readLinks_()` / `addLinkRow_()` di `Code.gs`.
