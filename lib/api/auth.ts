import { apiPost, apiGet } from "./client"
import { setAuthCookie, clearAuthCookies, getRefreshCookie } from "@/lib/utils/cookies"
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
  // Updated to match API documentation - "traveler" not "traveller"
  role?: "traveler" | "provider"
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
  const response = await apiPost<AuthResponse>("/auth/login/", credentials)

  if (response.access_token) {
    // Store access token in cookie
    setAuthCookie(response.access_token, false)
    
    // Store refresh token in cookie (longer expiry)
    if (response.refresh_token) {
      setAuthCookie(response.refresh_token, true)
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
  const refreshToken = getRefreshCookie()

  if (!refreshToken) {
    throw new Error("No refresh token available")
  }

  const response = await apiPost<{ access_token: string }>("/auth/refresh-token/", {
    refresh_token: refreshToken,
  })

  if (response.access_token) {
    setAuthCookie(response.access_token, false)
  }

  return response
}

/**
 * Logout user
 * Backend requires refresh_token to blacklist it
 */
export async function logoutAPI(): Promise<void> {
  const refreshToken = getRefreshCookie()

  if (refreshToken) {
    try {
      await apiPost("/auth/logout/", { refresh_token: refreshToken })
    } catch (error) {
      console.error("Logout API error:", error)
    }
  }

  // Clear all auth cookies
  clearAuthCookies()
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
  clearAuthCookies()
}

export interface GoogleAuthPayload {
  // API documentation specifies id_token, not access_token
  id_token: string
  role?: "traveler" | "provider"
}

/**
 * Authenticate with Google OAuth
 * Uses Google ID token (JWT from Google Identity Services)
 * Backend verifies the token with Google's servers
 * No email verification required - Google users are auto-verified
 * 
 * Flow:
 * 1. Frontend gets ID token from Google (credentialResponse.credential)
 * 2. Send to backend: POST /api/v1/auth/social/google/ { id_token: "..." }
 * 3. Backend verifies with Google, creates/finds user, returns JWT tokens
 */
export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  const response = await apiPost<AuthResponse>("/auth/social/google/", { id_token: idToken })

  if (response.access_token) {
    setAuthCookie(response.access_token, false)
    if (response.refresh_token) {
      setAuthCookie(response.refresh_token, true)
    }
  }

  return response
}

/**
 * Register with Google OAuth
 * Uses Google ID token (JWT from Google Identity Services)
 * Role is only used when creating a NEW account - existing accounts keep their role
 * No email verification required - Google users are auto-verified
 * 
 * Flow:
 * 1. Frontend gets ID token from Google (credentialResponse.credential)
 * 2. Send to backend: POST /api/v1/auth/social/google/ { id_token: "...", role: "traveler"|"provider" }
 * 3. Backend verifies with Google, creates user with role, returns JWT tokens
 */
export async function registerWithGoogle(idToken: string, role?: "traveler" | "provider"): Promise<AuthResponse> {
  const payload: GoogleAuthPayload = { id_token: idToken }
  if (role) {
    payload.role = role
  }

  const response = await apiPost<AuthResponse>("/auth/social/google/", payload)

  if (response.access_token) {
    setAuthCookie(response.access_token, false)
    if (response.refresh_token) {
      setAuthCookie(response.refresh_token, true)
    }
  }

  return response
}

// ============================================================================
// TWO-FACTOR AUTHENTICATION (2FA)
// ============================================================================

export interface TwoFactorSetupResponse {
  secret: string
  qr_code_url: string
  backup_codes?: string[]
}

export interface TwoFactorStatusResponse {
  is_enabled: boolean
  enabled_at?: string
}

/**
 * Get 2FA status for current user
 */
export async function get2FAStatus(): Promise<TwoFactorStatusResponse> {
  return apiGet<TwoFactorStatusResponse>("/auth/2fa/status/")
}

/**
 * Initiate 2FA setup - returns QR code and secret
 */
export async function setup2FA(): Promise<TwoFactorSetupResponse> {
  return apiPost<TwoFactorSetupResponse>("/auth/2fa/setup/", {})
}

/**
 * Enable 2FA after verifying with code from authenticator app
 */
export async function enable2FA(code: string): Promise<{ backup_codes: string[] }> {
  return apiPost<{ backup_codes: string[] }>("/auth/2fa/enable/", { code })
}

/**
 * Disable 2FA (requires password confirmation)
 */
export async function disable2FA(password: string): Promise<void> {
  return apiPost("/auth/2fa/disable/", { password })
}

/**
 * Verify 2FA code during login
 */
export async function verify2FA(code: string, temp_token: string): Promise<AuthResponse> {
  const response = await apiPost<AuthResponse>("/auth/2fa/verify/", { code, temp_token })

  if (response.access_token) {
    setAuthCookie(response.access_token, false)
    if (response.refresh_token) {
      setAuthCookie(response.refresh_token, true)
    }
  }

  return response
}

/**
 * Regenerate backup codes
 */
export async function regenerateBackupCodes(password: string): Promise<{ backup_codes: string[] }> {
  return apiPost<{ backup_codes: string[] }>("/auth/2fa/backup-codes/regenerate/", { password })
}

/**
 * Use a backup code to login
 */
export async function useBackupCode(backup_code: string, temp_token: string): Promise<AuthResponse> {
  const response = await apiPost<AuthResponse>("/auth/2fa/backup-codes/use/", { backup_code, temp_token })

  if (response.access_token) {
    setAuthCookie(response.access_token, false)
    if (response.refresh_token) {
      setAuthCookie(response.refresh_token, true)
    }
  }

  return response
}

// ============================================================================
// ACTIVE SESSIONS
// ============================================================================

export interface ActiveSession {
  id: string
  device_name: string
  device_type: "mobile" | "desktop" | "tablet"
  browser: string
  ip_address: string
  location?: string
  last_active: string
  is_current: boolean
}

/**
 * Get all active sessions for current user
 */
export async function getActiveSessions(): Promise<ActiveSession[]> {
  return apiGet<ActiveSession[]>("/auth/sessions/")
}

/**
 * Revoke a specific session
 */
export async function revokeSession(sessionId: string): Promise<void> {
  return apiPost(`/auth/sessions/${sessionId}/revoke/`, {})
}

/**
 * Revoke all other sessions (except current)
 */
export async function revokeAllOtherSessions(): Promise<void> {
  return apiPost("/auth/sessions/revoke-all/", {})
}

/**
 * Permanently delete the authenticated user's account
 * Requires password confirmation
 */
export async function deleteAccount(password: string): Promise<void> {
  await apiPost("/auth/delete-account/", { password })
}
