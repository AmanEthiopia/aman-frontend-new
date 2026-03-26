"use client"

import { apiPost, apiGet } from "./client"

// ============================================================================
// Types
// ============================================================================

export type BookingStatus = "pending" | "confirmed" | "rejected" | "cancelled" | "completed" | "no_show"
export type PaymentStatus = "unpaid" | "paid" | "refunded"
export type BookingType = "hotel" | "restaurant" | "package" | "transport" | "experience" | "guide"

// Base booking interface
export interface BookingBase {
  id: string
  booking_number: string
  status: BookingStatus
  payment_required: boolean
  payment_status: PaymentStatus
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
}

// Hotel booking types
export interface HotelBookingRoom {
  id: string
  room_id: string
  room_name: string
  bed_type: string
  quantity: number
  price_per_night: string
  num_nights: number
  subtotal: string
}

export interface HotelBookingHotel {
  id: string
  name: string
  nickname?: string
  address: string
  check_in_time: string
  check_out_time: string
  star_rating?: number
  cover_photo_url?: string
}

export interface HotelBooking extends BookingBase {
  type: "hotel"
  hotel: HotelBookingHotel
  check_in_date: string
  check_out_date: string
  total_nights: number
  rooms: HotelBookingRoom[]
  num_adults: number
  num_children: number
}

// Restaurant reservation types
export interface RestaurantBookingRestaurant {
  id: string
  name: string
  nickname?: string
  address: string
  cuisine_type?: string
  cover_photo_url?: string
}

export interface RestaurantReservation extends BookingBase {
  type: "restaurant"
  restaurant: RestaurantBookingRestaurant
  reservation_date: string
  reservation_time: string
  party_size: number
}

// Package booking types
export interface PackageBookingPackage {
  id: string
  title: string
  nickname?: string
  slug: string
  duration_days: number
  price_per_person: string
  cover_photo_url?: string
}

export interface PackageBooking extends BookingBase {
  type: "package"
  package: PackageBookingPackage
  start_date: string
  num_adults: number
  num_children: number
}

// Transport booking types
export interface TransportBookingDriver {
  id: string
  name: string
  phone: string
  vehicle_type: string
  vehicle_model?: string
  license_plate?: string
  photo_url?: string
}

export interface TransportBooking extends BookingBase {
  type: "transport"
  driver: TransportBookingDriver
  pickup_date: string
  pickup_time: string
  pickup_location: string
  dropoff_location: string
  service_type: "airport_transfer" | "city_tour" | "intercity" | "hourly"
  estimated_duration?: string
}

// Experience booking (for single-day activities)
export interface ExperienceBookingExperience {
  id: string
  title: string
  nickname?: string
  slug: string
  duration_hours: number
  price_per_person: string
  cover_photo_url?: string
}

export interface ExperienceBooking extends BookingBase {
  type: "experience"
  experience: ExperienceBookingExperience
  date: string
  time: string
  num_participants: number
}

// Guide booking types
export interface GuideBookingGuide {
  id: string
  title: string
  nickname?: string
  service_type: string
  pricing_type: string
  price: string
  price_currency: string
  primary_photo_url?: string
}

export interface GuideBooking extends BookingBase {
  type: "guide"
  guide: GuideBookingGuide
  booking_date: string
  start_time?: string
  hours_requested?: string
  num_adults: number
  num_children: number
}

// Union type for all bookings
export type Booking = HotelBooking | RestaurantReservation | PackageBooking | TransportBooking | ExperienceBooking | GuideBooking

// Payment response
export interface PaymentInfo {
  required: boolean
  client_secret?: string | null
  payment_intent_id?: string
  amount?: string
  currency?: string
}

// ============================================================================
// Hotel Booking API
// ============================================================================

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
}

export interface HotelBookingResponse {
  booking: HotelBooking
  payment: PaymentInfo
}

export async function createHotelBooking(payload: CreateHotelBookingPayload): Promise<HotelBookingResponse> {
  return apiPost<HotelBookingResponse>("/bookings/hotel/", payload)
}

export async function getMyHotelBookings(status?: BookingStatus): Promise<HotelBooking[]> {
  const params = status ? `?status=${status}` : ""
  return apiGet<HotelBooking[]>(`/bookings/hotel/mine/${params}`)
}

export async function getHotelBookingById(id: string): Promise<HotelBooking> {
  return apiGet<HotelBooking>(`/bookings/hotel/${id}/`)
}

export async function cancelHotelBooking(id: string, reason?: string): Promise<HotelBooking> {
  return apiPost<HotelBooking>(`/bookings/hotel/${id}/cancel/`, { reason })
}

// ============================================================================
// Restaurant Reservation API
// ============================================================================

export interface CreateRestaurantReservationPayload {
  restaurant_id: string
  reservation_date: string
  reservation_time: string
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

export async function createRestaurantReservation(payload: CreateRestaurantReservationPayload): Promise<RestaurantReservationResponse> {
  return apiPost<RestaurantReservationResponse>("/bookings/restaurant/", payload)
}

export async function getMyRestaurantReservations(status?: BookingStatus): Promise<RestaurantReservation[]> {
  const params = status ? `?status=${status}` : ""
  return apiGet<RestaurantReservation[]>(`/bookings/restaurant/mine/${params}`)
}

export async function getRestaurantReservationById(id: string): Promise<RestaurantReservation> {
  return apiGet<RestaurantReservation>(`/bookings/restaurant/${id}/`)
}

export async function cancelRestaurantReservation(id: string, reason?: string): Promise<RestaurantReservation> {
  return apiPost<RestaurantReservation>(`/bookings/restaurant/${id}/cancel/`, { reason })
}

// ============================================================================
// Package Booking API
// ============================================================================

export interface CreatePackageBookingPayload {
  package_id: string
  start_date: string
  num_adults: number
  num_children?: number
  guest_name: string
  guest_email: string
  guest_phone?: string
  special_requests?: string
}

export interface PackageBookingResponse {
  booking: PackageBooking
  payment: PaymentInfo
}

export async function createPackageBooking(payload: CreatePackageBookingPayload): Promise<PackageBookingResponse> {
  return apiPost<PackageBookingResponse>("/experiences/bookings/", payload)
}

export async function getMyPackageBookings(status?: BookingStatus): Promise<PackageBooking[]> {
  const params = status ? `?status=${status}` : ""
  return apiGet<PackageBooking[]>(`/experiences/bookings/mine/${params}`)
}

export async function getPackageBookingById(id: string): Promise<PackageBooking> {
  return apiGet<PackageBooking>(`/experiences/bookings/${id}/`)
}

export async function cancelPackageBooking(id: string, reason?: string): Promise<PackageBooking> {
  return apiPost<PackageBooking>(`/experiences/bookings/${id}/cancel/`, { reason })
}

// ============================================================================
// Transport Booking API
// ============================================================================

export interface CreateTransportBookingPayload {
  driver_id: string
  pickup_date: string
  pickup_time: string
  pickup_location: string
  dropoff_location: string
  service_type: "airport_transfer" | "city_tour" | "intercity" | "hourly"
  estimated_duration?: string
  guest_name: string
  guest_email: string
  guest_phone?: string
  special_requests?: string
}

export interface TransportBookingResponse {
  booking: TransportBooking
  payment: PaymentInfo
}

export async function createTransportBooking(payload: CreateTransportBookingPayload): Promise<TransportBookingResponse> {
  const response = await apiPost<{ data: TransportBookingResponse }>("/bookings/transport/", payload)
  return response.data
}

export async function getMyTransportBookings(status?: BookingStatus): Promise<TransportBooking[]> {
  const params = status ? `?status=${status}` : ""
  const response = await apiGet<{ data: TransportBooking[] }>(`/bookings/transport/mine/${params}`)
  return response.data || []
}

export async function cancelTransportBooking(id: string, reason?: string): Promise<TransportBooking> {
  const response = await apiPost<{ data: TransportBooking }>(`/bookings/transport/${id}/cancel/`, { reason })
  return response.data
}

// ============================================================================
// Payment API
// ============================================================================

export interface CreatePaymentIntentResponse {
  client_secret: string
  payment_intent_id: string
  amount: string
  currency: string
}

export async function createHotelPaymentIntent(bookingId: string): Promise<CreatePaymentIntentResponse> {
  const response = await apiPost<{ data: CreatePaymentIntentResponse }>(`/bookings/payment/hotel/${bookingId}/create-intent/`, {})
  return response.data
}

export async function createRestaurantPaymentIntent(reservationId: string): Promise<CreatePaymentIntentResponse> {
  const response = await apiPost<{ data: CreatePaymentIntentResponse }>(`/bookings/payment/restaurant/${reservationId}/create-intent/`, {})
  return response.data
}

export async function createPackagePaymentIntent(bookingId: string): Promise<CreatePaymentIntentResponse> {
  const response = await apiPost<{ data: CreatePaymentIntentResponse }>(`/experiences/bookings/${bookingId}/create-intent/`, {})
  return response.data
}

// ============================================================================
// Provider Booking Management API
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

// Provider Hotel Bookings
export async function getProviderHotelBookings(params?: { status?: BookingStatus; hotel_id?: string }): Promise<HotelBooking[]> {
  const searchParams = new URLSearchParams()
  if (params?.status) searchParams.append("status", params.status)
  if (params?.hotel_id) searchParams.append("hotel_id", params.hotel_id)
  const query = searchParams.toString() ? `?${searchParams.toString()}` : ""
  const response = await apiGet<{ data: HotelBooking[] }>(`/bookings/provider/hotel/${query}`)
  return response.data || []
}

export async function confirmHotelBooking(bookingId: string): Promise<HotelBooking> {
  const response = await apiPost<{ data: HotelBooking }>(`/bookings/provider/hotel/${bookingId}/confirm/`, {})
  return response.data
}

export async function rejectHotelBooking(bookingId: string, reason?: string): Promise<HotelBooking> {
  const response = await apiPost<{ data: HotelBooking }>(`/bookings/provider/hotel/${bookingId}/reject/`, { reason })
  return response.data
}

// Provider Restaurant Reservations
export async function getProviderRestaurantReservations(params?: { status?: BookingStatus; restaurant_id?: string; date?: string }): Promise<RestaurantReservation[]> {
  const searchParams = new URLSearchParams()
  if (params?.status) searchParams.append("status", params.status)
  if (params?.restaurant_id) searchParams.append("restaurant_id", params.restaurant_id)
  if (params?.date) searchParams.append("date", params.date)
  const query = searchParams.toString() ? `?${searchParams.toString()}` : ""
  const response = await apiGet<{ data: RestaurantReservation[] }>(`/bookings/provider/restaurant/${query}`)
  return response.data || []
}

export async function confirmRestaurantReservation(reservationId: string): Promise<RestaurantReservation> {
  const response = await apiPost<{ data: RestaurantReservation }>(`/bookings/provider/restaurant/${reservationId}/confirm/`, {})
  return response.data
}

export async function rejectRestaurantReservation(reservationId: string, reason?: string): Promise<RestaurantReservation> {
  const response = await apiPost<{ data: RestaurantReservation }>(`/bookings/provider/restaurant/${reservationId}/reject/`, { reason })
  return response.data
}

// Provider Package Bookings
export async function getProviderPackageBookings(params?: { status?: BookingStatus; package_id?: string }): Promise<PackageBooking[]> {
  const searchParams = new URLSearchParams()
  if (params?.status) searchParams.append("status", params.status)
  if (params?.package_id) searchParams.append("package_id", params.package_id)
  const query = searchParams.toString() ? `?${searchParams.toString()}` : ""
  const response = await apiGet<{ data: PackageBooking[] }>(`/experiences/provider/bookings/${query}`)
  return response.data || []
}

export async function confirmPackageBooking(bookingId: string): Promise<PackageBooking> {
  const response = await apiPost<{ data: PackageBooking }>(`/experiences/provider/bookings/${bookingId}/confirm/`, {})
  return response.data
}

export async function rejectPackageBooking(bookingId: string, reason?: string): Promise<PackageBooking> {
  const response = await apiPost<{ data: PackageBooking }>(`/experiences/provider/bookings/${bookingId}/reject/`, { reason })
  return response.data
}

// Provider Dashboard
export async function getProviderDashboard(): Promise<ProviderDashboardStats> {
  const response = await apiGet<{ data: ProviderDashboardStats }>("/bookings/provider/dashboard/")
  return response.data
}

export async function getProviderCalendar(params?: { year?: number; month?: number; hotel_id?: string }): Promise<CalendarResponse> {
  const searchParams = new URLSearchParams()
  if (params?.year) searchParams.append("year", params.year.toString())
  if (params?.month) searchParams.append("month", params.month.toString())
  if (params?.hotel_id) searchParams.append("hotel_id", params.hotel_id)
  const query = searchParams.toString() ? `?${searchParams.toString()}` : ""
  const response = await apiGet<{ data: CalendarResponse }>(`/bookings/provider/calendar/${query}`)
  return response.data
}

export async function getProviderEarnings(params?: { period?: "this_month" | "last_month" | "this_year"; hotel_id?: string }): Promise<EarningsResponse> {
  const searchParams = new URLSearchParams()
  if (params?.period) searchParams.append("period", params.period)
  if (params?.hotel_id) searchParams.append("hotel_id", params.hotel_id)
  const query = searchParams.toString() ? `?${searchParams.toString()}` : ""
  const response = await apiGet<{ data: EarningsResponse }>(`/bookings/provider/earnings/${query}`)
  return response.data
}

// ============================================================================
// All Bookings (Combined)
// ============================================================================

export interface AllBookingsResponse {
  hotel: HotelBooking[]
  restaurant: RestaurantReservation[]
  package: PackageBooking[]
  transport: TransportBooking[]
  guide: GuideBooking[]
}

export async function getAllMyBookings(): Promise<AllBookingsResponse> {
  // Import guide bookings function dynamically to avoid circular dependency
  const { getMyGuideBookings } = await import("./guides")
  
  const [hotel, restaurant, packageBookings, transport, guideBookings] = await Promise.allSettled([
    getMyHotelBookings(),
    getMyRestaurantReservations(),
    getMyPackageBookings(),
    getMyTransportBookings(),
    getMyGuideBookings(),
  ])

  return {
    hotel: hotel.status === "fulfilled" ? hotel.value : [],
    restaurant: restaurant.status === "fulfilled" ? restaurant.value : [],
    package: packageBookings.status === "fulfilled" ? packageBookings.value : [],
    transport: transport.status === "fulfilled" ? transport.value : [],
    guide: guideBookings.status === "fulfilled" ? guideBookings.value : [],
  }
}

// Helper to get unified booking list
export function flattenBookings(bookings: AllBookingsResponse): Booking[] {
  const hotelBookings: Booking[] = bookings.hotel.map(b => ({ ...b, type: "hotel" as const }))
  const restaurantBookings: Booking[] = bookings.restaurant.map(b => ({ ...b, type: "restaurant" as const }))
  const packageBookingsList: Booking[] = bookings.package.map(b => ({ ...b, type: "package" as const }))
  const transportBookings: Booking[] = bookings.transport.map(b => ({ ...b, type: "transport" as const }))
  const guideBookings: Booking[] = bookings.guide.map(b => ({ ...b, type: "guide" as const }))
  
  return [...hotelBookings, ...restaurantBookings, ...packageBookingsList, ...transportBookings, ...guideBookings]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}
