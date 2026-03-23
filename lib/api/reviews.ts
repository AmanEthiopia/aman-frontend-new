import { apiGet, apiPost, apiPatch, apiDelete } from "./client"

// ============================================================================
// Types
// ============================================================================

export type ReviewableType = "hotel" | "restaurant" | "experience" | "guide" | "package"

export interface ReviewAuthor {
  id: string | null
  name: string
  avatar_url?: string
  is_admin: boolean
}

export interface ReviewResponse {
  id: string
  responder: {
    id: string
    name: string
  }
  response_text: string
  created_at: string
}

export interface Review {
  id: string
  author: ReviewAuthor
  rating: number
  title?: string
  comment: string
  // Sub-ratings (varies by type)
  cleanliness_rating?: number
  location_rating?: number
  value_rating?: number
  service_rating?: number
  food_rating?: number
  // Meta
  is_verified_stay: boolean
  is_admin_verification: boolean
  is_featured: boolean
  helpful_count: number
  photos: { id: string; url: string }[]
  response: ReviewResponse | null
  created_at: string
}

export interface ReviewsResponse {
  pinned: Review[]
  data: Review[]
  meta: {
    pagination: {
      count: number
      current_page: number
      total_pages: number
    }
  }
}

export interface SubmitReviewPayload {
  reviewable_type: ReviewableType
  reviewable_id: string
  booking_id?: string // For hotel, experience
  reservation_id?: string // For restaurant
  rating: number
  title?: string
  comment: string
  // Sub-ratings
  cleanliness_rating?: number
  location_rating?: number
  value_rating?: number
  service_rating?: number
  food_rating?: number
  photos?: string[]
}

export interface ReviewFilters {
  type: ReviewableType
  id: string
  rating?: number
  page?: number
}

// ============================================================================
// Public Review APIs
// ============================================================================

/**
 * Get reviews for a listing (public)
 */
export async function getReviews(filters: ReviewFilters): Promise<ReviewsResponse> {
  const params = new URLSearchParams()
  params.append("type", filters.type)
  params.append("id", filters.id)
  if (filters.rating) params.append("rating", String(filters.rating))
  if (filters.page) params.append("page", String(filters.page))

  try {
    return await apiGet<ReviewsResponse>(`/reviews/?${params.toString()}`)
  } catch {
    return { pinned: [], data: [], meta: { pagination: { count: 0, current_page: 1, total_pages: 1 } } }
  }
}

/**
 * Submit a review (authenticated traveler with completed booking)
 */
export async function submitReview(payload: SubmitReviewPayload): Promise<{ id: string }> {
  return apiPost<{ id: string }>("/reviews/submit/", payload)
}

/**
 * Mark review as helpful (toggle)
 */
export async function toggleHelpful(reviewId: string): Promise<{ helpful_count: number }> {
  return apiPost<{ helpful_count: number }>(`/reviews/${reviewId}/helpful/`, {})
}

// ============================================================================
// Provider Review APIs
// ============================================================================

/**
 * Provider: Reply to a review
 */
export async function replyToReview(reviewId: string, responseText: string): Promise<ReviewResponse> {
  return apiPost<ReviewResponse>(`/reviews/${reviewId}/response/`, {
    response_text: responseText,
  })
}

/**
 * Provider: Update reply
 */
export async function updateReviewReply(reviewId: string, responseText: string): Promise<ReviewResponse> {
  return apiPatch<ReviewResponse>(`/reviews/${reviewId}/response/`, {
    response_text: responseText,
  })
}

/**
 * Provider: Delete reply
 */
export async function deleteReviewReply(reviewId: string): Promise<void> {
  return apiDelete(`/reviews/${reviewId}/response/`)
}

// ============================================================================
// Admin Review APIs
// ============================================================================

/**
 * Admin: List all reviews
 */
export async function getAdminReviews(filters?: {
  is_approved?: boolean
  type?: ReviewableType
  page?: number
}): Promise<{ data: Review[]; meta: { pagination: { count: number; current_page: number; total_pages: number } } }> {
  const params = new URLSearchParams()
  if (filters?.is_approved !== undefined) params.append("is_approved", String(filters.is_approved))
  if (filters?.type) params.append("type", filters.type)
  if (filters?.page) params.append("page", String(filters.page))

  return apiGet(`/reviews/admin/?${params.toString()}`)
}

/**
 * Admin: Approve/feature/hide a review
 */
export async function updateReviewAdmin(
  reviewId: string,
  updates: { is_approved?: boolean; is_featured?: boolean }
): Promise<Review> {
  return apiPatch<Review>(`/reviews/admin/${reviewId}/`, updates)
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Get available sub-ratings for a listing type
 */
export function getSubRatingsForType(type: ReviewableType): string[] {
  switch (type) {
    case "hotel":
      return ["cleanliness_rating", "location_rating", "value_rating", "service_rating"]
    case "restaurant":
      return ["food_rating", "service_rating", "value_rating", "location_rating"]
    case "experience":
    case "package":
      return ["value_rating", "service_rating"]
    case "guide":
      return ["service_rating", "value_rating"]
    default:
      return []
  }
}

/**
 * Get sub-rating labels
 */
export function getSubRatingLabel(key: string): string {
  const labels: Record<string, string> = {
    cleanliness_rating: "Cleanliness",
    location_rating: "Location",
    value_rating: "Value for Money",
    service_rating: "Service",
    food_rating: "Food Quality",
  }
  return labels[key] || key
}

/**
 * Calculate average rating from reviews
 */
export function calculateAverageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
  return Math.round((sum / reviews.length) * 10) / 10
}

/**
 * Get rating distribution
 */
export function getRatingDistribution(reviews: Review[]): { rating: number; count: number; percentage: number }[] {
  const counts = [0, 0, 0, 0, 0]
  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1]++
  })
  const total = reviews.length || 1
  return [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: counts[rating - 1],
    percentage: Math.round((counts[rating - 1] / total) * 100),
  }))
}

/**
 * Format review date for display
 */
export function formatReviewDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
  } catch {
    return dateString
  }
}
