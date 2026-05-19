import { apiFetch, apiPost, apiGet, apiPatch, apiDelete, apiPut } from "./client"

// ============================================================================
// Types
// ============================================================================

export type GuideServiceType =
  | "private_tour"
  | "group_tour"
  | "driver"
  | "photographer"
  | "hiking_guide"
  | "cultural_guide"
  | "interpreter"
  | "custom"

export type GuidePricingType = "hourly" | "daily" | "per_person" | "per_group"

export type GuideBookingStatus = "pending" | "confirmed" | "rejected" | "cancelled" | "completed"

export interface GuideCity {
  id: string
  city: {
    id: string
    name: string
    nickname?: string
    slug: string
  }
  order: number
}

export interface GuidePhoto {
  id: string
  photo_url: string
  caption?: string
  display_order: number
  is_primary: boolean
}

export interface GuideOrganizer {
  id: string
  name: string
  avatar_url?: string
}

export interface Guide {
  id: string
  title: string
  nickname?: string
  slug: string
  description?: string
  short_description?: string
  service_type: GuideServiceType
  pricing_type: GuidePricingType
  price: string
  price_currency: string
  languages: string[]
  min_group_size?: number
  max_group_size?: number
  years_experience?: number
  certifications?: string[]
  cancellation_policy?: string
  average_rating?: string
  review_count?: number
  is_published: boolean
  is_verified?: boolean
  provider_id?: string
  organizer?: GuideOrganizer
  cities: GuideCity[]
  photos: GuidePhoto[]
  primary_photo?: GuidePhoto
  booking_count?: number
  created_at?: string
  updated_at?: string
}

export interface GuidesSearchParams {
  service_type?: GuideServiceType
  city?: string
  language?: string
  pricing_type?: GuidePricingType
  price_min?: number
  price_max?: number
  search?: string
  sort?: "price_asc" | "price_desc" | "rating_desc" | "newest"
  page?: number
  page_size?: number
}

export interface PaginatedGuides {
  count: number
  next: string | null
  previous: string | null
  results: Guide[]
}

// ============================================================================
// Public API - Browse & View Guides (no auth, plain DRF pagination)
// ============================================================================

const API_BASE_URL = "https://api.aman.yichalal.ai/api/v1"

/**
 * Search/list guides — public endpoint, returns plain DRF pagination (no envelope)
 */
export async function searchGuides(params: GuidesSearchParams = {}): Promise<PaginatedGuides> {
  const queryParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      queryParams.append(key, String(value))
    }
  })

  const queryString = queryParams.toString()
  const endpoint = queryString ? `/guides/?${queryString}` : "/guides/"
  const url = `${API_BASE_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) throw new Error(`Failed to fetch guides: ${response.statusText}`)

    const data = await response.json()

    if (Array.isArray(data)) {
      return { results: data, count: data.length, next: null, previous: null }
    }
    if (data.results) {
      return data as PaginatedGuides
    }
    // Handle { success, data: [...] } just in case
    if (data.success && Array.isArray(data.data)) {
      return { results: data.data, count: data.data.length, next: null, previous: null }
    }
    return { results: [], count: 0, next: null, previous: null }
  } catch (error) {
    console.error("[Guides API] Error:", error)
    return { results: [], count: 0, next: null, previous: null }
  }
}

export async function getGuides(params: GuidesSearchParams = {}): Promise<Guide[]> {
  return (await searchGuides(params)).results
}

export async function getGuidesPaginated(params: GuidesSearchParams = {}): Promise<PaginatedGuides> {
  return searchGuides(params)
}

/**
 * Get guide by slug — authenticated endpoints use { success, data } envelope;
 * the API client unwraps it so apiGet returns the Guide directly.
 */
export async function getGuideBySlug(slug: string): Promise<Guide> {
  return apiGet<Guide>(`/guides/${slug}/`)
}

// ============================================================================
// Traveler Booking API
// ============================================================================

export interface CreateGuideBookingPayload {
  guide_id: string
  booking_date: string
  start_time?: string
  hours_requested?: number
  num_adults: number
  num_children?: number
  guest_name: string
  guest_email: string
  guest_phone?: string
  special_requests?: string
}

export interface GuideBookingGuide {
  id: string
  title: string
  nickname?: string
  slug: string
  service_type: GuideServiceType
  pricing_type: GuidePricingType
  price: string
  price_currency: string
}

export interface GuideBooking {
  id: string
  booking_number: string
  guide: GuideBookingGuide
  status: GuideBookingStatus
  payment_status: "unpaid" | "paid" | "refunded"
  booking_date: string
  start_time?: string
  hours_requested?: string
  num_adults: number
  num_children: number
  total_price: string
  currency: string
  guest_name: string
  guest_email: string
  guest_phone?: string
  special_requests?: string
  confirmed_at?: string
  cancelled_at?: string
  cancellation_reason?: string
  created_at: string
}

/**
 * Book a guide (Traveler) — client unwraps { success, data: GuideBooking }
 */
export async function createGuideBooking(payload: CreateGuideBookingPayload): Promise<GuideBooking> {
  return apiPost<GuideBooking>("/guides/bookings/", payload)
}

/**
 * Get my guide bookings (Traveler)
 */
export async function getMyGuideBookings(status?: GuideBookingStatus): Promise<GuideBooking[]> {
  const params = status ? `?status=${status}` : ""
  const raw = await apiGet<any>(`/guides/bookings/mine/${params}`)
  return Array.isArray(raw) ? raw : (raw?.results ?? [])
}

/**
 * Get guide booking detail (Traveler)
 */
export async function getGuideBookingById(id: string): Promise<GuideBooking> {
  return apiGet<GuideBooking>(`/guides/bookings/${id}/`)
}

/**
 * Cancel guide booking (Traveler)
 */
export async function cancelGuideBooking(id: string, reason?: string): Promise<void> {
  await apiPost(`/guides/bookings/${id}/cancel/`, { reason })
}

// ============================================================================
// Provider API - Manage Guide Listings
// ============================================================================

export interface CreateGuidePayload {
  title: string
  nickname?: string
  description?: string
  short_description?: string
  service_type: GuideServiceType
  pricing_type: GuidePricingType
  price: string
  price_currency?: string
  languages: string[]
  min_group_size?: number
  max_group_size?: number
  years_experience?: number
  certifications?: string[]
  cancellation_policy?: string
}

export interface UpdateGuidePayload extends Partial<CreateGuidePayload> {}

/**
 * Get provider's guide listings — returns array (client unwraps envelope)
 */
export async function getProviderGuides(): Promise<Guide[]> {
  const raw = await apiGet<any>("/guides/provider/")
  return Array.isArray(raw) ? raw : (raw?.results ?? [])
}

/**
 * Create a new guide listing — returns { id, slug } on success (201)
 */
export async function createGuide(payload: CreateGuidePayload): Promise<{ id: string; slug: string }> {
  return apiPost<{ id: string; slug: string }>("/guides/provider/", payload)
}

/**
 * Get guide detail (Provider view) — includes booking_count
 */
export async function getProviderGuideById(guideId: string): Promise<Guide> {
  return apiGet<Guide>(`/guides/provider/${guideId}/`)
}

/**
 * Update guide (Provider) — PATCH, returns updated Guide
 */
export async function updateGuide(guideId: string, payload: UpdateGuidePayload): Promise<Guide> {
  return apiPatch<Guide>(`/guides/provider/${guideId}/`, payload)
}

/**
 * Delete/unpublish guide (Provider) — soft delete
 */
export async function deleteGuide(guideId: string): Promise<void> {
  await apiDelete(`/guides/provider/${guideId}/`)
}

/**
 * Toggle publish status (Provider) — PUT per spec
 */
export async function toggleGuidePublish(guideId: string): Promise<{ is_published: boolean }> {
  return apiPut<{ is_published: boolean }>(`/guides/provider/${guideId}/publish/`, {})
}

// ============================================================================
// Provider Cities Management
// ============================================================================

export interface AddGuideCityPayload {
  city: string // city UUID
  order?: number
}

/**
 * Get operating cities for a guide
 */
export async function getGuideCities(guideId: string): Promise<GuideCity[]> {
  const raw = await apiGet<any>(`/guides/provider/${guideId}/cities/`)
  return Array.isArray(raw) ? raw : (raw?.results ?? [])
}

/**
 * Add operating city — returns only { id } per spec; caller constructs full GuideCity
 */
export async function addGuideCity(guideId: string, payload: AddGuideCityPayload): Promise<{ id: string }> {
  return apiPost<{ id: string }>(`/guides/provider/${guideId}/cities/`, payload)
}

/**
 * Remove operating city from guide
 */
export async function removeGuideCity(guideId: string, cityEntryId: string): Promise<void> {
  await apiDelete(`/guides/provider/${guideId}/cities/${cityEntryId}/`)
}

// ============================================================================
// Provider Photos Management
// ============================================================================

/**
 * Get guide photos
 */
export async function getGuidePhotos(guideId: string): Promise<GuidePhoto[]> {
  const raw = await apiGet<any>(`/guides/provider/${guideId}/photos/`)
  return Array.isArray(raw) ? raw : (raw?.results ?? [])
}

/**
 * Upload guide photo — multipart/form-data, field name is "photo_url" per spec
 */
export async function uploadGuidePhoto(
  guideId: string,
  file: File,
  options?: { caption?: string; display_order?: number; is_primary?: boolean }
): Promise<GuidePhoto> {
  const formData = new FormData()
  formData.append("photo_url", file)
  if (options?.caption) formData.append("caption", options.caption)
  if (options?.display_order !== undefined) formData.append("display_order", String(options.display_order))
  if (options?.is_primary !== undefined) formData.append("is_primary", String(options.is_primary))

  return apiFetch<GuidePhoto>(`/guides/provider/${guideId}/photos/`, {
    method: "POST",
    body: formData,
  })
}

/**
 * Delete guide photo
 */
export async function deleteGuidePhoto(guideId: string, photoId: string): Promise<void> {
  await apiDelete(`/guides/provider/${guideId}/photos/${photoId}/`)
}

// ============================================================================
// Provider Bookings Management
// ============================================================================

/**
 * Get bookings for provider's guides
 */
export async function getProviderGuideBookings(params?: {
  status?: GuideBookingStatus
  guide_id?: string
}): Promise<GuideBooking[]> {
  const searchParams = new URLSearchParams()
  if (params?.status) searchParams.append("status", params.status)
  if (params?.guide_id) searchParams.append("guide_id", params.guide_id)
  const query = searchParams.toString() ? `?${searchParams.toString()}` : ""
  const raw = await apiGet<any>(`/guides/provider/bookings/${query}`)
  return Array.isArray(raw) ? raw : (raw?.results ?? [])
}

/**
 * Confirm guide booking (Provider)
 */
export async function confirmGuideBooking(bookingId: string): Promise<void> {
  await apiPost(`/guides/provider/bookings/${bookingId}/confirm/`, {})
}

/**
 * Reject guide booking (Provider)
 */
export async function rejectGuideBooking(bookingId: string, reason: string): Promise<void> {
  await apiPost(`/guides/provider/bookings/${bookingId}/reject/`, { reason })
}

// ============================================================================
// Utility Functions
// ============================================================================

export const SERVICE_TYPE_LABELS: Record<GuideServiceType, string> = {
  private_tour: "Private Tour Guide",
  group_tour: "Group Tour Guide",
  driver: "Driver / Transport Guide",
  photographer: "Travel Photographer",
  hiking_guide: "Hiking & Trekking Guide",
  cultural_guide: "Cultural Guide",
  interpreter: "Interpreter / Translator",
  custom: "Custom Service",
}

export const PRICING_TYPE_LABELS: Record<GuidePricingType, string> = {
  hourly: "Per Hour",
  daily: "Per Day",
  per_person: "Per Person",
  per_group: "Per Group (Fixed)",
}

export function calculateTotalPrice(
  price: number,
  pricingType: GuidePricingType,
  options: { hoursRequested?: number; numAdults?: number; numChildren?: number }
): number {
  switch (pricingType) {
    case "hourly":
      return price * (options.hoursRequested || 1)
    case "daily":
    case "per_group":
      return price
    case "per_person":
      return price * ((options.numAdults || 1) + (options.numChildren || 0))
    default:
      return price
  }
}
