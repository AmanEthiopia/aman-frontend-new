/**
 * Centralized API client for AMAN platform
 * Handles authentication, headers, and error responses
 */

import { getAuthCookie, setAuthCookie, clearAuthCookies } from "@/lib/utils/cookies"

const API_BASE_URL = "https://api.aman.yichalal.ai/api/v1"

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any,
  ) {
    super(message)
    this.name = "APIError"
  }
}

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: any
}

/**
 * Core fetch wrapper with auth and error handling
 */
export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  // Get token from cookie
  const token = getAuthCookie()

  // API request logging (enable for debugging)
  // console.log(`[v0] API Request: ${options.method || "GET"} ${endpoint}`)

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  // Merge with any additional headers from options
  if (options.headers) {
    const optHeaders = options.headers as Record<string, string>
    Object.assign(headers, optHeaders)
  }

  // Add auth header if token exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type")
    const isJson = contentType?.includes("application/json")

    if (!response.ok) {
      const errorData: APIResponse = isJson ? await response.json() : { success: false, message: response.statusText }

      // Throw error with message from envelope
      throw new APIError(errorData.message || errorData.error || "Request failed", response.status, errorData.error)
    }

    // Return parsed JSON or empty object for 204 No Content
    if (response.status === 204 || !isJson) {
      return {} as T
    }

    const envelope: APIResponse<T> = await response.json()

    // Check success flag
    if (envelope.success === false) {
      throw new APIError(envelope.message || envelope.error || "Request failed", response.status, envelope.error)
    }

    // Return the data field from the envelope
    return envelope.data as T
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }

    // Network or other errors
    throw new APIError(error instanceof Error ? error.message : "Network error", 0)
  }
}

/**
 * GET request
 */
export async function apiGet<T = any>(endpoint: string): Promise<T> {
  return apiFetch<T>(endpoint, { method: "GET" })
}

/**
 * POST request
 */
export async function apiPost<T = any>(endpoint: string, body?: any): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * PUT request
 */
export async function apiPut<T = any>(endpoint: string, body?: any): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * PATCH request
 */
export async function apiPatch<T = any>(endpoint: string, body?: any): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * DELETE request
 */
export async function apiDelete<T = any>(endpoint: string): Promise<T> {
  return apiFetch<T>(endpoint, { method: "DELETE" })
}

// These are deprecated - use cookie utilities instead
/**
 * @deprecated Use setAuthCookie from @/lib/utils/cookies instead
 */
export function saveToken(token: string) {
  setAuthCookie(token)
}

/**
 * @deprecated Use clearAuthCookies from @/lib/utils/cookies instead
 */
export function clearToken() {
  clearAuthCookies()
}

/**
 * @deprecated Use getAuthCookie from @/lib/utils/cookies instead
 */
export function getToken(): string | null {
  return getAuthCookie()
}
