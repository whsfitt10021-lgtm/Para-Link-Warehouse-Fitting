/**
 * Backend Apps Script untuk "Pusat Data Operasional".
 *
 * Karena frontend sekarang di-hosting terpisah (React di Netlify), kita tidak
 * bisa lagi pakai google.script.run (itu hanya jalan kalau HTML-nya disajikan
 * langsung oleh Apps Script). Sebagai gantinya, Web App ini bertindak sebagai
 * REST-ish JSON API yang dipanggil lewat fetch() dari React:
 *
 *   GET  {url}?action=list                -> daftar semua link
 *   POST {url}  body: { action:"add",    nama, url, kategori, detail }
 *   POST {url}  body: { action:"delete", rowNumber, nama }
 *
 * PENTING soal CORS:
 * Apps Script Web App tidak bisa merespons preflight OPTIONS dengan header
 * CORS custom. Supaya browser TIDAK mengirim preflight, request dari frontend
 * harus tetap berupa "simple request":
 *   - GET tanpa header custom
 *   - POST dengan Content-Type: text/plain;charset=utf-8 (bukan application/json)
 * Body POST tetap JSON string, dan di sini kita parse manual dari
 * e.postData.contents. Selama frontend (src/api.ts) mengikuti pola ini,
 * tidak perlu header CORS tambahan.
 *
 * SETUP SHEET:
 * Sheet bernama "Links" dengan header di baris 1:
 *   A: Nama | B: URL | C: Kategori | D: Detail
 * Data mulai dari baris 2. rowNumber yang dikirim ke frontend = nomor baris
 * asli di sheet, dipakai untuk update/hapus.
 *
 * DEPLOY:
 * Deploy > New deployment > Web app > Execute as: Me > Who has access: Anyone.
 * Pakai URL /exec yang dihasilkan sebagai VITE_APPS_SCRIPT_URL di frontend.
 */

var SHEET_NAME = 'Links';

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Nama', 'URL', 'Kategori', 'Detail']);
  }
  return sheet;
}

function readLinks_() {
  var sheet = getSheet_();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  var values = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
  var links = [];
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var nama = String(row[0] || '').trim();
    var url = String(row[1] || '').trim();
    if (!nama && !url) continue; // lewati baris kosong
    links.push({
      rowNumber: i + 2,
      nama: nama,
      url: url,
      kategori: String(row[2] || '').trim(),
      detail: String(row[3] || '').trim(),
    });
  }
  return links;
}

function jsonOut_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function ok_(data) {
  return jsonOut_({ ok: true, data: data });
}

function fail_(message) {
  return jsonOut_({ ok: false, message: message });
}

/** Menangani GET (dipakai untuk action=list). */
function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || 'list';
    if (action === 'list') {
      return ok_(readLinks_());
    }
    return fail_('Action tidak dikenal: ' + action);
  } catch (err) {
    return fail_(err.message);
  }
}

/** Menangani POST (action=add / action=delete). */
function doPost(e) {
  try {
    var body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      body = e.parameter;
    }

    var action = body.action;

    if (action === 'add') {
      return ok_(addLinkRow_(body.nama, body.url, body.kategori, body.detail));
    }

    if (action === 'delete') {
      return ok_(deleteLinkRow_(Number(body.rowNumber), body.nama));
    }

    return fail_('Action tidak dikenal: ' + action);
  } catch (err) {
    return fail_(err.message);
  }
}

function addLinkRow_(nama, url, kategori, detail) {
  nama = String(nama || '').trim();
  url = String(url || '').trim();
  if (!nama || !url) {
    throw new Error('Nama Link dan Alamat Link wajib diisi.');
  }

  var sheet = getSheet_();
  sheet.appendRow([nama, url, String(kategori || '').trim(), String(detail || '').trim()]);
  return readLinks_();
}

function deleteLinkRow_(rowNumber, nama) {
  if (!rowNumber || rowNumber < 2) {
    throw new Error('rowNumber tidak valid.');
  }

  var sheet = getSheet_();
  var lastRow = sheet.getLastRow();
  if (rowNumber > lastRow) {
    throw new Error('Baris tidak ditemukan (mungkin sudah terhapus).');
  }

  // Verifikasi nama cocok, jaga-jaga kalau baris sudah bergeser sejak
  // frontend terakhir memuat data.
  var namaDiSheet = String(sheet.getRange(rowNumber, 1).getValue() || '').trim();
  if (nama && namaDiSheet && namaDiSheet !== String(nama).trim()) {
    throw new Error('Data sudah berubah, silakan muat ulang sebelum menghapus.');
  }

  sheet.deleteRow(rowNumber);
  return readLinks_();
}
