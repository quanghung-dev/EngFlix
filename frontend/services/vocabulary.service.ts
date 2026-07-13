import { apiRequest } from "@/lib/api-client"
import { PagedResponse, DataResponse } from "@/types/api"
import {
  VocabularyCategoryType,
  VocabularyDeckType,
  VocabularyItemType
} from "@/types/vocabulary"
import type { QuizPayload, QuizQuestion } from "@/types/learning"

// Tải danh mục từ vựng
export async function getVocabularyCategories(): Promise<PagedResponse<VocabularyCategoryType>> {
  try {
    return await apiRequest<PagedResponse<VocabularyCategoryType>>("vocabulary-categories")
  } catch (error) {
    console.error("Không thể tải danh mục từ vựng", error)
    throw error
  }
}

// Tải danh sách các bộ từ vựng mặc định (System Decks)
export async function getVocabularyDecks(params?: {
  category_id?: number
  page?: number
  limit?: number
}): Promise<PagedResponse<VocabularyDeckType>> {
  try {
    const queryParams = new URLSearchParams()
    if (params) {
      if (params.category_id !== undefined) queryParams.append("category_id", params.category_id.toString())
      if (params.page !== undefined) queryParams.append("page", params.page.toString())
      if (params.limit !== undefined) queryParams.append("limit", params.limit.toString())
    }
    const queryString = queryParams.toString()
    const url = queryString ? `vocabulary-decks?${queryString}` : "vocabulary-decks"
    return await apiRequest<PagedResponse<VocabularyDeckType>>(url)
  } catch (error) {
    console.error("Không thể tải danh sách bộ từ vựng", error)
    throw error
  }
}

// Tải bộ từ vựng cá nhân của người dùng (My Decks)
export async function getMyVocabularyDecks(params?: {
  page?: number
  limit?: number
}): Promise<PagedResponse<VocabularyDeckType>> {
  try {
    const queryParams = new URLSearchParams()
    if (params) {
      if (params.page !== undefined) queryParams.append("page", params.page.toString())
      if (params.limit !== undefined) queryParams.append("limit", params.limit.toString())
    }
    const queryString = queryParams.toString()
    const url = queryString ? `vocabulary-decks/mine?${queryString}` : "vocabulary-decks/mine"
    return await apiRequest<PagedResponse<VocabularyDeckType>>(url)
  } catch (error) {
    console.error("Không thể tải danh sách bộ từ vựng cá nhân", error)
    throw error
  }
}

// Tạo mới một bộ từ vựng cá nhân
export async function createVocabularyDeck(params: {
  name: string
  description?: string
  category_id?: number
  level?: string
}): Promise<DataResponse<VocabularyDeckType>> {
  try {
    return await apiRequest<DataResponse<VocabularyDeckType>>("vocabulary-decks", {
      method: "POST",
      body: JSON.stringify(params)
    })
  } catch (error) {
    console.error("Không thể tạo bộ từ vựng mới", error)
    throw error
  }
}

// Cập nhật thông tin bộ từ vựng
export async function updateVocabularyDeck(
  id: number,
  params: { name: string; description?: string; category_id?: number; level?: string }
): Promise<DataResponse<VocabularyDeckType>> {
  try {
    return await apiRequest<DataResponse<VocabularyDeckType>>(`vocabulary-decks/${id}`, {
      method: "PUT",
      body: JSON.stringify(params)
    })
  } catch (error) {
    console.error(`Không thể cập nhật bộ từ vựng ID = ${id}`, error)
    throw error
  }
}

// Xóa bộ từ vựng
export async function deleteVocabularyDeck(id: number): Promise<DataResponse<VocabularyDeckType>> {
  try {
    return await apiRequest<DataResponse<VocabularyDeckType>>(`vocabulary-decks/${id}`, {
      method: "DELETE"
    })
  } catch (error) {
    console.error(`Không thể xóa bộ từ vựng ID = ${id}`, error)
    throw error
  }
}

// Tải danh sách từ vựng trong bộ từ
export async function getVocabularyItems(
  deckId: number,
  params?: { page?: number; limit?: number }
): Promise<PagedResponse<VocabularyItemType>> {
  try {
    const queryParams = new URLSearchParams()
    if (params) {
      if (params.page !== undefined) queryParams.append("page", params.page.toString())
      if (params.limit !== undefined) queryParams.append("limit", params.limit.toString())
    }
    const queryString = queryParams.toString()
    const url = queryString ? `vocabulary-decks/${deckId}/items?${queryString}` : `vocabulary-decks/${deckId}/items`
    return await apiRequest<PagedResponse<VocabularyItemType>>(url)
  } catch (error) {
    console.error(`Không thể tải từ vựng của bộ từ ID = ${deckId}`, error)
    throw error
  }
}

// Thêm từ vựng mới vào bộ từ
export async function addVocabularyItem(
  deckId: number,
  params: {
    phrase: string
    normalized_phrase: string
    meaning: string
    example_sentence?: string
    note?: string
    lesson_id?: number
    transcript_id?: number
  }
): Promise<DataResponse<VocabularyItemType>> {
  try {
    return await apiRequest<DataResponse<VocabularyItemType>>(`vocabulary-decks/${deckId}/items`, {
      method: "POST",
      body: JSON.stringify(params)
    })
  } catch (error) {
    console.error(`Không thể thêm từ vựng mới vào bộ từ ID = ${deckId}`, error)
    throw error
  }
}

// Cập nhật thông tin từ vựng
export async function updateVocabularyItem(
  deckId: number,
  itemId: number,
  params: {
    phrase: string
    normalized_phrase: string
    meaning: string
    example_sentence?: string
    note?: string
    lesson_id?: number
    transcript_id?: number
  }
): Promise<DataResponse<VocabularyItemType>> {
  try {
    return await apiRequest<DataResponse<VocabularyItemType>>(`vocabulary-decks/${deckId}/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify(params)
    })
  } catch (error) {
    console.error(`Không thể cập nhật từ vựng ID = ${itemId}`, error)
    throw error
  }
}

// Xóa từ vựng khỏi bộ từ
export async function deleteVocabularyItem(
  deckId: number,
  itemId: number
): Promise<DataResponse<VocabularyItemType>> {
  try {
    return await apiRequest<DataResponse<VocabularyItemType>>(`vocabulary-decks/${deckId}/items/${itemId}`, {
      method: "DELETE"
    })
  } catch (error) {
    console.error(`Không thể xóa từ vựng ID = ${itemId}`, error)
    throw error
  }
}

export type QuizQuestionType = QuizQuestion

export interface AITranslationType {
  phrase: string
  phonetic: string
  meaning: string
  note: string
  example_sentence: string
  example_translation: string
}

// Tải câu hỏi trắc nghiệm từ vựng cá nhân
export async function getVocabularyQuiz(): Promise<DataResponse<QuizPayload>> {
  const response = await apiRequest<DataResponse<QuizPayload | QuizQuestionType[]>>(
    "vocabulary-categories/quiz"
  )

  // Transitional compatibility while older API instances still return an array.
  const payload: QuizPayload = Array.isArray(response.data)
    ? { questions: response.data, source: "sample" }
    : response.data

  return { ...response, data: payload }
}

// Dịch từ vựng nhanh bằng AI DeepSeek
export async function translatePhraseAI(text: string): Promise<DataResponse<AITranslationType>> {
  try {
    return await apiRequest<DataResponse<AITranslationType>>("vocabulary-categories/translate", {
      method: "POST",
      body: JSON.stringify({ text })
    })
  } catch (error) {
    console.error(`Không thể dịch từ "${text}" bằng AI`, error)
    throw error
  }
}
