import Link from "next/link"
import { ArrowUpRightIcon, ClapperboardIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import type { CategoryType } from "@/types/category"

export function CategoryCard({
  category,
  index,
  totalLessons,
}: {
  category: CategoryType
  index: number
  totalLessons?: number
}) {
  const headingId = `category-${category.id}-heading`

  return (
    <Link
      href={`/topics/${category.id}`}
      aria-labelledby={headingId}
      className="product-focus group block rounded-card"
    >
      <Card
        variant="product"
        className="transition duration-300 group-hover:-translate-y-1 group-hover:border-brand-cyan/25 group-focus-visible:border-brand-cyan/25 motion-reduce:transform-none"
      >
        <CardContent className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 py-1 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-5">
          <span className="grid size-12 shrink-0 place-items-center rounded-nav border border-brand-cyan/20 bg-brand-cyan/10 text-brand-cyan">
            <ClapperboardIcon className="size-5" aria-hidden="true" />
          </span>

          <div className="min-w-0 flex-1">
            <p className="font-mono text-[11px] font-semibold tracking-[0.18em] text-brand-cyan uppercase">
              Chủ đề {String(index + 1).padStart(2, "0")}
            </p>
            <h2
              id={headingId}
              className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl"
            >
              {category.name}
            </h2>
            <p className="mt-2 text-sm leading-6 text-copy-muted">
              {totalLessons === undefined
                ? "Đang cập nhật số bài học"
                : `${totalLessons} bài học để bạn khám phá`}
            </p>
          </div>

          <span className="col-span-2 flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-nav border border-stroke-strong bg-surface-inner px-5 text-sm font-semibold text-white transition-colors group-hover:border-brand-cyan/35 lg:col-span-1 lg:w-auto">
            Xem tất cả
            <ArrowUpRightIcon className="size-4" aria-hidden="true" />
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}
