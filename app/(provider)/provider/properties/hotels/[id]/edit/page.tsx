"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Loader2,
  Check,
  Building2,
  Clock,
  MapPin,
  Star,
} from "lucide-react"
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
import * as contentAPI from "@/lib/api/content"
import type { ProviderHotel, CreateHotelPayload } from "@/lib/api/provider"
import type { City } from "@/lib/api/content"

// Hotel amenities options
const HOTEL_AMENITIES = [
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
  "Laundry Service",
  "Air Conditioning",
  "Pet Friendly",
  "Wheelchair Accessible",
  "24-Hour Front Desk",
]

// Mock hotel data for demo
const mockHotel: ProviderHotel = {
  id: "1",
  name: "Sheraton Addis Hotel",
  nickname: "ሸራተን አዲስ",
  description: "A luxury 5-star hotel in the heart of Addis Ababa, offering world-class amenities, stunning city views, and exceptional service.",
  category: "hotel",
  city_id: "1",
  city_name: "Addis Ababa",
  address: "Taitu Street, Addis Ababa",
  is_verified: true,
  is_active: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-12-01T00:00:00Z",
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
  ],
}

export default function EditHotelPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [hotel, setHotel] = useState<ProviderHotel | null>(null)
  const [cities, setCities] = useState<City[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<CreateHotelPayload>>({})

  useEffect(() => {
    loadData()
  }, [resolvedParams.id])

  async function loadData() {
    setIsLoading(true)
    try {
      // Load hotel and cities in parallel
      const [hotelData, citiesData] = await Promise.all([
        providerAPI.getMyHotel(resolvedParams.id).catch(() => mockHotel),
        contentAPI.getCities().catch(() => []),
      ])

      setHotel(hotelData)
      setCities(citiesData)
      
      // Initialize form with hotel data
      setFormData({
        name: hotelData.name,
        nickname: hotelData.nickname || "",
        description: hotelData.description,
        category: "hotel",
        star_rating: hotelData.star_rating,
        address: hotelData.address,
        city_id: hotelData.city_id,
        check_in_time: hotelData.check_in_time,
        check_out_time: hotelData.check_out_time,
        amenities: hotelData.amenities || [],
      })
    } catch (error) {
      console.error("[v0] Failed to load hotel:", error)
      toast.error("Failed to load hotel data")
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = <K extends keyof CreateHotelPayload>(key: K, value: CreateHotelPayload[K]) => {
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
      await providerAPI.updateHotel(resolvedParams.id, formData)
      toast.success("Hotel updated successfully")
      router.push(`/provider/properties/hotels/${resolvedParams.id}`)
    } catch (error) {
      console.error("[v0] Failed to update hotel:", error)
      toast.error("Failed to update hotel")
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
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/provider/properties/hotels/${hotel.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Hotel</h1>
          <p className="text-muted-foreground">{hotel.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Update the basic details about your hotel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Hotel Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g., Grand Palace Hotel"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nickname">Amharic Name (Optional)</Label>
                <Input
                  id="nickname"
                  value={formData.nickname || ""}
                  onChange={(e) => updateField("nickname", e.target.value)}
                  placeholder="e.g., ግራንድ ፓላስ ሆቴል"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Describe your hotel, its unique features, and what guests can expect..."
                rows={4}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Star Rating *</Label>
                <Select
                  value={String(formData.star_rating || 3)}
                  onValueChange={(v) => updateField("star_rating", Number(v) as 1 | 2 | 3 | 4 | 5)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <SelectItem key={rating} value={String(rating)}>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                          <span className="ml-2">{rating} Star</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>City *</Label>
                <Select
                  value={formData.city_id || ""}
                  onValueChange={(v) => updateField("city_id", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {city.name}
                          {city.nickname && (
                            <span className="text-muted-foreground">({city.nickname})</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address || ""}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="e.g., Bole Road, Addis Ababa"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Check-in/out Times */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Check-in & Check-out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="check_in">Check-in Time *</Label>
                <Input
                  id="check_in"
                  type="time"
                  value={formData.check_in_time || "14:00"}
                  onChange={(e) => updateField("check_in_time", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="check_out">Check-out Time *</Label>
                <Input
                  id="check_out"
                  type="time"
                  value={formData.check_out_time || "12:00"}
                  onChange={(e) => updateField("check_out_time", e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
            <CardDescription>Select the amenities your hotel offers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {HOTEL_AMENITIES.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`amenity-${amenity}`}
                    checked={formData.amenities?.includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                  />
                  <Label htmlFor={`amenity-${amenity}`} className="cursor-pointer">
                    {amenity}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link href={`/provider/properties/hotels/${hotel.id}`}>
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
