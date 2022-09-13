export interface BaseQuery {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'DESC' | 'ASC';
  q?: string;
}

export type PaginationResult<T> = { totalCount: number; items: T[] };

export type T = any;
