import axios from "axios";

import { auth } from "@/lib/firebase";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function normalizeHeaders(headers?: HeadersInit, forceRefresh = false) {
    const norm = headers
        ? Object.fromEntries(new Headers(headers).entries())
        : {};
        
    if (typeof window !== "undefined") {
        await auth.authStateReady();
        const firebaseUser = auth.currentUser;
        const token = firebaseUser
            ? await firebaseUser.getIdToken(forceRefresh)
            : null;
        if (token) {
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
        });

    try {
        const response = await request();
        return response.data;
    } catch (error) {
        if (
            axios.isAxiosError(error) &&
            error.response?.status === 401 &&
            auth.currentUser
        ) {
            const response = await request(true);
            return response.data;
        }
        throw error;
    }
}
