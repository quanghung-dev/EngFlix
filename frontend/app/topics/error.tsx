"use client"

import { ContentErrorState } from "@/components/topics/topics-states"

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-16">
      <ContentErrorState
        title="Trang chủ đề tạm thời gián đoạn"
        description="EngFlex chưa thể hiển thị nội dung của trang này. Hãy thử lại để khôi phục đúng khu vực đang xem."
        onRetry={reset}
        headingLevel="h1"
      />
    </div>
  )
}
