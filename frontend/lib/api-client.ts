import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export async function apiRequest<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const method = options?.method || "GET";

    const requestData = options?.body ? JSON.parse(options.body as string) : undefined;

    const response = await api.request<T>({
        url: endpoint,
        method: method,
        data: requestData,
        headers: options?.headers as any,
    });

    return response.data;
}
