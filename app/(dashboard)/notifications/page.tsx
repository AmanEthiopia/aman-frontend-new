"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Bell,
  Calendar,
  MessageSquare,
  Star,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Check,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  getNotifications,
  markAllRead,
  markNotificationRead,
  clearReadNotifications,
  type AppNotification,
  type NotificationType,
} from "@/lib/api/notifications"
import { formatDistanceToNow } from "date-fns"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BOOKING_TYPES: NotificationType[] = [
  "booking_request",
  "booking_confirmed",
  "booking_cancelled",
  "booking_rejected",
]

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "booking_request":
    case "booking_confirmed":
    case "booking_cancelled":
    case "booking_rejected":
      return <Calendar className="h-5 w-5 text-blue-500" />
    case "new_message":
      return <MessageSquare className="h-5 w-5 text-purple-500" />
    case "new_review":
    case "review_response":
      return <Star className="h-5 w-5 text-amber-500" />
    case "payment_received":
      return <DollarSign className="h-5 w-5 text-green-500" />
    case "verification_complete":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />
    default:
      return <AlertCircle className="h-5 w-5 text-muted-foreground" />
  }
}

type FilterTab = "all" | "unread" | "bookings" | "messages"

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FilterTab>("all")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getNotifications()
      setNotifications(data)
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = notifications.filter((n) => {
    if (activeTab === "unread") return !n.is_read
    if (activeTab === "bookings") return BOOKING_TYPES.includes(n.notification_type)
    if (activeTab === "messages") return n.notification_type === "new_message"
    return true
  })

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const handleMarkAllRead = async () => {
    await markAllRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  const handleClearAll = async () => {
    await clearReadNotifications()
    setNotifications((prev) => prev.filter((n) => !n.is_read))
  }

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.is_read) {
      await markNotificationRead(notif.id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      )
    }
    if (notif.action_url) {
      router.push(notif.action_url)
    }
  }

  const tabs: { id: FilterTab; label: string; count?: number }[] = [
    { id: "all", label: "All", count: notifications.length },
    { id: "unread", label: "Unread", count: unreadCount },
    { id: "bookings", label: "Bookings" },
    { id: "messages", label: "Messages" },
  ]

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <Check className="mr-1.5 h-4 w-4" />
              Mark all read
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleClearAll}>
            <Trash2 className="mr-1.5 h-4 w-4" />
            Clear read
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg border bg-muted/40 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <Badge variant={tab.id === "unread" ? "destructive" : "secondary"} className="h-4 min-w-4 px-1 text-[10px]">
                {tab.count}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 rounded-lg border bg-background p-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-background py-16 text-center">
          <Bell className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <h3 className="font-semibold">No notifications</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeTab === "unread" ? "You're all caught up!" : "Nothing here yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((notif) => (
            <button
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={cn(
                "flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-muted/50",
                !notif.is_read && "border-primary/20 bg-primary/5"
              )}
            >
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                {getNotificationIcon(notif.notification_type)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn("text-sm", !notif.is_read && "font-semibold")}>{notif.title}</p>
                  {!notif.is_read && (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
                <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{notif.body}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
