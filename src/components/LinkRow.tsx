
import type { LinkItem } from '../types';

interface Props {
  item: LinkItem;
  index: number;
  onRequestDelete: (item: LinkItem) => void;
}

export default function LinkRow({ item, index, onRequestDelete }: Props) {
  return (
    <div className="row" data-nama={item.nama}>
      <div className="serial">{String(index + 1).padStart(2, '0')}</div>
      <a className="row-link" href={item.url} target="_blank" rel="noopener noreferrer">
        <div className="row-main">
          <div className="row-top">
            <span className="name">{item.nama}</span>
            {item.kategori ? <span className="tag">{item.kategori}</span> : null}
          </div>
          {item.detail ? <p className="detail">{item.detail}</p> : null}
        </div>
        <span className="open-hint">
          Buka <span className="arrow">&#8594;</span>
        </span>
      </a>
      <div className="row-actions">
        <button
          type="button"
          className="delete-btn"
          title="Hapus link ini"
          onClick={(e) => {
            e.preventDefault();
            onRequestDelete(item);
          }}
        >
          &#10005;
        </button>
      </div>
    </div>
  );
}
