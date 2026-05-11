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
  Building2,
  Plus,
  Loader2,
  MessageSquare,
  RefreshCcw,
  Sparkles,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import {
  getProviderDashboard,
  confirmDashboardBooking,
  rejectDashboardBooking,
  type ProviderDashboardData,
  type DashboardPendingRequest,
  type DashboardReview,
} from "@/lib/api/provider-dashboard"

// ============================================================================
// Stat Card
// ============================================================================

function StatCard({
  title,
  value,
  changePct,
  icon: Icon,
  loading = false,
}: {
  title: string
  value: string | number
  changePct?: number | null
  icon: React.ElementType
  loading?: boolean
}) {
  const hasChange = changePct !== null && changePct !== undefined
  const isPositive = hasChange && changePct! >= 0

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            {loading ? (
              <div className="mt-1 h-8 w-24 animate-pulse rounded bg-muted" />
            ) : (
              <p className="mt-1 text-2xl font-bold">{value}</p>
            )}
            {hasChange && !loading && (
              <div className="mt-1 flex items-center gap-1 text-sm">
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className={isPositive ? "text-green-600" : "text-red-600"}>
                  {isPositive ? "+" : ""}{changePct}%
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

// ============================================================================
// Pending Request Card
// ============================================================================

function PendingRequestCard({
  req,
  onAccept,
  onDecline,
  isLoading,
}: {
  req: DashboardPendingRequest
  onAccept: () => void
  onDecline: () => void
  isLoading: boolean
}) {
  const checkIn = new Date(req.check_in)
  const checkOut = req.check_out ? new Date(req.check_out) : null

  return (
    <div className="flex items-start gap-4 rounded-lg border bg-card p-4">
      <Avatar>
        <AvatarFallback>{req.guest_name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold truncate">{req.guest_name}</span>
              {req.is_new && (
                <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">New</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">{req.property_name}</p>
          </div>
          <Badge variant="secondary" className="shrink-0 font-mono text-xs">{req.booking_number}</Badge>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {checkIn.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            {checkOut && <> — {checkOut.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</>}
          </span>
          {req.num_nights && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {req.num_nights} {req.num_nights === 1 ? "night" : "nights"}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {req.guests} {req.guests === 1 ? "guest" : "guests"}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="font-bold">{req.currency} {req.total_price.toLocaleString()}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onDecline} disabled={isLoading}>
              <XCircle className="mr-1.5 h-3.5 w-3.5" />
              Decline
            </Button>
            <Button size="sm" onClick={onAccept} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              )}
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Review Card
// ============================================================================

function ReviewCard({ review }: { review: DashboardReview }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium">{review.reviewer_name}</span>
          <div className="flex items-center gap-0.5 text-yellow-500">
            {Array.from({ length: review.rating }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-current" />
            ))}
          </div>
          {review.property_name && (
            <span className="text-xs text-muted-foreground">· {review.property_name}</span>
          )}
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">{review.time_ago}</span>
      </div>
      {review.title && <p className="mt-1 text-sm font-medium">{review.title}</p>}
      <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{review.comment}</p>
      {!review.has_response && (
        <Link href={`/provider/reviews`}>
          <Button variant="link" size="sm" className="mt-2 h-auto p-0 text-primary">
            Reply to review →
          </Button>
        </Link>
      )}
    </div>
  )
}

// ============================================================================
// Page
// ============================================================================

export default function ProviderDashboard() {
  const [data, setData] = useState<ProviderDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [pendingRequests, setPendingRequests] = useState<DashboardPendingRequest[]>([])

  const load = async (refresh = false) => {
    if (refresh) setRefreshing(true)
    else setLoading(true)
    try {
      const result = await getProviderDashboard()
      setData(result)
      setPendingRequests(result.pending_requests ?? [])
      if (refresh) toast.success("Dashboard refreshed")
    } catch (err) {
      console.error("[v0] Dashboard load error:", err)
      if (refresh) toast.error("Failed to refresh dashboard")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleAccept = async (req: DashboardPendingRequest) => {
    setActionLoading(req.id)
    try {
      await confirmDashboardBooking(req.id, req.booking_type)
      setPendingRequests((prev) => prev.filter((r) => r.id !== req.id))
      toast.success(`Booking ${req.booking_number} confirmed`)
    } catch {
      toast.error("Failed to confirm booking. Please try again.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDecline = async (req: DashboardPendingRequest) => {
    setActionLoading(req.id)
    try {
      await rejectDashboardBooking(req.id, req.booking_type)
      setPendingRequests((prev) => prev.filter((r) => r.id !== req.id))
      toast.success(`Booking ${req.booking_number} declined`)
    } catch {
      toast.error("Failed to decline booking. Please try again.")
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

  const stats = data?.stats
  const performance = data?.performance
  const totals = data?.totals
  const recentReviews = data?.recent_reviews ?? []

  const currency = stats?.this_month_revenue?.currency ?? "USD"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your property overview.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => load(true)} disabled={refreshing}>
            <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
          <Link href="/provider/properties/new">
            <Button variant="outline" className="hidden sm:flex">
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Button>
          </Link>
        </div>
      </div>

      {/* Alert Banner */}
      {data?.alert?.pending_count ? (
        <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/20">
          <CardContent className="flex items-start sm:items-center gap-4 py-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-yellow-600" />
            <p className="flex-1 text-sm font-medium text-yellow-800 dark:text-yellow-200">
              {data.alert.message}
            </p>
            <Link href="/provider/bookings?status=pending">
              <Button size="sm" variant="outline" className="shrink-0 border-yellow-300 bg-transparent text-yellow-700">
                Review Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {/* No properties onboarding */}
      {totals?.total_properties === 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Building2 className="mb-4 h-12 w-12 text-primary" />
            <h3 className="text-lg font-semibold">Welcome to AMAN Provider!</h3>
            <p className="mt-2 max-w-md text-muted-foreground">
              Start by adding your first property to begin receiving bookings.
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
        <StatCard
          title="Pending Bookings"
          value={stats?.pending_bookings?.value ?? 0}
          changePct={stats?.pending_bookings?.vs_last_month_pct}
          icon={Clock}
        />
        <StatCard
          title="Occupancy Rate"
          value={`${stats?.occupancy_rate?.value ?? 0}%`}
          changePct={stats?.occupancy_rate?.vs_last_month_pct}
          icon={Calendar}
        />
        <StatCard
          title="This Month's Revenue"
          value={`${currency} ${(stats?.this_month_revenue?.value ?? 0).toLocaleString()}`}
          changePct={stats?.this_month_revenue?.vs_last_month_pct}
          icon={DollarSign}
        />
        <StatCard
          title="Average Rating"
          value={`${(stats?.average_rating?.value ?? 0).toFixed(1)} / 5`}
          changePct={stats?.average_rating?.vs_last_month_pct}
          icon={Star}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Pending Requests</CardTitle>
              <CardDescription>Booking requests awaiting your response</CardDescription>
            </div>
            <Link href="/provider/bookings">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingRequests.length > 0 ? (
              pendingRequests.slice(0, 3).map((req) => (
                <PendingRequestCard
                  key={req.id}
                  req={req}
                  onAccept={() => handleAccept(req)}
                  onDecline={() => handleDecline(req)}
                  isLoading={actionLoading === req.id}
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Performance</CardTitle>
              <CardDescription>Your property metrics this month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span>Response Rate</span>
                  <span className="font-medium">{performance?.response_rate ?? 0}%</span>
                </div>
                <Progress value={performance?.response_rate ?? 0} className="h-2" />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span>Occupancy Rate</span>
                  <span className="font-medium">{performance?.occupancy_rate ?? 0}%</span>
                </div>
                <Progress value={performance?.occupancy_rate ?? 0} className="h-2" />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span>Review Score</span>
                  <span className="font-medium">{(performance?.review_score ?? 0).toFixed(1)} / 5</span>
                </div>
                <Progress value={((performance?.review_score ?? 0) / 5) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Recent Reviews</CardTitle>
                <CardDescription>{totals?.total_reviews ?? 0} total reviews</CardDescription>
              </div>
              <Link href="/provider/reviews">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentReviews.length > 0 ? (
                recentReviews.map((r) => <ReviewCard key={r.id} review={r} />)
              ) : (
                <div className="py-6 text-center">
                  <Sparkles className="mx-auto mb-2 h-10 w-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No reviews yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Totals Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-950">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Properties</p>
              <p className="text-2xl font-bold">{totals?.total_properties ?? 0}</p>
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
              <p className="text-2xl font-bold">{totals?.confirmed_bookings ?? 0}</p>
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
              <p className="text-2xl font-bold">{totals?.total_bookings ?? 0}</p>
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
              <p className="text-2xl font-bold">{totals?.total_reviews ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
