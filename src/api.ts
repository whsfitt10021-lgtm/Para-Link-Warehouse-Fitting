
import type { ApiResponse, LinkItem } from './types';

// URL Web App Apps Script (backend). Bisa dioverride lewat env var
// VITE_APPS_SCRIPT_URL saat build (mis. di Netlify > Site settings > Environment variables)
// tanpa perlu mengubah kode ini.
const APPS_SCRIPT_URL: string =
  (import.meta.env.VITE_APPS_SCRIPT_URL as string | undefined) ||
  'https://script.google.com/macros/s/AKfycbx-xzMzTMx_jw2mYizOL9hAGT75v_6C6Q-IeG5yXBikA9gzk4g5AqKun-FlfRBlSw_I/exec';

/**
 * Catatan CORS:
 * - GET dikirim sebagai request "simple" biasa (tanpa header custom) supaya
 *   browser tidak melakukan preflight OPTIONS (yang tidak didukung Apps Script).
 * - POST dikirim dengan Content-Type "text/plain;charset=utf-8" (bukan
 *   application/json) dengan alasan yang sama: ini tetap dianggap "simple
 *   request" oleh browser sehingga tidak memicu preflight. Body-nya tetap
 *   berisi JSON string, dan di sisi Apps Script kita parse manual dari
 *   e.postData.contents.
 */

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`Permintaan gagal (status ${res.status})`);
  }
  const json: ApiResponse<T> = await res.json();
  if (!json.ok) {
    throw new Error(json.message || 'Terjadi kesalahan pada server.');
  }
  return json.data as T;
}

export async function fetchLinks(): Promise<LinkItem[]> {
  const res = await fetch(`${APPS_SCRIPT_URL}?action=list`, {
    method: 'GET',
    redirect: 'follow',
  });
  return handleResponse<LinkItem[]>(res);
}

export async function addLink(
  nama: string,
  url: string,
  kategori: string,
  detail: string
): Promise<LinkItem[]> {
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'add', nama, url, kategori, detail }),
  });
  return handleResponse<LinkItem[]>(res);
}

export async function deleteLink(
  rowNumber: number,
  nama: string
): Promise<LinkItem[]> {
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'delete', rowNumber, nama }),
  });
  return handleResponse<LinkItem[]>(res);
}
