export interface LessonType {
  id: number;
  category_id: number | null;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url?: string;
  level: string;
  duration: number;
  created_at: string;
  is_complete?: boolean;
}

export interface TranscriptType {
  id: number;
  lesson_id: number;
  sequence: number;
  content: string;
  vietnamese: string | null;
  start_timestamp: number;
  end_timestamp: number;
  phonetic: string | null;
}

export interface TranscriptProgressType {
  user_id: string;
  lesson_id: number;
  transcript_id: number;
  completed_at: string;
}

export interface LearningHistoryType {
  id: number;
  user_id: string;
  lesson_id: number;
  completed_dictation: boolean;
  completed_pronunciation: boolean | null;
  updated_at: string;
}

export interface PronunciationWordAssessment {
  word: string;
  score: number;
  feedback: string;
  weakPhonemes: Array<{ phoneme: string; score: number }>;
}

export interface PronunciationAssessmentResult {
  text: string;
  overallScore: number;
  scores: {
    accuracy: number;
    fluency: number;
    completeness: number;
    prosody: number;
  };
  feedback: string;
  words: PronunciationWordAssessment[];
  attempt: {
    id: number;
    userId: string;
    lessonId: number;
    transcriptId: number;
    createdAt: string;
  };
}

export interface PronunciationProgressType {
  id: number;
  user_id: string;
  lesson_id: number;
  transcript_id: number;
  best_attempt_id: number;
  best_score: number;
  feedback: string | null;
  created_at: string;
  updated_at: string;
}
