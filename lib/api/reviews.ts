import { apiGet, apiPost, apiPatch, apiDelete } from "./client"

// ============================================================================
// Types
// ============================================================================

export type ReviewableType = "hotel" | "restaurant" | "experience" | "guide" | "package" | "attraction" | "transport" | "city"

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
  cleanliness_rating?: number
  location_rating?: number
  value_rating?: number
  service_rating?: number
  food_rating?: number
  is_verified_stay: boolean
  is_admin_verification: boolean
  is_featured: boolean
  helpful_count: number
  photos: { id: string; url: string }[]
  response: ReviewResponse | null
  created_at: string
}

// Normalized response returned by getReviews() — always safe to use
export interface ReviewsResponse {
  pinned: Review[]
  results: Review[]
  count: number
  hasMore: boolean
}

export interface SubmitReviewPayload {
  reviewable_type: ReviewableType
  reviewable_id: string
  booking_id?: string
  reservation_id?: string
  rating: number
  title?: string
  comment: string
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
 * Get reviews for a listing (public).
 * Normalizes both old and new backend response formats.
 */
export async function getReviews(filters: ReviewFilters): Promise<ReviewsResponse> {
  const params = new URLSearchParams()
  params.append("type", filters.type)
  params.append("id", filters.id)
  if (filters.rating) params.append("rating", String(filters.rating))
  if (filters.page) params.append("page", String(filters.page))

  try {
    const raw = await apiGet<any>(`/reviews/?${params.toString()}`)

    // New backend format: { count, next, previous, results: [...], pinned: [...] }
    // Old backend format: { pinned: [...], data: [...], meta: { pagination: { ... } } }
    const results: Review[] = raw?.results ?? raw?.data ?? []
    const pinned: Review[] = raw?.pinned ?? []
    const count: number = raw?.count ?? raw?.meta?.pagination?.count ?? results.length
    const hasMore = raw?.next != null || (raw?.meta?.pagination?.current_page < raw?.meta?.pagination?.total_pages)

    return { pinned, results, count, hasMore }
  } catch {
    return { pinned: [], results: [], count: 0, hasMore: false }
  }
}

/**
 * Get featured reviews across all listings (public) for the landing page.
 * Returns [] when nothing is featured yet — never throws.
 */
export async function getFeaturedReviews(limit = 12): Promise<Review[]> {
  try {
    const raw = await apiGet<any>(`/reviews/featured/?limit=${limit}`)
    return (raw?.data ?? raw?.results ?? raw ?? []) as Review[]
  } catch {
    return []
  }
}

/**
 * Provider: Get all reviews across my properties
 * GET /reviews/provider/?type=hotel&id=uuid&rating=5
 */
export async function getProviderReviews(filters?: {
  type?: ReviewableType
  id?: string
  rating?: number
  page?: number
}): Promise<{ results: Review[]; count: number; hasMore: boolean }> {
  const params = new URLSearchParams()
  if (filters?.type) params.append("type", filters.type)
  if (filters?.id) params.append("id", filters.id)
  if (filters?.rating) params.append("rating", String(filters.rating))
  if (filters?.page) params.append("page", String(filters.page))

  try {
    const raw = await apiGet<any>(`/reviews/provider/?${params.toString()}`)
    const results: Review[] = raw?.results ?? raw?.data ?? []
    const count: number = raw?.count ?? results.length
    const hasMore = raw?.next != null
    return { results, count, hasMore }
  } catch {
    return { results: [], count: 0, hasMore: false }
  }
}

/**
 * Traveler: Get reviews I've submitted
 * GET /reviews/mine/
 */
export async function getMyReviews(page?: number): Promise<{ results: Review[]; count: number; hasMore: boolean }> {
  const params = new URLSearchParams()
  if (page) params.append("page", String(page))

  try {
    const raw = await apiGet<any>(`/reviews/mine/?${params.toString()}`)
    const results: Review[] = raw?.results ?? raw?.data ?? []
    const count: number = raw?.count ?? results.length
    const hasMore = raw?.next != null
    return { results, count, hasMore }
  } catch {
    return { results: [], count: 0, hasMore: false }
  }
}

/**
 * Submit a review (authenticated traveler with confirmed/completed booking)
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

export async function replyToReview(reviewId: string, responseText: string): Promise<ReviewResponse> {
  return apiPost<ReviewResponse>(`/reviews/${reviewId}/response/`, { response_text: responseText })
}

export async function updateReviewReply(reviewId: string, responseText: string): Promise<ReviewResponse> {
  return apiPatch<ReviewResponse>(`/reviews/${reviewId}/response/`, { response_text: responseText })
}

export async function deleteReviewReply(reviewId: string): Promise<void> {
  return apiDelete(`/reviews/${reviewId}/response/`)
}

// ============================================================================
// Admin Review APIs
// ============================================================================

export async function getAdminReviews(filters?: {
  is_approved?: boolean
  type?: ReviewableType
  page?: number
}): Promise<{ results: Review[]; count: number }> {
  const params = new URLSearchParams()
  if (filters?.is_approved !== undefined) params.append("is_approved", String(filters.is_approved))
  if (filters?.type) params.append("type", filters.type)
  if (filters?.page) params.append("page", String(filters.page))

  const raw = await apiGet<any>(`/reviews/admin/?${params.toString()}`)
  return { results: raw?.results ?? raw?.data ?? [], count: raw?.count ?? 0 }
}

export async function updateReviewAdmin(
  reviewId: string,
  updates: { is_approved?: boolean; is_featured?: boolean }
): Promise<Review> {
  return apiPatch<Review>(`/reviews/admin/${reviewId}/`, updates)
}

// ============================================================================
// Helpers
// ============================================================================

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
    case "attraction":
      return ["value_rating", "location_rating"]
    case "transport":
      return ["service_rating", "value_rating"]
    case "city":
      return ["value_rating"]
    default:
      return []
  }
}

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

export function calculateAverageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
  return Math.round((sum / reviews.length) * 10) / 10
}

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

/** Extract the most meaningful error message from a review submission error */
export function extractReviewError(err: any): string {
  return (
    err?.errors?.non_field_errors?.[0] ??
    err?.errors?.rating?.[0] ??
    err?.errors?.comment?.[0] ??
    err?.message ??
    "Failed to submit review"
  )
}
