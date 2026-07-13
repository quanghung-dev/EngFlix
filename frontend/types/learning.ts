export interface BookmarkPageQuery {
  page?: number
  limit?: number
}

export interface WeeklyLearningPoint {
  activity_date: string
  lessons_completed: number
}

export interface PronunciationAttemptPoint {
  id: number
  score: number
  created_at: string
}

export interface ProgressStats {
  streak: number
  total_lessons: number
  /** Estimated from completed lessons; this is not measured session time. */
  total_minutes: number
  weekly_progress: WeeklyLearningPoint[]
  shadowing_attempts: PronunciationAttemptPoint[]
  total_words: number
}

export interface QuizQuestion {
  id: number
  phrase: string
  meaning: string
  note: string | null
  example_sentence: string | null
  choices: string[]
}

export type QuizSource = "personal" | "sample"

export interface QuizPayload {
  questions: QuizQuestion[]
  source: QuizSource
}

export type QuizMode = "timed" | "untimed"

export interface QuizAnswer {
  questionId: number
  selectedAnswer: string | null
  correctAnswer: string
  isCorrect: boolean
  timedOut: boolean
}
