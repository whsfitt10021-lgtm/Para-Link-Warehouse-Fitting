
export interface LinkItem {
  rowNumber: number;
  nama: string;
  url: string;
  kategori?: string;
  detail?: string;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  message?: string;
}
