"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  BedDouble,
  Star,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Ban,
  CreditCard,
  ExternalLink,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { getHotelBookingById, cancelHotelBooking, type HotelBooking, type BookingStatus } from "@/lib/api/bookings"
import { getMediaUrl } from "@/lib/utils/media"
import { toast } from "sonner"

const statusConfig: Record<BookingStatus, { label: string; icon: typeof Clock; variant: "default" | "secondary" | "destructive" | "outline"; color: string }> = {
  pending:   { label: "Pending Confirmation", icon: Clock,         variant: "secondary",   color: "text-yellow-600" },
  confirmed: { label: "Confirmed",             icon: CheckCircle2,  variant: "default",     color: "text-green-600"  },
  rejected:  { label: "Rejected",              icon: XCircle,       variant: "destructive", color: "text-red-600"    },
  cancelled: { label: "Cancelled",             icon: Ban,           variant: "destructive", color: "text-red-600"    },
  completed: { label: "Completed",             icon: CheckCircle2,  variant: "outline",     color: "text-muted-foreground" },
  no_show:   { label: "No Show",               icon: AlertCircle,   variant: "destructive", color: "text-red-600"    },
}

export default function HotelBookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [booking, setBooking] = useState<HotelBooking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [cancelDialog, setCancelDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    getHotelBookingById(id)
      .then(setBooking)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false))
  }, [id])

  const handleCancel = async () => {
    if (!booking) return
    setIsCancelling(true)
    try {
      const updated = await cancelHotelBooking(booking.id, cancelReason || undefined)
      setBooking(updated)
      toast.success("Booking cancelled successfully")
      setCancelDialog(false)
      setCancelReason("")
    } catch {
      toast.error("Failed to cancel booking. Please try again.")
    } finally {
      setIsCancelling(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h3 className="mb-2 text-lg font-semibold">Booking not found</h3>
        <p className="mb-6 text-sm text-muted-foreground">We couldn't load this booking. Please try again.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  const status = statusConfig[booking.status]
  const StatusIcon = status.icon
  const checkIn = new Date(booking.check_in_date)
  const checkOut = new Date(booking.check_out_date)
  const isPast = checkOut < new Date()
  const canCancel = (booking.status === "pending" || booking.status === "confirmed") && !isPast
  const heroPhoto = booking.hotel?.photo_url ?? booking.hotel?.cover_photo_url

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        My Bookings
      </Button>

      {/* Hero */}
      <div className="relative h-56 w-full overflow-hidden rounded-xl">
        <Image
          src={getMediaUrl(heroPhoto) || "/placeholder.svg?height=224&width=768"}
          alt={booking.hotel?.name ?? "Hotel"}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <h1 className="text-2xl font-bold">{booking.hotel?.name}</h1>
          {booking.hotel?.city && (
            <div className="mt-1 flex items-center gap-1 text-sm text-white/80">
              <MapPin className="h-3.5 w-3.5" />
              {booking.hotel.city}
            </div>
          )}
          {(booking.hotel?.star_rating ?? 0) > 0 && (
            <div className="mt-1 flex items-center gap-1">
              {Array.from({ length: booking.hotel!.star_rating! }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          )}
        </div>
        <div className="absolute right-4 top-4">
          <Badge variant={status.variant} className="gap-1 text-sm">
            <StatusIcon className="h-3.5 w-3.5" />
            {status.label}
          </Badge>
        </div>
      </div>

      {/* Booking Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Booking Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Booking #</p>
              <p className="font-mono text-sm font-medium">{booking.booking_number}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Nights</p>
              <p className="font-medium">{booking.total_nights} {booking.total_nights === 1 ? "night" : "nights"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Check-in</p>
              <p className="font-medium">{checkIn.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</p>
              {booking.hotel?.check_in_time && (
                <p className="text-xs text-muted-foreground">from {booking.hotel.check_in_time}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Check-out</p>
              <p className="font-medium">{checkOut.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</p>
              {booking.hotel?.check_out_time && (
                <p className="text-xs text-muted-foreground">by {booking.hotel.check_out_time}</p>
              )}
            </div>
          </div>
          {booking.payment_required && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted/50 p-3">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Payment status:{" "}
                <span className={booking.payment_status === "paid" ? "font-medium text-green-600" : "font-medium text-yellow-600"}>
                  {booking.payment_status === "paid" ? "Paid" : "Payment required"}
                </span>
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rooms */}
      {(booking.rooms?.length ?? 0) > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Rooms</h2>
          {booking.rooms.map((room) => (
            <Card key={room.id}>
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  {room.photo_url && (
                    <div className="relative h-32 w-full sm:h-auto sm:w-36 flex-shrink-0">
                      <Image
                        src={getMediaUrl(room.photo_url) || "/placeholder.svg"}
                        alt={room.room_name}
                        fill
                        className="object-cover sm:rounded-l-lg"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{room.room_name}</h3>
                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <BedDouble className="h-3.5 w-3.5" />
                              {room.bed_count ?? 1}× {room.bed_type}
                            </span>
                            {room.room_size_sqm && (
                              <span>{room.room_size_sqm} m²</span>
                            )}
                            <span>{room.quantity} room{room.quantity !== 1 ? "s" : ""}</span>
                          </div>
                        </div>
                      </div>
                      {room.assigned_unit_numbers && room.assigned_unit_numbers.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {room.assigned_unit_numbers.map((u) => (
                            <Badge key={u} variant="secondary" className="text-xs">Room {u}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t pt-3">
                      <div className="text-sm text-muted-foreground">
                        {booking.currency} {parseFloat(room.price_per_night).toLocaleString()} × {room.num_nights} nights
                      </div>
                      <div className="font-semibold">
                        {booking.currency} {parseFloat(room.subtotal).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Price Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Price Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {booking.rooms.map((room) => (
            <div key={room.id} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{room.room_name} × {room.quantity} ({room.num_nights} nights)</span>
              <span>{booking.currency} {parseFloat(room.subtotal).toLocaleString()}</span>
            </div>
          ))}
          <Separator />
          <div className="flex items-center justify-between font-bold">
            <span>Total</span>
            <span className="text-lg">{booking.currency} {parseFloat(booking.total_price).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Guest Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Guest Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="font-medium">{booking.guest_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">{booking.guest_email}</p>
              </div>
            </div>
            {booking.guest_phone && (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{booking.guest_phone}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Guests</p>
                <p className="font-medium">
                  {booking.num_adults} adult{booking.num_adults !== 1 ? "s" : ""}
                  {(booking.num_children ?? 0) > 0 && `, ${booking.num_children} child${booking.num_children !== 1 ? "ren" : ""}`}
                </p>
              </div>
            </div>
          </div>
          {booking.special_requests && (
            <div className="mt-2 rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-medium text-muted-foreground">Special Requests</p>
              <p className="mt-1 text-sm">{booking.special_requests}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancellation info */}
      {(booking.cancellation_reason || booking.cancelled_at) && (
        <Card className="border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Ban className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Booking Cancelled</p>
                {booking.cancelled_at && (
                  <p className="text-sm text-muted-foreground">
                    On {new Date(booking.cancelled_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                )}
                {booking.cancellation_reason && (
                  <p className="mt-1 text-sm">{booking.cancellation_reason}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pb-6">
        {booking.hotel?.slug && (
          <Link href={`/hotels/${booking.hotel.slug}`}>
            <Button variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Hotel
            </Button>
          </Link>
        )}
        {booking.status === "confirmed" && !isPast && (
          <Link href="/messages">
            <Button variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              Contact Host
            </Button>
          </Link>
        )}
        {canCancel && (
          <Button variant="destructive" onClick={() => setCancelDialog(true)}>
            <XCircle className="mr-2 h-4 w-4" />
            Cancel Booking
          </Button>
        )}
      </div>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog} onOpenChange={(open) => { if (!open) { setCancelDialog(false); setCancelReason("") } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your stay at {booking.hotel?.name}? This action cannot be undone.
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
            <Button variant="outline" onClick={() => setCancelDialog(false)}>Keep Booking</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={isCancelling}>
              {isCancelling ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Cancelling...</>
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
