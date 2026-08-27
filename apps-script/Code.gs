/**
 * PUSAT DATA OPERASIONAL — Web App Apps Script
 * ------------------------------------------------
 * Kode ini membaca data dari Google Sheet secara otomatis.
 * Kalau ada baris baru ditambahkan di sheet, link baru akan
 * ikut muncul di halaman tanpa perlu ubah kode.
 *
 * STRUKTUR SHEET YANG DIBACA (sheet pertama / gid=0):
 * Kolom A -> Nama Link
 * Kolom B -> Link (URL)
 * Kolom C -> Kategori (opsional, boleh dikosongkan)
 * Kolom D -> Detail / isi rekap (opsional, boleh dikosongkan)
 *            contoh: "Rekap Persiapan, Rekap Clearing, Rekap Workbench, Rekap Kelasahan Persiapan"
 *
 * Baris 1 dianggap header dan dilewati.
 */

// ID spreadsheet sudah diisi sesuai link yang diberikan
const SPREADSHEET_ID = '1sYZMUWa9i_c0coEIPt_rWkgTLlo4Ps3rKsr0i0enZW4';
const SHEET_NAME = 'Sheet1'; // ganti jika nama tab sheet berbeda

function doGet() {
  const template = HtmlService.createTemplateFromFile('Index');
  template.links = getLinksFromSheet();
  return template
    .evaluate()
    .setTitle('Pusat Data Operasional')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Membaca semua baris data dari sheet dan mengembalikannya
 * sebagai array of object supaya mudah ditampilkan di HTML.
 */
function getLinksFromSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  const data = sheet.getDataRange().getValues();

  const links = [];
  // mulai dari baris ke-2 (index 1) supaya header dilewati
  for (let i = 1; i < data.length; i++) {
    const nama = data[i][0];
    const url = data[i][1];
    const kategori = data[i][2] || '';
    const detail = data[i][3] || '';

    // lewati baris kosong
    if (!nama || !url) continue;

    links.push({
      nama: nama.toString().trim(),
      url: url.toString().trim(),
      kategori: kategori.toString().trim(),
      detail: detail.toString().trim(),
      rowNumber: i + 1 // nomor baris asli di sheet (1-indexed, sesuai tampilan Google Sheets)
    });
  }
  return links;
}

/**
 * Dipanggil dari HTML (google.script.run) untuk me-refresh
 * daftar link tanpa perlu reload halaman.
 */
function refreshLinks() {
  return getLinksFromSheet();
}

/**
 * Dipanggil dari form "Tambah Link" di HTML untuk menambahkan
 * baris baru ke sheet secara langsung dari halaman web.
 */
function addLink(nama, url, kategori, detail) {
  if (!nama || !url) {
    throw new Error('Nama dan Link wajib diisi.');
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];

  sheet.appendRow([
    nama.toString().trim(),
    url.toString().trim(),
    (kategori || '').toString().trim(),
    (detail || '').toString().trim()
  ]);

  // kembalikan daftar terbaru supaya halaman langsung ter-update
  return getLinksFromSheet();
}

/**
 * Dipanggil dari tombol "Hapus" di HTML untuk menghapus satu baris
 * dari sheet berdasarkan rowNumber (nomor baris asli di sheet, sesuai
 * yang dikirim balik oleh getLinksFromSheet). Nama link juga dicocokkan
 * ulang di sini sebagai lapisan validasi kedua (selain konfirmasi ketik
 * ulang nama yang sudah dilakukan di halaman web), supaya baris yang
 * terhapus benar-benar sesuai dengan yang dimaksud pengguna.
 */
function deleteLink(rowNumber, namaKonfirmasi) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  const lastRow = sheet.getLastRow();

  if (!rowNumber || rowNumber < 2 || rowNumber > lastRow) {
    throw new Error('Data tidak ditemukan, mungkin sudah dihapus sebelumnya.');
  }

  const namaDiBaris = sheet.getRange(rowNumber, 1).getValue().toString().trim();

  if (!namaKonfirmasi || namaDiBaris !== namaKonfirmasi.toString().trim()) {
    throw new Error('Nama link tidak cocok dengan baris yang dipilih, penghapusan dibatalkan.');
  }

  sheet.deleteRow(rowNumber);

  // kembalikan daftar terbaru supaya halaman langsung ter-update
  return getLinksFromSheet();
}
