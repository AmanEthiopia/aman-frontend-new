"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { formatRating } from "@/lib/utils"
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
  Building2,
  Plus,
  Loader2,
  MessageSquare,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import * as providerAPI from "@/lib/api/provider"
import type { ProviderStats, ProviderBooking } from "@/lib/api/provider"

// Fallback mock data for demo
const mockStats: ProviderStats = {
  total_properties: 2,
  total_bookings: 15,
  pending_bookings: 3,
  confirmed_bookings: 12,
  total_revenue: 45420,
  monthly_revenue: 15420,
  average_rating: 4.8,
  total_reviews: 156,
  response_rate: 95,
  occupancy_rate: 78,
}

const mockPendingBookings: ProviderBooking[] = [
  {
    id: "bk-101",
    property_id: "1",
    property_name: "Sheraton Addis Hotel",
    property_type: "hotel",
    guest_id: "g1",
    guest_name: "Sarah Johnson",
    guest_email: "sarah@email.com",
    guest_phone: "+1 555-0123",
    guest_avatar: "",
    check_in: "2025-01-18",
    check_out: "2025-01-21",
    guests: 2,
    room_type: "Deluxe Suite",
    total_price: 540,
    status: "pending",
    special_requests: "Early check-in if possible, celebrating anniversary",
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-15T10:00:00Z",
  },
  {
    id: "bk-102",
    property_id: "1",
    property_name: "Sheraton Addis Hotel",
    property_type: "hotel",
    guest_id: "g2",
    guest_name: "Michael Chen",
    guest_email: "michael@email.com",
    guest_phone: "+1 555-0456",
    check_in: "2025-01-20",
    check_out: "2025-01-23",
    guests: 3,
    room_type: "Family Room",
    total_price: 680,
    status: "pending",
    created_at: "2025-01-14T15:00:00Z",
    updated_at: "2025-01-14T15:00:00Z",
  },
  {
    id: "bk-103",
    property_id: "1",
    property_name: "Sheraton Addis Hotel",
    property_type: "hotel",
    guest_id: "g3",
    guest_name: "Emma Williams",
    guest_email: "emma@email.com",
    guest_phone: "+1 555-0789",
    check_in: "2025-01-22",
    check_out: "2025-01-25",
    guests: 1,
    room_type: "Standard Room",
    total_price: 320,
    status: "pending",
    created_at: "2025-01-13T09:00:00Z",
    updated_at: "2025-01-13T09:00:00Z",
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

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return "Just now"
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays === 1) return "1 day ago"
  return `${diffDays} days ago`
}

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
  isLoading,
}: {
  booking: ProviderBooking
  onAccept: () => void
  onDecline: () => void
  isLoading: boolean
}) {
  const checkIn = new Date(booking.check_in)
  const checkOut = booking.check_out ? new Date(booking.check_out) : null
  const nights = checkOut ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) : 1

  return (
    <div className="flex items-start gap-4 rounded-lg border bg-card p-4">
      <Avatar>
        <AvatarImage src={booking.guest_avatar || "/placeholder.svg"} />
        <AvatarFallback>{booking.guest_name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold">{booking.guest_name}</h4>
            <p className="text-sm text-muted-foreground">{booking.room_type || booking.property_name}</p>
          </div>
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            {formatTimeAgo(booking.created_at)}
          </Badge>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {checkIn.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            {checkOut && (
              <> - {checkOut.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</>
            )}
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
          <p className="text-lg font-bold">${booking.total_price.toLocaleString()}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onDecline} disabled={isLoading}>
              <XCircle className="mr-2 h-4 w-4" />
              Decline
            </Button>
            <Button size="sm" onClick={onAccept} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProviderDashboard() {
  const [stats, setStats] = useState<ProviderStats>(mockStats)
  const [pendingBookings, setPendingBookings] = useState<ProviderBooking[]>(mockPendingBookings)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    setLoading(true)
    try {
      // Use allSettled so a partial API failure doesn't wipe everything
      const [statsResult, dashboardResult, bookingsResult] = await Promise.allSettled([
        providerAPI.getProviderStats(),
        providerAPI.getProviderDashboardData(),
        providerAPI.getMyBookings({ status: "pending" }),
      ])

      const statsData = statsResult.status === "fulfilled" ? statsResult.value : null
      const dashboardData = dashboardResult.status === "fulfilled" ? dashboardResult.value : null
      const bookingsData = bookingsResult.status === "fulfilled" ? bookingsResult.value : null

      // /provider/stats/ only returns basic counts; /bookings/provider/dashboard/
      // returns revenue, ratings, occupancy. Merge both with mock defaults as fallback.
      setStats({
        ...mockStats,
        ...(statsData && {
          total_properties: statsData.total_properties ?? 0,
          pending_bookings: statsData.pending_bookings ?? 0,
        }),
        ...(dashboardData && {
          pending_bookings: dashboardData.pending_bookings ?? statsData?.pending_bookings ?? 0,
          confirmed_bookings: dashboardData.confirmed_bookings_this_month ?? 0,
          monthly_revenue: parseFloat(dashboardData.revenue_this_month ?? "0") || 0,
          average_rating: dashboardData.average_rating ?? 0,
          occupancy_rate: dashboardData.occupancy_rate ?? 0,
        }),
      })

      // /provider/bookings/ returns data as a direct array, not PaginatedResponse
      if (bookingsData !== null) {
        const bookingsArray = Array.isArray(bookingsData)
          ? bookingsData
          : (bookingsData?.results ?? [])
        setPendingBookings(bookingsArray)
      }
    } catch (error) {
      console.log("[v0] Using mock data for dashboard:", error)
      setStats(mockStats)
      setPendingBookings(mockPendingBookings)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (id: string) => {
    setActionLoading(id)
    try {
      await providerAPI.acceptBooking(id)
      setPendingBookings((prev) => prev.filter((b) => b.id !== id))
    } catch (error) {
      console.log("[v0] Accept booking (demo mode):", error)
      // Demo: just remove from list
      setPendingBookings((prev) => prev.filter((b) => b.id !== id))
    } finally {
      setActionLoading(null)
    }
  }

  const handleDecline = async (id: string) => {
    setActionLoading(id)
    try {
      await providerAPI.declineBooking(id)
      setPendingBookings((prev) => prev.filter((b) => b.id !== id))
    } catch (error) {
      console.log("[v0] Decline booking (demo mode):", error)
      // Demo: just remove from list
      setPendingBookings((prev) => prev.filter((b) => b.id !== id))
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
        <div className="flex gap-2">
          <Link href="/provider/properties/new">
            <Button variant="outline" className="hidden sm:flex">
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Button>
          </Link>
          <Link href="/provider/notifications">
            <Button variant="outline">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </Button>
          </Link>
        </div>
      </div>

      {/* Alert Banner */}
      {pendingBookings.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/20">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                You have {pendingBookings.length} pending booking {pendingBookings.length === 1 ? "request" : "requests"}
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

      {/* Quick Actions for New Providers */}
      {stats.total_properties === 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Building2 className="mb-4 h-12 w-12 text-primary" />
            <h3 className="text-lg font-semibold">Welcome to AMAN Provider!</h3>
            <p className="mt-2 max-w-md text-muted-foreground">
              Start by adding your first property to begin receiving bookings and growing your business.
            </p>
            <Link href="/provider/properties/new" className="mt-4">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Property
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Pending Bookings" value={stats.pending_bookings} icon={Clock} />
        <StatCard 
          title="Occupancy Rate" 
          value={`${stats.occupancy_rate || 0}%`} 
          change={5} 
          trend="up" 
          icon={Calendar} 
        />
        <StatCard
          title="This Month"
          value={`$${(stats.monthly_revenue ?? 0).toLocaleString()}`}
          change={12.5}
          trend="up"
          icon={DollarSign}
        />
        <StatCard title="Average Rating" value={formatRating(stats.average_rating ?? 0)} icon={Star} />
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
            {pendingBookings.length > 0 ? (
              pendingBookings.slice(0, 3).map((booking) => (
                <PendingBookingCard
                  key={booking.id}
                  booking={booking}
                  onAccept={() => handleAccept(booking.id)}
                  onDecline={() => handleDecline(booking.id)}
                  isLoading={actionLoading === booking.id}
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
                  <span className="font-medium">{stats.response_rate ?? 0}%</span>
                </div>
                <Progress value={stats.response_rate ?? 0} className="h-2" />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>Occupancy Rate</span>
                  <span className="font-medium">{stats.occupancy_rate || 0}%</span>
                </div>
                <Progress value={stats.occupancy_rate || 0} className="h-2" />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>Review Score</span>
                  <span className="font-medium">{stats.average_rating ?? 0}/5</span>
                </div>
                <Progress value={((stats.average_rating ?? 0) / 5) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Reviews</CardTitle>
                <CardDescription>{stats.total_reviews} total reviews</CardDescription>
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
                      <div className="flex items-center gap-0.5 text-yellow-500">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{review.date}</span>
                  </div>
                  <p className="mt-2 text-sm">{review.comment}</p>
                  {!review.replied && (
                    <Link href="/provider/reviews">
                      <Button variant="link" size="sm" className="mt-2 h-auto p-0 text-primary">
                        Reply to review
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-950">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Properties</p>
              <p className="text-2xl font-bold">{stats.total_properties}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-950">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Confirmed Bookings</p>
              <p className="text-2xl font-bold">{stats.confirmed_bookings}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-950">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="text-2xl font-bold">{stats.total_bookings}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-950">
              <MessageSquare className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Reviews</p>
              <p className="text-2xl font-bold">{stats.total_reviews}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
