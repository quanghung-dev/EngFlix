import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function normalizeHeaders(headers?: HeadersInit, forceRefresh = false) {
    const norm = headers
        ? Object.fromEntries(new Headers(headers).entries())
        : {};
        
    if (typeof window !== "undefined") {
        const { getAuthToken } = await import("@/lib/auth-session");
        const token = await getAuthToken(forceRefresh);
        if (token && !norm["authorization"]) {
            norm["Authorization"] = `Bearer ${token}`;
        }
    }
    return norm;
}

export const api = axios.create({
    baseURL: BASE_URL,
});

export async function apiRequest<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const method = options?.method || "GET";

    const requestData = typeof options?.body === "string"
        ? JSON.parse(options.body)
        : options?.body;

    const request = async (forceRefresh = false) =>
        api.request<T>({
            url: endpoint,
            method,
            data: requestData,
            headers: await normalizeHeaders(options?.headers, forceRefresh),
            signal: options?.signal ?? undefined,
        });

    try {
        const response = await request();
        return response.data;
    } catch (error) {
        if (
            axios.isAxiosError(error) &&
            error.response?.status === 401 &&
            typeof window !== "undefined"
        ) {
            const { getAuthToken } = await import("@/lib/auth-session");
            if (await getAuthToken()) {
                const response = await request(true);
                return response.data;
            }
        }
        throw error;
    }
}
