export interface VocabularyCategoryType {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface VocabularyDeckType {
  id: number;
  user_id: string | null;
  category_id: number | null;
  name: string;
  description: string | null;
  level: string | null;
  thumbnail_url: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  word_count?: number;
}

export interface VocabularyItemType {
  id: number;
  deck_id: number;
  lesson_id: number | null;
  transcript_id: number | null;
  phrase: string;
  normalized_phrase: string;
  meaning: string;
  example_sentence: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}
