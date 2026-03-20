"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Plus, X, Clock, Users, DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CalendarBooking {
  id: string
  guestName: string
  roomType: string
  checkIn: string
  checkOut: string
  status: "confirmed" | "pending"
}

// Mock bookings for calendar
const mockCalendarBookings: CalendarBooking[] = [
  {
    id: "1",
    guestName: "Sarah Johnson",
    roomType: "Deluxe Suite",
    checkIn: "2025-01-15",
    checkOut: "2025-01-18",
    status: "confirmed",
  },
  {
    id: "2",
    guestName: "Michael Chen",
    roomType: "Family Room",
    checkIn: "2025-01-18",
    checkOut: "2025-01-21",
    status: "pending",
  },
  {
    id: "3",
    guestName: "Emma Williams",
    roomType: "Standard",
    checkIn: "2025-01-20",
    checkOut: "2025-01-22",
    status: "confirmed",
  },
  {
    id: "4",
    guestName: "David Brown",
    roomType: "Executive",
    checkIn: "2025-01-22",
    checkOut: "2025-01-26",
    status: "confirmed",
  },
]

const roomTypes = ["Deluxe Suite", "Family Room", "Standard Room", "Executive Suite"]

export default function ProviderCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1)) // January 2025
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPadding = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const days = Array.from({ length: 42 }, (_, i) => {
    const dayOffset = i - startPadding + 1
    if (dayOffset < 1 || dayOffset > daysInMonth) return null
    return dayOffset
  })

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  const getBookingsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return mockCalendarBookings.filter((b) => {
      const checkIn = new Date(b.checkIn)
      const checkOut = new Date(b.checkOut)
      const current = new Date(dateStr)
      return current >= checkIn && current < checkOut
    })
  }

  const isDateBlocked = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return blockedDates.has(dateStr)
  }

  const toggleBlockDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    setBlockedDates((prev) => {
      const next = new Set(prev)
      if (next.has(dateStr)) {
        next.delete(dateStr)
      } else {
        next.add(dateStr)
      }
      return next
    })
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  // Get bookings for selected date
  const selectedDateBookings = selectedDate
    ? mockCalendarBookings.filter((b) => {
        const checkIn = new Date(b.checkIn)
        const checkOut = new Date(b.checkOut)
        const current = new Date(selectedDate)
        return current >= checkIn && current < checkOut
      })
    : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">Manage availability and view bookings</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Block Dates
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>{monthName}</CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day Headers */}
            <div className="mb-2 grid grid-cols-7 text-center text-sm font-medium text-muted-foreground">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="py-2">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                if (!day) {
                  return <div key={index} className="aspect-square" />
                }

                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                const bookings = getBookingsForDate(day)
                const isBlocked = isDateBlocked(day)
                const isSelected = selectedDate === dateStr
                const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(dateStr)}
                    className={cn(
                      "relative aspect-square rounded-lg border p-1 text-left transition-all hover:border-primary",
                      isSelected && "border-primary ring-2 ring-primary/20",
                      isBlocked && "bg-red-50 dark:bg-red-950/20",
                      isToday && "bg-primary/5",
                    )}
                  >
                    <span className={cn("text-sm font-medium", isToday && "text-primary", isBlocked && "text-red-600")}>
                      {day}
                    </span>
                    {bookings.length > 0 && (
                      <div className="absolute bottom-1 left-1 right-1">
                        <div className="flex flex-wrap gap-0.5">
                          {bookings.slice(0, 2).map((b, i) => (
                            <div
                              key={i}
                              className={cn(
                                "h-1.5 flex-1 rounded-full",
                                b.status === "confirmed" ? "bg-green-500" : "bg-yellow-500",
                              )}
                            />
                          ))}
                        </div>
                        {bookings.length > 2 && (
                          <span className="text-[10px] text-muted-foreground">+{bookings.length - 2}</span>
                        )}
                      </div>
                    )}
                    {isBlocked && (
                      <div className="absolute right-1 top-1">
                        <X className="h-3 w-3 text-red-500" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Confirmed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <span className="text-muted-foreground">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-red-100 dark:bg-red-950">
                  <X className="h-3 w-3 text-red-500" />
                </div>
                <span className="text-muted-foreground">Blocked</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Selected Date Details */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {selectedDate
                  ? new Date(selectedDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })
                  : "Select a date"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                selectedDateBookings.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateBookings.map((booking) => (
                      <div key={booking.id} className="rounded-lg border p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{booking.guestName}</p>
                            <p className="text-sm text-muted-foreground">{booking.roomType}</p>
                          </div>
                          <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {new Date(booking.checkIn).toLocaleDateString()} -{" "}
                          {new Date(booking.checkOut).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-sm text-muted-foreground">No bookings for this date</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 bg-transparent"
                      onClick={() => {
                        const day = new Date(selectedDate).getDate()
                        toggleBlockDate(day)
                      }}
                    >
                      {isDateBlocked(new Date(selectedDate).getDate()) ? "Unblock Date" : "Block Date"}
                    </Button>
                  </div>
                )
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">Click on a date to view bookings</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">This Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Total Nights
                </span>
                <span className="font-semibold">18</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Total Guests
                </span>
                <span className="font-semibold">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  Revenue
                </span>
                <span className="font-semibold">$4,280</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
