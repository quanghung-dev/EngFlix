import { apiRequest } from "@/lib/api-client"
import type { DataResponse } from "@/types/api"
import type { ProgressStats } from "@/types/learning"

export type ProgressStatsType = ProgressStats

export async function getProgressStats(): Promise<DataResponse<ProgressStatsType>> {
  return apiRequest<DataResponse<ProgressStatsType>>("progress/stats")
}
