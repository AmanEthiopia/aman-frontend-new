import { sendGAEvent } from "@next/third-parties/google"

/**
 * Thin GA4 event layer for key conversion actions. Safe to call anywhere —
 * no-ops on the server and when GA isn't loaded (no NEXT_PUBLIC_GA id).
 * Mark these as "Key events" in GA4 → Admin → Events to see funnel/conversions.
 */
function track(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return
  sendGAEvent("event", name, params ?? {})
}

/** Account created (email or Google). GA4 recommended event `sign_up`. */
export function trackSignUp(method: "email" | "google") {
  track("sign_up", { method })
}

/** Traveler submitted a booking/reservation request. */
export function trackBookingRequest(
  bookingType: "hotel" | "restaurant" | "experience" | "guide" | "transport",
) {
  track("booking_request", { booking_type: bookingType })
}

/** Provider requested listing verification. */
export function trackVerificationRequest(entityType: string) {
  track("verification_request", { entity_type: entityType })
}
