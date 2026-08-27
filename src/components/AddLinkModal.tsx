import { useState, FormEvent } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (nama: string, url: string, kategori: string, detail: string) => Promise<void>;
}

export default function AddLinkModal({ open, onClose, onSave }: Props) {
  const [nama, setNama] = useState('');
  const [url, setUrl] = useState('');
  const [kategori, setKategori] = useState('');
  const [detail, setDetail] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  function resetAndClose() {
    setNama('');
    setUrl('');
    setKategori('');
    setDetail('');
    setMsg(null);
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nama.trim() || !url.trim()) {
      setMsg({ type: 'error', text: 'Nama Link dan Alamat Link wajib diisi.' });
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      await onSave(nama.trim(), url.trim(), kategori.trim(), detail.trim());
      setMsg({ type: 'success', text: 'Link berhasil ditambahkan.' });
      setTimeout(resetAndClose, 900);
    } catch (err) {
      setMsg({ type: 'error', text: 'Gagal menyimpan: ' + (err as Error).message });
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="overlay show">
      <div className="modal">
        <h2>Tambah Link Baru</h2>
        <p className="hint">Isi data di bawah ini, link akan langsung tersimpan ke Google Sheet.</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="inNama">
              Nama Link <span className="req">*</span>
            </label>
            <input
              id="inNama"
              type="text"
              placeholder="Contoh: Data Daily"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor="inUrl">
              Alamat Link (URL) <span className="req">*</span>
            </label>
            <input
              id="inUrl"
              type="text"
              placeholder="https://docs.google.com/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="inKategori">Kategori</label>
            <input
              id="inKategori"
              type="text"
              placeholder="Contoh: Harian (opsional)"
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="inDetail">Detail / Isi Rekap</label>
            <input
              id="inDetail"
              type="text"
              placeholder="Contoh: Rekap Persiapan, Rekap Clearing (opsional)"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
            />
          </div>

          {msg ? <div className={`form-msg ${msg.type}`}>{msg.text}</div> : null}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={resetAndClose} disabled={saving}>
              Batal
            </button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
