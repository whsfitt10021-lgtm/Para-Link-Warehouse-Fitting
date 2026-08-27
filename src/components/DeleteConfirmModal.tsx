
import { useEffect, useState } from 'react';
import type { LinkItem } from '../types';

interface Props {
  target: LinkItem | null;
  onClose: () => void;
  onConfirm: (item: LinkItem) => Promise<void>;
}

export default function DeleteConfirmModal({ target, onClose, onConfirm }: Props) {
  const [inputText, setInputText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setInputText('');
    setMsg(null);
    setDeleting(false);
  }, [target]);

  if (!target) return null;

  const matches = inputText.trim() === target.nama;

  async function handleConfirm() {
    if (!target || !matches) {
      setMsg('Teks konfirmasi belum sesuai dengan nama link.');
      return;
    }
    setDeleting(true);
    setMsg(null);
    try {
      await onConfirm(target);
      setTimeout(onClose, 700);
    } catch (err) {
      setMsg('Gagal menghapus: ' + (err as Error).message);
      setDeleting(false);
    }
  }

  return (
    <div className="overlay show">
      <div className="modal confirm-modal">
        <h2>Hapus Link Ini?</h2>
        <p className="hint">
          Tindakan ini akan menghapus data secara permanen dari Google Sheet dan tidak bisa dibatalkan.
        </p>
        <div className="target-name">{target.nama}</div>

        <p className="type-hint">Untuk konfirmasi, ketik ulang nama link persis seperti di atas:</p>
        <input
          type="text"
          autoComplete="off"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          autoFocus
        />

        {msg ? <div className="form-msg error">{msg}</div> : null}

        <div className="modal-actions">
          <button type="button" className="btn-cancel" onClick={onClose} disabled={deleting}>
            Batal
          </button>
          <button
            type="button"
            className="btn-danger"
            disabled={!matches || deleting}
            onClick={handleConfirm}
          >
            {deleting ? 'Menghapus...' : 'Ya, Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
}
