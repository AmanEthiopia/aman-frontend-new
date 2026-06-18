"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { getMediaUrl } from "@/lib/utils/media"
import {
  Calendar,
  MapPin,
  Clock,
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
  Pencil,
  Minus,
  Plus,
  BedDouble,
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAllBookings, useCancelHotelBooking, useCancelRestaurantReservation, useCancelPackageBooking } from "@/lib/hooks/use-bookings"
import type { Booking, BookingStatus, HotelBookingListItem, RestaurantReservationListItem, PackageBooking, TransportBooking } from "@/lib/api/bookings"
import { modifyHotelBooking, getHotelBookingById, cancelDriverBooking, type ModifyHotelBookingPayload } from "@/lib/api/bookings"
import { getHotelById, getHotelRooms } from "@/lib/api/hotels"
import type { Room } from "@/lib/types"
import { getMyGuideBookings, cancelGuideBooking, modifyGuideBooking, type GuideBooking, type ModifyGuideBookingPayload, SERVICE_TYPE_LABELS } from "@/lib/api/guides"
import { ContactDialog } from "@/components/messaging/contact-dialog"
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
  expired: {
    label: "Expired — No Response",
    icon: AlertCircle,
    variant: "outline",
    color: "text-amber-600",
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
      return new Date((booking as any).trip_date || (booking as any).pickup_date || Date.now())
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
      start.setDate(start.getDate() + (booking.package?.duration_days ?? 1))
      return start
    }
    case "transport":
      return new Date((booking as any).trip_date || (booking as any).pickup_date || Date.now())
    default:
      return new Date()
  }
}

// ── Modify Hotel Booking Dialog ────────────────────────────────────────────────
function ModifyHotelBookingDialog({
  booking,
  open,
  onClose,
  onSuccess,
}: {
  booking: HotelBookingListItem
  open: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomsLoading, setRoomsLoading] = useState(false)
  const [selectedRooms, setSelectedRooms] = useState<Record<string, number>>({})
  const [form, setForm] = useState({
    check_in_date: booking.check_in_date,
    check_out_date: booking.check_out_date,
    num_adults: booking.num_adults,
    num_children: booking.num_children,
    special_requests: booking.special_requests ?? "",
  })

  // Load the hotel's rooms (capacity/price/availability) + prefill current selection.
  useEffect(() => {
    if (!open) return
    let active = true
    setRoomsLoading(true)
    ;(async () => {
      try {
        const detail = await getHotelBookingById(booking.id)
        const hotelId = (detail as any).hotel?.id
        const prefill: Record<string, number> = {}
        for (const r of (detail as any).rooms ?? []) {
          if (r.room_id) prefill[r.room_id] = r.quantity
        }
        let roomList: Room[] = []
        if (hotelId) {
          roomList = await getHotelRooms(hotelId, { check_in: form.check_in_date, check_out: form.check_out_date })
        } else if (booking.hotel_slug) {
          const hotel = await getHotelById(booking.hotel_slug)
          roomList = await getHotelRooms(hotel.id, { check_in: form.check_in_date, check_out: form.check_out_date })
        }
        if (!active) return
        setRooms(roomList)
        setSelectedRooms(prefill)
      } catch {
        if (active) setRooms([])
      } finally {
        if (active) setRoomsLoading(false)
      }
    })()
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, booking.id])

  // Re-fetch availability when dates change.
  useEffect(() => {
    if (!open || rooms.length === 0) return
    if (!form.check_in_date || !form.check_out_date || form.check_out_date <= form.check_in_date) return
    const hotelId = (rooms[0] as any)?.hotel_id ?? (rooms[0] as any)?.hotel
    if (!hotelId) return
    getHotelRooms(hotelId, { check_in: form.check_in_date, check_out: form.check_out_date })
      .then(setRooms)
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.check_in_date, form.check_out_date])

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
    .filter(([, q]) => q > 0)
    .map(([room_id, quantity]) => ({ room_id, quantity }))

  const totalNights = (() => {
    const diff = new Date(form.check_out_date).getTime() - new Date(form.check_in_date).getTime()
    return Math.max(0, Math.floor(diff / 86400000))
  })()
  const totalGuests = Number(form.num_adults) + Number(form.num_children)
  const totalRoomCount = roomsPayload.reduce((s, { quantity }) => s + quantity, 0)
  const totalCapacity = roomsPayload.reduce((s, { room_id, quantity }) => {
    const room = rooms.find((r) => r.id === room_id)
    return s + (room ? ((room.max_adults ?? 1) + (room.max_children ?? 0)) * quantity : 0)
  }, 0)
  const tooManyRooms = totalRoomCount > 0 && totalRoomCount > totalGuests
  const capacityWarning = totalCapacity > 0 && totalGuests > totalCapacity
  const estimatedTotal = roomsPayload.reduce((s, { room_id, quantity }) => {
    const room = rooms.find((r) => r.id === room_id)
    const price = room ? (room.base_price !== undefined ? parseFloat(String(room.base_price)) : (room.price_per_night ?? 0)) : 0
    return s + price * quantity * totalNights
  }, 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.check_in_date >= form.check_out_date) {
      toast.error("Check-out date must be after check-in date")
      return
    }
    if (roomsPayload.length === 0) {
      toast.error("Please keep at least one room selected.")
      return
    }
    if (tooManyRooms) {
      toast.error(`You have ${totalRoomCount} room(s) for ${totalGuests} guest(s). Each room needs at least one guest — reduce rooms or add guests.`)
      return
    }
    if (capacityWarning) {
      toast.error(`Your ${totalGuests} guest(s) exceed the selected room(s)' capacity (${totalCapacity}). Add a room before adding more guests.`)
      return
    }
    setSaving(true)
    try {
      const payload: ModifyHotelBookingPayload = {
        check_in_date: form.check_in_date,
        check_out_date: form.check_out_date,
        num_adults: form.num_adults,
        num_children: form.num_children,
        special_requests: form.special_requests,
        rooms: roomsPayload,
      }
      await modifyHotelBooking(booking.id, payload)
      toast.success("Booking request updated — waiting for provider confirmation")
      onSuccess()
      onClose()
    } catch (err: any) {
      toast.error(err?.message || "Failed to update booking")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modify Booking Request</DialogTitle>
          <DialogDescription>
            Update your request for {booking.hotel_name}. The provider will be notified.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="check_in">Check-in</Label>
              <Input
                id="check_in"
                type="date"
                value={form.check_in_date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setForm((p) => ({ ...p, check_in_date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="check_out">Check-out</Label>
              <Input
                id="check_out"
                type="date"
                value={form.check_out_date}
                min={form.check_in_date || new Date().toISOString().split("T")[0]}
                onChange={(e) => setForm((p) => ({ ...p, check_out_date: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="adults">Adults</Label>
              <Input
                id="adults"
                type="number"
                min={1}
                value={form.num_adults}
                onChange={(e) => setForm((p) => ({ ...p, num_adults: parseInt(e.target.value) || 1 }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="children">Children</Label>
              <Input
                id="children"
                type="number"
                min={0}
                value={form.num_children}
                onChange={(e) => setForm((p) => ({ ...p, num_children: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
          {/* Rooms */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BedDouble className="h-4 w-4 text-primary" />
              <Label>Rooms</Label>
              {roomsLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            </div>
            <div className="space-y-2">
              {rooms.map((room) => {
                const qty = selectedRooms[room.id] ?? 0
                const cap = (room.max_adults ?? 1) + (room.max_children ?? 0)
                const maxQty = room.available_units ?? room.total_units ?? 99
                const price = room.base_price !== undefined ? parseFloat(String(room.base_price)) : (room.price_per_night ?? 0)
                return (
                  <div key={room.id} className={`flex items-center justify-between gap-3 rounded-lg border p-3 ${qty > 0 ? "border-primary bg-primary/5" : "border-border"}`}>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{room.name}</p>
                      <p className="text-xs text-muted-foreground">Up to {cap} guest{cap !== 1 ? "s" : ""} · ${price}/night</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button type="button" onClick={() => setRoomQty(room.id, -1)} disabled={qty === 0}
                        className="flex h-7 w-7 items-center justify-center rounded-full border transition-colors hover:bg-muted disabled:opacity-40">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-5 text-center text-sm font-semibold">{qty}</span>
                      <button type="button" onClick={() => setRoomQty(room.id, 1)} disabled={qty >= maxQty}
                        className="flex h-7 w-7 items-center justify-center rounded-full border bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
              {!roomsLoading && rooms.length === 0 && (
                <p className="text-xs text-muted-foreground">Couldn't load rooms. You can still update dates and guests.</p>
              )}
            </div>

            {tooManyRooms && (
              <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                <p>{totalRoomCount} room(s) for {totalGuests} guest(s) — each room needs at least one guest. Remove a room or add guests.</p>
              </div>
            )}
            {capacityWarning && (
              <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                <p>Your {totalGuests} guest(s) exceed the selected room(s)' capacity ({totalCapacity}). Add another room first.</p>
              </div>
            )}
            {estimatedTotal > 0 && (
              <div className="flex items-center justify-between border-t pt-2 text-sm">
                <span className="text-muted-foreground">{totalNights} night{totalNights !== 1 ? "s" : ""} · {totalRoomCount} room{totalRoomCount !== 1 ? "s" : ""}</span>
                <span className="font-bold">${estimatedTotal.toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="requests">Special Requests</Label>
            <Textarea
              id="requests"
              rows={3}
              placeholder="Any special requirements or notes..."
              value={form.special_requests}
              onChange={(e) => setForm((p) => ({ ...p, special_requests: e.target.value }))}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving || tooManyRooms || capacityWarning || roomsPayload.length === 0}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Resend Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Modify Guide Booking Dialog ────────────────────────────────────────────────
function ModifyGuideBookingDialog({
  booking,
  open,
  onClose,
  onSuccess,
}: {
  booking: GuideBooking
  open: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    booking_date: booking.booking_date,
    start_time: booking.start_time ?? "",
    hours_requested: booking.hours_requested ? String(booking.hours_requested) : "",
    num_adults: booking.num_adults,
    num_children: booking.num_children,
    special_requests: booking.special_requests ?? "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload: ModifyGuideBookingPayload = {
        booking_date: form.booking_date,
        start_time: form.start_time || null,
        hours_requested: form.hours_requested ? parseFloat(form.hours_requested) : null,
        num_adults: form.num_adults,
        num_children: form.num_children,
        special_requests: form.special_requests,
      }
      await modifyGuideBooking(booking.id, payload)
      toast.success("Booking request updated — waiting for guide confirmation")
      onSuccess()
      onClose()
    } catch (err: any) {
      toast.error(err?.message || "Failed to update booking")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modify Booking Request</DialogTitle>
          <DialogDescription>
            Update your request for {booking.guide.title}. The guide will be notified.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="booking_date">Date</Label>
              <Input
                id="booking_date"
                type="date"
                value={form.booking_date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setForm((p) => ({ ...p, booking_date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="time"
                value={form.start_time}
                onChange={(e) => setForm((p) => ({ ...p, start_time: e.target.value }))}
              />
            </div>
          </div>
          {booking.guide.pricing_type === "hourly" && (
            <div className="space-y-1.5">
              <Label htmlFor="hours">Hours Requested</Label>
              <Input
                id="hours"
                type="number"
                min={1}
                step={0.5}
                value={form.hours_requested}
                onChange={(e) => setForm((p) => ({ ...p, hours_requested: e.target.value }))}
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="guide_adults">Adults</Label>
              <Input
                id="guide_adults"
                type="number"
                min={1}
                value={form.num_adults}
                onChange={(e) => setForm((p) => ({ ...p, num_adults: parseInt(e.target.value) || 1 }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="guide_children">Children</Label>
              <Input
                id="guide_children"
                type="number"
                min={0}
                value={form.num_children}
                onChange={(e) => setForm((p) => ({ ...p, num_children: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="guide_requests">Special Requests</Label>
            <Textarea
              id="guide_requests"
              rows={3}
              placeholder="Any special requirements or notes..."
              value={form.special_requests}
              onChange={(e) => setForm((p) => ({ ...p, special_requests: e.target.value }))}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Resend Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function HotelBookingCard({ booking, onCancel, onModified }: { booking: HotelBookingListItem; onCancel: () => void; onModified: () => void }) {
  const status = statusConfig[booking.status]
  const StatusIcon = status.icon
  const checkIn = new Date(booking.check_in_date)
  const checkOut = new Date(booking.check_out_date)
  const isPast = checkOut < new Date()
  const [showModify, setShowModify] = useState(false)

  return (
    <Card className={isPast ? "opacity-75" : ""}>
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="relative h-32 w-full sm:h-auto sm:w-40">
            <Image
              src={getMediaUrl(booking.hotel_photo) || "/placeholder.svg?height=160&width=160"}
              alt={booking.hotel_name}
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
                  <h3 className="font-semibold">{booking.hotel_name}</h3>
                  {booking.hotel_city && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {booking.hotel_city}
                    </div>
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

              {(booking.room_summary?.length ?? 0) > 0 && (
                <div className="mt-2 text-sm text-muted-foreground space-y-0.5">
                  {booking.room_summary.map((room, i) => (
                    <div key={i}>{room.quantity}× {room.room_name} ({room.bed_type})</div>
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
                <p className="text-lg font-bold">ETB {parseFloat(booking.total_price).toLocaleString()}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/bookings/hotel/${booking.id}`}>
                  <Button variant="outline" size="sm">
                    <Building2 className="mr-2 h-4 w-4" />
                    View Booking
                  </Button>
                </Link>
                {booking.status === "pending" && !isPast && (
                  <Button variant="outline" size="sm" onClick={() => setShowModify(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Modify
                  </Button>
                )}
                {booking.hotel_provider_id && (
                  <ContactDialog
                    recipientId={booking.hotel_provider_id}
                    recipientName={booking.hotel_name}
                    relatedToType="hotel"
                    relatedToId={booking.id}
                    relatedToName={booking.hotel_name}
                  >
                    <Button variant="outline" size="sm">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {booking.status === "confirmed" ? "Contact Host" : "Message"}
                    </Button>
                  </ContactDialog>
                )}
                {(booking.status === "pending" || booking.status === "confirmed") && !isPast && (
                  <Button variant="ghost" size="sm" onClick={onCancel} className="text-destructive hover:text-destructive">
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      {showModify && (
        <ModifyHotelBookingDialog
          booking={booking}
          open={showModify}
          onClose={() => setShowModify(false)}
          onSuccess={onModified}
        />
      )}
    </Card>
  )
}

function RestaurantReservationCard({ booking, onCancel }: { booking: RestaurantReservationListItem; onCancel: () => void }) {
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
              src={getMediaUrl(booking.restaurant_photo) || "/placeholder.svg?height=160&width=160"}
              alt={booking.restaurant_name}
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
                  <h3 className="font-semibold">{booking.restaurant_name}</h3>
                  {booking.restaurant_city && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {booking.restaurant_city}
                    </div>
                  )}
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
                {parseFloat(booking.total_price ?? "0") > 0 ? (
                  <>
                    <span className="text-sm text-muted-foreground">Deposit</span>
                    <p className="text-lg font-bold">{booking.currency} {parseFloat(booking.total_price!).toLocaleString()}</p>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">No deposit required</span>
                )}
              </div>
              <div className="flex gap-2">
                <Link href={`/bookings/restaurant/${booking.id}`}>
                  <Button variant="outline" size="sm">
                    <Utensils className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </Link>
                {(booking.status === "pending" || booking.status === "confirmed") && !isPast && (
                  <Button variant="ghost" size="sm" onClick={onCancel} className="text-destructive hover:text-destructive">
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
  endDate.setDate(endDate.getDate() + (booking.package?.duration_days ?? 1) - 1)
  const isPast = endDate < new Date()

  const packageTitle = booking.package?.title ?? `Booking #${booking.booking_number}`
  const packageCover = booking.package?.cover_photo_url

  return (
    <Card className={isPast ? "opacity-75" : ""}>
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="relative h-32 w-full sm:h-auto sm:w-40">
            <Image
              src={getMediaUrl(packageCover) || "/placeholder.svg?height=160&width=160"}
              alt={packageTitle}
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
                  <h3 className="font-semibold">{packageTitle}</h3>
                  {booking.package?.nickname && (
                    <span className="text-sm text-muted-foreground">{booking.package.nickname}</span>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={status.variant} className="gap-1">
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </Badge>
                  {(booking as any).payment_required && (
                    <Badge variant={(booking as any).payment_status === "paid" ? "default" : "secondary"} className="gap-1">
                      <CreditCard className="h-3 w-3" />
                      {(booking as any).payment_status === "paid" ? "Paid" : "Payment Required"}
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
                  <span>{booking.package?.duration_days ?? "—"} days</span>
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
              <div className="flex flex-wrap gap-2">
                {booking.package?.slug && (
                  <Link href={`/experiences/${booking.package.slug}`}>
                    <Button variant="outline" size="sm">
                      View Itinerary
                    </Button>
                  </Link>
                )}
                {booking.package?.provider_id && (
                  <ContactDialog
                    recipientId={booking.package.provider_id}
                    recipientName={packageTitle}
                    relatedToType="experience"
                    relatedToId={booking.id}
                    relatedToName={packageTitle}
                  >
                    <Button variant="outline" size="sm">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {booking.status === "confirmed" ? "Contact Organizer" : "Message"}
                    </Button>
                  </ContactDialog>
                )}
                {(booking.status === "pending" || booking.status === "confirmed") && !isPast && (
                  <Button variant="ghost" size="sm" onClick={onCancel} className="text-destructive hover:text-destructive">
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

function TransportBookingCard({ booking, onCancel }: { booking: TransportBooking; onCancel: () => void }) {
  const b = booking as any
  const status = statusConfig[booking.status]
  const StatusIcon = status.icon
  const tripDate = new Date(b.trip_date || b.pickup_date || Date.now())
  const isPast = tripDate < new Date(new Date().toDateString())
  const photo = getMediaUrl(b.driver_photo)

  return (
    <Card className={isPast ? "opacity-75" : ""}>
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="relative h-32 w-full sm:h-auto sm:w-40 shrink-0">
            {photo ? (
              <Image src={photo} alt={b.driver_name || "Driver"} fill className="object-cover sm:rounded-l-lg" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-purple-50 sm:rounded-l-lg">
                <Car className="h-12 w-12 text-purple-400" />
              </div>
            )}
            <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-purple-500 px-2 py-0.5 text-xs font-medium text-white">
              <Car className="h-3 w-3" />
              Transport
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-between p-4">
            <div>
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{b.driver_name || "Driver"}</h3>
                  {b.driver_vehicle_type && (
                    <span className="text-sm text-muted-foreground">{b.driver_vehicle_type}</span>
                  )}
                </div>
                <Badge variant={status.variant} className="gap-1">
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </Badge>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{tripDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                </div>
                {b.pickup_time && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{b.pickup_time}</span>
                  </div>
                )}
              </div>

              {(b.pickup_location || b.dropoff_location) && (
                <div className="mt-2 rounded-md bg-muted/50 p-2 text-sm">
                  {b.pickup_location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <span>{b.pickup_location}</span>
                    </div>
                  )}
                  {b.dropoff_location && (
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-red-600" />
                      <span>{b.dropoff_location}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <div>
                {b.estimated_price ? (
                  <>
                    <span className="text-sm text-muted-foreground">Estimated</span>
                    <p className="text-lg font-bold">{(b as any).currency ?? "ETB"} {Number(b.estimated_price).toLocaleString()}</p>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">Price TBD</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {b.provider_id && (
                  <ContactDialog
                    recipientId={b.provider_id}
                    recipientName={b.driver_name || "Driver"}
                    relatedToType="general"
                    relatedToId={booking.id}
                    relatedToName={b.driver_name || "Driver"}
                  >
                    <Button variant="outline" size="sm">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {booking.status === "confirmed" ? "Contact Driver" : "Message"}
                    </Button>
                  </ContactDialog>
                )}
                {booking.status === "confirmed" && !isPast && b.guest_phone && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`tel:${b.guest_phone}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      Call Driver
                    </a>
                  </Button>
                )}
                {(booking.status === "pending" || booking.status === "confirmed") && !isPast && (
                  <Button variant="ghost" size="sm" onClick={onCancel} className="text-destructive hover:text-destructive">
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

function GuideBookingCard({ booking, onCancel, onModified }: { booking: GuideBooking; onCancel: () => void; onModified: () => void }) {
  const bookingDate = new Date(booking.booking_date)
  const isPast = bookingDate < new Date()
  const [showModify, setShowModify] = useState(false)

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    confirmed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    expired: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  }
  const statusIcons: Record<string, typeof Clock> = {
    pending: Clock,
    confirmed: CheckCircle2,
    rejected: XCircle,
    cancelled: Ban,
    completed: CheckCircle2,
    expired: AlertCircle,
  }
  const StatusIcon = statusIcons[booking.status] || Clock

  return (
    <Card className={isPast ? "opacity-75" : ""}>
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="relative h-32 w-full sm:h-auto sm:w-40">
            {booking.guide.photo_url ? (
              <Image
                src={getMediaUrl(booking.guide.photo_url) || "/placeholder.svg?height=160&width=160"}
                alt={booking.guide.title}
                fill
                className="object-cover sm:rounded-l-lg"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-teal-50 dark:bg-teal-950/20 sm:rounded-l-lg">
                <Compass className="h-12 w-12 text-teal-400" />
              </div>
            )}
            <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-teal-600 px-2 py-0.5 text-xs font-medium text-white">
              <Compass className="h-3 w-3" />
              Guide
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-between p-4">
            <div>
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{booking.guide.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {SERVICE_TYPE_LABELS[booking.guide.service_type as keyof typeof SERVICE_TYPE_LABELS]}
                  </p>
                </div>
                <Badge className={`gap-1 border-0 ${statusColors[booking.status] || statusColors.pending}`}>
                  <StatusIcon className="h-3 w-3" />
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Badge>
              </div>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {bookingDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                </span>
                {booking.start_time && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {booking.start_time}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {booking.num_adults} adult{booking.num_adults !== 1 ? "s" : ""}
                  {booking.num_children > 0 && `, ${booking.num_children} child${booking.num_children !== 1 ? "ren" : ""}`}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">{booking.booking_number}</span>
                {booking.hours_requested && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {booking.hours_requested} hrs
                  </span>
                )}
              </div>

              {booking.special_requests && (
                <div className="mt-2 rounded-md bg-muted/50 p-2 text-sm">
                  <p className="font-medium text-muted-foreground">Special Requests:</p>
                  <p className="mt-0.5">{booking.special_requests}</p>
                </div>
              )}

              {booking.cancellation_reason && (
                <div className="mt-2 rounded-md bg-destructive/5 p-2 text-sm text-destructive">
                  <p className="font-medium">Reason: {booking.cancellation_reason}</p>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <div>
                <span className="text-sm text-muted-foreground">Total</span>
                <p className="text-lg font-bold">
                  ETB {parseFloat(booking.total_price).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/guides/${booking.guide.slug}`}>
                  <Button variant="outline" size="sm">
                    <Compass className="mr-2 h-4 w-4" />
                    View Guide
                  </Button>
                </Link>
                {booking.status === "pending" && !isPast && (
                  <Button variant="outline" size="sm" onClick={() => setShowModify(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Modify
                  </Button>
                )}
                {booking.guide.provider_id && (
                  <ContactDialog
                    recipientId={booking.guide.provider_id}
                    recipientName={booking.guide.title}
                    relatedToType="guide"
                    relatedToId={booking.id}
                    relatedToName={booking.guide.title}
                  >
                    <Button variant="outline" size="sm">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {booking.status === "confirmed" ? "Contact Guide" : "Message"}
                    </Button>
                  </ContactDialog>
                )}
                {(booking.status === "pending" || booking.status === "confirmed") && !isPast && (
                  <Button variant="ghost" size="sm" onClick={onCancel} className="text-destructive hover:text-destructive">
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      {showModify && (
        <ModifyGuideBookingDialog
          booking={booking}
          open={showModify}
          onClose={() => setShowModify(false)}
          onSuccess={onModified}
        />
      )}
    </Card>
  )
}

function BookingCard({ booking, onCancel, onModified }: { booking: Booking; onCancel: () => void; onModified: () => void }) {
  switch (booking.type) {
    case "hotel":
      return <HotelBookingCard booking={booking as any} onCancel={onCancel} onModified={onModified} />
    case "restaurant":
      return <RestaurantReservationCard booking={booking as any} onCancel={onCancel} />
    case "package":
      return <PackageBookingCard booking={booking as any} onCancel={onCancel} />
    case "transport":
      return <TransportBookingCard booking={booking as any} onCancel={onCancel} />
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

  // Guide bookings state
  const [guideBookings, setGuideBookings] = useState<GuideBooking[]>([])
  const [guideBookingsLoading, setGuideBookingsLoading] = useState(true)
  const [guideCancelDialog, setGuideCancelDialog] = useState<{ open: boolean; booking: GuideBooking | null }>({ open: false, booking: null })
  const [guideCancelReason, setGuideCancelReason] = useState("")
  const [isCancellingGuide, setIsCancellingGuide] = useState(false)

  async function loadGuideBookings() {
    setGuideBookingsLoading(true)
    try {
      const data = await getMyGuideBookings()
      setGuideBookings(data)
    } catch {
      setGuideBookings([])
    } finally {
      setGuideBookingsLoading(false)
    }
  }

  useEffect(() => { loadGuideBookings() }, [])

  const handleCancelGuideBooking = async () => {
    if (!guideCancelDialog.booking) return
    setIsCancellingGuide(true)
    try {
      await cancelGuideBooking(guideCancelDialog.booking.id, guideCancelReason || undefined)
      setGuideBookings((prev) =>
        prev.map((b) =>
          b.id === guideCancelDialog.booking!.id ? { ...b, status: "cancelled" as const } : b
        )
      )
      toast.success("Guide booking cancelled")
      setGuideCancelDialog({ open: false, booking: null })
      setGuideCancelReason("")
    } catch {
      toast.error("Failed to cancel booking. Please try again.")
    } finally {
      setIsCancellingGuide(false)
    }
  }

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
        case "transport":
          await cancelDriverBooking(booking.id, cancelReason)
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
          <TabsTrigger value="guides" className="gap-2">
            Guides
            {guideBookings.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {guideBookings.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingBookings.length > 0 ? (
            upcomingBookings.map((booking: Booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={() => setCancelDialog({ open: true, booking })}
                onModified={() => mutate()}
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
                onModified={() => mutate()}
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
                onModified={() => mutate()}
              />
            ))
          ) : (
            <EmptyBookings type="past" />
          )}
        </TabsContent>

        <TabsContent value="guides" className="space-y-4">
          {guideBookingsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : guideBookings.length > 0 ? (
            guideBookings.map((booking) => (
              <GuideBookingCard
                key={booking.id}
                booking={booking}
                onCancel={() => setGuideCancelDialog({ open: true, booking })}
                onModified={loadGuideBookings}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16 text-center">
              <Compass className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="mb-2 text-lg font-semibold">No guide bookings yet</h3>
              <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                Book a local tour guide, driver, photographer, or interpreter for your Ethiopian adventure.
              </p>
              <Link href="/guides">
                <Button>Browse Guides</Button>
              </Link>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Cancel Hotel/Restaurant/Package Booking Dialog */}
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

      {/* Cancel Guide Booking Dialog */}
      <Dialog open={guideCancelDialog.open} onOpenChange={(open) => !open && setGuideCancelDialog({ open: false, booking: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Guide Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your booking with{" "}
              <span className="font-medium">{guideCancelDialog.booking?.guide.title}</span>?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Reason for cancellation (optional)"
              value={guideCancelReason}
              onChange={(e) => setGuideCancelReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGuideCancelDialog({ open: false, booking: null })}>
              Keep Booking
            </Button>
            <Button variant="destructive" onClick={handleCancelGuideBooking} disabled={isCancellingGuide}>
              {isCancellingGuide ? (
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
