import { apiPost } from "./client"

// ── Chat assistant ────────────────────────────────────────────────────────────

export interface ChatContext {
  page?: string
  itemId?: string
}

export interface ChatHistoryItem {
  role: "user" | "assistant"
  content: string
}

/**
 * Ask the Algalle AI assistant (grounded on our live listings, then general
 * knowledge). Throws APIError with a friendly message on failure.
 */
export async function sendAIQuery(
  message: string,
  opts?: { history?: ChatHistoryItem[]; context?: ChatContext },
): Promise<{ response: string }> {
  return apiPost<{ response: string }>("/ai/chat/", {
    message,
    history: opts?.history ?? [],
    context: opts?.context ?? {},
  })
}

// ── Itinerary planner ─────────────────────────────────────────────────────────

export interface ItineraryActivity {
  id: string
  time: string
  type: "hotel" | "restaurant" | "experience" | "transport"
  title: string
  description: string
  price?: number
  duration?: string
  selected: boolean
}

export interface ItineraryDay {
  day: number
  date: string
  city: string
  activities: ItineraryActivity[]
}

export interface ItineraryRequest {
  destination?: string
  days: number
  travelers?: string
  budget?: string
  interests?: string[]
  notes?: string
}

/**
 * Generate a day-by-day itinerary with the AI planner, grounded on our listings.
 */
export async function generateItinerary(
  payload: ItineraryRequest,
): Promise<{ itinerary: ItineraryDay[]; destination: string; days: number }> {
  return apiPost<{ itinerary: ItineraryDay[]; destination: string; days: number }>("/ai/plan/", payload)
}
