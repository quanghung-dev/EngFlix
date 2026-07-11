import { apiRequest } from "@/lib/api-client"
import { PagedResponse, DataResponse } from "@/types/api"

export interface ChatMessageType {
  id: number
  user_id: string
  username: string
  avatar_url: string | null
  level: number
  badge_type: "verify" | "medal" | "crown" | "none"
  content: string
  created_at: string
}

// Lấy danh sách tin nhắn chat mới nhất từ PostgreSQL
export async function getChatMessages(params?: {
  page?: number
  limit?: number
}): Promise<PagedResponse<ChatMessageType>> {
  try {
    const queryParams = new URLSearchParams()
    if (params) {
      if (params.page !== undefined) queryParams.append("page", params.page.toString())
      if (params.limit !== undefined) queryParams.append("limit", params.limit.toString())
    }
    const queryString = queryParams.toString()
    const url = queryString ? `chat?${queryString}` : "chat"
    return await apiRequest<PagedResponse<ChatMessageType>>(url)
  } catch (error) {
    console.error("Không thể tải tin nhắn chat", error)
    throw error
  }
}

// Gửi tin nhắn mới lên PostgreSQL
export async function sendChatMessage(content: string): Promise<DataResponse<ChatMessageType>> {
  try {
    return await apiRequest<DataResponse<ChatMessageType>>("chat", {
      method: "POST",
      body: JSON.stringify({ content })
    })
  } catch (error) {
    console.error("Không thể gửi tin nhắn chat", error)
    throw error
  }
}
