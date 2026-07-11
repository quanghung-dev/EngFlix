import { api, apiRequest } from "@/lib/api-client";
import { LessonType, TranscriptType } from "@/types/lesson";
import { PagedResponse, DataResponse } from "@/types/api";

export async function getLessons(params?: {
    page?: number;
    limit?: number;
    category_id?: number;
    level?: string;
    search?: string;
}): Promise<PagedResponse<LessonType>> {
    try {
        const queryParams = new URLSearchParams();
        if (params) {
            if (params.page !== undefined) queryParams.append("page", params.page.toString());
            if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
            if (params.category_id !== undefined) queryParams.append("category_id", params.category_id.toString());
            if (params.level !== undefined) queryParams.append("level", params.level);
            if (params.search !== undefined) queryParams.append("search", params.search);
        }

        const queryString = queryParams.toString();
        const url = queryString ? `lessons?${queryString}` : "lessons";

        return await apiRequest<PagedResponse<LessonType>>(url);
    } catch (error) {
        console.error("Không thể tải danh sách bài học", error);
        throw error;
    }
}

export async function getLessonById(id: number): Promise<DataResponse<LessonType>> {
    try {
        return await apiRequest<DataResponse<LessonType>>(`lessons/${id}`);
    } catch (error) {
        console.error(`Không thể tải thông tin bài học ID = ${id}`, error);
        throw error;
    }
}

export async function getLessonTranscripts(id: number): Promise<DataResponse<TranscriptType[]>> {
    try {
        return await apiRequest<DataResponse<TranscriptType[]>>(`lessons/${id}/transcripts`);
    } catch (error) {
        console.error(`Không thể tải transcripts của bài học ID = ${id}`, error);
        throw error;
    }
}

export async function getCompletedTranscripts(lessonId: number): Promise<DataResponse<{ transcript_id: number }[]>> {
    try {
        return await apiRequest<DataResponse<{ transcript_id: number }[]>>(`transcript-progress/${lessonId}`);
    } catch (error) {
        console.error(`Không thể tải tiến trình transcript của bài học ID = ${lessonId}`, error);
        throw error;
    }
}

export async function completeTranscript(lessonId: number, transcriptId: number): Promise<any> {
    try {
        return await apiRequest<any>(`transcript-progress/${lessonId}`, {
            method: "POST",
            body: JSON.stringify({ transcript_id: transcriptId }),
        });
    } catch (error) {
        console.error(`Không thể lưu tiến trình transcript ID = ${transcriptId}`, error);
        throw error;
    }
}

export async function recordLearningHistory(params: {
    lesson_id: number;
    completed_dictation?: boolean;
    completed_pronunciation?: boolean;
}): Promise<any> {
    try {
        return await apiRequest<any>("learning-history", {
            method: "POST",
            body: JSON.stringify(params),
        });
    } catch (error) {
        console.error("Không thể ghi nhận lịch sử học tập", error);
        throw error;
    }
}

export async function assessPronunciation(params: {
    audio: Blob;
    referenceText: string;
    lessonId: number;
    transcriptId: number;
}): Promise<any> {
    try {
        const formData = new FormData();
        formData.append("audio", params.audio, "recording.wav");
        formData.append("referenceText", params.referenceText);
        formData.append("lessonId", params.lessonId.toString());
        formData.append("transcriptId", params.transcriptId.toString());

        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const response = await api.post("pronunciation-attempts", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            }
        });
        return response.data;
    } catch (error) {
        console.error("Không thể đánh giá phát âm", error);
        throw error;
    }
}

export async function getPronunciationProgress(lessonId: number): Promise<DataResponse<{ transcript_id: number; best_score: number }[]>> {
    try {
        return await apiRequest<DataResponse<{ transcript_id: number; best_score: number }[]>>(`pronunciation/progress/${lessonId}`);
    } catch (error) {
        console.error(`Không thể tải tiến trình phát âm của bài học ID = ${lessonId}`, error);
        throw error;
    }
}

export async function updatePronunciationProgress(transcriptId: number): Promise<any> {
    try {
        return await apiRequest<any>(`pronunciation/progress/update/${transcriptId}`, {
            method: "POST",
        });
    } catch (error) {
        console.error(`Không thể cập nhật tiến trình phát âm của transcript ID = ${transcriptId}`, error);
        throw error;
    }
}