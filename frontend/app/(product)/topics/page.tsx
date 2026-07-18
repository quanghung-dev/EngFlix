import type { Metadata } from "next"

import { CategoryLessons } from "@/components/topics/home"
import { getTopicsOverview } from "@/services/topics.service"
import type { TopicsOverviewType } from "@/types/topics"

export const metadata: Metadata = {
  title: "Khám phá chủ đề",
}

export default async function Page() {
  let initialOverview: TopicsOverviewType | undefined
  try {
    const overviewResponse = await getTopicsOverview()
    initialOverview = overviewResponse.data
  } catch (error) {
    console.error("Server-side topics overview fetch error:", error)
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-5 pb-10 pt-0 sm:px-8 sm:pb-12 lg:px-10 lg:pb-16">
      <CategoryLessons initialOverview={initialOverview} />
    </div>
  )
}
