"use client"

import { useState, useEffect, useCallback } from "react"
import { Calendar, Plus, Loader2, Check } from "lucide-react"
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
  const [selectedTrip, setSelectedTrip] = useState<string>("")
  const [selectedDay, setSelectedDay] = useState<string>("")
  const [timeSlot, setTimeSlot] = useState("")
  const [loadingTrips, setLoadingTrips] = useState(false)
  const [loadingDays, setLoadingDays] = useState(false)
  const [added, setAdded] = useState(false)

  const loadTrips = useCallback(async () => {
    setLoadingTrips(true)
    try {
      // Get active and upcoming trips
      const [current, upcoming] = await Promise.all([
        getMyTrips({ tab: "current" }),
        getMyTrips({ tab: "upcoming" }),
      ])
      setTrips([...current, ...upcoming])
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
    if (open && trips.length === 0) {
      loadTrips()
    }
  }, [open, trips.length, loadTrips])

  useEffect(() => {
    if (selectedTrip) {
      loadDays(selectedTrip)
      setSelectedDay("")
    }
  }, [selectedTrip, loadDays])

  const handleAdd = async () => {
    if (!selectedTrip || !selectedDay) {
      toast({ title: "Please select a trip and day", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const payload: any = {
        item_type: itemType,
        status: "planned",
        time_slot: timeSlot || undefined,
      }

      // Add the appropriate resource ID
      switch (itemType) {
        case "hotel":
          payload.hotel_id = itemId
          break
        case "restaurant":
          payload.restaurant_id = itemId
          break
        case "attraction":
          payload.attraction_id = itemId
          break
        case "experience":
          payload.experience_id = itemId
          break
        case "guide":
          payload.guide_id = itemId
          break
      }

      await addDayItem(selectedTrip, selectedDay, payload)
      toast({ title: `${itemName} added to your itinerary!` })
      setAdded(true)
      setTimeout(() => {
        setOpen(false)
        setAdded(false)
      }, 1500)
    } catch (err: any) {
      toast({ title: err.message || "Failed to add to itinerary", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
      >
        <Calendar className="mr-2 h-4 w-4" />
        Add to Itinerary
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Itinerary</DialogTitle>
            <DialogDescription>
              Add "{itemName}" to one of your trip plans
            </DialogDescription>
          </DialogHeader>

          {added ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="mb-4 rounded-full bg-green-100 p-3">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-center font-medium">Added to your itinerary!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Trip</Label>
                {loadingTrips ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading trips...
                  </div>
                ) : trips.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    You don't have any active trips.{" "}
                    <a href="/itinerary" className="text-primary hover:underline">
                      Create one first
                    </a>
                  </p>
                ) : (
                  <Select value={selectedTrip} onValueChange={setSelectedTrip}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a trip..." />
                    </SelectTrigger>
                    <SelectContent>
                      {trips.map((trip) => (
                        <SelectItem key={trip.id} value={trip.id}>
                          {trip.title} ({formatDate(trip.start_date)} - {formatDate(trip.end_date)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
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
                    <p className="text-sm text-muted-foreground">
                      No days in this trip yet. Add days first in your itinerary.
                    </p>
                  ) : (
                    <Select value={selectedDay} onValueChange={setSelectedDay}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a day..." />
                      </SelectTrigger>
                      <SelectContent>
                        {days.map((day) => (
                          <SelectItem key={day.id} value={day.id}>
                            {formatDate(day.date)} {day.title && `- ${day.title}`}
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

          {!added && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAdd}
                disabled={loading || !selectedTrip || !selectedDay}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add to Itinerary
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
