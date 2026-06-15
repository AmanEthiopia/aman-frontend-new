import { apiPost } from "./client"

export type InquiryType = "partner" | "business" | "general" | "concierge"

export interface InquiryPayload {
  name: string
  email: string
  organization?: string
  org_type?: string
  travelers?: string
  phone?: string
  message?: string
  inquiry_type?: InquiryType
  /** Honeypot — leave empty; real users never fill this. */
  company_website?: string
}

/**
 * Submit a Partner / Business & Diplomat inquiry.
 * Backend emails it to the founders via Brevo. Resolves on success,
 * throws APIError (with a friendly message) on failure.
 */
export async function submitInquiry(payload: InquiryPayload): Promise<void> {
  await apiPost<null>("/inquiries/", { inquiry_type: "general", ...payload })
}
