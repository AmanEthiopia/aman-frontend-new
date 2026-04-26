"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Search,
  Loader2,
  Building2,
  UtensilsCrossed,
  Car,
  Map,
  MessageSquare,
  Phone,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
  type NormalizedBooking,
  type BookingStatus,
  type BookingServiceType,
} from "@/lib/api/bookings"

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
}

const serviceIcons: Record<BookingServiceType, typeof Building2> = {
  hotel:      Building2,
  restaurant: UtensilsCrossed,
  trip:       Map,
  driver:     Car,
}

const serviceLabels: Record<BookingServiceType, string> = {
  hotel:      "Hotel",
  restaurant: "Restaurant",
  trip:       "Trip",
  driver:     "Driver",
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

async function confirmBooking(b: NormalizedBooking): Promise<void> {
  if (b.service_type === "hotel")      await confirmHotelBooking(b.id)
  else if (b.service_type === "restaurant") await confirmRestaurantReservation(b.id)
  else if (b.service_type === "trip")  await confirmPackageBooking(b.id)
  else if (b.service_type === "driver") await confirmDriverBooking(b.id)
}

async function rejectBooking(b: NormalizedBooking, reason?: string): Promise<void> {
  if (b.service_type === "hotel")      await rejectHotelBooking(b.id, reason)
  else if (b.service_type === "restaurant") await rejectRestaurantReservation(b.id, reason)
  else if (b.service_type === "trip")  await rejectPackageBooking(b.id, reason)
  else if (b.service_type === "driver") await rejectDriverBooking(b.id, reason)
}

// ============================================================================
// Booking Detail Modal
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
  onConfirm: () => void
  onReject: (reason?: string) => void
  isLoading: boolean
}) {
  const [rejectReason, setRejectReason] = useState("")
  const [showRejectForm, setShowRejectForm] = useState(false)

  if (!booking) return null
  const status = statusConfig[booking.status] ?? statusConfig.pending
  const Icon = serviceIcons[booking.service_type]

  const handleClose = () => {
    setShowRejectForm(false)
    setRejectReason("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {serviceLabels[booking.service_type]} Booking — {booking.booking_number}
          </DialogTitle>
          <DialogDescription>Review the booking details and respond to the guest</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-3">
          {/* Status */}
          <div className="flex items-center gap-2">
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>

          {/* Guest */}
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback>{booking.guest_name.slice(0, 2).toUpperCase()}</AvatarFallback>
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
                {Number(booking.total_price) > 0 ? `$${Number(booking.total_price).toLocaleString()}` : "Free / TBD"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Booked</p>
              <p className="font-medium">{timeAgo(booking.created_at)}</p>
            </div>
          </div>

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

        <DialogFooter className="gap-2">
          {booking.status === "pending" && !showRejectForm && (
            <>
              <Button variant="outline" onClick={() => setShowRejectForm(true)} disabled={isLoading}>
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button onClick={onConfirm} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                Confirm
              </Button>
            </>
          )}
          {booking.status === "pending" && showRejectForm && (
            <>
              <Button variant="ghost" onClick={() => setShowRejectForm(false)} disabled={isLoading}>Back</Button>
              <Button variant="destructive" onClick={() => onReject(rejectReason)} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Rejection
              </Button>
            </>
          )}
          {booking.status !== "pending" && (
            <Button variant="outline" onClick={handleClose}>Close</Button>
          )}
        </DialogFooter>
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

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarFallback>{booking.guest_name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold">{booking.guest_name}</span>
                <Badge variant={status.variant} className="text-xs">{status.label}</Badge>
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
                  {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <p className="font-bold">
                {Number(booking.total_price) > 0 ? `$${Number(booking.total_price).toLocaleString()}` : "Free"}
              </p>
              <p className="text-xs text-muted-foreground">{timeAgo(booking.created_at)}</p>
            </div>

            {booking.status === "pending" ? (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onReject} disabled={isLoading}>
                  <XCircle className="mr-1 h-4 w-4" />
                  Reject
                </Button>
                <Button size="sm" onClick={onConfirm} disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-1 h-4 w-4" />}
                  Confirm
                </Button>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onViewDetails}>View Details</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {booking.guest_phone && (
                    <DropdownMenuItem>
                      <Phone className="mr-2 h-4 w-4" />
                      Call Guest
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message Guest
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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
  const [bookings, setBookings] = useState<NormalizedBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<NormalizedBooking | null>(null)
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
  const past      = filtered.filter((b) => ["completed", "cancelled", "rejected", "no_show"].includes(b.status))

  const handleConfirm = async (booking: NormalizedBooking) => {
    setActionLoading(booking.id)
    try {
      await confirmBooking(booking)
      toast.success("Booking confirmed")
      await loadBookings()
    } catch {
      toast.error("Failed to confirm booking")
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bookings</h1>
          <p className="text-muted-foreground">Manage reservations across all your services</p>
        </div>
        <Button variant="outline" onClick={loadBookings}>
          <Clock className="mr-2 h-4 w-4" />
          Refresh
        </Button>
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
                onViewDetails={() => setSelectedBooking(b)}
                onConfirm={() => handleConfirm(b)}
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
                onViewDetails={() => setSelectedBooking(b)}
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
                onViewDetails={() => setSelectedBooking(b)}
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
        onConfirm={() => selectedBooking && handleConfirm(selectedBooking)}
        onReject={(reason) => selectedBooking && handleReject(selectedBooking, reason)}
        isLoading={actionLoading === selectedBooking?.id}
      />
    </div>
  )
}
