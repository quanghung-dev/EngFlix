"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useReducedMotion } from "motion/react"
import {
  ArrowRight,
  BookOpenCheck,
  BrainCircuit,
  Clock3,
  Flame,
  Gauge,
  RefreshCw,
  Sparkles,
} from "lucide-react"

import { PronunciationChart, WeeklyProgressChart } from "@/components/learning/progress-charts"
import { AsyncContentState } from "@/components/product/async-content-state"
import { ProductPageHeader } from "@/components/product/page-header"
import { ProductReveal } from "@/components/product/product-reveal"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthenticatedUser } from "@/hooks/use-authenticated-user"
import { cn } from "@/lib/utils"
import { getProgressStats } from "@/services/progress.service"
import type { ProgressStats } from "@/types/learning"

const metricCards = [
  { key: "streak", label: "Chuỗi học", suffix: "ngày", icon: Flame, accent: "text-action-gold bg-action-gold/10 border-action-gold/20" },
  { key: "total_lessons", label: "Bài hoàn tất", suffix: "bài", icon: BookOpenCheck, accent: "text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20" },
  { key: "total_minutes", label: "Thời gian ước tính", suffix: "phút", icon: Clock3, accent: "text-accent-violet bg-accent-violet/10 border-accent-violet/20" },
  { key: "total_words", label: "Từ đã lưu", suffix: "từ", icon: BrainCircuit, accent: "text-status-success bg-status-success/10 border-status-success/20" },
] as const

function ProgressSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric) => (
          <Card key={metric.key} variant="product">
            <CardContent>
              <Skeleton className="h-11 w-11 rounded-nav" />
              <Skeleton className="mt-8 h-9 w-20" />
              <Skeleton className="mt-3 h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-96 rounded-card" />
        <Skeleton className="h-96 rounded-card" />
      </div>
    </div>
  )
}

export function ProgressWorkspace() {
  const { user, resolved } = useAuthenticatedUser()
  const reduceMotion = Boolean(useReducedMotion())
  const [stats, setStats] = useState<ProgressStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!resolved || !user) return
    let active = true

    async function loadStats() {
      setLoading(true)
      setError(null)
      try {
        const response = await getProgressStats()
        if (active) setStats(response.data)
      } catch {
        if (active) setError("Không thể đồng bộ báo cáo học tập lúc này. Hãy kiểm tra kết nối và thử lại.")
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadStats()
    return () => {
      active = false
    }
  }, [reloadKey, resolved, user])

  const averagePronunciation = useMemo(() => {
    if (!stats?.shadowing_attempts.length) return null
    const total = stats.shadowing_attempts.reduce((sum, attempt) => sum + attempt.score, 0)
    return Math.round(total / stats.shadowing_attempts.length)
  }, [stats])

  const hasActivity = Boolean(
    stats &&
      (stats.total_lessons > 0 ||
        stats.total_words > 0 ||
        stats.shadowing_attempts.length > 0 ||
        stats.weekly_progress.some((point) => point.lessons_completed > 0))
  )

  function refresh() {
    setReloadKey((key) => key + 1)
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
      <ProductReveal eager>
        <ProductPageHeader
          eyebrow={<><Gauge className="size-4" aria-hidden="true" /> Learning telemetry</>}
          title="Nhìn rõ nhịp học của chính bạn."
          description="Tổng hợp bài đã hoàn tất, chuỗi học và điểm phát âm từ dữ liệu thật để bạn chọn bước luyện tiếp theo."
          actions={
            <>
              <Link href="/topics" className={cn(buttonVariants({ variant: "product", size: "app" }))}>
                Tiếp tục học
                <ArrowRight aria-hidden="true" />
              </Link>
              <Button variant="glass" size="app" onClick={refresh} disabled={loading}>
                <RefreshCw className={cn(loading && "opacity-60")} aria-hidden="true" />
                Làm mới dữ liệu
              </Button>
            </>
          }
          aside={
            averagePronunciation !== null ? (
              <div className="rounded-panel border border-brand-cyan/20 bg-brand-cyan/10 px-5 py-4">
                <p className="text-micro uppercase tracking-meta text-brand-cyan">Điểm phát âm TB</p>
                <p className="mt-1 text-3xl font-semibold text-foreground">{averagePronunciation}<span className="text-base text-copy-muted">/100</span></p>
              </div>
            ) : undefined
          }
        />
      </ProductReveal>

      <section className="mt-8" aria-label="Báo cáo tiến trình" aria-busy={!resolved || loading}>
        {!resolved ? (
          <ProgressSkeleton />
        ) : !user ? (
          <AsyncContentState
            kind="empty"
            title="Đăng nhập để xem tiến trình"
            description="Báo cáo được tổng hợp từ các bài Dictation và Shadowing của riêng bạn."
            action={
              <Link href="/login" className={cn(buttonVariants({ variant: "product", size: "app" }))}>
                Đăng nhập
              </Link>
            }
          />
        ) : loading && !stats ? (
          <ProgressSkeleton />
        ) : error && !stats ? (
          <AsyncContentState kind="error" title="Chưa thể mở báo cáo" description={error} onRetry={refresh} />
        ) : stats && !hasActivity ? (
          <AsyncContentState
            kind="empty"
            title="Hành trình của bạn bắt đầu từ bài đầu tiên"
            description="Hoàn tất cả Dictation và Shadowing của một bài để dữ liệu tiến trình bắt đầu được ghi nhận."
            icon={<Sparkles className="size-7" aria-hidden="true" />}
            action={
              <Link href="/topics" className={cn(buttonVariants({ variant: "product", size: "app" }))}>
                Chọn bài đầu tiên
              </Link>
            }
          />
        ) : stats ? (
          <div className="space-y-6">
            {error && (
              <div role="alert" className="flex flex-col gap-3 rounded-panel border border-destructive/30 bg-destructive/10 p-4 text-sm text-copy-secondary sm:flex-row sm:items-center sm:justify-between">
                <span>{error} Dữ liệu gần nhất vẫn đang được hiển thị.</span>
                <Button variant="glass" onClick={refresh}>Thử lại</Button>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {metricCards.map((metric, index) => {
                const Icon = metric.icon
                return (
                  <ProductReveal key={metric.key} delay={index * 0.07}>
                    <Card variant="product" className="h-full transition duration-300 hover:-translate-y-1 hover:border-brand-cyan/20 motion-reduce:transform-none">
                      <CardContent>
                        <span className={cn("grid size-11 place-items-center rounded-nav border", metric.accent)}>
                          <Icon className="size-5" aria-hidden="true" />
                        </span>
                        <p className="mt-8 text-4xl font-semibold tracking-tight text-foreground">
                          {stats[metric.key].toLocaleString("vi-VN")}
                        </p>
                        <p className="mt-2 text-sm font-medium text-copy-secondary">{metric.label}</p>
                        <p className="mt-1 text-micro uppercase tracking-meta text-copy-muted">
                          {metric.suffix}{metric.key === "total_minutes" ? " · 15 phút/bài" : ""}
                        </p>
                      </CardContent>
                    </Card>
                  </ProductReveal>
                )
              })}
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <ProductReveal delay={0.07}>
                <Card variant="product" className="h-full">
                  <CardHeader>
                    <p className="text-micro uppercase tracking-meta text-brand-cyan">7 ngày gần nhất</p>
                    <CardTitle className="mt-2 text-xl text-foreground">Bài học hoàn tất theo ngày</CardTitle>
                    <p className="mt-2 text-sm leading-6 text-copy-muted">Một bài chỉ được tính khi cả Dictation và Shadowing đã hoàn tất.</p>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <WeeklyProgressChart data={stats.weekly_progress} reduceMotion={reduceMotion} />
                  </CardContent>
                </Card>
              </ProductReveal>

              <ProductReveal delay={0.14}>
                <Card variant="product" className="h-full">
                  <CardHeader>
                    <p className="text-micro uppercase tracking-meta text-brand-cyan">10 lượt gần nhất</p>
                    <CardTitle className="mt-2 text-xl text-foreground">Xu hướng điểm phát âm</CardTitle>
                    <p className="mt-2 text-sm leading-6 text-copy-muted">Theo dõi sự thay đổi giữa các lượt ghi âm Shadowing đã được chấm.</p>
                  </CardHeader>
                  <CardContent className="pt-2">
                    {stats.shadowing_attempts.length ? (
                      <PronunciationChart attempts={stats.shadowing_attempts} reduceMotion={reduceMotion} />
                    ) : (
                      <div className="flex h-64 flex-col items-center justify-center text-center">
                        <BrainCircuit className="size-8 text-copy-subtle" aria-hidden="true" />
                        <p className="mt-4 text-sm font-medium text-foreground">Chưa có điểm phát âm</p>
                        <p className="mt-2 max-w-xs text-sm leading-6 text-copy-muted">Luyện một câu trong Shadowing để bắt đầu đường xu hướng.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </ProductReveal>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}
