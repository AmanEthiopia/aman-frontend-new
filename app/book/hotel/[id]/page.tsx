"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { FloatingAIAssistant } from "@/components/ai/floating-assistant"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrustBadge } from "@/components/shared/trust-badge"
import { getHotelById, getHotelRooms } from "@/lib/api/hotels"
import { createHotelBooking, getMyHotelBookings, type GuestInfo, type HotelBooking, type HotelBookingListItem } from "@/lib/api/bookings"
import { useAuth } from "@/contexts/auth-context"
import type { Hotel, Room } from "@/lib/types"
import {
  Calendar,
  Loader2,
  User,
  Mail,
  Phone,
  Users,
  MessageSquare,
  ArrowLeft,
  Shield,
  MapPin,
  Star,
  CheckCircle,
  AlertCircle,
  BedDouble,
  Minus,
  Plus,
  XCircle,
  UserCheck,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { getMediaUrl } from "@/lib/utils/media"
import { formatRating } from "@/lib/utils"

interface SelectedRoom {
  room_id: string
  quantity: number
}

export default function BookHotelPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = params.id as string
  const { userProfile, isAuthenticated } = useAuth()

  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomsLoading, setRoomsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [bookingNumber, setBookingNumber] = useState<string | null>(null)
  const [existingBookings, setExistingBookings] = useState<HotelBookingListItem[]>([])
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)

  // Selected rooms: room_id → quantity
  const [selectedRooms, setSelectedRooms] = useState<Record<string, number>>({})

  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    checkInDate: searchParams.get("check_in") || "",
    checkOutDate: searchParams.get("check_out") || "",
    numAdults: 1,
    numChildren: 0,
    message: "",
  })
  const [guests, setGuests] = useState<GuestInfo[]>([])

  // Sync guests array to numAdults - 1 additional guests (primary booker is already captured above)
  useEffect(() => {
    const additional = Math.max(0, Number(formData.numAdults) - 1)
    setGuests((prev) => {
      if (prev.length === additional) return prev
      if (prev.length < additional) {
        return [...prev, ...Array.from({ length: additional - prev.length }, () => ({ first_name: "", last_name: "", gender: "other" as const, age: undefined }))]
      }
      return prev.slice(0, additional)
    })
  }, [formData.numAdults])

  const loadRooms = useCallback(async (hotelId: string, ci?: string, co?: string) => {
    setRoomsLoading(true)
    try {
      const data = await getHotelRooms(hotelId, ci && co ? { check_in: ci, check_out: co } : undefined)
      setRooms(data || [])

      // Pre-select the room from URL param
      const preselect = searchParams.get("room")
      if (preselect && data?.some((r) => r.id === preselect)) {
        setSelectedRooms({ [preselect]: 1 })
      }
    } catch {
      setRooms([])
    } finally {
      setRoomsLoading(false)
    }
  }, [searchParams])

  useEffect(() => {
    async function loadHotel() {
      try {
        setLoading(true)
        const hotelData = await getHotelById(id)
        setHotel(hotelData)
        await loadRooms(hotelData.id, formData.checkInDate || undefined, formData.checkOutDate || undefined)
      } catch (err) {
        console.error("Failed to load hotel:", err)
        setError("Failed to load hotel details")
      } finally {
        setLoading(false)
      }
    }
    loadHotel()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isAuthenticated && userProfile) {
      const name = [userProfile.user?.first_name, userProfile.user?.last_name].filter(Boolean).join(" ")
      setFormData((prev) => ({
        ...prev,
        guestName: name || prev.guestName,
        guestEmail: userProfile.user?.email || prev.guestEmail,
        guestPhone: userProfile.user?.phone || prev.guestPhone,
      }))
      getMyHotelBookings().then(setExistingBookings).catch(() => {})
    }
  }, [isAuthenticated, userProfile])

  // Re-fetch rooms when dates change
  useEffect(() => {
    if (hotel?.id && formData.checkInDate && formData.checkOutDate && formData.checkOutDate > formData.checkInDate) {
      loadRooms(hotel.id, formData.checkInDate, formData.checkOutDate)
    }
  }, [formData.checkInDate, formData.checkOutDate, hotel?.id, loadRooms])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

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

  const totalNights = (() => {
    if (!formData.checkInDate || !formData.checkOutDate) return 0
    const diff = new Date(formData.checkOutDate).getTime() - new Date(formData.checkInDate).getTime()
    return Math.max(0, Math.floor(diff / 86400000))
  })()

  const estimatedTotal = (() => {
    if (totalNights === 0) return 0
    return roomsPayload.reduce((sum, { room_id, quantity }) => {
      const room = rooms.find((r) => r.id === room_id)
      return sum + (room?.price_per_night ?? 0) * quantity * totalNights
    }, 0)
  })()

  // Total capacity of selected rooms
  const totalRoomCapacity = roomsPayload.reduce((sum, { room_id, quantity }) => {
    const room = rooms.find((r) => r.id === room_id)
    const cap = room ? ((room.max_adults ?? 1) + (room.max_children ?? 0)) * quantity : 0
    return sum + cap
  }, 0)
  const totalGuests = Number(formData.numAdults) + Number(formData.numChildren)
  const capacityWarning = totalRoomCapacity > 0 && totalGuests > totalRoomCapacity
  // Number of physical rooms selected (sum of quantities)
  const totalRoomCount = roomsPayload.reduce((sum, { quantity }) => sum + quantity, 0)
  // Each room needs at least one guest — selecting more rooms than guests isn't allowed
  const tooManyRooms = totalRoomCount > 0 && totalRoomCount > totalGuests

  // Gender restriction notice for any selected room
  const genderRestrictions = roomsPayload
    .map(({ room_id }) => rooms.find((r) => r.id === room_id))
    .filter((r) => r?.gender_restriction && r.gender_restriction !== "none")
    .map((r) => ({ name: r!.name, restriction: r!.gender_restriction! }))

  const datesOverlap = (aIn: string, aOut: string, bIn: string, bOut: string) =>
    aIn < bOut && aOut > bIn

  const doSubmit = async () => {
    if (!hotel) return
    setIsSubmitting(true)
    setError(null)
    try {
      const response = await createHotelBooking({
        hotel_id: hotel.id,
        check_in_date: formData.checkInDate,
        check_out_date: formData.checkOutDate,
        num_adults: Number(formData.numAdults),
        num_children: Number(formData.numChildren) || undefined,
        rooms: roomsPayload,
        guest_name: formData.guestName,
        guest_email: formData.guestEmail,
        guest_phone: formData.guestPhone || undefined,
        special_requests: formData.message || undefined,
        guests: guests.length > 0 ? guests : undefined,
      })
      setBookingNumber(response.booking?.booking_number ?? null)
      setSuccess(true)
    } catch (err: any) {
      console.error("Booking error:", err)
      setError(err.message || "Failed to submit booking request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hotel) return

    if (roomsPayload.length === 0) {
      setError("Please select at least one room to continue.")
      return
    }
    if (!formData.checkInDate || !formData.checkOutDate) {
      setError("Please select check-in and check-out dates.")
      return
    }
    if (formData.checkOutDate <= formData.checkInDate) {
      setError("Check-out must be after check-in.")
      return
    }

    // Each room must have at least one guest — block selecting more rooms than guests
    if (tooManyRooms) {
      setError(
        `You've selected ${totalRoomCount} room(s) for ${totalGuests} guest(s). Each room needs at least one guest — add more guests or remove a room.`
      )
      return
    }
    // Rooms must be able to hold everyone
    if (capacityWarning) {
      setError(
        `Your ${totalGuests} guest(s) exceed the selected rooms' combined capacity (${totalRoomCapacity}). Add another room or choose a larger room type.`
      )
      return
    }

    // Validate availability
    for (const { room_id, quantity } of roomsPayload) {
      const room = rooms.find((r) => r.id === room_id)
      if (room?.available_units !== undefined && room.available_units !== null && quantity > room.available_units) {
        setError(`Only ${room.available_units} unit(s) of "${room.name}" available for these dates.`)
        return
      }
    }

    // Duplicate check
    const duplicate = existingBookings
      .filter((b) => b.status !== "cancelled" && b.status !== "rejected")
      .find((b) => datesOverlap(formData.checkInDate, formData.checkOutDate, b.check_in_date, b.check_out_date))

    if (duplicate) {
      const name = (duplicate as any).hotel?.name ?? "another hotel"
      setDuplicateWarning(
        `You already have an active booking at ${name} (${duplicate.check_in_date} → ${duplicate.check_out_date}). Are you sure you want to submit another booking for these overlapping dates?`
      )
      return
    }

    await doSubmit()
  }

  const today = new Date().toISOString().split("T")[0]

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="mb-8 h-8 w-48" />
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Skeleton className="h-[500px] w-full rounded-xl" />
              </div>
              <div>
                <Skeleton className="h-64 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!hotel) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="mb-4 text-2xl font-bold">Hotel not found</h1>
            <Button asChild>
              <Link href="/hotels">Browse Hotels</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-12">
            <div className="mx-auto max-w-lg text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="mb-4 text-3xl font-bold">Booking Request Submitted!</h1>
              <p className="mb-6 text-muted-foreground">
                Your booking request for {hotel.name} has been submitted. The hotel will review and confirm within 24–48 hours.
              </p>
              <Card className="mb-6 text-left">
                <CardContent className="p-4 space-y-1 text-sm text-muted-foreground">
                  {bookingNumber && <p><strong>Booking #:</strong> {bookingNumber}</p>}
                  <p><strong>Hotel:</strong> {hotel.name}</p>
                  <p><strong>Check-in:</strong> {formData.checkInDate}</p>
                  <p><strong>Check-out:</strong> {formData.checkOutDate}</p>
                  <p><strong>Nights:</strong> {totalNights}</p>
                  {roomsPayload.map(({ room_id, quantity }) => {
                    const room = rooms.find((r) => r.id === room_id)
                    return room ? (
                      <p key={room_id}><strong>{room.name}:</strong> {quantity} room{quantity !== 1 ? "s" : ""}</p>
                    ) : null
                  })}
                  {estimatedTotal > 0 && <p><strong>Estimated Total:</strong> ${estimatedTotal.toLocaleString()}</p>}
                </CardContent>
              </Card>

              {/* Show assigned units if returned */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button asChild>
                  <Link href="/bookings">View My Bookings</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/hotels">Browse More Hotels</Link>
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Back Navigation */}
        <div className="border-b border-border bg-muted/30">
          <div className="container mx-auto px-4 py-4">
            <Link
              href={`/hotels/${hotel.id}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {hotel.name}
            </Link>
          </div>
        </div>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <h1 className="mb-8 text-2xl font-bold md:text-3xl">Book Your Stay</h1>

            {!isAuthenticated && (
              <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Not logged in</p>
                    <p className="mt-1">
                      <Link href="/login" className="underline">Log in</Link>{" "}
                      to pre-fill your details and track your bookings.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Booking Form */}
              <div className="lg:col-span-2 space-y-6">

                {/* Stay Dates */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Stay Dates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="checkInDate">Check-in Date *</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="checkInDate"
                            name="checkInDate"
                            type="date"
                            min={today}
                            value={formData.checkInDate}
                            onChange={handleChange}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="checkOutDate">Check-out Date *</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="checkOutDate"
                            name="checkOutDate"
                            type="date"
                            min={formData.checkInDate || today}
                            value={formData.checkOutDate}
                            onChange={handleChange}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    {totalNights > 0 && (
                      <p className="mt-3 text-sm text-muted-foreground">
                        {totalNights} night{totalNights !== 1 ? "s" : ""}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Room Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BedDouble className="h-5 w-5 text-primary" />
                      Select Rooms
                      {roomsLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </CardTitle>
                    <CardDescription>
                      {formData.checkInDate && formData.checkOutDate
                        ? "Showing availability for your dates"
                        : "Select dates above to check real-time availability"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {rooms.length === 0 && !roomsLoading && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        No rooms available. Contact the hotel directly.
                      </div>
                    )}
                    {rooms.map((room) => {
                      const hasDateRange = formData.checkInDate && formData.checkOutDate && formData.checkOutDate > formData.checkInDate
                      const available = room.available_units
                      const allBooked = hasDateRange && available === 0
                      const qty = selectedRooms[room.id] ?? 0
                      const maxQty = hasDateRange && available !== null && available !== undefined ? available : (room.total_units ?? 99)

                      return (
                        <div
                          key={room.id}
                          className={`rounded-lg border p-4 transition-colors ${
                            qty > 0 ? "border-primary bg-primary/5" : "border-border"
                          } ${allBooked ? "opacity-60" : ""}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="font-semibold">{room.name}</span>
                                {room.bed_type && (
                                  <Badge variant="outline" className="text-xs">
                                    <BedDouble className="mr-1 h-3 w-3" />
                                    {room.bed_type}
                                  </Badge>
                                )}
                                {allBooked && (
                                  <Badge variant="destructive" className="text-xs">
                                    <XCircle className="mr-1 h-3 w-3" />
                                    Fully Booked
                                  </Badge>
                                )}
                                {hasDateRange && !allBooked && available !== null && available !== undefined && (
                                  <Badge variant="outline" className="text-xs text-green-700 bg-green-50 border-green-200">
                                    {available} available
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{room.description}</p>
                              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Users className="h-3.5 w-3.5" />
                                  Up to {room.max_adults !== undefined ? room.max_adults + (room.max_children ?? 0) : (room.max_guests ?? 1)} guests
                                </span>
                                {(() => {
                                  const p = room.base_price !== undefined ? parseFloat(String(room.base_price)) : (room.price_per_night ?? 0)
                                  return (
                                    <span className="font-semibold text-foreground">
                                      ${p}/night
                                      {qty > 0 && totalNights > 0 && (
                                        <span className="ml-1 font-normal text-muted-foreground">
                                          = ${(p * qty * totalNights).toLocaleString()} total
                                        </span>
                                      )}
                                    </span>
                                  )
                                })()}
                              </div>

                              {/* Availability boxes */}
                              {hasDateRange && room.total_units && room.total_units > 0 && available !== null && available !== undefined && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {Array.from({ length: room.total_units }).map((_, i) => {
                                    const isAvail = i < available
                                    return (
                                      <div
                                        key={i}
                                        title={isAvail ? "Available" : "Booked"}
                                        className={`h-5 w-5 rounded text-[10px] flex items-center justify-center ${
                                          isAvail
                                            ? "bg-green-100 text-green-700 border border-green-200"
                                            : "bg-red-100 text-red-600 border border-red-200"
                                        }`}
                                      >
                                        {i + 1}
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Quantity stepper */}
                            {!allBooked && (
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setRoomQty(room.id, -1)}
                                  disabled={qty === 0}
                                  className="flex h-8 w-8 items-center justify-center rounded-full border transition-colors hover:bg-muted disabled:opacity-40"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-6 text-center font-semibold">{qty}</span>
                                <button
                                  type="button"
                                  onClick={() => setRoomQty(room.id, 1)}
                                  disabled={qty >= maxQty}
                                  className="flex h-8 w-8 items-center justify-center rounded-full border bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                {/* Guest Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Guest Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="guestName">Full Name *</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="guestName"
                              name="guestName"
                              placeholder="John Doe"
                              value={formData.guestName}
                              onChange={handleChange}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="guestEmail">Email Address *</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="guestEmail"
                              name="guestEmail"
                              type="email"
                              placeholder="john@example.com"
                              value={formData.guestEmail}
                              onChange={handleChange}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="guestPhone">Phone (Optional)</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="guestPhone"
                              name="guestPhone"
                              type="tel"
                              placeholder="+251 708 029 422"
                              value={formData.guestPhone}
                              onChange={handleChange}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="numAdults">Adults *</Label>
                          <div className="relative">
                            <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="numAdults"
                              name="numAdults"
                              type="number"
                              min="1"
                              max="20"
                              value={formData.numAdults}
                              onChange={handleChange}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="numChildren">Children</Label>
                          <Input
                            id="numChildren"
                            name="numChildren"
                            type="number"
                            min="0"
                            max="10"
                            value={formData.numChildren}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      {/* Too many rooms for the guest count */}
                      {tooManyRooms && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 flex gap-2">
                          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <p>You&apos;ve selected {totalRoomCount} room(s) for {totalGuests} guest(s). Each room needs at least one guest — add more guests or remove a room.</p>
                        </div>
                      )}

                      {/* Capacity warning */}
                      {capacityWarning && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 flex gap-2">
                          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <p>Your guest count ({totalGuests}) exceeds the selected rooms' combined capacity ({totalRoomCapacity}). Please add more rooms or reduce guests.</p>
                        </div>
                      )}

                      {/* Gender restriction notice */}
                      {genderRestrictions.length > 0 && (
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 flex gap-2">
                          <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <div>
                            {genderRestrictions.map((r) => (
                              <p key={r.name}>
                                <strong>{r.name}</strong>: {r.restriction === "male_only" ? "Male guests only" : "Female guests only"}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Per-guest details (when >1 adult) */}
                      {guests.length > 0 && (
                        <div className="space-y-4 rounded-lg border border-border p-4 bg-muted/30">
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-primary" />
                            <p className="text-sm font-medium">Additional Guests</p>
                            <span className="text-xs text-muted-foreground">(details required for groups)</span>
                          </div>
                          {guests.map((guest, idx) => (
                            <div key={idx} className="space-y-3">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Guest {idx + 2}</p>
                              <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1">
                                  <Label className="text-xs">First Name *</Label>
                                  <Input
                                    placeholder="First name"
                                    value={guest.first_name}
                                    onChange={(e) => setGuests((prev) => prev.map((g, i) => i === idx ? { ...g, first_name: e.target.value } : g))}
                                    required
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Last Name *</Label>
                                  <Input
                                    placeholder="Last name"
                                    value={guest.last_name}
                                    onChange={(e) => setGuests((prev) => prev.map((g, i) => i === idx ? { ...g, last_name: e.target.value } : g))}
                                    required
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Gender *</Label>
                                  <Select
                                    value={guest.gender}
                                    onValueChange={(v) => setGuests((prev) => prev.map((g, i) => i === idx ? { ...g, gender: v as GuestInfo["gender"] } : g))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="male">Male</SelectItem>
                                      <SelectItem value="female">Female</SelectItem>
                                      <SelectItem value="other">Other / Prefer not to say</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Age (Optional)</Label>
                                  <Input
                                    type="number"
                                    min={1}
                                    max={120}
                                    placeholder="Age"
                                    value={guest.age ?? ""}
                                    onChange={(e) => setGuests((prev) => prev.map((g, i) => i === idx ? { ...g, age: e.target.value ? Number(e.target.value) : undefined } : g))}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="message">Special Requests (Optional)</Label>
                        <div className="relative">
                          <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Textarea
                            id="message"
                            name="message"
                            placeholder="Any special requests or questions..."
                            value={formData.message}
                            onChange={handleChange}
                            className="min-h-24 pl-10"
                          />
                        </div>
                      </div>

                      {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                          <div className="flex gap-2">
                            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <p>{error}</p>
                          </div>
                        </div>
                      )}

                      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || roomsPayload.length === 0 || tooManyRooms || capacityWarning}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting Request...
                          </>
                        ) : (
                          <>
                            <Calendar className="mr-2 h-4 w-4" />
                            Submit Booking Request
                            {estimatedTotal > 0 && ` — $${estimatedTotal.toLocaleString()}`}
                          </>
                        )}
                      </Button>

                      <p className="text-center text-xs text-muted-foreground">
                        This is a booking request. The hotel will contact you within 24–48 hours to confirm.
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Hotel Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="mb-4 overflow-hidden rounded-lg">
                        <img
                          src={getMediaUrl(
                            (hotel as any).photos?.find((p: any) => p.is_primary)?.photo_url ||
                            (hotel as any).photos?.[0]?.photo_url ||
                            (hotel as any).cover_photo ||
                            (hotel as any).cover_photo_url ||
                            (hotel as any).images?.[0]?.url ||
                            (hotel as any).images?.[0]?.image_url
                          ) || "/placeholder.svg"}
                          alt={hotel.name}
                          className="h-40 w-full object-cover"
                        />
                      </div>
                      <h3 className="mb-1 font-semibold">{hotel.name}</h3>
                      <div className="mb-2 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {(hotel as any).address || (hotel as any).area}
                        {((hotel as any).city?.name || (hotel as any).city_name) && `, ${(hotel as any).city?.name || (hotel as any).city_name}`}
                      </div>
                      <div className="mb-4 flex items-center gap-2 text-sm">
                        {((hotel as any).isVerified || (hotel as any).is_verified) && (
                          <span className="flex items-center gap-1 text-primary">
                            <Shield className="h-3.5 w-3.5" />
                            Verified
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                          {formatRating((hotel as any).rating || (hotel as any).average_rating)}
                        </span>
                      </div>

                      {/* Booking summary */}
                      {roomsPayload.length > 0 && (
                        <div className="border-t border-border pt-4 space-y-2">
                          <h4 className="text-sm font-medium">Your Selection</h4>
                          {roomsPayload.map(({ room_id, quantity }) => {
                            const room = rooms.find((r) => r.id === room_id)
                            if (!room) return null
                            return (
                              <div key={room_id} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{room.name} × {quantity}</span>
                                {totalNights > 0 && (
                                  <span className="font-medium">
                                    ${((room.base_price !== undefined ? parseFloat(String(room.base_price)) : (room.price_per_night ?? 0)) * quantity * totalNights).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            )
                          })}
                          {totalNights > 0 && (
                            <div className="flex justify-between text-sm text-muted-foreground pt-1 border-t border-border">
                              <span>{totalNights} night{totalNights !== 1 ? "s" : ""}</span>
                              <span className="font-bold text-foreground">${estimatedTotal.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <TrustBadge
                    lastVerified={(hotel as any).lastVerified}
                    foreignTravelerCount={(hotel as any).foreignTravelerCount}
                    disputeFreeDays={(hotel as any).disputeFreeDays}
                  />

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="mb-2 font-medium">Cancellation Policy</h4>
                      <p className="text-sm text-muted-foreground">
                        Free cancellation up to 48 hours before check-in. After that, the first night is non-refundable.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingAIAssistant />

      {/* Duplicate booking warning */}
      <Dialog open={!!duplicateWarning} onOpenChange={(open) => { if (!open) setDuplicateWarning(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Duplicate Booking
            </DialogTitle>
            <DialogDescription>{duplicateWarning}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setDuplicateWarning(null)}>Go Back</Button>
            <Button onClick={() => { setDuplicateWarning(null); doSubmit() }}>Book Anyway</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
