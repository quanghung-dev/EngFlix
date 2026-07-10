export interface MetaType {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface ErrorType {
  code: number;
  message: string;
}

// Dành cho dữ liệu dạng danh sách có phân trang
export interface PagedResponse<T> {
  data: T[];
  meta: MetaType;
  error?: ErrorType;
}

// Dành cho dữ liệu đơn lẻ (Single Resource, ví dụ lấy chi tiết 1 bài học)
export interface DataResponse<T> {
  data: T;
  error?: ErrorType;
}
