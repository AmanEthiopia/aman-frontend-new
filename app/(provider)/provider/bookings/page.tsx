"use client"

import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"

interface ProviderBooking {
  id: string
  guestName: string
  guestAvatar?: string
  guestEmail: string
  guestPhone: string
  checkIn: string
  checkOut: string
  guests: number
  roomType: string
  totalPrice: number
  status: "pending" | "confirmed" | "cancelled" | "completed"
  requestedAt: string
  specialRequests?: string
}

// Mock bookings data
const mockProviderBookings: ProviderBooking[] = [
  {
    id: "bk-101",
    guestName: "Sarah Johnson",
    guestAvatar: "/diverse-user-avatars.png",
    guestEmail: "sarah@email.com",
    guestPhone: "+1 555-0123",
    checkIn: "2025-01-18",
    checkOut: "2025-01-21",
    guests: 2,
    roomType: "Deluxe Suite",
    totalPrice: 540,
    status: "pending",
    requestedAt: "2 hours ago",
    specialRequests: "Early check-in if possible, celebrating anniversary",
  },
  {
    id: "bk-102",
    guestName: "Michael Chen",
    guestEmail: "michael@email.com",
    guestPhone: "+1 555-0456",
    checkIn: "2025-01-20",
    checkOut: "2025-01-23",
    guests: 3,
    roomType: "Family Room",
    totalPrice: 680,
    status: "pending",
    requestedAt: "5 hours ago",
  },
  {
    id: "bk-103",
    guestName: "Emma Williams",
    guestEmail: "emma@email.com",
    guestPhone: "+1 555-0789",
    checkIn: "2025-01-22",
    checkOut: "2025-01-25",
    guests: 1,
    roomType: "Standard Room",
    totalPrice: 320,
    status: "pending",
    requestedAt: "1 day ago",
  },
  {
    id: "bk-104",
    guestName: "David Brown",
    guestEmail: "david@email.com",
    guestPhone: "+1 555-0111",
    checkIn: "2025-01-15",
    checkOut: "2025-01-17",
    guests: 2,
    roomType: "Deluxe Suite",
    totalPrice: 360,
    status: "confirmed",
    requestedAt: "3 days ago",
  },
  {
    id: "bk-105",
    guestName: "Olivia Martinez",
    guestEmail: "olivia@email.com",
    guestPhone: "+1 555-0222",
    checkIn: "2025-01-10",
    checkOut: "2025-01-14",
    guests: 4,
    roomType: "Executive Suite",
    totalPrice: 920,
    status: "completed",
    requestedAt: "1 week ago",
  },
]

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-500", badge: "secondary" as const },
  confirmed: { label: "Confirmed", color: "bg-green-500", badge: "default" as const },
  cancelled: { label: "Cancelled", color: "bg-red-500", badge: "destructive" as const },
  completed: { label: "Completed", color: "bg-gray-500", badge: "outline" as const },
}

function BookingDetailModal({
  booking,
  open,
  onClose,
  onAccept,
  onDecline,
}: {
  booking: ProviderBooking | null
  open: boolean
  onClose: () => void
  onAccept: () => void
  onDecline: () => void
}) {
  const [declineReason, setDeclineReason] = useState("")
  const [showDeclineForm, setShowDeclineForm] = useState(false)

  if (!booking) return null

  const checkIn = new Date(booking.checkIn)
  const checkOut = new Date(booking.checkOut)
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Booking Request</DialogTitle>
          <DialogDescription>Review the booking details and respond to the guest</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Guest Info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={booking.guestAvatar || "/placeholder.svg"} />
              <AvatarFallback>{booking.guestName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{booking.guestName}</h3>
              <p className="text-sm text-muted-foreground">{booking.guestEmail}</p>
              <p className="text-sm text-muted-foreground">{booking.guestPhone}</p>
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
            <div>
              <p className="text-sm text-muted-foreground">Check-out</p>
              <p className="font-medium">
                {checkOut.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Room Type</p>
              <p className="font-medium">{booking.roomType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Guests</p>
              <p className="font-medium">
                {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-medium">
                {nights} {nights === 1 ? "night" : "nights"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-lg font-bold">${booking.totalPrice}</p>
            </div>
          </div>

          {/* Special Requests */}
          {booking.specialRequests && (
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">Special Requests</p>
              <p className="mt-1 text-sm text-muted-foreground">{booking.specialRequests}</p>
            </div>
          )}

          {/* Decline Form */}
          {showDeclineForm ? (
            <div className="space-y-3">
              <p className="text-sm font-medium">Reason for declining (optional)</p>
              <Textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Let the guest know why you can't accept this booking..."
              />
            </div>
          ) : null}
        </div>

        <DialogFooter className="flex gap-2">
          {booking.status === "pending" && (
            <>
              {showDeclineForm ? (
                <>
                  <Button variant="ghost" onClick={() => setShowDeclineForm(false)}>
                    Back
                  </Button>
                  <Button variant="destructive" onClick={onDecline}>
                    Confirm Decline
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setShowDeclineForm(true)}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Decline
                  </Button>
                  <Button onClick={onAccept}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Accept Booking
                  </Button>
                </>
              )}
            </>
          )}
          {booking.status !== "pending" && (
            <Button variant="outline" onClick={onClose}>
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
}: {
  booking: ProviderBooking
  onViewDetails: () => void
  onAccept: () => void
  onDecline: () => void
}) {
  const checkIn = new Date(booking.checkIn)
  const checkOut = new Date(booking.checkOut)
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  const status = statusConfig[booking.status]

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={booking.guestAvatar || "/placeholder.svg"} />
              <AvatarFallback>{booking.guestName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{booking.guestName}</h4>
                <Badge variant={status.badge}>{status.label}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{booking.roomType}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {checkIn.toLocaleDateString("en-US", { month: "short", day: "numeric" })} -{" "}
                  {checkOut.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {nights} {nights === 1 ? "night" : "nights"}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-lg font-bold">${booking.totalPrice}</p>
              <p className="text-xs text-muted-foreground">{booking.requestedAt}</p>
            </div>

            {booking.status === "pending" ? (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onDecline}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Decline
                </Button>
                <Button size="sm" onClick={onAccept}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
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
                  <DropdownMenuItem>
                    <Phone className="mr-2 h-4 w-4" />
                    Call Guest
                  </DropdownMenuItem>
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
  const [bookings, setBookings] = useState(mockProviderBookings)
  const [selectedBooking, setSelectedBooking] = useState<ProviderBooking | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const pendingBookings = bookings.filter((b) => b.status === "pending")
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed")
  const pastBookings = bookings.filter((b) => b.status === "completed" || b.status === "cancelled")

  const handleAccept = (id: string) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "confirmed" as const } : b)))
    setSelectedBooking(null)
  }

  const handleDecline = (id: string) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "cancelled" as const } : b)))
    setSelectedBooking(null)
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
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by guest name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
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
        onDecline={() => selectedBooking && handleDecline(selectedBooking.id)}
      />
    </div>
  )
}
