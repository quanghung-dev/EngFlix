import { apiRequest } from "@/lib/api-client"
import { PagedResponse, DataResponse } from "@/types/api"
import type { ChatMessage } from "@/types/social"

export type ChatMessageType = ChatMessage

// Lấy danh sách tin nhắn chat mới nhất từ PostgreSQL
export async function getChatMessages(params?: {
  page?: number
  limit?: number
}): Promise<PagedResponse<ChatMessage>> {
  try {
    const queryParams = new URLSearchParams()
    if (params) {
      if (params.page !== undefined) queryParams.append("page", params.page.toString())
      if (params.limit !== undefined) queryParams.append("limit", params.limit.toString())
    }
    const queryString = queryParams.toString()
    const url = queryString ? `chat?${queryString}` : "chat"
    return await apiRequest<PagedResponse<ChatMessage>>(url)
  } catch (error) {
    console.error("Không thể tải tin nhắn chat", error)
    throw error
  }
}

// Gửi tin nhắn mới lên PostgreSQL
export async function sendChatMessage(content: string): Promise<DataResponse<ChatMessage>> {
  try {
    return await apiRequest<DataResponse<ChatMessage>>("chat", {
      method: "POST",
      body: JSON.stringify({ content })
    })
  } catch (error) {
    console.error("Không thể gửi tin nhắn chat", error)
    throw error
  }
}
