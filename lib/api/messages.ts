import { apiGet, apiPost } from "./client"

// ============================================================================
// Types
// ============================================================================

export type RelatedToType = "hotel" | "restaurant" | "experience" | "booking" | "general" | "guide"

export interface MessageSender {
  id: string
  name: string
  avatar_url?: string
}

export interface Message {
  id: string
  sender: MessageSender
  message_text: string
  attachment_url: string | null
  is_system_message: boolean
  created_at: string
}

export interface LastMessage {
  text: string
  created_at: string
}

export interface Participant {
  id: string
  name: string
  avatar_url?: string
}

export interface Conversation {
  id: string
  subject: string
  related_to_type: RelatedToType
  related_to_id: string
  last_message_at: string
  is_flagged: boolean
  is_resolved: boolean
  last_message: LastMessage
  other_participant: Participant
  unread_count: number
  created_at: string
}

export interface ConversationDetail extends Conversation {
  participants: Participant[]
}

export interface StartConversationPayload {
  recipient_id: string
  related_to_type: RelatedToType
  related_to_id: string
  subject: string
  message: string
}

// ============================================================================
// Traveler/Provider APIs
// ============================================================================

/**
 * List my conversations
 */
export async function getConversations(filters?: {
  related_to_type?: RelatedToType
  page?: number
}): Promise<{ data: Conversation[]; meta: { pagination: { count: number; total_pages: number } } }> {
  const params = new URLSearchParams()
  if (filters?.related_to_type) params.append("related_to_type", filters.related_to_type)
  if (filters?.page) params.append("page", String(filters.page))

  try {
    const response = await apiGet<{ data: Conversation[]; meta: any }>(`/messages/?${params.toString()}`)
    return response
  } catch {
    return { data: [], meta: { pagination: { count: 0, total_pages: 1 } } }
  }
}

/**
 * Start a new conversation (or reuse existing one)
 */
export async function startConversation(
  payload: StartConversationPayload
): Promise<{ id: string; reused: boolean }> {
  return apiPost<{ id: string; reused: boolean }>("/messages/start/", payload)
}

/**
 * Get conversation detail
 */
export async function getConversationDetail(conversationId: string): Promise<ConversationDetail> {
  return apiGet<ConversationDetail>(`/messages/${conversationId}/`)
}

/**
 * Get messages in a conversation (supports polling with 'after' param)
 */
export async function getMessages(
  conversationId: string,
  after?: string
): Promise<{ data: Message[]; meta: any }> {
  const params = new URLSearchParams()
  if (after) params.append("after", after)

  try {
    return await apiGet<{ data: Message[]; meta: any }>(
      `/messages/${conversationId}/messages/?${params.toString()}`
    )
  } catch {
    return { data: [], meta: {} }
  }
}

/**
 * Send a message
 */
export async function sendMessage(
  conversationId: string,
  messageText: string,
  attachmentUrl?: string
): Promise<Message> {
  return apiPost<Message>(`/messages/${conversationId}/messages/send/`, {
    message_text: messageText,
    attachment_url: attachmentUrl || null,
  })
}

/**
 * Mark conversation as read
 */
export async function markConversationRead(conversationId: string): Promise<void> {
  await apiPost(`/messages/${conversationId}/read/`, {})
}

/**
 * Flag conversation as dispute (traveler)
 */
export async function flagConversation(conversationId: string, reason: string): Promise<void> {
  await apiPost(`/messages/${conversationId}/flag/`, { reason })
}

// ============================================================================
// Admin APIs
// ============================================================================

/**
 * Admin: List flagged conversations
 */
export async function getFlaggedConversations(filters?: {
  is_resolved?: boolean
  page?: number
}): Promise<{ data: Conversation[]; meta: any }> {
  const params = new URLSearchParams()
  if (filters?.is_resolved !== undefined) params.append("is_resolved", String(filters.is_resolved))
  if (filters?.page) params.append("page", String(filters.page))

  return apiGet(`/messages/admin/flagged/?${params.toString()}`)
}

/**
 * Admin: View any conversation
 */
export async function getAdminConversation(conversationId: string): Promise<ConversationDetail & { messages: Message[] }> {
  return apiGet(`/messages/admin/${conversationId}/`)
}

/**
 * Admin: Resolve dispute
 */
export async function resolveDispute(conversationId: string, resolutionNote: string): Promise<void> {
  await apiPost(`/messages/admin/${conversationId}/resolve/`, {
    resolution_note: resolutionNote,
  })
}

// ============================================================================
// Helpers
// ============================================================================

export function getRelatedTypeLabel(type: RelatedToType): string {
  const labels: Record<RelatedToType, string> = {
    hotel: "Hotel",
    restaurant: "Restaurant",
    experience: "Experience",
    booking: "Booking",
    general: "General",
    guide: "Tour Guide",
  }
  return labels[type] || type
}

export function getRelatedTypeIcon(type: RelatedToType): string {
  const icons: Record<RelatedToType, string> = {
    hotel: "Hotel",
    restaurant: "Utensils",
    experience: "Compass",
    booking: "Calendar",
    general: "MessageSquare",
    guide: "Map",
  }
  return icons[type] || "MessageSquare"
}

export function formatMessageTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  } else if (diffDays === 1) {
    return "Yesterday"
  } else if (diffDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "short" })
  } else {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }
}

/**
 * Polling hook helper - stores last fetch timestamp
 */
export function createMessagePoller(
  conversationId: string,
  onNewMessages: (messages: Message[]) => void,
  intervalMs = 5000
) {
  let lastFetch = new Date().toISOString()
  let isRunning = true

  const poll = async () => {
    if (!isRunning) return

    try {
      const { data } = await getMessages(conversationId, lastFetch)
      if (data.length > 0) {
        onNewMessages(data)
        lastFetch = new Date().toISOString()
      }
    } catch (error) {
      console.error("Polling error:", error)
    }

    if (isRunning) {
      setTimeout(poll, intervalMs)
    }
  }

  // Start polling
  setTimeout(poll, intervalMs)

  // Return stop function
  return () => {
    isRunning = false
  }
}
