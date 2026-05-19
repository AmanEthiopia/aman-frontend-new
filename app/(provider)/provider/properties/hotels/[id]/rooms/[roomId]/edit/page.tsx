"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, Check, Bed } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import * as providerAPI from "@/lib/api/provider"
import { amenityLabel } from "@/lib/api/provider"
import type { ProviderRoom } from "@/lib/api/provider"

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

interface RoomFormData {
  name: string
  description: string
  room_type: "standard" | "deluxe" | "suite" | "executive" | "family"
  price_per_night: number
  max_guests: number
  bed_type: string
  amenities: string[]
  quantity: number
}

export default function EditRoomPage({
  params,
}: {
  params: Promise<{ id: string; roomId: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { id: hotelId, roomId } = resolvedParams

  const [room, setRoom] = useState<ProviderRoom | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<RoomFormData>({
    name: "",
    description: "",
    room_type: "standard",
    price_per_night: 0,
    max_guests: 2,
    bed_type: "Queen",
    amenities: [],
    quantity: 1,
  })

  useEffect(() => {
    loadRoom()
  }, [hotelId, roomId])

  async function loadRoom() {
    setIsLoading(true)
    try {
      const data = await providerAPI.getMyRoom(hotelId, roomId)
      setRoom(data)
      setFormData({
        name: data.name || "",
        description: data.description || "",
        room_type: data.room_type || "standard",
        // API returns base_price; fall back to price_per_night from payload shape
        price_per_night: Number(data.base_price ?? data.price_per_night ?? 0),
        // API returns max_adults; fall back to max_guests
        max_guests: data.max_adults ?? data.max_guests ?? 2,
        bed_type: data.bed_type || "Queen",
        // API returns amenities as objects — extract the string label for the form
        amenities: (data.amenities || []).map(amenityLabel),
        // API returns total_units; fall back to quantity
        quantity: data.total_units ?? data.quantity ?? 1,
      })
    } catch (error) {
      console.error("[v0] Failed to load room:", error)
      toast.error("Failed to load room data")
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = <K extends keyof RoomFormData>(key: K, value: RoomFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const toggleAmenity = (amenity: string) => {
    if (formData.amenities.includes(amenity)) {
      updateField("amenities", formData.amenities.filter((a) => a !== amenity))
    } else {
      updateField("amenities", [...formData.amenities, amenity])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await providerAPI.updateRoom(hotelId, roomId, formData)
      toast.success("Room updated successfully")
      router.push(`/provider/properties/hotels/${hotelId}`)
    } catch (error) {
      console.error("[v0] Failed to update room:", error)
      toast.error("Failed to update room")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!room) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-semibold">Room not found</h2>
        <Link href={`/provider/properties/hotels/${hotelId}`}>
          <Button className="mt-4">Back to Hotel</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/provider/properties/hotels/${hotelId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Room</h1>
          <p className="text-muted-foreground">{room.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bed className="h-5 w-5" />
              Room Details
            </CardTitle>
            <CardDescription>Update the details for this room type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Room Name *</Label>
                <Input
                  id="name"
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
                  onValueChange={(v) => updateField("room_type", v as RoomFormData["room_type"])}
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
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Room Amenities</CardTitle>
            <CardDescription>Select amenities available in this room</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-3">
              {ROOM_AMENITIES.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`amenity-${amenity}`}
                    checked={formData.amenities.includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                  />
                  <Label htmlFor={`amenity-${amenity}`} className="cursor-pointer text-sm">
                    {amenity}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link href={`/provider/properties/hotels/${hotelId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
