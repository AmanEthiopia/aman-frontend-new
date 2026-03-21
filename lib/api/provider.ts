/**
 * Provider API - For property owners/providers to manage their listings
 * Handles CRUD operations for Hotels, Restaurants, Drivers, and Trips/Events
 */

import { apiGet, apiPost, apiPatch, apiDelete, apiFetch } from "./client"

// ============================================================================
// TYPES
// ============================================================================

export type PropertyCategory = "hotel" | "restaurant" | "driver" | "trip"

export interface PropertyBase {
  id: string
  name: string
  nickname?: string // Amharic alternative name
  description: string
  category: PropertyCategory
  city_id: string
  city_name?: string
  address: string
  is_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  cover_photo_url?: string
  photos?: PropertyPhoto[]
  rating?: number
  review_count?: number
}

export interface PropertyPhoto {
  id: string
  url: string
  caption?: string
  category: string
  is_primary: boolean
  order: number
}

// Hotel Types
export interface ProviderHotel extends PropertyBase {
  category: "hotel"
  star_rating: 1 | 2 | 3 | 4 | 5
  check_in_time: string
  check_out_time: string
  amenities?: string[]
  policies?: HotelPolicies
  rooms?: ProviderRoom[]
  total_rooms?: number
  available_rooms?: number
}

export interface HotelPolicies {
  cancellation_policy?: string
  pet_policy?: string
  smoking_policy?: string
  child_policy?: string
}

export interface ProviderRoom {
  id: string
  hotel_id: string
  name: string
  description: string
  room_type: "standard" | "deluxe" | "suite" | "executive" | "family"
  price_per_night: number
  max_guests: number
  bed_type: string
  amenities: string[]
  photos: PropertyPhoto[]
  is_available: boolean
  quantity: number
}

export interface CreateHotelPayload {
  name: string
  nickname?: string
  description: string
  category: "hotel"
  star_rating: 1 | 2 | 3 | 4 | 5
  address: string
  city_id: string
  check_in_time: string
  check_out_time: string
  amenities?: string[]
}

export interface CreateRoomPayload {
  name: string
  description: string
  room_type: "standard" | "deluxe" | "suite" | "executive" | "family"
  price_per_night: number
  max_guests: number
  bed_type: string
  amenities?: string[]
  quantity: number
}

// Restaurant Types
export interface ProviderRestaurant extends PropertyBase {
  category: "restaurant"
  cuisine_types: string[]
  price_range: "budget" | "mid_range" | "fine_dining"
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
  price_range: "budget" | "mid_range" | "fine_dining"
  address: string
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
  price_per_km?: number
  price_per_hour?: number
  price_per_day?: number
  is_airport_pickup?: boolean
  is_available_24h?: boolean
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
  cities_covered: string[]
  price_per_person: number
  group_discount_percentage?: number
  min_group_size: number
  max_group_size: number
  included_services: string[]
  excluded_services?: string[]
  itinerary: TripItineraryDay[]
  is_customizable?: boolean
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
  
  return apiGet<PaginatedResponse<PropertyBase>>(endpoint)
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
  return apiPost<ProviderHotel>("/hotels/", payload)
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
  const endpoint = queryString ? `/provider/hotels/?${queryString}` : "/provider/hotels/"
  
  return apiGet<PaginatedResponse<ProviderHotel>>(endpoint)
}

/**
 * Get a specific hotel by ID
 */
export async function getMyHotel(hotelId: string): Promise<ProviderHotel> {
  return apiGet<ProviderHotel>(`/provider/hotels/${hotelId}/`)
}

/**
 * Update a hotel
 */
export async function updateHotel(hotelId: string, payload: Partial<CreateHotelPayload>): Promise<ProviderHotel> {
  return apiPatch<ProviderHotel>(`/hotels/${hotelId}/`, payload)
}

/**
 * Delete a hotel
 */
export async function deleteHotel(hotelId: string): Promise<void> {
  return apiDelete(`/hotels/${hotelId}/`)
}

/**
 * Create a room for a hotel
 */
export async function createRoom(hotelId: string, payload: CreateRoomPayload): Promise<ProviderRoom> {
  return apiPost<ProviderRoom>(`/hotels/${hotelId}/rooms/`, payload)
}

/**
 * Update a room
 */
export async function updateRoom(hotelId: string, roomId: string, payload: Partial<CreateRoomPayload>): Promise<ProviderRoom> {
  return apiPatch<ProviderRoom>(`/hotels/${hotelId}/rooms/${roomId}/`, payload)
}

/**
 * Delete a room
 */
export async function deleteRoom(hotelId: string, roomId: string): Promise<void> {
  return apiDelete(`/hotels/${hotelId}/rooms/${roomId}/`)
}

// ============================================================================
// RESTAURANTS API
// ============================================================================

/**
 * Create a new restaurant
 */
export async function createRestaurant(payload: CreateRestaurantPayload): Promise<ProviderRestaurant> {
  return apiPost<ProviderRestaurant>("/restaurants/", payload)
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
  const endpoint = queryString ? `/provider/restaurants/?${queryString}` : "/provider/restaurants/"
  
  return apiGet<PaginatedResponse<ProviderRestaurant>>(endpoint)
}

/**
 * Update a restaurant
 */
export async function updateRestaurant(restaurantId: string, payload: Partial<CreateRestaurantPayload>): Promise<ProviderRestaurant> {
  return apiPatch<ProviderRestaurant>(`/restaurants/${restaurantId}/`, payload)
}

/**
 * Delete a restaurant
 */
export async function deleteRestaurant(restaurantId: string): Promise<void> {
  return apiDelete(`/restaurants/${restaurantId}/`)
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
  const response = await apiGet<{ data: ProviderDashboardData }>("/bookings/provider/dashboard/")
  return response.data
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
  
  const response = await apiGet<{ data: CalendarData }>(endpoint)
  return response.data
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
  
  const response = await apiGet<{ data: EarningsData }>(endpoint)
  return response.data
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
  
  const response = await apiGet<{ data: ProviderBooking[] }>(endpoint)
  return response.data || []
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
  
  const response = await apiGet<{ data: ProviderBooking[] }>(endpoint)
  return response.data || []
}

/**
 * Confirm a hotel booking (new API)
 */
export async function confirmHotelBooking(bookingId: string): Promise<ProviderBooking> {
  const response = await apiPost<{ data: ProviderBooking }>(`/bookings/provider/hotel/${bookingId}/confirm/`)
  return response.data
}

/**
 * Reject a hotel booking (new API)
 */
export async function rejectHotelBooking(bookingId: string, reason?: string): Promise<ProviderBooking> {
  const response = await apiPost<{ data: ProviderBooking }>(`/bookings/provider/hotel/${bookingId}/reject/`, { reason })
  return response.data
}

/**
 * Confirm a restaurant reservation (new API)
 */
export async function confirmRestaurantReservation(reservationId: string): Promise<ProviderBooking> {
  const response = await apiPost<{ data: ProviderBooking }>(`/bookings/provider/restaurant/${reservationId}/confirm/`)
  return response.data
}

/**
 * Reject a restaurant reservation (new API)
 */
export async function rejectRestaurantReservation(reservationId: string, reason?: string): Promise<ProviderBooking> {
  const response = await apiPost<{ data: ProviderBooking }>(`/bookings/provider/restaurant/${reservationId}/reject/`, { reason })
  return response.data
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

  return apiFetch<PropertyPhoto>(`/${propertyType}s/${propertyId}/photos/`, {
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
  return apiDelete(`/${propertyType}s/${propertyId}/photos/${photoId}/`)
}

/**
 * Set a photo as primary
 */
export async function setPhotoAsPrimary(
  propertyType: PropertyCategory,
  propertyId: string,
  photoId: string
): Promise<PropertyPhoto> {
  return apiPost<PropertyPhoto>(`/${propertyType}s/${propertyId}/photos/${photoId}/set-primary/`)
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
