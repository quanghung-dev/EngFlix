import { apiRequest } from "@/lib/api-client"
import type { DataResponse, PagedResponse } from "@/types/api"
import type { BookmarkPageQuery } from "@/types/learning"

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

export async function getAllBookmarks(
  params: BookmarkPageQuery = {}
): Promise<PagedResponse<BookmarkType>> {
  const queryParams = new URLSearchParams()
  if (params.page !== undefined) queryParams.set("page", String(params.page))
  if (params.limit !== undefined) queryParams.set("limit", String(params.limit))

  const queryString = queryParams.toString()
  return apiRequest<PagedResponse<BookmarkType>>(
    queryString ? `transcript-bookmarks?${queryString}` : "transcript-bookmarks"
  )
}

export async function updateBookmarkNote(
  id: number,
  note: string
): Promise<DataResponse<BookmarkType>> {
  return apiRequest<DataResponse<BookmarkType>>(`transcript-bookmarks/${id}`, {
    method: "PUT",
    body: JSON.stringify({ note })
  })
}

export async function deleteBookmark(id: number): Promise<DataResponse<BookmarkType>> {
  return apiRequest<DataResponse<BookmarkType>>(`transcript-bookmarks/${id}`, {
    method: "DELETE"
  })
}
