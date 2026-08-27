import { useEffect, useMemo, useState } from 'react';
import type { LinkItem } from './types';
import { addLink, deleteLink, fetchLinks } from './api';
import LinkRow from './components/LinkRow';
import AddLinkModal from './components/AddLinkModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';

export default function App() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LinkItem | null>(null);

  async function loadLinks() {
    setLoadError(null);
    try {
      const data = await fetchLinks();
      setLinks(data);
    } catch (err) {
      setLoadError((err as Error).message);
    }
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadLinks();
      setLoading(false);
    })();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await loadLinks();
    setRefreshing(false);
  }

  async function handleSave(nama: string, url: string, kategori: string, detail: string) {
    const updated = await addLink(nama, url, kategori, detail);
    setLinks(updated);
  }

  async function handleDelete(item: LinkItem) {
    const updated = await deleteLink(item.rowNumber, item.nama);
    setLinks(updated);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return links;
    return links.filter((item) => {
      const haystack = [item.nama, item.kategori, item.detail].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [links, query]);

  return (
    <div className="page">
      <div className="masthead">
        <div className="mast-row">
          <div>
            <div className="mast-id">OPS&#8202;/&#8202;LOG&#8202;&#183;&#8202;DATA</div>
            <h1>Pusat Data Operasional</h1>
            <p className="subtitle">Daftar sumber data untuk pemantauan harian dan pelaporan tim.</p>
          </div>
          <div className="stat-chip">
            {links.length}
            <small>Sumber</small>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <span className="search-icon">CARI</span>
          <input
            type="text"
            placeholder="Nama, kategori, atau kata kunci&hellip;"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="toolbar-actions">
          <button
            type="button"
            className={`icon-btn${refreshing ? ' spinning' : ''}`}
            title="Muat ulang data"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            &#8635;
          </button>
          <button type="button" className="primary-btn" onClick={() => setShowAddModal(true)}>
            + Tambah
          </button>
        </div>
      </div>

      <div className="list-head">
        <span className="lh-num">No.</span>
        <span className="lh-name">Nama Data</span>
        <span className="lh-action">Aksi</span>
      </div>

      <div className="list">
        {loading ? (
          <p className="empty">— Memuat data&hellip; —</p>
        ) : loadError ? (
          <p className="error-banner">Gagal memuat data: {loadError}</p>
        ) : filtered.length > 0 ? (
          filtered.map((item, idx) => (
            <LinkRow key={item.rowNumber} item={item} index={idx} onRequestDelete={setDeleteTarget} />
          ))
        ) : links.length === 0 ? (
          <p className="empty">— Belum ada data link di sheet —</p>
        ) : (
          <p className="empty-search">— Tidak ada link yang cocok dengan pencarian —</p>
        )}
      </div>

      <footer>
        Total {links.length} sumber data &middot; Terhubung ke Google Sheets
      </footer>

      <AddLinkModal open={showAddModal} onClose={() => setShowAddModal(false)} onSave={handleSave} />
      <DeleteConfirmModal
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
