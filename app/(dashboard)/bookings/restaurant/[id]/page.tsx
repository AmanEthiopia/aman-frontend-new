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
  Phone,
  Mail,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Ban,
  ExternalLink,
  Utensils,
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
import { getRestaurantReservationById, cancelRestaurantReservation, type RestaurantReservation, type BookingStatus } from "@/lib/api/bookings"
import { getMediaUrl } from "@/lib/utils/media"
import { toast } from "sonner"

const statusConfig: Record<BookingStatus, { label: string; icon: typeof Clock; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending:   { label: "Pending Confirmation", icon: Clock,        variant: "secondary"   },
  confirmed: { label: "Confirmed",             icon: CheckCircle2, variant: "default"     },
  rejected:  { label: "Rejected",              icon: XCircle,      variant: "destructive" },
  cancelled: { label: "Cancelled",             icon: Ban,          variant: "destructive" },
  completed: { label: "Completed",             icon: CheckCircle2, variant: "outline"     },
  no_show:   { label: "No Show",               icon: AlertCircle,  variant: "destructive" },
  expired:   { label: "Expired — No Response",  icon: AlertCircle,  variant: "outline"     },
}

export default function RestaurantBookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [booking, setBooking] = useState<RestaurantReservation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [cancelDialog, setCancelDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    getRestaurantReservationById(id)
      .then(setBooking)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false))
  }, [id])

  const handleCancel = async () => {
    if (!booking) return
    setIsCancelling(true)
    try {
      const updated = await cancelRestaurantReservation(booking.id, cancelReason || undefined)
      setBooking(updated)
      toast.success("Reservation cancelled successfully")
      setCancelDialog(false)
      setCancelReason("")
    } catch {
      toast.error("Failed to cancel reservation. Please try again.")
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
        <h3 className="mb-2 text-lg font-semibold">Reservation not found</h3>
        <p className="mb-6 text-sm text-muted-foreground">We couldn't load this reservation. Please try again.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  const status = statusConfig[booking.status]
  const StatusIcon = status.icon
  const reservationDate = new Date(booking.reservation_date)
  const isPast = reservationDate < new Date()
  const canCancel = (booking.status === "pending" || booking.status === "confirmed") && !isPast
  const heroPhoto = booking.restaurant?.photo_url ?? booking.restaurant?.cover_photo_url

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        My Bookings
      </Button>

      {/* Hero */}
      <div className="relative h-48 w-full overflow-hidden rounded-xl">
        {heroPhoto ? (
          <Image
            src={getMediaUrl(heroPhoto) || "/placeholder.svg?height=192&width=768"}
            alt={booking.restaurant?.name ?? "Restaurant"}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-orange-50">
            <Utensils className="h-20 w-20 text-orange-200" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <h1 className="text-2xl font-bold">{booking.restaurant?.name}</h1>
          {booking.restaurant?.address && (
            <div className="mt-1 flex items-center gap-1 text-sm text-white/80">
              <MapPin className="h-3.5 w-3.5" />
              {booking.restaurant.address}
            </div>
          )}
          {booking.restaurant?.cuisine_type && (
            <p className="mt-0.5 text-sm text-white/70">{booking.restaurant.cuisine_type}</p>
          )}
        </div>
        <div className="absolute right-4 top-4">
          <Badge variant={status.variant} className="gap-1 text-sm">
            <StatusIcon className="h-3.5 w-3.5" />
            {status.label}
          </Badge>
        </div>
      </div>

      {/* Reservation Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Reservation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Reservation #</p>
              <p className="font-mono text-sm font-medium">{booking.reservation_number}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="font-medium">
                {reservationDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Time</p>
              <div className="flex items-center gap-1 font-medium">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                {booking.reservation_time}
              </div>
              {booking.duration_minutes && (
                <p className="text-xs text-muted-foreground">{booking.duration_minutes} min</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Party Size</p>
              <div className="flex items-center gap-1 font-medium">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                {booking.party_size} {booking.party_size === 1 ? "guest" : "guests"}
              </div>
            </div>
          </div>

          {parseFloat(booking.total_price ?? "0") > 0 && (
            <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <span className="text-sm text-muted-foreground">Deposit / Total</span>
              <span className="font-bold">
                {booking.currency} {parseFloat(booking.total_price!).toLocaleString()}
              </span>
            </div>
          )}
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
          </div>
          {booking.special_requests && (
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-medium text-muted-foreground">Special Requests</p>
              <p className="mt-1 text-sm">{booking.special_requests}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancellation info */}
      {booking.cancelled_at && (
        <Card className="border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Ban className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Reservation Cancelled</p>
                <p className="text-sm text-muted-foreground">
                  On {new Date(booking.cancelled_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pb-6">
        {booking.restaurant?.slug && (
          <Link href={`/restaurants/${booking.restaurant.slug}`}>
            <Button variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Restaurant
            </Button>
          </Link>
        )}
        {booking.restaurant?.phone && booking.status === "confirmed" && !isPast && (
          <a href={`tel:${booking.restaurant.phone}`}>
            <Button variant="outline">
              <Phone className="mr-2 h-4 w-4" />
              Call Restaurant
            </Button>
          </a>
        )}
        {booking.status === "confirmed" && !isPast && (
          <Link href="/messages">
            <Button variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              Contact Restaurant
            </Button>
          </Link>
        )}
        {canCancel && (
          <Button variant="destructive" onClick={() => setCancelDialog(true)}>
            <XCircle className="mr-2 h-4 w-4" />
            Cancel Reservation
          </Button>
        )}
      </div>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog} onOpenChange={(open) => { if (!open) { setCancelDialog(false); setCancelReason("") } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Reservation</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your reservation at {booking.restaurant?.name}?
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
            <Button variant="outline" onClick={() => setCancelDialog(false)}>Keep Reservation</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={isCancelling}>
              {isCancelling ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Cancelling...</>
              ) : (
                "Cancel Reservation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
