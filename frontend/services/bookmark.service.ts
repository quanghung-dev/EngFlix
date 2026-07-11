import { apiRequest } from "@/lib/api-client"
import { PagedResponse, DataResponse } from "@/types/api"

export interface BookmarkType {
  id: number
  user_id: string
  transcript_id: number
  lesson_id: number
  lesson_title: string
  original_content: string
  phonetic_content: string | null
  vietnamese_content: string | null
  note: string | null
  created_at: string
}

// Tải tất cả ghi chú câu (bookmarks) của người dùng
export async function getAllBookmarks(params?: {
  page?: number
  limit?: number
}): Promise<PagedResponse<BookmarkType>> {
  try {
    const queryParams = new URLSearchParams()
    if (params) {
      if (params.page !== undefined) queryParams.append("page", params.page.toString())
      if (params.limit !== undefined) queryParams.append("limit", params.limit.toString())
    }
    const queryString = queryParams.toString()
    const url = queryString ? `transcript-bookmarks?${queryString}` : "transcript-bookmarks"
    return await apiRequest<PagedResponse<BookmarkType>>(url)
  } catch (error) {
    console.error("Không thể tải danh sách ghi chú", error)
    throw error
  }
}

// Cập nhật nội dung ghi chú câu
export async function updateBookmarkNote(
  id: number,
  note: string
): Promise<DataResponse<BookmarkType>> {
  try {
    return await apiRequest<DataResponse<BookmarkType>>(`transcript-bookmarks/${id}`, {
      method: "PUT",
      body: JSON.stringify({ note })
    })
  } catch (error) {
    console.error(`Không thể cập nhật ghi chú ID = ${id}`, error)
    throw error
  }
}

// Xóa ghi chú câu (bỏ bookmark)
export async function deleteBookmark(id: number): Promise<DataResponse<BookmarkType>> {
  try {
    return await apiRequest<DataResponse<BookmarkType>>(`transcript-bookmarks/${id}`, {
      method: "DELETE"
    })
  } catch (error) {
    console.error(`Không thể xóa ghi chú ID = ${id}`, error)
    throw error
  }
}
