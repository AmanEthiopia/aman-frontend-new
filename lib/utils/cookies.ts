/**
 * Cookie utilities for auth tokens
 * Works on both server and client in Next.js
 */

const TOKEN_COOKIE = "aman_token"
const REFRESH_TOKEN_COOKIE = "aman_refresh_token"

/**
 * Set authentication token in cookie
 * @param token - JWT token string
 * @param isRefresh - Whether this is a refresh token
 */
export function setAuthCookie(token: string, isRefresh = false): void {
  if (typeof document === "undefined") return

  const cookieName = isRefresh ? REFRESH_TOKEN_COOKIE : TOKEN_COOKIE
  const maxAge = isRefresh ? 60 * 60 * 24 * 7 : 60 * 60 * 24 // 7 days for refresh, 1 day for access

  document.cookie = `${cookieName}=${token}; path=/; max-age=${maxAge}; samesite=lax; secure=${window.location.protocol === "https:"}`
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
 * Clear all authentication cookies
 */
export function clearAuthCookies(): void {
  if (typeof document === "undefined") return

  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0`
  document.cookie = `${REFRESH_TOKEN_COOKIE}=; path=/; max-age=0`
}
