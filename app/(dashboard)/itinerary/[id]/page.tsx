"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Plus,
  Calendar,
  MapPin,
  Clock,
  Building2,
  UtensilsCrossed,
  Car,
  Camera,
  Map,
  Compass,
  GripVertical,
  Trash2,
  Edit2,
  ArrowLeft,
  Loader2,
  MoreHorizontal,
  CheckCircle,
  ExternalLink,
  CreditCard,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  getTripDetail,
  addTripDay,
  updateTripDay,
  deleteTripDay,
  addDayItem,
  updateDayItem,
  deleteDayItem,
  confirmItem,
  getItemDisplayName,
  getItemDetailUrl,
  getItemBookingUrl,
  getItemImageUrl,
  formatTimeSlot,
  type Trip,
  type ItineraryDay,
  type ItineraryItem,
  type ItemType,
  type ItemStatus,
  type CreateItemPayload,
  type UpdateItemPayload,
} from "@/lib/api/itinerary"
import { searchHotels, type Hotel } from "@/lib/api/hotels"
import { getRestaurants, type Restaurant } from "@/lib/api/restaurants"
import { getAttractions, type Attraction } from "@/lib/api/content"
import { getExperiences, type Package } from "@/lib/api/experiences"
import { searchGuides, type Guide } from "@/lib/api/guides"

const itemTypeConfig: Record<ItemType, { icon: typeof Building2; color: string; label: string }> = {
  hotel: { icon: Building2, color: "bg-blue-500/10 text-blue-600", label: "Hotel" },
  restaurant: { icon: UtensilsCrossed, color: "bg-orange-500/10 text-orange-600", label: "Restaurant" },
  attraction: { icon: Compass, color: "bg-emerald-500/10 text-emerald-600", label: "Attraction" },
  experience: { icon: Camera, color: "bg-purple-500/10 text-purple-600", label: "Experience" },
  guide: { icon: Map, color: "bg-indigo-500/10 text-indigo-600", label: "Guide" },
  transport: { icon: Car, color: "bg-green-500/10 text-green-600", label: "Transport" },
  custom: { icon: Calendar, color: "bg-gray-500/10 text-gray-600", label: "Custom" },
}

function ItineraryItemCard({
  item,
  tripId,
  dayId,
  onEdit,
  onDelete,
  onConfirm,
}: {
  item: ItineraryItem
  tripId: string
  dayId: string
  onEdit: () => void
  onDelete: () => void
  onConfirm: () => void
}) {
  const config = itemTypeConfig[item.item_type]
  const Icon = config.icon
  const displayName = getItemDisplayName(item)
  const detailUrl = getItemDetailUrl(item)
  const bookingUrl = getItemBookingUrl(item)
  const imageUrl = getItemImageUrl(item)

  const location = item.location ||
    item.hotel?.address ||
    item.restaurant?.address ||
    item.attraction?.address ||
    null

  return (
    <div className="group flex items-start gap-3 rounded-lg border bg-card p-3 transition-all hover:shadow-sm">
      <div className="cursor-grab opacity-0 transition-opacity group-hover:opacity-100">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      {imageUrl ? (
        <img src={imageUrl} alt={displayName} className="h-12 w-12 rounded-lg object-cover" />
      ) : (
        <div className={`rounded-lg p-3 ${config.color}`}>
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{displayName}</h4>
              {detailUrl && (
                <Link href={detailUrl} className="text-muted-foreground hover:text-primary">
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <Badge variant="outline" className="text-xs capitalize">
                {config.label}
              </Badge>
              {location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {location}
                </span>
              )}
              {item.time_slot && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimeSlot(item.time_slot)}
                </span>
              )}
              {item.duration_minutes && (
                <span className="text-xs">({item.duration_minutes} min)</span>
              )}
            </div>
          </div>
          <Badge variant={item.status === "confirmed" ? "default" : "secondary"} className="capitalize">
            {item.status}
          </Badge>
        </div>
        {(item.description || item.notes) && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {item.description || item.notes}
          </p>
        )}
      </div>
      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {item.status === "planned" && bookingUrl && (
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href={bookingUrl}>
              <CreditCard className="h-4 w-4" />
            </Link>
          </Button>
        )}
        {item.status === "planned" && (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={onConfirm} title="Mark as confirmed">
            <CheckCircle className="h-4 w-4" />
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function AddItemDialog({
  open,
  onOpenChange,
  tripId,
  dayId,
  onItemAdded,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  tripId: string
  dayId: string
  onItemAdded: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [itemType, setItemType] = useState<ItemType>("hotel")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedResource, setSelectedResource] = useState<any>(null)
  const [searching, setSearching] = useState(false)
  const [timeSlot, setTimeSlot] = useState("")
  const [durationMinutes, setDurationMinutes] = useState("")
  const [notes, setNotes] = useState("")
  // For custom/transport items
  const [customTitle, setCustomTitle] = useState("")
  const [customDescription, setCustomDescription] = useState("")
  const [customLocation, setCustomLocation] = useState("")
  const { toast } = useToast()

  const isDualMode = itemType === "custom" || itemType === "transport"
  const [subMode, setSubMode] = useState<"search" | "manual">("search")
  const [customSubType, setCustomSubType] = useState<"hotel" | "restaurant" | "attraction" | "experience" | "guide">("hotel")
  const isManualMode = isDualMode && subMode === "manual"
  const effectiveSearchType: ItemType =
    itemType === "transport" ? "guide" :
    itemType === "custom" ? customSubType :
    itemType

  const handleSearch = useCallback(async () => {
    if (isManualMode) return
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      let results: any[] = []
      switch (effectiveSearchType) {
        case "hotel":
          const hotelRes = await searchHotels({ search: searchQuery })
          results = hotelRes.results || []
          break
        case "restaurant":
          results = await getRestaurants({ search: searchQuery })
          break
        case "attraction":
          results = await getAttractions({ search: searchQuery })
          break
        case "experience":
          results = await getExperiences({ search: searchQuery })
          break
        case "guide":
          const guideRes = await searchGuides({ search: searchQuery })
          results = guideRes.results || []
          break
      }
      setSearchResults(results.slice(0, 10))
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }, [effectiveSearchType, searchQuery, isManualMode])

  useEffect(() => {
    const debounce = setTimeout(handleSearch, 300)
    return () => clearTimeout(debounce)
  }, [handleSearch])

  const resetForm = () => {
    setItemType("hotel")
    setSearchQuery("")
    setSearchResults([])
    setSelectedResource(null)
    setTimeSlot("")
    setDurationMinutes("")
    setNotes("")
    setCustomTitle("")
    setCustomDescription("")
    setCustomLocation("")
    setSubMode("search")
    setCustomSubType("hotel")
  }

  const handleSubmit = async () => {
    if (isManualMode && !customTitle.trim()) {
      toast({ title: "Please enter a title", variant: "destructive" })
      return
    }
    if (!isManualMode && !selectedResource) {
      toast({ title: "Please select an item", variant: "destructive" })
      return
    }

    const effectiveItemType: ItemType = isManualMode ? itemType : effectiveSearchType

    setLoading(true)
    try {
      const payload: CreateItemPayload = {
        item_type: effectiveItemType,
        time_slot: timeSlot || undefined,
        duration_minutes: durationMinutes ? parseInt(durationMinutes, 10) : undefined,
        notes: notes || undefined,
        status: "planned",
      }

      // Add resource ID based on effective type
      if (selectedResource && !isManualMode) {
        switch (effectiveItemType) {
          case "hotel":
            payload.hotel_id = selectedResource.id
            break
          case "restaurant":
            payload.restaurant_id = selectedResource.id
            break
          case "attraction":
            payload.attraction_id = selectedResource.id
            break
          case "experience":
            payload.experience_id = selectedResource.id
            break
          case "guide":
            payload.guide_id = selectedResource.id
            break
        }
      }

      // For manual entry items
      if (isManualMode) {
        payload.title = customTitle
        payload.description = customDescription || undefined
        payload.location = customLocation || undefined
      }

      await addDayItem(tripId, dayId, payload)
      toast({ title: "Item added to itinerary!" })
      onItemAdded()
      onOpenChange(false)
      resetForm()
    } catch (err: any) {
      toast({ title: err.message || "Failed to add item", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const getResourceDisplayName = (resource: any): string => {
    return resource.name || resource.title || resource.nickname || "Untitled"
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add to Itinerary</DialogTitle>
          <DialogDescription>Add an activity, accommodation, or experience to your day</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={itemType} onValueChange={(v) => { setItemType(v as ItemType); setSelectedResource(null); setSearchResults([]); setSearchQuery(""); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(itemTypeConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <config.icon className="h-4 w-4" />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isDualMode ? (
            <Tabs value={subMode} onValueChange={(v) => { setSubMode(v as "search" | "manual"); setSelectedResource(null); setSearchResults([]); setSearchQuery("") }}>
              <TabsList className="w-full">
                <TabsTrigger value="search" className="flex-1">
                  {itemType === "transport" ? "Find Driver/Guide" : "Search Algalle"}
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex-1">
                  Custom Entry
                </TabsTrigger>
              </TabsList>

              <TabsContent value="search" className="mt-2 space-y-2">
                {itemType === "custom" && (
                  <Select value={customSubType} onValueChange={(v) => { setCustomSubType(v as any); setSelectedResource(null); setSearchResults([]); setSearchQuery("") }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["hotel", "restaurant", "attraction", "experience", "guide"] as const).map((type) => {
                        const SubIcon = itemTypeConfig[type].icon
                        return (
                          <SelectItem key={type} value={type}>
                            <div className="flex items-center gap-2">
                              <SubIcon className="h-4 w-4" />
                              {itemTypeConfig[type].label}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                )}
                <Input
                  placeholder={`Search for a ${itemType === "transport" ? "driver or guide" : itemTypeConfig[effectiveSearchType].label.toLowerCase()}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searching && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching...
                  </div>
                )}
                {searchResults.length > 0 && (
                  <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border p-2">
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        type="button"
                        className={`w-full rounded-md p-2 text-left text-sm transition-colors hover:bg-accent ${
                          selectedResource?.id === result.id ? "bg-primary/10 ring-1 ring-primary" : ""
                        }`}
                        onClick={() => setSelectedResource(result)}
                      >
                        <p className="font-medium">{getResourceDisplayName(result)}</p>
                        {result.address && <p className="text-xs text-muted-foreground">{result.address}</p>}
                      </button>
                    ))}
                  </div>
                )}
                {selectedResource && (
                  <div className="rounded-lg border bg-primary/5 p-3">
                    <p className="font-medium">Selected: {getResourceDisplayName(selectedResource)}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="manual" className="mt-2 space-y-2">
                <div className="space-y-2">
                  <Label htmlFor="customTitle">Title *</Label>
                  <Input
                    id="customTitle"
                    placeholder={itemType === "transport" ? "e.g., Flight to Lalibela" : "e.g., Visit local market"}
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customDescription">Description</Label>
                  <Textarea
                    id="customDescription"
                    placeholder="Optional description..."
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customLocation">Location</Label>
                  <Input
                    id="customLocation"
                    placeholder="e.g., Merkato, Addis Ababa"
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                  />
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-2">
              <Label>Search {itemTypeConfig[itemType].label}</Label>
              <Input
                placeholder={`Search for a ${itemTypeConfig[itemType].label.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searching && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </div>
              )}
              {searchResults.length > 0 && (
                <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border p-2">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      type="button"
                      className={`w-full rounded-md p-2 text-left text-sm transition-colors hover:bg-accent ${
                        selectedResource?.id === result.id ? "bg-primary/10 ring-1 ring-primary" : ""
                      }`}
                      onClick={() => setSelectedResource(result)}
                    >
                      <p className="font-medium">{getResourceDisplayName(result)}</p>
                      {result.address && (
                        <p className="text-xs text-muted-foreground">{result.address}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {selectedResource && (
                <div className="rounded-lg border bg-primary/5 p-3">
                  <p className="font-medium">Selected: {getResourceDisplayName(selectedResource)}</p>
                </div>
              )}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="timeSlot">Time</Label>
              <Input
                id="timeSlot"
                type="time"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="e.g., 120"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any special notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add to Itinerary
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AddDayDialog({
  open,
  onOpenChange,
  tripId,
  tripStartDate,
  tripEndDate,
  existingDates,
  onDayAdded,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  tripId: string
  tripStartDate: string
  tripEndDate: string
  existingDates: string[]
  onDayAdded: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState("")
  const [title, setTitle] = useState("")
  const [notes, setNotes] = useState("")
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date) {
      toast({ title: "Please select a date", variant: "destructive" })
      return
    }
    if (existingDates.includes(date)) {
      toast({ title: "This date already exists in your itinerary", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      await addTripDay(tripId, {
        date,
        title: title || undefined,
        notes: notes || undefined,
      })
      toast({ title: "Day added!" })
      onDayAdded()
      onOpenChange(false)
      setDate("")
      setTitle("")
      setNotes("")
    } catch (err: any) {
      toast({ title: err.message || "Failed to add day", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Day</DialogTitle>
          <DialogDescription>Add a new day to your trip itinerary</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={tripStartDate}
              max={tripEndDate}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dayTitle">Day Title</Label>
            <Input
              id="dayTitle"
              placeholder="e.g., Arrival Day"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dayNotes">Notes</Label>
            <Textarea
              id="dayNotes"
              placeholder="Any notes for this day..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Day
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditItemDialog({
  open,
  onOpenChange,
  tripId,
  dayId,
  item,
  onItemUpdated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  tripId: string
  dayId: string
  item: ItineraryItem
  onItemUpdated: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [timeSlot, setTimeSlot] = useState(item.time_slot || "")
  const [durationMinutes, setDurationMinutes] = useState(item.duration_minutes ? String(item.duration_minutes) : "")
  const [notes, setNotes] = useState(item.notes || "")
  const [status, setStatus] = useState<ItemStatus>(item.status)
  const [title, setTitle] = useState(item.title || "")
  const [description, setDescription] = useState(item.description || "")
  const [location, setLocation] = useState(item.location || "")
  const { toast } = useToast()

  const isCustomOrTransport = item.item_type === "custom" || item.item_type === "transport"

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const payload: UpdateItemPayload = {
        status,
        time_slot: timeSlot || undefined,
        duration_minutes: durationMinutes ? parseInt(durationMinutes, 10) : undefined,
        notes: notes || undefined,
      }
      if (isCustomOrTransport) {
        payload.title = title || undefined
        payload.description = description || undefined
        payload.location = location || undefined
      }
      await updateDayItem(tripId, dayId, item.id, payload)
      toast({ title: "Activity updated!" })
      onItemUpdated()
      onOpenChange(false)
    } catch (err: any) {
      toast({ title: err.message || "Failed to update activity", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Activity</DialogTitle>
          <DialogDescription>Update details for this activity</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isCustomOrTransport && (
            <>
              <div className="space-y-2">
                <Label htmlFor="editTitle">Title *</Label>
                <Input
                  id="editTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editLocation">Location</Label>
                <Input
                  id="editLocation"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as ItemStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="editTimeSlot">Time</Label>
              <Input
                id="editTimeSlot"
                type="time"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDuration">Duration (minutes)</Label>
              <Input
                id="editDuration"
                type="number"
                placeholder="e.g., 120"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="editNotes">Notes</Label>
            <Textarea
              id="editNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function TripDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tripId = params.id as string
  const { toast } = useToast()
  
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<{ notFound: boolean } | null>(null)
  const [addDayOpen, setAddDayOpen] = useState(false)
  const [addItemDay, setAddItemDay] = useState<ItineraryDay | null>(null)
  const [editingItem, setEditingItem] = useState<{ dayId: string; item: ItineraryItem } | null>(null)
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{ dayId: string; itemId: string } | null>(null)
  const [deleteConfirmDay, setDeleteConfirmDay] = useState<ItineraryDay | null>(null)

  const loadTrip = useCallback(async () => {
    setLoading(true)
    setPageError(null)
    try {
      const data = await getTripDetail(tripId)
      setTrip(data)
    } catch (err: any) {
      setPageError({ notFound: err?.status === 404 })
      if (err?.status !== 404) {
        toast({ title: "Failed to load trip", variant: "destructive" })
      }
    } finally {
      setLoading(false)
    }
  }, [tripId, toast])

  useEffect(() => {
    loadTrip()
  }, [loadTrip])

  const handleDeleteDay = async () => {
    if (!deleteConfirmDay) return
    try {
      await deleteTripDay(tripId, deleteConfirmDay.id)
      toast({ title: "Day deleted" })
      loadTrip()
    } catch (err: any) {
      toast({ title: err.message || "Failed to delete day", variant: "destructive" })
    } finally {
      setDeleteConfirmDay(null)
    }
  }

  const handleDeleteItem = async () => {
    if (!deleteConfirmItem) return
    try {
      await deleteDayItem(tripId, deleteConfirmItem.dayId, deleteConfirmItem.itemId)
      toast({ title: "Item removed" })
      loadTrip()
    } catch (err: any) {
      toast({ title: err.message || "Failed to remove item", variant: "destructive" })
    } finally {
      setDeleteConfirmItem(null)
    }
  }

  const handleConfirmItem = async (dayId: string, itemId: string) => {
    try {
      await confirmItem(tripId, dayId, itemId)
      toast({ title: "Item confirmed!" })
      loadTrip()
    } catch (err: any) {
      toast({ title: err.message || "Failed to confirm item", variant: "destructive" })
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return {
      day: date.toLocaleDateString("en-US", { weekday: "long" }),
      date: date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    }
  }

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
    return `${startDate.toLocaleDateString("en-US", options)} - ${endDate.toLocaleDateString("en-US", { ...options, year: "numeric" })}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Calendar className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h2 className="text-xl font-semibold">
          {pageError?.notFound ? "Trip not found" : "Failed to load trip"}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {pageError?.notFound
            ? "This trip doesn't exist or you don't have access to it."
            : "Something went wrong loading your trip. Please try again."}
        </p>
        <div className="mt-6 flex gap-3">
          {!pageError?.notFound && (
            <Button variant="outline" onClick={() => loadTrip()}>
              Try Again
            </Button>
          )}
          <Button variant={pageError?.notFound ? "outline" : "ghost"} onClick={() => router.push("/itinerary")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Trips
          </Button>
        </div>
      </div>
    )
  }

  const sortedDays = [...(trip.days || [])].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/itinerary")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{trip.title}</h1>
          <p className="text-muted-foreground">
            {formatDateRange(trip.start_date, trip.end_date)} • {trip.duration_days} days
          </p>
        </div>
        <Badge variant={trip.status === "active" ? "default" : "secondary"} className="capitalize">
          {trip.status}
        </Badge>
      </div>

      {/* Overview Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{trip.confirmed_count}</p>
              <p className="text-muted-foreground">Confirmed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{trip.planned_count}</p>
              <p className="text-muted-foreground">Planned</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{trip.city_count}</p>
              <p className="text-muted-foreground">Cities</p>
            </div>
          </div>
          <Button onClick={() => setAddDayOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Day
          </Button>
        </CardContent>
      </Card>

      {/* Daily Itinerary */}
      {sortedDays.length > 0 ? (
        <div className="space-y-6">
          {sortedDays.map((day, index) => {
            const { day: dayName, date } = formatDate(day.date)
            const sortedItems = [...(day.items || [])].sort((a, b) => {
              if (a.order !== b.order) return a.order - b.order
              if (a.time_slot && b.time_slot) return a.time_slot.localeCompare(b.time_slot)
              return 0
            })

            return (
              <div key={day.id}>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold">{day.title || dayName}</h3>
                      <p className="text-sm text-muted-foreground">{date}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setAddItemDay(day)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Activity
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteConfirmDay(day)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Day
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="ml-5 space-y-3 border-l-2 border-muted pl-8">
                  {sortedItems.map((item) => (
                    <ItineraryItemCard
                      key={item.id}
                      item={item}
                      tripId={tripId}
                      dayId={day.id}
                      onEdit={() => setEditingItem({ dayId: day.id, item })}
                      onDelete={() => setDeleteConfirmItem({ dayId: day.id, itemId: item.id })}
                      onConfirm={() => handleConfirmItem(day.id, item.id)}
                    />
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-3 text-muted-foreground"
                    onClick={() => setAddItemDay(day)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add activity
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="mb-4 h-10 w-10 text-muted-foreground/50" />
            <h3 className="mb-2 font-semibold">No days added yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Start building your itinerary by adding days to your trip.
            </p>
            <Button onClick={() => setAddDayOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Day
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Day Dialog */}
      <AddDayDialog
        open={addDayOpen}
        onOpenChange={setAddDayOpen}
        tripId={tripId}
        tripStartDate={trip.start_date}
        tripEndDate={trip.end_date}
        existingDates={sortedDays.map((d) => d.date)}
        onDayAdded={loadTrip}
      />

      {/* Add Item Dialog */}
      {addItemDay && (
        <AddItemDialog
          open={!!addItemDay}
          onOpenChange={() => setAddItemDay(null)}
          tripId={tripId}
          dayId={addItemDay.id}
          onItemAdded={loadTrip}
        />
      )}

      {/* Edit Item Dialog */}
      {editingItem && (
        <EditItemDialog
          open={!!editingItem}
          onOpenChange={(open) => { if (!open) setEditingItem(null) }}
          tripId={tripId}
          dayId={editingItem.dayId}
          item={editingItem.item}
          onItemUpdated={() => { setEditingItem(null); loadTrip() }}
        />
      )}

      {/* Delete Day Confirmation */}
      <Dialog open={!!deleteConfirmDay} onOpenChange={() => setDeleteConfirmDay(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Day</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this day and all its activities? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmDay(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDay}>
              Delete Day
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Item Confirmation */}
      <Dialog open={!!deleteConfirmItem} onOpenChange={() => setDeleteConfirmItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Activity</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this activity from your itinerary?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmItem(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
