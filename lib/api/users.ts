import { apiGet, apiPatch, apiPost, apiDelete, getToken } from "./client"
import { getAuthCookie } from "@/lib/utils/cookies"

export interface UserProfile {
  user: {
    id: string
    email: string
    first_name: string
    last_name: string
    is_email_verified: boolean
    is_phone_verified: boolean
    phone: string | null
  }
  profile: {
    bio: string | null
    profile_photo: string | null
    date_of_birth: string | null
    gender: string | null
    nationality: string | null
    preferred_language: string
    preferred_currency: string
    timezone: string
    travel_style: string | null
    interests: string[] | null
    dietary_restrictions: string[] | null
    accessibility_needs: string | null
  }
  role: {
    is_provider: boolean
    is_admin: boolean
    provider_flags: string[]
    admin_flags: string[]
    is_premium: boolean
  }
}

export interface UpdateProfilePayload {
  first_name?: string
  last_name?: string
  phone?: string
  bio?: string
  date_of_birth?: string | null
  gender?: string | null
  nationality?: string | null
  preferred_language?: string
  preferred_currency?: string
  timezone?: string
  travel_style?: string | null
  interests?: string[] | null
  dietary_restrictions?: string[] | null
  accessibility_needs?: string | null
}

export interface EmergencyContact {
  id: string
  name: string
  relationship: string
  phone: string
  email?: string
}

export interface CreateEmergencyContactPayload {
  name: string
  relationship: string
  phone: string
  email?: string
}

/**
 * Get current user profile
 */
export async function getMyProfile(): Promise<UserProfile> {
  return apiGet<UserProfile>("/users/profile/me/")
}

/**
 * Update current user profile
 * Supports partial updates - only send fields that have changed
 * Empty strings are converted to null for optional fields to avoid validation errors
 */
export async function updateMyProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
  // Clean the payload to handle partial updates properly
  // Convert empty strings to null for optional fields to avoid backend validation issues
  const cleanedPayload: Record<string, any> = {}
  
  for (const [key, value] of Object.entries(payload)) {
    // Skip undefined values (not part of the update)
    if (value === undefined) continue
    
    // For optional fields, convert empty strings to null
    const optionalFields = [
      'bio', 'date_of_birth', 'gender', 'nationality', 
      'travel_style', 'accessibility_needs'
    ]
    
    if (optionalFields.includes(key) && value === '') {
      cleanedPayload[key] = null
    } else if (Array.isArray(value) && value.length === 0) {
      // Empty arrays can stay as empty arrays or null depending on backend
      cleanedPayload[key] = value
    } else {
      cleanedPayload[key] = value
    }
  }
  
  return apiPatch<UserProfile>("/users/profile/me/", cleanedPayload)
}

/**
 * Update user notification preferences
 */
export async function updateNotificationPreferences(preferences: {
  email_notifications?: boolean
  push_notifications?: boolean
  marketing_emails?: boolean
  booking_reminders?: boolean
  review_requests?: boolean
}): Promise<void> {
  return apiPatch("/users/profile/me/notifications/", preferences)
}

/**
 * Upload profile photo
 * Uses cookie-based auth that's consistent with the rest of the API client
 */
export async function uploadProfilePhoto(file: File): Promise<{ profile_photo: string; url: string }> {
  const formData = new FormData()
  formData.append("profile_photo", file)

  // Get token from cookies (primary) or fallback to getToken (which also checks cookies)
  const token = getAuthCookie() || getToken()
  
  if (!token) {
    throw new Error("Authentication required. Please sign in again.")
  }
  
  const headers: HeadersInit = {
    "Authorization": `Bearer ${token}`
  }

  const response = await fetch("https://api.aman.yichalal.ai/api/v1/users/profile/photo/", {
    method: "POST",
    headers,
    body: formData,
  })

  if (!response.ok) {
    // Handle 401 specifically
    if (response.status === 401) {
      throw new Error("Session expired. Please sign in again.")
    }
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || errorData.detail || "Failed to upload profile photo")
  }

  const envelope = await response.json()
  if (!envelope.success) {
    throw new Error(envelope.message || "Upload failed")
  }

  return envelope.data
}

/**
 * Delete profile photo
 */
export async function deleteProfilePhoto(): Promise<void> {
  return apiDelete("/users/profile/photo/")
}

/**
 * List emergency contacts
 */
export async function getEmergencyContacts(): Promise<EmergencyContact[]> {
  return apiGet<EmergencyContact[]>("/users/emergency-contacts/")
}

/**
 * Create emergency contact
 */
export async function createEmergencyContact(payload: CreateEmergencyContactPayload): Promise<EmergencyContact> {
  return apiPost<EmergencyContact>("/users/emergency-contacts/", payload)
}

/**
 * Update emergency contact
 */
export async function updateEmergencyContact(
  contactId: string,
  payload: Partial<CreateEmergencyContactPayload>,
): Promise<EmergencyContact> {
  return apiPatch<EmergencyContact>(`/users/emergency-contacts/${contactId}/`, payload)
}

/**
 * Delete emergency contact
 */
export async function deleteEmergencyContact(contactId: string): Promise<void> {
  return apiDelete(`/users/emergency-contacts/${contactId}/`)
}
