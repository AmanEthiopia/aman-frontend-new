"use client"

import { useState, useMemo } from "react"
import {
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Search,
  Filter,
  Phone,
  MessageSquare,
  Download,
  Loader2,
  Building2,
  UtensilsCrossed,
  Car,
  Map,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useProviderBookings, useMyProperties } from "@/lib/hooks/use-provider"
import * as providerAPI from "@/lib/api/provider"
import type { ProviderBooking, PropertyCategory } from "@/lib/api/provider"

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-500", badge: "secondary" as const },
  confirmed: { label: "Confirmed", color: "bg-green-500", badge: "default" as const },
  cancelled: { label: "Cancelled", color: "bg-red-500", badge: "destructive" as const },
  completed: { label: "Completed", color: "bg-gray-500", badge: "outline" as const },
}

const propertyTypeIcons: Record<PropertyCategory, typeof Building2> = {
  hotel: Building2,
  restaurant: UtensilsCrossed,
  driver: Car,
  trip: Map,
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return "Just now"
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays === 1) return "1 day ago"
  return `${diffDays} days ago`
}

function BookingDetailModal({
  booking,
  open,
  onClose,
  onAccept,
  onDecline,
  isLoading,
}: {
  booking: ProviderBooking | null
  open: boolean
  onClose: () => void
  onAccept: () => void
  onDecline: (reason?: string) => void
  isLoading: boolean
}) {
  const [declineReason, setDeclineReason] = useState("")
  const [showDeclineForm, setShowDeclineForm] = useState(false)

  if (!booking) return null

  const checkIn = new Date(booking.check_in)
  const checkOut = booking.check_out ? new Date(booking.check_out) : null
  const nights = checkOut
    ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    : 1

  const handleClose = () => {
    setShowDeclineForm(false)
    setDeclineReason("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Booking Request</DialogTitle>
          <DialogDescription>Review the booking details and respond to the guest</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Guest Info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={booking.guest_avatar || "/placeholder.svg"} />
              <AvatarFallback>{booking.guest_name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{booking.guest_name}</h3>
              <p className="text-sm text-muted-foreground">{booking.guest_email}</p>
              {booking.guest_phone && (
                <p className="text-sm text-muted-foreground">{booking.guest_phone}</p>
              )}
            </div>
          </div>

          {/* Booking Details */}
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4">
            <div>
              <p className="text-sm text-muted-foreground">Check-in</p>
              <p className="font-medium">
                {checkIn.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </p>
            </div>
            {checkOut && (
              <div>
                <p className="text-sm text-muted-foreground">Check-out</p>
                <p className="font-medium">
                  {checkOut.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Property</p>
              <p className="font-medium">{booking.property_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Guests</p>
              <p className="font-medium">
                {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
              </p>
            </div>
            {checkOut && (
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">
                  {nights} {nights === 1 ? "night" : "nights"}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-lg font-bold">${booking.total_price.toLocaleString()}</p>
            </div>
          </div>

          {/* Special Requests */}
          {booking.special_requests && (
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">Special Requests</p>
              <p className="mt-1 text-sm text-muted-foreground">{booking.special_requests}</p>
            </div>
          )}

          {/* Decline Form */}
          {showDeclineForm && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Reason for declining (optional)</p>
              <Textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Let the guest know why you can't accept this booking..."
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          {booking.status === "pending" && (
            <>
              {showDeclineForm ? (
                <>
                  <Button variant="ghost" onClick={() => setShowDeclineForm(false)} disabled={isLoading}>
                    Back
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => onDecline(declineReason)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Confirm Decline
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setShowDeclineForm(true)} disabled={isLoading}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Decline
                  </Button>
                  <Button onClick={onAccept} disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                    )}
                    Accept Booking
                  </Button>
                </>
              )}
            </>
          )}
          {booking.status !== "pending" && (
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function BookingRow({
  booking,
  onViewDetails,
  onAccept,
  onDecline,
  isLoading,
}: {
  booking: ProviderBooking
  onViewDetails: () => void
  onAccept: () => void
  onDecline: () => void
  isLoading: boolean
}) {
  const checkIn = new Date(booking.check_in)
  const checkOut = booking.check_out ? new Date(booking.check_out) : null
  const nights = checkOut
    ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    : 1
  const status = statusConfig[booking.status]
  const PropertyIcon = propertyTypeIcons[booking.property_type]

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={booking.guest_avatar || "/placeholder.svg"} />
              <AvatarFallback>{booking.guest_name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{booking.guest_name}</h4>
                <Badge variant={status.badge}>{status.label}</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <PropertyIcon className="h-4 w-4" />
                <span>{booking.property_name}</span>
                {booking.room_type && (
                  <>
                    <span className="text-muted-foreground/50">|</span>
                    <span>{booking.room_type}</span>
                  </>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {checkIn.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  {checkOut && (
                    <> - {checkOut.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</>
                  )}
                </span>
                {checkOut && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {nights} {nights === 1 ? "night" : "nights"}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-lg font-bold">${booking.total_price.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{formatTimeAgo(booking.created_at)}</p>
            </div>

            {booking.status === "pending" ? (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onDecline} disabled={isLoading}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Decline
                </Button>
                <Button size="sm" onClick={onAccept} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  Accept
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
                  <DropdownMenuItem>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message Guest
                  </DropdownMenuItem>
                  {booking.guest_phone && (
                    <DropdownMenuItem>
                      <Phone className="mr-2 h-4 w-4" />
                      Call Guest
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Download Receipt
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

export default function ProviderBookingsPage() {
  const [selectedBooking, setSelectedBooking] = useState<ProviderBooking | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | ProviderBooking["status"]>("all")
  const [propertyFilter, setPropertyFilter] = useState<string>("all")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Fetch bookings from API
  const { bookings, isLoading, refresh } = useProviderBookings()
  const { properties } = useMyProperties()

  // Filter bookings based on search and filters
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          booking.guest_name.toLowerCase().includes(query) ||
          booking.guest_email.toLowerCase().includes(query) ||
          booking.property_name.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Status filter
      if (statusFilter !== "all" && booking.status !== statusFilter) {
        return false
      }

      // Property filter
      if (propertyFilter !== "all" && booking.property_id !== propertyFilter) {
        return false
      }

      return true
    })
  }, [bookings, searchQuery, statusFilter, propertyFilter])

  // Group bookings by status
  const pendingBookings = filteredBookings.filter((b) => b.status === "pending")
  const confirmedBookings = filteredBookings.filter((b) => b.status === "confirmed")
  const pastBookings = filteredBookings.filter((b) => b.status === "completed" || b.status === "cancelled")

  const handleAccept = async (id: string) => {
    setActionLoading(id)
    try {
      await providerAPI.acceptBooking(id)
      toast.success("Booking accepted successfully")
      refresh()
    } catch (error) {
      console.error("[v0] Failed to accept booking:", error)
      toast.error("Failed to accept booking")
    } finally {
      setActionLoading(null)
      setSelectedBooking(null)
    }
  }

  const handleDecline = async (id: string, reason?: string) => {
    setActionLoading(id)
    try {
      await providerAPI.declineBooking(id, reason)
      toast.success("Booking declined")
      refresh()
    } catch (error) {
      console.error("[v0] Failed to decline booking:", error)
      toast.error("Failed to decline booking")
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
          <p className="text-muted-foreground">Manage reservations and guest requests</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by guest name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={propertyFilter} onValueChange={setPropertyFilter}>
          <SelectTrigger className="w-[200px]">
            <Building2 className="mr-2 h-4 w-4" />
            <SelectValue placeholder="All Properties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            {properties.map((property) => (
              <SelectItem key={property.id} value={property.id}>
                {property.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => refresh()}>
          <Filter className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            Pending
            {pendingBookings.length > 0 && <Badge variant="destructive">{pendingBookings.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="confirmed" className="gap-2">
            Confirmed
            {confirmedBookings.length > 0 && <Badge variant="secondary">{confirmedBookings.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-3">
          {pendingBookings.length > 0 ? (
            pendingBookings.map((booking) => (
              <BookingRow
                key={booking.id}
                booking={booking}
                onViewDetails={() => setSelectedBooking(booking)}
                onAccept={() => handleAccept(booking.id)}
                onDecline={() => handleDecline(booking.id)}
                isLoading={actionLoading === booking.id}
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
          {confirmedBookings.length > 0 ? (
            confirmedBookings.map((booking) => (
              <BookingRow
                key={booking.id}
                booking={booking}
                onViewDetails={() => setSelectedBooking(booking)}
                onAccept={() => {}}
                onDecline={() => {}}
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
          {pastBookings.length > 0 ? (
            pastBookings.map((booking) => (
              <BookingRow
                key={booking.id}
                booking={booking}
                onViewDetails={() => setSelectedBooking(booking)}
                onAccept={() => {}}
                onDecline={() => {}}
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
        onAccept={() => selectedBooking && handleAccept(selectedBooking.id)}
        onDecline={(reason) => selectedBooking && handleDecline(selectedBooking.id, reason)}
        isLoading={actionLoading === selectedBooking?.id}
      />
    </div>
  )
}
