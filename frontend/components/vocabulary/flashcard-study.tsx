"use client"

import { useState } from "react"
import { useReducedMotion } from "motion/react"
import { ArrowLeft, Check, RotateCcw, Volume2, VolumeX, X } from "lucide-react"

import { useSpeech } from "@/components/learning/use-speech"
import { Button } from "@/components/ui/button"
import type { VocabularyItemType } from "@/types/vocabulary"

interface FlashcardStudyProps {
  deckName: string
  items: VocabularyItemType[]
  onExit: () => void
}

export function FlashcardStudy({ deckName, items, onExit }: FlashcardStudyProps) {
  const reduceMotion = Boolean(useReducedMotion())
  const { isSpeaking, speak, stop, supported } = useSpeech()
  const [cardIndex, setCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [masteredCount, setMasteredCount] = useState(0)
  const [completed, setCompleted] = useState(false)

  const currentItem = items[cardIndex]
  const progress = items.length ? ((cardIndex + 1) / items.length) * 100 : 0

  function restart() {
    setCardIndex(0)
    setIsFlipped(false)
    setMasteredCount(0)
    setCompleted(false)
    stop()
  }

  function recordResult(mastered: boolean) {
    if (mastered) setMasteredCount((count) => count + 1)
    stop()

    if (cardIndex >= items.length - 1) {
      setCompleted(true)
      return
    }

    setCardIndex((index) => index + 1)
    setIsFlipped(false)
  }

  if (!currentItem) return null

  if (completed) {
    const percentage = Math.round((masteredCount / items.length) * 100)
    return (
      <section className="mx-auto flex min-h-[32rem] max-w-2xl flex-col items-center justify-center text-center">
        <div className="flex size-16 items-center justify-center rounded-full border border-status-success/30 bg-status-success/10 text-status-success">
          <Check className="size-7" aria-hidden="true" />
        </div>
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-brand-cyan">
          Vòng ôn tập hoàn tất
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Bạn đã đi hết {items.length} thẻ</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-copy-muted">
          Bạn đánh dấu đã thuộc {masteredCount}/{items.length} từ ({percentage}%). Kết quả này chỉ dùng
          trong vòng học hiện tại và chưa được lưu vào hồ sơ.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button variant="glass" size="app" onClick={onExit}>
            <ArrowLeft aria-hidden="true" />
            Về danh sách từ
          </Button>
          <Button variant="product" size="app" onClick={restart}>
            <RotateCcw aria-hidden="true" />
            Ôn lại từ đầu
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section aria-labelledby="flashcard-title" className="mx-auto max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-cyan">
            Flashcard · {cardIndex + 1}/{items.length}
          </p>
          <h2 id="flashcard-title" className="mt-2 text-xl font-semibold text-white">{deckName}</h2>
        </div>
        <Button variant="ghost" size="icon-app" onClick={onExit} aria-label="Thoát chế độ flashcard">
          <X aria-hidden="true" />
        </Button>
      </div>

      <div
        className="mt-5 h-1.5 overflow-hidden rounded-full bg-surface-inner"
        role="progressbar"
        aria-label="Tiến độ flashcard"
        aria-valuemin={0}
        aria-valuemax={items.length}
        aria-valuenow={cardIndex + 1}
      >
        <div
          className="h-full rounded-full bg-brand-cyan transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-8 [perspective:1200px]">
        <button
          type="button"
          onClick={() => setIsFlipped((value) => !value)}
          aria-pressed={isFlipped}
          aria-label={isFlipped ? "Đang xem nghĩa. Lật về mặt từ vựng" : "Đang xem từ vựng. Lật để xem nghĩa"}
          className="product-focus relative block min-h-[22rem] w-full touch-manipulation rounded-card text-left"
        >
          <div
            className="relative min-h-[22rem] w-full transition-transform duration-300 motion-reduce:transition-none [transform-style:preserve-3d]"
            style={{ transform: !reduceMotion && isFlipped ? "rotateY(180deg)" : undefined }}
          >
            <div
              aria-hidden={isFlipped}
              className={`absolute inset-0 flex flex-col items-center justify-center rounded-card border border-stroke bg-surface-panel p-8 text-center shadow-card [backface-visibility:hidden] ${
                reduceMotion && isFlipped ? "invisible" : "visible"
              }`}
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-copy-muted">Từ / cụm từ</span>
              <strong className="mt-5 text-balance text-4xl font-semibold text-white sm:text-5xl">{currentItem.phrase}</strong>
              {currentItem.note && <span className="mt-4 font-mono text-sm text-copy-muted">{currentItem.note}</span>}
              <span className="absolute bottom-6 text-xs text-copy-muted">Chạm hoặc nhấn Enter để xem nghĩa</span>
            </div>

            <div
              aria-hidden={!isFlipped}
              className={`absolute inset-0 flex flex-col items-center justify-center rounded-card border border-brand-cyan/30 bg-canvas-deep p-8 text-center shadow-card [backface-visibility:hidden] ${
                reduceMotion ? (isFlipped ? "visible" : "invisible") : "[transform:rotateY(180deg)]"
              }`}
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand-cyan">Nghĩa</span>
              <strong className="mt-5 text-balance text-3xl font-semibold text-white">{currentItem.meaning}</strong>
              {currentItem.example_sentence && (
                <p className="mt-6 max-w-lg border-t border-stroke-subtle pt-5 text-sm italic leading-6 text-copy-secondary">
                  “{currentItem.example_sentence}”
                </p>
              )}
              <span className="absolute bottom-6 text-xs text-copy-muted">Chạm hoặc nhấn Enter để lật lại</span>
            </div>
          </div>
        </button>
      </div>

      <div className="mt-5 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <Button
          variant="glass"
          size="app"
          disabled={!supported}
          onClick={() => (isSpeaking ? stop() : speak(currentItem.phrase))}
        >
          {isSpeaking ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
          {isSpeaking ? "Dừng phát âm" : "Nghe phát âm"}
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="glass" size="app" onClick={() => recordResult(false)}>Chưa thuộc</Button>
          <Button variant="product" size="app" onClick={() => recordResult(true)}>Đã thuộc</Button>
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-copy-muted" aria-live="polite">
        Đã thuộc {masteredCount} từ trong vòng này.
      </p>
    </section>
  )
}
