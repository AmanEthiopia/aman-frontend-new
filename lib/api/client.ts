/**
 * Centralized API client for AMAN platform
 * Handles authentication, headers, error responses, and automatic token refresh
 */

import { getAuthCookie, setAuthCookie, clearAuthCookies, getRefreshCookie } from "@/lib/utils/cookies"
import { flattenErrors, STATUS_MESSAGES } from "@/lib/utils/errors"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.aman.yichalal.ai/api/v1"
const MEDIA_HOST = API_BASE_URL.replace(/\/api\/v1\/?$/, "")

export function mediaUrl(path?: string | null): string | undefined {
  if (!path) return undefined
  if (path.startsWith("http")) return path
  return `${MEDIA_HOST}${path}`
}

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

// Track if we're currently refreshing to avoid multiple refresh attempts
let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null

/**
 * Attempt to refresh the access token using the refresh token
 */
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshCookie()
  
  if (!refreshToken) {
    return null
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    
    if (!response.ok) {
      // Refresh token is invalid, clear all auth
      clearAuthCookies()
      return null
    }
    
    const data = await response.json()
    const newAccessToken = data.data?.access_token || data.access_token
    
    if (newAccessToken) {
      setAuthCookie(newAccessToken)
      return newAccessToken
    }
    
    return null
  } catch (error) {
    console.error("[v0] Token refresh failed:", error)
    clearAuthCookies()
    return null
  }
}

/**
 * Get a valid access token, refreshing if necessary
 */
async function getValidToken(): Promise<string | null> {
  const token = getAuthCookie()
  
  if (token) {
    // Check if token is expired by decoding JWT
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      const expiresAt = payload.exp * 1000 // Convert to milliseconds
      const now = Date.now()
      const buffer = 60 * 1000 // 1 minute buffer
      
      if (expiresAt - now > buffer) {
        // Token is still valid
        return token
      }
    } catch {
      // If we can't decode, assume it's valid and let the API check
      return token
    }
  }
  
  // Token is missing or expired, try to refresh
  if (isRefreshing && refreshPromise) {
    // Wait for ongoing refresh
    return refreshPromise
  }
  
  isRefreshing = true
  refreshPromise = refreshAccessToken()
  
  try {
    const newToken = await refreshPromise
    return newToken
  } finally {
    isRefreshing = false
    refreshPromise = null
  }
}

/**
 * Core fetch wrapper with auth, error handling, and automatic token refresh
 */
export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}, retryCount = 0): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  // Get valid token (will refresh if needed)
  const token = await getValidToken()

  // Check if body is FormData - if so, don't set Content-Type (browser will set it with boundary)
  const isFormData = options.body instanceof FormData

  const headers: Record<string, string> = {}
  
  // Only set Content-Type for non-FormData requests
  if (!isFormData) {
    headers["Content-Type"] = "application/json"
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

    // Handle 401 Unauthorized - try to refresh token and retry
    if (response.status === 401 && retryCount < 1) {
      const newToken = await refreshAccessToken()
      if (newToken) {
        // Retry the request with the new token
        return apiFetch<T>(endpoint, options, retryCount + 1)
      }
      
      // Refresh failed, clear auth and throw
      clearAuthCookies()
      throw new APIError("Session expired. Please sign in again.", 401)
    }

    if (!response.ok) {
      const errorData: APIResponse = isJson ? await response.json() : { success: false, message: response.statusText }

      // Build a user-friendly message:
      // 1. Try to flatten DRF validation errors from the error object
      // 2. Fall back to the envelope message
      // 3. Fall back to status-code table
      const flatValidation = errorData.error ? flattenErrors(errorData.error) : null
      const friendlyMsg =
        flatValidation ||
        errorData.message ||
        STATUS_MESSAGES[response.status] ||
        "Something went wrong. Please try again."

      throw new APIError(friendlyMsg, response.status, errorData.error)
    }

    // Return parsed JSON or empty object for 204 No Content
    if (response.status === 204 || !isJson) {
      return {} as T
    }

    const envelope: APIResponse<T> = await response.json()

    // Check success flag
    if (envelope.success === false) {
      const flatValidation = envelope.error ? flattenErrors(envelope.error) : null
      const friendlyMsg =
        flatValidation ||
        envelope.message ||
        STATUS_MESSAGES[response.status] ||
        "Something went wrong. Please try again."
      throw new APIError(friendlyMsg, response.status, envelope.error)
    }

    // Return the data field from the envelope
    return envelope.data as T
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }

    // Network or other errors
    const msg =
      error instanceof Error && error.message.toLowerCase().includes("fetch")
        ? STATUS_MESSAGES[0]
        : error instanceof Error
        ? error.message
        : STATUS_MESSAGES[0]
    throw new APIError(msg, 0)
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
