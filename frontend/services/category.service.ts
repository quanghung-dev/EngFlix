import { isPublicApiError, publicApiRequest, type PublicRequestInit } from "@/lib/public-api";
import { CategoryType } from "@/types/category";
import { PagedResponse } from "@/types/api";

export async function getAllCategories(
  params?: {
    page?: number;
    limit?: number;
  },
  options?: PublicRequestInit
): Promise<PagedResponse<CategoryType>> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) {
      queryParams.append("page", params.page.toString());
    }
    if (params?.limit !== undefined) {
      queryParams.append("limit", params.limit.toString());
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/categories?${queryString}` : "/categories";

    return publicApiRequest<PagedResponse<CategoryType>>(url, {
      ...options,
      next: {
        revalidate: 300,
        tags: ["categories"],
        ...options?.next,
      },
    })
  } catch (error) {
    if (isPublicApiError(error) && error.status === 404) {
      return {
        data: [],
        meta: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 0,
          total: 0,
          total_pages: 0,
        },
      };
    }

    console.error("Không thể tải danh mục", error);
    throw error;
  }
}
