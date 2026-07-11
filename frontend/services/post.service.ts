import { apiRequest } from "@/lib/api-client"
import { PagedResponse, DataResponse } from "@/types/api"

export interface PostType {
  id: number
  user_id: string
  username: string
  avatar_url: string | null
  level: number
  badge_type: "verify" | "medal" | "crown" | "none"
  content: string
  image_url: string | null
  created_at: string
  likes_count: number
  comments_count: number
  is_liked: boolean
}

export interface CommentType {
  id: number
  post_id: number
  user_id: string
  username: string
  avatar_url: string | null
  level: number
  badge_type: "verify" | "medal" | "crown" | "none"
  content: string
  created_at: string
}

// Lấy danh sách bài viết trang bảng tin cộng đồng
export async function getPostsFeed(params?: {
  page?: number
  limit?: number
}): Promise<PagedResponse<PostType>> {
  try {
    const queryParams = new URLSearchParams()
    if (params) {
      if (params.page !== undefined) queryParams.append("page", params.page.toString())
      if (params.limit !== undefined) queryParams.append("limit", params.limit.toString())
    }
    const queryString = queryParams.toString()
    const url = queryString ? `posts/feed?${queryString}` : "posts/feed"
    return await apiRequest<PagedResponse<PostType>>(url)
  } catch (error) {
    console.error("Không thể tải bảng tin cộng đồng", error)
    throw error
  }
}

// Lấy danh sách bài viết trên tường cá nhân của 1 user
export async function getUserPosts(
  userId: string,
  params?: {
    page?: number
    limit?: number
  }
): Promise<PagedResponse<PostType>> {
  try {
    const queryParams = new URLSearchParams()
    if (params) {
      if (params.page !== undefined) queryParams.append("page", params.page.toString())
      if (params.limit !== undefined) queryParams.append("limit", params.limit.toString())
    }
    const queryString = queryParams.toString()
    const url = queryString ? `posts/user/${userId}?${queryString}` : `posts/user/${userId}`
    return await apiRequest<PagedResponse<PostType>>(url)
  } catch (error) {
    console.error(`Không thể tải bài viết của user ${userId}`, error)
    throw error
  }
}

// Đăng bài viết mới
export async function createPost(params: {
  content: string
  imageUrl?: string | null
}): Promise<DataResponse<PostType>> {
  try {
    return await apiRequest<DataResponse<PostType>>("posts", {
      method: "POST",
      body: JSON.stringify(params)
    })
  } catch (error) {
    console.error("Không thể đăng bài viết", error)
    throw error
  }
}

// Xóa bài viết
export async function deletePost(postId: number): Promise<DataResponse<any>> {
  try {
    return await apiRequest<DataResponse<any>>(`posts/${postId}`, {
      method: "DELETE"
    })
  } catch (error) {
    console.error(`Không thể xóa bài viết ${postId}`, error)
    throw error
  }
}

// Thích / Huỷ thích bài viết
export async function toggleLikePost(
  postId: number
): Promise<DataResponse<{ is_liked: boolean; likes_count: number }>> {
  try {
    return await apiRequest<DataResponse<{ is_liked: boolean; likes_count: number }>>(
      `posts/${postId}/like`,
      {
        method: "POST"
      }
    )
  } catch (error) {
    console.error(`Không thể thay đổi lượt thích bài viết ${postId}`, error)
    throw error
  }
}

// Lấy danh sách bình luận của bài viết
export async function getPostComments(postId: number): Promise<DataResponse<CommentType[]>> {
  try {
    return await apiRequest<DataResponse<CommentType[]>>(`posts/${postId}/comments`)
  } catch (error) {
    console.error(`Không thể lấy bình luận bài viết ${postId}`, error)
    throw error
  }
}

// Viết bình luận mới
export async function createComment(
  postId: number,
  content: string
): Promise<DataResponse<CommentType>> {
  try {
    return await apiRequest<DataResponse<CommentType>>(`posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content })
    })
  } catch (error) {
    console.error(`Không thể đăng bình luận bài viết ${postId}`, error)
    throw error
  }
}
