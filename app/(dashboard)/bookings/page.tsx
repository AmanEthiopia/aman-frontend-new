"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
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
  MessageSquare,
  Phone,
  Utensils,
  Car,
  Compass,
  Package,
  Users,
  CreditCard,
  Ban,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useAllBookings, useCancelHotelBooking, useCancelRestaurantReservation, useCancelPackageBooking } from "@/lib/hooks/use-bookings"
import type { Booking, BookingStatus, HotelBooking, RestaurantReservation, PackageBooking, TransportBooking } from "@/lib/api/bookings"
import { toast } from "sonner"

const statusConfig: Record<BookingStatus, { label: string; icon: typeof Clock; variant: "default" | "secondary" | "destructive" | "outline"; color: string }> = {
  pending: {
    label: "Pending",
    icon: Clock,
    variant: "secondary",
    color: "text-yellow-600",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    variant: "default",
    color: "text-green-600",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    variant: "destructive",
    color: "text-red-600",
  },
  cancelled: {
    label: "Cancelled",
    icon: Ban,
    variant: "destructive",
    color: "text-red-600",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    variant: "outline",
    color: "text-muted-foreground",
  },
  no_show: {
    label: "No Show",
    icon: AlertCircle,
    variant: "destructive",
    color: "text-red-600",
  },
}

const bookingTypeConfig = {
  hotel: { icon: Building2, label: "Hotel", color: "bg-blue-500" },
  restaurant: { icon: Utensils, label: "Restaurant", color: "bg-orange-500" },
  package: { icon: Package, label: "Package", color: "bg-green-500" },
  transport: { icon: Car, label: "Transport", color: "bg-purple-500" },
  experience: { icon: Compass, label: "Experience", color: "bg-pink-500" },
}

function getBookingDate(booking: Booking): Date {
  switch (booking.type) {
    case "hotel":
      return new Date(booking.check_in_date)
    case "restaurant":
      return new Date(booking.reservation_date)
    case "package":
      return new Date(booking.start_date)
    case "transport":
      return new Date(booking.pickup_date)
    case "experience":
      return new Date(booking.date)
    default:
      return new Date()
  }
}

function getBookingEndDate(booking: Booking): Date {
  switch (booking.type) {
    case "hotel":
      return new Date(booking.check_out_date)
    case "restaurant":
      return new Date(booking.reservation_date)
    case "package": {
      const start = new Date(booking.start_date)
      start.setDate(start.getDate() + booking.package.duration_days)
      return start
    }
    case "transport":
      return new Date(booking.pickup_date)
    case "experience":
      return new Date(booking.date)
    default:
      return new Date()
  }
}

function HotelBookingCard({ booking, onCancel }: { booking: HotelBooking; onCancel: () => void }) {
  const status = statusConfig[booking.status]
  const StatusIcon = status.icon
  const checkIn = new Date(booking.check_in_date)
  const checkOut = new Date(booking.check_out_date)
  const isPast = checkOut < new Date()

  return (
    <Card className={isPast ? "opacity-75" : ""}>
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="relative h-32 w-full sm:h-auto sm:w-40">
            <Image
              src={booking.hotel.cover_photo_url || "/placeholder.svg?height=160&width=160"}
              alt={booking.hotel.name}
              fill
              className="object-cover sm:rounded-l-lg"
            />
            <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-blue-500 px-2 py-0.5 text-xs font-medium text-white">
              <Building2 className="h-3 w-3" />
              Hotel
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-between p-4">
            <div>
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{booking.hotel.name}</h3>
                  {booking.hotel.nickname && (
                    <span className="text-sm text-muted-foreground">{booking.hotel.nickname}</span>
                  )}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {booking.hotel.address}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={status.variant} className="gap-1">
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </Badge>
                  {booking.payment_required && (
                    <Badge variant={booking.payment_status === "paid" ? "default" : "secondary"} className="gap-1">
                      <CreditCard className="h-3 w-3" />
                      {booking.payment_status === "paid" ? "Paid" : "Payment Required"}
                    </Badge>
                  )}
                </div>
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
                  <span>{booking.total_nights} {booking.total_nights === 1 ? "night" : "nights"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.num_adults} adults{booking.num_children > 0 && `, ${booking.num_children} children`}</span>
                </div>
              </div>

              {booking.rooms.length > 0 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  {booking.rooms.map((room, idx) => (
                    <span key={room.id}>
                      {idx > 0 && ", "}
                      {room.quantity}x {room.room_name}
                    </span>
                  ))}
                </div>
              )}

              {booking.special_requests && (
                <div className="mt-3 rounded-md bg-muted/50 p-2 text-sm">
                  <p className="font-medium text-muted-foreground">Special Requests:</p>
                  <p className="mt-1">{booking.special_requests}</p>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <div>
                <span className="text-sm text-muted-foreground">Total</span>
                <p className="text-lg font-bold">{booking.currency} {parseFloat(booking.total_price).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                {booking.status === "confirmed" && !isPast && (
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
                      <Building2 className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Phone className="mr-2 h-4 w-4" />
                      Call Property
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {(booking.status === "pending" || booking.status === "confirmed") && !isPast && (
                      <DropdownMenuItem className="text-destructive" onClick={onCancel}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel Booking
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

function RestaurantReservationCard({ booking, onCancel }: { booking: RestaurantReservation; onCancel: () => void }) {
  const status = statusConfig[booking.status]
  const StatusIcon = status.icon
  const reservationDate = new Date(booking.reservation_date)
  const isPast = reservationDate < new Date()

  return (
    <Card className={isPast ? "opacity-75" : ""}>
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="relative h-32 w-full sm:h-auto sm:w-40">
            <Image
              src={booking.restaurant.cover_photo_url || "/placeholder.svg?height=160&width=160"}
              alt={booking.restaurant.name}
              fill
              className="object-cover sm:rounded-l-lg"
            />
            <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-xs font-medium text-white">
              <Utensils className="h-3 w-3" />
              Restaurant
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-between p-4">
            <div>
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{booking.restaurant.name}</h3>
                  {booking.restaurant.nickname && (
                    <span className="text-sm text-muted-foreground">{booking.restaurant.nickname}</span>
                  )}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {booking.restaurant.address}
                  </div>
                </div>
                <Badge variant={status.variant} className="gap-1">
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </Badge>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{reservationDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.reservation_time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.party_size} {booking.party_size === 1 ? "guest" : "guests"}</span>
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
                {parseFloat(booking.total_price) > 0 ? (
                  <>
                    <span className="text-sm text-muted-foreground">Deposit</span>
                    <p className="text-lg font-bold">{booking.currency} {parseFloat(booking.total_price).toLocaleString()}</p>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">No deposit required</span>
                )}
              </div>
              <div className="flex gap-2">
                {booking.status === "confirmed" && !isPast && (
                  <Button variant="outline" size="sm">
                    <Phone className="mr-2 h-4 w-4" />
                    Call Restaurant
                  </Button>
                )}
                {(booking.status === "pending" || booking.status === "confirmed") && !isPast && (
                  <Button variant="ghost" size="sm" onClick={onCancel}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PackageBookingCard({ booking, onCancel }: { booking: PackageBooking; onCancel: () => void }) {
  const status = statusConfig[booking.status]
  const StatusIcon = status.icon
  const startDate = new Date(booking.start_date)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + booking.package.duration_days - 1)
  const isPast = endDate < new Date()

  return (
    <Card className={isPast ? "opacity-75" : ""}>
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="relative h-32 w-full sm:h-auto sm:w-40">
            <Image
              src={booking.package.cover_photo_url || "/placeholder.svg?height=160&width=160"}
              alt={booking.package.title}
              fill
              className="object-cover sm:rounded-l-lg"
            />
            <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-green-500 px-2 py-0.5 text-xs font-medium text-white">
              <Package className="h-3 w-3" />
              Package
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-between p-4">
            <div>
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{booking.package.title}</h3>
                  {booking.package.nickname && (
                    <span className="text-sm text-muted-foreground">{booking.package.nickname}</span>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={status.variant} className="gap-1">
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </Badge>
                  {booking.payment_required && (
                    <Badge variant={booking.payment_status === "paid" ? "default" : "secondary"} className="gap-1">
                      <CreditCard className="h-3 w-3" />
                      {booking.payment_status === "paid" ? "Paid" : "Payment Required"}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} -{" "}
                    {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.package.duration_days} days</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.num_adults} adults{booking.num_children > 0 && `, ${booking.num_children} children`}</span>
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
                <span className="text-sm text-muted-foreground">Total</span>
                <p className="text-lg font-bold">{booking.currency} {parseFloat(booking.total_price).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/experiences/${booking.package.slug}`}>
                  <Button variant="outline" size="sm">
                    View Itinerary
                  </Button>
                </Link>
                {(booking.status === "pending" || booking.status === "confirmed") && !isPast && (
                  <Button variant="ghost" size="sm" onClick={onCancel}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TransportBookingCard({ booking }: { booking: TransportBooking }) {
  const status = statusConfig[booking.status]
  const StatusIcon = status.icon
  const pickupDate = new Date(booking.pickup_date)
  const isPast = pickupDate < new Date()

  return (
    <Card className={isPast ? "opacity-75" : ""}>
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="relative h-32 w-full sm:h-auto sm:w-40">
            <Image
              src={booking.driver.photo_url || "/placeholder.svg?height=160&width=160"}
              alt={booking.driver.name}
              fill
              className="object-cover sm:rounded-l-lg"
            />
            <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-purple-500 px-2 py-0.5 text-xs font-medium text-white">
              <Car className="h-3 w-3" />
              Transport
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-between p-4">
            <div>
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{booking.driver.name}</h3>
                  <span className="text-sm text-muted-foreground">{booking.driver.vehicle_type} - {booking.driver.vehicle_model}</span>
                </div>
                <Badge variant={status.variant} className="gap-1">
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </Badge>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{pickupDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.pickup_time}</span>
                </div>
              </div>

              <div className="mt-2 rounded-md bg-muted/50 p-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span>{booking.pickup_location}</span>
                </div>
                <div className="my-1 ml-2 border-l-2 border-dashed border-muted-foreground/30 pl-2 py-1">
                  <span className="text-xs text-muted-foreground">{booking.service_type.replace("_", " ")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <span>{booking.dropoff_location}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <div>
                <span className="text-sm text-muted-foreground">Total</span>
                <p className="text-lg font-bold">{booking.currency} {parseFloat(booking.total_price).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                {booking.status === "confirmed" && !isPast && (
                  <Button variant="outline" size="sm">
                    <Phone className="mr-2 h-4 w-4" />
                    Call Driver
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BookingCard({ booking, onCancel }: { booking: Booking; onCancel: () => void }) {
  switch (booking.type) {
    case "hotel":
      return <HotelBookingCard booking={booking} onCancel={onCancel} />
    case "restaurant":
      return <RestaurantReservationCard booking={booking} onCancel={onCancel} />
    case "package":
      return <PackageBookingCard booking={booking} onCancel={onCancel} />
    case "transport":
      return <TransportBookingCard booking={booking} />
    default:
      return null
  }
}

function EmptyBookings({ type }: { type: string }) {
  const messages: Record<string, { title: string; description: string; cta: string; href: string }> = {
    upcoming: {
      title: "No upcoming bookings",
      description: "When you book a stay, restaurant, or experience, it will appear here.",
      cta: "Explore Hotels",
      href: "/hotels",
    },
    pending: {
      title: "No pending requests",
      description: "Booking requests awaiting confirmation will appear here.",
      cta: "Browse Experiences",
      href: "/experiences",
    },
    past: {
      title: "No past bookings yet",
      description: "Your travel history will be saved here after your first trip.",
      cta: "Start Exploring",
      href: "/",
    },
    all: {
      title: "No bookings found",
      description: "You haven't made any bookings yet. Start exploring Ethiopia!",
      cta: "Explore Now",
      href: "/",
    },
  }

  const msg = messages[type] || messages.all

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16 text-center">
      <Calendar className="mb-4 h-12 w-12 text-muted-foreground/50" />
      <h3 className="mb-2 text-lg font-semibold">{msg.title}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">{msg.description}</p>
      <Link href={msg.href}>
        <Button>{msg.cta}</Button>
      </Link>
    </div>
  )
}

export default function BookingsPage() {
  const { bookings, isLoading, error, mutate } = useAllBookings()
  const { cancelBooking: cancelHotel, isCancelling: isCancellingHotel } = useCancelHotelBooking()
  const { cancelReservation: cancelRestaurant, isCancelling: isCancellingRestaurant } = useCancelRestaurantReservation()
  const { cancelBooking: cancelPackage, isCancelling: isCancellingPackage } = useCancelPackageBooking()
  
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; booking: Booking | null }>({ open: false, booking: null })
  const [cancelReason, setCancelReason] = useState("")
  const [activeFilter, setActiveFilter] = useState<"all" | "hotel" | "restaurant" | "package" | "transport">("all")

  const isCancelling = isCancellingHotel || isCancellingRestaurant || isCancellingPackage

  const handleCancelBooking = async () => {
    if (!cancelDialog.booking) return

    try {
      const booking = cancelDialog.booking
      
      switch (booking.type) {
        case "hotel":
          await cancelHotel({ id: booking.id, reason: cancelReason })
          break
        case "restaurant":
          await cancelRestaurant({ id: booking.id, reason: cancelReason })
          break
        case "package":
          await cancelPackage({ id: booking.id, reason: cancelReason })
          break
      }
      
      toast.success("Booking cancelled successfully")
      setCancelDialog({ open: false, booking: null })
      setCancelReason("")
      mutate()
    } catch (err) {
      console.error("[v0] Failed to cancel booking:", err)
      toast.error("Failed to cancel booking. Please try again.")
    }
  }

  if (isLoading) {
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
        <p className="mb-6 text-sm text-muted-foreground">Something went wrong. Please try again.</p>
        <Button onClick={() => mutate()}>Try Again</Button>
      </div>
    )
  }

  const now = new Date()
  
  // Filter bookings by type if needed
  const filteredBookings = activeFilter === "all" 
    ? bookings 
    : bookings.filter((b: Booking) => b.type === activeFilter)

  const upcomingBookings = filteredBookings.filter((b: Booking) => {
    const endDate = getBookingEndDate(b)
    return (b.status === "confirmed" || b.status === "pending") && endDate >= now
  })
  
  const pendingBookings = filteredBookings.filter((b: Booking) => b.status === "pending")
  
  const pastBookings = filteredBookings.filter((b: Booking) => {
    const endDate = getBookingEndDate(b)
    return b.status === "completed" || b.status === "cancelled" || b.status === "rejected" || 
           (b.status === "confirmed" && endDate < now)
  })

  // Count by type for filter badges
  const typeCounts = {
    all: bookings.length,
    hotel: bookings.filter((b: Booking) => b.type === "hotel").length,
    restaurant: bookings.filter((b: Booking) => b.type === "restaurant").length,
    package: bookings.filter((b: Booking) => b.type === "package").length,
    transport: bookings.filter((b: Booking) => b.type === "transport").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Bookings</h1>
          <p className="text-muted-foreground">Manage your reservations and travel history</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              {activeFilter === "all" ? "All Types" : bookingTypeConfig[activeFilter].label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setActiveFilter("all")}>
              All Types ({typeCounts.all})
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setActiveFilter("hotel")}>
              <Building2 className="mr-2 h-4 w-4" />
              Hotels ({typeCounts.hotel})
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveFilter("restaurant")}>
              <Utensils className="mr-2 h-4 w-4" />
              Restaurants ({typeCounts.restaurant})
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveFilter("package")}>
              <Package className="mr-2 h-4 w-4" />
              Packages ({typeCounts.package})
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveFilter("transport")}>
              <Car className="mr-2 h-4 w-4" />
              Transport ({typeCounts.transport})
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
            upcomingBookings.map((booking: Booking) => (
              <BookingCard 
                key={booking.id} 
                booking={booking} 
                onCancel={() => setCancelDialog({ open: true, booking })}
              />
            ))
          ) : (
            <EmptyBookings type="upcoming" />
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingBookings.length > 0 ? (
            pendingBookings.map((booking: Booking) => (
              <BookingCard 
                key={booking.id} 
                booking={booking} 
                onCancel={() => setCancelDialog({ open: true, booking })}
              />
            ))
          ) : (
            <EmptyBookings type="pending" />
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastBookings.length > 0 ? (
            pastBookings.map((booking: Booking) => (
              <BookingCard 
                key={booking.id} 
                booking={booking} 
                onCancel={() => {}}
              />
            ))
          ) : (
            <EmptyBookings type="past" />
          )}
        </TabsContent>
      </Tabs>

      {/* Cancel Booking Dialog */}
      <Dialog open={cancelDialog.open} onOpenChange={(open) => !open && setCancelDialog({ open: false, booking: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Reason for cancellation (optional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog({ open: false, booking: null })}>
              Keep Booking
            </Button>
            <Button variant="destructive" onClick={handleCancelBooking} disabled={isCancelling}>
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Booking"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
