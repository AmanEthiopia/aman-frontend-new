"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Loader2,
  Building2,
  UtensilsCrossed,
  Car,
  Map,
  Compass,
  Plus,
  BedDouble,
  Minus,
  User,
  Mail,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import {
  getAllProviderBookings,
  confirmHotelBooking,
  rejectHotelBooking,
  confirmRestaurantReservation,
  rejectRestaurantReservation,
  confirmPackageBooking,
  rejectPackageBooking,
  confirmDriverBooking,
  rejectDriverBooking,
  createManualHotelBooking,
  getHotelBookingById,
  type NormalizedBooking,
  type BookingStatus,
  type BookingServiceType,
  type HotelBooking,
  type HotelBookingListItem,
  type BookingRoomAssignment,
} from "@/lib/api/bookings"
import { confirmGuideBooking, rejectGuideBooking } from "@/lib/api/guides"
import { getMyHotels } from "@/lib/api/provider"
import { getHotelRooms } from "@/lib/api/hotels"
import type { Room } from "@/lib/types"

// ============================================================================
// Status config
// ============================================================================

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending:   { label: "Awaiting Confirmation", variant: "secondary" },
  confirmed: { label: "Confirmed",             variant: "default"   },
  rejected:  { label: "Rejected",              variant: "destructive"},
  cancelled: { label: "Cancelled",             variant: "outline"   },
  completed: { label: "Completed",             variant: "outline"   },
  no_show:   { label: "No Show",               variant: "destructive"},
  expired:   { label: "Expired — No Response",  variant: "outline"   },
}

const serviceIcons: Record<BookingServiceType, typeof Building2> = {
  hotel:      Building2,
  restaurant: UtensilsCrossed,
  trip:       Map,
  driver:     Car,
  guide:      Compass,
}

const serviceLabels: Record<BookingServiceType, string> = {
  hotel:      "Hotel",
  restaurant: "Restaurant",
  trip:       "Trip",
  driver:     "Driver",
  guide:      "Guide",
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const h = Math.floor(diff / 3.6e6)
  const d = Math.floor(h / 24)
  if (h < 1) return "Just now"
  if (h < 24) return `${h}h ago`
  if (d === 1) return "1 day ago"
  return `${d} days ago`
}

// ============================================================================
// Confirm / Reject router
// ============================================================================

async function confirmBookingDefault(b: NormalizedBooking): Promise<void> {
  if (b.service_type === "hotel")      await confirmHotelBooking(b.id)
  else if (b.service_type === "restaurant") await confirmRestaurantReservation(b.id)
  else if (b.service_type === "trip")  await confirmPackageBooking(b.id)
  else if (b.service_type === "driver") await confirmDriverBooking(b.id)
  else if (b.service_type === "guide") await confirmGuideBooking(b.id)
}

async function rejectBooking(b: NormalizedBooking, reason?: string): Promise<void> {
  if (b.service_type === "hotel")      await rejectHotelBooking(b.id, reason)
  else if (b.service_type === "restaurant") await rejectRestaurantReservation(b.id, reason)
  else if (b.service_type === "trip")  await rejectPackageBooking(b.id, reason)
  else if (b.service_type === "driver") await rejectDriverBooking(b.id, reason)
  else if (b.service_type === "guide") await rejectGuideBooking(b.id, reason || "")
}

// ============================================================================
// Booking Detail Modal (with unit assignment for hotel bookings)
// ============================================================================

function BookingDetailModal({
  booking,
  open,
  onClose,
  onConfirm,
  onReject,
  isLoading,
}: {
  booking: NormalizedBooking | null
  open: boolean
  onClose: () => void
  onConfirm: (assignments?: BookingRoomAssignment[]) => void
  onReject: (reason?: string) => void
  isLoading: boolean
}) {
  const [rejectReason, setRejectReason] = useState("")
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomsLoading, setRoomsLoading] = useState(false)
  const [fullHotelBooking, setFullHotelBooking] = useState<HotelBooking | null>(null)
  const [fullBookingLoading, setFullBookingLoading] = useState(false)
  const [assignments, setAssignments] = useState<Record<string, string[]>>({})

  useEffect(() => {
    if (!open) {
      setShowRejectForm(false)
      setRejectReason("")
      setAssignments({})
      setRooms([])
      setFullHotelBooking(null)
      return
    }
    if (booking?.service_type === "hotel") {
      setFullBookingLoading(true)
      getHotelBookingById(booking.id)
        .then((detail) => {
          setFullHotelBooking(detail)
          if (detail.hotel?.id) {
            setRoomsLoading(true)
            getHotelRooms(detail.hotel.id, {
              check_in: detail.check_in_date,
              check_out: detail.check_out_date,
            })
              .then(setRooms)
              .catch(() => setRooms([]))
              .finally(() => setRoomsLoading(false))
          }
        })
        .catch(() => setFullHotelBooking(null))
        .finally(() => setFullBookingLoading(false))
    }
  }, [open, booking?.id, booking?.service_type])

  const hotelBooking = fullHotelBooking

  if (!booking) return null
  const status = statusConfig[booking.status] ?? statusConfig.pending
  const Icon = serviceIcons[booking.service_type]
  // A pending request whose service date has already passed can no longer be acted on.
  const serviceDatePassed = !!booking.date_from && new Date(booking.date_from) < new Date(new Date().toDateString())
  const canRespond = booking.status === "pending" && !serviceDatePassed

  const handleClose = () => {
    setShowRejectForm(false)
    setRejectReason("")
    onClose()
  }

  const handleConfirm = () => {
    if (booking.service_type === "hotel") {
      const assignmentList: BookingRoomAssignment[] = Object.entries(assignments)
        .filter(([, ids]) => ids.length > 0)
        .map(([booking_room_id, unit_ids]) => ({ booking_room_id, unit_ids }))
      onConfirm(assignmentList.length > 0 ? assignmentList : undefined)
    } else {
      onConfirm()
    }
  }

  const toggleUnit = (bookingRoomId: string, unitId: string) => {
    setAssignments((prev) => {
      const current = prev[bookingRoomId] ?? []
      const next = current.includes(unitId)
        ? current.filter((id) => id !== unitId)
        : [...current, unitId]
      return { ...prev, [bookingRoomId]: next }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {serviceLabels[booking.service_type]} Booking — {booking.booking_number}
          </DialogTitle>
          <DialogDescription>Review the booking details and respond to the guest</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-3">
          {/* Status + Source badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={status.variant}>{status.label}</Badge>
            {(hotelBooking?.source ?? (booking.raw as any)?.source) === "manual" && (
              <Badge className="bg-amber-100 text-amber-800 border-amber-200">Walk-in</Badge>
            )}
            {fullBookingLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>

          {/* Guest */}
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback>{(booking.guest_name ?? "??").slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{booking.guest_name}</p>
              <p className="text-sm text-muted-foreground">{booking.guest_email}</p>
              {booking.guest_phone && <p className="text-sm text-muted-foreground">{booking.guest_phone}</p>}
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/50 p-4 text-sm">
            <div>
              <p className="text-muted-foreground">Service</p>
              <p className="font-medium">{booking.property_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Guests</p>
              <p className="font-medium">{booking.guests}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Date</p>
              <p className="font-medium">{formatDate(booking.date_from)}</p>
            </div>
            {booking.date_to && (
              <div>
                <p className="text-muted-foreground">Check-out</p>
                <p className="font-medium">{formatDate(booking.date_to)}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">Total</p>
              <p className="text-lg font-bold">
                {Number(booking.total_price) > 0 ? `ETB ${Number(booking.total_price).toLocaleString()}` : "Free / TBD"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Booked</p>
              <p className="font-medium">{timeAgo(booking.created_at)}</p>
            </div>
          </div>

          {/* Hotel room breakdown */}
          {(hotelBooking?.rooms?.length ?? 0) > 0 && (
            <div className="rounded-lg border p-3 space-y-2">
              <p className="text-sm font-medium">Rooms Requested</p>
              {hotelBooking!.rooms.map((br) => (
                <div key={br.id} className="text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{br.room_name} × {br.quantity}</span>
                    <span>ETB {parseFloat(br.subtotal).toLocaleString()}</span>
                  </div>
                  {br.assigned_unit_numbers && br.assigned_unit_numbers.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {br.assigned_unit_numbers.map((u) => (
                        <Badge key={u} variant="secondary" className="text-xs">{u}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Guest list (when per-guest info was collected) */}
          {(hotelBooking?.guests_info?.length ?? 0) > 0 && (
            <div className="rounded-lg border p-3 space-y-2">
              <p className="text-sm font-medium flex items-center gap-1.5">
                <User className="h-4 w-4" />
                Guests ({hotelBooking!.guests_info!.length})
              </p>
              {hotelBooking!.guests_info!.map((g: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>{g.first_name} {g.last_name}</span>
                  <span className="text-muted-foreground capitalize">{g.gender}{g.age ? ` · ${g.age}y` : ""}</span>
                </div>
              ))}
            </div>
          )}

          {/* Unit assignment for pending hotel bookings */}
          {canRespond && hotelBooking && !showRejectForm && (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Assign Room Numbers (Optional)</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select specific room units — limit {hotelBooking.guests_info?.length
                    ? hotelBooking.guests_info.length
                    : (hotelBooking.num_adults ?? 0) + (hotelBooking.num_children ?? 0)} unit(s) for {hotelBooking.guests_info?.length
                    ? hotelBooking.guests_info.length
                    : (hotelBooking.num_adults ?? 0) + (hotelBooking.num_children ?? 0)} guest(s)
                </p>
              </div>
              {roomsLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {(hotelBooking.rooms ?? []).map((br) => {
                const room = rooms.find((r) => r.id === br.room_id)
                if (!room?.units?.length) return null
                const selectedIds = assignments[br.id] ?? []
                return (
                  <div key={br.id} className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">{br.room_name} — pick {br.quantity}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {room.units.filter((u) => u.is_active).map((unit) => {
                        const isSelected = selectedIds.includes(unit.id)
                        return (
                          <button
                            key={unit.id}
                            type="button"
                            onClick={() => toggleUnit(br.id, unit.id)}
                            className={`rounded border px-2 py-0.5 text-xs transition-colors ${
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
              })}
            </div>
          )}

          {booking.special_requests && (
            <div className="rounded-lg border p-3">
              <p className="text-sm font-medium">Special Requests</p>
              <p className="mt-1 text-sm text-muted-foreground">{booking.special_requests}</p>
            </div>
          )}

          {showRejectForm && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Reason for rejection (optional)</p>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Let the guest know why you can't accept this booking..."
              />
            </div>
          )}
        </div>

        {booking.status === "pending" && serviceDatePassed && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>
              This request expired — the date ({formatDate(booking.date_from!)}) has passed, so it can no longer
              be confirmed or rejected. The guest was notified of the non-response, and unanswered requests
              lower your response rate.
            </p>
          </div>
        )}

        <DialogFooter className="gap-2">
          {canRespond && !showRejectForm && (
            <>
              <Button variant="outline" onClick={() => setShowRejectForm(true)} disabled={isLoading}>
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button onClick={handleConfirm} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                Confirm
              </Button>
            </>
          )}
          {canRespond && showRejectForm && (
            <>
              <Button variant="ghost" onClick={() => setShowRejectForm(false)} disabled={isLoading}>Back</Button>
              <Button variant="destructive" onClick={() => onReject(rejectReason)} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Rejection
              </Button>
            </>
          )}
          {!canRespond && (
            <Button variant="outline" onClick={handleClose}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// Walk-in Booking Modal
// ============================================================================

function WalkInBookingModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [hotels, setHotels] = useState<any[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [hotelsLoading, setHotelsLoading] = useState(true)
  const [roomsLoading, setRoomsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedHotelId, setSelectedHotelId] = useState("")
  const [selectedRooms, setSelectedRooms] = useState<Record<string, number>>({})
  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    numAdults: 1,
    numChildren: 0,
    notes: "",
  })

  useEffect(() => {
    if (!open) return
    setHotelsLoading(true)
    getMyHotels({})
      .then((res) => setHotels(Array.isArray(res) ? res : (res as any)?.results ?? []))
      .catch(() => setHotels([]))
      .finally(() => setHotelsLoading(false))
  }, [open])

  useEffect(() => {
    if (!selectedHotelId) { setRooms([]); return }
    setRoomsLoading(true)
    getHotelRooms(selectedHotelId, formData.checkIn && formData.checkOut ? { check_in: formData.checkIn, check_out: formData.checkOut } : undefined)
      .then(setRooms)
      .catch(() => setRooms([]))
      .finally(() => setRoomsLoading(false))
  }, [selectedHotelId, formData.checkIn, formData.checkOut])

  const setRoomQty = (roomId: string, delta: number) => {
    setSelectedRooms((prev) => {
      const current = prev[roomId] ?? 0
      const room = rooms.find((r) => r.id === roomId)
      const maxAvail = room?.available_units ?? room?.total_units ?? 99
      const next = Math.max(0, Math.min(current + delta, maxAvail))
      if (next === 0) {
        const { [roomId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [roomId]: next }
    })
  }

  const roomsPayload = Object.entries(selectedRooms)
    .filter(([, qty]) => qty > 0)
    .map(([room_id, quantity]) => ({ room_id, quantity }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedHotelId || roomsPayload.length === 0) {
      toast.error("Select a hotel and at least one room")
      return
    }
    if (!formData.checkIn || !formData.checkOut || formData.checkOut <= formData.checkIn) {
      toast.error("Select valid check-in and check-out dates")
      return
    }
    setIsSubmitting(true)
    try {
      await createManualHotelBooking({
        hotel_id: selectedHotelId,
        check_in_date: formData.checkIn,
        check_out_date: formData.checkOut,
        rooms: roomsPayload,
        num_adults: formData.numAdults,
        num_children: formData.numChildren || undefined,
        guest_name: formData.guestName,
        guest_email: formData.guestEmail,
        guest_phone: formData.guestPhone || undefined,
        special_requests: formData.notes || undefined,
      })
      toast.success("Walk-in booking created")
      onSuccess()
      onClose()
    } catch (err: any) {
      toast.error(err.message || "Failed to create booking")
    } finally {
      setIsSubmitting(false)
    }
  }

  const today = new Date().toISOString().split("T")[0]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Walk-in Booking
          </DialogTitle>
          <DialogDescription>Create a manual booking for an in-person guest</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Hotel selection */}
          <div className="space-y-2">
            <Label>Hotel *</Label>
            {hotelsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading hotels...
              </div>
            ) : (
              <Select value={selectedHotelId} onValueChange={(v) => { setSelectedHotelId(v); setSelectedRooms({}) }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a hotel" />
                </SelectTrigger>
                <SelectContent>
                  {hotels.map((h) => (
                    <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Check-in *</Label>
              <Input type="date" min={today} value={formData.checkIn} onChange={(e) => setFormData((p) => ({ ...p, checkIn: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Check-out *</Label>
              <Input type="date" min={formData.checkIn || today} value={formData.checkOut} onChange={(e) => setFormData((p) => ({ ...p, checkOut: e.target.value }))} required />
            </div>
          </div>

          {/* Room selection */}
          {selectedHotelId && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Rooms *
                {roomsLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
              </Label>
              {rooms.length === 0 && !roomsLoading && (
                <p className="text-sm text-muted-foreground">No rooms found for this hotel.</p>
              )}
              {rooms.map((room) => {
                const qty = selectedRooms[room.id] ?? 0
                const maxQty = room.available_units ?? room.total_units ?? 99
                return (
                  <div key={room.id} className={`flex items-center justify-between rounded-lg border p-3 ${qty > 0 ? "border-primary bg-primary/5" : ""}`}>
                    <div>
                      <p className="text-sm font-medium">{room.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ETB {(room.base_price !== undefined ? parseFloat(String(room.base_price)) : room.price_per_night) ?? 0}/night
                        {" · "}
                        {room.max_adults !== undefined
                          ? `${room.max_adults} adults${room.max_children ? `, ${room.max_children} children` : ""}`
                          : `${room.max_guests ?? 1} guests`} max
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setRoomQty(room.id, -1)} disabled={qty === 0} className="flex h-7 w-7 items-center justify-center rounded-full border disabled:opacity-40 hover:bg-muted">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-5 text-center text-sm font-semibold">{qty}</span>
                      <button type="button" onClick={() => setRoomQty(room.id, 1)} disabled={qty >= maxQty} className="flex h-7 w-7 items-center justify-center rounded-full border bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Guest info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Guest Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-10" placeholder="Full name" value={formData.guestName} onChange={(e) => setFormData((p) => ({ ...p, guestName: e.target.value }))} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-10" type="email" placeholder="guest@example.com" value={formData.guestEmail} onChange={(e) => setFormData((p) => ({ ...p, guestEmail: e.target.value }))} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input placeholder="+251 708 029 422" value={formData.guestPhone} onChange={(e) => setFormData((p) => ({ ...p, guestPhone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Adults *</Label>
              <Input type="number" min={1} max={20} value={formData.numAdults} onChange={(e) => setFormData((p) => ({ ...p, numAdults: Number(e.target.value) }))} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea placeholder="Any notes about this booking..." value={formData.notes} onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))} rows={2} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || roomsPayload.length === 0}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</>
              ) : (
                <><Plus className="mr-2 h-4 w-4" />Create Booking</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// Booking row
// ============================================================================

function BookingRow({
  booking,
  onViewDetails,
  onConfirm,
  onReject,
  isLoading,
}: {
  booking: NormalizedBooking
  onViewDetails: () => void
  onConfirm: () => void
  onReject: () => void
  isLoading: boolean
}) {
  const status = statusConfig[booking.status] ?? statusConfig.pending
  const Icon = serviceIcons[booking.service_type]
  const isManual = (booking.raw as any).source === "manual"
  const serviceDatePassed = !!booking.date_from && new Date(booking.date_from) < new Date(new Date().toDateString())
  const canRespond = booking.status === "pending" && !serviceDatePassed

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarFallback>{(booking.guest_name ?? "??").slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold">{booking.guest_name}</span>
                <Badge variant={status.variant} className="text-xs">{status.label}</Badge>
                {isManual && (
                  <Badge className="text-xs bg-amber-100 text-amber-800 border-amber-200">Walk-in</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="h-4 w-4" />
                <span>{booking.property_name}</span>
                <span className="text-muted-foreground/40">·</span>
                <span>{serviceLabels[booking.service_type]}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(booking.date_from)}
                  {booking.date_to && <> — {formatDate(booking.date_to)}</>}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {(() => {
                    const raw = booking.raw as any
                    const adults = raw.num_adults ?? 0
                    const children = raw.num_children ?? 0
                    if (adults > 0 || children > 0) {
                      return [
                        adults > 0 ? `${adults} adult${adults !== 1 ? "s" : ""}` : null,
                        children > 0 ? `${children} child${children !== 1 ? "ren" : ""}` : null,
                      ].filter(Boolean).join(", ")
                    }
                    return `${booking.guests} ${booking.guests === 1 ? "guest" : "guests"}`
                  })()}
                </span>
              </div>
              {/* Room summary for hotel bookings */}
              {booking.service_type === "hotel" && (() => {
                const raw = booking.raw as HotelBookingListItem
                const summary = raw?.room_summary
                if (!summary?.length) return null
                return (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {summary.map((rs, i) => (
                      <Badge key={i} variant="secondary" className="text-xs font-normal">
                        <BedDouble className="mr-1 h-3 w-3" />
                        {rs.quantity > 1 ? `${rs.quantity}× ` : ""}{rs.room_name}
                        {rs.bed_type ? ` (${rs.bed_type})` : ""}
                      </Badge>
                    ))}
                  </div>
                )
              })()}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <p className="font-bold">
                {Number(booking.total_price) > 0 ? `ETB ${Number(booking.total_price).toLocaleString()}` : "Free"}
              </p>
              <p className="text-xs text-muted-foreground">{timeAgo(booking.created_at)}</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onViewDetails}>
                View Details
              </Button>
              {canRespond && (
                <>
                  <Button variant="outline" size="sm" onClick={onReject} disabled={isLoading}>
                    <XCircle className="mr-1 h-4 w-4" />
                    Reject
                  </Button>
                  <Button size="sm" onClick={onConfirm} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-1 h-4 w-4" />}
                    Confirm
                  </Button>
                </>
              )}
              {booking.status === "pending" && serviceDatePassed && (
                <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">Expired</Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Page
// ============================================================================

export default function ProviderBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<NormalizedBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<NormalizedBooking | null>(null)
  const [showWalkIn, setShowWalkIn] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [serviceFilter, setServiceFilter] = useState<"all" | BookingServiceType>("all")

  useEffect(() => {
    loadBookings()
  }, [])

  async function loadBookings() {
    setIsLoading(true)
    try {
      const data = await getAllProviderBookings()
      setBookings(data)
    } catch (error) {
      console.error("[v0] Failed to load bookings:", error)
      toast.error("Failed to load bookings")
    } finally {
      setIsLoading(false)
    }
  }

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (serviceFilter !== "all" && b.service_type !== serviceFilter) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (!b.guest_name.toLowerCase().includes(q) &&
            !b.guest_email.toLowerCase().includes(q) &&
            !b.property_name.toLowerCase().includes(q) &&
            !b.booking_number.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [bookings, serviceFilter, searchQuery])

  const pending   = filtered.filter((b) => b.status === "pending")
  const confirmed = filtered.filter((b) => b.status === "confirmed")
  const past      = filtered.filter((b) => ["completed", "cancelled", "rejected", "no_show", "expired"].includes(b.status))

  const handleConfirm = async (booking: NormalizedBooking, assignments?: BookingRoomAssignment[]) => {
    setActionLoading(booking.id)
    try {
      if (booking.service_type === "hotel") {
        await confirmHotelBooking(booking.id, assignments)
      } else {
        await confirmBookingDefault(booking)
      }
      toast.success("Booking confirmed")
      await loadBookings()
    } catch (err: any) {
      toast.error(err?.message || "Couldn't confirm this booking. Please try again.")
    } finally {
      setActionLoading(null)
      setSelectedBooking(null)
    }
  }

  const handleReject = async (booking: NormalizedBooking, reason?: string) => {
    setActionLoading(booking.id)
    try {
      await rejectBooking(booking, reason)
      toast.success("Booking rejected")
      await loadBookings()
    } catch {
      toast.error("Failed to reject booking")
    } finally {
      setActionLoading(null)
      setSelectedBooking(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Bookings</h1>
          <p className="text-muted-foreground">Manage reservations across all your services</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowWalkIn(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Walk-in Booking
          </Button>
          <Button variant="outline" onClick={loadBookings}>
            <Clock className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by guest, property, or booking #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 rounded-md border p-1">
          {(["all", "hotel", "restaurant", "trip", "driver"] as const).map((type) => {
            const Icon = type === "all" ? null : serviceIcons[type]
            return (
              <button
                key={type}
                onClick={() => setServiceFilter(type)}
                className={`flex items-center gap-1 rounded px-3 py-1 text-sm transition-colors ${
                  serviceFilter === type ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                <span className="capitalize">{type}</span>
              </button>
            )
          })}
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            Pending
            {pending.length > 0 && <Badge variant="destructive" className="text-xs">{pending.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="confirmed" className="gap-2">
            Confirmed
            {confirmed.length > 0 && <Badge variant="secondary" className="text-xs">{confirmed.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-3">
          {pending.length > 0 ? (
            pending.map((b) => (
              <BookingRow
                key={b.id}
                booking={b}
                onViewDetails={() => b.service_type === "hotel" ? router.push(`/provider/bookings/hotel/${b.id}`) : setSelectedBooking(b)}
                onConfirm={() => b.service_type === "hotel" ? router.push(`/provider/bookings/hotel/${b.id}`) : handleConfirm(b)}
                onReject={() => setSelectedBooking(b)}
                isLoading={actionLoading === b.id}
              />
            ))
          ) : (
            <div className="py-12 text-center">
              <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600" />
              <h3 className="font-semibold">All caught up!</h3>
              <p className="text-muted-foreground">No pending booking requests</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="confirmed" className="space-y-3">
          {confirmed.length > 0 ? (
            confirmed.map((b) => (
              <BookingRow
                key={b.id}
                booking={b}
                onViewDetails={() => b.service_type === "hotel" ? router.push(`/provider/bookings/hotel/${b.id}`) : setSelectedBooking(b)}
                onConfirm={() => {}}
                onReject={() => {}}
                isLoading={false}
              />
            ))
          ) : (
            <div className="py-12 text-center">
              <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="font-semibold">No confirmed bookings</h3>
              <p className="text-muted-foreground">Accepted bookings will appear here</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-3">
          {past.length > 0 ? (
            past.map((b) => (
              <BookingRow
                key={b.id}
                booking={b}
                onViewDetails={() => b.service_type === "hotel" ? router.push(`/provider/bookings/hotel/${b.id}`) : setSelectedBooking(b)}
                onConfirm={() => {}}
                onReject={() => {}}
                isLoading={false}
              />
            ))
          ) : (
            <div className="py-12 text-center">
              <Clock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="font-semibold">No past bookings</h3>
              <p className="text-muted-foreground">Completed and cancelled bookings will appear here</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <BookingDetailModal
        booking={selectedBooking}
        open={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onConfirm={(assignments) => selectedBooking && handleConfirm(selectedBooking, assignments)}
        onReject={(reason) => selectedBooking && handleReject(selectedBooking, reason)}
        isLoading={actionLoading === selectedBooking?.id}
      />

      <WalkInBookingModal
        open={showWalkIn}
        onClose={() => setShowWalkIn(false)}
        onSuccess={loadBookings}
      />
    </div>
  )
}
