"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  MapPin,
  Calendar,
  ArrowRight,
  Sparkles,
  Clock,
  Building2,
  UtensilsCrossed,
  Car,
  Compass,
  Phone,
  Shield,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getAllMyBookings, flattenBookings } from "@/lib/api/bookings"
import { getHotels } from "@/lib/api/hotels"
import { FEATURES } from "@/lib/config/features"
import { useAuth } from "@/contexts/auth-context"
import type { Booking, Hotel } from "@/lib/types"

const API_BASE = "https://api.aman.yichalal.ai"

function getMediaUrl(path: string | null | undefined): string {
  if (!path) return ""
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  if (path.startsWith("/media/")) return `${API_BASE}${path}`
  if (!path.startsWith("/")) return `${API_BASE}/media/${path}`
  return `${API_BASE}${path}`
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action: { label: string; href: string }
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 px-6 py-12 text-center">
      <div className="mb-4 rounded-full bg-primary/10 p-4">
        <Compass className="h-8 w-8 text-primary" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>
      <Link href={action.href}>
        <Button>
          {action.label}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>
  )
}

function UpcomingTripCard({ booking, hotel }: { booking: Booking; hotel: Hotel }) {
  const checkIn = new Date(booking.check_in)
  const daysUntil = Math.ceil((checkIn.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <Card className="overflow-hidden">
      <div className="relative h-32 bg-gradient-to-br from-primary/20 to-primary/5">
        <img
          src={
            getMediaUrl(hotel?.images?.[0]?.url) ||
            "/placeholder.svg?height=128&width=400&query=ethiopian hotel" ||
            "/placeholder.svg" ||
            "/placeholder.svg" ||
            "/placeholder.svg"
          }
          alt={booking.hotel_name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="font-semibold text-foreground">{booking.hotel_name}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {hotel?.city?.name || "Ethiopia"}
          </div>
        </div>
      </div>
      <CardContent className="pt-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{checkIn.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          </div>
          <Badge variant={daysUntil <= 3 ? "default" : "secondary"}>
            {daysUntil === 0 ? "Today!" : daysUntil === 1 ? "Tomorrow" : `${daysUntil} days`}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Trip preparation</span>
            <span className="font-medium">60%</span>
          </div>
          <Progress value={60} className="h-2" />
        </div>
        <div className="mt-4 flex gap-2">
          <Link href="/bookings" className="flex-1">
            <Button variant="outline" size="sm" className="w-full bg-transparent">
              View Details
            </Button>
          </Link>
          <Link href="/itinerary" className="flex-1">
            <Button size="sm" className="w-full">
              Plan Trip
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function HomePage() {
  const { userProfile, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([])
  const [recentHotels, setRecentHotels] = useState<Hotel[]>([])

  useEffect(() => {
    console.log("[v0] HomePage: Component mounted")
    console.log("[v0] HomePage: Auth state:", { isAuthenticated, userProfile })

    if (isAuthenticated && userProfile) {
      console.log("[v0] HomePage: User authenticated, loading data")
      loadData()
    } else {
      console.log("[v0] HomePage: Not authenticated, skipping data load")
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty array - only run once on mount

  async function loadData() {
    console.log("[v0] HomePage: loadData called")
    setError(null)

    try {
      setLoading(true)

      console.log("[v0] HomePage: Fetching bookings...")
      try {
        const allBookings = await getAllMyBookings()
        const bookings = flattenBookings(allBookings)
        console.log("[v0] HomePage: Bookings received:", bookings.length)

        const upcoming = bookings.filter((b: any) => {
          const isConfirmed = b.status === "confirmed"
          // Handle different booking types - hotels have check_in_date, restaurants have reservation_date
          const dateField = b.check_in_date || b.reservation_date || b.start_date || b.pickup_datetime
          const isFuture = dateField ? new Date(dateField) > new Date() : false
          return isConfirmed && isFuture
        })
        console.log("[v0] HomePage: Upcoming bookings:", upcoming.length)
        setUpcomingBookings(upcoming as any)
      } catch (err: any) {
        console.error("[v0] HomePage: Failed to load bookings:", err)
        setUpcomingBookings([])
      }

      console.log("[v0] HomePage: Fetching hotels...")
      try {
        const hotelsResponse = await getHotels({ limit: 3 })
        console.log("[v0] HomePage: Hotels received:", hotelsResponse.results?.length || 0)
        setRecentHotels(hotelsResponse.results || [])
      } catch (err: any) {
        console.error("[v0] HomePage: Failed to load hotels:", err)
        setRecentHotels([])
      }

      console.log("[v0] HomePage: Data loaded successfully")
    } catch (err: any) {
      console.error("[v0] HomePage: Error loading data:", err)
      setError(err.message || "Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    { icon: Building2, label: "Hotels", href: "/hotels", color: "bg-blue-500/10 text-blue-600" },
    { icon: UtensilsCrossed, label: "Restaurants", href: "/restaurants", color: "bg-orange-500/10 text-orange-600" },
    { icon: Car, label: "Transport", href: "/transport", color: "bg-green-500/10 text-green-600" },
    { icon: Compass, label: "Experiences", href: "/experiences", color: "bg-purple-500/10 text-purple-600" },
  ]

  if (!isAuthenticated) {
    console.log("[v0] HomePage: Not authenticated, redirecting...")
    return null // ProtectedRoute will handle redirect
  }

  if (!userProfile) {
    console.log("[v0] HomePage: No user profile, showing loader")
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  console.log("[v0] HomePage: Rendering with user:", userProfile.user.first_name)

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={loadData} variant="outline">
          <ArrowRight className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section>
        <div className="mb-2 flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </span>
        </div>
        <h1 className="text-2xl font-bold md:text-3xl">Welcome back, {userProfile.user.first_name || "Traveler"}</h1>
        <p className="mt-1 text-muted-foreground">Your Ethiopian adventure awaits</p>
      </section>

      {/* AI Assistant Prompt */}
      {FEATURES.AI_CONCIERGE && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Need help planning?</h3>
              <p className="text-sm text-muted-foreground">Ask Aman AI to craft your perfect Ethiopian itinerary</p>
            </div>
            <Link href="/planner">
              <Button>
                Start Planning
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Discover Ethiopia</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.href} href={action.href}>
                <Card className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-md">
                  <CardContent className="flex flex-col items-center gap-3 py-6">
                    <div className={`rounded-full p-3 ${action.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="font-medium">{action.label}</span>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Upcoming Trips */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Upcoming Trips</h2>
          <Link href="/bookings">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-32 bg-muted" />
                <CardContent className="space-y-3 py-4">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : upcomingBookings.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingBookings.slice(0, 2).map((booking) => (
              <UpcomingTripCard key={booking.id} booking={booking} hotel={booking as any} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No upcoming trips yet"
            description="Let Aman help you plan your perfect Ethiopian adventure. Discover verified hotels, authentic restaurants, and unique experiences."
            action={{ label: "Explore Destinations", href: "/cities" }}
          />
        )}
      </section>

      {/* Safety & Trust Card */}
      <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
        <CardContent className="flex items-start gap-4 py-4">
          <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
            <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-green-800 dark:text-green-200">Travel with confidence</h3>
            <p className="mt-1 text-sm text-green-700 dark:text-green-300">
              All AMAN listings are verified. 24/7 support available for emergencies.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-green-300 bg-transparent text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900"
          >
            <Phone className="mr-2 h-4 w-4" />
            Emergency
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Recently Viewed</h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : recentHotels.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentHotels.map((hotel) => (
              <Link key={hotel.id} href={`/hotels/${hotel.id}`}>
                <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-md">
                  <div className="relative h-24">
                    <img
                      src={
                        getMediaUrl(hotel.images?.[0]?.url) ||
                        "/placeholder.svg?height=96&width=300&query=ethiopian hotel" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg"
                      }
                      alt={hotel.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        console.error("[v0] HomePage: Image load error for hotel:", hotel.name)
                        e.currentTarget.src = "/grand-hotel-exterior.png"
                      }}
                    />
                  </div>
                  <CardContent className="py-3">
                    <h4 className="truncate font-medium">{hotel.name}</h4>
                    <p className="text-sm text-muted-foreground">{hotel.city?.name || "Ethiopia"}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <Compass className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Start exploring to see your recent views here</p>
              <Link href="/hotels">
                <Button variant="link" className="mt-2">
                  Browse Hotels
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
