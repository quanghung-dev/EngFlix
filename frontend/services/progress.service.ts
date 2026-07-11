import { apiRequest } from "@/lib/api-client"
import { DataResponse } from "@/types/api"

export interface ProgressStatsType {
  streak: number
  total_lessons: number
  total_minutes: number
  weekly_progress: Array<{
    activity_date: string
    lessons_completed: number
  }>
  shadowing_attempts: Array<{
    id: number
    score: number
    created_at: string
  }>
  total_words: number
}

// Lấy dữ liệu báo cáo thống kê tiến trình học tập
export async function getProgressStats(): Promise<DataResponse<ProgressStatsType>> {
  try {
    return await apiRequest<DataResponse<ProgressStatsType>>("progress/stats")
  } catch (error) {
    console.error("Không thể tải thống kê tiến trình học tập", error)
    throw error
  }
}
