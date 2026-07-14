"use client"

import {
  CheckCircle2,
  XCircle,
  Brain,
  Mic,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BookOpen,
  AlertTriangle
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface LessonReportStats {
  dictationAccuracy?: number
  pronunciationScore?: number
  shadowingPassedCount?: number
  shadowingTotalCount?: number
  savedWordsCount: number
  errorsCount: number
}

interface LessonReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lessonTitle: string
  stats: LessonReportStats
  onAction: (actionType: "practice-errors" | "review-words" | "redo-pronunciation" | "next-lesson") => void
}

export function LessonReportDialog({
  open,
  onOpenChange,
  lessonTitle,
  stats,
  onAction,
}: LessonReportDialogProps) {
  const showDictation = stats.dictationAccuracy !== undefined
  const showShadowing = stats.pronunciationScore !== undefined

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg border-stroke bg-canvas p-6 text-foreground shadow-modal rounded-card sm:p-8 overflow-hidden">
        {/* Glow visual background */}
        <div className="absolute -right-20 -top-20 size-40 rounded-full bg-brand-cyan/15 blur-3xl pointer-events-none" />

        <DialogHeader className="text-center sm:text-left">
          <div className="flex justify-center sm:justify-start mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-cyan/15 px-3 py-1 text-[10px] font-bold text-brand-cyan uppercase tracking-wider">
              <Sparkles className="size-3 text-action-gold animate-pulse" /> Vòng học hoàn tất!
            </span>
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            Báo cáo kết quả bài học
          </DialogTitle>
          <DialogDescription className="text-sm text-copy-muted mt-1 leading-normal">
            Bài học: <strong className="text-copy-primary">{lessonTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        {/* Stats Grid */}
        <div className="my-6 grid grid-cols-2 gap-4">
          {/* Left panel: Accuracy/Scores */}
          <div className="space-y-4">
            {showDictation && (
              <div className="p-4 rounded-panel border border-stroke-subtle bg-canvas-muted/20">
                <span className="text-[10px] font-mono text-copy-muted uppercase tracking-wider block">
                  Độ chính xác Dictation
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-mono font-bold text-brand-cyan">
                    {stats.dictationAccuracy}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-surface-inner rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-brand-cyan rounded-full"
                    style={{ width: `${stats.dictationAccuracy}%` }}
                  />
                </div>
              </div>
            )}

            {showShadowing && (
              <div className="p-4 rounded-panel border border-stroke-subtle bg-canvas-muted/20">
                <span className="text-[10px] font-mono text-copy-muted uppercase tracking-wider block">
                  Điểm phát âm (Shadowing)
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-mono font-bold text-accent-violet">
                    {stats.pronunciationScore}/100
                  </span>
                </div>
                <div className="h-1.5 w-full bg-surface-inner rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-accent-violet rounded-full"
                    style={{ width: `${stats.pronunciationScore}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right panel: Details list */}
          <div className="flex flex-col justify-between p-4 rounded-panel border border-stroke-subtle bg-canvas-muted/20 space-y-3">
            {stats.shadowingTotalCount !== undefined && (
              <div className="flex items-center gap-2.5 text-xs">
                <Mic className="size-4 text-brand-cyan shrink-0" />
                <span>
                  <strong>{stats.shadowingPassedCount}</strong> / {stats.shadowingTotalCount} câu đạt yêu cầu
                </span>
              </div>
            )}

            <div className="flex items-center gap-2.5 text-xs">
              <BookOpen className="size-4 text-action-gold shrink-0" />
              <span>
                <strong>{stats.savedWordsCount}</strong> từ mới đã lưu
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-xs">
              <AlertTriangle className="size-4 text-destructive shrink-0" />
              <span className={cn(stats.errorsCount > 0 ? "text-destructive font-semibold" : "")}>
                {stats.errorsCount} lỗi cần luyện lại
              </span>
            </div>
          </div>
        </div>

        {/* Action Panel: Next Steps */}
        <div className="space-y-2.5">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-copy-muted">
            Hành động tiếp theo
          </h4>

          <div className="grid gap-2 sm:grid-cols-2">
            {stats.errorsCount > 0 && (
              <Button
                variant="glass"
                size="sm"
                onClick={() => onAction("practice-errors")}
                className="w-full text-left justify-start gap-2 border-destructive/20 text-destructive hover:bg-destructive/5"
              >
                <RotateCcw className="size-3.5" />
                Luyện lại các câu sai
              </Button>
            )}

            {stats.savedWordsCount > 0 && (
              <Button
                variant="glass"
                size="sm"
                onClick={() => onAction("review-words")}
                className="w-full text-left justify-start gap-2 border-action-gold/20 text-action-gold hover:bg-action-gold/5"
              >
                <Brain className="size-3.5" />
                Ôn {stats.savedWordsCount} từ mới
              </Button>
            )}

            {showShadowing && stats.errorsCount > 0 && (
              <Button
                variant="glass"
                size="sm"
                onClick={() => onAction("redo-pronunciation")}
                className="w-full text-left justify-start gap-2 border-accent-violet/20 text-accent-violet hover:bg-accent-violet/5"
              >
                <Mic className="size-3.5" />
                Làm lại phát âm &lt; 70%
              </Button>
            )}

            <Button
              variant="product"
              size="sm"
              onClick={() => onAction("next-lesson")}
              className="w-full sm:col-span-2 inline-flex items-center justify-center gap-1.5"
            >
              Chuyển sang bài tiếp theo
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
