import { apiGet, apiPatch, apiPost, apiDelete, apiFetch, getToken } from "./client"
import { getAuthCookie } from "@/lib/utils/cookies"

// ============================================================================
// Types
// ============================================================================

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
    dark_mode: boolean
    notif_email_bookings: boolean
    notif_email_messages: boolean
    notif_email_reviews: boolean
    notif_email_payments: boolean
    notif_email_marketing: boolean
    notif_push_bookings: boolean
    notif_push_messages: boolean
  }
  role: {
    is_provider: boolean
    is_admin: boolean
    provider_flags: string[]
    admin_flags: string[]
    is_premium: boolean
  }
  provider_profile: ProviderProfile | null
  payout_settings: PayoutSettings | null
  profile_completion: ProfileCompletion | null
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
  dark_mode?: boolean
  notif_email_bookings?: boolean
  notif_email_messages?: boolean
  notif_email_reviews?: boolean
  notif_email_payments?: boolean
  notif_email_marketing?: boolean
  notif_push_bookings?: boolean
  notif_push_messages?: boolean
}

// ============================================================================
// Provider Profile Types
// ============================================================================

export interface ProviderProfile {
  business_name: string
  business_type: string
  registration_number: string | null
  tax_id: string | null
  business_address: string | null
  website: string | null
  support_email: string | null
}

export type BusinessType = "hotel" | "restaurant" | "experience" | "guide" | "transport" | "other"

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  hotel: "Hotel / Accommodation",
  restaurant: "Restaurant / Food",
  experience: "Tours / Experiences",
  guide: "Tour Guide / Driver",
  transport: "Transport",
  other: "Other",
}

export interface UpdateProviderProfilePayload {
  business_name?: string
  business_type?: string
  registration_number?: string | null
  tax_id?: string | null
  business_address?: string | null
  website?: string | null
  support_email?: string | null
}

// ============================================================================
// Payout Settings Types
// ============================================================================

export interface PayoutSettings {
  bank_name: string | null
  account_number: string | null
  account_holder_name: string | null
  payout_schedule: "weekly" | "biweekly" | "monthly"
}

export interface UpdatePayoutPayload {
  bank_name?: string | null
  account_number?: string | null
  account_holder_name?: string | null
  payout_schedule?: "weekly" | "biweekly" | "monthly"
}

// ============================================================================
// Profile Completion Types
// ============================================================================

export interface ProfileCompletion {
  percentage: number
  is_complete: boolean
  missing: string[]
}

export const COMPLETION_FIELD_LABELS: Record<string, string> = {
  profile_photo: "Profile photo",
  bio: "Bio / description",
  phone: "Phone number",
  business_name: "Business name",
  business_type: "Business type",
  business_address: "Business address",
  bank_name: "Bank name",
  account_number: "Account number",
  account_holder_name: "Account holder name",
}

// ============================================================================
// Emergency Contacts
// ============================================================================

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

// ============================================================================
// Profile API
// ============================================================================

export async function getMyProfile(): Promise<UserProfile> {
  return apiGet<UserProfile>("/users/profile/me/")
}

export async function updateMyProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
  const cleanedPayload: Record<string, any> = {}

  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue
    const optionalFields = ["bio", "date_of_birth", "gender", "nationality", "travel_style", "accessibility_needs"]
    if (optionalFields.includes(key) && value === "") {
      cleanedPayload[key] = null
    } else if (Array.isArray(value) && value.length === 0) {
      cleanedPayload[key] = value
    } else {
      cleanedPayload[key] = value
    }
  }

  return apiPatch<UserProfile>("/users/profile/me/", cleanedPayload)
}

export async function uploadProfilePhoto(file: File): Promise<{ profile_photo: string; url: string }> {
  const formData = new FormData()
  formData.append("profile_photo", file)

  const token = getAuthCookie() || getToken()
  if (!token) throw new Error("Authentication required. Please sign in again.")

  const response = await fetch("https://api.aman.yichalal.ai/api/v1/users/profile/photo/", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })

  if (!response.ok) {
    if (response.status === 401) throw new Error("Session expired. Please sign in again.")
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || errorData.detail || "Failed to upload profile photo")
  }

  const envelope = await response.json()
  if (!envelope.success) throw new Error(envelope.message || "Upload failed")
  return envelope.data
}

export async function deleteProfilePhoto(): Promise<void> {
  return apiDelete("/users/profile/photo/")
}

// ============================================================================
// Provider Profile API
// ============================================================================

export async function getProviderProfile(): Promise<ProviderProfile> {
  return apiGet<ProviderProfile>("/users/provider/profile/")
}

export async function updateProviderProfile(payload: UpdateProviderProfilePayload): Promise<ProviderProfile> {
  return apiPatch<ProviderProfile>("/users/provider/profile/", payload)
}

// ============================================================================
// Provider Payout API
// ============================================================================

export async function getProviderPayout(): Promise<PayoutSettings> {
  return apiGet<PayoutSettings>("/users/provider/payout/")
}

export async function updateProviderPayout(payload: UpdatePayoutPayload): Promise<PayoutSettings> {
  return apiPatch<PayoutSettings>("/users/provider/payout/", payload)
}

// ============================================================================
// Profile Completion API
// ============================================================================

export async function getProfileCompletion(): Promise<ProfileCompletion> {
  return apiGet<ProfileCompletion>("/users/provider/completion/")
}

// ============================================================================
// Emergency Contacts API
// ============================================================================

export async function getEmergencyContacts(): Promise<EmergencyContact[]> {
  return apiGet<EmergencyContact[]>("/users/emergency-contacts/")
}

export async function createEmergencyContact(payload: CreateEmergencyContactPayload): Promise<EmergencyContact> {
  return apiPost<EmergencyContact>("/users/emergency-contacts/", payload)
}

export async function updateEmergencyContact(
  contactId: string,
  payload: Partial<CreateEmergencyContactPayload>,
): Promise<EmergencyContact> {
  return apiPatch<EmergencyContact>(`/users/emergency-contacts/${contactId}/`, payload)
}

export async function deleteEmergencyContact(contactId: string): Promise<void> {
  return apiDelete(`/users/emergency-contacts/${contactId}/`)
}

// kept for backward compat — callers should use updateMyProfile with notif_ fields directly
export async function updateNotificationPreferences(preferences: {
  notif_email_bookings?: boolean
  notif_email_messages?: boolean
  notif_email_reviews?: boolean
  notif_email_payments?: boolean
  notif_email_marketing?: boolean
  notif_push_bookings?: boolean
  notif_push_messages?: boolean
}): Promise<UserProfile> {
  return updateMyProfile(preferences)
}
