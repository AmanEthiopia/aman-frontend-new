"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  Building2,
  UtensilsCrossed,
  Car,
  Map,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  MapPin,
  Clock,
  DollarSign,
  Users,
  ImageIcon,
  Plus,
  X,
  Star,
  Info,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import type {
  PropertyCategory,
  CreateHotelPayload,
  CreateRestaurantPayload,
  CreateDriverPayload,
  CreateTripPayload,
  City,
  DriverService,
} from "@/lib/api/provider"

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

// Restaurant cuisine types
const CUISINE_TYPES = [
  "Ethiopian",
  "Italian",
  "Chinese",
  "Indian",
  "Japanese",
  "Mexican",
  "Thai",
  "Mediterranean",
  "American",
  "French",
  "Middle Eastern",
  "Vegetarian/Vegan",
  "Seafood",
  "BBQ/Grill",
  "Café",
  "Fast Food",
]

// Driver services
const DRIVER_SERVICES: { value: DriverService; label: string }[] = [
  { value: "airport_pickup", label: "Airport Pickup" },
  { value: "airport_dropoff", label: "Airport Drop-off" },
  { value: "city_tour", label: "City Tours" },
  { value: "intercity", label: "Intercity Travel" },
  { value: "hourly_rental", label: "Hourly Rental" },
  { value: "daily_rental", label: "Daily Rental" },
  { value: "hotel_transfer", label: "Hotel Transfers" },
]

// Languages
const LANGUAGES = [
  "Amharic",
  "English",
  "Tigrinya",
  "Oromo",
  "French",
  "Arabic",
  "Italian",
  "German",
  "Spanish",
  "Chinese",
]

// Trip included services
const TRIP_SERVICES = [
  "Transportation",
  "Accommodation",
  "Meals",
  "Guide Service",
  "Entry Fees",
  "Equipment",
  "Insurance",
  "Airport Pickup",
  "Photography",
]

function PropertyTypeSelector({
  selected,
  onSelect,
}: {
  selected: PropertyCategory | null
  onSelect: (type: PropertyCategory) => void
}) {
  const types: { value: PropertyCategory; label: string; description: string; icon: typeof Building2 }[] = [
    {
      value: "hotel",
      label: "Hotel",
      description: "List your hotel, guesthouse, or accommodation",
      icon: Building2,
    },
    {
      value: "restaurant",
      label: "Restaurant",
      description: "List your restaurant, café, or food service",
      icon: UtensilsCrossed,
    },
    {
      value: "driver",
      label: "Driver Service",
      description: "Offer transportation and driver services",
      icon: Car,
    },
    {
      value: "trip",
      label: "Trip / Event",
      description: "Create tour packages, trips, or events",
      icon: Map,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {types.map((type) => {
        const Icon = type.icon
        const isSelected = selected === type.value
        return (
          <button
            key={type.value}
            onClick={() => onSelect(type.value)}
            className={`flex items-start gap-4 rounded-lg border-2 p-4 text-left transition-all ${
              isSelected
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className={`rounded-lg p-3 ${isSelected ? "bg-primary/10" : "bg-muted"}`}>
              <Icon className={`h-6 w-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div>
              <h3 className={`font-semibold ${isSelected ? "text-primary" : ""}`}>{type.label}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{type.description}</p>
            </div>
            {isSelected && (
              <Check className="ml-auto h-5 w-5 flex-shrink-0 text-primary" />
            )}
          </button>
        )
      })}
    </div>
  )
}

function HotelForm({
  cities,
  onSubmit,
  isSubmitting,
}: {
  cities: City[]
  onSubmit: (data: CreateHotelPayload) => void
  isSubmitting: boolean
}) {
  const [formData, setFormData] = useState<CreateHotelPayload>({
    name: "",
    nickname: "",
    description: "",
    category: "hotel",
    star_rating: 3,
    address: "",
    city_id: "",
    check_in_time: "14:00",
    check_out_time: "12:00",
    amenities: [],
  })

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>Enter the basic details about your hotel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Hotel Name *</Label>
              <Input
                id="name"
                value={formData.name}
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
              value={formData.description}
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
                value={String(formData.star_rating)}
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
                value={formData.city_id}
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
              value={formData.address}
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
                value={formData.check_in_time}
                onChange={(e) => updateField("check_in_time", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="check_out">Check-out Time *</Label>
              <Input
                id="check_out"
                type="time"
                value={formData.check_out_time}
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
        <Link href="/provider/properties">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Create Hotel
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

function RestaurantForm({
  cities,
  onSubmit,
  isSubmitting,
}: {
  cities: City[]
  onSubmit: (data: CreateRestaurantPayload) => void
  isSubmitting: boolean
}) {
  const [formData, setFormData] = useState<CreateRestaurantPayload>({
    name: "",
    nickname: "",
    description: "",
    category: "restaurant",
    cuisine_types: [],
    price_range: "mid_range",
    address: "",
    city_id: "",
    opening_hours: {
      monday: "08:00-22:00",
      tuesday: "08:00-22:00",
      wednesday: "08:00-22:00",
      thursday: "08:00-22:00",
      friday: "08:00-22:00",
      saturday: "08:00-22:00",
      sunday: "08:00-22:00",
    },
    seating_capacity: undefined,
    has_delivery: false,
    has_takeaway: false,
    has_dine_in: true,
  })

  const updateField = <K extends keyof CreateRestaurantPayload>(key: K, value: CreateRestaurantPayload[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const toggleCuisine = (cuisine: string) => {
    if (formData.cuisine_types.includes(cuisine)) {
      updateField("cuisine_types", formData.cuisine_types.filter((c) => c !== cuisine))
    } else {
      updateField("cuisine_types", [...formData.cuisine_types, cuisine])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Restaurant Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g., Yod Abyssinia"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nickname">Amharic Name (Optional)</Label>
              <Input
                id="nickname"
                value={formData.nickname || ""}
                onChange={(e) => updateField("nickname", e.target.value)}
                placeholder="e.g., ዮድ አቢሲኒያ"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Describe your restaurant, cuisine, atmosphere, and specialties..."
              rows={4}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Price Range *</Label>
              <Select
                value={formData.price_range}
                onValueChange={(v) => updateField("price_range", v as typeof formData.price_range)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="budget">Budget ($)</SelectItem>
                  <SelectItem value="mid_range">Mid-Range ($$)</SelectItem>
                  <SelectItem value="fine_dining">Fine Dining ($$$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>City *</Label>
              <Select
                value={formData.city_id}
                onValueChange={(v) => updateField("city_id", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="e.g., Bole Road"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Seating Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.seating_capacity || ""}
                onChange={(e) => updateField("seating_capacity", e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g., 100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cuisine Types */}
      <Card>
        <CardHeader>
          <CardTitle>Cuisine Types *</CardTitle>
          <CardDescription>Select the types of cuisine you offer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {CUISINE_TYPES.map((cuisine) => (
              <Badge
                key={cuisine}
                variant={formData.cuisine_types.includes(cuisine) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleCuisine(cuisine)}
              >
                {cuisine}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Service Options */}
      <Card>
        <CardHeader>
          <CardTitle>Service Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dine_in"
                checked={formData.has_dine_in}
                onCheckedChange={(checked) => updateField("has_dine_in", !!checked)}
              />
              <Label htmlFor="dine_in">Dine-in</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="takeaway"
                checked={formData.has_takeaway}
                onCheckedChange={(checked) => updateField("has_takeaway", !!checked)}
              />
              <Label htmlFor="takeaway">Takeaway</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="delivery"
                checked={formData.has_delivery}
                onCheckedChange={(checked) => updateField("has_delivery", !!checked)}
              />
              <Label htmlFor="delivery">Delivery</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Link href="/provider/properties">
          <Button type="button" variant="outline">Cancel</Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Create Restaurant
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

function DriverForm({
  cities,
  onSubmit,
  isSubmitting,
}: {
  cities: City[]
  onSubmit: (data: CreateDriverPayload) => void
  isSubmitting: boolean
}) {
  const [formData, setFormData] = useState<CreateDriverPayload>({
    name: "",
    nickname: "",
    description: "",
    category: "driver",
    vehicle_type: "sedan",
    vehicle_make: "",
    vehicle_model: "",
    vehicle_year: undefined,
    license_plate: "",
    max_passengers: 4,
    languages: ["Amharic", "English"],
    services: [],
    city_id: "",
    address: "",
    price_per_km: undefined,
    price_per_hour: undefined,
    price_per_day: undefined,
    is_airport_pickup: false,
    is_available_24h: false,
  })

  const updateField = <K extends keyof CreateDriverPayload>(key: K, value: CreateDriverPayload[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const toggleService = (service: DriverService) => {
    if (formData.services.includes(service)) {
      updateField("services", formData.services.filter((s) => s !== service))
    } else {
      updateField("services", [...formData.services, service])
    }
  }

  const toggleLanguage = (language: string) => {
    if (formData.languages.includes(language)) {
      updateField("languages", formData.languages.filter((l) => l !== language))
    } else {
      updateField("languages", [...formData.languages, language])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Driver Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g., Premium Airport Transfer"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nickname">Amharic Name (Optional)</Label>
              <Input
                id="nickname"
                value={formData.nickname || ""}
                onChange={(e) => updateField("nickname", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Describe your service, experience, and what makes you unique..."
              rows={4}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>City *</Label>
              <Select
                value={formData.city_id}
                onValueChange={(v) => updateField("city_id", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Base Location *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="e.g., Bole International Airport"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Info */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Vehicle Type *</Label>
              <Select
                value={formData.vehicle_type}
                onValueChange={(v) => updateField("vehicle_type", v as typeof formData.vehicle_type)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedan">Sedan</SelectItem>
                  <SelectItem value="suv">SUV</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                  <SelectItem value="minibus">Minibus</SelectItem>
                  <SelectItem value="bus">Bus</SelectItem>
                  <SelectItem value="motorcycle">Motorcycle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="make">Make</Label>
              <Input
                id="make"
                value={formData.vehicle_make || ""}
                onChange={(e) => updateField("vehicle_make", e.target.value)}
                placeholder="e.g., Toyota"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={formData.vehicle_model || ""}
                onChange={(e) => updateField("vehicle_model", e.target.value)}
                placeholder="e.g., Land Cruiser"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passengers">Max Passengers *</Label>
              <Input
                id="passengers"
                type="number"
                min={1}
                max={50}
                value={formData.max_passengers}
                onChange={(e) => updateField("max_passengers", Number(e.target.value))}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle>Services Offered *</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DRIVER_SERVICES.map((service) => (
              <div key={service.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`service-${service.value}`}
                  checked={formData.services.includes(service.value)}
                  onCheckedChange={() => toggleService(service.value)}
                />
                <Label htmlFor={`service-${service.value}`} className="cursor-pointer">
                  {service.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing (ETB)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="price_km">Price per KM</Label>
              <Input
                id="price_km"
                type="number"
                value={formData.price_per_km || ""}
                onChange={(e) => updateField("price_per_km", e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g., 50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_hour">Price per Hour</Label>
              <Input
                id="price_hour"
                type="number"
                value={formData.price_per_hour || ""}
                onChange={(e) => updateField("price_per_hour", e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g., 500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_day">Price per Day</Label>
              <Input
                id="price_day"
                type="number"
                value={formData.price_per_day || ""}
                onChange={(e) => updateField("price_per_day", e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g., 3500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader>
          <CardTitle>Languages Spoken *</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((language) => (
              <Badge
                key={language}
                variant={formData.languages.includes(language) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleLanguage(language)}
              >
                {language}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Link href="/provider/properties">
          <Button type="button" variant="outline">Cancel</Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Create Driver Service
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

function TripForm({
  cities,
  onSubmit,
  isSubmitting,
}: {
  cities: City[]
  onSubmit: (data: CreateTripPayload) => void
  isSubmitting: boolean
}) {
  const [formData, setFormData] = useState<CreateTripPayload>({
    name: "",
    nickname: "",
    description: "",
    category: "trip",
    trip_type: "day_trip",
    duration_days: 1,
    duration_hours: 8,
    start_city_id: "",
    end_city_id: "",
    city_id: "",
    address: "",
    cities_covered: [],
    price_per_person: 0,
    group_discount_percentage: 0,
    min_group_size: 1,
    max_group_size: 10,
    included_services: [],
    excluded_services: [],
    itinerary: [],
    is_customizable: true,
  })

  const updateField = <K extends keyof CreateTripPayload>(key: K, value: CreateTripPayload[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const toggleService = (service: string, type: "included" | "excluded") => {
    const key = type === "included" ? "included_services" : "excluded_services"
    const services = formData[key]
    if (services.includes(service)) {
      updateField(key, services.filter((s) => s !== service))
    } else {
      updateField(key, [...services, service])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Trip Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Trip Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g., Historic Northern Circuit"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nickname">Amharic Name (Optional)</Label>
              <Input
                id="nickname"
                value={formData.nickname || ""}
                onChange={(e) => updateField("nickname", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Describe the trip experience, highlights, and what travelers will enjoy..."
              rows={4}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Trip Type *</Label>
              <Select
                value={formData.trip_type}
                onValueChange={(v) => updateField("trip_type", v as typeof formData.trip_type)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day_trip">Day Trip</SelectItem>
                  <SelectItem value="multi_day">Multi-Day Tour</SelectItem>
                  <SelectItem value="tour_package">Tour Package</SelectItem>
                  <SelectItem value="cultural_event">Cultural Event</SelectItem>
                  <SelectItem value="adventure">Adventure</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration_days">Duration (Days) *</Label>
              <Input
                id="duration_days"
                type="number"
                min={1}
                value={formData.duration_days}
                onChange={(e) => updateField("duration_days", Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price per Person (ETB) *</Label>
              <Input
                id="price"
                type="number"
                min={0}
                value={formData.price_per_person || ""}
                onChange={(e) => updateField("price_per_person", Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">Group Discount %</Label>
              <Input
                id="discount"
                type="number"
                min={0}
                max={50}
                value={formData.group_discount_percentage || ""}
                onChange={(e) => updateField("group_discount_percentage", Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Starting City *</Label>
              <Select
                value={formData.start_city_id}
                onValueChange={(v) => {
                  updateField("start_city_id", v)
                  if (!formData.city_id) updateField("city_id", v)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select starting city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_group">Min Group Size *</Label>
              <Input
                id="min_group"
                type="number"
                min={1}
                value={formData.min_group_size}
                onChange={(e) => updateField("min_group_size", Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_group">Max Group Size *</Label>
              <Input
                id="max_group"
                type="number"
                min={1}
                value={formData.max_group_size}
                onChange={(e) => updateField("max_group_size", Number(e.target.value))}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Included Services */}
      <Card>
        <CardHeader>
          <CardTitle>What's Included</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {TRIP_SERVICES.map((service) => (
              <Badge
                key={service}
                variant={formData.included_services.includes(service) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleService(service, "included")}
              >
                {formData.included_services.includes(service) && <Check className="mr-1 h-3 w-3" />}
                {service}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customizable */}
      <Card>
        <CardHeader>
          <CardTitle>Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="customizable"
              checked={formData.is_customizable}
              onCheckedChange={(checked) => updateField("is_customizable", !!checked)}
            />
            <Label htmlFor="customizable">
              Allow travelers to request customizations to this trip
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Link href="/provider/properties">
          <Button type="button" variant="outline">Cancel</Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Create Trip
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

function AddPropertyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialType = searchParams.get("type") as PropertyCategory | null
  
  const [step, setStep] = useState(initialType ? 2 : 1)
  const [propertyType, setPropertyType] = useState<PropertyCategory | null>(initialType)
  const [cities, setCities] = useState<City[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadCities()
  }, [])

  async function loadCities() {
    try {
      const response = await providerAPI.getCities({ page_size: 100 })
      setCities(response.results)
    } catch (error) {
      console.error("[v0] Failed to load cities:", error)
      // Fallback to mock cities for demo
      setCities([
        { id: "1", name: "Addis Ababa", nickname: "አዲስ አበባ", slug: "addis-ababa", country: "Ethiopia", is_popular: true },
        { id: "2", name: "Lalibela", nickname: "ላሊበላ", slug: "lalibela", country: "Ethiopia", is_popular: true },
        { id: "3", name: "Gondar", nickname: "ጎንደር", slug: "gondar", country: "Ethiopia", is_popular: true },
        { id: "4", name: "Axum", nickname: "አክሱም", slug: "axum", country: "Ethiopia", is_popular: true },
        { id: "5", name: "Harar", nickname: "ሐረር", slug: "harar", country: "Ethiopia", is_popular: true },
        { id: "6", name: "Bahir Dar", nickname: "ባሕር ዳር", slug: "bahir-dar", country: "Ethiopia", is_popular: true },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectType = (type: PropertyCategory) => {
    setPropertyType(type)
    setStep(2)
  }

  const handleSubmitHotel = async (data: CreateHotelPayload) => {
    setIsSubmitting(true)
    try {
      await providerAPI.createHotel(data)
      toast.success("Hotel created successfully!")
      router.push("/provider/properties")
    } catch (error) {
      console.error("[v0] Failed to create hotel:", error)
      toast.error("Failed to create hotel. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitRestaurant = async (data: CreateRestaurantPayload) => {
    setIsSubmitting(true)
    try {
      await providerAPI.createRestaurant(data)
      toast.success("Restaurant created successfully!")
      router.push("/provider/properties")
    } catch (error) {
      console.error("[v0] Failed to create restaurant:", error)
      toast.error("Failed to create restaurant. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitDriver = async (data: CreateDriverPayload) => {
    setIsSubmitting(true)
    try {
      await providerAPI.createDriver(data)
      toast.success("Driver service created successfully!")
      router.push("/provider/properties")
    } catch (error) {
      console.error("[v0] Failed to create driver service:", error)
      toast.error("Failed to create driver service. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitTrip = async (data: CreateTripPayload) => {
    setIsSubmitting(true)
    try {
      await providerAPI.createTrip(data)
      toast.success("Trip created successfully!")
      router.push("/provider/properties")
    } catch (error) {
      console.error("[v0] Failed to create trip:", error)
      toast.error("Failed to create trip. Please try again.")
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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/provider/properties">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add New Property</h1>
          <p className="text-muted-foreground">
            {step === 1 ? "Select the type of property you want to add" : `Create a new ${propertyType}`}
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
          1
        </div>
        <div className={`h-1 flex-1 ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
          2
        </div>
      </div>

      {/* Step Content */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>What type of property?</CardTitle>
            <CardDescription>Choose the category that best describes your property</CardDescription>
          </CardHeader>
          <CardContent>
            <PropertyTypeSelector selected={propertyType} onSelect={handleSelectType} />
          </CardContent>
        </Card>
      )}

      {step === 2 && propertyType === "hotel" && (
        <HotelForm cities={cities} onSubmit={handleSubmitHotel} isSubmitting={isSubmitting} />
      )}

      {step === 2 && propertyType === "restaurant" && (
        <RestaurantForm cities={cities} onSubmit={handleSubmitRestaurant} isSubmitting={isSubmitting} />
      )}

      {step === 2 && propertyType === "driver" && (
        <DriverForm cities={cities} onSubmit={handleSubmitDriver} isSubmitting={isSubmitting} />
      )}

      {step === 2 && propertyType === "trip" && (
        <TripForm cities={cities} onSubmit={handleSubmitTrip} isSubmitting={isSubmitting} />
      )}
    </div>
  )
}

export default function AddPropertyPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <AddPropertyContent />
    </Suspense>
  )
}
