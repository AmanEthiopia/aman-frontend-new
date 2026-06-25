import { apiGet, apiPost, apiPut } from "./client"

// ============================================================================
// Types
// ============================================================================

export type EntityType = "hotel" | "restaurant" | "experience" | "guide" | "package" | "driver"
export type VerificationStatus = "pending" | "in_review" | "approved" | "rejected" | "change_requested"

export interface VerificationRequest {
  id: string
  entity_type: EntityType
  entity_id: string
  entity_name?: string
  status: VerificationStatus
  submitted_by_email?: string
  reviewed_by_email?: string
  requirements?: string[]
  documents?: string[]
  submitter_notes?: string
  admin_notes?: string
  verification_comment?: string
  reviewed_at: string | null
  created_at: string
}

// Renamed from VerificationStatus to avoid conflict with the status union type
export interface VerificationStatusInfo {
  id: string
  status: VerificationStatus
  requirements: string[]
  admin_notes?: string
  entity_name?: string
  reviewed_at: string | null
}

export interface SubmitVerificationPayload {
  // Documents are no longer required — the admin verifies by cross-checking the
  // listing's existing photos and profile content. Kept optional for back-compat.
  documents?: string[]
  submitter_notes?: string
}

// ============================================================================
// Provider APIs
// ============================================================================

/**
 * Provider: Submit entity for verification (also used for resubmit after change request)
 */
export async function submitForVerification(
  entityType: EntityType,
  entityId: string,
  payload: SubmitVerificationPayload
): Promise<{ id: string; status: string }> {
  return apiPost<{ id: string; status: string }>(
    `/admin/verifications/submit/?entity_type=${entityType}&entity_id=${entityId}`,
    payload
  )
}

/**
 * Provider: Check verification status for a specific entity
 */
export async function getVerificationStatus(
  entityType: EntityType,
  entityId: string
): Promise<VerificationStatusInfo | null> {
  try {
    return await apiGet<VerificationStatusInfo>(
      `/admin/verifications/status/?entity_type=${entityType}&entity_id=${entityId}`
    )
  } catch {
    return null
  }
}

// ============================================================================
// Admin APIs
// ============================================================================

/**
 * Admin: List all verification requests
 */
export async function getVerificationRequests(filters?: {
  status?: VerificationStatus
  entity_type?: EntityType
  page?: number
}): Promise<{ data: VerificationRequest[]; meta: { pagination: { count: number; total_pages: number } } }> {
  const params = new URLSearchParams()
  if (filters?.status) params.append("status", filters.status)
  if (filters?.entity_type) params.append("entity_type", filters.entity_type)
  if (filters?.page) params.append("page", String(filters.page))

  return apiGet(`/admin/verifications/?${params.toString()}`)
}

/**
 * Admin: Get verification detail
 */
export async function getVerificationDetail(verificationId: string): Promise<VerificationRequest> {
  return apiGet<VerificationRequest>(`/admin/verifications/${verificationId}/`)
}

/**
 * Admin: Move a request to in_review status
 */
export async function startReview(verificationId: string): Promise<VerificationRequest> {
  return apiPost<VerificationRequest>(`/admin/verifications/${verificationId}/start-review/`, {})
}

/**
 * Admin: Set requirements for a verification
 */
export async function setVerificationRequirements(
  verificationId: string,
  requirements: string[]
): Promise<VerificationRequest> {
  return apiPut<VerificationRequest>(`/admin/verifications/${verificationId}/requirements/`, {
    requirements,
  })
}

/**
 * Admin: Approve verification
 */
export async function approveVerification(
  verificationId: string,
  payload: {
    admin_notes?: string
    verification_comment: string
  }
): Promise<VerificationRequest> {
  return apiPost<VerificationRequest>(`/admin/verifications/${verificationId}/approve/`, payload)
}

/**
 * Admin: Request changes from provider (non-final — provider can fix and resubmit)
 */
export async function requestChanges(
  verificationId: string,
  payload: {
    admin_notes: string
    requirements?: string[]
  }
): Promise<VerificationRequest> {
  return apiPost<VerificationRequest>(`/admin/verifications/${verificationId}/request-changes/`, payload)
}

/**
 * Admin: Reject verification (final)
 */
export async function rejectVerification(
  verificationId: string,
  adminNotes: string
): Promise<VerificationRequest> {
  return apiPost<VerificationRequest>(`/admin/verifications/${verificationId}/reject/`, {
    admin_notes: adminNotes,
  })
}

// ============================================================================
// Helpers
// ============================================================================

export function getStatusColor(status: string): string {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
    case "in_review":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
    case "approved":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
    case "change_requested":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Pending Review"
    case "in_review":
      return "In Review"
    case "approved":
      return "Verified"
    case "change_requested":
      return "Changes Requested"
    case "rejected":
      return "Rejected"
    default:
      return status
  }
}

export function getEntityTypeLabel(type: EntityType): string {
  const labels: Record<EntityType, string> = {
    hotel: "Hotel",
    restaurant: "Restaurant",
    experience: "Experience",
    guide: "Tour Guide",
    package: "Package",
    driver: "Driver",
  }
  return labels[type] || type
}

export const COMMON_REQUIREMENTS = [
  "business_license",
  "national_id",
  "physical_inspection",
  "tax_certificate",
  "health_permit",
  "tourism_license",
] as const

export function getRequirementLabel(req: string): string {
  const labels: Record<string, string> = {
    business_license: "Business License",
    national_id: "National ID",
    physical_inspection: "Physical Inspection",
    tax_certificate: "Tax Certificate",
    health_permit: "Health Permit",
    tourism_license: "Tourism License",
  }
  return labels[req] || req
}
