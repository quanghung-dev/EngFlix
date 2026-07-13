import { apiRequest } from "@/lib/api-client"
import { DataResponse } from "@/types/api"
import type {
  Friend,
  FriendRequest,
  FriendSearchResult,
  FriendshipStatus,
} from "@/types/social"

export type FriendType = Friend
export type FriendRequestType = FriendRequest
export type SearchUserResultType = FriendSearchResult

// Lấy danh sách bạn bè đã kết bạn
export async function getFriends(): Promise<DataResponse<Friend[]>> {
  try {
    return await apiRequest<DataResponse<Friend[]>>("friendships")
  } catch (error) {
    console.error("Không thể tải danh sách bạn bè", error)
    throw error
  }
}

// Lấy danh sách lời mời kết bạn đang chờ duyệt
export async function getIncomingRequests(): Promise<DataResponse<FriendRequest[]>> {
  try {
    return await apiRequest<DataResponse<FriendRequest[]>>("friendships/requests")
  } catch (error) {
    console.error("Không thể tải lời mời kết bạn", error)
    throw error
  }
}

// Gửi lời mời kết bạn mới
export async function sendFriendRequest(friendId: string): Promise<DataResponse<unknown>> {
  try {
    return await apiRequest<DataResponse<unknown>>("friendships/requests", {
      method: "POST",
      body: JSON.stringify({ friend_id: friendId })
    })
  } catch (error) {
    console.error(`Không thể gửi lời mời kết bạn tới ${friendId}`, error)
    throw error
  }
}

// Chấp nhận lời mời kết bạn
export async function acceptFriendRequest(friendshipId: number): Promise<DataResponse<unknown>> {
  try {
    return await apiRequest<DataResponse<unknown>>(`friendships/requests/${friendshipId}`, {
      method: "PUT"
    })
  } catch (error) {
    console.error(`Không thể chấp nhận lời mời kết bạn ${friendshipId}`, error)
    throw error
  }
}

// Xóa bạn bè hoặc từ chối lời mời
export async function declineOrRemoveFriend(friendshipId: number): Promise<DataResponse<unknown>> {
  try {
    return await apiRequest<DataResponse<unknown>>(`friendships/${friendshipId}`, {
      method: "DELETE"
    })
  } catch (error) {
    console.error(`Không thể xoá/từ chối kết bạn ${friendshipId}`, error)
    throw error
  }
}

// Tìm kiếm người dùng khác trong hệ thống
export async function searchNewFriends(query: string): Promise<DataResponse<FriendSearchResult[]>> {
  try {
    return await apiRequest<DataResponse<FriendSearchResult[]>>(
      `friendships/search?query=${encodeURIComponent(query)}`
    )
  } catch (error) {
    console.error("Không thể tìm kiếm bạn mới", error)
    throw error
  }
}

export async function getFriendshipStatus(
  userId: string
): Promise<DataResponse<FriendshipStatus>> {
  try {
    return await apiRequest<DataResponse<FriendshipStatus>>(
      `friendships/status/${encodeURIComponent(userId)}`
    )
  } catch (error) {
    console.error(`Không thể kiểm tra quan hệ bạn bè với ${userId}`, error)
    throw error
  }
}
