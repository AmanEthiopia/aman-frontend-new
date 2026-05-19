import { apiGet, apiPost, apiDelete } from "./client"

export type NotificationType =
  | "booking_request"
  | "booking_confirmed"
  | "booking_cancelled"
  | "booking_rejected"
  | "new_message"
  | "new_review"
  | "review_response"
  | "payment_received"
  | "verification_complete"
  | "system"

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  booking_request: "Booking Request",
  booking_confirmed: "Booking Confirmed",
  booking_cancelled: "Booking Cancelled",
  booking_rejected: "Booking Rejected",
  new_message: "New Message",
  new_review: "New Review",
  review_response: "Review Response",
  payment_received: "Payment Received",
  verification_complete: "Verification Complete",
  system: "System",
}

export interface AppNotification {
  id: string
  notification_type: NotificationType
  title: string
  body: string
  is_read: boolean
  read_at: string | null
  action_url: string | null
  related_type: string | null
  related_id: string | null
  created_at: string
}

export interface NotificationStats {
  pending_bookings: number
  unread_messages: number
  reviews_to_respond: number
  unread_notifications: number
}

export async function getNotifications(params?: {
  type?: string
  is_read?: boolean
  page?: number
}): Promise<AppNotification[]> {
  const query = new URLSearchParams()
  if (params?.type) query.set("type", params.type)
  if (params?.is_read !== undefined) query.set("is_read", String(params.is_read))
  if (params?.page) query.set("page", String(params.page))
  const qs = query.toString()
  const raw = await apiGet<any>(`/notifications/${qs ? `?${qs}` : ""}`)
  return Array.isArray(raw) ? raw : (raw?.results ?? raw?.data ?? [])
}

export async function getUnreadCount(): Promise<number> {
  const raw = await apiGet<any>("/notifications/unread-count/")
  return raw?.unread_count ?? 0
}

export async function markAllRead(): Promise<void> {
  await apiPost("/notifications/mark-all-read/", {})
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiPost(`/notifications/${id}/read/`, {})
}

export async function clearReadNotifications(): Promise<void> {
  await apiDelete("/notifications/clear/")
}

export async function getNotificationStats(): Promise<NotificationStats> {
  const raw = await apiGet<any>("/notifications/stats/")
  return raw as NotificationStats
}
