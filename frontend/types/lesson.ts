export interface LessonType {
  id: number;
  category_id: number | null;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  level: string;
  duration: number;
  created_at: string;
  is_complete?: boolean;
}