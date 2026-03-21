import { apiFetch } from "./client"
import type { Hotel, Room } from "@/lib/types"

const API_BASE_URL = "https://api.aman.yichalal.ai/api/v1"

export interface HotelSearchParams {
  city?: string
  price_min?: number
  price_max?: number
  verified?: boolean
  guests?: number
  search?: string
  limit?: number
  page?: number
  page_size?: number
}

export interface HotelSearchResponse {
  results: Hotel[]
  count: number
  next: string | null
  previous: string | null
}

/**
 * Get hotels with optional filters
 * This bypasses the standard apiGet to handle pagination response format
 */
export async function getHotels(params: HotelSearchParams = {}): Promise<HotelSearchResponse> {
  return searchHotels(params)
}

/**
 * Search hotels with filters
 * The /hotels/ endpoint returns a paginated response with results array
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
  const url = `${API_BASE_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch hotels: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Handle different response formats
    // Format 1: { success: true, data: { results: [...], count: N } }
    // Format 2: { results: [...], count: N }
    // Format 3: { success: true, data: [...] } (array directly)
    
    if (data.success !== undefined && data.data) {
      // Envelope format
      if (Array.isArray(data.data)) {
        return {
          results: data.data,
          count: data.data.length,
          next: null,
          previous: null,
        }
      }
      return data.data as HotelSearchResponse
    }
    
    if (data.results) {
      // Direct pagination format
      return data as HotelSearchResponse
    }
    
    if (Array.isArray(data)) {
      // Direct array format
      return {
        results: data,
        count: data.length,
        next: null,
        previous: null,
      }
    }
    
    // Fallback - return empty
    return {
      results: [],
      count: 0,
      next: null,
      previous: null,
    }
  } catch (error) {
    console.error("[v0] Hotels API error:", error)
    throw error
  }
}

/**
 * Get hotel by ID or slug
 * The API supports both UUID and slug lookup
 */
export async function getHotelById(idOrSlug: string): Promise<Hotel> {
  return apiFetch<Hotel>(`/hotels/${idOrSlug}/`)
}

/**
 * Get rooms for a hotel
 */
export async function getHotelRooms(hotelId: string): Promise<Room[]> {
  return apiFetch<Room[]>(`/hotels/${hotelId}/rooms/`)
}
