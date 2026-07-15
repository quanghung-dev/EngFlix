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

export interface PronunciationSyllable {
  syllable: string;
  score: number;
  stressStatus: string;
}

export interface PronunciationWordAssessment {
  word: string;
  score: number;
  errorType: string;
  feedback: string;
  weakPhonemes: Array<{ phoneme: string; score: number }>;
  syllables: PronunciationSyllable[];
}

export interface PronunciationAssessmentResult {
  text: string;
  overallScore: number;
  scores: {
    accuracy: number;
    fluency: number;
    completeness: number;
    prosody: number;
    speakingRate?: number;
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

export interface StudyContentType {
  lesson: LessonType;
  category: {
    id: number;
    name: string;
  } | null;
  transcripts: TranscriptType[];
}

export interface StudyBookmarkType {
  id: number;
  user_id: string;
  transcript_id: number;
  lesson_id: number;
  note: string | null;
  created_at: string;
}

export interface StudyStateType {
  progress: Array<TranscriptProgressType | PronunciationProgressType>;
  bookmarks: StudyBookmarkType[];
  history: LearningHistoryType | null;
}
