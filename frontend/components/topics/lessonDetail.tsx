"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon, CheckCircle2Icon } from "lucide-react"

import { LessonCard } from "@/components/lesson-card"
import { StudyModeDialog } from "@/components/study-mode-dialog"
import {
  ContentEmptyState,
  ContentErrorState,
  TopicDetailSkeleton,
} from "@/components/topics/topics-states"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { getAllCategories } from "@/services/category.service"
import { getLessons } from "@/services/lesson.service"
import type { CategoryType } from "@/types/category"
import type { LessonType } from "@/types/lesson"

export default function LessonDetail({ categoryId }: { categoryId: number }) {
  const router = useRouter()
  const [category, setCategory] = useState<CategoryType | null>(null)
  const [lessons, setLessons] = useState<LessonType[]>([])
  const [totalLessons, setTotalLessons] = useState(0)
  const [selectedLesson, setSelectedLesson] = useState<LessonType | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    async function loadInitialTopic() {
      try {
        const [lessonResponse, categoryResponse] = await Promise.all([
          getLessons({ category_id: categoryId }),
          getAllCategories(),
        ])
        if (!isActive) return

        const matchedCategory = categoryResponse.data.find(
          (item) => item.id === categoryId
        )
        if (!matchedCategory) {
          setCategory(null)
          setLessons([])
          setTotalLessons(0)
          setError(
            "Chủ đề này không tồn tại hoặc không còn được xuất bản. Hãy quay lại thư viện để chọn một chủ đề khác."
          )
          return
        }

        setCategory(matchedCategory)
        setLessons(lessonResponse.data || [])
        setTotalLessons(lessonResponse.meta.total)
        setError(null)
      } catch {
        if (!isActive) return
        setError(
          "Chưa thể tải thông tin chủ đề và danh sách bài học. Bạn có thể thử lại mà không cần rời trang."
        )
      } finally {
        if (isActive) setLoading(false)
      }
    }

    void loadInitialTopic()
    return () => {
      isActive = false
    }
  }, [categoryId])

  const retryTopic = () => {
    setLoading(true)
    setError(null)
    void Promise.all([
      getLessons({ category_id: categoryId }),
      getAllCategories(),
    ])
      .then(([lessonResponse, categoryResponse]) => {
        const matchedCategory = categoryResponse.data.find(
          (item) => item.id === categoryId
        )
        if (!matchedCategory) {
          setCategory(null)
          setLessons([])
          setTotalLessons(0)
          setError(
            "Chủ đề này không tồn tại hoặc không còn được xuất bản. Hãy quay lại thư viện để chọn một chủ đề khác."
          )
          return
        }
        setCategory(matchedCategory)
        setLessons(lessonResponse.data || [])
        setTotalLessons(lessonResponse.meta.total)
      })
      .catch(() => {
        setError(
          "Chưa thể tải thông tin chủ đề và danh sách bài học. Bạn có thể thử lại mà không cần rời trang."
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
    return <TopicDetailSkeleton />
  }

  if (error || !category) {
    return (
      <div>
        <Link
          href="/topics"
          className={buttonVariants({ variant: "glass", size: "app" })}
        >
          <ArrowLeftIcon aria-hidden="true" />
          Về thư viện
        </Link>
        <div className="mt-8">
          <ContentErrorState
            title="Không mở được chủ đề"
            description={
              error ||
              "Chủ đề này không còn khả dụng. Hãy quay lại thư viện và chọn nội dung khác."
            }
            onRetry={retryTopic}
            headingLevel="h1"
          />
        </div>
      </div>
    )
  }

  return (
    <div>
      <Link
        href="/topics"
        className={buttonVariants({ variant: "glass", size: "app" })}
      >
        <ArrowLeftIcon aria-hidden="true" />
        Quay lại chủ đề
      </Link>

      <header className="mt-10 flex flex-col gap-5 border-b border-stroke-subtle pb-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] font-semibold tracking-[0.2em] text-brand-cyan uppercase">
            Chủ đề học tập
          </p>
          <h1 className="mt-4 text-4xl leading-[1.08] font-semibold tracking-[-0.045em] text-white lg:text-5xl">
            {category.name}
          </h1>
          <p className="mt-5 text-base leading-7 text-copy-muted">
            Chọn một phân cảnh, sau đó luyện nghe chính tả hoặc nhại giọng
            để cải thiện phản xạ tiếng Anh theo từng bước.
          </p>
        </div>
        <Badge variant="info" className="h-7 px-3 font-mono">
          {totalLessons} bài học
        </Badge>
      </header>

      {feedback ? (
        <div
          role="status"
          aria-live="polite"
          className="mt-8 flex items-start gap-3 rounded-panel border border-status-success/20 bg-status-success/10 p-4 text-sm leading-6 text-copy-secondary"
        >
          <CheckCircle2Icon
            className="mt-0.5 size-5 shrink-0 text-status-success"
            aria-hidden="true"
          />
          <p>{feedback}</p>
        </div>
      ) : null}

      <div className="mt-10">
        {lessons.length > 0 ? (
          <section aria-labelledby="lesson-list-heading">
            <h2 id="lesson-list-heading" className="sr-only">
              Danh sách bài học
            </h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))] gap-4 lg:gap-5">
              {lessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  onSelect={setSelectedLesson}
                />
              ))}
            </div>
          </section>
        ) : (
          <ContentEmptyState
            title="Chủ đề chưa có bài học"
            description="Nội dung của chủ đề này đang được biên soạn. Hãy quay lại thư viện để tiếp tục với một chủ đề khác."
            action={
              <Link
                href="/topics"
                className={buttonVariants({ variant: "product", size: "app" })}
              >
                <ArrowLeftIcon aria-hidden="true" />
                Khám phá chủ đề khác
              </Link>
            }
          />
        )}
      </div>

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
