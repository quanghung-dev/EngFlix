import type { Metadata } from "next"
import { ClapperboardIcon } from "lucide-react"

import { ProductPageHeader } from "@/components/product/page-header"
import { ProductReveal } from "@/components/product/product-reveal"
import { CategoryLessons } from "@/components/topics/home"
import { getAllCategories } from "@/services/category.service"
import type { CategoryType } from "@/types/category"

export const metadata: Metadata = {
  title: "Khám phá chủ đề",
}

export default async function Page() {
  let initialCategories: CategoryType[] = []
  try {
    const categoryResponse = await getAllCategories()
    initialCategories = categoryResponse.data || []
  } catch (error) {
    console.error("Server-side categories fetch error:", error)
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-16">
      <ProductReveal eager className="mb-14">
        <ProductPageHeader
          className="border-b-0 pb-0"
          eyebrow={
            <>
              <ClapperboardIcon className="size-4" aria-hidden="true" />
              Thư viện học tập
            </>
          }
          title="Khám phá tiếng Anh theo chủ đề"
          description="Chọn một bộ phim hoặc tình huống bạn yêu thích, rồi luyện nghe, nhại giọng và phản xạ với các phân cảnh ngắn có ngữ cảnh rõ ràng."
        />
      </ProductReveal>

      <CategoryLessons initialCategories={initialCategories} />
    </div>
  )
}
