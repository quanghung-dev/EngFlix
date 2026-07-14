"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  CheckCircle2,
  Clock3,
  Gauge,
  Library,
  RefreshCw,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
} from "lucide-react"

import { useSpeech } from "@/components/learning/use-speech"
import { AsyncContentState } from "@/components/product/async-content-state"
import { ProductPageHeader } from "@/components/product/page-header"
import { ProductReveal } from "@/components/product/product-reveal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { useAuthenticatedUser } from "@/hooks/use-authenticated-user"
import { cn } from "@/lib/utils"
import { getVocabularyQuiz } from "@/services/vocabulary.service"
import type {
  QuizAnswer,
  QuizMode,
  QuizQuestion,
  QuizSource,
} from "@/types/learning"

type QuizState = "loading" | "intro" | "playing" | "finished" | "error"

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { error?: { message?: unknown } } } }).response
    const message = response?.data?.error?.message
    if (typeof message === "string" && message.trim()) return message
  }
  return "Không thể tải bộ câu hỏi lúc này. Vui lòng thử lại."
}

function normalizeQuestions(questions: QuizQuestion[]) {
  return questions
    .map((question) => {
      const uniqueChoices = Array.from(
        new Map(
          [...question.choices, question.meaning]
            .map((choice) => choice.trim())
            .filter(Boolean)
            .map((choice) => [choice.toLocaleLowerCase("vi"), choice])
        ).values()
      )

      return {
        ...question,
        phrase: question.phrase.trim(),
        meaning: question.meaning.trim(),
        choices: uniqueChoices,
      }
    })
    .filter((question) => question.phrase && question.meaning && question.choices.length >= 2)
}

export function VocabularyQuizWorkspace() {
  const { user, resolved } = useAuthenticatedUser({ required: true })
  const { isSpeaking, speak, stop, supported } = useSpeech()
  const quizRequestId = useRef(0)

  const [quizState, setQuizState] = useState<QuizState>("loading")
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [source, setSource] = useState<QuizSource>("sample")
  const [mode, setMode] = useState<QuizMode>("timed")
  const [ttsEnabled, setTtsEnabled] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [timeLeft, setTimeLeft] = useState(10)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswer[]>([])
  const [showReview, setShowReview] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentQuestion = questions[currentIndex]
  const progress = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0
  const sourceLabel = source === "personal" ? "Bộ từ cá nhân" : "Bộ câu hỏi mẫu"

  const loadQuiz = useCallback(async () => {
    const requestId = ++quizRequestId.current
    setQuizState("loading")
    setError(null)
    stop()

    try {
      const response = await getVocabularyQuiz()
      if (requestId !== quizRequestId.current) return
      const nextQuestions = normalizeQuestions(response.data.questions)
      setQuestions(nextQuestions)
      setSource(response.data.source)
      setCurrentIndex(0)
      setSelectedAnswer(null)
      setIsAnswered(false)
      setScore(0)
      setAnswers([])
      setShowReview(false)
      setTimeLeft(10)
      setQuizState("intro")
    } catch (loadError) {
      if (requestId !== quizRequestId.current) return
      setError(getErrorMessage(loadError))
      setQuizState("error")
    }
  }, [stop])

  useEffect(() => {
    if (!resolved || !user) return
    const kickoff = window.setTimeout(() => void loadQuiz(), 0)
    return () => {
      window.clearTimeout(kickoff)
      quizRequestId.current += 1
    }
  }, [loadQuiz, resolved, user])

  const answerQuestion = useCallback((choice: string | null, timedOut = false) => {
    const question = questions[currentIndex]
    if (!question || isAnswered) return

    const isCorrect = choice === question.meaning
    setSelectedAnswer(choice)
    setIsAnswered(true)
    if (isCorrect) setScore((value) => value + 1)
    setAnswers((currentAnswers) => [
      ...currentAnswers,
      {
        questionId: question.id,
        selectedAnswer: choice,
        correctAnswer: question.meaning,
        isCorrect,
        timedOut,
      },
    ])
  }, [currentIndex, isAnswered, questions])

  useEffect(() => {
    if (quizState !== "playing" || mode !== "timed" || isAnswered) return

    const timeoutId = window.setTimeout(() => {
      if (timeLeft <= 1) {
        setTimeLeft(0)
        answerQuestion(null, true)
      } else {
        setTimeLeft((value) => value - 1)
      }
    }, 1000)

    return () => window.clearTimeout(timeoutId)
  }, [answerQuestion, isAnswered, mode, quizState, timeLeft])

  useEffect(() => {
    if (quizState === "playing" && ttsEnabled && currentQuestion) {
      speak(currentQuestion.phrase)
    }
    return stop
  }, [currentQuestion, quizState, speak, stop, ttsEnabled])

  function resetRun() {
    stop()
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setIsAnswered(false)
    setTimeLeft(10)
    setScore(0)
    setAnswers([])
    setShowReview(false)
  }

  function startQuiz() {
    resetRun()
    setQuizState("playing")
  }

  function restartQuiz() {
    resetRun()
    setQuizState("intro")
  }

  function moveNext() {
    stop()
    if (currentIndex >= questions.length - 1) {
      setQuizState("finished")
      return
    }

    setCurrentIndex((index) => index + 1)
    setSelectedAnswer(null)
    setIsAnswered(false)
    setTimeLeft(10)
  }

  function toggleTts() {
    setTtsEnabled((enabled) => {
      if (enabled) stop()
      return !enabled
    })
  }

  const answerFeedback = useMemo(() => {
    if (!isAnswered || !currentQuestion) return null
    if (selectedAnswer === currentQuestion.meaning) {
      return { correct: true, message: "Chính xác. Bạn đã nối đúng từ với nghĩa." }
    }
    if (selectedAnswer === null) {
      return { correct: false, message: `Hết giờ. Đáp án đúng là “${currentQuestion.meaning}”.` }
    }
    return { correct: false, message: `Chưa đúng. Đáp án đúng là “${currentQuestion.meaning}”.` }
  }, [currentQuestion, isAnswered, selectedAnswer])

  return (
    <div className="mx-auto w-full max-w-[1280px] px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
      <ProductReveal eager>
        <ProductPageHeader
          eyebrow={<><Brain className="size-4" aria-hidden="true" /> Active recall</>}
          title="Luyện phản xạ từ vựng"
          description="Chọn nghĩa đúng, nghe lại phát âm và xem ngay lý do đúng hoặc sai. Bạn có thể dùng nhịp 10 giây hoặc luyện không giới hạn thời gian."
          actions={
            <Button nativeButton={false} render={<Link href="/vocabulary" />} variant="glass" size="app">
              <ArrowLeft aria-hidden="true" />
              Về kho từ vựng
            </Button>
          }
          aside={
            quizState !== "loading" && quizState !== "error" ? (
              <Badge variant="outline" className="px-4 py-2 text-sm">{sourceLabel}</Badge>
            ) : undefined
          }
        />
      </ProductReveal>

      <ProductReveal eager delay={0.07} className="mt-10">
        {!resolved || (resolved && !user) || quizState === "loading" ? (
          <AsyncContentState
            kind="loading"
            title={!resolved ? "Đang xác nhận tài khoản" : "Đang chuẩn bị bộ câu hỏi"}
            description="EngFlex đang chọn các câu hỏi hợp lệ và loại bỏ đáp án trùng nhau."
          />
        ) : quizState === "error" ? (
          <AsyncContentState
            kind="error"
            title="Chưa thể bắt đầu quiz"
            description={error ?? "Không thể tải bộ câu hỏi lúc này."}
            onRetry={() => void loadQuiz()}
          />
        ) : quizState === "intro" ? (
          questions.length === 0 ? (
            <AsyncContentState
              kind="empty"
              title="Chưa có câu hỏi hợp lệ"
              description="Hãy thêm từ có nghĩa rõ ràng vào bộ cá nhân, hoặc thử tải lại bộ câu hỏi mẫu."
              action={
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button nativeButton={false} render={<Link href="/vocabulary" />} variant="product" size="app">
                    <Library aria-hidden="true" />
                    Mở kho từ vựng
                  </Button>
                  <Button variant="glass" size="app" onClick={() => void loadQuiz()}>
                    <RefreshCw aria-hidden="true" />
                    Tải lại
                  </Button>
                </div>
              }
            />
          ) : (
            <QuizIntro
              questionCount={questions.length}
              source={source}
              mode={mode}
              ttsEnabled={ttsEnabled}
              speechSupported={supported}
              onModeChange={setMode}
              onToggleTts={toggleTts}
              onStart={startQuiz}
            />
          )
        ) : quizState === "playing" && currentQuestion ? (
          <QuizPlaying
            question={currentQuestion}
            currentIndex={currentIndex}
            total={questions.length}
            progress={progress}
            score={score}
            mode={mode}
            timeLeft={timeLeft}
            selectedAnswer={selectedAnswer}
            isAnswered={isAnswered}
            answerFeedback={answerFeedback}
            ttsEnabled={ttsEnabled}
            isSpeaking={isSpeaking}
            speechSupported={supported}
            onToggleTts={toggleTts}
            onReplay={() => (isSpeaking ? stop() : speak(currentQuestion.phrase))}
            onAnswer={(choice) => answerQuestion(choice)}
            onNext={moveNext}
          />
        ) : (
          <QuizFinished
            questions={questions}
            answers={answers}
            score={score}
            source={source}
            showReview={showReview}
            onToggleReview={() => setShowReview((value) => !value)}
            onRetry={restartQuiz}
            onReload={() => void loadQuiz()}
          />
        )}
      </ProductReveal>
    </div>
  )
}

interface QuizIntroProps {
  questionCount: number
  source: QuizSource
  mode: QuizMode
  ttsEnabled: boolean
  speechSupported: boolean
  onModeChange: (mode: QuizMode) => void
  onToggleTts: () => void
  onStart: () => void
}

function QuizIntro({
  questionCount,
  source,
  mode,
  ttsEnabled,
  speechSupported,
  onModeChange,
  onToggleTts,
  onStart,
}: QuizIntroProps) {
  return (
    <Card variant="product" className="mx-auto max-w-4xl">
      <CardHeader className="items-center text-center">
        <span className="grid size-16 place-items-center rounded-full border border-brand-cyan/20 bg-brand-cyan/10 text-brand-cyan">
          <Brain className="size-7" aria-hidden="true" />
        </span>
        <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-brand-cyan">Sẵn sàng luyện</p>
        <h2 className="mt-2 text-3xl font-semibold text-foreground">{questionCount} câu hỏi phản xạ</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-copy-muted sm:text-base">
          {source === "personal"
            ? "Câu hỏi được tạo từ các bộ từ cá nhân của bạn."
            : "Bạn chưa có đủ từ cá nhân, vì vậy lần này EngFlex dùng bộ câu hỏi mẫu."}
        </p>
      </CardHeader>

      <CardContent className="mt-2 space-y-7">
        <fieldset>
          <legend className="text-sm font-semibold text-foreground">Chọn nhịp làm bài</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant={mode === "timed" ? "product" : "glass"}
              size="app"
              className="h-auto min-h-20 justify-start px-5 text-left"
              aria-pressed={mode === "timed"}
              onClick={() => onModeChange("timed")}
            >
              <Clock3 aria-hidden="true" />
              <span>
                <span className="block">10 giây mỗi câu</span>
                <span className="mt-1 block text-xs font-normal opacity-75">Luyện tốc độ nhận diện nghĩa.</span>
              </span>
            </Button>
            <Button
              type="button"
              variant={mode === "untimed" ? "product" : "glass"}
              size="app"
              className="h-auto min-h-20 justify-start px-5 text-left"
              aria-pressed={mode === "untimed"}
              onClick={() => onModeChange("untimed")}
            >
              <Gauge aria-hidden="true" />
              <span>
                <span className="block">Không giới hạn</span>
                <span className="mt-1 block text-xs font-normal opacity-75">Tập trung vào độ chính xác.</span>
              </span>
            </Button>
          </div>
        </fieldset>

        <div className="flex flex-col gap-4 rounded-panel border border-stroke bg-surface-inner p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-foreground">Tự động phát âm từ</p>
            <p className="mt-1 text-sm leading-6 text-copy-muted">Bạn vẫn có thể phát lại từng từ trong lúc làm bài.</p>
          </div>
          <Button
            type="button"
            variant={ttsEnabled ? "product" : "glass"}
            size="app"
            aria-pressed={ttsEnabled}
            disabled={!speechSupported}
            onClick={onToggleTts}
          >
            {ttsEnabled ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
            {speechSupported ? (ttsEnabled ? "Đang bật" : "Đang tắt") : "Trình duyệt không hỗ trợ"}
          </Button>
        </div>
      </CardContent>

      <CardFooter className="justify-center border-stroke bg-surface-inner/60">
        <Button variant="product" size="app" onClick={onStart}>
          Bắt đầu luyện
          <ArrowRight aria-hidden="true" />
        </Button>
      </CardFooter>
    </Card>
  )
}

interface QuizPlayingProps {
  question: QuizQuestion
  currentIndex: number
  total: number
  progress: number
  score: number
  mode: QuizMode
  timeLeft: number
  selectedAnswer: string | null
  isAnswered: boolean
  answerFeedback: { correct: boolean; message: string } | null
  ttsEnabled: boolean
  isSpeaking: boolean
  speechSupported: boolean
  onToggleTts: () => void
  onReplay: () => void
  onAnswer: (choice: string) => void
  onNext: () => void
}

function QuizPlaying({
  question,
  currentIndex,
  total,
  progress,
  score,
  mode,
  timeLeft,
  selectedAnswer,
  isAnswered,
  answerFeedback,
  ttsEnabled,
  isSpeaking,
  speechSupported,
  onToggleTts,
  onReplay,
  onAnswer,
  onNext,
}: QuizPlayingProps) {
  return (
    <Card variant="product" className="mx-auto max-w-4xl">
      <CardHeader className="gap-5 border-b border-stroke-subtle pb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs uppercase tracking-[0.14em] text-copy-muted">
          <span>Câu {currentIndex + 1} / {total}</span>
          <span className="text-status-success">Đúng {score}</span>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-surface-inner"
          role="progressbar"
          aria-label="Tiến độ bài quiz"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={currentIndex + 1}
        >
          <div
            className="h-full rounded-full bg-brand-cyan transition-[width] duration-300 motion-reduce:transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {mode === "timed" ? (
            <div
              className={cn(
                "flex min-h-11 items-center gap-2 rounded-control border px-4 font-mono text-sm",
                timeLeft <= 3 ? "border-action-gold/30 bg-action-gold/10 text-action-gold" : "border-stroke bg-surface-inner text-brand-cyan"
              )}
              aria-live={timeLeft <= 5 ? "polite" : "off"}
              aria-atomic="true"
            >
              <Clock3 aria-hidden="true" />
              Còn {timeLeft} giây
            </div>
          ) : (
            <div className="flex min-h-11 items-center gap-2 rounded-control border border-stroke bg-surface-inner px-4 text-sm text-copy-muted">
              <Gauge aria-hidden="true" /> Không giới hạn thời gian
            </div>
          )}
          <div className="flex gap-2">
            <Button
              variant={ttsEnabled ? "product" : "glass"}
              size="icon-app"
              aria-label={ttsEnabled ? "Tắt tự động phát âm" : "Bật tự động phát âm"}
              aria-pressed={ttsEnabled}
              disabled={!speechSupported}
              onClick={onToggleTts}
            >
              {ttsEnabled ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
            </Button>
            <Button
              variant="glass"
              size="icon-app"
              aria-label={isSpeaking ? "Dừng phát âm" : `Phát lại ${question.phrase}`}
              disabled={!speechSupported}
              onClick={onReplay}
            >
              {isSpeaking ? <VolumeX aria-hidden="true" /> : <RotateCcw aria-hidden="true" />}
            </Button>
          </div>
        </div>

        <div className="rounded-card border border-brand-cyan/20 bg-canvas-deep p-7 text-center sm:p-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-cyan">Chọn nghĩa đúng của từ</p>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{question.phrase}</h2>
          {question.note && <p className="mt-4 font-mono text-sm text-copy-muted">{question.note}</p>}
        </div>

        <div className="grid gap-3 sm:grid-cols-2" aria-label="Các đáp án">
          {question.choices.map((choice, index) => {
            const isCorrectChoice = choice === question.meaning
            const isSelected = choice === selectedAnswer
            return (
              <Button
                key={`${choice}-${index}`}
                type="button"
                variant="glass"
                size="app"
                disabled={isAnswered}
                onClick={() => onAnswer(choice)}
                className={cn(
                  "h-auto min-h-16 justify-between whitespace-normal px-5 py-4 text-left leading-6",
                  isAnswered && isCorrectChoice && "border-status-success/50 bg-status-success/10 text-status-success opacity-100",
                  isAnswered && isSelected && !isCorrectChoice && "border-destructive/50 bg-destructive/10 text-destructive opacity-100",
                  isAnswered && !isSelected && !isCorrectChoice && "opacity-45"
                )}
              >
                <span>{choice}</span>
                {isAnswered && isCorrectChoice && <Check className="size-5" aria-hidden="true" />}
                {isAnswered && isSelected && !isCorrectChoice && <X className="size-5" aria-hidden="true" />}
              </Button>
            )
          })}
        </div>

        {answerFeedback && (
          <div
            role="status"
            aria-live="polite"
            className={cn(
              "flex items-start gap-3 rounded-control border p-4 text-sm leading-6",
              answerFeedback.correct
                ? "border-status-success/30 bg-status-success/10 text-status-success"
                : "border-destructive/30 bg-destructive/10 text-destructive"
            )}
          >
            {answerFeedback.correct ? <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden="true" /> : <X className="mt-0.5 size-5 shrink-0" aria-hidden="true" />}
            <span>{answerFeedback.message}</span>
          </div>
        )}
      </CardContent>

      {isAnswered && (
        <CardFooter className="justify-end border-stroke bg-surface-inner/60">
          <Button variant="product" size="app" onClick={onNext} autoFocus>
            {currentIndex + 1 < total ? "Câu tiếp theo" : "Xem kết quả"}
            <ArrowRight aria-hidden="true" />
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

interface QuizFinishedProps {
  questions: QuizQuestion[]
  answers: QuizAnswer[]
  score: number
  source: QuizSource
  showReview: boolean
  onToggleReview: () => void
  onRetry: () => void
  onReload: () => void
}

function QuizFinished({
  questions,
  answers,
  score,
  source,
  showReview,
  onToggleReview,
  onRetry,
  onReload,
}: QuizFinishedProps) {
  const percentage = questions.length ? Math.round((score / questions.length) * 100) : 0

  return (
    <div className="space-y-7">
      <Card variant="product" className="mx-auto max-w-4xl">
        <CardHeader className="items-center text-center">
          <span className="grid size-16 place-items-center rounded-full border border-status-success/25 bg-status-success/10 text-status-success">
            <CheckCircle2 className="size-7" aria-hidden="true" />
          </span>
          <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-status-success">Hoàn thành</p>
          <h2 className="mt-2 text-3xl font-semibold text-foreground">Bạn trả lời đúng {score}/{questions.length} câu</h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-copy-muted sm:text-base">
            Kết quả {percentage}% từ {source === "personal" ? "bộ từ cá nhân" : "bộ câu hỏi mẫu"}. Xem lại các câu chưa đúng trước khi bắt đầu lượt luyện tiếp theo.
          </p>
        </CardHeader>
        <CardContent>
          <div className="mx-auto max-w-lg">
            <div className="flex justify-between font-mono text-xs text-copy-muted">
              <span>Độ chính xác</span>
              <span>{percentage}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-inner" role="progressbar" aria-label="Độ chính xác" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage}>
              <div className="h-full rounded-full bg-status-success transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${percentage}%` }} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-wrap justify-center gap-3 border-stroke bg-surface-inner/60">
          <Button variant="product" size="app" onClick={onRetry}>
            <RotateCcw aria-hidden="true" /> Luyện lại
          </Button>
          <Button variant="glass" size="app" onClick={onToggleReview}>
            <Library aria-hidden="true" /> {showReview ? "Ẩn đáp án" : "Xem lại đáp án"}
          </Button>
          <Button variant="ghost" size="app" onClick={onReload}>
            <RefreshCw aria-hidden="true" /> Bộ câu hỏi mới
          </Button>
        </CardFooter>
      </Card>

      {showReview && (
        <section aria-labelledby="quiz-review-title" className="space-y-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-cyan">Review</p>
            <h2 id="quiz-review-title" className="mt-2 text-2xl font-semibold text-foreground">Xem lại từng câu</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {questions.map((question, index) => {
              const answer = answers.find((item) => item.questionId === question.id)
              return (
                <Card key={`${question.id}-${index}`} variant="inner">
                  <CardContent>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-copy-muted">Câu {index + 1}</p>
                        <h3 className="mt-2 text-xl font-semibold text-foreground">{question.phrase}</h3>
                      </div>
                      {answer?.isCorrect ? (
                        <CheckCircle2 className="size-5 text-status-success" aria-label="Trả lời đúng" />
                      ) : (
                        <X className="size-5 text-destructive" aria-label="Trả lời sai" />
                      )}
                    </div>
                    <dl className="mt-5 space-y-3 text-sm leading-6">
                      <div>
                        <dt className="text-copy-muted">Bạn chọn</dt>
                        <dd className={answer?.isCorrect ? "text-status-success" : "text-destructive"}>
                          {answer?.timedOut ? "Không trả lời (hết giờ)" : answer?.selectedAnswer ?? "Không trả lời"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-copy-muted">Đáp án đúng</dt>
                        <dd className="text-foreground">{question.meaning}</dd>
                      </div>
                      {question.example_sentence && (
                        <div>
                          <dt className="text-copy-muted">Ví dụ</dt>
                          <dd className="italic text-copy-secondary">“{question.example_sentence}”</dd>
                          {question.example_translation && (
                            <dd className="text-xs text-copy-muted italic mt-0.5">Dịch: {question.example_translation}</dd>
                          )}
                        </div>
                      )}
                    </dl>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
