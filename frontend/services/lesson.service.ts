import { apiRequest } from "@/lib/api-client";
import { LessonType } from "@/types/lesson";
import { PagedResponse } from "@/types/api";

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