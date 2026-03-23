/**
 * Cookie utilities for auth tokens
 * Works on both server and client in Next.js
 * 
 * Token lifecycle:
 * - Access token: Short-lived (30 days), used for API requests
 * - Refresh token: Long-lived (90 days), used to get new access tokens
 * 
 * When access token expires but refresh token is valid:
 * - API client automatically refreshes the token
 * - User stays logged in seamlessly
 * 
 * When both tokens expire:
 * - User is redirected to login
 */

const TOKEN_COOKIE = "aman_token"
const REFRESH_TOKEN_COOKIE = "aman_refresh_token"

// Token expiry times in seconds
const ACCESS_TOKEN_EXPIRY = 60 * 60 * 24 * 30 // 30 days for access token
const REFRESH_TOKEN_EXPIRY = 60 * 60 * 24 * 90 // 90 days for refresh token

/**
 * Set authentication token in cookie
 * @param token - JWT token string
 * @param isRefresh - Whether this is a refresh token
 */
export function setAuthCookie(token: string, isRefresh = false): void {
  if (typeof document === "undefined") return

  const cookieName = isRefresh ? REFRESH_TOKEN_COOKIE : TOKEN_COOKIE
  const maxAge = isRefresh ? REFRESH_TOKEN_EXPIRY : ACCESS_TOKEN_EXPIRY
  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:"

  document.cookie = `${cookieName}=${token}; path=/; max-age=${maxAge}; samesite=lax${isSecure ? "; secure" : ""}`
}

/**
 * Get authentication token from cookie
 * @param isRefresh - Whether to get the refresh token
 * @returns Token string or null if not found
 */
export function getAuthCookie(isRefresh = false): string | null {
  if (typeof document === "undefined") return null

  const cookieName = isRefresh ? REFRESH_TOKEN_COOKIE : TOKEN_COOKIE
  const cookies = document.cookie.split("; ")
  const cookie = cookies.find((c) => c.startsWith(`${cookieName}=`))
  return cookie ? cookie.split("=")[1] : null
}

/**
 * Get refresh token from cookie
 * @returns Refresh token string or null if not found
 */
export function getRefreshCookie(): string | null {
  return getAuthCookie(true)
}

/**
 * Clear all authentication cookies
 */
export function clearAuthCookies(): void {
  if (typeof document === "undefined") return

  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0`
  document.cookie = `${REFRESH_TOKEN_COOKIE}=; path=/; max-age=0`
}
