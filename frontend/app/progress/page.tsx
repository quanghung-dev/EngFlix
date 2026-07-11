"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Flame,
  Clock,
  BookOpen,
  Award,
  TrendingUp,
  Brain,
  RotateCw,
  Sparkles,
  Calendar
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { getProgressStats, ProgressStatsType } from "@/services/progress.service"

export default function ProgressPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [stats, setStats] = useState<ProgressStatsType | null>(null)
  const [loading, setLoading] = useState(true)

  // Theo dõi đăng nhập
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user)
      } else {
        router.push("/login")
      }
    })
    return () => unsubscribe()
  }, [])

  // Tải dữ liệu tiến trình học
  const loadStats = async () => {
    try {
      setLoading(true)
      const res = await getProgressStats()
      if (res.data) {
        setStats(res.data)
      }
    } catch (err) {
      console.error("Lỗi tải báo cáo thống kê:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser) {
      void loadStats()
    }
  }, [currentUser])

  // Vẽ biểu đồ cột SVG cho số bài hoàn thành trong 7 ngày
  const renderWeeklyBarChart = (data: Array<{ activity_date: string; lessons_completed: number }>) => {
    if (!data || data.length === 0) return null

    const maxVal = Math.max(...data.map(d => d.lessons_completed), 1) // tránh chia cho 0
    const height = 140

    return (
      <div className="w-full flex flex-col gap-4">
        {/* Khung chứa các cột */}
        <div className="flex items-end justify-between h-[150px] px-2 pt-4 border-b border-stroke/40">
          {data.map((day, idx) => {
            const barHeight = (day.lessons_completed / maxVal) * height
            const isToday = idx === data.length - 1
            const dateObj = new Date(day.activity_date)
            const dayLabel = dateObj.toLocaleDateString("vi-VN", { weekday: "short" })

            return (
              <div key={day.activity_date} className="flex flex-col items-center flex-1 group">
                {/* Tooltip hiển thị số bài */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-surface-inner border border-stroke px-2 py-0.5 rounded text-[10px] font-mono text-brand-cyan mb-1.5 -translate-y-1 absolute scale-90">
                  {day.lessons_completed} bài
                </div>
                
                {/* Cột biểu đồ */}
                <div
                  style={{ height: `${Math.max(barHeight, 4)}px` }}
                  className={`w-7 sm:w-10 rounded-t transition-all duration-500 ${
                    isToday
                      ? "bg-gradient-to-t from-brand-cyan/60 to-brand-cyan shadow-[0_0_15px_rgba(110,231,242,0.25)]"
                      : "bg-gradient-to-t from-stroke/40 to-copy-muted/50 group-hover:from-brand-cyan/20 group-hover:to-brand-cyan/40"
                  }`}
                />
              </div>
            )
          })}
        </div>

        {/* Nhãn ngày bên dưới */}
        <div className="flex justify-between text-[10px] font-mono text-copy-muted px-2">
          {data.map((day) => {
            const dateObj = new Date(day.activity_date)
            const dateStr = dateObj.getDate() + "/" + (dateObj.getMonth() + 1)
            return (
              <div key={day.activity_date} className="text-center w-7 sm:w-10">
                {dateStr}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Vẽ biểu đồ đường SVG cho 10 lần Shadowing gần nhất
  const renderShadowingLineChart = (attempts: Array<{ id: number; score: number; created_at: string }>) => {
    if (!attempts || attempts.length === 0) {
      return (
        <div className="h-[150px] flex items-center justify-center text-xs text-copy-muted italic">
          Chưa có bài nhại giọng (Shadowing) nào để thống kê
        </div>
      )
    }

    const width = 500
    const height = 150
    const padding = 25

    // Tính tọa độ cho từng attempt
    const points = attempts.map((att, idx) => {
      const x = padding + (idx / Math.max(attempts.length - 1, 1)) * (width - padding * 2)
      // Score tối đa 100
      const y = height - padding - (att.score / 100) * (height - padding * 2)
      return { x, y, score: att.score }
    })

    // Tạo đường SVG Path
    let pathD = ""
    if (points.length > 0) {
      pathD = `M ${points[0].x} ${points[0].y} `
      for (let i = 1; i < points.length; i++) {
        pathD += `L ${points[i].x} ${points[i].y} `
      }
    }

    return (
      <div className="w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
          {/* Lưới ngang (Grid lines) */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.1)" />

          {/* Nhãn điểm */}
          <text x={padding - 5} y={padding + 4} fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="end" fontFamily="monospace">100</text>
          <text x={padding - 5} y={height / 2 + 3} fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="end" fontFamily="monospace">50</text>
          <text x={padding - 5} y={height - padding + 3} fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="end" fontFamily="monospace">0</text>

          {/* Đường xu hướng vẽ bằng SVG Path */}
          {points.length > 1 && (
            <path
              d={pathD}
              fill="none"
              stroke="#6ee7f2"
              strokeWidth="2.5"
              className="drop-shadow-[0_0_8px_rgba(110,231,242,0.5)]"
            />
          )}

          {/* Các điểm nút tròn */}
          {points.map((pt, idx) => (
            <g key={idx} className="group cursor-pointer">
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4.5"
                fill="#6ee7f2"
                stroke="#0e131f"
                strokeWidth="1.5"
              />
              {/* Vòng sáng hover */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r="10"
                fill="#6ee7f2"
                opacity="0"
                className="hover:opacity-20 transition duration-200"
              />
              {/* Điểm số ghi đè lên đầu */}
              <text
                x={pt.x}
                y={pt.y - 8}
                fill="#ffffff"
                fontSize="8"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {pt.score}
              </text>
            </g>
          ))}
        </svg>
        <div className="text-[9px] font-mono text-copy-muted text-center mt-2 flex justify-between px-6">
          <span>← Các bài trước</span>
          <span>Bài mới nhất →</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-canvas p-6 text-white overflow-y-auto">
      
      {/* Header */}
      <div className="flex items-center gap-4 pb-6 border-b border-stroke mb-8">
        <div className="size-14 relative shrink-0">
          <Image
            src="/owl-speaking-cinematic.webp"
            alt="EngFlex Owl"
            width={56}
            height={56}
            className="size-full object-contain"
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Tiến độ học tập
          </h1>
          <p className="text-xs text-copy-muted mt-1">
            Báo cáo tiến trình làm bài Dictation, điểm phát âm Shadowing và từ vựng
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-60 flex-col items-center justify-center gap-4 text-copy-secondary">
          <div className="size-8 animate-spin rounded-full border-4 border-brand-cyan border-t-transparent" />
          <p className="font-mono text-xs text-brand-cyan uppercase tracking-widest animate-pulse">
            Đang tổng hợp báo cáo...
          </p>
        </div>
      ) : !stats ? (
        <div className="text-center py-10 text-copy-muted text-xs">
          Không thể tải dữ liệu tiến độ.
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* STATS OVERVIEW CARDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Streak Flame */}
            <div className="rounded-panel border border-stroke bg-surface-panel p-5 flex items-center justify-between shadow-card hover:border-stroke-strong transition duration-300">
              <div>
                <span className="text-[10px] font-mono text-copy-muted uppercase tracking-wider block">Streak liên tiếp</span>
                <span className="text-2xl font-bold font-mono mt-2 block text-orange-500 flex items-baseline gap-1">
                  {stats.streak} <span className="text-xs font-normal text-copy-muted">ngày</span>
                </span>
              </div>
              <div className="size-12 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.15)] animate-pulse">
                <Flame className="size-6 fill-orange-500/10" />
              </div>
            </div>

            {/* Card 2: Study Time */}
            <div className="rounded-panel border border-stroke bg-surface-panel p-5 flex items-center justify-between shadow-card hover:border-stroke-strong transition duration-300">
              <div>
                <span className="text-[10px] font-mono text-copy-muted uppercase tracking-wider block">Thời gian học</span>
                <span className="text-2xl font-bold font-mono mt-2 block text-brand-cyan flex items-baseline gap-1">
                  {stats.total_minutes} <span className="text-xs font-normal text-copy-muted">phút</span>
                </span>
              </div>
              <div className="size-12 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan">
                <Clock className="size-6" />
              </div>
            </div>

            {/* Card 3: Completed Lessons */}
            <div className="rounded-panel border border-stroke bg-surface-panel p-5 flex items-center justify-between shadow-card hover:border-stroke-strong transition duration-300">
              <div>
                <span className="text-[10px] font-mono text-copy-muted uppercase tracking-wider block">Bài hoàn thành</span>
                <span className="text-2xl font-bold font-mono mt-2 block text-emerald-400 flex items-baseline gap-1">
                  {stats.total_lessons} <span className="text-xs font-normal text-copy-muted">bài</span>
                </span>
              </div>
              <div className="size-12 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
                <BookOpen className="size-6" />
              </div>
            </div>

            {/* Card 4: Words Saved */}
            <div className="rounded-panel border border-stroke bg-surface-panel p-5 flex items-center justify-between shadow-card hover:border-stroke-strong transition duration-300">
              <div>
                <span className="text-[10px] font-mono text-copy-muted uppercase tracking-wider block">Từ vựng đã lưu</span>
                <span className="text-2xl font-bold font-mono mt-2 block text-yellow-400 flex items-baseline gap-1">
                  {stats.total_words} <span className="text-xs font-normal text-copy-muted">từ</span>
                </span>
              </div>
              <div className="size-12 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400">
                <Brain className="size-6" />
              </div>
            </div>

          </div>

          {/* TWO MAIN GRAPH CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            
            {/* Chart Left: Weekly Study bar chart */}
            <div className="rounded-panel border border-stroke bg-surface-panel p-6 shadow-card hover:border-stroke-strong transition duration-300">
              <h3 className="text-sm font-semibold font-mono tracking-wide uppercase text-white flex items-center gap-2 mb-6">
                <Calendar className="size-4 text-brand-cyan" /> Bài học hoàn thành (7 ngày gần nhất)
              </h3>
              {renderWeeklyBarChart(stats.weekly_progress)}
            </div>

            {/* Chart Right: Shadowing accuracy trends line chart */}
            <div className="rounded-panel border border-stroke bg-surface-panel p-6 shadow-card hover:border-stroke-strong transition duration-300">
              <h3 className="text-sm font-semibold font-mono tracking-wide uppercase text-white flex items-center gap-2 mb-6">
                <TrendingUp className="size-4 text-brand-cyan" /> Xu hướng phát âm Shadowing (10 bài gần nhất)
              </h3>
              {renderShadowingLineChart(stats.shadowing_attempts)}
            </div>

          </div>

          {/* FOOTER MOTIVATIONAL CARD */}
          <div className="rounded-panel border border-stroke bg-surface-panel p-6 shadow-card relative overflow-hidden bg-gradient-to-r from-surface-panel via-surface-panel to-brand-cyan/5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="size-4 text-yellow-400 animate-spin" /> Duy trì thói quen học tập mỗi ngày!
                </h4>
                <p className="text-xs text-copy-muted">
                  Học 15 phút mỗi ngày sẽ giúp cải thiện khả năng nghe phản xạ và nhại giọng của bạn nhanh hơn 80%!
                </p>
              </div>
              
              <Button
                variant="product"
                onClick={() => router.push("/topics")}
                className="font-mono text-xs uppercase shrink-0"
              >
                Học bài mới ngay
              </Button>
            </div>
          </div>

        </div>
      )}

    </div>
  )
}
