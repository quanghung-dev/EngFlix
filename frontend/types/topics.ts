import type { CategoryType } from "@/types/category"
import type { LessonType } from "@/types/lesson"

export interface TopicsCategoryType extends CategoryType {
  lessons: LessonType[]
  total_lessons: number
}

export interface TopicsOverviewType {
  categories: TopicsCategoryType[]
  lessons: LessonType[]
  total_lessons: number
}
