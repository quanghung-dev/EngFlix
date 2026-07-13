"use client"

import { useId } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type {
  PronunciationAttemptPoint,
  WeeklyLearningPoint,
} from "@/types/learning"

interface ChartTooltipProps {
  active?: boolean
  label?: string | number
  payload?: Array<{ value?: number; name?: string }>
  valueSuffix: string
}

function ChartTooltip({ active, label, payload, valueSuffix }: ChartTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-control border border-stroke-strong bg-canvas-deep px-3 py-2 shadow-card">
      <p className="font-mono text-[10px] uppercase tracking-wider text-copy-muted">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-brand-cyan">
        {payload[0]?.value ?? 0} {valueSuffix}
      </p>
    </div>
  )
}

function formatDay(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value))
}

interface WeeklyProgressChartProps {
  data: WeeklyLearningPoint[]
  reduceMotion: boolean
}

export function WeeklyProgressChart({ data, reduceMotion }: WeeklyProgressChartProps) {
  const summary = data
    .map((point) => `${formatDay(point.activity_date)}: ${point.lessons_completed} bài`)
    .join(", ")

  return (
    <figure aria-labelledby="weekly-chart-title" aria-describedby="weekly-chart-summary">
      <figcaption id="weekly-chart-title" className="sr-only">
        Số bài hoàn thành trong bảy ngày gần nhất
      </figcaption>
      <p id="weekly-chart-summary" className="sr-only">
        {summary || "Chưa có hoạt động học trong bảy ngày gần nhất."}
      </p>
      <div className="h-64 w-full" tabIndex={0}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ top: 12, right: 8, left: -18, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="var(--engflex-border-subtle)" />
            <XAxis
              dataKey="activity_date"
              tickFormatter={formatDay}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--engflex-text-muted)", fontSize: 11 }}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--engflex-text-muted)", fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: "var(--engflex-hover-surface)" }}
              content={<ChartTooltip valueSuffix="bài" />}
              labelFormatter={(value) => formatDay(String(value))}
            />
            <Bar
              dataKey="lessons_completed"
              name="Bài hoàn thành"
              fill="var(--engflex-brand-cyan)"
              radius={[8, 8, 2, 2]}
              isAnimationActive={!reduceMotion}
              animationDuration={650}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  )
}

interface PronunciationChartProps {
  attempts: PronunciationAttemptPoint[]
  reduceMotion: boolean
}

export function PronunciationChart({ attempts, reduceMotion }: PronunciationChartProps) {
  const gradientId = useId().replaceAll(":", "")
  const data = attempts.map((attempt, index) => ({
    ...attempt,
    label: `Lần ${index + 1}`,
  }))
  const summary = data.map((point) => `${point.label}: ${point.score} điểm`).join(", ")

  return (
    <figure aria-labelledby="pronunciation-chart-title" aria-describedby="pronunciation-chart-summary">
      <figcaption id="pronunciation-chart-title" className="sr-only">
        Điểm phát âm trong mười lần luyện gần nhất
      </figcaption>
      <p id="pronunciation-chart-summary" className="sr-only">
        {summary || "Chưa có lượt luyện phát âm để hiển thị."}
      </p>
      <div className="h-64 w-full" tabIndex={0}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{ top: 12, right: 8, left: -18, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--engflex-brand-cyan)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--engflex-brand-cyan)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--engflex-border-subtle)" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--engflex-text-muted)", fontSize: 11 }}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--engflex-text-muted)", fontSize: 11 }}
            />
            <Tooltip content={<ChartTooltip valueSuffix="điểm" />} />
            <Area
              type="monotone"
              dataKey="score"
              name="Điểm phát âm"
              stroke="var(--engflex-brand-cyan)"
              strokeWidth={3}
              fill={`url(#${gradientId})`}
              isAnimationActive={!reduceMotion}
              animationDuration={650}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </figure>
  )
}
