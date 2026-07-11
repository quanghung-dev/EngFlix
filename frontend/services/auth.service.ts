import { apiRequest } from "@/lib/api-client"
import { DataResponse } from "@/types/api"

// Cập nhật thông tin hồ sơ người dùng trong database PostgreSQL nội bộ
export async function updateUserProfile(params: {
  name: string
  phone?: string
}): Promise<DataResponse<any>> {
  try {
    return await apiRequest<DataResponse<any>>("auth/profile", {
      method: "PUT",
      body: JSON.stringify(params)
    })
  } catch (error) {
    console.error("Không thể cập nhật hồ sơ người dùng", error)
    throw error
  }
}
