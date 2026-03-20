"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Calendar,
  MapPin,
  Clock,
  MoreHorizontal,
  Filter,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Download,
  MessageSquare,
  Phone,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getUserBookings } from "@/lib/api/bookings"
import type { Booking } from "@/lib/types"

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    variant: "secondary" as const,
    color: "text-yellow-600",
  },
  accepted: {
    label: "Accepted",
    icon: CheckCircle2,
    variant: "default" as const,
    color: "text-green-600",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    variant: "destructive" as const,
    color: "text-red-600",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    variant: "destructive" as const,
    color: "text-red-600",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    variant: "outline" as const,
    color: "text-muted-foreground",
  },
}

function BookingCard({ booking }: { booking: Booking }) {
  const status = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.pending
  const StatusIcon = status.icon
  const checkIn = new Date(booking.check_in)
  const checkOut = new Date(booking.check_out)
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  const isPast = checkOut < new Date()

  return (
    <Card className={isPast ? "opacity-75" : ""}>
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative h-32 w-full sm:h-auto sm:w-40">
            <img
              src={booking.hotel_image || "/placeholder.svg?height=160&width=160&query=hotel"}
              alt={booking.hotel_name}
              className="h-full w-full object-cover sm:rounded-l-lg"
            />
            <Badge variant={status.variant} className="absolute left-2 top-2 gap-1 sm:hidden">
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </Badge>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col justify-between p-4">
            <div>
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{booking.hotel_name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {booking.hotel_city}, Ethiopia
                  </div>
                </div>
                <Badge variant={status.variant} className="hidden gap-1 sm:flex">
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </Badge>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {checkIn.toLocaleDateString("en-US", { month: "short", day: "numeric" })} -{" "}
                    {checkOut.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {nights} {nights === 1 ? "night" : "nights"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
                  </span>
                </div>
              </div>

              {booking.special_requests && (
                <div className="mt-3 rounded-md bg-muted/50 p-2 text-sm">
                  <p className="font-medium text-muted-foreground">Special Requests:</p>
                  <p className="mt-1">{booking.special_requests}</p>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <div>
                {booking.total_price ? (
                  <>
                    <span className="text-sm text-muted-foreground">Total</span>
                    <p className="text-lg font-bold">${booking.total_price.toLocaleString()}</p>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">Price to be confirmed</span>
                )}
              </div>
              <div className="flex gap-2">
                {booking.status === "accepted" && !isPast && (
                  <Button variant="outline" size="sm">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact Host
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Phone className="mr-2 h-4 w-4" />
                      Call Property
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {booking.status === "pending" && (
                      <DropdownMenuItem className="text-destructive">
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel Request
                      </DropdownMenuItem>
                    )}
                    {booking.status === "accepted" && !isPast && (
                      <DropdownMenuItem className="text-destructive">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Request Cancellation
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyBookings({ type }: { type: string }) {
  const messages = {
    upcoming: {
      title: "No upcoming bookings",
      description: "When you book a stay, it will appear here. Start exploring Ethiopian destinations!",
    },
    pending: {
      title: "No pending requests",
      description: "Booking requests awaiting confirmation from hosts will appear here.",
    },
    past: {
      title: "No past stays yet",
      description: "Your travel history will be saved here after your first trip.",
    },
  }

  const msg = messages[type as keyof typeof messages] || messages.upcoming

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16 text-center">
      <Calendar className="mb-4 h-12 w-12 text-muted-foreground/50" />
      <h3 className="mb-2 text-lg font-semibold">{msg.title}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">{msg.description}</p>
      <Link href="/hotels">
        <Button>Explore Hotels</Button>
      </Link>
    </div>
  )
}

export default function BookingsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])

  useEffect(() => {
    async function loadBookings() {
      try {
        setLoading(true)
        const data = await getUserBookings()
        setBookings(data)
      } catch (err: any) {
        console.error("Failed to load bookings:", err)
        setError(err.message || "Failed to load bookings")
      } finally {
        setLoading(false)
      }
    }
    loadBookings()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h3 className="mb-2 text-lg font-semibold">Failed to Load Bookings</h3>
        <p className="mb-6 text-sm text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  const now = new Date()
  const upcomingBookings = bookings.filter(
    (b) => (b.status === "accepted" || b.status === "pending") && new Date(b.check_in) > now,
  )
  const pendingBookings = bookings.filter((b) => b.status === "pending")
  const pastBookings = bookings.filter(
    (b) =>
      b.status === "completed" || b.status === "cancelled" || (b.status === "accepted" && new Date(b.check_out) < now),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Bookings</h1>
          <p className="text-muted-foreground">Manage your reservations and travel history</p>
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming" className="gap-2">
            Upcoming
            {upcomingBookings.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {upcomingBookings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            Pending
            {pendingBookings.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingBookings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingBookings.length > 0 ? (
            upcomingBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
          ) : (
            <EmptyBookings type="upcoming" />
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingBookings.length > 0 ? (
            pendingBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
          ) : (
            <EmptyBookings type="pending" />
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastBookings.length > 0 ? (
            pastBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
          ) : (
            <EmptyBookings type="past" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
