export type PaginationResult<T> = {
  items: T[];
  totalItems: number;
  totalPages: number;
  perPage: number;
  page: number;
  hasNext: boolean;
};
export interface FileSystemItem {
  id: string;
  path: string;
  name: string;
  parent_id: number;
  cdn_url: string | null;
  file_size: number | null;
  type: number;
  created_at: string;
  updated_at: string;
  childrenCount: number;
}
export type FileSystemListResponse = PaginationResult<FileSystemItem>;

export type RestApiResponse<T> = {
  data: T;
  message?: string;
  success: boolean;
};
export enum FSType {
  FILE = 1,
  FOLDER = 2,
}
