"use client"

import { useState, useEffect } from "react"
import { useReducedMotion } from "motion/react"
import { ArrowLeft, Check, RotateCcw, Volume2, VolumeX, X } from "lucide-react"

import { useSpeech } from "@/components/learning/use-speech"
import { Button } from "@/components/ui/button"
import { getLessonById, getLessonTranscripts } from "@/services/lesson.service"
import { translatePhraseAI, reviewVocabularyItem, type AITranslationType } from "@/services/vocabulary.service"
import type { VocabularyItemType } from "@/types/vocabulary"
import { cn } from "@/lib/utils"

interface FlashcardContextDetailsProps {
  phrase: string
  lessonId: number | null
  transcriptId: number | null
  fallbackExampleSentence: string | null
  fallbackExampleTranslation: string | null
}

function FlashcardContextDetails({
  phrase,
  lessonId,
  transcriptId,
  fallbackExampleSentence,
  fallbackExampleTranslation,
}: FlashcardContextDetailsProps) {
  const [loading, setLoading] = useState(false)
  const [lesson, setLesson] = useState<any>(null)
  const [transcript, setTranscript] = useState<any>(null)
  const [aiData, setAiData] = useState<AITranslationType | null>(null)

  useEffect(() => {
    let active = true
    if (!lessonId) return

    async function loadContext() {
      setLoading(true)
      try {
        const [lessonRes, transcriptsRes] = await Promise.all([
          getLessonById(lessonId!),
          getLessonTranscripts(lessonId!)
        ])
        if (!active) return

        setLesson(lessonRes.data)
        const matched = (transcriptsRes.data || []).find((t: any) => t.id === transcriptId)
        if (matched) setTranscript(matched)
      } catch (err) {
        console.error("Failed to load flashcard context details", err)
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadContext()
    return () => {
      active = false
    }
  }, [lessonId, transcriptId])

  useEffect(() => {
    let active = true
    async function loadAI() {
      try {
        const res = await translatePhraseAI(phrase)
        if (active) setAiData(res.data)
      } catch (err) {
        console.error("Failed to fetch AI collocations for flashcard", err)
      }
    }
    void loadAI()
    return () => {
      active = false
    }
  }, [phrase])

  const getYouTubeId = (url?: string) => {
    if (!url) return null
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const videoId = lesson ? getYouTubeId(lesson.video_url) : null

  if (loading) {
    return (
      <div className="space-y-3 w-full mt-4 border-t border-stroke-subtle pt-4 animate-pulse">
        <div className="h-28 bg-surface-inner rounded-card" />
        <div className="h-4 bg-surface-inner rounded w-3/4" />
        <div className="h-4 bg-surface-inner rounded w-1/2" />
      </div>
    )
  }

  return (
    <div className="w-full mt-4 border-t border-stroke-subtle pt-4 text-left space-y-4">
      {/* Video segment player */}
      {videoId && transcript && (
        <div className="relative w-full aspect-video rounded-card overflow-hidden border border-stroke-subtle bg-canvas-deep">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?start=${Math.max(0, Math.floor(transcript.start_timestamp) - 1)}&end=${Math.ceil(transcript.end_timestamp)}&autoplay=1&controls=0&modestbranding=1&rel=0`}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; encrypted-media"
            title="Video ngữ cảnh phim"
          />
        </div>
      )}

      {/* Original Sentence */}
      {transcript && (
        <div className="space-y-1">
          <span className="text-micro uppercase tracking-meta text-brand-cyan font-semibold">Câu gốc trong phim</span>
          <p className="text-xs font-semibold text-foreground">“{transcript.content}”</p>
          {transcript.vietnamese && (
            <p className="text-micro text-copy-muted italic">Dịch: {transcript.vietnamese}</p>
          )}
          {transcript.phonetic && (
            <p className="text-micro text-copy-subtle ">Phiên âm: {transcript.phonetic}</p>
          )}
        </div>
      )}

      {/* Collocations & Challenge */}
      <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-stroke-subtle/50">
        {/* Collocations */}
        <div className="space-y-1">
          <span className="text-micro uppercase tracking-meta text-action-gold font-semibold">Cụm từ hay dùng</span>
          <p className="text-micro text-copy-secondary leading-relaxed">
            {aiData?.note || "Đang tải collocation..."}
          </p>
        </div>

        {/* New test sentence */}
        <div className="space-y-1">
          <span className="text-micro uppercase tracking-meta text-status-success font-semibold">Câu thử thách</span>
          <p className="text-micro text-foreground font-semibold">
            {aiData?.example_sentence || fallbackExampleSentence || "Đang tải câu mẫu..."}
          </p>
          {(aiData?.example_translation || fallbackExampleTranslation) && (
            <p className="text-micro text-copy-muted italic">Dịch: {aiData?.example_translation || fallbackExampleTranslation}</p>
          )}
        </div>
      </div>
    </div>
  )
}

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
  const [reviewLoading, setReviewLoading] = useState(false)

  const currentItem = items[cardIndex]
  const progress = items.length ? ((cardIndex + 1) / items.length) * 100 : 0

  function restart() {
    setCardIndex(0)
    setIsFlipped(false)
    setMasteredCount(0)
    setCompleted(false)
    stop()
  }

  async function recordResult(mastered: boolean) {
    if (reviewLoading) return
    if (mastered) setMasteredCount((count) => count + 1)
    stop()

    setReviewLoading(true)
    try {
      // Gọi API Spaced Repetition trên backend
      await reviewVocabularyItem(currentItem.deck_id, currentItem.id, mastered)
    } catch (err) {
      console.error("Failed to record spaced repetition review result:", err)
    } finally {
      setReviewLoading(false)
    }

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
        <p className="mt-6 text-xs uppercase tracking-meta text-brand-cyan">
          Vòng ôn tập hoàn tất
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-foreground">Bạn đã đi hết {items.length} thẻ</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-copy-muted">
          Bạn đã đánh dấu thuộc {masteredCount}/{items.length} từ ({percentage}%). Lịch học của bạn đã được cập nhật dựa trên thuật toán Spaced Repetition (SM-2).
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
          <p className="text-micro uppercase tracking-meta text-brand-cyan">
            Flashcard · {cardIndex + 1}/{items.length}
          </p>
          <h2 id="flashcard-title" className="mt-2 text-xl font-semibold text-foreground">{deckName}</h2>
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
          className="product-focus relative block min-h-[30rem] w-full touch-manipulation rounded-card text-left outline-none"
        >
          <div
            className="relative min-h-[30rem] w-full transition-transform duration-300 motion-reduce:transition-none [transform-style:preserve-3d]"
            style={{ transform: !reduceMotion && isFlipped ? "rotateY(180deg)" : undefined }}
          >
            <div
              aria-hidden={isFlipped}
              className={`absolute inset-0 flex flex-col items-center justify-center rounded-card border border-stroke bg-surface-panel p-8 text-center shadow-card [backface-visibility:hidden] ${
                reduceMotion && isFlipped ? "invisible" : "visible"
              }`}
            >
              <span className="text-micro uppercase tracking-meta text-copy-muted">Từ / cụm từ</span>
              <strong className="mt-5 text-balance text-4xl font-semibold text-foreground sm:text-5xl">{currentItem.phrase}</strong>
              {currentItem.note && <span className="mt-4 text-sm text-copy-muted">{currentItem.note}</span>}
              <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-copy-muted">Chạm hoặc nhấn Enter để xem nghĩa</span>
            </div>

            <div
              aria-hidden={!isFlipped}
              className={`absolute inset-0 flex flex-col items-center rounded-card border border-brand-cyan/30 bg-canvas-deep p-6 text-center shadow-card [backface-visibility:hidden] overflow-y-auto ${
                reduceMotion ? (isFlipped ? "visible" : "invisible") : "[transform:rotateY(180deg)]"
              }`}
            >
              <span className="text-micro uppercase tracking-meta text-brand-cyan">Nghĩa</span>
              <strong className="mt-3 text-balance text-2xl font-semibold text-foreground">{currentItem.meaning}</strong>

              {isFlipped && (
                <FlashcardContextDetails
                  phrase={currentItem.phrase}
                  lessonId={currentItem.lesson_id}
                  transcriptId={currentItem.transcript_id}
                  fallbackExampleSentence={currentItem.example_sentence}
                  fallbackExampleTranslation={currentItem.example_translation}
                />
              )}

              <span className="block mt-4 text-xs text-copy-muted">Chạm để lật lại</span>
            </div>
          </div>
        </button>
      </div>

      <div className="mt-6 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <Button
          variant="glass"
          size="app"
          disabled={!supported}
          onClick={() => (isSpeaking ? stop() : speak(currentItem.phrase))}
        >
          {isSpeaking ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
          {isSpeaking ? "Dừng phát âm" : "Nghe phát âm"}
        </Button>
        <div className="grid grid-cols-2 gap-3 min-w-[200px]">
          <Button variant="glass" size="app" disabled={reviewLoading} onClick={() => recordResult(false)}>Chưa thuộc</Button>
          <Button variant="product" size="app" disabled={reviewLoading} onClick={() => recordResult(true)}>Đã thuộc</Button>
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-copy-muted" aria-live="polite">
        Đã thuộc {masteredCount} từ trong vòng này.
      </p>
    </section>
  )
}
