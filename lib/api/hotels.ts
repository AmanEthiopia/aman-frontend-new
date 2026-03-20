import { apiGet } from "./client"
import type { Hotel, Room } from "@/lib/types"

export interface HotelSearchParams {
  city?: string
  price_min?: number
  price_max?: number
  verified?: boolean
  guests?: number
  search?: string
  limit?: number
}

export interface HotelSearchResponse {
  results: Hotel[]
  count: number
  next: string | null
  previous: string | null
}

/**
 * Get hotels with optional filters
 */
export async function getHotels(params: HotelSearchParams = {}): Promise<HotelSearchResponse> {
  return searchHotels(params)
}

/**
 * Search hotels with filters
 */
export async function searchHotels(params: HotelSearchParams = {}): Promise<HotelSearchResponse> {
  const queryParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, String(value))
    }
  })

  const queryString = queryParams.toString()
  const endpoint = queryString ? `/hotels/?${queryString}` : "/hotels/"

  return apiGet<HotelSearchResponse>(endpoint)
}

/**
 * Get hotel by ID
 */
export async function getHotelById(id: string): Promise<Hotel> {
  return apiGet<Hotel>(`/hotels/${id}/`)
}

/**
 * Get rooms for a hotel
 */
export async function getHotelRooms(hotelId: string): Promise<Room[]> {
  return apiGet<Room[]>(`/hotels/${hotelId}/rooms/`)
}
