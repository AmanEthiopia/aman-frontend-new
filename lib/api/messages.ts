import { apiGet, apiPost } from "./client"

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  sender_name: string
  sender_avatar?: string
  content: string
  created_at: string
  read: boolean
}

export interface Conversation {
  id: string
  participant_id: string
  participant_name: string
  participant_avatar?: string
  participant_type: "host" | "support"
  is_verified: boolean
  listing_id?: string
  listing_name?: string
  last_message: Message
  unread_count: number
}

export interface SendMessagePayload {
  conversation_id: string
  content: string
}

/**
 * Get user's conversations
 */
export async function getConversations(): Promise<Conversation[]> {
  const response = await apiGet<{ results: Conversation[] }>("/messages/conversations/")
  return response.results || []
}

/**
 * Get messages for a conversation
 */
export async function getMessages(conversationId: string): Promise<Message[]> {
  const response = await apiGet<{ results: Message[] }>(`/messages/conversations/${conversationId}/messages/`)
  return response.results || []
}

/**
 * Send a message
 */
export async function sendMessage(payload: SendMessagePayload): Promise<Message> {
  return apiPost<Message>("/messages/send/", payload)
}
