/**
 * Provider API - For property owners/providers to manage their listings
 * Handles CRUD operations for Hotels, Restaurants, Drivers, and Trips/Events
 */

import { apiGet, apiPost, apiPut, apiPatch, apiDelete, apiFetch, mediaUrl as _mediaUrl } from "./client"
export { mediaUrl } from "./client"

// ============================================================================
// TYPES
// ============================================================================

export type PropertyCategory = "hotel" | "restaurant" | "driver" | "trip" | "tour_guide" | "translator" | "event"

export interface PropertyBase {
  id: string
  name: string
  nickname?: string
  description: string
  category: PropertyCategory
  city_id: string
  city_name?: string
  address: string
  is_verified: boolean
  is_active: boolean      // normalized from is_published on load
  is_published?: boolean  // raw API field — same as is_active
  // verified | pending | in_review | change_requested | rejected | unverified
  verification_status?: string
  created_at: string
  updated_at: string
  cover_photo_url?: string
  photos?: PropertyPhoto[]
  rating?: number
  review_count?: number
}

export interface PropertyPhoto {
  id: string
  url?: string         // may be missing; use photo_url ?? url with mediaUrl()
  photo_url?: string   // API field name
  photo_type?: string
  caption?: string
  category?: string
  is_primary: boolean
  display_order?: number
  order?: number
}

const mediaUrl = _mediaUrl

// Normalizes a raw API property object: maps is_published → is_active,
// and resolves photo_url → url so existing display code keeps working.
function normalizeProp<T extends Record<string, any>>(raw: T): T {
  const photos = (raw.photos ?? []).map((p: any) => ({
    ...p,
    url: mediaUrl(p.photo_url ?? p.url),
  }))
  const rooms = (raw.rooms ?? []).map((r: any) => ({
    ...r,
    photos: (r.photos ?? []).map((p: any) => ({
      ...p,
      url: mediaUrl(p.photo_url ?? p.url),
    })),
  }))
  return {
    ...raw,
    is_active: raw.is_published ?? raw.is_active ?? false,
    cover_photo_url: mediaUrl(raw.cover_photo_url) ?? raw.cover_photo_url,
    photos,
    ...(raw.rooms !== undefined ? { rooms } : {}),
  }
}

// Maps a provider property category to the unified verification entity_type.
const CATEGORY_TO_ENTITY: Record<string, string> = {
  hotel: "hotel",
  restaurant: "restaurant",
  trip: "package",
  driver: "driver",
  tour_guide: "guide",
}

/**
 * Request verification for a published listing. Simple flow (no documents) —
 * flags the listing to the Alga Ale team and sets its status to "pending".
 */
export async function requestVerification(
  category: PropertyCategory,
  id: string,
  note?: string,
): Promise<{ id: string; status: string }> {
  const entityType = CATEGORY_TO_ENTITY[category] ?? category
  return apiPost<{ id: string; status: string }>(
    `/admin/verifications/submit/?entity_type=${entityType}&entity_id=${id}`,
    { submitter_notes: note ?? "" },
  )
}

// Amenity as returned by GET /hotels/provider/<id>/ — objects, not strings
export interface HotelAmenity {
  id: string
  amenity_type: string
  is_free?: boolean
  description?: string
}

// Hotel Types
export interface ProviderHotel extends PropertyBase {
  category: "hotel"
  star_rating: 1 | 2 | 3 | 4 | 5
  check_in_time: string
  check_out_time: string
  amenities?: HotelAmenity[] | string[]
  policies?: HotelPolicies
  rooms?: ProviderRoom[]
  total_rooms?: number
  available_rooms?: number
}

// Helper: extract display string from either amenity shape
export function amenityLabel(a: HotelAmenity | string): string {
  return typeof a === "string" ? a : a.amenity_type
}

export interface HotelPolicies {
  cancellation_policy?: string
  pet_policy?: string
  smoking_policy?: string
  child_policy?: string
}

export interface ProviderRoom {
  id: string
  hotel_id?: string
  hotel?: string // API returns hotel UUID as "hotel"
  name: string
  description: string
  room_type?: "standard" | "deluxe" | "suite" | "executive" | "family"
  // API response uses base_price / max_adults / total_units; frontend form uses the aliases below
  base_price?: number | string
  price_per_night?: number  // alias for base_price in CreateRoomPayload (USD)
  price_etb?: number        // ETB price (optional alongside USD)
  max_adults?: number
  max_children?: number
  max_guests?: number       // alias for max_adults in CreateRoomPayload
  bed_type: string
  bed_count?: number
  room_size_sqm?: number | null
  currency?: string
  weekend_price?: number | null
  amenities: HotelAmenity[] | string[]
  photos: PropertyPhoto[]
  is_available: boolean
  total_units?: number
  quantity?: number         // alias for total_units in CreateRoomPayload
}

export interface CreateHotelPayload {
  name: string
  nickname?: string
  description: string
  category: "hotel"
  star_rating: 1 | 2 | 3 | 4 | 5
  address: string
  latitude?: number | null
  longitude?: number | null
  city_id: string
  check_in_time: string
  check_out_time: string
  amenities?: string[]
}

export interface CreateRoomPayload {
  name: string
  description: string
  room_type: "standard" | "deluxe" | "suite" | "executive" | "family"
  price_per_night?: number  // USD price (optional — at least one of price_per_night or price_etb expected)
  price_etb?: number        // ETB price (optional)
  max_guests: number
  bed_type: string
  amenities?: string[]
  quantity: number
  gender_restriction?: "none" | "male_only" | "female_only"
}

// Restaurant Types
export interface ProviderRestaurant extends PropertyBase {
  category: "restaurant"
  cuisine_types: string[]
  price_range: "budget" | "moderate" | "expensive" | "fine_dining"
  opening_hours: Record<string, string>
  seating_capacity?: number
  has_delivery: boolean
  has_takeaway: boolean
  has_dine_in: boolean
  menu_url?: string
}

export interface CreateRestaurantPayload {
  name: string
  nickname?: string
  description: string
  category: "restaurant"
  cuisine_types: string[]
  price_range: "budget" | "moderate" | "expensive" | "fine_dining"
  address: string
  latitude?: number | null
  longitude?: number | null
  city_id: string
  opening_hours: Record<string, string>
  seating_capacity?: number
  has_delivery?: boolean
  has_takeaway?: boolean
  has_dine_in?: boolean
}

// Driver Types
export interface ProviderDriver extends PropertyBase {
  category: "driver"
  vehicle_type: "sedan" | "suv" | "van" | "minibus" | "bus" | "motorcycle"
  vehicle_make?: string
  vehicle_model?: string
  vehicle_year?: number
  license_plate?: string
  max_passengers: number
  languages: string[]
  services: DriverService[]
  price_per_km?: number
  price_per_hour?: number
  price_per_day?: number
  is_airport_pickup: boolean
  is_available_24h: boolean
}

export type DriverService = 
  | "airport_pickup" 
  | "airport_dropoff" 
  | "city_tour" 
  | "intercity" 
  | "hourly_rental" 
  | "daily_rental"
  | "hotel_transfer"

export interface CreateDriverPayload {
  name: string
  nickname?: string
  description: string
  category: "driver"
  vehicle_type: "sedan" | "suv" | "van" | "minibus" | "bus" | "motorcycle"
  vehicle_make?: string
  vehicle_model?: string
  vehicle_year?: number
  license_plate?: string
  max_passengers: number
  languages: string[]
  services: DriverService[]
  city_id: string
  address: string
  latitude?: number | null
  longitude?: number | null
  price_per_km?: number
  price_per_hour?: number
  price_per_day?: number
  is_airport_pickup?: boolean
  is_available_24h?: boolean
}

// Tour Guide Types
export interface ProviderTourGuide extends PropertyBase {
  category: "tour_guide"
  languages: string[]
  specializations: string[] // e.g., "Historical Sites", "Cultural Tours", "Adventure"
  experience_years: number
  certifications?: string[]
  price_per_hour?: number
  price_per_day?: number
  cities_covered: string[]
  availability: string // e.g., "Weekdays", "Weekends", "Flexible"
  bio?: string
}

export interface CreateTourGuidePayload {
  name: string
  nickname?: string
  description: string
  category: "tour_guide"
  languages: string[]
  specializations: string[]
  experience_years: number
  certifications?: string[]
  city_id: string
  address: string
  price_per_hour?: number
  price_per_day?: number
  cities_covered: string[]
  availability?: string
  bio?: string
}

// Translator Types
export interface ProviderTranslator extends PropertyBase {
  category: "translator"
  languages: string[] // Languages they can translate
  language_pairs: { from: string; to: string }[]
  specializations: string[] // e.g., "Business", "Legal", "Medical", "Tourism"
  experience_years: number
  certifications?: string[]
  price_per_hour?: number
  price_per_day?: number
  is_certified: boolean
  availability: string
  bio?: string
}

export interface CreateTranslatorPayload {
  name: string
  nickname?: string
  description: string
  category: "translator"
  languages: string[]
  language_pairs?: { from: string; to: string }[]
  specializations: string[]
  experience_years: number
  certifications?: string[]
  city_id: string
  address: string
  price_per_hour?: number
  price_per_day?: number
  is_certified?: boolean
  availability?: string
  bio?: string
}

// Trip/Event Types
export interface ProviderTrip extends PropertyBase {
  category: "trip"
  trip_type: "day_trip" | "multi_day" | "tour_package" | "cultural_event" | "adventure"
  duration_days: number
  duration_hours?: number
  start_city_id: string
  end_city_id?: string
  cities_covered: string[]
  price_per_person: number
  group_discount_percentage?: number
  min_group_size: number
  max_group_size: number
  included_services: string[]
  excluded_services?: string[]
  itinerary: TripItineraryDay[]
  available_dates?: string[]
  is_customizable: boolean
  terms_conditions?: string // Terms & conditions
  important_info?: string // Important info participants should know
  additional_features?: string[] // Additional features/services
}

export interface TripItineraryDay {
  day: number
  title: string
  description: string
  activities: TripActivity[]
}

export interface TripActivity {
  time: string
  activity: string
  location?: string
  property_id?: string // Reference to hotel, restaurant, or attraction
  property_type?: "hotel" | "restaurant" | "attraction" | "experience"
  notes?: string
}

export interface CreateTripPayload {
  name: string
  nickname?: string
  description: string
  category: "trip"
  trip_type: "day_trip" | "multi_day" | "tour_package" | "cultural_event" | "adventure"
  duration_days: number
  duration_hours?: number
  start_city_id: string
  end_city_id?: string
  city_id: string // Primary city for listing
  address: string
  latitude?: number | null
  longitude?: number | null
  meeting_point?: string
  cities_covered: string[]
  price_per_person: number
  group_discount_percentage?: number
  min_group_size: number
  max_group_size: number
  included_services: string[]
  excluded_services?: string[]
  itinerary: TripItineraryDay[]
  is_customizable?: boolean
  terms_conditions?: string
  important_info?: string
  additional_features?: string[]
}

// Provider Stats
export interface ProviderStats {
  total_properties: number
  total_bookings: number
  pending_bookings: number
  confirmed_bookings: number
  total_revenue: number
  monthly_revenue: number
  average_rating: number
  total_reviews: number
  response_rate: number
  occupancy_rate?: number
}

// Provider Booking
export interface ProviderBooking {
  id: string
  property_id: string
  property_name: string
  property_type: PropertyCategory
  guest_id: string
  guest_name: string
  guest_email: string
  guest_phone?: string
  guest_avatar?: string
  check_in: string
  check_out?: string
  guests: number
  room_type?: string
  total_price: number
  status: "pending" | "confirmed" | "cancelled" | "completed"
  special_requests?: string
  created_at: string
  updated_at: string
}

// API Response Types
export interface PaginatedResponse<T> {
  count: number
  page: number
  page_size: number
  num_pages: number
  next: string | null
  previous: string | null
  results: T[]
}

// ============================================================================
// PROVIDER PROPERTIES API
// ============================================================================

/**
 * Get all properties owned by the current provider
 */
export async function getMyProperties(params: {
  category?: PropertyCategory
  is_active?: boolean
  page?: number
  page_size?: number
} = {}): Promise<PaginatedResponse<PropertyBase>> {
  const queryParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value))
    }
  })

  const queryString = queryParams.toString()
  const endpoint = queryString ? `/provider/properties/?${queryString}` : "/provider/properties/"

  const result = await apiGet<any>(endpoint)
  // Normalize each item: is_published → is_active, photo_url → url
  const items: PropertyBase[] = (Array.isArray(result) ? result : result?.results ?? []).map(normalizeProp)
  return Array.isArray(result) ? (items as any) : { ...result, results: items }
}

/**
 * Get provider dashboard stats
 */
export async function getProviderStats(): Promise<ProviderStats> {
  return apiGet<ProviderStats>("/provider/stats/")
}

// ============================================================================
// HOTELS API
// ============================================================================

/**
 * Create a new hotel
 */
export async function createHotel(payload: CreateHotelPayload): Promise<ProviderHotel> {
  return apiPost<ProviderHotel>("/hotels/provider/", payload)
}

/**
 * Get provider's hotels
 */
export async function getMyHotels(params: {
  is_active?: boolean
  page?: number
  page_size?: number
} = {}): Promise<PaginatedResponse<ProviderHotel>> {
  const queryParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value))
    }
  })

  const queryString = queryParams.toString()
  const endpoint = queryString ? `/hotels/provider/?${queryString}` : "/hotels/provider/"

  return apiGet<PaginatedResponse<ProviderHotel>>(endpoint)
}

/**
 * Get a specific hotel by ID
 */
export async function getMyHotel(hotelId: string): Promise<ProviderHotel> {
  const data = await apiGet<any>(`/hotels/provider/${hotelId}/`)
  return normalizeProp(data) as ProviderHotel
}

/**
 * Update a hotel
 */
export async function updateHotel(hotelId: string, payload: Partial<CreateHotelPayload>): Promise<ProviderHotel> {
  return apiPatch<ProviderHotel>(`/hotels/provider/${hotelId}/`, payload)
}

/**
 * Delete a hotel
 */
export async function deleteHotel(hotelId: string): Promise<void> {
  return apiDelete(`/hotels/provider/${hotelId}/`)
}

/**
 * Publish a hotel
 */
export async function publishHotel(hotelId: string): Promise<{ is_published: boolean; is_verified: boolean }> {
  return apiPut<{ is_published: boolean; is_verified: boolean }>(`/hotels/provider/${hotelId}/publish/`, {})
}

/**
 * Unpublish a hotel — hides it from public results without deleting it.
 * Idempotent: returns 200 even if already unpublished.
 */
export async function unpublishHotel(hotelId: string): Promise<void> {
  await apiPut(`/hotels/provider/${hotelId}/unpublish/`, {})
}

/**
 * Get a single room by ID
 */
export async function getMyRoom(hotelId: string, roomId: string): Promise<ProviderRoom> {
  return apiGet<ProviderRoom>(`/hotels/provider/${hotelId}/rooms/${roomId}/`)
}

/**
 * Create a room for a hotel
 */
export async function createRoom(hotelId: string, payload: CreateRoomPayload): Promise<ProviderRoom> {
  return apiPost<ProviderRoom>(`/hotels/provider/${hotelId}/rooms/`, payload)
}

/**
 * Update a room
 */
export async function updateRoom(hotelId: string, roomId: string, payload: Partial<CreateRoomPayload>): Promise<ProviderRoom> {
  return apiPatch<ProviderRoom>(`/hotels/provider/${hotelId}/rooms/${roomId}/`, payload)
}

/**
 * Delete a room
 */
export async function deleteRoom(hotelId: string, roomId: string): Promise<void> {
  return apiDelete(`/hotels/provider/${hotelId}/rooms/${roomId}/`)
}

// ============================================================================
// RESTAURANTS API
// ============================================================================

/**
 * Create a new restaurant
 */
export async function createRestaurant(payload: CreateRestaurantPayload): Promise<ProviderRestaurant> {
  return apiPost<ProviderRestaurant>("/restaurants/provider/", payload)
}

/**
 * Get provider's restaurants
 */
export async function getMyRestaurants(params: {
  is_active?: boolean
  page?: number
  page_size?: number
} = {}): Promise<PaginatedResponse<ProviderRestaurant>> {
  const queryParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value))
    }
  })

  const queryString = queryParams.toString()
  const endpoint = queryString ? `/restaurants/provider/?${queryString}` : "/restaurants/provider/"

  return apiGet<PaginatedResponse<ProviderRestaurant>>(endpoint)
}

/**
 * Get a specific restaurant by ID
 */
export async function getMyRestaurant(restaurantId: string): Promise<ProviderRestaurant> {
  const data = await apiGet<any>(`/restaurants/provider/${restaurantId}/`)
  return normalizeProp(data) as ProviderRestaurant
}

/**
 * Update a restaurant
 */
export async function updateRestaurant(restaurantId: string, payload: Partial<CreateRestaurantPayload>): Promise<ProviderRestaurant> {
  return apiPatch<ProviderRestaurant>(`/restaurants/provider/${restaurantId}/`, payload)
}

/**
 * Delete a restaurant
 */
export async function deleteRestaurant(restaurantId: string): Promise<void> {
  return apiDelete(`/restaurants/provider/${restaurantId}/`)
}

/**
 * Publish a restaurant
 */
export async function publishRestaurant(restaurantId: string): Promise<{ is_published: boolean; is_verified: boolean }> {
  return apiPut<{ is_published: boolean; is_verified: boolean }>(`/restaurants/provider/${restaurantId}/publish/`, {})
}

/**
 * Unpublish a restaurant — hides it from public results without deleting it.
 * Idempotent: returns 200 even if already unpublished.
 */
export async function unpublishRestaurant(restaurantId: string): Promise<void> {
  await apiPut(`/restaurants/provider/${restaurantId}/unpublish/`, {})
}

// ============================================================================
// DRIVERS API
// ============================================================================

/**
 * Create a new driver listing
 */
export async function createDriver(payload: CreateDriverPayload): Promise<ProviderDriver> {
  return apiPost<ProviderDriver>("/drivers/", payload)
}

/**
 * Get provider's driver listings
 */
export async function getMyDrivers(params: {
  is_active?: boolean
  page?: number
  page_size?: number
} = {}): Promise<PaginatedResponse<ProviderDriver>> {
  const queryParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value))
    }
  })

  const queryString = queryParams.toString()
  const endpoint = queryString ? `/provider/drivers/?${queryString}` : "/provider/drivers/"
  
  return apiGet<PaginatedResponse<ProviderDriver>>(endpoint)
}

/**
 * Get a specific driver by ID
 */
export async function getMyDriver(driverId: string): Promise<ProviderDriver> {
  const data = await apiGet<any>(`/drivers/${driverId}/`)
  return normalizeProp(data) as ProviderDriver
}

/**
 * Update a driver listing
 */
export async function updateDriver(driverId: string, payload: Partial<CreateDriverPayload>): Promise<ProviderDriver> {
  return apiPatch<ProviderDriver>(`/drivers/${driverId}/`, payload)
}

/**
 * Delete a driver listing
 */
export async function deleteDriver(driverId: string): Promise<void> {
  return apiDelete(`/drivers/${driverId}/`)
}

/**
 * Publish a driver listing (POST per spec). Gated: may fail with 400 if the
 * provider profile is incomplete.
 */
export async function toggleDriverPublish(driverId: string): Promise<{ is_published: boolean; is_verified?: boolean }> {
  return apiPost<{ is_published: boolean; is_verified?: boolean }>(`/transport/drivers/${driverId}/publish/`, {})
}

/**
 * Unpublish a driver listing — hides it from public results without deleting it.
 * Idempotent: returns 200 even if already unpublished.
 */
export async function unpublishDriver(driverId: string): Promise<void> {
  await apiPut(`/transport/drivers/${driverId}/unpublish/`, {})
}

// ============================================================================
// TRIPS/EVENTS API
// ============================================================================

/**
 * Create a new trip/event
 */
export async function createTrip(payload: CreateTripPayload): Promise<ProviderTrip> {
  return apiPost<ProviderTrip>("/trips/", payload)
}

/**
 * Get provider's trips/events
 */
export async function getMyTrips(params: {
  is_active?: boolean
  trip_type?: string
  page?: number
  page_size?: number
} = {}): Promise<PaginatedResponse<ProviderTrip>> {
  const queryParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value))
    }
  })

  const queryString = queryParams.toString()
  const endpoint = queryString ? `/provider/trips/?${queryString}` : "/provider/trips/"
  
  return apiGet<PaginatedResponse<ProviderTrip>>(endpoint)
}

/**
 * Get a single trip by ID
 */
export async function getMyTrip(tripId: string): Promise<ProviderTrip> {
  const data = await apiGet<any>(`/trips/${tripId}/`)
  return normalizeProp(data) as ProviderTrip
}

/**
 * Toggle publish / unpublish a trip
 */
export async function toggleTripPublish(tripId: string): Promise<{ is_published: boolean; is_verified: boolean }> {
  return apiPost<{ is_published: boolean; is_verified: boolean }>(`/trips/${tripId}/publish/`, {})
}

/**
 * Update a trip/event
 */
export async function updateTrip(tripId: string, payload: Partial<CreateTripPayload>): Promise<ProviderTrip> {
  return apiPatch<ProviderTrip>(`/trips/${tripId}/`, payload)
}

/**
 * Delete a trip/event
 */
export async function deleteTrip(tripId: string): Promise<void> {
  return apiDelete(`/trips/${tripId}/`)
}

// ============================================================================
// TOUR GUIDES API
// ============================================================================

/**
 * Create a new tour guide listing
 */
export async function createTourGuide(payload: CreateTourGuidePayload): Promise<{ id: string; slug: string }> {
  const pricingType = payload.price_per_hour ? "hourly" : "daily"
  const price = String(payload.price_per_hour || payload.price_per_day || 0)
  return apiPost<{ id: string; slug: string }>("/guides/provider/", {
    title: payload.name,
    nickname: payload.nickname,
    description: payload.description,
    service_type: "cultural_guide",
    pricing_type: pricingType,
    price,
    languages: payload.languages,
    years_experience: payload.experience_years,
    certifications: payload.specializations?.length ? payload.specializations : payload.certifications,
  })
}

/**
 * Get provider's tour guide listings
 */
export async function getMyTourGuides(params: {
  is_active?: boolean
  page?: number
  page_size?: number
} = {}): Promise<PaginatedResponse<ProviderTourGuide>> {
  const queryParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value))
    }
  })

  const queryString = queryParams.toString()
  const endpoint = queryString ? `/provider/tour-guides/?${queryString}` : "/provider/tour-guides/"
  
  return apiGet<PaginatedResponse<ProviderTourGuide>>(endpoint)
}

/**
 * Update a tour guide listing
 */
export async function updateTourGuide(tourGuideId: string, payload: Partial<CreateTourGuidePayload>): Promise<ProviderTourGuide> {
  return apiPatch<ProviderTourGuide>(`/tour-guides/${tourGuideId}/`, payload)
}

/**
 * Delete a tour guide listing
 */
export async function deleteTourGuide(tourGuideId: string): Promise<void> {
  return apiDelete(`/tour-guides/${tourGuideId}/`)
}

// ============================================================================
// TRANSLATORS API
// ============================================================================

/**
 * Create a new translator listing
 */
export async function createTranslator(payload: CreateTranslatorPayload): Promise<{ id: string; slug: string }> {
  const pricingType = payload.price_per_hour ? "hourly" : "daily"
  const price = String(payload.price_per_hour || payload.price_per_day || 0)
  return apiPost<{ id: string; slug: string }>("/guides/provider/", {
    title: payload.name,
    nickname: payload.nickname,
    description: payload.description,
    service_type: "interpreter",
    pricing_type: pricingType,
    price,
    languages: payload.languages,
    years_experience: payload.experience_years,
    certifications: payload.certifications?.length ? payload.certifications : payload.specializations?.length ? payload.specializations : undefined,
  })
}

/**
 * Get provider's translator listings
 */
export async function getMyTranslators(params: {
  is_active?: boolean
  page?: number
  page_size?: number
} = {}): Promise<PaginatedResponse<ProviderTranslator>> {
  const queryParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value))
    }
  })

  const queryString = queryParams.toString()
  const endpoint = queryString ? `/provider/translators/?${queryString}` : "/provider/translators/"
  
  return apiGet<PaginatedResponse<ProviderTranslator>>(endpoint)
}

/**
 * Update a translator listing
 */
export async function updateTranslator(translatorId: string, payload: Partial<CreateTranslatorPayload>): Promise<ProviderTranslator> {
  return apiPatch<ProviderTranslator>(`/translators/${translatorId}/`, payload)
}

/**
 * Delete a translator listing
 */
export async function deleteTranslator(translatorId: string): Promise<void> {
  return apiDelete(`/translators/${translatorId}/`)
}

// ============================================================================
// BOOKINGS API (Using new booking management endpoints)
// ============================================================================

// Provider Dashboard Stats from Booking API
export interface ProviderDashboardData {
  pending_bookings: number
  confirmed_bookings_this_month: number
  revenue_this_month: string
  occupancy_rate: number
  average_rating: number
  total_hotels: number
  total_restaurants?: number
}

// Calendar booking entry
export interface CalendarBookingEntry {
  booking_id: string
  booking_number: string
  guest_name: string
  check_in_date: string
  check_out_date: string
  total_nights: number
  status: "pending" | "confirmed" | "rejected" | "cancelled" | "completed" | "no_show"
  total_price: string
}

export interface CalendarMonthStats {
  total_nights: number
  total_guests: number
  revenue: string
}

export interface CalendarData {
  bookings: CalendarBookingEntry[]
  month_stats: CalendarMonthStats
}

// Earnings data
export interface EarningsTransaction {
  id: string
  booking_number: string
  guest_name: string
  amount: string
  currency: string
  status: string
  date: string
}

export interface EarningsData {
  period: string
  total_revenue: string
  total_bookings: number
  avg_nightly_rate: string
  occupancy_rate: number
  pending_balance: string
  transactions: EarningsTransaction[]
}

/**
 * Get provider dashboard stats
 */
export async function getProviderDashboardData(): Promise<ProviderDashboardData> {
  // apiFetch already unwraps envelope.data — no extra .data needed
  return apiGet<ProviderDashboardData>("/bookings/provider/dashboard/")
}

/**
 * Get provider calendar view
 */
export async function getProviderCalendar(params: {
  year?: number
  month?: number
  hotel_id?: string
} = {}): Promise<CalendarData> {
  const queryParams = new URLSearchParams()
  if (params.year) queryParams.append("year", params.year.toString())
  if (params.month) queryParams.append("month", params.month.toString())
  if (params.hotel_id) queryParams.append("hotel_id", params.hotel_id)

  const queryString = queryParams.toString()
  const endpoint = queryString ? `/bookings/provider/calendar/?${queryString}` : "/bookings/provider/calendar/"

  return apiGet<CalendarData>(endpoint)
}

/**
 * Get provider earnings
 */
export async function getProviderEarnings(params: {
  period?: "this_month" | "last_month" | "this_year"
  hotel_id?: string
} = {}): Promise<EarningsData> {
  const queryParams = new URLSearchParams()
  if (params.period) queryParams.append("period", params.period)
  if (params.hotel_id) queryParams.append("hotel_id", params.hotel_id)

  const queryString = queryParams.toString()
  const endpoint = queryString ? `/bookings/provider/earnings/?${queryString}` : "/bookings/provider/earnings/"

  return apiGet<EarningsData>(endpoint)
}

/**
 * Get provider's bookings (legacy endpoint - still supported)
 */
export async function getMyBookings(params: {
  status?: "pending" | "confirmed" | "cancelled" | "completed"
  property_id?: string
  property_type?: PropertyCategory
  from_date?: string
  to_date?: string
  page?: number
  page_size?: number
} = {}): Promise<PaginatedResponse<ProviderBooking>> {
  const queryParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value))
    }
  })

  const queryString = queryParams.toString()
  const endpoint = queryString ? `/provider/bookings/?${queryString}` : "/provider/bookings/"
  
  return apiGet<PaginatedResponse<ProviderBooking>>(endpoint)
}

/**
 * Get provider hotel bookings (new API)
 */
export async function getProviderHotelBookings(params: {
  status?: "pending" | "confirmed" | "rejected" | "cancelled" | "completed" | "no_show"
  hotel_id?: string
} = {}): Promise<ProviderBooking[]> {
  const queryParams = new URLSearchParams()
  if (params.status) queryParams.append("status", params.status)
  if (params.hotel_id) queryParams.append("hotel_id", params.hotel_id)
  
  const queryString = queryParams.toString()
  const endpoint = queryString ? `/bookings/provider/hotel/?${queryString}` : "/bookings/provider/hotel/"
  
  // apiFetch unwraps envelope.data — returns the array directly
  const result = await apiGet<ProviderBooking[]>(endpoint)
  return Array.isArray(result) ? result : []
}

/**
 * Get provider restaurant reservations (new API)
 */
export async function getProviderRestaurantReservations(params: {
  status?: "pending" | "confirmed" | "rejected" | "cancelled" | "completed" | "no_show"
  restaurant_id?: string
  date?: string
} = {}): Promise<ProviderBooking[]> {
  const queryParams = new URLSearchParams()
  if (params.status) queryParams.append("status", params.status)
  if (params.restaurant_id) queryParams.append("restaurant_id", params.restaurant_id)
  if (params.date) queryParams.append("date", params.date)

  const queryString = queryParams.toString()
  const endpoint = queryString ? `/bookings/provider/restaurant/?${queryString}` : "/bookings/provider/restaurant/"

  const result = await apiGet<ProviderBooking[]>(endpoint)
  return Array.isArray(result) ? result : []
}

/**
 * Confirm a hotel booking (new API)
 */
export async function confirmHotelBooking(bookingId: string): Promise<ProviderBooking> {
  return apiPost<ProviderBooking>(`/bookings/provider/hotel/${bookingId}/confirm/`)
}

/**
 * Reject a hotel booking (new API)
 */
export async function rejectHotelBooking(bookingId: string, reason?: string): Promise<ProviderBooking> {
  return apiPost<ProviderBooking>(`/bookings/provider/hotel/${bookingId}/reject/`, { reason })
}

/**
 * Confirm a restaurant reservation (new API)
 */
export async function confirmRestaurantReservation(reservationId: string): Promise<ProviderBooking> {
  return apiPost<ProviderBooking>(`/bookings/provider/restaurant/${reservationId}/confirm/`)
}

/**
 * Reject a restaurant reservation (new API)
 */
export async function rejectRestaurantReservation(reservationId: string, reason?: string): Promise<ProviderBooking> {
  return apiPost<ProviderBooking>(`/bookings/provider/restaurant/${reservationId}/reject/`, { reason })
}

/**
 * Accept a booking (legacy - redirects to appropriate new endpoint)
 */
export async function acceptBooking(bookingId: string): Promise<ProviderBooking> {
  // Try hotel first, fall back to restaurant
  try {
    return await confirmHotelBooking(bookingId)
  } catch {
    return await confirmRestaurantReservation(bookingId)
  }
}

/**
 * Decline a booking (legacy - redirects to appropriate new endpoint)
 */
export async function declineBooking(bookingId: string, reason?: string): Promise<ProviderBooking> {
  // Try hotel first, fall back to restaurant
  try {
    return await rejectHotelBooking(bookingId, reason)
  } catch {
    return await rejectRestaurantReservation(bookingId, reason)
  }
}

/**
 * Complete a booking
 */
export async function completeBooking(bookingId: string): Promise<ProviderBooking> {
  return apiPost<ProviderBooking>(`/provider/bookings/${bookingId}/complete/`)
}

// ============================================================================
// PHOTOS API
// ============================================================================

/**
 * Upload a photo for a property
 */
export async function uploadPropertyPhoto(
  propertyType: PropertyCategory,
  propertyId: string,
  file: File,
  caption?: string,
  category?: string
): Promise<PropertyPhoto> {
  const formData = new FormData()
  formData.append("photo", file)
  if (caption) formData.append("caption", caption)
  if (category) formData.append("category", category)

  // Hotels and restaurants use /provider/ prefix; drivers and trips use root
  const providerTypes = new Set(["hotel", "restaurant"])
  const basePath = providerTypes.has(propertyType)
    ? `/${propertyType}s/provider/${propertyId}/photos/`
    : `/${propertyType}s/${propertyId}/photos/`

  return apiFetch<PropertyPhoto>(basePath, {
    method: "POST",
    body: formData,
    headers: {}, // Let browser set Content-Type for FormData
  })
}

/**
 * Delete a property photo
 */
export async function deletePropertyPhoto(
  propertyType: PropertyCategory,
  propertyId: string,
  photoId: string
): Promise<void> {
  const providerTypes = new Set(["hotel", "restaurant"])
  const basePath = providerTypes.has(propertyType)
    ? `/${propertyType}s/provider/${propertyId}/photos/${photoId}/`
    : `/${propertyType}s/${propertyId}/photos/${photoId}/`
  return apiDelete(basePath)
}

/**
 * Set a photo as primary (generic — use type-specific helpers below instead)
 */
export async function setPhotoAsPrimary(
  propertyType: PropertyCategory,
  propertyId: string,
  photoId: string
): Promise<PropertyPhoto> {
  const prefix = propertyType === "hotel" || propertyType === "restaurant"
    ? `/${propertyType}s/provider`
    : `/${propertyType}s`
  return apiPost<PropertyPhoto>(`${prefix}/${propertyId}/photos/${photoId}/set-primary/`)
}

// ============================================================================
// HOTEL-SPECIFIC PHOTO APIs
// ============================================================================

export async function getHotelPhotos(hotelId: string): Promise<PropertyPhoto[]> {
  const r = await apiGet<PropertyPhoto[] | { results: PropertyPhoto[] }>(`/hotels/provider/${hotelId}/photos/`)
  const raw = Array.isArray(r) ? r : r?.results ?? []
  return raw.map((p: any) => ({ ...p, url: mediaUrl(p.photo_url ?? p.url) }))
}

export async function uploadHotelPhoto(
  hotelId: string,
  file: File,
  photoType: string,
  isPrimary = false,
  displayOrder?: number
): Promise<PropertyPhoto> {
  const fd = new FormData()
  fd.append("photo", file)
  fd.append("photo_type", photoType)
  if (isPrimary) fd.append("is_primary", "true")
  if (displayOrder !== undefined) fd.append("display_order", String(displayOrder))
  const p = await apiFetch<any>(`/hotels/provider/${hotelId}/photos/`, { method: "POST", body: fd })
  return { ...p, url: mediaUrl(p.photo_url ?? p.url) }
}

export async function deleteHotelPhoto(hotelId: string, photoId: string): Promise<void> {
  return apiDelete(`/hotels/provider/${hotelId}/photos/${photoId}/`)
}

export async function setHotelPhotoPrimary(hotelId: string, photoId: string): Promise<PropertyPhoto> {
  return apiPost<PropertyPhoto>(`/hotels/provider/${hotelId}/photos/${photoId}/set-primary/`)
}

export async function reorderHotelPhotos(
  hotelId: string,
  photoOrders: { id: string; display_order: number }[]
): Promise<void> {
  return apiPut(`/hotels/provider/${hotelId}/photos/reorder/`, { photos: photoOrders })
}

// ============================================================================
// ROOM-SPECIFIC PHOTO APIs
// ============================================================================

export async function getRoomPhotos(hotelId: string, roomId: string): Promise<PropertyPhoto[]> {
  const r = await apiGet<PropertyPhoto[] | { results: PropertyPhoto[] }>(
    `/hotels/provider/${hotelId}/rooms/${roomId}/photos/`
  )
  const raw = Array.isArray(r) ? r : r?.results ?? []
  return raw.map((p: any) => ({ ...p, url: mediaUrl(p.photo_url ?? p.url) }))
}

export async function uploadRoomPhoto(hotelId: string, roomId: string, file: File): Promise<PropertyPhoto> {
  const fd = new FormData()
  fd.append("photo", file)
  const p = await apiFetch<any>(`/hotels/provider/${hotelId}/rooms/${roomId}/photos/`, {
    method: "POST",
    body: fd,
  })
  return { ...p, url: mediaUrl(p.photo_url ?? p.url) }
}

export async function deleteRoomPhoto(hotelId: string, roomId: string, photoId: string): Promise<void> {
  return apiDelete(`/hotels/provider/${hotelId}/rooms/${roomId}/photos/${photoId}/`)
}

// ============================================================================
// RESTAURANT-SPECIFIC PHOTO APIs
// ============================================================================

export async function getRestaurantPhotos(restaurantId: string): Promise<PropertyPhoto[]> {
  const r = await apiGet<PropertyPhoto[] | { results: PropertyPhoto[] }>(
    `/restaurants/provider/${restaurantId}/photos/`
  )
  const raw = Array.isArray(r) ? r : r?.results ?? []
  return raw.map((p: any) => ({ ...p, url: mediaUrl(p.photo_url ?? p.url) }))
}

export async function uploadRestaurantPhoto(
  restaurantId: string,
  file: File,
  photoType: string,
  isPrimary = false
): Promise<PropertyPhoto> {
  const fd = new FormData()
  fd.append("photo", file)
  fd.append("photo_type", photoType)
  if (isPrimary) fd.append("is_primary", "true")
  const p = await apiFetch<any>(`/restaurants/provider/${restaurantId}/photos/`, { method: "POST", body: fd })
  return { ...p, url: mediaUrl(p.photo_url ?? p.url) }
}

export async function deleteRestaurantPhoto(restaurantId: string, photoId: string): Promise<void> {
  return apiDelete(`/restaurants/provider/${restaurantId}/photos/${photoId}/`)
}

export async function setRestaurantPhotoPrimary(restaurantId: string, photoId: string): Promise<PropertyPhoto> {
  return apiPost<PropertyPhoto>(`/restaurants/provider/${restaurantId}/photos/${photoId}/set-primary/`)
}

export async function reorderRestaurantPhotos(
  restaurantId: string,
  photoOrders: { id: string; display_order: number }[]
): Promise<void> {
  return apiPut(`/restaurants/provider/${restaurantId}/photos/reorder/`, { photos: photoOrders })
}

// ============================================================================
// RESTAURANT MENU ITEMS
// ============================================================================

export interface MenuItem {
  id: string
  name: string
  category?: string
  description?: string
  price: number | string
  currency: string
  photo_url?: string
  is_available: boolean
  is_popular: boolean
  dietary_tags?: string[]
  display_order?: number
  created_at?: string
}

export interface CreateMenuItemPayload {
  name: string
  category?: string
  description?: string
  price: number
  currency?: string
  is_available?: boolean
  is_popular?: boolean
  dietary_tags?: string[]
  display_order?: number
}

export async function getMenuItems(restaurantId: string): Promise<MenuItem[]> {
  const r = await apiGet<MenuItem[] | { results: MenuItem[] }>(
    `/restaurants/provider/${restaurantId}/menu/items/`
  )
  return Array.isArray(r) ? r : r?.results ?? []
}

export async function getMenuCategories(restaurantId: string): Promise<string[]> {
  const r = await apiGet<string[] | { results: string[] }>(
    `/restaurants/provider/${restaurantId}/menu/categories/`
  )
  return Array.isArray(r) ? r : r?.results ?? []
}

export async function createMenuItem(restaurantId: string, payload: CreateMenuItemPayload): Promise<MenuItem> {
  return apiPost<MenuItem>(`/restaurants/provider/${restaurantId}/menu/items/`, payload)
}

export async function createMenuItemWithPhoto(restaurantId: string, payload: CreateMenuItemPayload & { photo?: File }): Promise<MenuItem> {
  const fd = new FormData()
  Object.entries(payload).forEach(([k, v]) => {
    if (v === undefined || v === null) return
    if (k === "photo" && v instanceof File) {
      fd.append("photo_url", v)
    } else if (k === "dietary_tags" && Array.isArray(v)) {
      v.forEach((tag) => fd.append("dietary_tags", tag))
    } else {
      fd.append(k, String(v))
    }
  })
  return apiFetch<MenuItem>(`/restaurants/provider/${restaurantId}/menu/items/`, { method: "POST", body: fd })
}

export async function updateMenuItem(
  restaurantId: string,
  itemId: string,
  payload: Partial<CreateMenuItemPayload>
): Promise<MenuItem> {
  return apiPatch<MenuItem>(`/restaurants/provider/${restaurantId}/menu/items/${itemId}/`, payload)
}

export async function uploadMenuItemPhoto(restaurantId: string, itemId: string, file: File): Promise<MenuItem> {
  const fd = new FormData()
  fd.append("photo", file)
  return apiFetch<MenuItem>(`/restaurants/provider/${restaurantId}/menu/items/${itemId}/photo/`, { method: "POST", body: fd })
}

export async function reorderMenuItems(
  restaurantId: string,
  items: { id: string; display_order: number }[]
): Promise<void> {
  return apiPost(`/restaurants/provider/${restaurantId}/menu/items/reorder/`, { items })
}

export async function deleteMenuItem(restaurantId: string, itemId: string): Promise<void> {
  return apiDelete(`/restaurants/provider/${restaurantId}/menu/items/${itemId}/`)
}

export async function toggleMenuItemAvailability(restaurantId: string, itemId: string): Promise<MenuItem> {
  return apiPost<MenuItem>(`/restaurants/provider/${restaurantId}/menu/items/${itemId}/toggle-availability/`)
}

// ============================================================================
// CONTENT API (Cities, Attractions for Trip Planning)
// ============================================================================

export interface City {
  id: string
  name: string
  nickname?: string
  slug: string
  country: string
  short_description?: string
  cover_photo_url?: string
  is_popular: boolean
}

export interface Attraction {
  id: string
  name: string
  nickname?: string
  slug: string
  category: string
  city_id: string
  city_name: string
  photo_url?: string
}

/**
 * Get cities for selection
 */
export async function getCities(params: {
  search?: string
  is_popular?: boolean
  page?: number
  page_size?: number
} = {}): Promise<PaginatedResponse<City>> {
  const queryParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value))
    }
  })

  const queryString = queryParams.toString()
  const endpoint = queryString ? `/content/cities/?${queryString}` : "/content/cities/"
  
  return apiGet<PaginatedResponse<City>>(endpoint)
}

/**
 * Get attractions for a city (for trip planning)
 */
export async function getAttractions(params: {
  city?: string
  category?: string
  page?: number
  page_size?: number
} = {}): Promise<PaginatedResponse<Attraction>> {
  const queryParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value))
    }
  })

  const queryString = queryParams.toString()
  const endpoint = queryString ? `/content/attractions/?${queryString}` : "/content/attractions/"
  
  return apiGet<PaginatedResponse<Attraction>>(endpoint)
}
