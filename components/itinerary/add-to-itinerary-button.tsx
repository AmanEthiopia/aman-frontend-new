"use client"

import { useState, useEffect, useCallback } from "react"
import { Calendar, Plus, Loader2, Check, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import {
  getMyTrips,
  getTripDetail,
  createTrip,
  addTripDay,
  addDayItem,
  type TripSummary,
  type ItineraryDay,
  type ItemType,
} from "@/lib/api/itinerary"

interface AddToItineraryButtonProps {
  itemType: ItemType
  itemId: string
  itemName: string
  variant?: "default" | "outline" | "ghost" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days - 1)
  return d.toISOString().split("T")[0]
}

function todayStr() {
  return new Date().toISOString().split("T")[0]
}

export function AddToItineraryButton({
  itemType,
  itemId,
  itemName,
  variant = "outline",
  size = "sm",
  className,
}: AddToItineraryButtonProps) {
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [trips, setTrips] = useState<TripSummary[]>([])
  const [days, setDays] = useState<ItineraryDay[]>([])
  const [selectedTrip, setSelectedTrip] = useState("")
  const [selectedDay, setSelectedDay] = useState("")
  const [timeSlot, setTimeSlot] = useState("")
  const [loadingTrips, setLoadingTrips] = useState(false)
  const [loadingDays, setLoadingDays] = useState(false)
  const [added, setAdded] = useState(false)

  // Create-itinerary form
  const [view, setView] = useState<"select" | "create">("select")
  const [newTrip, setNewTrip] = useState({
    title: "My Trip",
    start_date: todayStr(),
    duration_days: 7,
  })

  const computedEndDate = newTrip.start_date
    ? addDays(newTrip.start_date, newTrip.duration_days)
    : ""

  const loadTrips = useCallback(async () => {
    setLoadingTrips(true)
    try {
      const [current, upcoming] = await Promise.all([
        getMyTrips({ tab: "current" }),
        getMyTrips({ tab: "upcoming" }),
      ])
      const all = [...current, ...upcoming]
      setTrips(all)
      if (all.length === 0) setView("create")
      else setView("select")
    } catch {
      toast({ title: "Failed to load trips", variant: "destructive" })
    } finally {
      setLoadingTrips(false)
    }
  }, [toast])

  const loadDays = useCallback(async (tripId: string) => {
    setLoadingDays(true)
    try {
      const trip = await getTripDetail(tripId)
      setDays(trip.days || [])
    } catch {
      setDays([])
    } finally {
      setLoadingDays(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      setAdded(false)
      setSelectedTrip("")
      setSelectedDay("")
      setTimeSlot("")
      setNewTrip({ title: "My Trip", start_date: todayStr(), duration_days: 7 })
      loadTrips()
    }
  }, [open, loadTrips])

  useEffect(() => {
    if (selectedTrip) {
      loadDays(selectedTrip)
      setSelectedDay("")
    }
  }, [selectedTrip, loadDays])

  function buildItemPayload() {
    const payload: Record<string, unknown> = {
      item_type: itemType,
      status: "planned",
      time_slot: timeSlot || undefined,
    }
    switch (itemType) {
      case "hotel":       payload.hotel_id = itemId;       break
      case "restaurant":  payload.restaurant_id = itemId;  break
      case "attraction":  payload.attraction_id = itemId;  break
      case "experience":  payload.experience_id = itemId;  break
      case "guide":       payload.guide_id = itemId;       break
    }
    return payload
  }

  // Add item to an existing trip+day
  const handleAdd = async () => {
    if (!selectedTrip || !selectedDay) {
      toast({ title: "Please select a trip and day", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      await addDayItem(selectedTrip, selectedDay, buildItemPayload() as any)
      toast({ title: `"${itemName}" added to your itinerary!` })
      setAdded(true)
      setTimeout(() => { setOpen(false); setAdded(false) }, 1500)
    } catch (err: any) {
      toast({ title: err.message || "Failed to add to itinerary", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  // Trip has no days — auto-create Day 1 then add
  const handleAutoAddDay = async () => {
    if (!selectedTrip) return
    setLoading(true)
    try {
      const trip = trips.find((t) => t.id === selectedTrip)
      const dayDate = trip?.start_date ?? todayStr()
      const { id: dayId } = await addTripDay(selectedTrip, { date: dayDate, title: "Day 1" })
      await addDayItem(selectedTrip, dayId, buildItemPayload() as any)
      toast({ title: `"${itemName}" added to Day 1 of your itinerary!` })
      setAdded(true)
      setTimeout(() => { setOpen(false); setAdded(false) }, 1500)
    } catch (err: any) {
      toast({ title: err.message || "Failed to add to itinerary", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  // Create new trip + Day 1 + add item
  const handleCreateAndAdd = async () => {
    if (!newTrip.title || !newTrip.start_date || !newTrip.duration_days) {
      toast({ title: "Please fill in all fields", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      const { id: tripId } = await createTrip({
        title: newTrip.title,
        start_date: newTrip.start_date,
        end_date: computedEndDate,
      })
      const { id: dayId } = await addTripDay(tripId, { date: newTrip.start_date, title: "Day 1" })
      await addDayItem(tripId, dayId, buildItemPayload() as any)
      toast({ title: `Itinerary created and "${itemName}" added to Day 1!` })
      setAdded(true)
      setTimeout(() => { setOpen(false); setAdded(false) }, 1500)
    } catch (err: any) {
      toast({ title: err.message || "Failed to create itinerary", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })

  if (!isAuthenticated) return null

  return (
    <>
      <Button variant={variant} size={size} className={className} onClick={() => setOpen(true)}>
        <Calendar className="mr-2 h-4 w-4" />
        Add to Itinerary
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Itinerary</DialogTitle>
            <DialogDescription>Add "{itemName}" to one of your trip plans</DialogDescription>
          </DialogHeader>

          {added ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="mb-4 rounded-full bg-green-100 p-3">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-center font-medium">Added to your itinerary!</p>
            </div>
          ) : loadingTrips ? (
            <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading trips...
            </div>
          ) : view === "create" ? (
            /* ── Create new itinerary ── */
            <div className="space-y-4">
              {trips.length > 0 && (
                <button
                  className="text-sm text-primary hover:underline"
                  onClick={() => setView("select")}
                >
                  ← Back to my trips
                </button>
              )}

              <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
                <CalendarDays className="mx-auto mb-2 h-8 w-8" />
                <p className="text-sm font-medium">
                  {trips.length === 0 ? "You don't have any active trips yet." : "Create a new trip"}
                </p>
                <p className="text-xs mt-1">Fill in the details below — we'll add Day 1 automatically.</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="trip-title">Trip Name</Label>
                  <Input
                    id="trip-title"
                    value={newTrip.title}
                    onChange={(e) => setNewTrip({ ...newTrip, title: e.target.value })}
                    placeholder="e.g. Ethiopia Adventure"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="trip-start">Start Date</Label>
                    <Input
                      id="trip-start"
                      type="date"
                      value={newTrip.start_date}
                      onChange={(e) => setNewTrip({ ...newTrip, start_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="trip-days">Number of Days</Label>
                    <Input
                      id="trip-days"
                      type="number"
                      min={1}
                      max={90}
                      value={newTrip.duration_days}
                      onChange={(e) =>
                        setNewTrip({ ...newTrip, duration_days: parseInt(e.target.value) || 1 })
                      }
                    />
                  </div>
                </div>

                {newTrip.start_date && (
                  <p className="text-xs text-muted-foreground">
                    Ends on:{" "}
                    <span className="font-medium">
                      {new Date(computedEndDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* ── Select existing trip / day ── */
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Trip</Label>
                <Select value={selectedTrip} onValueChange={setSelectedTrip}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a trip..." />
                  </SelectTrigger>
                  <SelectContent>
                    {trips.map((trip) => (
                      <SelectItem key={trip.id} value={trip.id}>
                        {trip.title} ({formatDate(trip.start_date)} – {formatDate(trip.end_date)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  className="text-xs text-primary hover:underline"
                  onClick={() => setView("create")}
                >
                  + Create a new trip instead
                </button>
              </div>

              {selectedTrip && (
                <div className="space-y-2">
                  <Label>Select Day</Label>
                  {loadingDays ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading days...
                    </div>
                  ) : days.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-3 text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        This trip has no days yet.
                      </p>
                      <Button size="sm" variant="outline" onClick={handleAutoAddDay} disabled={loading}>
                        {loading ? (
                          <><Loader2 className="mr-2 h-3 w-3 animate-spin" />Adding...</>
                        ) : (
                          <><Plus className="mr-2 h-3 w-3" />Add Day 1 &amp; continue</>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Select value={selectedDay} onValueChange={setSelectedDay}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a day..." />
                      </SelectTrigger>
                      <SelectContent>
                        {days.map((day) => (
                          <SelectItem key={day.id} value={day.id}>
                            {formatDate(day.date)}{day.title ? ` — ${day.title}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              {selectedDay && (
                <div className="space-y-2">
                  <Label htmlFor="timeSlot">Time (optional)</Label>
                  <Input
                    id="timeSlot"
                    type="time"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          {!added && !loadingTrips && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              {view === "create" ? (
                <Button
                  onClick={handleCreateAndAdd}
                  disabled={loading || !newTrip.title || !newTrip.start_date || newTrip.duration_days < 1}
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</>
                  ) : (
                    "Create & Add to Itinerary"
                  )}
                </Button>
              ) : (
                days.length > 0 && (
                  <Button onClick={handleAdd} disabled={loading || !selectedTrip || !selectedDay}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add to Itinerary
                  </Button>
                )
              )}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
