import { apiRequest } from "@/lib/api-client";
import {
    LearningHistoryType,
    LessonType,
    PronunciationAssessmentResult,
    PronunciationProgressType,
    StudyContentType,
    StudyStateType,
    TranscriptProgressType,
    TranscriptType,
} from "@/types/lesson";
import { PagedResponse, DataResponse } from "@/types/api";
import { publicApiRequest, type PublicRequestInit } from "@/lib/public-api";

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
    options?: PublicRequestInit
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

        const tags = ["lessons"];
        if (params?.category_id !== undefined) tags.push(`category:${params.category_id}`);
        return await publicApiRequest<PagedResponse<LessonType>>(url, {
            ...options,
            next: { revalidate: 300, tags, ...options?.next },
        });
    } catch (error) {
        console.error("Không thể tải danh sách bài học", error);
        throw error;
    }
}
export async function getLessonById(id: number): Promise<DataResponse<LessonType>> {
    try {
        return await publicApiRequest<DataResponse<LessonType>>(`lessons/${id}`, {
            next: { revalidate: 300, tags: ["lessons", `lesson:${id}`] },
        });
    } catch (error) {
        console.error(`Không thể tải thông tin bài học ID = ${id}`, error);
        throw error;
    }
}

export async function getLessonTranscripts(id: number): Promise<DataResponse<TranscriptType[]>> {
    try {
        return await publicApiRequest<DataResponse<TranscriptType[]>>(`lessons/${id}/transcripts`, {
            next: { revalidate: 300, tags: [`lesson:${id}`, `transcripts:${id}`] },
        });
    } catch (error) {
        console.error(`Không thể tải transcripts của bài học ID = ${id}`, error);
        throw error;
    }
}

export async function getStudyContent(id: number): Promise<DataResponse<StudyContentType>> {
    return publicApiRequest<DataResponse<StudyContentType>>(`lessons/${id}/content`, {
        next: {
            revalidate: 300,
            tags: ["lessons", `lesson:${id}`, `transcripts:${id}`],
        },
    });
}

export async function getStudyState(
    id: number,
    mode: "dictation" | "shadowing"
): Promise<DataResponse<StudyStateType>> {
    return apiRequest<DataResponse<StudyStateType>>(`lessons/${id}/study-state?mode=${mode}`);
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

export async function getLearningHistory(params?: {
    page?: number;
    limit?: number;
}): Promise<PagedResponse<LearningHistoryType>> {
    try {
        const queryParams = new URLSearchParams();
        if (params) {
            if (params.page !== undefined) queryParams.append("page", params.page.toString());
            if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
        }
        const queryString = queryParams.toString();
        const url = queryString ? `learning-history?${queryString}` : "learning-history";
        return await apiRequest<PagedResponse<LearningHistoryType>>(url);
    } catch (error) {
        console.error("Không thể tải lịch sử học tập", error);
        throw error;
    }
}
