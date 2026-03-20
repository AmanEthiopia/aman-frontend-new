import { apiPost, apiGet } from "./client"
import type { Booking } from "@/lib/types"

export interface CreateBookingPayload {
  hotel_id: string
  room_id?: string
  check_in: string
  check_out: string
  guests: number
  special_requests?: string
}

export interface BookingResponse {
  booking: Booking
  message: string
}

/**
 * Create a new booking request
 */
export async function createBooking(payload: CreateBookingPayload): Promise<BookingResponse> {
  return apiPost<BookingResponse>("/bookings/create/", payload)
}

/**
 * Get user's bookings
 */
export async function getUserBookings(): Promise<Booking[]> {
  const response = await apiGet<{ results: Booking[] }>("/bookings/")
  return response.results || []
}

/**
 * Get booking by ID
 */
export async function getBookingById(id: string): Promise<Booking> {
  return apiGet<Booking>(`/bookings/${id}/`)
}
