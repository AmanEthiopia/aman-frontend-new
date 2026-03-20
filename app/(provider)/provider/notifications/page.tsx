"use client"

import { useState } from "react"
import {
  Bell,
  Calendar,
  MessageSquare,
  Star,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Info,
  Check,
  Trash2,
  Settings,
  Building2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  type: "booking" | "message" | "review" | "payment" | "system" | "alert"
  title: string
  description: string
  time: string
  isRead: boolean
  actionUrl?: string
  actionLabel?: string
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "booking",
    title: "New Booking Request",
    description: "Sarah Johnson requested to book Deluxe Suite for Jan 18-21",
    time: "2 hours ago",
    isRead: false,
    actionUrl: "/provider/bookings",
    actionLabel: "Review",
  },
  {
    id: "2",
    type: "message",
    title: "New Message from Michael Chen",
    description: "Hi, I have a question about the check-in time...",
    time: "3 hours ago",
    isRead: false,
    actionUrl: "/provider/messages",
    actionLabel: "Reply",
  },
  {
    id: "3",
    type: "review",
    title: "New Review Received",
    description: "James Miller left a 5-star review for your property",
    time: "5 hours ago",
    isRead: false,
    actionUrl: "/provider/reviews",
    actionLabel: "View",
  },
  {
    id: "4",
    type: "payment",
    title: "Payment Received",
    description: "You received $540 for booking #BK-101",
    time: "1 day ago",
    isRead: true,
    actionUrl: "/provider/earnings",
    actionLabel: "View",
  },
  {
    id: "5",
    type: "system",
    title: "Profile Verification Complete",
    description: "Your property has been verified and is now live",
    time: "2 days ago",
    isRead: true,
  },
  {
    id: "6",
    type: "alert",
    title: "Booking Cancelled",
    description: "Guest Emma Williams cancelled their booking for Jan 22-25",
    time: "3 days ago",
    isRead: true,
    actionUrl: "/provider/bookings",
    actionLabel: "View Details",
  },
  {
    id: "7",
    type: "booking",
    title: "Booking Confirmed",
    description: "Your booking with David Brown has been confirmed",
    time: "4 days ago",
    isRead: true,
  },
  {
    id: "8",
    type: "review",
    title: "Review Response Required",
    description: "Lisa Park is waiting for your response to their review",
    time: "5 days ago",
    isRead: true,
    actionUrl: "/provider/reviews",
    actionLabel: "Respond",
  },
]

const notificationConfig = {
  booking: {
    icon: Calendar,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-950",
  },
  message: {
    icon: MessageSquare,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-950",
  },
  review: {
    icon: Star,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 dark:bg-yellow-950",
  },
  payment: {
    icon: DollarSign,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100 dark:bg-emerald-950",
  },
  system: {
    icon: CheckCircle2,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  alert: {
    icon: AlertCircle,
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-950",
  },
}

function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: Notification
  onMarkRead: () => void
  onDelete: () => void
}) {
  const config = notificationConfig[notification.type]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "flex gap-4 rounded-lg border p-4 transition-colors",
        !notification.isRead && "bg-primary/5 border-primary/20"
      )}
    >
      <div className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full", config.bgColor)}>
        <Icon className={cn("h-5 w-5", config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className={cn("font-medium", !notification.isRead && "text-primary")}>
              {notification.title}
            </h4>
            <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
              {notification.description}
            </p>
          </div>
          {!notification.isRead && (
            <div className="flex-shrink-0">
              <div className="h-2 w-2 rounded-full bg-primary" />
            </div>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{notification.time}</span>
          <div className="flex gap-2">
            {notification.actionUrl && notification.actionLabel && (
              <a href={notification.actionUrl}>
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  {notification.actionLabel}
                </Button>
              </a>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                  <span className="sr-only">Actions</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!notification.isRead && (
                  <DropdownMenuItem onClick={onMarkRead}>
                    <Check className="mr-2 h-4 w-4" />
                    Mark as read
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProviderNotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [activeTab, setActiveTab] = useState("all")

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : activeTab === "unread"
        ? notifications.filter((n) => !n.isRead)
        : notifications.filter((n) => n.type === activeTab)

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
  }

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const handleClearAll = () => {
    setNotifications([])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated on bookings, messages, and more
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllRead}>
              <Check className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Notifications List */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all" className="gap-2">
                All
                <Badge variant="secondary">{notifications.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="unread" className="gap-2">
                Unread
                {unreadCount > 0 && <Badge variant="destructive">{unreadCount}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="booking">Bookings</TabsTrigger>
              <TabsTrigger value="message">Messages</TabsTrigger>
              <TabsTrigger value="review">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4 space-y-3">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={() => handleMarkRead(notification.id)}
                    onDelete={() => handleDelete(notification.id)}
                  />
                ))
              ) : (
                <div className="py-12 text-center">
                  <Bell className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="font-semibold">No notifications</h3>
                  <p className="text-muted-foreground">
                    {activeTab === "unread"
                      ? "You're all caught up!"
                      : "You don't have any notifications yet"}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Settings Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings className="h-4 w-4" />
                Notification Settings
              </CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-bookings" className="flex-1">
                  <div className="font-medium">Booking Alerts</div>
                  <div className="text-xs text-muted-foreground">
                    New bookings, cancellations
                  </div>
                </Label>
                <Switch id="email-bookings" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="email-messages" className="flex-1">
                  <div className="font-medium">Messages</div>
                  <div className="text-xs text-muted-foreground">
                    New messages from guests
                  </div>
                </Label>
                <Switch id="email-messages" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="email-reviews" className="flex-1">
                  <div className="font-medium">Reviews</div>
                  <div className="text-xs text-muted-foreground">
                    New reviews and responses
                  </div>
                </Label>
                <Switch id="email-reviews" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="email-payments" className="flex-1">
                  <div className="font-medium">Payments</div>
                  <div className="text-xs text-muted-foreground">
                    Payouts and transactions
                  </div>
                </Label>
                <Switch id="email-payments" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="email-marketing" className="flex-1">
                  <div className="font-medium">Marketing</div>
                  <div className="text-xs text-muted-foreground">
                    Tips, features, promotions
                  </div>
                </Label>
                <Switch id="email-marketing" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="h-4 w-4" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-sm">Pending bookings</span>
                <Badge>3</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-sm">Unread messages</span>
                <Badge>2</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-sm">Reviews to respond</span>
                <Badge variant="secondary">1</Badge>
              </div>
            </CardContent>
          </Card>

          {notifications.length > 0 && (
            <Button
              variant="outline"
              className="w-full text-muted-foreground"
              onClick={handleClearAll}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All Notifications
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
