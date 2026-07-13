"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { HouseIcon } from "lucide-react"

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

async function loadCategoryRows(categories: CategoryType[], options?: RequestInit) {
  const results = await Promise.allSettled(
    categories.map((category) =>
      getLessons({ category_id: category.id, limit: 4 }, options)
    )
  )

  return categories.map<CategoryLessonRow>((category, index) => {
    const result = results[index]
    if (result.status === "fulfilled") {
      return {
        category,
        lessons: result.value.data || [],
        totalLessons: result.value.meta.total,
        loading: false,
        error: null,
      }
    }

    return {
      category,
      lessons: [],
      loading: false,
      error: `Chưa thể tải bài học của chủ đề “${category.name}”. Dữ liệu ở các chủ đề khác vẫn được giữ nguyên.`,
    }
  })
}

export function CategoryLessons() {
  const router = useRouter()
  const mountedRef = useRef(true)
  const [rows, setRows] = useState<CategoryLessonRow[]>([])
  const [selectedLesson, setSelectedLesson] = useState<LessonType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    mountedRef.current = true

    async function loadCatalog() {
      try {
        const isReload = typeof window !== "undefined" &&
          (window.performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming)?.type === "reload";
        
        const fetchOptions = isReload ? { headers: { "Cache-Control": "no-cache" } } : undefined;

        const categoryResponse = await getAllCategories(undefined, fetchOptions)
        const categories = categoryResponse.data || []
        const nextRows = await loadCategoryRows(categories, fetchOptions)
        if (!mountedRef.current) return
        setRows(nextRows)
        setError(null)
      } catch {
        if (!mountedRef.current) return
        setError(
          "Thư viện chủ đề hiện chưa phản hồi. Kết nối của bạn vẫn được giữ và bạn có thể thử tải lại ngay."
        )
      } finally {
        if (mountedRef.current) setLoading(false)
      }
    }

    void loadCatalog()
    return () => {
      mountedRef.current = false
    }
  }, [])

  const retryCategories = async () => {
    setLoading(true)
    setError(null)
    try {
      const fetchOptions = { headers: { "Cache-Control": "no-cache" } };
      const categoryResponse = await getAllCategories(undefined, fetchOptions)
      const nextRows = await loadCategoryRows(categoryResponse.data || [], fetchOptions)
      if (!mountedRef.current) return
      setRows(nextRows)
    } catch {
      if (!mountedRef.current) return
      setError(
        "Thư viện chủ đề hiện chưa phản hồi. Kết nối của bạn vẫn được giữ và bạn có thể thử tải lại ngay."
      )
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  const retryCategory = async (category: CategoryType) => {
    setRows((current) =>
      current.map((row) =>
        row.category.id === category.id
          ? { ...row, loading: true, error: null }
          : row
      )
    )

    try {
      const response = await getLessons({ category_id: category.id, limit: 4 }, { headers: { "Cache-Control": "no-cache" } })
      if (!mountedRef.current) return
      setRows((current) =>
        current.map((row) =>
          row.category.id === category.id
            ? {
                ...row,
                lessons: response.data || [],
                totalLessons: response.meta.total,
                loading: false,
                error: null,
              }
            : row
        )
      )
    } catch {
      if (!mountedRef.current) return
      setRows((current) =>
        current.map((row) =>
          row.category.id === category.id
            ? {
                ...row,
                loading: false,
                error: `Chưa thể tải bài học của chủ đề “${category.name}”. Dữ liệu ở các chủ đề khác vẫn được giữ nguyên.`,
              }
            : row
        )
      )
    }
  }

  const handleSelectMode = (mode: "dictation" | "shadowing") => {
    if (!selectedLesson) return
    router.push(`/lessons/${selectedLesson.id}/${mode}`)
    setSelectedLesson(null)
  }

  if (loading) return <CategoryListSkeleton />

  if (error) {
    return (
      <ContentErrorState
        title="Chưa thể mở thư viện chủ đề"
        description={error}
        onRetry={() => void retryCategories()}
      />
    )
  }

  if (rows.length === 0) {
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

  return (
    <div className="flex flex-col gap-16">
      {rows.map((row, index) => (
        <CategoryRow
          key={row.category.id}
          row={row}
          index={index}
          onRetry={(category) => void retryCategory(category)}
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
