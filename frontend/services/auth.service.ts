import { apiRequest } from "@/lib/api-client"
import { DataResponse } from "@/types/api"
import { auth } from "@/lib/firebase"
import { signOut, type User } from "firebase/auth"
import type {
  OwnUserProfile,
  ProfileMutationResult,
  PublicUserProfile,
  UpdateProfileInput,
} from "@/types/social"

export async function syncAuthenticatedSession(user: User): Promise<void> {
  const token = await user.getIdToken()
  if (!token) throw new Error("Không nhận được mã xác thực từ Firebase.")

  await apiRequest<DataResponse<unknown>>("auth/sync", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  })

}

export async function clearAuthenticatedSession(): Promise<void> {
  try {
    await signOut(auth)
  } catch (error) {
    console.error("Không thể đóng phiên Firebase", error)
  }
}

// Cập nhật thông tin hồ sơ người dùng trong database PostgreSQL nội bộ
export async function updateUserProfile(
  params: UpdateProfileInput
): Promise<DataResponse<ProfileMutationResult>> {
  try {
    return await apiRequest<DataResponse<ProfileMutationResult>>("auth/profile", {
      method: "PUT",
      body: JSON.stringify(params)
    })
  } catch (error) {
    console.error("Không thể cập nhật hồ sơ người dùng", error)
    throw error
  }
}

export async function getOwnProfile(): Promise<DataResponse<OwnUserProfile>> {
  try {
    return await apiRequest<DataResponse<OwnUserProfile>>("auth/profile")
  } catch (error) {
    console.error("Không thể tải hồ sơ cá nhân", error)
    throw error
  }
}

export async function getPublicProfile(
  uid: string
): Promise<DataResponse<PublicUserProfile>> {
  try {
    return await apiRequest<DataResponse<PublicUserProfile>>(
      `auth/profile/${encodeURIComponent(uid)}`
    )
  } catch (error) {
    console.error(`Không thể tải hồ sơ của người dùng ${uid}`, error)
    throw error
  }
}

// Upload ảnh đại diện lên Firebase Storage → lấy URL → cập nhật vào DB
export async function uploadAvatar(
  file: File,
  uid: string
): Promise<DataResponse<ProfileMutationResult>> {
  const [{ getFirebaseStorage }, { ref, uploadBytes, getDownloadURL }] = await Promise.all([
    import("@/lib/firebase-storage"),
    import("firebase/storage"),
  ])
  const storage = getFirebaseStorage()

  // 1. Upload file lên Firebase Storage tại path avatars/{uid}/{timestamp}.{ext}
  const ext = file.name.split(".").pop() || "jpg"
  const storageRef = ref(storage, `avatars/${uid}/${Date.now()}.${ext}`)
  await uploadBytes(storageRef, file, { contentType: file.type })

  // 2. Lấy download URL công khai
  const downloadURL = await getDownloadURL(storageRef)

  // 3. Gọi API backend cập nhật avatar_url vào PostgreSQL
  return await apiRequest<DataResponse<ProfileMutationResult>>("auth/avatar", {
    method: "PUT",
    body: JSON.stringify({ avatarUrl: downloadURL })
  })
}
