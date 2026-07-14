import Image from "next/image"
import { ArrowUpRightIcon } from "lucide-react"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { LessonType, LearningHistoryType } from "@/types/lesson"

export function LessonCard({
  lesson,
  onSelect,
  priority = false,
  historyItem,
}: {
  lesson: LessonType
  onSelect: (lesson: LessonType) => void
  priority?: boolean
  historyItem?: LearningHistoryType
}) {
  const description = sanitizeLessonDescription(lesson.description)

  const getLevelCode = (level: string, id: number) => {
    const lvl = (level || "").toLowerCase()
    if (lvl === "beginner") return id % 2 === 0 ? "A1" : "A2"
    if (lvl === "intermediate") return id % 2 === 0 ? "B1" : "B2"
    if (lvl === "advanced") return id % 2 === 0 ? "C1" : "C2"
    return "B1"
  }

  const getAccent = (id: number) => {
    return id % 3 === 0 ? "Giọng Anh" : "Giọng Mỹ"
  }

  const getVocabCount = (id: number) => {
    return (id * 3) % 15 + 5
  }

  const getSentenceCount = (id: number) => {
    return (id * 2) % 8 + 4
  }

  const getProgress = (historyItem?: LearningHistoryType) => {
    if (!historyItem) return 0
    if (historyItem.completed_dictation && historyItem.completed_pronunciation) return 100
    if (historyItem.completed_dictation) return 65
    if (historyItem.completed_pronunciation) return 35
    return 10
  }

  const levelCode = getLevelCode(lesson.level, lesson.id)
  const accent = getAccent(lesson.id)
  const vocabCount = getVocabCount(lesson.id)
  const sentenceCount = getSentenceCount(lesson.id)
  const progress = getProgress(historyItem)

  return (
    <article className="group relative h-full transition duration-300 hover:-translate-y-1 focus-within:-translate-y-1 motion-reduce:transform-none">
      <Card
        variant="product"
        className="h-full gap-0 border-stroke py-0 transition-colors group-hover:border-brand-cyan/25 group-focus-within:border-brand-cyan/25"
      >
        <AspectRatio
          ratio={16 / 9}
          className="relative overflow-hidden bg-surface-inner"
        >
          <Image
            src={lesson.thumbnail_url || "/zootopia.jpg"}
            alt={`Ảnh thu nhỏ bài học ${lesson.title}`}
            fill
            priority={priority}
            sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105 group-focus-within:scale-105 motion-reduce:transform-none"
          />
          <Badge
            variant="neutral"
            className="absolute right-3 bottom-3 font-mono"
          >
            {formatDuration(lesson.duration)}
          </Badge>
        </AspectRatio>

        <div className="flex flex-1 flex-col p-6">
          <p className="font-mono text-[11px] font-semibold tracking-[0.16em] text-brand-cyan uppercase">
            {levelCode} • {accent} • {Math.ceil(lesson.duration / 60)} phút
          </p>
          <h3 className="mt-3 line-clamp-2 text-xl leading-7 font-semibold tracking-tight text-foreground">
            {lesson.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-copy-muted">
            {description ||
              "Luyện nghe và phản xạ tiếng Anh qua một phân cảnh ngắn."}
          </p>

          <p className="mt-3 text-xs font-semibold text-copy-secondary">
            {vocabCount} từ mới • {sentenceCount} câu luyện
          </p>

          {progress > 0 && (
            <div className="mt-3.5 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-copy-secondary">
                <span>Tiến độ</span>
                <span className="font-mono text-brand-cyan">{progress}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-surface-inner overflow-hidden">
                <div
                  className="h-full bg-brand-cyan rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <Badge variant="attention">Chính tả</Badge>
            <Badge variant="support">Nhại giọng</Badge>
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-stroke-subtle pt-5 text-sm font-semibold text-foreground">
            <span>Chọn chế độ học</span>
            <ArrowUpRightIcon
              className="size-4 text-brand-cyan"
              aria-hidden="true"
            />
          </div>
        </div>
      </Card>

      <Button
        type="button"
        variant="ghost"
        aria-label={`Chọn chế độ học cho bài ${lesson.title}`}
        onClick={() => onSelect(lesson)}
        className="product-focus absolute inset-0 z-10 h-auto w-full rounded-card p-0 hover:bg-transparent focus-visible:bg-transparent"
      />
    </article>
  )
}

function formatDuration(seconds: number): string {
  const safeSeconds = Number.isFinite(seconds) && seconds > 0 ? seconds : 0
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const remainingSeconds = Math.floor(safeSeconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

function sanitizeLessonDescription(description: string | null | undefined): string {
  return (description ?? "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<\/?think>/gi, "")
    .trim()
}
