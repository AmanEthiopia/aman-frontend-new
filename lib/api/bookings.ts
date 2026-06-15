"use client"

import { apiPost, apiGet, apiPatch } from "./client"

// ============================================================================
// Types
// ============================================================================

export type BookingStatus = "pending" | "confirmed" | "rejected" | "cancelled" | "completed" | "no_show" | "expired"
export type PaymentStatus = "unpaid" | "paid" | "refunded"

export interface GuestInfo {
  first_name: string
  last_name: string
  gender: "male" | "female" | "other"
  age?: number | null
}

// Payment response
export interface PaymentInfo {
  required: boolean
  client_secret?: string | null
  payment_intent_id?: string
  amount?: string
  currency?: string
}

// ============================================================================
// Hotel Booking
// ============================================================================

export interface HotelBookingRoom {
  id: string
  room_id: string
  room_name: string
  bed_type: string
  bed_count?: number
  quantity: number
  room_size_sqm?: number
  photo_url?: string
  price_per_night: string
  num_nights: number
  subtotal: string
  assigned_unit_ids?: string[]
  assigned_unit_numbers?: string[]
}

export interface HotelBookingHotel {
  id: string
  name: string
  nickname?: string
  address: string
  city?: string
  slug?: string
  phone?: string
  photo_url?: string
  check_in_time: string
  check_out_time: string
  star_rating?: number
  average_rating?: number
  cover_photo_url?: string
}

// Full detail shape returned by GET /bookings/hotel/{id}/
export interface HotelBooking {
  id: string
  booking_number: string
  status: BookingStatus
  payment_required: boolean
  payment_status: PaymentStatus
  hotel: HotelBookingHotel
  check_in_date: string
  check_out_date: string
  total_nights: number
  rooms: HotelBookingRoom[]
  num_adults: number
  num_children: number
  total_price: string
  currency: string
  guest_name: string
  guest_email: string
  guest_phone?: string
  special_requests?: string
  confirmed_at?: string | null
  cancelled_at?: string | null
  cancellation_reason?: string | null
  created_at: string
  source?: "online" | "manual"
  guests_info?: GuestInfo[] | null
}

// Flat summary of a room as returned by the list endpoint
export interface HotelRoomSummary {
  room_name: string
  bed_type: string
  quantity: number
}

// Flat shape returned by GET /bookings/hotel/mine/ and /bookings/provider/hotel/
export interface HotelBookingListItem {
  id: string
  booking_number: string
  status: BookingStatus
  payment_required: boolean
  payment_status: PaymentStatus
  hotel_name: string
  hotel_slug?: string
  hotel_city?: string
  hotel_photo?: string
  hotel_star_rating?: number
  hotel_average_rating?: number
  hotel_provider_id?: string
  check_in_date: string
  check_out_date: string
  total_nights: number
  room_summary: HotelRoomSummary[]
  num_adults: number
  num_children: number
  total_price: string
  currency: string
  guest_name: string
  guest_email: string
  guest_phone?: string
  special_requests?: string
  confirmed_at?: string | null
  cancelled_at?: string | null
  cancellation_reason?: string | null
  created_at: string
  source?: "online" | "manual"
}

export interface HotelBookingResponse {
  booking: HotelBooking
  payment: PaymentInfo
}

export interface CreateHotelBookingPayload {
  hotel_id: string
  check_in_date: string
  check_out_date: string
  rooms: Array<{ room_id: string; quantity: number }>
  num_adults: number
  num_children?: number
  guest_name: string
  guest_email: string
  guest_phone?: string
  special_requests?: string
  guests?: GuestInfo[]
}

export async function createHotelBooking(payload: CreateHotelBookingPayload): Promise<HotelBookingResponse> {
  return apiPost<HotelBookingResponse>("/bookings/hotel/", payload)
}

export async function getMyHotelBookings(status?: BookingStatus): Promise<HotelBookingListItem[]> {
  const params = status ? `?status=${status}` : ""
  const result = await apiGet<HotelBookingListItem[] | { results: HotelBookingListItem[] }>(`/bookings/hotel/mine/${params}`)
  return Array.isArray(result) ? result : result?.results ?? []
}

export async function getHotelBookingById(id: string): Promise<HotelBooking> {
  return apiGet<HotelBooking>(`/bookings/hotel/${id}/`)
}

export async function getProviderHotelBookingById(id: string): Promise<HotelBooking> {
  return apiGet<HotelBooking>(`/bookings/provider/hotel/${id}/`)
}

export async function cancelHotelBooking(id: string, reason?: string): Promise<HotelBooking> {
  return apiPost<HotelBooking>(`/bookings/hotel/${id}/cancel/`, { reason })
}

export interface ModifyHotelBookingPayload {
  check_in_date?: string
  check_out_date?: string
  num_adults?: number
  num_children?: number
  special_requests?: string
  rooms?: Array<{ room_id: string; quantity: number }>
}

export async function modifyHotelBooking(id: string, payload: ModifyHotelBookingPayload): Promise<HotelBooking> {
  return apiPatch<HotelBooking>(`/bookings/hotel/${id}/modify/`, payload)
}

// ============================================================================
// Restaurant Reservation
// ============================================================================

export interface RestaurantBookingRestaurant {
  id: string
  name: string
  nickname?: string
  address: string
  city?: string
  slug?: string
  phone?: string
  photo_url?: string
  cuisine_type?: string
  cover_photo_url?: string
}

// Full detail shape returned by GET /bookings/restaurant/{id}/
export interface RestaurantReservation {
  id: string
  reservation_number: string
  status: BookingStatus
  payment_status?: PaymentStatus
  restaurant: RestaurantBookingRestaurant
  reservation_date: string
  reservation_time: string
  duration_minutes?: number
  party_size: number
  total_price?: string
  currency?: string
  guest_name: string
  guest_email: string
  guest_phone?: string
  special_requests?: string
  confirmed_at?: string | null
  cancelled_at?: string | null
  created_at: string
}

// Flat shape returned by GET /bookings/restaurant/mine/
export interface RestaurantReservationListItem {
  id: string
  reservation_number: string
  status: BookingStatus
  payment_status?: PaymentStatus
  restaurant_name: string
  restaurant_slug?: string
  restaurant_city?: string
  restaurant_photo?: string
  restaurant_cuisine_type?: string
  reservation_date: string
  reservation_time: string
  duration_minutes?: number
  party_size: number
  total_price?: string
  currency?: string
  guest_name: string
  guest_email: string
  guest_phone?: string
  special_requests?: string
  confirmed_at?: string | null
  cancelled_at?: string | null
  created_at: string
}

export interface CreateRestaurantReservationPayload {
  restaurant_id: string
  reservation_date: string
  reservation_time: string
  duration_minutes?: number
  party_size: number
  guest_name: string
  guest_email: string
  guest_phone?: string
  special_requests?: string
}

export interface RestaurantReservationResponse {
  reservation: RestaurantReservation
  payment: PaymentInfo
}

export async function createRestaurantReservation(
  payload: CreateRestaurantReservationPayload
): Promise<RestaurantReservationResponse> {
  return apiPost<RestaurantReservationResponse>("/bookings/restaurant/", payload)
}

export async function getMyRestaurantReservations(status?: BookingStatus): Promise<RestaurantReservationListItem[]> {
  const params = status ? `?status=${status}` : ""
  const result = await apiGet<RestaurantReservationListItem[] | { results: RestaurantReservationListItem[] }>(`/bookings/restaurant/mine/${params}`)
  return Array.isArray(result) ? result : result?.results ?? []
}

export async function getRestaurantReservationById(id: string): Promise<RestaurantReservation> {
  return apiGet<RestaurantReservation>(`/bookings/restaurant/${id}/`)
}

export async function cancelRestaurantReservation(id: string, reason?: string): Promise<RestaurantReservation> {
  return apiPost<RestaurantReservation>(`/bookings/restaurant/${id}/cancel/`, { reason })
}

// ============================================================================
// Trip / Package Booking
// ============================================================================

export interface PackageBookingPackage {
  id: string
  title: string
  nickname?: string
  slug: string
  duration_days: number
  price_per_person: string
  cover_photo_url?: string
}

export interface PackageBooking {
  id: string
  booking_number: string
  status: BookingStatus
  payment_status?: PaymentStatus
  package: PackageBookingPackage
  start_date: string
  num_adults: number
  num_children: number
  total_price: string
  currency?: string
  guest_name: string
  guest_email: string
  guest_phone?: string
  special_requests?: string
  created_at: string
}

export interface PackageBookingResponse {
  booking: PackageBooking
  payment: PaymentInfo
}

export interface CreatePackageBookingPayload {
  package_id: string
  departure_id: string
  num_adults: number
  num_children?: number
  guest_name: string
  guest_email: string
  guest_phone?: string
  special_requests?: string
}

export async function createPackageBooking(payload: CreatePackageBookingPayload): Promise<PackageBookingResponse> {
  return apiPost<PackageBookingResponse>("/experiences/bookings/", payload)
}

export async function getMyPackageBookings(status?: BookingStatus): Promise<PackageBooking[]> {
  const params = status ? `?status=${status}` : ""
  const result = await apiGet<PackageBooking[] | { results: PackageBooking[] }>(`/experiences/bookings/mine/${params}`)
  return Array.isArray(result) ? result : result?.results ?? []
}

export async function getPackageBookingById(id: string): Promise<PackageBooking> {
  return apiGet<PackageBooking>(`/experiences/bookings/${id}/`)
}

export async function cancelPackageBooking(id: string, reason?: string): Promise<PackageBooking> {
  return apiPost<PackageBooking>(`/experiences/bookings/${id}/cancel/`, { reason })
}

// ============================================================================
// Driver Booking (NEW — /bookings/driver/)
// ============================================================================

export interface DriverBooking {
  id: string
  booking_number: string
  driver_id: string
  driver_name: string
  driver_vehicle_type: string
  trip_date: string
  pickup_time: string
  pickup_location: string
  dropoff_location: string
  num_passengers: number
  status: BookingStatus
  estimated_price: number | string
  guest_name: string
  guest_email: string
  guest_phone?: string
  special_requests?: string
  created_at: string
}

export interface CreateDriverBookingPayload {
  driver_id: string
  trip_date: string
  pickup_time: string
  pickup_location: string
  dropoff_location: string
  num_passengers: number
  guest_name: string
  guest_email: string
  guest_phone?: string
  special_requests?: string
}

export async function createDriverBooking(payload: CreateDriverBookingPayload): Promise<DriverBooking> {
  return apiPost<DriverBooking>("/bookings/driver/", payload)
}

export async function getMyDriverBookings(status?: BookingStatus): Promise<DriverBooking[]> {
  const params = status ? `?status=${status}` : ""
  const result = await apiGet<DriverBooking[] | { results: DriverBooking[] }>(`/bookings/driver/mine/${params}`)
  return Array.isArray(result) ? result : result?.results ?? []
}

export async function getDriverBookingById(id: string): Promise<DriverBooking> {
  return apiGet<DriverBooking>(`/bookings/driver/${id}/`)
}

export async function cancelDriverBooking(id: string, reason?: string): Promise<DriverBooking> {
  return apiPost<DriverBooking>(`/bookings/driver/${id}/cancel/`, { reason })
}

// ============================================================================
// Provider Booking Management
// ============================================================================

// Hotel
export async function getProviderHotelBookings(params?: { status?: BookingStatus; hotel_id?: string }): Promise<HotelBookingListItem[]> {
  const searchParams = new URLSearchParams()
  if (params?.status) searchParams.append("status", params.status)
  if (params?.hotel_id) searchParams.append("hotel_id", params.hotel_id)
  const query = searchParams.toString() ? `?${searchParams.toString()}` : ""
  const result = await apiGet<HotelBookingListItem[] | { results: HotelBookingListItem[] }>(`/bookings/provider/hotel/${query}`)
  return Array.isArray(result) ? result : result?.results ?? []
}

export interface BookingRoomAssignment {
  booking_room_id: string
  unit_ids: string[]
}

export async function confirmHotelBooking(
  bookingId: string,
  assignments?: BookingRoomAssignment[]
): Promise<HotelBooking> {
  return apiPost<HotelBooking>(`/bookings/provider/hotel/${bookingId}/confirm/`, {
    ...(assignments && assignments.length > 0 ? { assignments } : {}),
  })
}

export async function rejectHotelBooking(bookingId: string, reason?: string): Promise<HotelBooking> {
  return apiPost<HotelBooking>(`/bookings/provider/hotel/${bookingId}/reject/`, { reason })
}

export interface CreateManualHotelBookingPayload {
  hotel_id: string
  check_in_date: string
  check_out_date: string
  rooms: Array<{ room_id: string; quantity: number }>
  num_adults: number
  num_children?: number
  guest_name: string
  guest_email: string
  guest_phone?: string
  special_requests?: string
}

export async function createManualHotelBooking(
  payload: CreateManualHotelBookingPayload
): Promise<HotelBooking> {
  return apiPost<HotelBooking>("/bookings/provider/hotel/manual/", payload)
}

// Restaurant
export async function getProviderRestaurantReservations(params?: { status?: BookingStatus; restaurant_id?: string; date?: string }): Promise<RestaurantReservationListItem[]> {
  const searchParams = new URLSearchParams()
  if (params?.status) searchParams.append("status", params.status)
  if (params?.restaurant_id) searchParams.append("restaurant_id", params.restaurant_id)
  if (params?.date) searchParams.append("date", params.date)
  const query = searchParams.toString() ? `?${searchParams.toString()}` : ""
  const result = await apiGet<RestaurantReservationListItem[] | { results: RestaurantReservationListItem[] }>(`/bookings/provider/restaurant/${query}`)
  return Array.isArray(result) ? result : result?.results ?? []
}

export async function confirmRestaurantReservation(reservationId: string): Promise<RestaurantReservation> {
  return apiPost<RestaurantReservation>(`/bookings/provider/restaurant/${reservationId}/confirm/`, {})
}

export async function rejectRestaurantReservation(reservationId: string, reason?: string): Promise<RestaurantReservation> {
  return apiPost<RestaurantReservation>(`/bookings/provider/restaurant/${reservationId}/reject/`, { reason })
}

// Trip / Package
export async function getProviderPackageBookings(params?: { status?: BookingStatus; package_id?: string }): Promise<PackageBooking[]> {
  const searchParams = new URLSearchParams()
  if (params?.status) searchParams.append("status", params.status)
  if (params?.package_id) searchParams.append("package_id", params.package_id)
  const query = searchParams.toString() ? `?${searchParams.toString()}` : ""
  const result = await apiGet<PackageBooking[] | { results: PackageBooking[] }>(`/experiences/provider/bookings/${query}`)
  return Array.isArray(result) ? result : result?.results ?? []
}

export async function confirmPackageBooking(bookingId: string): Promise<PackageBooking> {
  return apiPost<PackageBooking>(`/experiences/provider/bookings/${bookingId}/confirm/`, {})
}

export async function rejectPackageBooking(bookingId: string, reason?: string): Promise<PackageBooking> {
  return apiPost<PackageBooking>(`/experiences/provider/bookings/${bookingId}/reject/`, { reason })
}

// Driver
export async function getProviderDriverBookings(params?: { status?: BookingStatus; driver_id?: string }): Promise<DriverBooking[]> {
  const searchParams = new URLSearchParams()
  if (params?.status) searchParams.append("status", params.status)
  if (params?.driver_id) searchParams.append("driver_id", params.driver_id)
  const query = searchParams.toString() ? `?${searchParams.toString()}` : ""
  const result = await apiGet<DriverBooking[] | { results: DriverBooking[] }>(`/bookings/provider/driver/${query}`)
  return Array.isArray(result) ? result : result?.results ?? []
}

export async function confirmDriverBooking(bookingId: string): Promise<DriverBooking> {
  return apiPost<DriverBooking>(`/bookings/provider/driver/${bookingId}/confirm/`, {})
}

export async function rejectDriverBooking(bookingId: string, reason?: string): Promise<DriverBooking> {
  return apiPost<DriverBooking>(`/bookings/provider/driver/${bookingId}/reject/`, { reason })
}

// ============================================================================
// Provider Dashboard / Calendar / Earnings
// ============================================================================

export interface ProviderDashboardStats {
  pending_bookings: number
  confirmed_bookings_this_month: number
  revenue_this_month: string
  occupancy_rate: number
  average_rating: number
  total_hotels: number
  total_restaurants?: number
}

export interface CalendarBooking {
  booking_id: string
  booking_number: string
  guest_name: string
  check_in_date: string
  check_out_date: string
  total_nights: number
  status: BookingStatus
  total_price: string
}

export interface CalendarStats {
  total_nights: number
  total_guests: number
  revenue: string
}

export interface CalendarResponse {
  bookings: CalendarBooking[]
  month_stats: CalendarStats
}

export interface EarningsTransaction {
  id: string
  booking_number: string
  guest_name: string
  amount: string
  currency: string
  status: BookingStatus
  date: string
}

export interface EarningsResponse {
  period: string
  total_revenue: string
  total_bookings: number
  avg_nightly_rate: string
  occupancy_rate: number
  pending_balance: string
  transactions: EarningsTransaction[]
}

export async function getProviderDashboard(): Promise<ProviderDashboardStats> {
  return apiGet<ProviderDashboardStats>("/bookings/provider/dashboard/")
}

export async function getProviderCalendar(params?: { year?: number; month?: number; hotel_id?: string }): Promise<CalendarResponse> {
  const searchParams = new URLSearchParams()
  if (params?.year) searchParams.append("year", params.year.toString())
  if (params?.month) searchParams.append("month", params.month.toString())
  if (params?.hotel_id) searchParams.append("hotel_id", params.hotel_id)
  const query = searchParams.toString() ? `?${searchParams.toString()}` : ""
  return apiGet<CalendarResponse>(`/bookings/provider/calendar/${query}`)
}

export async function getProviderEarnings(params?: { period?: "this_month" | "last_month" | "this_year"; hotel_id?: string }): Promise<EarningsResponse> {
  const searchParams = new URLSearchParams()
  if (params?.period) searchParams.append("period", params.period)
  if (params?.hotel_id) searchParams.append("hotel_id", params.hotel_id)
  const query = searchParams.toString() ? `?${searchParams.toString()}` : ""
  return apiGet<EarningsResponse>(`/bookings/provider/earnings/${query}`)
}

// ============================================================================
// Payment Intents (Stripe — for future use)
// ============================================================================

export interface CreatePaymentIntentResponse {
  client_secret: string
  payment_intent_id: string
  amount: string
  currency: string
}

export async function createHotelPaymentIntent(bookingId: string): Promise<CreatePaymentIntentResponse> {
  return apiPost<CreatePaymentIntentResponse>(`/bookings/payment/hotel/${bookingId}/create-intent/`, {})
}

export async function createRestaurantPaymentIntent(reservationId: string): Promise<CreatePaymentIntentResponse> {
  return apiPost<CreatePaymentIntentResponse>(`/bookings/payment/restaurant/${reservationId}/create-intent/`, {})
}

export async function createPackagePaymentIntent(bookingId: string): Promise<CreatePaymentIntentResponse> {
  return apiPost<CreatePaymentIntentResponse>(`/experiences/bookings/${bookingId}/create-intent/`, {})
}

// ============================================================================
// Normalized unified type for provider bookings page display
// ============================================================================

export type BookingServiceType = "hotel" | "restaurant" | "trip" | "driver"

export interface NormalizedBooking {
  id: string
  booking_number: string
  service_type: BookingServiceType
  property_name: string
  guest_name: string
  guest_email: string
  guest_phone?: string
  date_from: string
  date_to?: string
  guests: number
  total_price: string
  currency: string
  status: BookingStatus
  special_requests?: string
  created_at: string
  raw: HotelBookingListItem | RestaurantReservationListItem | PackageBooking | DriverBooking
}

export function normalizeHotelBooking(b: HotelBookingListItem): NormalizedBooking {
  return {
    id: b.id, booking_number: b.booking_number, service_type: "hotel",
    property_name: b.hotel_name,
    guest_name: b.guest_name, guest_email: b.guest_email, guest_phone: b.guest_phone,
    date_from: b.check_in_date, date_to: b.check_out_date,
    guests: (b.num_adults ?? 0) + (b.num_children ?? 0),
    total_price: b.total_price ?? "0", currency: b.currency ?? "ETB", status: b.status,
    special_requests: b.special_requests, created_at: b.created_at, raw: b,
  }
}

export function normalizeRestaurantReservation(r: RestaurantReservationListItem): NormalizedBooking {
  return {
    id: r.id, booking_number: r.reservation_number, service_type: "restaurant",
    property_name: r.restaurant_name,
    guest_name: r.guest_name, guest_email: r.guest_email, guest_phone: r.guest_phone,
    date_from: r.reservation_date,
    guests: r.party_size,
    total_price: r.total_price ?? "0", currency: (r as any).currency ?? "ETB", status: r.status,
    special_requests: r.special_requests, created_at: r.created_at, raw: r,
  }
}

export function normalizePackageBooking(b: PackageBooking): NormalizedBooking {
  return {
    id: b.id, booking_number: b.booking_number, service_type: "trip",
    property_name: b.package?.title ?? "Trip",
    guest_name: b.guest_name, guest_email: b.guest_email, guest_phone: b.guest_phone,
    date_from: b.start_date,
    guests: (b.num_adults ?? 0) + (b.num_children ?? 0),
    total_price: b.total_price ?? "0", currency: b.currency ?? "ETB", status: b.status,
    special_requests: b.special_requests, created_at: b.created_at, raw: b,
  }
}

export function normalizeDriverBooking(b: DriverBooking): NormalizedBooking {
  return {
    id: b.id, booking_number: b.booking_number, service_type: "driver",
    property_name: b.driver_name ?? "Driver",
    guest_name: b.guest_name, guest_email: b.guest_email, guest_phone: b.guest_phone,
    date_from: b.trip_date,
    guests: b.num_passengers ?? 1,
    total_price: String(b.estimated_price ?? 0), currency: (b as any).currency ?? "ETB", status: b.status,
    special_requests: b.special_requests, created_at: b.created_at, raw: b,
  }
}

export async function getAllProviderBookings(): Promise<NormalizedBooking[]> {
  const [hotels, restaurants, trips, drivers] = await Promise.allSettled([
    getProviderHotelBookings(),
    getProviderRestaurantReservations(),
    getProviderPackageBookings(),
    getProviderDriverBookings(),
  ])

  const normalized: NormalizedBooking[] = [
    ...(hotels.status === "fulfilled" ? hotels.value.map(normalizeHotelBooking) : []),
    ...(restaurants.status === "fulfilled" ? restaurants.value.map(normalizeRestaurantReservation) : []),
    ...(trips.status === "fulfilled" ? trips.value.map(normalizePackageBooking) : []),
    ...(drivers.status === "fulfilled" ? drivers.value.map(normalizeDriverBooking) : []),
  ]

  return normalized.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

// ============================================================================
// Traveler-side aggregation + backward-compat aliases for use-bookings.ts
// ============================================================================

// "Transport" was the old name for Driver bookings — keep aliases so the
// traveler bookings page and hooks don't need to be rewritten.
export type TransportBooking = DriverBooking
export type CreateTransportBookingPayload = CreateDriverBookingPayload
export type TransportBookingResponse = { booking: DriverBooking; payment?: PaymentInfo }

export interface AllBookingsResponse {
  hotel: HotelBookingListItem[]
  restaurant: RestaurantReservationListItem[]
  package: PackageBooking[]
  driver: DriverBooking[]
  transport: DriverBooking[]
}

export type Booking =
  | (HotelBookingListItem & { type: "hotel" })
  | (RestaurantReservationListItem & { type: "restaurant" })
  | (PackageBooking & { type: "package" })
  | (DriverBooking & { type: "transport" })

export const getMyTransportBookings = getMyDriverBookings
export const createTransportBooking = createDriverBooking

export async function getAllMyBookings(): Promise<AllBookingsResponse> {
  const [hotel, restaurant, pkg, driver] = await Promise.allSettled([
    getMyHotelBookings(),
    getMyRestaurantReservations(),
    getMyPackageBookings(),
    getMyDriverBookings(),
  ])
  const drivers = driver.status === "fulfilled" ? driver.value : []
  return {
    hotel: hotel.status === "fulfilled" ? (hotel.value as HotelBookingListItem[]) : [],
    restaurant: restaurant.status === "fulfilled" ? (restaurant.value as RestaurantReservationListItem[]) : [],
    package: pkg.status === "fulfilled" ? pkg.value : [],
    driver: drivers,
    transport: drivers,
  }
}

export function flattenBookings(bookings: AllBookingsResponse): Booking[] {
  return [
    ...bookings.hotel.map((b) => ({ ...b, type: "hotel" as const })),
    ...bookings.restaurant.map((b) => ({ ...b, type: "restaurant" as const })),
    ...bookings.package.map((b) => ({ ...b, type: "package" as const })),
    ...(bookings.driver ?? bookings.transport ?? []).map((b) => ({ ...b, type: "transport" as const })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}
