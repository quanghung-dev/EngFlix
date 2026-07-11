"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle2Icon, HouseIcon } from "lucide-react"

import { CategoryCard } from "@/components/category-card"
import { LessonCard } from "@/components/lesson-card"
import { StudyModeDialog } from "@/components/study-mode-dialog"
import { buttonVariants } from "@/components/ui/button"
import {
  CategoryListSkeleton,
  ContentEmptyState,
  ContentErrorState,
  LessonCardSkeleton,
} from "@/components/topics/topics-states"
import { getAllCategories } from "@/services/category.service"
import { getLessons } from "@/services/lesson.service"
import type { CategoryType } from "@/types/category"
import type { LessonType } from "@/types/lesson"

interface CategoryRowProps {
  category: CategoryType
  index: number
  onSelectLesson: (lesson: LessonType) => void
}

function CategoryRow({
  category,
  index,
  onSelectLesson,
}: CategoryRowProps) {
  const [lessons, setLessons] = useState<LessonType[]>([])
  const [totalLessons, setTotalLessons] = useState<number>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    async function loadInitialLessons() {
      try {
        const response = await getLessons({
          category_id: category.id,
          limit: 4,
        })
        if (!isActive) return
        setLessons(response.data || [])
        setTotalLessons(response.meta.total)
        setError(null)
      } catch {
        if (!isActive) return
        setError(
          `Chưa thể tải bài học của chủ đề “${category.name}”. Dữ liệu ở các chủ đề khác vẫn được giữ nguyên.`
        )
      } finally {
        if (isActive) setLoading(false)
      }
    }

    void loadInitialLessons()
    return () => {
      isActive = false
    }
  }, [category.id, category.name])

  const retryLessons = () => {
    setLoading(true)
    setError(null)
    void getLessons({ category_id: category.id, limit: 4 })
      .then((response) => {
        setLessons(response.data || [])
        setTotalLessons(response.meta.total)
      })
      .catch(() => {
        setError(
          `Chưa thể tải bài học của chủ đề “${category.name}”. Dữ liệu ở các chủ đề khác vẫn được giữ nguyên.`
        )
      })
      .finally(() => setLoading(false))
  }

  return (
    <section
      aria-labelledby={`category-${category.id}-heading`}
      className="flex flex-col gap-5"
    >
      <CategoryCard
        category={category}
        index={index}
        totalLessons={totalLessons}
      />

      <div aria-busy={loading}>
        {loading ? (
          <>
            <span className="sr-only" role="status">
              Đang tải bài học của chủ đề {category.name}…
            </span>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))] gap-4 lg:gap-5">
              {[0, 1, 2, 3].map((card) => (
                <LessonCardSkeleton key={card} />
              ))}
            </div>
          </>
        ) : error ? (
          <ContentErrorState
            title="Không tải được bài học"
            description={error}
            onRetry={retryLessons}
            headingLevel="h3"
          />
        ) : lessons.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))] gap-4 lg:gap-5">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
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
  )
}

export function CategoryLessons() {
  const router = useRouter()
  const [categories, setCategories] = useState<CategoryType[]>([])
  const [selectedLesson, setSelectedLesson] = useState<LessonType | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    async function loadInitialCategories() {
      try {
        const response = await getAllCategories()
        if (!isActive) return
        setCategories(response.data || [])
        setError(null)
      } catch {
        if (!isActive) return
        setError(
          "Thư viện chủ đề hiện chưa phản hồi. Kết nối của bạn vẫn được giữ và bạn có thể thử tải lại ngay."
        )
      } finally {
        if (isActive) setLoading(false)
      }
    }

    void loadInitialCategories()
    return () => {
      isActive = false
    }
  }, [])

  const retryCategories = () => {
    setLoading(true)
    setError(null)
    void getAllCategories()
      .then((response) => setCategories(response.data || []))
      .catch(() => {
        setError(
          "Thư viện chủ đề hiện chưa phản hồi. Kết nối của bạn vẫn được giữ và bạn có thể thử tải lại ngay."
        )
      })
      .finally(() => setLoading(false))
  }

  const handleSelectMode = (mode: "dictation" | "shadowing") => {
    if (!selectedLesson) return

    if (mode === "dictation") {
      router.push(`/lessons/${selectedLesson.id}/dictation`)
      setSelectedLesson(null)
      return
    }

    if (mode === "shadowing") {
      router.push(`/lessons/${selectedLesson.id}/shadowing`)
      setSelectedLesson(null)
      return
    }
  }

  if (loading) {
    return <CategoryListSkeleton />
  }

  if (error) {
    return (
      <ContentErrorState
        title="Chưa thể mở thư viện chủ đề"
        description={error}
        onRetry={retryCategories}
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

  return (
    <div className="flex flex-col gap-16">
      {feedback ? (
        <div
          role="status"
          aria-live="polite"
          className="flex items-start gap-3 rounded-panel border border-status-success/20 bg-status-success/10 p-4 text-sm leading-6 text-copy-secondary"
        >
          <CheckCircle2Icon
            className="mt-0.5 size-5 shrink-0 text-status-success"
            aria-hidden="true"
          />
          <p>{feedback}</p>
        </div>
      ) : null}

      {categories.map((category, index) => (
        <CategoryRow
          key={category.id}
          category={category}
          index={index}
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
