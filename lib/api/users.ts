import { apiGet, apiPatch, apiPost, apiDelete } from "./client"

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
  bio?: string
  date_of_birth?: string
  gender?: string
  nationality?: string
  preferred_language?: string
  preferred_currency?: string
  timezone?: string
  travel_style?: string
  interests?: string[]
  dietary_restrictions?: string[]
  accessibility_needs?: string
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
 */
export async function updateMyProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
  return apiPatch<UserProfile>("/users/profile/me/", payload)
}

/**
 * Upload profile photo
 */
export async function uploadProfilePhoto(file: File): Promise<{ profile_photo: string; url: string }> {
  const formData = new FormData()
  formData.append("profile_photo", file)

  const token = typeof window !== "undefined" ? localStorage.getItem("aman_token") : null
  const headers: HeadersInit = {}
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch("https://api.aman.yichalal.ai/api/v1/users/profile/photo/", {
    method: "POST",
    headers,
    body: formData,
  })

  if (!response.ok) {
    throw new Error("Failed to upload profile photo")
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
