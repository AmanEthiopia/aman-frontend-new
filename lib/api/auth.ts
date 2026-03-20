import { apiPost, apiGet, saveToken, clearToken } from "./client"
import type { CompleteUserProfile } from "@/lib/types"

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  // FIX: Added confirm_password field required by backend
  confirm_password: string
  first_name: string
  last_name: string
  phone?: string
  role?: "traveller" | "provider"
}

// FIX: Updated AuthResponse to match backend v1 structure
export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: CompleteUserProfile
}

// FIX: Added RegisterResponse for registration endpoint
export interface RegisterResponse {
  id: string
  email: string
  first_name: string
  last_name: string
  is_email_verified: boolean
}

/**
 * Login user with email and password
 * Backend returns: { access_token, refresh_token, user }
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  // FIX: Backend returns access_token and refresh_token, not just token
  const response = await apiPost<AuthResponse>("/auth/login/", credentials)

  console.log("[v0] Auth API: Login response", {
    hasAccessToken: !!response.access_token,
    hasRefreshToken: !!response.refresh_token,
    hasUser: !!response.user,
  })

  if (response.access_token) {
    saveToken(response.access_token)
    console.log("[v0] Auth API: Token saved to localStorage")

    // FIX: Store refresh token separately
    if (typeof window !== "undefined") {
      localStorage.setItem("aman_refresh_token", response.refresh_token)
      console.log("[v0] Auth API: Refresh token saved to localStorage")
    }
  }

  return response
}

/**
 * Register new user
 * Backend returns: { id, email, first_name, last_name, is_email_verified }
 * Note: Registration does NOT auto-login; user must verify email first
 */
export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  // FIX: Backend expects confirm_password to match password
  const response = await apiPost<RegisterResponse>("/auth/register/", payload)

  // FIX: Registration does not return tokens, only user info
  // User must verify email before they can login
  return response
}

/**
 * Verify email with OTP
 */
export async function verifyEmail(email: string, otp_code: string): Promise<void> {
  return apiPost("/auth/verify-email/", { email, otp_code })
}

/**
 * Resend verification OTP
 */
export async function resendVerification(email: string): Promise<void> {
  return apiPost("/auth/resend-verification/", { email })
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(): Promise<{ access_token: string }> {
  const refreshToken = typeof window !== "undefined" ? localStorage.getItem("aman_refresh_token") : null

  if (!refreshToken) {
    throw new Error("No refresh token available")
  }

  const response = await apiPost<{ access_token: string }>("/auth/refresh-token/", {
    refresh_token: refreshToken,
  })

  if (response.access_token) {
    saveToken(response.access_token)
  }

  return response
}

/**
 * Logout user
 * Backend requires refresh_token to blacklist it
 */
export async function logoutAPI(): Promise<void> {
  const refreshToken = typeof window !== "undefined" ? localStorage.getItem("aman_refresh_token") : null

  if (refreshToken) {
    try {
      await apiPost("/auth/logout/", { refresh_token: refreshToken })
    } catch (error) {
      console.error("Logout API error:", error)
    }
  }

  // Clear tokens locally regardless of API success
  clearToken()
  if (typeof window !== "undefined") {
    localStorage.removeItem("aman_refresh_token")
  }
}

/**
 * Get current authenticated user with full profile
 */
export async function getCurrentUser(): Promise<CompleteUserProfile> {
  return apiGet<CompleteUserProfile>("/users/profile/me/")
}

/**
 * Forgot password - send reset OTP
 */
export async function forgotPassword(email: string): Promise<void> {
  return apiPost("/auth/forgot-password/", { email })
}

/**
 * Reset password using OTP
 */
export async function resetPassword(
  email: string,
  otp_code: string,
  new_password: string,
  confirm_password: string,
): Promise<void> {
  // FIX: Backend requires all four fields
  return apiPost("/auth/reset-password/", {
    email,
    otp_code,
    new_password,
    confirm_password,
  })
}

/**
 * Change password for authenticated user
 */
export async function changePassword(
  old_password: string,
  new_password: string,
  confirm_password: string,
): Promise<void> {
  // FIX: Backend requires all three fields
  return apiPost("/auth/change-password/", {
    old_password,
    new_password,
    confirm_password,
  })
}

/**
 * Send OTP to verify phone
 */
export async function sendPhoneOTP(phone: string): Promise<void> {
  return apiPost("/auth/phone/send-otp/", { phone })
}

/**
 * Verify phone with OTP
 */
export async function verifyPhoneOTP(phone: string, otp_code: string): Promise<void> {
  return apiPost("/auth/phone/verify-otp/", { phone, otp_code })
}

/**
 * Logout user (clear local token)
 * This is the synchronous version for local cleanup
 */
export function logout(): void {
  clearToken()
  if (typeof window !== "undefined") {
    localStorage.removeItem("aman_refresh_token")
  }
}

export interface GoogleAuthPayload {
  access_token: string
}

/**
 * Authenticate with Google OAuth
 * No email verification required for Google auth
 */
export async function loginWithGoogle(access_token: string): Promise<AuthResponse> {
  const response = await apiPost<AuthResponse>("/auth/social/google/", { access_token })

  if (response.access_token) {
    saveToken(response.access_token)
    if (typeof window !== "undefined") {
      localStorage.setItem("aman_refresh_token", response.refresh_token)
    }
  }

  return response
}

/**
 * Register with Google OAuth
 * No email verification required for Google auth
 */
export async function registerWithGoogle(access_token: string, role?: "traveller" | "provider"): Promise<AuthResponse> {
  const payload: any = { access_token }
  if (role) {
    payload.role = role
  }

  const response = await apiPost<AuthResponse>("/auth/social/google/", payload)

  if (response.access_token) {
    saveToken(response.access_token)
    if (typeof window !== "undefined") {
      localStorage.setItem("aman_refresh_token", response.refresh_token)
    }
  }

  return response
}
