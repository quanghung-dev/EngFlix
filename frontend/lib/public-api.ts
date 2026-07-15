const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"
).replace(/\/$/, "")

export type PublicRequestInit = RequestInit & {
  next?: {
    revalidate?: number | false
    tags?: string[]
  }
}

export class PublicApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = "PublicApiError"
  }
}

export function isPublicApiError(error: unknown): error is PublicApiError {
  return error instanceof PublicApiError
}

export async function publicApiRequest<T>(
  endpoint: string,
  options: PublicRequestInit = {},
): Promise<T> {
  const normalizedEndpoint = endpoint.replace(/^\//, "")
  const headers = new Headers(options.headers)
  headers.set("Accept", "application/json")

  const response = await fetch(`${BASE_URL}/${normalizedEndpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let message = `Public API request failed with status ${response.status}`
    try {
      const body = (await response.json()) as { error?: { message?: string } }
      if (body.error?.message) message = body.error.message
    } catch {
      // Keep the status-based fallback for non-JSON errors.
    }
    throw new PublicApiError(message, response.status)
  }

  return response.json() as Promise<T>
}
