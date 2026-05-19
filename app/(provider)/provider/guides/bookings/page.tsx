"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Calendar, Clock, Users, Phone, Mail, MessageSquare, 
  Check, X, MoreHorizontal, AlertCircle
} from "lucide-react"
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
import { 
  getProviderGuideBookings, 
  confirmGuideBooking, 
  rejectGuideBooking,
  getProviderGuides,
  type GuideBooking,
  type GuideBookingStatus,
  type Guide,
  SERVICE_TYPE_LABELS
} from "@/lib/api/guides"
import { toast } from "sonner"
import { format } from "date-fns"
import { formatPrice } from "@/lib/utils"

const STATUS_COLORS: Record<GuideBookingStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
  completed: "bg-blue-100 text-blue-800",
}

export default function ProviderGuideBookingsPage() {
  const [bookings, setBookings] = useState<GuideBooking[]>([])
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterGuide, setFilterGuide] = useState<string>("all")
  
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<GuideBooking | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [filterStatus, filterGuide])

  const loadData = async () => {
    setLoading(true)
    try {
      const [bookingsData, guidesData] = await Promise.all([
        getProviderGuideBookings({
          status: filterStatus !== "all" ? filterStatus as GuideBookingStatus : undefined,
          guide_id: filterGuide !== "all" ? filterGuide : undefined,
        }),
        getProviderGuides(),
      ])
      setBookings(bookingsData)
      setGuides(guidesData)
    } catch (error) {
      toast.error("Failed to load bookings")
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (booking: GuideBooking) => {
    setProcessing(booking.id)
    try {
      await confirmGuideBooking(booking.id)
      setBookings(bookings.map(b => 
        b.id === booking.id ? { ...b, status: "confirmed" } : b
      ))
      toast.success("Booking confirmed successfully")
    } catch (error) {
      toast.error("Failed to confirm booking")
    } finally {
      setProcessing(null)
    }
  }

  const handleRejectClick = (booking: GuideBooking) => {
    setSelectedBooking(booking)
    setRejectReason("")
    setRejectDialogOpen(true)
  }

  const handleRejectConfirm = async () => {
    if (!selectedBooking) return
    setProcessing(selectedBooking.id)
    try {
      await rejectGuideBooking(selectedBooking.id, rejectReason || "")
      setBookings(bookings.map(b => 
        b.id === selectedBooking.id ? { ...b, status: "rejected" } : b
      ))
      toast.success("Booking rejected")
      setRejectDialogOpen(false)
    } catch (error) {
      toast.error("Failed to reject booking")
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Guide Bookings</h1>
        <p className="text-muted-foreground">Manage bookings for your tour guide services</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterGuide} onValueChange={setFilterGuide}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Guide Service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Services</SelectItem>
            {guides.map((guide) => (
              <SelectItem key={guide.id} value={guide.id}>
                {guide.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="mb-4 h-6 w-48" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <Card className="py-16 text-center">
          <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="mb-2 text-lg font-semibold">No bookings found</h3>
          <p className="text-muted-foreground">
            {filterStatus !== "all" || filterGuide !== "all"
              ? "Try adjusting your filters"
              : "You'll see bookings here when travelers book your guide services"
            }
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  {/* Booking Info */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={STATUS_COLORS[booking.status]}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                      <span className="font-mono text-sm text-muted-foreground">
                        {booking.booking_number}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold">{booking.guide.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {SERVICE_TYPE_LABELS[booking.guide.service_type as keyof typeof SERVICE_TYPE_LABELS]}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(booking.booking_date), "PPP")}
                      </span>
                      {booking.start_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {booking.start_time}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {booking.num_adults} adult{booking.num_adults !== 1 ? "s" : ""}
                        {booking.num_children > 0 && `, ${booking.num_children} child${booking.num_children !== 1 ? "ren" : ""}`}
                      </span>
                    </div>

                    {/* Guest Contact */}
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="mb-1 font-medium">{booking.guest_name}</p>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <a href={`mailto:${booking.guest_email}`} className="flex items-center gap-1 hover:text-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          {booking.guest_email}
                        </a>
                        {booking.guest_phone && (
                          <a href={`tel:${booking.guest_phone}`} className="flex items-center gap-1 hover:text-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            {booking.guest_phone}
                          </a>
                        )}
                      </div>
                      {booking.special_requests && (
                        <div className="mt-2 flex items-start gap-1 text-sm">
                          <MessageSquare className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                          <span>{booking.special_requests}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <p className="text-2xl font-bold">${formatPrice(booking.total_price)}</p>
                      <p className="text-sm text-muted-foreground">{booking.currency}</p>
                    </div>

                    {booking.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleConfirm(booking)}
                          disabled={processing === booking.id}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Confirm
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleRejectClick(booking)}
                          disabled={processing === booking.id}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    )}

                    {booking.status !== "pending" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Email Guest
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Phone className="mr-2 h-4 w-4" />
                            Call Guest
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this booking? The guest will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-medium">{selectedBooking?.guide.title}</p>
                <p className="text-muted-foreground">
                  {selectedBooking && format(new Date(selectedBooking.booking_date), "PPP")}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason (optional)</label>
              <Textarea
                placeholder="Let the guest know why you're rejecting..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRejectConfirm}
              disabled={processing === selectedBooking?.id}
            >
              Reject Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
