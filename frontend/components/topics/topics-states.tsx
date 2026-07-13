import type { ReactNode } from "react"
import {
  CircleAlertIcon,
  ClapperboardIcon,
  RefreshCwIcon,
} from "lucide-react"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type HeadingLevel = "h1" | "h2" | "h3"

export function ContentErrorState({
  title,
  description,
  onRetry,
  headingLevel = "h2",
}: {
  title: string
  description: string
  onRetry?: () => void
  headingLevel?: HeadingLevel
}) {
  const Heading = headingLevel

  return (
    <Card
      variant="product"
      role="alert"
      className="border-destructive/30 shadow-none"
    >
      <CardContent className="flex flex-col items-start gap-5 py-2 sm:flex-row sm:items-center">
        <span className="grid size-12 shrink-0 place-items-center rounded-nav border border-destructive/25 bg-destructive/10 text-destructive">
          <CircleAlertIcon className="size-6" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <Heading className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </Heading>
          <p className="mt-2 max-w-xl text-sm leading-6 text-copy-muted sm:text-base sm:leading-7">
            {description}
          </p>
        </div>
        {onRetry ? (
          <Button variant="glass" size="app" onClick={onRetry}>
            <RefreshCwIcon aria-hidden="true" />
            Thử lại
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}

export function ContentEmptyState({
  title,
  description,
  action,
  headingLevel = "h2",
}: {
  title: string
  description: string
  action?: ReactNode
  headingLevel?: HeadingLevel
}) {
  const Heading = headingLevel

  return (
    <Card variant="product" role="status" className="shadow-none">
      <CardContent className="flex flex-col items-center py-4 text-center sm:py-8">
        <span className="grid size-16 place-items-center rounded-panel border border-brand-cyan/20 bg-brand-cyan/10 text-brand-cyan">
          <ClapperboardIcon className="size-7" aria-hidden="true" />
        </span>
        <Heading className="mt-6 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {title}
        </Heading>
        <p className="mt-3 max-w-lg text-sm leading-6 text-copy-muted sm:text-base sm:leading-7">
          {description}
        </p>
        {action ? <div className="mt-6">{action}</div> : null}
      </CardContent>
    </Card>
  )
}

export function LessonCardSkeleton() {
  return (
    <Card
      variant="product"
      aria-hidden="true"
      className="h-full gap-0 py-0 shadow-none"
    >
      <AspectRatio ratio={16 / 9}>
        <Skeleton className="size-full rounded-none bg-muted" />
      </AspectRatio>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-6 w-4/5 rounded-control" />
        <Skeleton className="h-4 w-full rounded-control" />
        <Skeleton className="h-4 w-2/3 rounded-control" />
        <div className="mt-auto border-t border-stroke-subtle pt-4">
          <Skeleton className="h-4 w-28 rounded-control" />
        </div>
      </div>
    </Card>
  )
}

export function CategoryListSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-16">
      <span className="sr-only" role="status">
        Đang tải danh mục và bài học…
      </span>
      {[0, 1].map((section) => (
        <section key={section} className="flex flex-col gap-5">
          <Card
            variant="product"
            aria-hidden="true"
            className="shadow-none"
          >
            <CardContent className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 py-1 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
              <Skeleton className="size-12 rounded-nav" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-48 rounded-control" />
                <Skeleton className="h-4 w-32 rounded-control" />
              </div>
              <Skeleton className="col-span-2 h-12 w-full rounded-nav lg:col-span-1 lg:w-32" />
            </CardContent>
          </Card>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))] gap-4 lg:gap-5">
            {[0, 1, 2, 3].map((card) => (
              <LessonCardSkeleton key={card} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export function TopicsRouteSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-16">
      <div aria-hidden="true" className="mb-14 max-w-2xl space-y-4">
        <Skeleton className="h-4 w-36 rounded-control" />
        <Skeleton className="h-12 w-72 rounded-nav sm:w-96" />
        <Skeleton className="h-5 w-full max-w-xl rounded-control" />
      </div>
      <CategoryListSkeleton />
    </div>
  )
}

export function TopicDetailSkeleton() {
  return (
    <div aria-busy="true">
      <span className="sr-only" role="status">
        Đang tải chủ đề và danh sách bài học…
      </span>
      <Skeleton className="h-12 w-32 rounded-nav" aria-hidden="true" />
      <div aria-hidden="true" className="mt-10 max-w-2xl space-y-4">
        <Skeleton className="h-4 w-28 rounded-control" />
        <Skeleton className="h-12 w-72 rounded-nav sm:w-96" />
        <Skeleton className="h-5 w-full max-w-xl rounded-control" />
      </div>
      <div className="mt-10 grid grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))] gap-4 lg:gap-5">
        {[0, 1, 2, 3, 4, 5].map((card) => (
          <LessonCardSkeleton key={card} />
        ))}
      </div>
    </div>
  )
}

export function TopicDetailRouteSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-16">
      <TopicDetailSkeleton />
    </div>
  )
}
