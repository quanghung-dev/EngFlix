"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Flame,
  BrainCircuit,
  Award,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Play,
  CheckCircle2,
  Circle,
  HelpCircle,
  Clapperboard,
  Mic,
  GraduationCap
} from "lucide-react"

import { ProductPageHeader } from "@/components/product/page-header"
import { ProductReveal } from "@/components/product/product-reveal"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthenticatedUser } from "@/hooks/use-authenticated-user"
import { cn } from "@/lib/utils"
import { getProgressStats } from "@/services/progress.service"
import { getLearningHistory, getLessons, getLessonById } from "@/services/lesson.service"
import type { ProgressStats } from "@/types/learning"
import type { LearningHistoryType, LessonType } from "@/types/lesson"

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} variant="product">
            <CardContent className="pt-6">
              <Skeleton className="h-11 w-11 rounded-nav" />
              <Skeleton className="mt-8 h-9 w-20" />
              <Skeleton className="mt-3 h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 rounded-card" />
          <Skeleton className="h-64 rounded-card" />
        </div>
        <Skeleton className="h-[400px] rounded-card" />
      </div>
    </div>
  )
}

export function DashboardWorkspace() {
  const { user, resolved } = useAuthenticatedUser({ required: true })
  const [stats, setStats] = useState<ProgressStats | null>(null)
  const [history, setHistory] = useState<LearningHistoryType[]>([])
  const [lessons, setLessons] = useState<LessonType[]>([])
  const [recentLesson, setRecentLesson] = useState<LessonType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!resolved || !user) return
    let active = true

    async function loadDashboardData() {
      setLoading(true)
      setError(null)
      try {
        const [statsRes, historyRes, lessonsRes] = await Promise.all([
          getProgressStats(),
          getLearningHistory({ limit: 10 }),
          getLessons({ limit: 20 })
        ])

        if (!active) return

        setStats(statsRes.data)
        const historyData = historyRes.data || []
        setHistory(historyData)
        const lessonsData = lessonsRes.data || []
        setLessons(lessonsData)

        // Load details for the most recent lesson if exists
        if (historyData.length > 0) {
          const latestHistory = historyData[0]
          const found = lessonsData.find((l) => l.id === latestHistory.lesson_id)
          if (found) {
            setRecentLesson(found)
          } else {
            try {
              const lessonDetailRes = await getLessonById(latestHistory.lesson_id)
              if (active) setRecentLesson(lessonDetailRes.data)
            } catch (err) {
              console.error("Failed to load recent lesson detail:", err)
            }
          }
        } else {
          setRecentLesson(null)
        }

      } catch (err) {
        if (active) {
          setError("Không thể tải thông tin trang chủ học tập lúc này. Hãy kiểm tra lại kết nối.")
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadDashboardData()
    return () => {
      active = false
    }
  }, [reloadKey, resolved, user])

  const refresh = () => setReloadKey((k) => k + 1)

  const latestPronunciationScore = useMemo(() => {
    if (!stats?.shadowing_attempts || stats.shadowing_attempts.length === 0) return null
    const sorted = [...stats.shadowing_attempts].sort((a, b) => b.id - a.id)
    return sorted[0].score
  }, [stats])

  const recommendedLesson = useMemo(() => {
    if (lessons.length === 0) return null
    const unfinishedLesson = lessons.find((lesson) => {
      const historyItem = history.find((h) => h.lesson_id === lesson.id)
      if (!historyItem) return true
      return !(historyItem.completed_dictation && historyItem.completed_pronunciation)
    })
    return unfinishedLesson || lessons[0]
  }, [lessons, history])

  const dailyGoalProgress = useMemo(() => {
    if (history.length === 0) return 0
    const today = new Date().toLocaleDateString("en-US")
    const completedToday = history.some((item) => {
      const itemDate = new Date(item.updated_at).toLocaleDateString("en-US")
      return itemDate === today && (item.completed_dictation || item.completed_pronunciation)
    })
    return completedToday ? 1 : 0
  }, [history])

  // Get status for the recent lesson
  const recentLessonStatus = useMemo(() => {
    if (!recentLesson || history.length === 0) return null
    return history.find((h) => h.lesson_id === recentLesson.id) || null
  }, [recentLesson, history])

  const displayLevel = (level: string) => {
    const map: Record<string, string> = {
      beginner: "Cơ bản",
      intermediate: "Trung cấp",
      advanced: "Nâng cao",
    }
    return map[level.toLowerCase()] || level
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.ceil(seconds / 60)
    return `${mins} phút`
  }

  const metrics = [
    {
      key: "streak",
      label: "Streak hiện tại",
      value: stats?.streak ?? 0,
      suffix: "ngày",
      icon: Flame,
      accent: "text-action-gold bg-action-gold/10 border-action-gold/20",
    },
    {
      key: "words",
      label: "Số từ cần ôn hôm nay",
      value: stats?.words_to_review ?? 0,
      suffix: `trong tổng số ${stats?.total_words ?? 0} từ đã lưu`,
      icon: BrainCircuit,
      accent: "text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20",
    },
    {
      key: "pronunciation",
      label: "Phát âm gần đây",
      value: latestPronunciationScore !== null ? `${latestPronunciationScore}` : "--",
      suffix: latestPronunciationScore !== null ? "/100 điểm" : "chưa thực hành",
      icon: Award,
      accent: "text-accent-violet bg-accent-violet/10 border-accent-violet/20",
    },
    {
      key: "lessons",
      label: "Bài học hoàn thành",
      value: stats?.total_lessons ?? 0,
      suffix: "bài",
      icon: BookOpen,
      accent: "text-status-success bg-status-success/10 border-status-success/20",
    },
  ]

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
      <ProductReveal eager>
        <ProductPageHeader
          eyebrow={
            <>
              <GraduationCap className="size-4" aria-hidden="true" /> Không gian học tập
            </>
          }
          title={
            <>
              Chào mừng trở lại,{" "}
              <span className="text-brand-cyan">
                {user?.displayName || user?.email?.split("@")[0] || "Học viên"}
              </span>
              !
            </>
          }
          description="Tiếp tục học tiếng Anh qua những thước phim yêu thích và theo dõi mục tiêu học tập hàng ngày của bạn."
          actions={
            <>
              <Link
                href="/topics"
                className={cn(buttonVariants({ variant: "product", size: "app" }))}
              >
                Khám phá bài học
                <ArrowRight aria-hidden="true" />
              </Link>
              <Button variant="glass" size="app" onClick={refresh} disabled={loading}>
                <RefreshCw className={cn(loading && "opacity-60")} aria-hidden="true" />
                Làm mới dữ liệu
              </Button>
            </>
          }
        />
      </ProductReveal>

      <section className="mt-8" aria-busy={loading}>
        {loading && !stats ? (
          <DashboardSkeleton />
        ) : error && !stats ? (
          <div className="rounded-panel border border-destructive/30 bg-destructive/10 p-6 text-center">
            <p className="text-sm font-medium text-copy-primary">{error}</p>
            <Button variant="glass" className="mt-4" onClick={refresh}>
              Tải lại trang
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Metric Row */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric, idx) => {
                const Icon = metric.icon
                return (
                  <ProductReveal key={metric.key} delay={idx * 0.05}>
                    <Card
                      variant="product"
                      className="h-full transition duration-300 hover:-translate-y-1 hover:border-brand-cyan/20 cursor-pointer"
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <span
                            className={cn(
                              "grid size-11 place-items-center rounded-nav border",
                              metric.accent
                            )}
                          >
                            <Icon className="size-5" aria-hidden="true" />
                          </span>
                          {metric.key === "words" && stats && stats.total_words > 0 && (
                            <Link
                              href="/vocabulary"
                              className="text-xs font-medium text-brand-cyan hover:underline inline-flex items-center gap-1"
                            >
                              Ôn tập ngay
                              <ArrowRight className="size-3" />
                            </Link>
                          )}
                        </div>
                        <p className="mt-6 font-mono text-4xl font-semibold tracking-tight text-foreground">
                          {metric.value}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-copy-secondary">
                          {metric.label}
                        </p>
                        <p className="mt-0.5 text-xs text-copy-muted">{metric.suffix}</p>
                      </CardContent>
                    </Card>
                  </ProductReveal>
                )
              })}
            </div>

            {/* Content Row: Main sections */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column: Lesson actions */}
              <div className="lg:col-span-2 space-y-6">
                {/* Continue Recent Lesson */}
                <ProductReveal delay={0.1}>
                  <Card variant="product" className="overflow-hidden">
                    <CardHeader className="border-b border-stroke-subtle bg-canvas-muted/35 py-4">
                      <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                        <Clapperboard className="size-4 text-brand-cyan" />
                        Tiếp tục bài gần nhất
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {recentLesson ? (
                        <div className="grid gap-6 sm:grid-cols-[160px_1fr] items-start">
                          <div className="relative aspect-video w-full overflow-hidden rounded-card border border-stroke-subtle bg-canvas-deep">
                            <Image
                              src={recentLesson.thumbnail_url || "/owl-speaking-cinematic.webp"}
                              alt={recentLesson.title}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/10" />
                          </div>

                          <div className="space-y-4">
                            <div>
                              <span className="inline-block rounded-full bg-brand-cyan/15 px-2.5 py-0.5 text-[10px] font-semibold text-brand-cyan uppercase tracking-wider">
                                {displayLevel(recentLesson.level)}
                              </span>
                              <h3 className="mt-2 text-lg font-semibold text-foreground leading-snug">
                                {recentLesson.title}
                              </h3>
                              <p className="mt-1 text-xs text-copy-muted">
                                Thời lượng: {formatDuration(recentLesson.duration)}
                              </p>
                            </div>

                            {/* Section progress indicator */}
                            <div className="grid grid-cols-2 gap-3 p-3 rounded-panel border border-stroke-subtle bg-canvas-muted/20">
                              <div className="flex items-center gap-2">
                                {recentLessonStatus?.completed_dictation ? (
                                  <CheckCircle2 className="size-4 text-status-success shrink-0" />
                                ) : (
                                  <Circle className="size-4 text-copy-subtle shrink-0" />
                                )}
                                <span className="text-xs font-medium text-copy-secondary">
                                  Luyện nghe (Dictation)
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {recentLessonStatus?.completed_pronunciation ? (
                                  <CheckCircle2 className="size-4 text-status-success shrink-0" />
                                ) : (
                                  <Circle className="size-4 text-copy-subtle shrink-0" />
                                )}
                                <span className="text-xs font-medium text-copy-secondary">
                                  Luyện nói (Shadowing)
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                              <Link
                                href={`/lessons/${recentLesson.id}/dictation`}
                                className={cn(
                                  buttonVariants({
                                    variant: recentLessonStatus?.completed_dictation
                                      ? "glass"
                                      : "product",
                                    size: "sm",
                                  }),
                                  "inline-flex items-center gap-1.5"
                                )}
                              >
                                <Play className="size-3.5 fill-current" />
                                Luyện nghe
                              </Link>
                              <Link
                                href={`/lessons/${recentLesson.id}/shadowing`}
                                className={cn(
                                  buttonVariants({
                                    variant:
                                      recentLessonStatus?.completed_dictation &&
                                      !recentLessonStatus?.completed_pronunciation
                                        ? "product"
                                        : "glass",
                                    size: "sm",
                                  }),
                                  "inline-flex items-center gap-1.5"
                                )}
                              >
                                <Mic className="size-3.5" />
                                Luyện phát âm
                              </Link>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-8 text-center">
                          <div className="mx-auto size-12 grid place-items-center rounded-full bg-brand-cyan/10 text-brand-cyan">
                            <HelpCircle className="size-6" />
                          </div>
                          <p className="mt-4 text-sm font-semibold text-foreground">
                            Bạn chưa bắt đầu bài học nào
                          </p>
                          <p className="mt-2 text-xs text-copy-muted max-w-xs mx-auto">
                            Hãy ghé qua thư viện chủ đề để bắt đầu học tập và tích lũy phản xạ tiếng Anh.
                          </p>
                          <Link
                            href="/topics"
                            className={cn(
                              buttonVariants({ variant: "product", size: "sm" }),
                              "mt-5"
                            )}
                          >
                            Chọn bài học đầu tiên
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </ProductReveal>

                {/* Recommended Lesson */}
                <ProductReveal delay={0.15}>
                  <Card variant="product" className="overflow-hidden">
                    <CardHeader className="border-b border-stroke-subtle bg-canvas-muted/35 py-4">
                      <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                        <Sparkles className="size-4 text-action-gold animate-pulse" />
                        Gợi ý bài học cho bạn
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {recommendedLesson ? (
                        <div className="grid gap-6 sm:grid-cols-[160px_1fr] items-start">
                          <div className="relative aspect-video w-full overflow-hidden rounded-card border border-stroke-subtle bg-canvas-deep">
                            <Image
                              src={
                                recommendedLesson.thumbnail_url || "/owl-speaking-cinematic.webp"
                              }
                              alt={recommendedLesson.title}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/10" />
                          </div>

                          <div className="space-y-4">
                            <div>
                              <span className="inline-block rounded-full bg-action-gold/15 px-2.5 py-0.5 text-[10px] font-semibold text-action-gold uppercase tracking-wider">
                                {displayLevel(recommendedLesson.level)}
                              </span>
                              <h3 className="mt-2 text-lg font-semibold text-foreground leading-snug">
                                {recommendedLesson.title}
                              </h3>
                              <p className="mt-1 text-xs text-copy-muted">
                                {recommendedLesson.description ||
                                  "Luyện phản xạ qua đoạn phim thú vị."}
                              </p>
                              <p className="mt-2 text-xs text-copy-muted">
                                Thời lượng: {formatDuration(recommendedLesson.duration)}
                              </p>
                            </div>

                            <Link
                              href={`/lessons/${recommendedLesson.id}/dictation`}
                              className={cn(
                                buttonVariants({ variant: "product", size: "sm" }),
                                "inline-flex items-center gap-1.5"
                              )}
                            >
                              <Play className="size-3.5 fill-current" />
                              Bắt đầu học ngay
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-copy-muted py-4 text-center">
                          Không có gợi ý bài học nào khả dụng.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </ProductReveal>
              </div>

              {/* Right Column: Daily goal & info */}
              <div className="space-y-6">
                {/* Daily Goal card */}
                <ProductReveal delay={0.2}>
                  <Card variant="product" className="h-full relative overflow-hidden">
                    {/* Glow effect */}
                    <div className="absolute -right-20 -top-20 size-40 rounded-full bg-brand-cyan/10 blur-3xl pointer-events-none" />

                    <CardHeader>
                      <CardTitle className="text-base font-semibold text-foreground">
                        Mục tiêu hôm nay
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center pt-2 pb-6">
                      {/* Circular Progress Ring */}
                      <div className="relative size-36 flex items-center justify-center">
                        <svg className="size-full -rotate-90">
                          <circle
                            cx="72"
                            cy="72"
                            r="58"
                            className="stroke-stroke-subtle fill-none"
                            strokeWidth="10"
                          />
                          <circle
                            cx="72"
                            cy="72"
                            r="58"
                            className="stroke-brand-cyan fill-none transition-all duration-700 ease-out"
                            strokeWidth="10"
                            strokeDasharray={364.4}
                            strokeDashoffset={364.4 * (1 - dailyGoalProgress)}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="font-mono text-3xl font-semibold text-foreground">
                            {dailyGoalProgress}/1
                          </span>
                          <span className="text-[10px] text-copy-muted font-medium uppercase tracking-wider mt-0.5">
                            Bài học
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 text-center space-y-2">
                        <p className="text-sm font-semibold text-foreground">
                          {dailyGoalProgress === 1
                            ? "Đã hoàn thành mục tiêu! 🎉"
                            : "Hoàn thành 1 bài học mới"}
                        </p>
                        <p className="text-xs text-copy-muted leading-relaxed max-w-xs mx-auto">
                          {dailyGoalProgress === 1
                            ? "Tuyệt vời! Bạn đã duy trì được đà học tập ngày hôm nay. Hãy giữ phong độ nhé!"
                            : "Luyện nghe (Dictation) hoặc luyện nói (Shadowing) bất kỳ bài học nào hôm nay để hoàn thành mục tiêu."}
                        </p>
                      </div>

                      {dailyGoalProgress === 0 && recommendedLesson && (
                        <Link
                          href={`/lessons/${recommendedLesson.id}/dictation`}
                          className={cn(
                            buttonVariants({ variant: "glass", size: "sm" }),
                            "mt-6 w-full"
                          )}
                        >
                          Học bài đề xuất
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                </ProductReveal>

                {/* Helpful tips box */}
                <ProductReveal delay={0.25}>
                  <Card variant="product" className="border-brand-cyan/20 bg-brand-cyan/5">
                    <CardContent className="pt-6 space-y-3">
                      <h4 className="text-sm font-semibold text-brand-cyan flex items-center gap-1.5">
                        <Sparkles className="size-4 text-action-gold animate-bounce" />
                        Mẹo học hiệu quả
                      </h4>
                      <p className="text-xs text-copy-secondary leading-relaxed">
                        Hãy sử dụng tính năng <strong>Shadowing (Nhại giọng)</strong> nhiều lần đối với một câu thoại khó để tăng điểm phát âm AI của bạn.
                      </p>
                      <p className="text-xs text-copy-secondary leading-relaxed">
                        Nhấn vào biểu tượng cuốn sách trong bài học để lưu từ mới. Các từ đã lưu sẽ tự động chuyển vào kho từ vựng giúp bạn ôn lại dễ dàng.
                      </p>
                    </CardContent>
                  </Card>
                </ProductReveal>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
