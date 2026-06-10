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
  Lock,
  Building2,
  Hash,
  User,
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
import {
  getProviderHotelBookingById,
  confirmHotelBooking,
  rejectHotelBooking,
  type HotelBooking,
  type BookingStatus,
  type BookingRoomAssignment,
} from "@/lib/api/bookings"
import { getHotelRooms } from "@/lib/api/hotels"
import { getMediaUrl } from "@/lib/utils/media"
import type { Room } from "@/lib/types"
import { toast } from "sonner"

// ============================================================================
// Status config
// ============================================================================

const statusConfig: Record<
  BookingStatus,
  { label: string; icon: typeof Clock; variant: "default" | "secondary" | "destructive" | "outline"; color: string }
> = {
  pending:   { label: "Awaiting Confirmation", icon: Clock,        variant: "secondary",   color: "text-yellow-600" },
  confirmed: { label: "Confirmed",             icon: CheckCircle2, variant: "default",     color: "text-green-600"  },
  rejected:  { label: "Rejected",              icon: XCircle,      variant: "destructive", color: "text-red-600"    },
  cancelled: { label: "Cancelled",             icon: Ban,          variant: "destructive", color: "text-red-600"    },
  completed: { label: "Completed",             icon: CheckCircle2, variant: "outline",     color: "text-muted-foreground" },
  no_show:   { label: "No Show",               icon: AlertCircle,  variant: "destructive", color: "text-red-600"    },
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

// ============================================================================
// Page
// ============================================================================

export default function ProviderHotelBookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [booking, setBooking] = useState<HotelBooking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  // Confirm/reject state
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectDialog, setRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  // Unit assignment
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomsLoading, setRoomsLoading] = useState(false)
  const [assignments, setAssignments] = useState<Record<string, string[]>>({})

  useEffect(() => {
    setIsLoading(true)
    getProviderHotelBookingById(id)
      .then((b) => {
        setBooking(b)
        if (b.hotel?.id && b.status === "pending") {
          setRoomsLoading(true)
          getHotelRooms(b.hotel.id, { check_in: b.check_in_date, check_out: b.check_out_date })
            .then(setRooms)
            .catch(() => setRooms([]))
            .finally(() => setRoomsLoading(false))
        }
      })
      .catch(() => setError(true))
      .finally(() => setIsLoading(false))
  }, [id])

  const toggleUnit = (bookingRoomId: string, unitId: string) => {
    setAssignments((prev) => {
      const current = prev[bookingRoomId] ?? []
      const next = current.includes(unitId)
        ? current.filter((x) => x !== unitId)
        : [...current, unitId]
      return { ...prev, [bookingRoomId]: next }
    })
  }

  const handleConfirm = async () => {
    if (!booking) return
    setActionLoading(true)
    try {
      const assignmentList: BookingRoomAssignment[] = Object.entries(assignments)
        .filter(([, ids]) => ids.length > 0)
        .map(([booking_room_id, unit_ids]) => ({ booking_room_id, unit_ids }))
      const updated = await confirmHotelBooking(booking.id, assignmentList.length > 0 ? assignmentList : undefined)
      setBooking(updated)
      toast.success("Booking confirmed successfully")
    } catch {
      toast.error("Failed to confirm booking")
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!booking) return
    setActionLoading(true)
    try {
      await rejectHotelBooking(booking.id, rejectReason || undefined)
      const updated = await getProviderHotelBookingById(id)
      setBooking(updated)
      toast.success("Booking rejected")
      setRejectDialog(false)
      setRejectReason("")
    } catch {
      toast.error("Failed to reject booking")
    } finally {
      setActionLoading(false)
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
        <p className="mb-6 text-sm text-muted-foreground">This booking doesn&apos;t exist or you don&apos;t have access to it.</p>
        <Button onClick={() => router.push("/provider/bookings")}>Back to Bookings</Button>
      </div>
    )
  }

  const status = statusConfig[booking.status]
  const StatusIcon = status.icon
  const checkIn = new Date(booking.check_in_date)
  const checkOut = new Date(booking.check_out_date)
  const heroPhoto = booking.hotel?.photo_url ?? booking.hotel?.cover_photo_url
  const contactVisible = booking.status === "confirmed" || booking.status === "completed"
  const isWalkIn = booking.source === "manual"

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => router.push("/provider/bookings")} className="-ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        All Bookings
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
        <div className="absolute right-4 top-4 flex gap-2">
          {isWalkIn && <Badge className="bg-amber-500/90 text-white border-0">Walk-in</Badge>}
          <Badge variant={status.variant} className="gap-1 text-sm">
            <StatusIcon className="h-3.5 w-3.5" />
            {status.label}
          </Badge>
        </div>
      </div>

      {/* Booking Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Booking Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

          {/* Payment */}
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
            <CreditCard className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <span className="text-muted-foreground">Payment:</span>
              <span className={
                booking.payment_status === "paid" ? "font-medium text-green-600" :
                booking.payment_status === "refunded" ? "font-medium text-blue-600" :
                "font-medium text-yellow-600"
              }>
                {booking.payment_status === "paid" ? "Paid" :
                 booking.payment_status === "refunded" ? "Refunded" :
                 booking.payment_required ? "Awaiting Payment" : "No payment required"}
              </span>
              <span className="font-bold">{booking.currency} {parseFloat(booking.total_price).toLocaleString()}</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3.5 w-3.5 flex-shrink-0" />
              <span>Booked on {formatDateTime(booking.created_at)}</span>
            </div>
            {booking.confirmed_at && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Confirmed on {formatDateTime(booking.confirmed_at)}</span>
              </div>
            )}
            {booking.cancelled_at && (
              <div className="flex items-center gap-2 text-destructive">
                <Ban className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Cancelled on {formatDateTime(booking.cancelled_at)}</span>
                {booking.cancellation_reason && <span>— {booking.cancellation_reason}</span>}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Guest Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Guest Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted flex-shrink-0">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="font-medium">{booking.guest_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted flex-shrink-0">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                {contactVisible ? (
                  <p className="font-medium">{booking.guest_email}</p>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground italic">Visible after confirmation</p>
                  </div>
                )}
              </div>
            </div>

            {(booking.guest_phone || !contactVisible) && (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted flex-shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  {contactVisible ? (
                    <p className="font-medium">{booking.guest_phone ?? "—"}</p>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground italic">Visible after confirmation</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted flex-shrink-0">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Party Size</p>
                <p className="font-medium">
                  {booking.num_adults} adult{booking.num_adults !== 1 ? "s" : ""}
                  {(booking.num_children ?? 0) > 0 &&
                    `, ${booking.num_children} child${booking.num_children !== 1 ? "ren" : ""}`}
                </p>
              </div>
            </div>
          </div>

          {/* Per-guest breakdown */}
          {(booking.guests_info?.length ?? 0) > 0 && (
            <div>
              <Separator className="my-3" />
              <p className="text-sm font-medium mb-2">Guest Details</p>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-xs text-muted-foreground">
                      <th className="px-3 py-2 text-left font-medium">#</th>
                      <th className="px-3 py-2 text-left font-medium">Name</th>
                      <th className="px-3 py-2 text-left font-medium">Gender</th>
                      <th className="px-3 py-2 text-left font-medium">Age</th>
                    </tr>
                  </thead>
                  <tbody>
                    {booking.guests_info!.map((g, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                        <td className="px-3 py-2 font-medium">{g.first_name} {g.last_name}</td>
                        <td className="px-3 py-2 capitalize">{g.gender}</td>
                        <td className="px-3 py-2">{g.age ? `${g.age}y` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {booking.special_requests && (
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground">Special Requests</p>
              </div>
              <p className="text-sm">{booking.special_requests}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rooms */}
      {(booking.rooms?.length ?? 0) > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BedDouble className="h-5 w-5" />
            Rooms ({booking.rooms.reduce((s, r) => s + r.quantity, 0)})
          </h2>
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
                            {room.room_size_sqm && <span>{room.room_size_sqm} m²</span>}
                            <span>{room.quantity} room{room.quantity !== 1 ? "s" : ""}</span>
                          </div>
                        </div>
                      </div>
                      {/* Already-assigned unit numbers (confirmed bookings) */}
                      {(room.assigned_unit_numbers?.length ?? 0) > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          <span className="text-xs text-muted-foreground">Assigned:</span>
                          {room.assigned_unit_numbers!.map((u) => (
                            <Badge key={u} variant="secondary" className="text-xs">Room {u}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t pt-3">
                      <div className="text-sm text-muted-foreground">
                        {booking.currency} {parseFloat(room.price_per_night).toLocaleString()} × {room.num_nights} nights × {room.quantity}
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

      {/* Unit assignment (pending bookings only) */}
      {booking.status === "pending" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Assign Room Numbers</CardTitle>
            <p className="text-sm text-muted-foreground">Optionally assign specific room units before confirming</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {roomsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading available units...
              </div>
            ) : (
              (booking.rooms ?? []).map((br) => {
                const room = rooms.find((r) => r.id === br.room_id)
                if (!room?.units?.length) return null
                const selectedIds = assignments[br.id] ?? []
                return (
                  <div key={br.id} className="space-y-2">
                    <p className="text-sm font-medium">
                      {br.room_name} — pick {br.quantity} unit{br.quantity !== 1 ? "s" : ""}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {room.units.filter((u) => u.is_active).map((unit) => {
                        const isSelected = selectedIds.includes(unit.id)
                        return (
                          <button
                            key={unit.id}
                            type="button"
                            onClick={() => toggleUnit(br.id, unit.id)}
                            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border hover:bg-muted"
                            }`}
                          >
                            {unit.label || unit.unit_number}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })
            )}
            {!roomsLoading && rooms.every((r) => !r.units?.length) && (
              <p className="text-sm text-muted-foreground">No room units configured — you can still confirm without assigning.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Price Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Price Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {booking.rooms.map((room) => (
            <div key={room.id} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {room.room_name} × {room.quantity} ({room.num_nights} nights)
              </span>
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

      {/* Hotel Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Hotel Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
          {booking.hotel?.address && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <p>{booking.hotel.address}</p>
              </div>
            </div>
          )}
          {booking.hotel?.phone && (
            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Hotel Phone</p>
                <p>{booking.hotel.phone}</p>
              </div>
            </div>
          )}
          {booking.hotel?.check_in_time && (
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Check-in Time</p>
                <p>From {booking.hotel.check_in_time}</p>
              </div>
            </div>
          )}
          {booking.hotel?.check_out_time && (
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Check-out Time</p>
                <p>By {booking.hotel.check_out_time}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pb-6">
        {booking.hotel?.slug && (
          <Link href={`/hotels/${booking.hotel.slug}`}>
            <Button variant="outline">
              <Building2 className="mr-2 h-4 w-4" />
              View Hotel Page
            </Button>
          </Link>
        )}
        {contactVisible && (
          <Link href="/messages">
            <Button variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              Message Guest
            </Button>
          </Link>
        )}
        {booking.status === "pending" && (
          <>
            <Button
              variant="outline"
              onClick={() => setRejectDialog(true)}
              disabled={actionLoading}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button onClick={handleConfirm} disabled={actionLoading}>
              {actionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Confirm Booking
            </Button>
          </>
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onOpenChange={(open) => { if (!open) { setRejectDialog(false); setRejectReason("") } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Booking</DialogTitle>
            <DialogDescription>
              You are about to reject the booking from {booking.guest_name}. Let them know why (optional).
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Reason for rejection (optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setRejectDialog(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={actionLoading}>
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reject Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
