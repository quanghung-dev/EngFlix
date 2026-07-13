import { apiRequest } from "@/lib/api-client";
import {
    LearningHistoryType,
    LessonType,
    PronunciationAssessmentResult,
    PronunciationProgressType,
    TranscriptProgressType,
    TranscriptType,
} from "@/types/lesson";
import { PagedResponse, DataResponse } from "@/types/api";

type UnwrappedPronunciationAssessment = PronunciationAssessmentResult & {
    data?: undefined;
};

export async function getLessons(
    params?: {
        page?: number;
        limit?: number;
        category_id?: number;
        level?: string;
        search?: string;
    },
    options?: RequestInit
): Promise<PagedResponse<LessonType>> {
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

        return await apiRequest<PagedResponse<LessonType>>(url, options);
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

export async function getCompletedTranscripts(lessonId: number): Promise<DataResponse<TranscriptProgressType[]>> {
    try {
        return await apiRequest<DataResponse<TranscriptProgressType[]>>(`transcript-progress/${lessonId}`);
    } catch (error) {
        console.error(`Không thể tải tiến trình transcript của bài học ID = ${lessonId}`, error);
        throw error;
    }
}

export async function completeTranscript(lessonId: number, transcriptId: number): Promise<DataResponse<TranscriptProgressType>> {
    try {
        return await apiRequest<DataResponse<TranscriptProgressType>>(`transcript-progress/${lessonId}`, {
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
}): Promise<DataResponse<LearningHistoryType>> {
    try {
        return await apiRequest<DataResponse<LearningHistoryType>>("learning-history", {
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
}): Promise<UnwrappedPronunciationAssessment> {
    try {
        const formData = new FormData();
        formData.append("audio", params.audio, "recording.wav");
        formData.append("referenceText", params.referenceText);
        formData.append("lessonId", params.lessonId.toString());
        formData.append("transcriptId", params.transcriptId.toString());

        const response = await apiRequest<DataResponse<PronunciationAssessmentResult>>("pronunciation-attempts", {
            method: "POST",
            body: formData,
        });
        return response.data;
    } catch (error) {
        console.error("Không thể đánh giá phát âm", error);
        throw error;
    }
}

export async function getPronunciationProgress(lessonId: number): Promise<DataResponse<PronunciationProgressType[]>> {
    try {
        return await apiRequest<DataResponse<PronunciationProgressType[]>>(`pronunciation/progress/${lessonId}`);
    } catch (error) {
        console.error(`Không thể tải tiến trình phát âm của bài học ID = ${lessonId}`, error);
        throw error;
    }
}

export async function updatePronunciationProgress(transcriptId: number): Promise<DataResponse<PronunciationProgressType>> {
    try {
        return await apiRequest<DataResponse<PronunciationProgressType>>(`pronunciation/progress/update/${transcriptId}`, {
            method: "POST",
        });
    } catch (error) {
        console.error(`Không thể cập nhật tiến trình phát âm của transcript ID = ${transcriptId}`, error);
        throw error;
    }
}
