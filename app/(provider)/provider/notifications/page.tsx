"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Bell,
  Calendar,
  MessageSquare,
  Star,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Check,
  Trash2,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import {
  getNotifications,
  markAllRead,
  markNotificationRead,
  clearReadNotifications,
  getNotificationStats,
  type AppNotification,
  type NotificationType,
  type NotificationStats,
} from "@/lib/api/notifications"
import { updateMyProfile } from "@/lib/api/users"
import { useAuth } from "@/contexts/auth-context"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BOOKING_TYPES: NotificationType[] = [
  "booking_request",
  "booking_confirmed",
  "booking_cancelled",
  "booking_rejected",
]
const REVIEW_TYPES: NotificationType[] = ["new_review", "review_response"]

function getNotificationConfig(type: NotificationType) {
  if (BOOKING_TYPES.includes(type))
    return { icon: Calendar, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-950" }
  if (type === "new_message")
    return { icon: MessageSquare, color: "text-green-600", bg: "bg-green-100 dark:bg-green-950" }
  if (REVIEW_TYPES.includes(type))
    return { icon: Star, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-950" }
  if (type === "payment_received")
    return { icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-950" }
  if (type === "verification_complete")
    return { icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10" }
  return { icon: AlertCircle, color: "text-muted-foreground", bg: "bg-muted" }
}

type FilterTab = "all" | "unread" | "bookings" | "messages" | "reviews"

// ─── Notification Card ────────────────────────────────────────────────────────

function NotifCard({
  notif,
  onClick,
}: {
  notif: AppNotification
  onClick: (n: AppNotification) => void
}) {
  const { icon: Icon, color, bg } = getNotificationConfig(notif.notification_type)
  return (
    <button
      onClick={() => onClick(notif)}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-muted/50",
        !notif.is_read && "border-primary/20 bg-primary/5"
      )}
    >
      <div className={cn("mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full", bg)}>
        <Icon className={cn("h-5 w-5", color)} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm", !notif.is_read && "font-semibold")}>{notif.title}</p>
          {!notif.is_read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
        </div>
        <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{notif.body}</p>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
        </p>
      </div>
    </button>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProviderNotificationsPage() {
  const router = useRouter()
  const { userProfile, refreshUser } = useAuth()

  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FilterTab>("all")

  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  // Notification preference state
  const profile = userProfile?.profile
  const [notif, setNotif] = useState({
    notif_email_bookings: profile?.notif_email_bookings ?? true,
    notif_email_messages: profile?.notif_email_messages ?? true,
    notif_email_reviews: profile?.notif_email_reviews ?? true,
    notif_email_payments: profile?.notif_email_payments ?? true,
    notif_email_marketing: profile?.notif_email_marketing ?? false,
    notif_push_bookings: profile?.notif_push_bookings ?? true,
    notif_push_messages: profile?.notif_push_messages ?? true,
  })
  const [savingNotif, setSavingNotif] = useState(false)

  useEffect(() => {
    if (profile) {
      setNotif({
        notif_email_bookings: profile.notif_email_bookings ?? true,
        notif_email_messages: profile.notif_email_messages ?? true,
        notif_email_reviews: profile.notif_email_reviews ?? true,
        notif_email_payments: profile.notif_email_payments ?? true,
        notif_email_marketing: profile.notif_email_marketing ?? false,
        notif_push_bookings: profile.notif_push_bookings ?? true,
        notif_push_messages: profile.notif_push_messages ?? true,
      })
    }
  }, [profile])

  const loadNotifications = useCallback(async () => {
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

  const loadStats = useCallback(async () => {
    setLoadingStats(true)
    try {
      const data = await getNotificationStats()
      setStats(data)
    } catch {
      setStats(null)
    } finally {
      setLoadingStats(false)
    }
  }, [])

  useEffect(() => {
    loadNotifications()
    loadStats()
  }, [loadNotifications, loadStats])

  const filtered = notifications.filter((n) => {
    if (activeTab === "unread") return !n.is_read
    if (activeTab === "bookings") return BOOKING_TYPES.includes(n.notification_type)
    if (activeTab === "messages") return n.notification_type === "new_message"
    if (activeTab === "reviews") return REVIEW_TYPES.includes(n.notification_type)
    return true
  })

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const handleMarkAllRead = async () => {
    await markAllRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    toast.success("All notifications marked as read")
  }

  const handleClearAll = async () => {
    await clearReadNotifications()
    setNotifications((prev) => prev.filter((n) => !n.is_read))
    toast.success("Read notifications cleared")
  }

  const handleNotifClick = async (notif: AppNotification) => {
    if (!notif.is_read) {
      await markNotificationRead(notif.id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      )
    }
    if (notif.action_url) router.push(notif.action_url)
  }

  const handleNotifPrefChange = async (field: keyof typeof notif, checked: boolean) => {
    const updated = { ...notif, [field]: checked }
    setNotif(updated)
    setSavingNotif(true)
    try {
      await updateMyProfile(updated)
    } catch {
      setNotif(notif)
      toast.error("Failed to save preference")
    } finally {
      setSavingNotif(false)
    }
  }

  const tabs: { id: FilterTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread" },
    { id: "bookings", label: "Bookings" },
    { id: "messages", label: "Messages" },
    { id: "reviews", label: "Reviews" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">
          {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All caught up"}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Left: Feed ─────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Filter tabs */}
            <div className="flex gap-1 overflow-x-auto rounded-lg border bg-muted/40 p-1">
              {tabs.map((tab) => {
                const count =
                  tab.id === "all"
                    ? notifications.length
                    : tab.id === "unread"
                    ? unreadCount
                    : undefined
                return (
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
                    {count !== undefined && count > 0 && (
                      <Badge
                        variant={tab.id === "unread" ? "destructive" : "secondary"}
                        className="h-4 min-w-4 px-1 text-[10px]"
                      >
                        {count}
                      </Badge>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="flex gap-2">
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

          {/* List */}
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
              {filtered.map((n) => (
                <NotifCard key={n.id} notif={n} onClick={handleNotifClick} />
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Stats + Settings ─────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingStats ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-10 rounded-full" />
                  </div>
                ))
              ) : stats ? (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Pending Bookings</span>
                    <Badge variant={stats.pending_bookings > 0 ? "destructive" : "secondary"}>
                      {stats.pending_bookings}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Unread Messages</span>
                    <Badge variant={stats.unread_messages > 0 ? "destructive" : "secondary"}>
                      {stats.unread_messages}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Reviews to Respond</span>
                    <Badge variant={stats.reviews_to_respond > 0 ? "default" : "secondary"}>
                      {stats.reviews_to_respond}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Unread Notifications</span>
                    <Badge variant={stats.unread_notifications > 0 ? "default" : "secondary"}>
                      {stats.unread_notifications}
                    </Badge>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Could not load stats</p>
              )}
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Notification Settings</CardTitle>
                  <CardDescription className="text-xs">Choose what you receive</CardDescription>
                </div>
                {savingNotif && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</p>
              {[
                { field: "notif_email_bookings" as const, label: "Booking updates" },
                { field: "notif_email_messages" as const, label: "New messages" },
                { field: "notif_email_reviews" as const, label: "Reviews" },
                { field: "notif_email_payments" as const, label: "Payments" },
                { field: "notif_email_marketing" as const, label: "Marketing" },
              ].map(({ field, label }) => (
                <div key={field} className="flex items-center justify-between">
                  <Label className="text-sm font-normal">{label}</Label>
                  <Switch
                    checked={notif[field]}
                    onCheckedChange={(v) => handleNotifPrefChange(field, v)}
                    disabled={savingNotif}
                  />
                </div>
              ))}
              <Separator />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Push</p>
              {[
                { field: "notif_push_bookings" as const, label: "Booking alerts" },
                { field: "notif_push_messages" as const, label: "Message alerts" },
              ].map(({ field, label }) => (
                <div key={field} className="flex items-center justify-between">
                  <Label className="text-sm font-normal">{label}</Label>
                  <Switch
                    checked={notif[field]}
                    onCheckedChange={(v) => handleNotifPrefChange(field, v)}
                    disabled={savingNotif}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
