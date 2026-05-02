// Mock API layer - simulates async API calls with realistic delays
// Ready to be replaced with real Django REST API calls

import { mockHotels, searchHotels, getHotelById } from "@/lib/mock-data/hotels"
import { mockRestaurants, searchMockRestaurants, getMockRestaurantById } from "@/lib/mock-data/restaurants"
import { mockTransport, searchTransport, getTransportById } from "@/lib/mock-data/transport"
import { mockExperiences, searchExperiences, getExperienceById } from "@/lib/mock-data/experiences"
import { mockCities, getCityById } from "@/lib/mock-data/cities"
import { mockBookings, getBookingsByStatus } from "@/lib/mock-data/bookings"
import { getReviewsByItem } from "@/lib/mock-data/reviews"
import type { BookingRequest, Hotel, Restaurant, Transport, Experience, City, Review } from "@/lib/types"

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// API Response types
interface ApiResponse<T> {
  data: T | null
  error: string | null
  loading: boolean
}

// Hotels API
export async function fetchHotels(params?: {
  city?: string
  priceRange?: string
  search?: string
  verified?: boolean
}): Promise<ApiResponse<Hotel[]>> {
  await delay(300 + Math.random() * 200)
  try {
    const hotels = params ? searchHotels(params) : mockHotels
    return { data: hotels, error: null, loading: false }
  } catch {
    return { data: null, error: "Failed to fetch hotels", loading: false }
  }
}

export async function fetchHotel(id: string): Promise<ApiResponse<Hotel>> {
  await delay(200 + Math.random() * 150)
  try {
    const hotel = getHotelById(id)
    if (!hotel) {
      return { data: null, error: "Hotel not found", loading: false }
    }
    return { data: hotel, error: null, loading: false }
  } catch {
    return { data: null, error: "Failed to fetch hotel", loading: false }
  }
}

// Restaurants API
export async function fetchRestaurants(params?: {
  city?: string
  price_range?: string
  cuisine?: string
  search?: string
}): Promise<ApiResponse<Restaurant[]>> {
  await delay(300 + Math.random() * 200)
  try {
    const restaurants = params ? searchMockRestaurants(params) : mockRestaurants
    return { data: restaurants, error: null, loading: false }
  } catch {
    return { data: null, error: "Failed to fetch restaurants", loading: false }
  }
}

export async function fetchRestaurant(id: string): Promise<ApiResponse<Restaurant>> {
  await delay(200 + Math.random() * 150)
  try {
    const restaurant = getMockRestaurantById(id)
    if (!restaurant) {
      return { data: null, error: "Restaurant not found", loading: false }
    }
    return { data: restaurant, error: null, loading: false }
  } catch {
    return { data: null, error: "Failed to fetch restaurant", loading: false }
  }
}

// Transport API
export async function fetchTransport(params?: {
  city?: string
  type?: string
  search?: string
}): Promise<ApiResponse<Transport[]>> {
  await delay(300 + Math.random() * 200)
  try {
    const transport = params ? searchTransport(params) : mockTransport
    return { data: transport, error: null, loading: false }
  } catch {
    return { data: null, error: "Failed to fetch transport", loading: false }
  }
}

export async function fetchTransportItem(id: string): Promise<ApiResponse<Transport>> {
  await delay(200 + Math.random() * 150)
  try {
    const item = getTransportById(id)
    if (!item) {
      return { data: null, error: "Transport not found", loading: false }
    }
    return { data: item, error: null, loading: false }
  } catch {
    return { data: null, error: "Failed to fetch transport", loading: false }
  }
}

// Experiences API
export async function fetchExperiences(params?: {
  city?: string
  category?: string
  priceRange?: string
  search?: string
}): Promise<ApiResponse<Experience[]>> {
  await delay(300 + Math.random() * 200)
  try {
    const experiences = params ? searchExperiences(params) : mockExperiences
    return { data: experiences, error: null, loading: false }
  } catch {
    return { data: null, error: "Failed to fetch experiences", loading: false }
  }
}

export async function fetchExperience(id: string): Promise<ApiResponse<Experience>> {
  await delay(200 + Math.random() * 150)
  try {
    const experience = getExperienceById(id)
    if (!experience) {
      return { data: null, error: "Experience not found", loading: false }
    }
    return { data: experience, error: null, loading: false }
  } catch {
    return { data: null, error: "Failed to fetch experience", loading: false }
  }
}

// Cities API
export async function fetchCities(): Promise<ApiResponse<City[]>> {
  await delay(200)
  try {
    return { data: mockCities, error: null, loading: false }
  } catch {
    return { data: null, error: "Failed to fetch cities", loading: false }
  }
}

export async function fetchCity(id: string): Promise<ApiResponse<City>> {
  await delay(150)
  try {
    const city = getCityById(id)
    if (!city) {
      return { data: null, error: "City not found", loading: false }
    }
    return { data: city, error: null, loading: false }
  } catch {
    return { data: null, error: "Failed to fetch city", loading: false }
  }
}

// Bookings API
export async function fetchBookings(status?: BookingRequest["status"]): Promise<ApiResponse<BookingRequest[]>> {
  await delay(300)
  try {
    const bookings = status ? getBookingsByStatus(status) : mockBookings
    return { data: bookings, error: null, loading: false }
  } catch {
    return { data: null, error: "Failed to fetch bookings", loading: false }
  }
}

export async function createBooking(
  booking: Omit<BookingRequest, "id" | "createdAt" | "status">,
): Promise<ApiResponse<BookingRequest>> {
  await delay(500)
  try {
    const newBooking: BookingRequest = {
      ...booking,
      id: `book-${Date.now()}`,
      status: "pending",
      createdAt: new Date().toISOString(),
    }
    return { data: newBooking, error: null, loading: false }
  } catch {
    return { data: null, error: "Failed to create booking", loading: false }
  }
}

// Reviews API
export async function fetchReviews(type: Review["type"], itemId: string): Promise<ApiResponse<Review[]>> {
  await delay(250)
  try {
    const reviews = getReviewsByItem(type, itemId)
    return { data: reviews, error: null, loading: false }
  } catch {
    return { data: null, error: "Failed to fetch reviews", loading: false }
  }
}

// AI API (placeholder)
export async function sendAIQuery(
  query: string,
  context?: { page?: string; itemId?: string },
): Promise<ApiResponse<{ response: string; suggestions?: string[] }>> {
  await delay(800 + Math.random() * 400)

  // Mock AI responses based on context
  const mockResponses: Record<string, string> = {
    default: `Based on your interest, I'd recommend exploring our verified hotels in Addis Ababa. The Capital Hotel & Spa offers excellent value near the airport, while the Sheraton Addis provides luxury amenities for a special stay.`,
    safety: `This area is well-regarded by travelers. The hotel has 24/7 security, is located in a well-lit area, and has received positive safety reviews from foreign visitors.`,
    budget: `For your budget, I'd suggest Jupiter Hotel in Kazanchis ($35-65/night) or Blue Nile Hotel in Bahir Dar ($60-120/night). Both are verified and offer great value.`,
    luxury: `For a luxury experience, consider Sheraton Addis or Kuriftu Resort in Bahir Dar. Both offer premium amenities, spa services, and exceptional dining.`,
  }

  const keywords = query.toLowerCase()
  let response = mockResponses.default

  if (keywords.includes("safe") || keywords.includes("security")) {
    response = mockResponses.safety
  } else if (keywords.includes("budget") || keywords.includes("cheap") || keywords.includes("affordable")) {
    response = mockResponses.budget
  } else if (keywords.includes("luxury") || keywords.includes("premium") || keywords.includes("best")) {
    response = mockResponses.luxury
  }

  return {
    data: {
      response: `Based on your travel dates and preferences... ${response}`,
      suggestions: [
        "What's the best area to stay in Addis?",
        "Is this hotel good for families?",
        "Suggest a day trip from here",
      ],
    },
    error: null,
    loading: false,
  }
}
