"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  DollarSign,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Bell,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

// Mock provider stats
const stats = {
  pendingBookings: 3,
  confirmedBookings: 12,
  occupancyRate: 78,
  monthlyEarnings: 15420,
  earningsChange: 12.5,
  averageRating: 4.8,
  totalReviews: 156,
  responseRate: 95,
}

// Mock pending bookings
const pendingBookings = [
  {
    id: "bk-101",
    guestName: "Sarah Johnson",
    guestAvatar: "/diverse-user-avatars.png",
    checkIn: "2025-01-18",
    checkOut: "2025-01-21",
    guests: 2,
    roomType: "Deluxe Suite",
    totalPrice: 540,
    requestedAt: "2 hours ago",
  },
  {
    id: "bk-102",
    guestName: "Michael Chen",
    guestAvatar: null,
    checkIn: "2025-01-20",
    checkOut: "2025-01-23",
    guests: 3,
    roomType: "Family Room",
    totalPrice: 680,
    requestedAt: "5 hours ago",
  },
  {
    id: "bk-103",
    guestName: "Emma Williams",
    guestAvatar: null,
    checkIn: "2025-01-22",
    checkOut: "2025-01-25",
    guests: 1,
    roomType: "Standard Room",
    totalPrice: 320,
    requestedAt: "1 day ago",
  },
]

// Mock recent reviews
const recentReviews = [
  {
    id: "rv-1",
    guestName: "James Miller",
    rating: 5,
    comment: "Exceptional service and beautiful rooms. The staff went above and beyond!",
    date: "2 days ago",
    replied: true,
  },
  {
    id: "rv-2",
    guestName: "Lisa Park",
    rating: 4,
    comment: "Great location and clean rooms. Breakfast could be improved.",
    date: "4 days ago",
    replied: false,
  },
]

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  trend,
}: {
  title: string
  value: string | number
  change?: number
  icon: React.ElementType
  trend?: "up" | "down" | "neutral"
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
            {change !== undefined && (
              <div className="mt-1 flex items-center gap-1 text-sm">
                {trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : trend === "down" ? (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                ) : null}
                <span className={trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : ""}>
                  {change > 0 ? "+" : ""}
                  {change}%
                </span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>
          <div className="rounded-full bg-primary/10 p-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PendingBookingCard({
  booking,
  onAccept,
  onDecline,
}: {
  booking: (typeof pendingBookings)[0]
  onAccept: () => void
  onDecline: () => void
}) {
  const checkIn = new Date(booking.checkIn)
  const checkOut = new Date(booking.checkOut)
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="flex items-start gap-4 rounded-lg border bg-card p-4">
      <Avatar>
        <AvatarImage src={booking.guestAvatar || "/placeholder.svg"} />
        <AvatarFallback>{booking.guestName.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold">{booking.guestName}</h4>
            <p className="text-sm text-muted-foreground">{booking.roomType}</p>
          </div>
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            {booking.requestedAt}
          </Badge>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {checkIn.toLocaleDateString("en-US", { month: "short", day: "numeric" })} -{" "}
            {checkOut.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            {nights} {nights === 1 ? "night" : "nights"}
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-lg font-bold">${booking.totalPrice}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onDecline}>
              <XCircle className="mr-2 h-4 w-4" />
              Decline
            </Button>
            <Button size="sm" onClick={onAccept}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProviderDashboard() {
  const [pending, setPending] = useState(pendingBookings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleAccept = (id: string) => {
    setPending((prev) => prev.filter((b) => b.id !== id))
  }

  const handleDecline = (id: string) => {
    setPending((prev) => prev.filter((b) => b.id !== id))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your property overview.</p>
        </div>
        <Button variant="outline">
          <Bell className="mr-2 h-4 w-4" />
          Notifications
        </Button>
      </div>

      {/* Alert Banner */}
      {pending.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/20">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                You have {pending.length} pending booking {pending.length === 1 ? "request" : "requests"}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Respond within 24 hours to maintain your response rate
              </p>
            </div>
            <Link href="/provider/bookings">
              <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-700 bg-transparent">
                Review Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Pending Bookings" value={stats.pendingBookings} icon={Clock} />
        <StatCard title="Occupancy Rate" value={`${stats.occupancyRate}%`} change={5} trend="up" icon={Calendar} />
        <StatCard
          title="This Month"
          value={`$${stats.monthlyEarnings.toLocaleString()}`}
          change={stats.earningsChange}
          trend="up"
          icon={DollarSign}
        />
        <StatCard title="Average Rating" value={stats.averageRating} icon={Star} />
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pending Requests</CardTitle>
              <CardDescription>Booking requests awaiting your response</CardDescription>
            </div>
            <Link href="/provider/bookings">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {pending.length > 0 ? (
              pending.map((booking) => (
                <PendingBookingCard
                  key={booking.id}
                  booking={booking}
                  onAccept={() => handleAccept(booking.id)}
                  onDecline={() => handleDecline(booking.id)}
                />
              ))
            ) : (
              <div className="py-8 text-center">
                <CheckCircle2 className="mx-auto mb-2 h-12 w-12 text-green-600" />
                <p className="font-medium">All caught up!</p>
                <p className="text-sm text-muted-foreground">No pending booking requests</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance & Reviews */}
        <div className="space-y-6">
          {/* Performance Card */}
          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
              <CardDescription>Your property metrics this month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>Response Rate</span>
                  <span className="font-medium">{stats.responseRate}%</span>
                </div>
                <Progress value={stats.responseRate} className="h-2" />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>Occupancy Rate</span>
                  <span className="font-medium">{stats.occupancyRate}%</span>
                </div>
                <Progress value={stats.occupancyRate} className="h-2" />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>Review Score</span>
                  <span className="font-medium">{stats.averageRating}/5</span>
                </div>
                <Progress value={(stats.averageRating / 5) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Reviews</CardTitle>
                <CardDescription>{stats.totalReviews} total reviews</CardDescription>
              </div>
              <Link href="/provider/reviews">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentReviews.map((review) => (
                <div key={review.id} className="rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{review.guestName}</span>
                      <div className="flex items-center gap-1 text-yellow-500">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{review.date}</span>
                  </div>
                  <p className="mt-2 text-sm">{review.comment}</p>
                  {!review.replied && (
                    <Button variant="link" size="sm" className="mt-2 h-auto p-0 text-primary">
                      Reply to review
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
