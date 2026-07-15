import type { Metadata } from "next"

import { ProductPageHeader } from "@/components/product/page-header"
import { ProductReveal } from "@/components/product/product-reveal"
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
    <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-16">
      <ProductReveal eager className="mb-14">
        <ProductPageHeader
          className="border-b-0 pb-0"
          title="Khám phá tiếng Anh theo chủ đề"
          description="Chọn một bộ phim hoặc tình huống bạn yêu thích, rồi luyện nghe, nhại giọng và phản xạ với các phân cảnh ngắn có ngữ cảnh rõ ràng."
        />
      </ProductReveal>

      <CategoryLessons initialOverview={initialOverview} />
    </div>
  )
}
