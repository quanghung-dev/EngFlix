"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { HouseIcon } from "lucide-react"
import { useQuery, useQueries } from "@tanstack/react-query"

import { CategoryCard } from "@/components/category-card"
import { LessonCard } from "@/components/lesson-card"
import { ProductReveal } from "@/components/product/product-reveal"
import { StudyModeDialog } from "@/components/study-mode-dialog"
import {
  CategoryListSkeleton,
  ContentEmptyState,
  ContentErrorState,
  LessonCardSkeleton,
} from "@/components/topics/topics-states"
import { buttonVariants } from "@/components/ui/button"
import { getAllCategories } from "@/services/category.service"
import { getLessons } from "@/services/lesson.service"
import type { CategoryType } from "@/types/category"
import type { LessonType } from "@/types/lesson"

interface CategoryLessonRow {
  category: CategoryType
  lessons: LessonType[]
  totalLessons?: number
  loading: boolean
  error: string | null
}

interface CategoryRowProps {
  row: CategoryLessonRow
  index: number
  onRetry: (category: CategoryType) => void
  onSelectLesson: (lesson: LessonType) => void
}

function CategoryRow({
  row,
  index,
  onRetry,
  onSelectLesson,
}: CategoryRowProps) {
  const { category, lessons, totalLessons, loading, error } = row

  return (
    <ProductReveal delay={Math.min(index * 0.07, 0.35)}>
      <section
        aria-labelledby={`category-${category.id}-heading`}
        className="flex flex-col gap-5"
      >
        <CategoryCard
          category={category}
          index={index}
          totalLessons={totalLessons}
        />

        <div aria-busy={loading || undefined}>
          {loading ? (
            <div
              aria-label={`Đang tải bài học của chủ đề ${category.name}`}
              className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))] gap-4 lg:gap-5"
            >
              {[0, 1, 2, 3].map((card) => (
                <LessonCardSkeleton key={card} />
              ))}
            </div>
          ) : error ? (
            <ContentErrorState
              title="Không tải được bài học"
              description={error}
              onRetry={() => onRetry(category)}
              headingLevel="h3"
            />
          ) : lessons.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))] gap-4 lg:gap-5">
              {lessons.map((lesson, lessonIndex) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  priority={index === 0 && lessonIndex === 0}
                  onSelect={onSelectLesson}
                />
              ))}
            </div>
          ) : (
            <ContentEmptyState
              title="Chủ đề này đang được chuẩn bị"
              description="Hiện chưa có bài học trong chủ đề này. Hãy khám phá một chủ đề khác và quay lại sau nhé."
              headingLevel="h3"
            />
          )}
        </div>
      </section>
    </ProductReveal>
  )
}

export function CategoryLessons({
  initialCategories = [],
}: {
  initialCategories?: CategoryType[]
}) {
  const router = useRouter()
  const [selectedLesson, setSelectedLesson] = useState<LessonType | null>(null)

  const isReload = typeof window !== "undefined" &&
    (window.performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming)?.type === "reload";

  const fetchOptions = isReload ? { headers: { "Cache-Control": "no-cache" } } : undefined;

  const {
    data: categoriesResponse,
    refetch: refetchCategories,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: ({ signal }) => getAllCategories(undefined, { signal, ...fetchOptions }),
    initialData: {
      data: initialCategories,
      meta: { page: 1, limit: initialCategories.length, total: initialCategories.length, total_pages: 1 },
    },
  })

  const categories = categoriesResponse?.data || []

  const lessonsQueries = useQueries({
    queries: categories.map((category) => ({
      queryKey: ["lessons", { category_id: category.id, limit: 4 }],
      queryFn: ({ signal }) =>
        getLessons(
          { category_id: category.id, limit: 4 },
          { signal, ...fetchOptions }
        ),
      staleTime: 5 * 60 * 1000,
    })),
  })

  const handleRetryCategories = async () => {
    const forceOptions = { headers: { "Cache-Control": "no-cache" } };
    await refetchCategories();
    lessonsQueries.forEach((q) => q.refetch());
  }

  const handleRetryCategory = (category: CategoryType) => {
    const idx = categories.findIndex((c) => c.id === category.id)
    if (idx !== -1) {
      lessonsQueries[idx].refetch()
    }
  }

  const handleSelectMode = (mode: "dictation" | "shadowing") => {
    if (!selectedLesson) return
    router.push(`/lessons/${selectedLesson.id}/${mode}`)
    setSelectedLesson(null)
  }

  if (categoriesLoading) return <CategoryListSkeleton />

  if (categoriesError) {
    return (
      <ContentErrorState
        title="Chưa thể mở thư viện chủ đề"
        description="Thư viện chủ đề hiện chưa phản hồi. Kết nối của bạn vẫn được giữ và bạn có thể thử tải lại ngay."
        onRetry={() => void handleRetryCategories()}
      />
    )
  }

  if (categories.length === 0) {
    return (
      <ContentEmptyState
        title="Thư viện đang chờ bài học đầu tiên"
        description="Chưa có chủ đề nào được xuất bản. Bạn có thể quay về trang chủ để khám phá phương pháp học của EngFlex."
        action={
          <Link
            href="/home"
            className={buttonVariants({ variant: "product", size: "app" })}
          >
            <HouseIcon aria-hidden="true" />
            Về trang chủ
          </Link>
        }
      />
    )
  }

  const rows = categories.map<CategoryLessonRow>((category, index) => {
    const query = lessonsQueries[index]
    const lessons = query?.data?.data || []
    const totalLessons = query?.data?.meta?.total
    const loading = query ? query.isPending || query.isFetching : false
    const error = query?.isError
      ? `Chưa thể tải bài học của chủ đề “${category.name}”. Dữ liệu ở các chủ đề khác vẫn được giữ nguyên.`
      : null

    return {
      category,
      lessons,
      totalLessons,
      loading,
      error,
    }
  })

  return (
    <div className="flex flex-col gap-16">
      {rows.map((row, index) => (
        <CategoryRow
          key={row.category.id}
          row={row}
          index={index}
          onRetry={handleRetryCategory}
          onSelectLesson={setSelectedLesson}
        />
      ))}

      <StudyModeDialog
        open={Boolean(selectedLesson)}
        lessonTitle={selectedLesson?.title}
        onOpenChange={(open) => {
          if (!open) setSelectedLesson(null)
        }}
        onSelectMode={handleSelectMode}
      />
    </div>
  )
}
