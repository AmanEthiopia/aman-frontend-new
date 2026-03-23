/**
 * Traveler Itinerary API
 * Personal travel plans that travelers build themselves
 */

import { apiFetch, apiGet, apiPost, apiPatch, apiDelete } from "./client"

// ============================================================================
// Types
// ============================================================================

export type TripStatus = "draft" | "active" | "completed" | "archived"
export type TripTab = "current" | "upcoming" | "past"
export type ItemType = "hotel" | "restaurant" | "attraction" | "experience" | "guide" | "transport" | "custom"
export type ItemStatus = "planned" | "confirmed"

// Linked resources (partial, as returned by API)
export interface LinkedHotel {
  id: string
  name: string
  slug: string
  star_rating?: number
  address?: string
  average_rating?: string
  cover_photo?: string
}

export interface LinkedRestaurant {
  id: string
  name: string
  slug: string
  cuisine_type?: string
  address?: string
  average_rating?: string
  cover_photo?: string
}

export interface LinkedAttraction {
  id: string
  name: string
  slug: string
  category?: string
  address?: string
  average_rating?: string
  cover_photo?: string
}

export interface LinkedExperience {
  id: string
  title: string
  slug: string
  category?: string
  duration_days?: number
  average_rating?: string
  primary_photo_url?: string
}

export interface LinkedGuide {
  id: string
  title: string
  slug: string
  nickname?: string
  service_type?: string
  average_rating?: string
  primary_photo_url?: string
}

// Itinerary item
export interface ItineraryItem {
  id: string
  item_type: ItemType
  status: ItemStatus
  order: number
  time_slot?: string
  duration_minutes?: number
  // Linked resources (only one will be populated based on item_type)
  hotel?: LinkedHotel | null
  restaurant?: LinkedRestaurant | null
  attraction?: LinkedAttraction | null
  experience?: LinkedExperience | null
  guide?: LinkedGuide | null
  // For custom/transport items
  title?: string
  description?: string
  location?: string
  notes?: string
}

// Itinerary day
export interface ItineraryDay {
  id: string
  date: string
  title?: string
  notes?: string
  items: ItineraryItem[]
}

// Trip summary (for list view)
export interface TripSummary {
  id: string
  title: string
  description?: string
  start_date: string
  end_date: string
  duration_days: number
  status: TripStatus
  day_count: number
  city_count: number
  confirmed_count: number
  planned_count: number
  cover_photo?: string
  created_at: string
}

// Full trip detail
export interface Trip extends TripSummary {
  days: ItineraryDay[]
  updated_at: string
}

// API response types
interface PaginatedTrips {
  count: number
  next: string | null
  previous: string | null
  results: TripSummary[]
}

// ============================================================================
// Trip CRUD
// ============================================================================

export interface ListTripsParams {
  tab?: TripTab
  status?: TripStatus
  page?: number
  page_size?: number
}

/**
 * List my trip plans with optional filtering
 */
export async function getMyTrips(params: ListTripsParams = {}): Promise<TripSummary[]> {
  const query = new URLSearchParams()
  if (params.tab) query.append("tab", params.tab)
  if (params.status) query.append("status", params.status)
  if (params.page) query.append("page", String(params.page))
  if (params.page_size) query.append("page_size", String(params.page_size))

  const endpoint = `/itinerary/${query.toString() ? `?${query}` : ""}`
  
  try {
    const response = await apiGet<PaginatedTrips | TripSummary[]>(endpoint)
    if (Array.isArray(response)) return response
    if (response && "results" in response) return response.results
    return []
  } catch {
    return []
  }
}

/**
 * Get trips by tab with pagination info
 */
export async function getMyTripsPaginated(params: ListTripsParams = {}): Promise<PaginatedTrips> {
  const query = new URLSearchParams()
  if (params.tab) query.append("tab", params.tab)
  if (params.status) query.append("status", params.status)
  if (params.page) query.append("page", String(params.page))
  if (params.page_size) query.append("page_size", String(params.page_size))

  const endpoint = `/itinerary/${query.toString() ? `?${query}` : ""}`
  
  try {
    const response = await apiGet<PaginatedTrips | TripSummary[]>(endpoint)
    if (Array.isArray(response)) {
      return { count: response.length, next: null, previous: null, results: response }
    }
    if (response && "results" in response) return response
    return { count: 0, next: null, previous: null, results: [] }
  } catch {
    return { count: 0, next: null, previous: null, results: [] }
  }
}

export interface CreateTripPayload {
  title: string
  description?: string
  start_date: string
  end_date: string
  cover_photo?: File
}

/**
 * Create a new trip plan
 */
export async function createTrip(payload: CreateTripPayload): Promise<{ id: string }> {
  if (payload.cover_photo) {
    const formData = new FormData()
    formData.append("title", payload.title)
    if (payload.description) formData.append("description", payload.description)
    formData.append("start_date", payload.start_date)
    formData.append("end_date", payload.end_date)
    formData.append("cover_photo", payload.cover_photo)
    
    return apiFetch<{ id: string }>("/itinerary/", {
      method: "POST",
      body: formData,
    })
  }
  
  return apiPost<{ id: string }>("/itinerary/", payload)
}

/**
 * Get full trip detail with all days and items
 */
export async function getTripDetail(tripId: string): Promise<Trip> {
  return apiGet<Trip>(`/itinerary/${tripId}/`)
}

export interface UpdateTripPayload {
  title?: string
  description?: string
  start_date?: string
  end_date?: string
  status?: TripStatus
  cover_photo?: File
}

/**
 * Update a trip
 */
export async function updateTrip(tripId: string, payload: UpdateTripPayload): Promise<Trip> {
  if (payload.cover_photo) {
    const formData = new FormData()
    if (payload.title) formData.append("title", payload.title)
    if (payload.description) formData.append("description", payload.description)
    if (payload.start_date) formData.append("start_date", payload.start_date)
    if (payload.end_date) formData.append("end_date", payload.end_date)
    if (payload.status) formData.append("status", payload.status)
    formData.append("cover_photo", payload.cover_photo)
    
    return apiFetch<Trip>(`/itinerary/${tripId}/`, {
      method: "PATCH",
      body: formData,
    })
  }
  
  return apiPatch<Trip>(`/itinerary/${tripId}/`, payload)
}

/**
 * Delete a trip plan
 */
export async function deleteTrip(tripId: string): Promise<void> {
  return apiDelete(`/itinerary/${tripId}/`)
}

// ============================================================================
// Day Management
// ============================================================================

export interface CreateDayPayload {
  date: string
  title?: string
  notes?: string
}

/**
 * List days in a trip
 */
export async function getTripDays(tripId: string): Promise<ItineraryDay[]> {
  return apiGet<ItineraryDay[]>(`/itinerary/${tripId}/days/`)
}

/**
 * Add a day to the trip
 */
export async function addTripDay(tripId: string, payload: CreateDayPayload): Promise<{ id: string; date: string }> {
  return apiPost<{ id: string; date: string }>(`/itinerary/${tripId}/days/`, payload)
}

export interface UpdateDayPayload {
  title?: string
  notes?: string
}

/**
 * Update a day
 */
export async function updateTripDay(tripId: string, dayId: string, payload: UpdateDayPayload): Promise<ItineraryDay> {
  return apiPatch<ItineraryDay>(`/itinerary/${tripId}/days/${dayId}/`, payload)
}

/**
 * Delete a day
 */
export async function deleteTripDay(tripId: string, dayId: string): Promise<void> {
  return apiDelete(`/itinerary/${tripId}/days/${dayId}/`)
}

// ============================================================================
// Item Management
// ============================================================================

export interface CreateItemPayload {
  item_type: ItemType
  order?: number
  time_slot?: string
  duration_minutes?: number
  status?: ItemStatus
  // Resource IDs (based on item_type)
  hotel_id?: string
  restaurant_id?: string
  attraction_id?: string
  experience_id?: string
  guide_id?: string
  // For custom/transport items
  title?: string
  description?: string
  location?: string
  notes?: string
}

/**
 * List items in a day
 */
export async function getDayItems(tripId: string, dayId: string): Promise<ItineraryItem[]> {
  return apiGet<ItineraryItem[]>(`/itinerary/${tripId}/days/${dayId}/items/`)
}

/**
 * Add an item to a day
 */
export async function addDayItem(tripId: string, dayId: string, payload: CreateItemPayload): Promise<{ id: string }> {
  return apiPost<{ id: string }>(`/itinerary/${tripId}/days/${dayId}/items/`, payload)
}

export interface UpdateItemPayload {
  status?: ItemStatus
  order?: number
  time_slot?: string
  duration_minutes?: number
  title?: string
  description?: string
  location?: string
  notes?: string
}

/**
 * Update an item
 */
export async function updateDayItem(
  tripId: string,
  dayId: string,
  itemId: string,
  payload: UpdateItemPayload
): Promise<ItineraryItem> {
  return apiPatch<ItineraryItem>(`/itinerary/${tripId}/days/${dayId}/items/${itemId}/`, payload)
}

/**
 * Delete an item
 */
export async function deleteDayItem(tripId: string, dayId: string, itemId: string): Promise<void> {
  return apiDelete(`/itinerary/${tripId}/days/${dayId}/items/${itemId}/`)
}

/**
 * Mark an item as confirmed
 */
export async function confirmItem(tripId: string, dayId: string, itemId: string): Promise<ItineraryItem> {
  return updateDayItem(tripId, dayId, itemId, { status: "confirmed" })
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get display name for an itinerary item
 */
export function getItemDisplayName(item: ItineraryItem): string {
  switch (item.item_type) {
    case "hotel":
      return item.hotel?.name || item.title || "Hotel"
    case "restaurant":
      return item.restaurant?.name || item.title || "Restaurant"
    case "attraction":
      return item.attraction?.name || item.title || "Attraction"
    case "experience":
      return item.experience?.title || item.title || "Experience"
    case "guide":
      return item.guide?.title || item.guide?.nickname || item.title || "Guide"
    case "transport":
    case "custom":
      return item.title || "Activity"
    default:
      return item.title || "Activity"
  }
}

/**
 * Get item slug for linking
 */
export function getItemSlug(item: ItineraryItem): string | null {
  switch (item.item_type) {
    case "hotel":
      return item.hotel?.slug || null
    case "restaurant":
      return item.restaurant?.slug || null
    case "attraction":
      return item.attraction?.slug || null
    case "experience":
      return item.experience?.slug || null
    case "guide":
      return item.guide?.slug || null
    default:
      return null
  }
}

/**
 * Get item detail URL
 */
export function getItemDetailUrl(item: ItineraryItem): string | null {
  const slug = getItemSlug(item)
  if (!slug) return null
  
  switch (item.item_type) {
    case "hotel":
      return `/hotels/${slug}`
    case "restaurant":
      return `/restaurants/${slug}`
    case "attraction":
      return `/attractions/${slug}`
    case "experience":
      return `/experiences/${slug}`
    case "guide":
      return `/guides/${slug}`
    default:
      return null
  }
}

/**
 * Get item booking URL
 */
export function getItemBookingUrl(item: ItineraryItem): string | null {
  const slug = getItemSlug(item)
  if (!slug) return null
  
  switch (item.item_type) {
    case "hotel":
      return `/book/hotel/${slug}`
    case "restaurant":
      return `/book/restaurant/${slug}`
    case "experience":
      return `/book/experience/${slug}`
    case "guide":
      return `/book/guide/${slug}`
    default:
      return null
  }
}

/**
 * Get item image URL
 */
export function getItemImageUrl(item: ItineraryItem): string | null {
  switch (item.item_type) {
    case "hotel":
      return item.hotel?.cover_photo || null
    case "restaurant":
      return item.restaurant?.cover_photo || null
    case "attraction":
      return item.attraction?.cover_photo || null
    case "experience":
      return item.experience?.primary_photo_url || null
    case "guide":
      return item.guide?.primary_photo_url || null
    default:
      return null
  }
}

/**
 * Format time slot for display
 */
export function formatTimeSlot(timeSlot?: string): string {
  if (!timeSlot) return ""
  // Handle HH:MM:SS format
  const parts = timeSlot.split(":")
  if (parts.length >= 2) {
    const hours = parseInt(parts[0], 10)
    const minutes = parts[1]
    const period = hours >= 12 ? "PM" : "AM"
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes} ${period}`
  }
  return timeSlot
}

/**
 * Get trip status badge variant
 */
export function getTripStatusVariant(status: TripStatus): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "active":
      return "default"
    case "completed":
      return "secondary"
    case "draft":
      return "outline"
    case "archived":
      return "outline"
    default:
      return "secondary"
  }
}
