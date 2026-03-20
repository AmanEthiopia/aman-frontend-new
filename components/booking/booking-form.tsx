"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Loader2, User, Mail, Phone, Users, MessageSquare, CheckCircle2 } from "lucide-react"
import type { Hotel } from "@/lib/types/index"

interface BookingFormProps {
  hotel: Hotel
}

export function BookingForm({ hotel }: BookingFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    checkInDate: "",
    checkOutDate: "",
    numGuests: 1,
    message: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Mock success - in production this would call POST /api/bookings
    console.log("Booking request submitted (mock):", {
      hotelId: hotel.id,
      ...formData,
    })

    setIsLoading(false)
    setIsSuccess(true)
  }

  // Calculate minimum dates
  const today = new Date().toISOString().split("T")[0]
  const minCheckOut = formData.checkInDate || today

  if (isSuccess) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold">Booking Request Submitted!</h3>
            <p className="text-muted-foreground">
              Your request for {hotel.name} has been sent. The hotel will contact you at{" "}
              <span className="font-medium">{formData.guestEmail}</span> within 24-48 hours.
            </p>
            <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-1">
              <p>
                <span className="font-medium">Check-in:</span> {formData.checkInDate}
              </p>
              <p>
                <span className="font-medium">Check-out:</span> {formData.checkOutDate}
              </p>
              <p>
                <span className="font-medium">Guests:</span> {formData.numGuests}
              </p>
            </div>
            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">Demo Mode: No actual booking was created</p>
            <div className="flex gap-3 justify-center pt-2">
              <Button variant="outline" onClick={() => setIsSuccess(false)}>
                Make Another Booking
              </Button>
              <Button onClick={() => router.push("/hotels")}>Browse More Hotels</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Request Booking
        </CardTitle>
        <CardDescription>
          Submit your booking request for {hotel.name}. The hotel will contact you to confirm availability.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Guest Information */}
          <div className="space-y-4">
            <h3 className="font-medium">Guest Information</h3>
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="guestPhone">Phone Number (Optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="guestPhone"
                    name="guestPhone"
                    type="tel"
                    placeholder="+251 91 123 4567"
                    value={formData.guestPhone}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="numGuests">Number of Guests *</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="numGuests"
                    name="numGuests"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.numGuests}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stay Details */}
          <div className="space-y-4">
            <h3 className="font-medium">Stay Details</h3>
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
                    min={minCheckOut}
                    value={formData.checkOutDate}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Additional Message (Optional)</Label>
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

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Submit Booking Request
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            This is a booking request, not a confirmed reservation. The hotel will contact you within 24-48 hours to
            confirm availability and finalize your booking.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
