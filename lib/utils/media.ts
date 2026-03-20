/**
 * Media URL utilities for AMAN platform
 * Handles image URLs from Django backend
 */

const MEDIA_BASE_URL = "https://api.aman.yichalal.ai"

/**
 * Convert relative media path to absolute URL
 * Backend returns paths like /media/profiles/uuid_avatar.jpg
 */
export function getMediaUrl(path: string | null | undefined): string {
  if (!path) return ""

  // If already an absolute URL, return as-is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }

  // If starts with /media/, prepend base URL
  if (path.startsWith("/media/")) {
    return `${MEDIA_BASE_URL}${path}`
  }

  // If relative path without leading slash, add /media/ prefix
  if (!path.startsWith("/")) {
    return `${MEDIA_BASE_URL}/media/${path}`
  }

  // Default: prepend base URL
  return `${MEDIA_BASE_URL}${path}`
}

/**
 * Get placeholder image URL for missing images
 */
export function getPlaceholderImage(type: "profile" | "hotel" | "city" | "restaurant" = "profile"): string {
  const placeholders = {
    profile: "/diverse-user-avatars.png",
    hotel: "/modern-hotel-exterior.png",
    city: "/vibrant-city-skyline.png",
    restaurant: "/modern-restaurant-interior.png",
  }

  return placeholders[type]
}

/**
 * Get image URL with fallback to placeholder
 */
export function getImageUrl(
  path: string | null | undefined,
  type: "profile" | "hotel" | "city" | "restaurant" = "profile",
): string {
  return getMediaUrl(path) || getPlaceholderImage(type)
}
