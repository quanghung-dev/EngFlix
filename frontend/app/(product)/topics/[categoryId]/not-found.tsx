import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { ContentEmptyState } from "@/components/topics/topics-states"
import { buttonVariants } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-16">
      <ContentEmptyState
        title="Không tìm thấy chủ đề"
        description="Đường dẫn này không trỏ tới một chủ đề hợp lệ. Hãy quay lại thư viện để chọn nội dung đang có trên EngFlex."
        headingLevel="h1"
        action={
          <Link
            href="/topics"
            className={buttonVariants({ variant: "product", size: "app" })}
          >
            <ArrowLeftIcon aria-hidden="true" />
            Về thư viện chủ đề
          </Link>
        }
      />
    </div>
  )
}
