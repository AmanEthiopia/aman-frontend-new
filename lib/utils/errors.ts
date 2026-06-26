/**
 * Centralized error utilities — converts technical API/network errors into
 * plain-language messages that travelers and providers can understand.
 */

// ── Status-code → human message map ──────────────────────────────────────────

export const STATUS_MESSAGES: Record<number, string> = {
  400: "Please check your input and try again.",
  401: "You need to sign in to continue.",
  403: "You don't have permission to do that.",
  404: "We couldn't find what you're looking for.",
  408: "The request took too long. Please try again.",
  409: "This conflicts with an existing record. Please refresh and try again.",
  422: "The information you submitted isn't valid. Please review and try again.",
  429: "Too many attempts. Please wait a moment before trying again.",
  500: "Something went wrong on our end. Please try again shortly.",
  502: "The service is temporarily unreachable. Please try again in a moment.",
  503: "The service is temporarily unavailable. Please try again shortly.",
  504: "The request timed out. Please check your connection and try again.",
  0:   "Connection failed. Please check your internet connection and try again.",
}

// ── Key → readable label map for common DRF field names ──────────────────────

const FIELD_LABELS: Record<string, string> = {
  non_field_errors: "",
  detail: "",
  __all__: "",
  email: "Email",
  password: "Password",
  password1: "Password",
  password2: "Confirm password",
  phone: "Phone number",
  first_name: "First name",
  last_name: "Last name",
  guest_name: "Guest name",
  guest_email: "Guest email",
  guest_phone: "Guest phone",
  check_in_date: "Check-in date",
  check_out_date: "Check-out date",
  hotel_id: "Hotel",
  room_id: "Room",
  rooms: "Rooms",
  package_id: "Experience",
  departure_id: "Departure date",
  guide_id: "Guide",
  booking_date: "Booking date",
  num_adults: "Number of adults",
  num_children: "Number of children",
  price: "Price",
  currency: "Currency",
}

function humanizeKey(key: string): string {
  if (key in FIELD_LABELS) return FIELD_LABELS[key]
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^\w/, (c) => c.toUpperCase())
}

// ── Core flattening ───────────────────────────────────────────────────────────

/**
 * Flatten DRF-style validation errors into a readable string.
 *
 * Handles:
 *  - plain string         → returned as-is
 *  - string[]             → joined with " "
 *  - {field: string[]}    → "Field: msg1 msg2  •  Field2: msg3"
 *  - {non_field_errors}   → drops the field label
 *  - deeply nested        → recursed one level
 */
export function flattenErrors(data: unknown): string | null {
  if (!data) return null

  if (typeof data === "string") {
    return data.trim() || null
  }

  if (Array.isArray(data)) {
    const parts = data
      .map((item) => (typeof item === "string" ? item.trim() : flattenErrors(item)))
      .filter(Boolean) as string[]
    return parts.join("  ") || null
  }

  if (typeof data === "object" && data !== null) {
    const parts: string[] = []
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const label = humanizeKey(key)
      const msg: string | null = Array.isArray(value)
        ? (value as unknown[]).map((v) => (typeof v === "string" ? v : flattenErrors(v))).filter(Boolean).join(" ")
        : typeof value === "string"
        ? value.trim()
        : flattenErrors(value)

      if (msg) {
        parts.push(label ? `${label}: ${msg}` : msg)
      }
    }
    return parts.join("  •  ") || null
  }

  return null
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Convert any thrown value into a user-friendly error string.
 *
 * Priority order:
 *  1. Flattened DRF validation errors from APIError.data
 *  2. APIError.message (if not a generic placeholder)
 *  3. HTTP status-code message
 *  4. Network / fetch error → friendly connection message
 *  5. provided fallback
 */
export function friendlyError(
  err: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (!err) return fallback

  // APIError shape: { status, message, data }
  if (typeof err === "object" && "status" in err) {
    const e = err as { status: number; message?: string; data?: unknown }

    // 1. Validation details from DRF error data
    if (e.data) {
      const flat = flattenErrors(e.data)
      if (flat) return flat
    }

    // 2. Meaningful message attached to the error
    const GENERIC = ["Request failed", "request failed", "Failed", "Error"]
    if (e.message && !GENERIC.some((g) => e.message === g)) {
      // Don't expose raw HTTP status phrases
      if (!e.message.match(/^\d{3}\s/)) {
        return e.message
      }
    }

    // 3. Status-code lookup
    if (e.status && STATUS_MESSAGES[e.status]) {
      return STATUS_MESSAGES[e.status]
    }
  }

  // Standard Error objects
  if (err instanceof Error) {
    const msg = err.message.toLowerCase()
    if (
      msg.includes("failed to fetch") ||
      msg.includes("networkerror") ||
      msg.includes("network error") ||
      msg.includes("fetch")
    ) {
      return STATUS_MESSAGES[0]
    }
    // Don't expose stack traces or module paths
    if (err.message && !err.message.includes("at ") && !err.message.includes(".ts:")) {
      return err.message
    }
  }

  return fallback
}

/**
 * User-facing message for provider publish/unpublish actions.
 *
 * Per product spec, 403 (not owner) and 404 (not found / not owned) are shown
 * identically. Everything else defers to friendlyError, which surfaces the
 * backend's message — important for gated publish (400) where the message
 * explains exactly what's missing.
 */
export function listingActionError(err: unknown, fallback: string): string {
  const status =
    err && typeof err === "object" && "status" in err
      ? (err as { status?: number }).status
      : undefined
  if (status === 403 || status === 404) return "You can't modify this listing."
  return friendlyError(err, fallback)
}

/**
 * Returns a context-specific fallback message for common actions.
 * Use this when you want a more specific default than "Something went wrong."
 */
export function actionError(action: string): string {
  const map: Record<string, string> = {
    login:          "We couldn't sign you in. Please check your email and password.",
    register:       "We couldn't create your account. Please try again.",
    "book-hotel":   "We couldn't submit your booking request. Please try again.",
    "book-trip":    "We couldn't submit your booking. Please try again.",
    "book-guide":   "We couldn't submit your booking request. Please try again.",
    "confirm-booking": "We couldn't confirm this booking. Please try again.",
    "reject-booking":  "We couldn't reject this booking. Please try again.",
    "cancel-booking":  "We couldn't cancel this booking. Please try again.",
    "save-profile": "We couldn't save your profile changes. Please try again.",
    "upload-photo": "We couldn't upload the photo. Please try again.",
    "delete-photo": "We couldn't delete the photo. Please try again.",
    "load-hotel":   "We couldn't load the hotel details. Please refresh the page.",
    "load-trip":    "We couldn't load the trip details. Please refresh the page.",
    "load-guide":   "We couldn't load the guide details. Please refresh the page.",
    "load-bookings":"We couldn't load your bookings. Please refresh the page.",
    "load-earnings":"We couldn't load your earnings data. Please refresh the page.",
  }
  return map[action] ?? "Something went wrong. Please try again."
}
