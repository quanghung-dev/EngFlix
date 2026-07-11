import type { Metadata } from "next"
import { ClapperboardIcon } from "lucide-react"

import { CategoryLessons } from "@/components/topics/home"

export const metadata: Metadata = {
  title: "Khám phá chủ đề",
}

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-16">
      <header className="mb-14 max-w-4xl">
        <p className="flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.2em] text-brand-cyan uppercase">
          <ClapperboardIcon className="size-4" aria-hidden="true" />
          Thư viện học tập
        </p>
        <h1 className="mt-4 text-4xl leading-[1.08] font-semibold tracking-[-0.045em] text-white lg:text-5xl">
          Khám phá tiếng Anh theo chủ đề
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-copy-muted sm:text-lg sm:leading-8">
          Chọn một bộ phim hoặc tình huống bạn yêu thích, rồi luyện nghe,
          nhại giọng và phản xạ với các phân cảnh ngắn có ngữ cảnh rõ ràng.
        </p>
      </header>

      <CategoryLessons />
    </div>
  )
}
