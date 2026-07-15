import { publicApiRequest, type PublicRequestInit } from "@/lib/public-api"
import type { DataResponse } from "@/types/api"
import type { TopicsOverviewType } from "@/types/topics"

export function getTopicsOverview(
  options: PublicRequestInit = {},
): Promise<DataResponse<TopicsOverviewType>> {
  return publicApiRequest<DataResponse<TopicsOverviewType>>(
    "topics/overview?preview_limit=4&lesson_limit=100",
    {
      ...options,
      next: {
        revalidate: 300,
        tags: ["topics", "categories", "lessons"],
        ...options.next,
      },
    },
  )
}
