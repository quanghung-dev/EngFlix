import { apiRequest } from "@/lib/api-client"
import { DataResponse } from "@/types/api"

export interface FriendType {
  friendship_id: number
  user_id: string
  username: string
  avatar_url: string | null
  level: number
  badge_type: "verify" | "medal" | "crown" | "none"
  status: "online" | "offline"
}

export interface FriendRequestType {
  friendship_id: number
  user_id: string
  username: string
  avatar_url: string | null
  level: number
  badge_type: "verify" | "medal" | "crown" | "none"
  created_at: string
}

export interface SearchUserResultType {
  user_id: string
  username: string
  avatar_url: string | null
  level: number
  badge_type: "verify" | "medal" | "crown" | "none"
  friendship_id: number | null
  friendship_state: "none" | "pending_sent" | "pending_received" | "accepted"
}

// Lấy danh sách bạn bè đã kết bạn
export async function getFriends(): Promise<DataResponse<FriendType[]>> {
  try {
    return await apiRequest<DataResponse<FriendType[]>>("friendships")
  } catch (error) {
    console.error("Không thể tải danh sách bạn bè", error)
    throw error
  }
}

// Lấy danh sách lời mời kết bạn đang chờ duyệt
export async function getIncomingRequests(): Promise<DataResponse<FriendRequestType[]>> {
  try {
    return await apiRequest<DataResponse<FriendRequestType[]>>("friendships/requests")
  } catch (error) {
    console.error("Không thể tải lời mời kết bạn", error)
    throw error
  }
}

// Gửi lời mời kết bạn mới
export async function sendFriendRequest(friendId: string): Promise<DataResponse<any>> {
  try {
    return await apiRequest<DataResponse<any>>("friendships/requests", {
      method: "POST",
      body: JSON.stringify({ friend_id: friendId })
    })
  } catch (error) {
    console.error(`Không thể gửi lời mời kết bạn tới ${friendId}`, error)
    throw error
  }
}

// Chấp nhận lời mời kết bạn
export async function acceptFriendRequest(friendshipId: number): Promise<DataResponse<any>> {
  try {
    return await apiRequest<DataResponse<any>>(`friendships/requests/${friendshipId}`, {
      method: "PUT"
    })
  } catch (error) {
    console.error(`Không thể chấp nhận lời mời kết bạn ${friendshipId}`, error)
    throw error
  }
}

// Xóa bạn bè hoặc từ chối lời mời
export async function declineOrRemoveFriend(friendshipId: number): Promise<DataResponse<any>> {
  try {
    return await apiRequest<DataResponse<any>>(`friendships/${friendshipId}`, {
      method: "DELETE"
    })
  } catch (error) {
    console.error(`Không thể xoá/từ chối kết bạn ${friendshipId}`, error)
    throw error
  }
}

// Tìm kiếm người dùng khác trong hệ thống
export async function searchNewFriends(query: string): Promise<DataResponse<SearchUserResultType[]>> {
  try {
    return await apiRequest<DataResponse<SearchUserResultType[]>>(`friendships/search?query=${encodeURIComponent(query)}`)
  } catch (error) {
    console.error("Không thể tìm kiếm bạn mới", error)
    throw error
  }
}
