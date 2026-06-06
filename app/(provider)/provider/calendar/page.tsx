"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getAllProviderBookings, type NormalizedBooking } from "@/lib/api/bookings"

function dateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

export default function ProviderCalendarPage() {
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [bookings, setBookings] = useState<NormalizedBooking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllProviderBookings()
      .then((all) => setBookings(all))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false))
  }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startPadding = firstDay.getDay()

  const days = Array.from({ length: 42 }, (_, i) => {
    const d = i - startPadding + 1
    return d >= 1 && d <= daysInMonth ? d : null
  })

  const getBookingsForDay = (day: number) => {
    const ds = dateStr(year, month, day)
    return bookings.filter((b) => {
      if (!b.date_from) return false
      const from = b.date_from.slice(0, 10)
      const to = b.date_to ? b.date_to.slice(0, 10) : from
      return ds >= from && ds <= to
    })
  }

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  const today = new Date()
  const todayStr = dateStr(today.getFullYear(), today.getMonth(), today.getDate())

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="text-muted-foreground">View your booking schedule</p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>{monthName}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Weekday headers */}
            <div className="mb-2 grid grid-cols-7 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="py-2 text-xs font-medium text-muted-foreground">{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, i) => {
                if (!day) return <div key={i} />
                const ds = dateStr(year, month, day)
                const isToday = ds === todayStr
                const dayBookings = getBookingsForDay(day)

                return (
                  <div
                    key={i}
                    className={cn(
                      "min-h-[72px] rounded-lg border p-1.5 text-xs",
                      isToday ? "border-primary bg-primary/5" : "border-border"
                    )}
                  >
                    <span className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                      isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                    )}>
                      {day}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {dayBookings.slice(0, 2).map((b) => (
                        <div
                          key={b.id}
                          className={cn(
                            "truncate rounded px-1 py-0.5 text-[10px] font-medium",
                            b.status === "confirmed" ? "bg-green-100 text-green-800" :
                            b.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                            "bg-muted text-muted-foreground"
                          )}
                          title={`${b.guest_name} — ${b.property_name}`}
                        >
                          {b.guest_name?.split(" ")[0]}
                        </div>
                      ))}
                      {dayBookings.length > 2 && (
                        <div className="px-1 text-[10px] text-muted-foreground">+{dayBookings.length - 2} more</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-green-100 border border-green-300" />Confirmed</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-yellow-100 border border-yellow-300" />Pending</span>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && bookings.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No bookings yet. Confirmed bookings will appear here.</p>
      )}
    </div>
  )
}
