import { apiRequest } from "@/lib/api-client"
import { PagedResponse, DataResponse } from "@/types/api"
import type { PostComment, SocialPost } from "@/types/social"

export type PostType = SocialPost
export type CommentType = PostComment

// Lấy danh sách bài viết trang bảng tin cộng đồng
export async function getPostsFeed(params?: {
  page?: number
  limit?: number
}): Promise<PagedResponse<SocialPost>> {
  try {
    const queryParams = new URLSearchParams()
    if (params) {
      if (params.page !== undefined) queryParams.append("page", params.page.toString())
      if (params.limit !== undefined) queryParams.append("limit", params.limit.toString())
    }
    const queryString = queryParams.toString()
    const url = queryString ? `posts/feed?${queryString}` : "posts/feed"
    return await apiRequest<PagedResponse<SocialPost>>(url)
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
): Promise<PagedResponse<SocialPost>> {
  try {
    const queryParams = new URLSearchParams()
    if (params) {
      if (params.page !== undefined) queryParams.append("page", params.page.toString())
      if (params.limit !== undefined) queryParams.append("limit", params.limit.toString())
    }
    const queryString = queryParams.toString()
    const encodedUserId = encodeURIComponent(userId)
    const url = queryString
      ? `posts/user/${encodedUserId}?${queryString}`
      : `posts/user/${encodedUserId}`
    return await apiRequest<PagedResponse<SocialPost>>(url)
  } catch (error) {
    console.error(`Không thể tải bài viết của user ${userId}`, error)
    throw error
  }
}

// Đăng bài viết mới
export async function createPost(params: {
  content: string
  imageUrl?: string | null
}): Promise<DataResponse<SocialPost>> {
  try {
    return await apiRequest<DataResponse<SocialPost>>("posts", {
      method: "POST",
      body: JSON.stringify(params)
    })
  } catch (error) {
    console.error("Không thể đăng bài viết", error)
    throw error
  }
}

// Xóa bài viết
export async function deletePost(postId: number): Promise<DataResponse<unknown>> {
  try {
    return await apiRequest<DataResponse<unknown>>(`posts/${postId}`, {
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
export async function getPostComments(postId: number): Promise<DataResponse<PostComment[]>> {
  try {
    return await apiRequest<DataResponse<PostComment[]>>(`posts/${postId}/comments`)
  } catch (error) {
    console.error(`Không thể lấy bình luận bài viết ${postId}`, error)
    throw error
  }
}

// Viết bình luận mới
export async function createComment(
  postId: number,
  content: string
): Promise<DataResponse<PostComment>> {
  try {
    return await apiRequest<DataResponse<PostComment>>(`posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content })
    })
  } catch (error) {
    console.error(`Không thể đăng bình luận bài viết ${postId}`, error)
    throw error
  }
}
