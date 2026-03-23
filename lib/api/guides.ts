"use client"

import { apiFetch, apiPost, apiGet, apiPatch, apiDelete } from "./client"

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
  organizer?: GuideOrganizer
  cities: GuideCity[]
  photos: GuidePhoto[]
  primary_photo?: GuidePhoto
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
// Public API - Browse & View Guides
// ============================================================================

const API_BASE_URL = "https://api.aman.yichalal.ai/api/v1"

/**
 * Search/list guides with optional filters
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

    if (!response.ok) {
      throw new Error(`Failed to fetch guides: ${response.statusText}`)
    }

    const data = await response.json()

    // Handle envelope format: { success: true, data: {...} }
    if (data.success !== undefined && data.data) {
      if (Array.isArray(data.data)) {
        return { results: data.data, count: data.data.length, next: null, previous: null }
      }
      return data.data as PaginatedGuides
    }

    // Handle direct pagination format
    if (data.results) {
      return data as PaginatedGuides
    }

    // Handle array format
    if (Array.isArray(data)) {
      return { results: data, count: data.length, next: null, previous: null }
    }

    return { results: [], count: 0, next: null, previous: null }
  } catch (error) {
    console.error("[Guides API] Error:", error)
    return { results: [], count: 0, next: null, previous: null }
  }
}

/**
 * Get guides (simple array result)
 */
export async function getGuides(params: GuidesSearchParams = {}): Promise<Guide[]> {
  const response = await searchGuides(params)
  return response.results
}

/**
 * Get paginated guides with count
 */
export async function getGuidesPaginated(params: GuidesSearchParams = {}): Promise<PaginatedGuides> {
  return searchGuides(params)
}

/**
 * Get guide by slug
 */
export async function getGuideBySlug(slug: string): Promise<Guide> {
  return apiFetch<Guide>(`/guides/${slug}/`)
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
  service_type: GuideServiceType
  pricing_type: GuidePricingType
  price: string
  price_currency: string
  primary_photo_url?: string
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

export interface GuideBookingResponse {
  booking: GuideBooking
  payment?: {
    required: boolean
    client_secret?: string
  }
}

/**
 * Book a guide (Traveler)
 */
export async function createGuideBooking(payload: CreateGuideBookingPayload): Promise<GuideBookingResponse> {
  const response = await apiPost<{ data: GuideBookingResponse }>("/guides/bookings/", payload)
  return response.data
}

/**
 * Get my guide bookings (Traveler)
 */
export async function getMyGuideBookings(status?: GuideBookingStatus): Promise<GuideBooking[]> {
  const params = status ? `?status=${status}` : ""
  const response = await apiGet<{ data: GuideBooking[] }>(`/guides/bookings/mine/${params}`)
  return response.data || []
}

/**
 * Get guide booking detail (Traveler)
 */
export async function getGuideBookingById(id: string): Promise<GuideBooking> {
  const response = await apiGet<{ data: GuideBooking }>(`/guides/bookings/${id}/`)
  return response.data
}

/**
 * Cancel guide booking (Traveler)
 */
export async function cancelGuideBooking(id: string, reason?: string): Promise<GuideBooking> {
  const response = await apiPost<{ data: GuideBooking }>(`/guides/bookings/${id}/cancel/`, { reason })
  return response.data
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
 * Get provider's guide listings
 */
export async function getProviderGuides(): Promise<Guide[]> {
  const response = await apiGet<{ data: Guide[] }>("/guides/provider/")
  return response.data || []
}

/**
 * Create a new guide listing (Provider)
 */
export async function createGuide(payload: CreateGuidePayload): Promise<Guide> {
  const response = await apiPost<{ data: Guide }>("/guides/provider/", payload)
  return response.data
}

/**
 * Get guide detail (Provider view)
 */
export async function getProviderGuideById(guideId: string): Promise<Guide> {
  const response = await apiGet<{ data: Guide }>(`/guides/provider/${guideId}/`)
  return response.data
}

/**
 * Update guide (Provider)
 */
export async function updateGuide(guideId: string, payload: UpdateGuidePayload): Promise<Guide> {
  const response = await apiPatch<{ data: Guide }>(`/guides/provider/${guideId}/`, payload)
  return response.data
}

/**
 * Delete/unpublish guide (Provider)
 */
export async function deleteGuide(guideId: string): Promise<void> {
  await apiDelete(`/guides/provider/${guideId}/`)
}

/**
 * Toggle publish status (Provider)
 */
export async function toggleGuidePublish(guideId: string): Promise<{ is_published: boolean }> {
  const response = await apiPost<{ data: { is_published: boolean } }>(`/guides/provider/${guideId}/publish/`, {})
  return response.data
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
  const response = await apiGet<{ data: GuideCity[] }>(`/guides/provider/${guideId}/cities/`)
  return response.data || []
}

/**
 * Add operating city to guide
 */
export async function addGuideCity(guideId: string, payload: AddGuideCityPayload): Promise<GuideCity> {
  const response = await apiPost<{ data: GuideCity }>(`/guides/provider/${guideId}/cities/`, payload)
  return response.data
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
  const response = await apiGet<{ data: GuidePhoto[] }>(`/guides/provider/${guideId}/photos/`)
  return response.data || []
}

/**
 * Upload guide photo
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

  const response = await fetch(`${API_BASE_URL}/guides/provider/${guideId}/photos/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("aman_access_token") : ""}`,
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error("Failed to upload photo")
  }

  const data = await response.json()
  return data.data || data
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
  const response = await apiGet<{ data: GuideBooking[] }>(`/guides/provider/bookings/${query}`)
  return response.data || []
}

/**
 * Confirm guide booking (Provider)
 */
export async function confirmGuideBooking(bookingId: string): Promise<GuideBooking> {
  const response = await apiPost<{ data: GuideBooking }>(`/guides/provider/bookings/${bookingId}/confirm/`, {})
  return response.data
}

/**
 * Reject guide booking (Provider)
 */
export async function rejectGuideBooking(bookingId: string, reason?: string): Promise<GuideBooking> {
  const response = await apiPost<{ data: GuideBooking }>(`/guides/provider/bookings/${bookingId}/reject/`, { reason })
  return response.data
}

// ============================================================================
// Utility Functions
// ============================================================================

export const SERVICE_TYPE_LABELS: Record<GuideServiceType, string> = {
  private_tour: "Private Tour Guide",
  group_tour: "Group Tour Guide",
  driver: "Driver & Guide",
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
  per_group: "Per Group",
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
