import { apiFetch, apiPost, apiPatch, apiDelete } from "./client"
import type { Hotel, Room, RoomUnit } from "@/lib/types"
export type { Hotel, Room, RoomUnit } from "@/lib/types"

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
  latitude?: number
  longitude?: number
  radius_km?: number
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
    
    // New standard: { success: true, data: [...], meta: { pagination: {...} } }
    if (data.meta?.pagination) {
      const p = data.meta.pagination
      return {
        results: data.data || data.results || [],
        count: p.count ?? 0,
        next: p.next || null,
        previous: p.previous || null,
      }
    }

    if (data.success !== undefined && data.data) {
      // Envelope without meta (fallback)
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
 * Get rooms for a hotel, optionally with date-based availability
 * Pass check_in/check_out to get available_units populated per room
 */
export async function getHotelRooms(
  hotelId: string,
  params?: { check_in?: string; check_out?: string }
): Promise<Room[]> {
  const qs = new URLSearchParams()
  if (params?.check_in) qs.append("check_in", params.check_in)
  if (params?.check_out) qs.append("check_out", params.check_out)
  const query = qs.toString() ? `?${qs.toString()}` : ""
  const result = await apiFetch<Room[] | { results: Room[] }>(`/hotels/${hotelId}/rooms/${query}`)
  return Array.isArray(result) ? result : (result as any)?.results ?? []
}

// ============================================================================
// Room Unit Management (physical room numbers)
// ============================================================================

export interface CreateRoomUnitPayload {
  unit_number: string
  label?: string
  is_active?: boolean
}

export async function getRoomUnits(hotelId: string, roomId: string): Promise<RoomUnit[]> {
  const result = await apiFetch<RoomUnit[] | { results: RoomUnit[] }>(
    `/hotels/provider/${hotelId}/rooms/${roomId}/units/`
  )
  return Array.isArray(result) ? result : (result as any)?.results ?? []
}

export async function createRoomUnit(
  hotelId: string,
  roomId: string,
  payload: CreateRoomUnitPayload
): Promise<RoomUnit> {
  return apiPost<RoomUnit>(`/hotels/provider/${hotelId}/rooms/${roomId}/units/`, payload)
}

export async function updateRoomUnit(
  hotelId: string,
  roomId: string,
  unitId: string,
  payload: Partial<CreateRoomUnitPayload>
): Promise<RoomUnit> {
  return apiPatch<RoomUnit>(`/hotels/provider/${hotelId}/rooms/${roomId}/units/${unitId}/`, payload)
}

export async function deleteRoomUnit(
  hotelId: string,
  roomId: string,
  unitId: string
): Promise<void> {
  return apiDelete(`/hotels/provider/${hotelId}/rooms/${roomId}/units/${unitId}/`)
}
