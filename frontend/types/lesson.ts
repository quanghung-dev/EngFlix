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
