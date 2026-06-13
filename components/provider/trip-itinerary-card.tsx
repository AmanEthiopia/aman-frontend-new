"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  CalendarDays,
  Clock,
  ImagePlus,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { getMediaUrl } from "@/lib/utils/media"
import {
  addTripDayItem,
  createTripDay,
  deleteTripDay,
  deleteTripDayItem,
  getTripDays,
  uploadTripDayPhoto,
  type TripDay,
} from "@/lib/api/trip-itinerary"
import { ResourcePicker, type ResourceKind } from "@/components/provider/resource-picker"

type ItemKind = "activity" | ResourceKind

const ITEM_KIND_LABELS: Record<ItemKind, string> = {
  activity: "Activity",
  hotel: "Hotel",
  restaurant: "Restaurant",
  attraction: "Attraction",
}

function itemLabel(item: TripDay["items"][number]): string {
  if (item.item_type === "hotel") return item.hotel?.name ?? "Hotel stay"
  if (item.item_type === "restaurant") return item.restaurant?.name ?? "Restaurant"
  if (item.item_type === "attraction") return item.attraction?.name ?? "Attraction"
  return item.title || "Activity"
}

function DayBlock({
  tripId,
  day,
  onChanged,
  onDeleted,
}: {
  tripId: string
  day: TripDay
  onChanged: (day: TripDay) => void
  onDeleted: () => void
}) {
  const [showItemForm, setShowItemForm] = useState(false)
  const [itemKind, setItemKind] = useState<ItemKind>("activity")
  const [itemTitle, setItemTitle] = useState("")
  const [itemDescription, setItemDescription] = useState("")
  const [itemDuration, setItemDuration] = useState("")
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const closeItemForm = () => {
    setShowItemForm(false)
    setItemKind("activity")
    setItemTitle("")
    setItemDescription("")
    setItemDuration("")
  }

  const handleAddItem = async () => {
    if (!itemTitle.trim()) {
      toast.error("Activity title is required")
      return
    }
    setSaving(true)
    try {
      const item = await addTripDayItem(tripId, day.id, {
        title: itemTitle.trim(),
        description: itemDescription.trim() || undefined,
        duration_minutes: itemDuration ? parseInt(itemDuration, 10) : undefined,
        order: day.items.length,
      })
      onChanged({ ...day, items: [...day.items, item] })
      closeItemForm()
      toast.success("Activity added")
    } catch {
      toast.error("Couldn't add the activity. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handlePickResource = async (kind: ResourceKind, resource: { id: string; name: string }) => {
    setSaving(true)
    try {
      const item = await addTripDayItem(tripId, day.id, {
        item_type: kind,
        [`${kind}_id`]: resource.id,
        order: day.items.length,
      })
      onChanged({ ...day, items: [...day.items, item] })
      closeItemForm()
      toast.success(`${resource.name} added to Day ${day.day_number}`)
    } catch {
      toast.error(`Couldn't add the ${kind}. Please try again.`)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteTripDayItem(tripId, day.id, itemId)
      onChanged({ ...day, items: day.items.filter((i) => i.id !== itemId) })
      toast.success("Activity removed")
    } catch {
      toast.error("Couldn't remove the activity")
    }
  }

  const handlePhoto = async (file: File | undefined) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB")
      return
    }
    setUploadingPhoto(true)
    try {
      const updated = await uploadTripDayPhoto(tripId, day.id, file)
      onChanged({ ...day, photo_url: updated.photo_url })
      toast.success("Day photo updated")
    } catch {
      toast.error("Couldn't upload the photo")
    } finally {
      setUploadingPhoto(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  return (
    <div className="rounded-lg border">
      {day.photo_url && (
        <div className="h-36 w-full overflow-hidden rounded-t-lg">
          <img
            src={getMediaUrl(day.photo_url)}
            alt={day.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {day.day_number}
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{day.title}</p>
              {day.city?.name && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {day.city.name}
                </p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 gap-1">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handlePhoto(e.target.files?.[0])}
            />
            <Button
              variant="ghost"
              size="icon"
              title="Add day photo"
              onClick={() => fileRef.current?.click()}
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" title="Delete day" onClick={onDeleted}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>

        {day.description && (
          <p className="mt-2 text-sm text-muted-foreground">{day.description}</p>
        )}

        {/* Activities */}
        <div className="mt-3 space-y-2">
          {day.items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-2 rounded-md bg-muted/50 px-3 py-2">
              <div className="min-w-0">
                <p className="text-sm font-medium">{itemLabel(item)}</p>
                {item.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                )}
                {item.duration_minutes ? (
                  <Badge variant="outline" className="mt-1 gap-1 text-xs">
                    <Clock className="h-3 w-3" />
                    {item.duration_minutes >= 60
                      ? `${Math.round((item.duration_minutes / 60) * 10) / 10}h`
                      : `${item.duration_minutes}min`}
                  </Badge>
                ) : null}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => handleDeleteItem(item.id)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          {day.items.length === 0 && !showItemForm && (
            <p className="text-xs text-muted-foreground">No activities yet for this day.</p>
          )}
        </div>

        {/* Add activity / platform resource */}
        {showItemForm ? (
          <div className="mt-3 space-y-3 rounded-md border p-3">
            {/* Kind selector */}
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(ITEM_KIND_LABELS) as ItemKind[]).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => setItemKind(kind)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    itemKind === kind
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {ITEM_KIND_LABELS[kind]}
                </button>
              ))}
            </div>

            {itemKind === "activity" ? (
              <>
                <Input
                  placeholder="Activity title (e.g. Visit the National Museum)"
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Short description (optional)"
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  rows={2}
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    placeholder="Duration (minutes, optional)"
                    value={itemDuration}
                    onChange={(e) => setItemDuration(e.target.value)}
                    className="w-56"
                  />
                  <Button size="sm" onClick={handleAddItem} disabled={saving}>
                    {saving ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Plus className="mr-1 h-3.5 w-3.5" />}
                    Add
                  </Button>
                  <Button size="sm" variant="ghost" onClick={closeItemForm}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <ResourcePicker
                  kind={itemKind}
                  onPick={(resource) => handlePickResource(itemKind, resource)}
                />
                <Button size="sm" variant="ghost" onClick={closeItemForm}>
                  Cancel
                </Button>
              </>
            )}
          </div>
        ) : (
          <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowItemForm(true)}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Activity
          </Button>
        )}
      </div>
    </div>
  )
}

/**
 * Provider editor for a trip's day-by-day itinerary.
 * Travelers see this breakdown in the Itinerary tab of the public trip page.
 */
export function TripItineraryCard({ tripId }: { tripId: string }) {
  const [days, setDays] = useState<TripDay[]>([])
  const [loading, setLoading] = useState(true)
  const [showDayForm, setShowDayForm] = useState(false)
  const [dayTitle, setDayTitle] = useState("")
  const [dayDescription, setDayDescription] = useState("")
  const [savingDay, setSavingDay] = useState(false)

  useEffect(() => {
    getTripDays(tripId)
      .then((d) => setDays(d.sort((a, b) => a.day_number - b.day_number)))
      .catch(() => toast.error("Couldn't load the itinerary"))
      .finally(() => setLoading(false))
  }, [tripId])

  const handleAddDay = async () => {
    if (!dayTitle.trim()) {
      toast.error("Day title is required")
      return
    }
    setSavingDay(true)
    try {
      const nextNumber = days.length ? Math.max(...days.map((d) => d.day_number)) + 1 : 1
      const day = await createTripDay(tripId, {
        day_number: nextNumber,
        title: dayTitle.trim(),
        description: dayDescription.trim() || undefined,
      })
      setDays((prev) => [...prev, { ...day, items: day.items ?? [] }])
      setDayTitle("")
      setDayDescription("")
      setShowDayForm(false)
      toast.success(`Day ${nextNumber} added`)
    } catch {
      toast.error("Couldn't add the day. Please try again.")
    } finally {
      setSavingDay(false)
    }
  }

  const handleDeleteDay = async (day: TripDay) => {
    if (!confirm(`Delete Day ${day.day_number} — "${day.title}"?`)) return
    try {
      await deleteTripDay(tripId, day.id)
      setDays((prev) => prev.filter((d) => d.id !== day.id))
      toast.success("Day deleted")
    } catch {
      toast.error("Couldn't delete the day")
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Daily Itinerary
          </CardTitle>
          <CardDescription>
            Travelers see this day-by-day breakdown before deciding to join your trip
          </CardDescription>
        </div>
        {!showDayForm && (
          <Button size="sm" onClick={() => setShowDayForm(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Add Day
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {showDayForm && (
          <div className="space-y-2 rounded-lg border p-4">
            <Label>Day {days.length ? Math.max(...days.map((d) => d.day_number)) + 1 : 1}</Label>
            <Input
              placeholder="Day title (e.g. Arrival & City Tour of Addis Ababa)"
              value={dayTitle}
              onChange={(e) => setDayTitle(e.target.value)}
            />
            <Textarea
              placeholder="What happens this day? (optional)"
              value={dayDescription}
              onChange={(e) => setDayDescription(e.target.value)}
              rows={2}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddDay} disabled={savingDay}>
                {savingDay ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Plus className="mr-1 h-3.5 w-3.5" />}
                Add Day
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowDayForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : days.length === 0 && !showDayForm ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-10 text-center">
            <CalendarDays className="mb-2 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium">No itinerary yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Add a day-by-day breakdown with activities and photos — trips with a clear itinerary convert far better.
            </p>
          </div>
        ) : (
          days.map((day) => (
            <DayBlock
              key={day.id}
              tripId={tripId}
              day={day}
              onChanged={(updated) => setDays((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))}
              onDeleted={() => handleDeleteDay(day)}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}
