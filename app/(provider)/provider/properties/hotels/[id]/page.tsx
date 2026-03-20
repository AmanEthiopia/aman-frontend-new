"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  Star,
  MapPin,
  Clock,
  Users,
  Wifi,
  Car,
  Utensils,
  Dumbbell,
  Loader2,
  MoreHorizontal,
  Eye,
  CheckCircle2,
  XCircle,
  Camera,
  Bed,
  DollarSign,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import * as providerAPI from "@/lib/api/provider"
import type { ProviderHotel, ProviderRoom, CreateRoomPayload } from "@/lib/api/provider"

// Room amenities
const ROOM_AMENITIES = [
  "Air Conditioning",
  "Mini Bar",
  "Safe",
  "TV",
  "WiFi",
  "Work Desk",
  "Balcony",
  "City View",
  "Room Service",
  "Coffee Maker",
]

// Mock hotel data for demo
const mockHotel: ProviderHotel = {
  id: "1",
  name: "Sheraton Addis Hotel",
  nickname: "ሸራተን አዲስ",
  description: "A luxury 5-star hotel in the heart of Addis Ababa, offering world-class amenities, stunning city views, and exceptional service. Perfect for business travelers and tourists alike.",
  category: "hotel",
  city_id: "1",
  city_name: "Addis Ababa",
  address: "Taitu Street, Addis Ababa",
  is_verified: true,
  is_active: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-12-01T00:00:00Z",
  cover_photo_url: "/placeholder.svg?height=400&width=800",
  rating: 4.8,
  review_count: 256,
  star_rating: 5,
  check_in_time: "14:00",
  check_out_time: "12:00",
  amenities: [
    "Free WiFi",
    "Swimming Pool",
    "Spa",
    "Gym/Fitness Center",
    "Restaurant",
    "Bar",
    "Room Service",
    "Parking",
    "Airport Shuttle",
    "Business Center",
    "Conference Room",
  ],
  total_rooms: 24,
  available_rooms: 18,
  rooms: [
    {
      id: "r1",
      hotel_id: "1",
      name: "Standard Room",
      description: "Comfortable room with modern amenities",
      room_type: "standard",
      price_per_night: 120,
      max_guests: 2,
      bed_type: "Queen",
      amenities: ["Air Conditioning", "WiFi", "TV", "Mini Bar"],
      photos: [],
      is_available: true,
      quantity: 10,
    },
    {
      id: "r2",
      hotel_id: "1",
      name: "Deluxe Room",
      description: "Spacious room with city views",
      room_type: "deluxe",
      price_per_night: 180,
      max_guests: 2,
      bed_type: "King",
      amenities: ["Air Conditioning", "WiFi", "TV", "Mini Bar", "City View", "Work Desk"],
      photos: [],
      is_available: true,
      quantity: 8,
    },
    {
      id: "r3",
      hotel_id: "1",
      name: "Executive Suite",
      description: "Luxurious suite with separate living area",
      room_type: "suite",
      price_per_night: 320,
      max_guests: 3,
      bed_type: "King",
      amenities: ["Air Conditioning", "WiFi", "TV", "Mini Bar", "City View", "Work Desk", "Balcony", "Room Service"],
      photos: [],
      is_available: true,
      quantity: 4,
    },
    {
      id: "r4",
      hotel_id: "1",
      name: "Family Room",
      description: "Perfect for families with children",
      room_type: "family",
      price_per_night: 250,
      max_guests: 4,
      bed_type: "2 Double Beds",
      amenities: ["Air Conditioning", "WiFi", "TV", "Mini Bar", "Safe"],
      photos: [],
      is_available: true,
      quantity: 2,
    },
  ],
}

function AddRoomModal({
  open,
  onClose,
  hotelId,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  hotelId: string
  onSuccess: () => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<CreateRoomPayload>({
    name: "",
    description: "",
    room_type: "standard",
    price_per_night: 0,
    max_guests: 2,
    bed_type: "Queen",
    amenities: [],
    quantity: 1,
  })

  const updateField = <K extends keyof CreateRoomPayload>(key: K, value: CreateRoomPayload[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const toggleAmenity = (amenity: string) => {
    const amenities = formData.amenities || []
    if (amenities.includes(amenity)) {
      updateField("amenities", amenities.filter((a) => a !== amenity))
    } else {
      updateField("amenities", [...amenities, amenity])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await providerAPI.createRoom(hotelId, formData)
      toast.success("Room added successfully")
      onSuccess()
      onClose()
      setFormData({
        name: "",
        description: "",
        room_type: "standard",
        price_per_night: 0,
        max_guests: 2,
        bed_type: "Queen",
        amenities: [],
        quantity: 1,
      })
    } catch (error) {
      console.error("[v0] Failed to create room:", error)
      toast.error("Failed to add room")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Room</DialogTitle>
          <DialogDescription>Create a new room type for your hotel</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="room_name">Room Name *</Label>
              <Input
                id="room_name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g., Deluxe King Room"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Room Type *</Label>
              <Select
                value={formData.room_type}
                onValueChange={(v) => updateField("room_type", v as CreateRoomPayload["room_type"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="deluxe">Deluxe</SelectItem>
                  <SelectItem value="suite">Suite</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Describe this room type..."
              rows={3}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price/Night (USD) *</Label>
              <Input
                id="price"
                type="number"
                min={1}
                value={formData.price_per_night || ""}
                onChange={(e) => updateField("price_per_night", Number(e.target.value))}
                placeholder="120"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_guests">Max Guests *</Label>
              <Input
                id="max_guests"
                type="number"
                min={1}
                max={10}
                value={formData.max_guests}
                onChange={(e) => updateField("max_guests", Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bed_type">Bed Type *</Label>
              <Input
                id="bed_type"
                value={formData.bed_type}
                onChange={(e) => updateField("bed_type", e.target.value)}
                placeholder="e.g., King, 2 Queens"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                value={formData.quantity}
                onChange={(e) => updateField("quantity", Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Room Amenities</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              {ROOM_AMENITIES.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`room-amenity-${amenity}`}
                    checked={formData.amenities?.includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                  />
                  <Label htmlFor={`room-amenity-${amenity}`} className="cursor-pointer text-sm">
                    {amenity}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Room
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function RoomCard({
  room,
  onEdit,
  onDelete,
}: {
  room: ProviderRoom
  onEdit: () => void
  onDelete: () => void
}) {
  const roomTypeLabels: Record<string, string> = {
    standard: "Standard",
    deluxe: "Deluxe",
    suite: "Suite",
    executive: "Executive",
    family: "Family",
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Bed className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{room.name}</h4>
                <Badge variant="outline">{roomTypeLabels[room.room_type]}</Badge>
                {!room.is_available && (
                  <Badge variant="secondary">Unavailable</Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{room.description}</p>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Up to {room.max_guests} guests
                </span>
                <span className="flex items-center gap-1">
                  <Bed className="h-4 w-4 text-muted-foreground" />
                  {room.bed_type}
                </span>
                <span className="font-medium text-primary">
                  ${room.price_per_night}/night
                </span>
              </div>
              {room.amenities.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {room.amenities.slice(0, 4).map((amenity) => (
                    <Badge key={amenity} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {room.amenities.length > 4 && (
                    <Badge variant="secondary" className="text-xs">
                      +{room.amenities.length - 4} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{room.quantity} rooms</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Room
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Room
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function HotelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [hotel, setHotel] = useState<ProviderHotel | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadHotel()
  }, [resolvedParams.id])

  async function loadHotel() {
    setIsLoading(true)
    try {
      const data = await providerAPI.getMyHotel(resolvedParams.id)
      setHotel(data)
    } catch (error) {
      console.error("[v0] Failed to load hotel:", error)
      // Use mock data for demo
      setHotel(mockHotel)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await providerAPI.deleteHotel(resolvedParams.id)
      toast.success("Hotel deleted successfully")
      router.push("/provider/properties")
    } catch (error) {
      console.error("[v0] Failed to delete hotel:", error)
      toast.error("Failed to delete hotel")
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await providerAPI.deleteRoom(resolvedParams.id, roomId)
      toast.success("Room deleted successfully")
      loadHotel()
    } catch (error) {
      console.error("[v0] Failed to delete room:", error)
      toast.error("Failed to delete room")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!hotel) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-semibold">Hotel not found</h2>
        <Link href="/provider/properties">
          <Button className="mt-4">Back to Properties</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/provider/properties">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{hotel.name}</h1>
              {hotel.is_verified && (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>
            {hotel.nickname && (
              <p className="text-muted-foreground">{hotel.nickname}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/provider/properties/hotels/${hotel.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Cover Image & Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="relative aspect-[16/9]">
              {hotel.cover_photo_url ? (
                <img
                  src={hotel.cover_photo_url}
                  alt={hotel.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <Camera className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
              <div className="absolute left-4 top-4 flex gap-2">
                <Badge className="bg-background/90 text-foreground">
                  <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {hotel.star_rating} Star Hotel
                </Badge>
                {!hotel.is_active && (
                  <Badge variant="secondary" className="bg-gray-900/70 text-white">
                    Inactive
                  </Badge>
                )}
              </div>
            </div>
            <CardContent className="p-6">
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-1 h-4 w-4 flex-shrink-0" />
                <span>{hotel.address}, {hotel.city_name}</span>
              </div>
              <p className="mt-4">{hotel.description}</p>

              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <Clock className="mx-auto h-5 w-5 text-muted-foreground" />
                  <p className="mt-2 text-xs text-muted-foreground">Check-in</p>
                  <p className="font-semibold">{hotel.check_in_time}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <Clock className="mx-auto h-5 w-5 text-muted-foreground" />
                  <p className="mt-2 text-xs text-muted-foreground">Check-out</p>
                  <p className="font-semibold">{hotel.check_out_time}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <Bed className="mx-auto h-5 w-5 text-muted-foreground" />
                  <p className="mt-2 text-xs text-muted-foreground">Total Rooms</p>
                  <p className="font-semibold">{hotel.total_rooms || 0}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <CheckCircle2 className="mx-auto h-5 w-5 text-green-600" />
                  <p className="mt-2 text-xs text-muted-foreground">Available</p>
                  <p className="font-semibold">{hotel.available_rooms || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rating & Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-2xl font-bold text-primary">{hotel.rating?.toFixed(1) || "N/A"}</span>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(hotel.rating || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {hotel.review_count || 0} reviews
                  </p>
                </div>
              </div>
              <Link href="/provider/reviews">
                <Button variant="outline" className="mt-4 w-full">
                  View All Reviews
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {hotel.amenities?.map((amenity) => (
                  <Badge key={amenity} variant="secondary">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Rooms Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Room Types</CardTitle>
            <CardDescription>Manage your room inventory and pricing</CardDescription>
          </div>
          <Button onClick={() => setShowAddRoom(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Room
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {hotel.rooms && hotel.rooms.length > 0 ? (
            hotel.rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onEdit={() => router.push(`/provider/properties/hotels/${hotel.id}/rooms/${room.id}/edit`)}
                onDelete={() => handleDeleteRoom(room.id)}
              />
            ))
          ) : (
            <div className="py-8 text-center">
              <Bed className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="font-semibold">No rooms added yet</h3>
              <p className="text-muted-foreground">Add room types to start receiving bookings</p>
              <Button className="mt-4" onClick={() => setShowAddRoom(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Room
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Room Modal */}
      <AddRoomModal
        open={showAddRoom}
        onClose={() => setShowAddRoom(false)}
        hotelId={hotel.id}
        onSuccess={loadHotel}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hotel</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{hotel.name}"? This action cannot be undone
              and will remove all rooms, bookings, and reviews associated with this hotel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Hotel"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
