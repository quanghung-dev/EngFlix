import { apiRequest } from "@/lib/api-client";
import { CategoryType } from "@/types/category";
import { PagedResponse } from "@/types/api";

export async function getAllCategories(): Promise<PagedResponse<CategoryType>> {
  try {
    return apiRequest<PagedResponse<CategoryType>>("/categories")
  } catch (error) {
    console.error("Không thể tải danh mục", error);
    throw error;
  }
}
