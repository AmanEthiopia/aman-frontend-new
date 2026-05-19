"use client"

import { useState, useEffect, useCallback } from "react"
import { getMediaUrl } from "@/lib/utils/media"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Plus,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Building2,
  UtensilsCrossed,
  Car,
  Camera,
  Map,
  Compass,
  Loader2,
  MoreHorizontal,
  Trash2,
  Edit2,
  Eye,
  Archive,
  CheckCircle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FEATURES } from "@/lib/config/features"
import { useToast } from "@/hooks/use-toast"
import {
  getMyTrips,
  createTrip,
  updateTrip,
  deleteTrip,
  getTripStatusVariant,
  type TripSummary,
  type TripTab,
  type TripStatus,
} from "@/lib/api/itinerary"

function TripCard({
  trip,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  trip: TripSummary
  onView: () => void
  onEdit: () => void
  onDelete: () => void
  onStatusChange: (status: TripStatus) => void
}) {
  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
    return `${startDate.toLocaleDateString("en-US", options)} - ${endDate.toLocaleDateString("en-US", { ...options, year: "numeric" })}`
  }

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-md">
      <div className="relative h-40 bg-gradient-to-br from-primary/20 to-primary/5">
        {trip.cover_photo ? (
          <img
            src={getMediaUrl(trip.cover_photo)}
            alt={trip.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Calendar className="h-12 w-12 text-primary/30" />
          </div>
        )}
        <div className="absolute right-2 top-2">
          <Badge variant={getTripStatusVariant(trip.status)} className="capitalize">
            {trip.status}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="font-semibold line-clamp-1">{trip.title}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                <Eye className="mr-2 h-4 w-4" />
                View Itinerary
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {trip.status === "draft" && (
                <DropdownMenuItem onClick={() => onStatusChange("active")}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Active
                </DropdownMenuItem>
              )}
              {trip.status === "active" && (
                <DropdownMenuItem onClick={() => onStatusChange("completed")}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Completed
                </DropdownMenuItem>
              )}
              {trip.status !== "archived" && (
                <DropdownMenuItem onClick={() => onStatusChange("archived")}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {trip.description && (
          <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{trip.description}</p>
        )}
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDateRange(trip.start_date, trip.end_date)}</span>
          <span className="text-muted-foreground/50">•</span>
          <span>{trip.duration_days} days</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span>{trip.city_count} {trip.city_count === 1 ? "city" : "cities"}</span>
          </div>
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="h-3 w-3" />
            <span>{trip.confirmed_count} confirmed</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{trip.planned_count} planned</span>
          </div>
        </div>
        <Button variant="outline" size="sm" className="mt-4 w-full" onClick={onView}>
          View Itinerary
        </Button>
      </CardContent>
    </Card>
  )
}

function EmptyTrips({ tab, onCreateTrip }: { tab: TripTab; onCreateTrip: () => void }) {
  const messages = {
    current: {
      title: "No current trips",
      description: "You don't have any trips happening right now. Create a new trip to start planning!",
    },
    upcoming: {
      title: "No upcoming trips",
      description: "Plan your next adventure by creating a new trip.",
    },
    past: {
      title: "No past trips",
      description: "Your completed trips will be saved here as travel memories.",
    },
  }

  const { title, description } = messages[tab]

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16 text-center">
      <div className="mb-4 rounded-full bg-primary/10 p-4">
        <Calendar className="h-8 w-8 text-primary" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>
      {tab !== "past" && (
        <div className="flex gap-3">
          {FEATURES.AI_CONCIERGE && (
            <Link href="/planner">
              <Button>
                <Sparkles className="mr-2 h-4 w-4" />
                AI Trip Planner
              </Button>
            </Link>
          )}
          <Button variant="outline" onClick={onCreateTrip}>
            <Plus className="mr-2 h-4 w-4" />
            Create Trip
          </Button>
        </div>
      )}
    </div>
  )
}

function CreateTripDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !startDate || !endDate) {
      toast({ title: "Please fill in all required fields", variant: "destructive" })
      return
    }

    if (new Date(endDate) < new Date(startDate)) {
      toast({ title: "End date must be after start date", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      await createTrip({
        title,
        description: description || undefined,
        start_date: startDate,
        end_date: endDate,
      })
      toast({ title: "Trip created successfully!" })
      onCreated()
      onOpenChange(false)
      // Reset form
      setTitle("")
      setDescription("")
      setStartDate("")
      setEndDate("")
    } catch (err: any) {
      toast({ title: err.message || "Failed to create trip", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Trip</DialogTitle>
          <DialogDescription>Plan your next Ethiopian adventure</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Trip Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Ethiopian Highlands Adventure"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="A brief description of your trip..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Trip
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function ItineraryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<TripTab>("current")
  const [trips, setTrips] = useState<TripSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingTrip, setEditingTrip] = useState<TripSummary | null>(null)
  const [deleteConfirmTrip, setDeleteConfirmTrip] = useState<TripSummary | null>(null)

  const loadTrips = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getMyTrips({ tab: activeTab })
      setTrips(data)
    } catch (err) {
      toast({ title: "Failed to load trips", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [activeTab, toast])

  useEffect(() => {
    loadTrips()
  }, [loadTrips])

  const handleView = (trip: TripSummary) => {
    router.push(`/itinerary/${trip.id}`)
  }

  const handleEdit = (trip: TripSummary) => {
    setEditingTrip(trip)
  }

  const handleDelete = async () => {
    if (!deleteConfirmTrip) return
    try {
      await deleteTrip(deleteConfirmTrip.id)
      toast({ title: "Trip deleted" })
      loadTrips()
    } catch (err: any) {
      toast({ title: err.message || "Failed to delete trip", variant: "destructive" })
    } finally {
      setDeleteConfirmTrip(null)
    }
  }

  const handleStatusChange = async (trip: TripSummary, status: TripStatus) => {
    try {
      await updateTrip(trip.id, { status })
      toast({ title: `Trip marked as ${status}` })
      loadTrips()
    } catch (err: any) {
      toast({ title: err.message || "Failed to update trip", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Itinerary</h1>
          <p className="text-muted-foreground">Plan and organize your trip activities</p>
        </div>
        <div className="flex gap-2">
          {FEATURES.AI_CONCIERGE && (
            <Link href="/planner">
              <Button variant="outline" size="sm">
                <Sparkles className="mr-2 h-4 w-4" />
                AI Planner
              </Button>
            </Link>
          )}
          <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Trip
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TripTab)} className="space-y-6">
        <TabsList>
          <TabsTrigger value="current">Current Trip</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past Trips</TabsTrigger>
        </TabsList>

        {["current", "upcoming", "past"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : trips.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {trips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    onView={() => handleView(trip)}
                    onEdit={() => handleEdit(trip)}
                    onDelete={() => setDeleteConfirmTrip(trip)}
                    onStatusChange={(status) => handleStatusChange(trip, status)}
                  />
                ))}
              </div>
            ) : (
              <EmptyTrips tab={tab as TripTab} onCreateTrip={() => setCreateDialogOpen(true)} />
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Create Trip Dialog */}
      <CreateTripDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={loadTrips}
      />

      {/* Edit Trip Dialog */}
      {editingTrip && (
        <Dialog open={!!editingTrip} onOpenChange={() => setEditingTrip(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Trip</DialogTitle>
            </DialogHeader>
            <EditTripForm
              trip={editingTrip}
              onSaved={() => {
                setEditingTrip(null)
                loadTrips()
              }}
              onCancel={() => setEditingTrip(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmTrip} onOpenChange={() => setDeleteConfirmTrip(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Trip</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteConfirmTrip?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmTrip(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EditTripForm({
  trip,
  onSaved,
  onCancel,
}: {
  trip: TripSummary
  onSaved: () => void
  onCancel: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState(trip.title)
  const [description, setDescription] = useState(trip.description || "")
  const [startDate, setStartDate] = useState(trip.start_date)
  const [endDate, setEndDate] = useState(trip.end_date)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateTrip(trip.id, {
        title,
        description: description || undefined,
        start_date: startDate,
        end_date: endDate,
      })
      toast({ title: "Trip updated!" })
      onSaved()
    } catch (err: any) {
      toast({ title: err.message || "Failed to update trip", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-title">Trip Title</Label>
        <Input
          id="edit-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-description">Description</Label>
        <Textarea
          id="edit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-startDate">Start Date</Label>
          <Input
            id="edit-startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-endDate">End Date</Label>
          <Input
            id="edit-endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
            required
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </DialogFooter>
    </form>
  )
}
