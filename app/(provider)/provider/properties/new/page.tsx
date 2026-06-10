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
  User,
  Languages,
  Calendar,
  FileText,
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
import * as contentAPI from "@/lib/api/content"
import type {
  PropertyCategory,
  CreateHotelPayload,
  CreateRestaurantPayload,
  CreateDriverPayload,
  CreateTripPayload,
  CreateTourGuidePayload,
  CreateTranslatorPayload,
  DriverService,
} from "@/lib/api/provider"
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
  "Garden",
  "Terrace",
  "Hot Tub",
  "Sauna",
  "Kids Club",
  "Casino",
  "Tennis Court",
  "Golf Course",
  "Beach Access",
  "Mountain View",
  "City View",
  "Lake View",
  "Balcony",
  "Kitchen",
  "Mini Bar",
  "Safe",
  "Ironing Facilities",
  "Hair Dryer",
  "Bathrobe",
  "Slippers",
  "Electric Vehicle Charging",
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
  "Cafe",
  "Fast Food",
  "Fusion",
  "Traditional",
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
  "Other",
]

// Tour guide specializations
const TOUR_GUIDE_SPECIALIZATIONS = [
  "Historical Sites",
  "Cultural Tours",
  "Religious Sites",
  "Nature & Wildlife",
  "Adventure Tours",
  "City Tours",
  "Trekking & Hiking",
  "Photography Tours",
  "Food & Culinary",
  "Art & Museums",
  "Nightlife & Entertainment",
  "Other",
]

// Translator specializations
const TRANSLATOR_SPECIALIZATIONS = [
  "Tourism",
  "Business",
  "Legal",
  "Medical",
  "Technical",
  "Academic",
  "Government",
  "Real Estate",
  "General",
  "Other",
]

// Availability options
const AVAILABILITY_OPTIONS = [
  "Flexible",
  "Weekdays Only",
  "Weekends Only",
  "Morning Only",
  "Afternoon Only",
  "Evening Only",
  "24/7 Available",
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
      description: "List your restaurant, cafe, or food service",
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
    {
      value: "tour_guide",
      label: "Tour Guide",
      description: "Offer guided tours and city exploration services",
      icon: User,
    },
    {
      value: "translator",
      label: "Translator",
      description: "Offer translation and interpretation services",
      icon: Languages,
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
  onCityCreated,
}: {
  cities: City[]
  onSubmit: (data: CreateHotelPayload) => void
  isSubmitting: boolean
  onCityCreated?: (city: City) => void
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
  
  // Custom city state
  const [showAddCity, setShowAddCity] = useState(false)
  const [newCityName, setNewCityName] = useState("")
  const [newCityNickname, setNewCityNickname] = useState("")
  const [isCreatingCity, setIsCreatingCity] = useState(false)
  
  // Custom amenity state
  const [customAmenity, setCustomAmenity] = useState("")
  const [customAmenities, setCustomAmenities] = useState<string[]>([])

  const updateField = <K extends keyof CreateHotelPayload>(key: K, value: CreateHotelPayload[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const toggleAmenity = (amenity: string) => {
    const amenities = formData.amenities || []
    if (amenities.includes(amenity)) {
      updateField("amenities", amenities.filter((a: string) => a !== amenity))
    } else {
      updateField("amenities", [...amenities, amenity])
    }
  }
  
  const addCustomAmenity = () => {
    if (customAmenity.trim() && !customAmenities.includes(customAmenity.trim())) {
      const newAmenity = customAmenity.trim()
      setCustomAmenities([...customAmenities, newAmenity])
      updateField("amenities", [...(formData.amenities || []), newAmenity])
      setCustomAmenity("")
    }
  }
  
  const removeCustomAmenity = (amenity: string) => {
    setCustomAmenities(customAmenities.filter(a => a !== amenity))
    updateField("amenities", (formData.amenities || []).filter((a: string) => a !== amenity))
  }
  
  const handleCreateCity = async () => {
    if (!newCityName.trim()) return
    
    setIsCreatingCity(true)
    try {
      const newCity = await contentAPI.createCity({
        name: newCityName.trim(),
        nickname: newCityNickname.trim() || undefined,
      })
      
      updateField("city_id", newCity.id)
      onCityCreated?.(newCity)
      setShowAddCity(false)
      setNewCityName("")
      setNewCityNickname("")
      toast.success(`City "${newCity.name}" created successfully`)
    } catch (error: any) {
      toast.error(error.message || "Failed to create city")
    } finally {
      setIsCreatingCity(false)
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
              {!showAddCity ? (
                <div className="space-y-2">
                  <Select
                    value={formData.city_id}
                    onValueChange={(v) => {
                      if (v === "__add_new__") {
                        setShowAddCity(true)
                      } else {
                        updateField("city_id", v)
                      }
                    }}
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
                      <SelectItem value="__add_new__">
                        <div className="flex items-center gap-2 text-primary">
                          <Plus className="h-4 w-4" />
                          Add New City
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <Card className="border-primary/50">
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Add New City</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAddCity(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="City name (e.g., Bahir Dar)"
                      value={newCityName}
                      onChange={(e) => setNewCityName(e.target.value)}
                    />
                    <Input
                      placeholder="Amharic name (optional)"
                      value={newCityNickname}
                      onChange={(e) => setNewCityNickname(e.target.value)}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleCreateCity}
                      disabled={!newCityName.trim() || isCreatingCity}
                      className="w-full"
                    >
                      {isCreatingCity ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Create City
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
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
          <CardDescription>Select the amenities your hotel offers, or add custom ones</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
          
          {/* Custom amenities */}
          {customAmenities.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Custom Amenities</Label>
              <div className="flex flex-wrap gap-2">
                {customAmenities.map((amenity) => (
                  <Badge key={amenity} variant="secondary" className="gap-1">
                    {amenity}
                    <button
                      type="button"
                      onClick={() => removeCustomAmenity(amenity)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Add custom amenity */}
          <div className="flex gap-2">
            <Input
              placeholder="Add custom amenity (e.g., Rooftop Lounge)"
              value={customAmenity}
              onChange={(e) => setCustomAmenity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addCustomAmenity()
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addCustomAmenity} disabled={!customAmenity.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
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
    price_range: "moderate",
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
  
  // Custom city state
  const [showAddCity, setShowAddCity] = useState(false)
  const [newCityName, setNewCityName] = useState("")
  const [newCityNickname, setNewCityNickname] = useState("")
  const [isCreatingCity, setIsCreatingCity] = useState(false)
  const [localCities, setLocalCities] = useState<City[]>(cities)
  
  // Custom cuisine state
  const [customCuisine, setCustomCuisine] = useState("")

  const updateField = <K extends keyof CreateRestaurantPayload>(key: K, value: CreateRestaurantPayload[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const toggleCuisine = (cuisine: string) => {
    if (formData.cuisine_types.includes(cuisine)) {
      updateField("cuisine_types", formData.cuisine_types.filter((c: string) => c !== cuisine))
    } else {
      updateField("cuisine_types", [...formData.cuisine_types, cuisine])
    }
  }
  
  const addCustomCuisine = () => {
    if (customCuisine.trim() && !formData.cuisine_types.includes(customCuisine.trim())) {
      updateField("cuisine_types", [...formData.cuisine_types, customCuisine.trim()])
      setCustomCuisine("")
    }
  }
  
  const handleCreateCity = async () => {
    if (!newCityName.trim()) return
    
    setIsCreatingCity(true)
    try {
      const newCity = await contentAPI.createCity({
        name: newCityName.trim(),
        nickname: newCityNickname.trim() || undefined,
      })
      
      setLocalCities([...localCities, newCity])
      updateField("city_id", newCity.id)
      setShowAddCity(false)
      setNewCityName("")
      setNewCityNickname("")
      toast.success(`City "${newCity.name}" created successfully`)
    } catch (error: any) {
      toast.error(error.message || "Failed to create city")
    } finally {
      setIsCreatingCity(false)
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
                  <SelectItem value="moderate">Moderate ($$)</SelectItem>
                  <SelectItem value="expensive">Expensive ($$$)</SelectItem>
                  <SelectItem value="fine_dining">Fine Dining ($$$$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>City *</Label>
              {!showAddCity ? (
                <div className="space-y-2">
                  <Select
                    value={formData.city_id}
                    onValueChange={(v) => {
                      if (v === "__add_new__") {
                        setShowAddCity(true)
                      } else {
                        updateField("city_id", v)
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                    <SelectContent>
                      {localCities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}
                          {city.nickname && <span className="ml-1 text-muted-foreground">({city.nickname})</span>}
                        </SelectItem>
                      ))}
                      <SelectItem value="__add_new__">
                        <div className="flex items-center gap-2 text-primary">
                          <Plus className="h-4 w-4" />
                          Add New City
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <Card className="border-primary/50">
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Add New City</Label>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddCity(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="City name (e.g., Dire Dawa)"
                      value={newCityName}
                      onChange={(e) => setNewCityName(e.target.value)}
                    />
                    <Input
                      placeholder="Amharic name (optional)"
                      value={newCityNickname}
                      onChange={(e) => setNewCityNickname(e.target.value)}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleCreateCity}
                      disabled={!newCityName.trim() || isCreatingCity}
                      className="w-full"
                    >
                      {isCreatingCity ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Create City
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
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
          <CardDescription>Select the types of cuisine you offer, or add your own</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {CUISINE_TYPES.map((cuisine) => (
              <Badge
                key={cuisine}
                variant={formData.cuisine_types.includes(cuisine) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleCuisine(cuisine)}
              >
                {formData.cuisine_types.includes(cuisine) && <Check className="mr-1 h-3 w-3" />}
                {cuisine}
              </Badge>
            ))}
          </div>
          
          {/* Custom cuisines */}
          {formData.cuisine_types.filter(c => !CUISINE_TYPES.includes(c)).length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Custom Cuisines</Label>
              <div className="flex flex-wrap gap-2">
                {formData.cuisine_types.filter(c => !CUISINE_TYPES.includes(c)).map((cuisine) => (
                  <Badge key={cuisine} variant="secondary" className="gap-1">
                    {cuisine}
                    <button
                      type="button"
                      onClick={() => updateField("cuisine_types", formData.cuisine_types.filter(c => c !== cuisine))}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Add custom cuisine */}
          <div className="flex gap-2">
            <Input
              placeholder="Add custom cuisine type (e.g., Eritrean)"
              value={customCuisine}
              onChange={(e) => setCustomCuisine(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addCustomCuisine()
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addCustomCuisine} disabled={!customCuisine.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
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
  
  // Custom city state
  const [showAddCity, setShowAddCity] = useState(false)
  const [newCityName, setNewCityName] = useState("")
  const [newCityNickname, setNewCityNickname] = useState("")
  const [isCreatingCity, setIsCreatingCity] = useState(false)
  const [localCities, setLocalCities] = useState<City[]>(cities)

  const updateField = <K extends keyof CreateDriverPayload>(key: K, value: CreateDriverPayload[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const toggleService = (service: DriverService) => {
    if (formData.services.includes(service)) {
      updateField("services", formData.services.filter((s: DriverService) => s !== service))
    } else {
      updateField("services", [...formData.services, service])
    }
  }

  const toggleLanguage = (language: string) => {
    if (formData.languages.includes(language)) {
      updateField("languages", formData.languages.filter((l: string) => l !== language))
    } else {
      updateField("languages", [...formData.languages, language])
    }
  }
  
  const handleCreateCity = async () => {
    if (!newCityName.trim()) return
    
    setIsCreatingCity(true)
    try {
      const newCity = await contentAPI.createCity({
        name: newCityName.trim(),
        nickname: newCityNickname.trim() || undefined,
      })
      
      setLocalCities([...localCities, newCity])
      updateField("city_id", newCity.id)
      setShowAddCity(false)
      setNewCityName("")
      setNewCityNickname("")
      toast.success(`City "${newCity.name}" created successfully`)
    } catch (error: any) {
      toast.error(error.message || "Failed to create city")
    } finally {
      setIsCreatingCity(false)
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
    terms_conditions: "",
    important_info: "",
    additional_features: [],
  })
  
  // Custom city management
  const [showAddCity, setShowAddCity] = useState(false)
  const [newCityName, setNewCityName] = useState("")
  const [newCityNickname, setNewCityNickname] = useState("")
  const [isCreatingCity, setIsCreatingCity] = useState(false)
  const [localCities, setLocalCities] = useState<City[]>(cities)
  
  // Custom included service
  const [customService, setCustomService] = useState("")
  
  // Additional features
  const [customFeature, setCustomFeature] = useState("")
  
  // Sync cities when prop changes
  useEffect(() => {
    setLocalCities(cities)
  }, [cities])

  const updateField = <K extends keyof CreateTripPayload>(key: K, value: CreateTripPayload[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const toggleService = (service: string, type: "included" | "excluded") => {
    const key = type === "included" ? "included_services" : "excluded_services"
    const services = formData[key] || []
    if (services.includes(service)) {
      updateField(key, services.filter((s: string) => s !== service))
    } else {
      updateField(key, [...services, service])
    }
  }
  
  const addCustomService = () => {
    if (customService.trim() && !formData.included_services.includes(customService.trim())) {
      updateField("included_services", [...formData.included_services, customService.trim()])
      setCustomService("")
    }
  }
  
  const addCustomFeature = () => {
    if (customFeature.trim() && !(formData.additional_features || []).includes(customFeature.trim())) {
      updateField("additional_features", [...(formData.additional_features || []), customFeature.trim()])
      setCustomFeature("")
    }
  }
  
  const removeFeature = (feature: string) => {
    updateField("additional_features", (formData.additional_features || []).filter(f => f !== feature))
  }
  
  const handleCreateCity = async () => {
    if (!newCityName.trim()) return
    
    setIsCreatingCity(true)
    try {
      const newCity = await contentAPI.createCity({
        name: newCityName.trim(),
        nickname: newCityNickname.trim() || undefined,
      })
      
      // Add to local cities list
      setLocalCities([...localCities, newCity])
      // Add to cities covered
      updateField("cities_covered", [...formData.cities_covered, newCity.id])
      
      setShowAddCity(false)
      setNewCityName("")
      setNewCityNickname("")
      toast.success(`City "${newCity.name}" created and added to trip`)
    } catch (error: any) {
      toast.error(error.message || "Failed to create city")
    } finally {
      setIsCreatingCity(false)
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
                  // Auto-add to cities covered
                  if (!formData.cities_covered.includes(v)) {
                    updateField("cities_covered", [v, ...formData.cities_covered])
                  }
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
      
      {/* Cities Covered */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Cities Covered
          </CardTitle>
          <CardDescription>
            Select all the cities this trip will visit. For multi-day trips and adventures, 
            include all destinations in the itinerary.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected cities */}
          {formData.cities_covered.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Selected Cities ({formData.cities_covered.length})</Label>
              <div className="flex flex-wrap gap-2">
                {formData.cities_covered.map((cityId) => {
                  const city = localCities.find(c => c.id === cityId)
                  const isStartCity = cityId === formData.start_city_id
                  return (
                    <Badge 
                      key={cityId} 
                      variant={isStartCity ? "default" : "secondary"}
                      className="gap-1"
                    >
                      <MapPin className="h-3 w-3" />
                      {city?.name || cityId}
                      {isStartCity && <span className="ml-1 text-xs">(Start)</span>}
                      {!isStartCity && (
                        <button
                          type="button"
                          onClick={() => {
                            updateField("cities_covered", formData.cities_covered.filter(id => id !== cityId))
                          }}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}
          
          {/* Add more cities */}
          <div className="space-y-2">
            <Label>Add Cities to Route</Label>
            <div className="flex flex-wrap gap-2">
              {localCities
                .filter(city => !formData.cities_covered.includes(city.id))
                .map((city) => (
                  <Badge
                    key={city.id}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => {
                      updateField("cities_covered", [...formData.cities_covered, city.id])
                    }}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    {city.name}
                    {city.nickname && <span className="ml-1 text-xs text-muted-foreground">({city.nickname})</span>}
                  </Badge>
                ))}
            </div>
          </div>
          
          {/* Add custom city */}
          <div className="space-y-2">
            {!showAddCity ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddCity(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add City Not Listed
              </Button>
            ) : (
              <Card className="border-primary/50">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Add New City</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddCity(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="City name (e.g., Jimma)"
                    value={newCityName}
                    onChange={(e) => setNewCityName(e.target.value)}
                  />
                  <Input
                    placeholder="Amharic name (optional)"
                    value={newCityNickname}
                    onChange={(e) => setNewCityNickname(e.target.value)}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateCity}
                    disabled={!newCityName.trim() || isCreatingCity}
                    className="w-full"
                  >
                    {isCreatingCity ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create & Add City
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Included Services */}
      <Card>
        <CardHeader>
          <CardTitle>What's Included</CardTitle>
          <CardDescription>Select standard services or add your own custom inclusions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {TRIP_SERVICES.filter(s => s !== "Other").map((service) => (
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
          
          {/* Custom included services */}
          {formData.included_services.filter(s => !TRIP_SERVICES.includes(s)).length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Custom Inclusions</Label>
              <div className="flex flex-wrap gap-2">
                {formData.included_services.filter(s => !TRIP_SERVICES.includes(s)).map((service) => (
                  <Badge key={service} variant="secondary" className="gap-1">
                    {service}
                    <button
                      type="button"
                      onClick={() => updateField("included_services", formData.included_services.filter(s => s !== service))}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Add custom service */}
          <div className="flex gap-2">
            <Input
              placeholder="Add custom service (e.g., Private Chef)"
              value={customService}
              onChange={(e) => setCustomService(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addCustomService()
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addCustomService} disabled={!customService.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Additional Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Additional Features
          </CardTitle>
          <CardDescription>Highlight special features that make this trip unique</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(formData.additional_features || []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(formData.additional_features || []).map((feature) => (
                <Badge key={feature} variant="secondary" className="gap-1">
                  {feature}
                  <button
                    type="button"
                    onClick={() => removeFeature(feature)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Small group experience, Local family visit, Sunset viewpoint"
              value={customFeature}
              onChange={(e) => setCustomFeature(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addCustomFeature()
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addCustomFeature} disabled={!customFeature.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Terms & Important Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Terms & Important Information
          </CardTitle>
          <CardDescription>Important details participants should know before booking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="important_info">Important Information for Participants</Label>
            <Textarea
              id="important_info"
              value={formData.important_info || ""}
              onChange={(e) => updateField("important_info", e.target.value)}
              placeholder="e.g., Physical fitness requirements, items to bring, health advisories, meeting point details..."
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="terms">Terms & Conditions</Label>
            <Textarea
              id="terms"
              value={formData.terms_conditions || ""}
              onChange={(e) => updateField("terms_conditions", e.target.value)}
              placeholder="e.g., Cancellation policy, refund policy, liability information, booking requirements..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Options */}
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

function TourGuideForm({
  cities,
  onSubmit,
  isSubmitting,
}: {
  cities: City[]
  onSubmit: (data: CreateTourGuidePayload) => void
  isSubmitting: boolean
}) {
  const [formData, setFormData] = useState<CreateTourGuidePayload>({
    name: "",
    nickname: "",
    description: "",
    category: "tour_guide",
    languages: [],
    specializations: [],
    experience_years: 1,
    city_id: "",
    address: "",
    cities_covered: [],
    availability: "Flexible",
  })
  
  const [customSpecialization, setCustomSpecialization] = useState("")
  const [showAddCity, setShowAddCity] = useState(false)
  const [newCityName, setNewCityName] = useState("")

  const updateField = <K extends keyof CreateTourGuidePayload>(key: K, value: CreateTourGuidePayload[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const toggleLanguage = (lang: string) => {
    if (formData.languages.includes(lang)) {
      updateField("languages", formData.languages.filter((l) => l !== lang))
    } else {
      updateField("languages", [...formData.languages, lang])
    }
  }

  const toggleSpecialization = (spec: string) => {
    if (formData.specializations.includes(spec)) {
      updateField("specializations", formData.specializations.filter((s) => s !== spec))
    } else {
      updateField("specializations", [...formData.specializations, spec])
    }
  }

  const addCustomSpecialization = () => {
    if (customSpecialization.trim() && !formData.specializations.includes(customSpecialization.trim())) {
      updateField("specializations", [...formData.specializations, customSpecialization.trim()])
      setCustomSpecialization("")
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
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>Tell us about yourself as a tour guide</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g., Abebe Kebede"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nickname">Amharic Name (Optional)</Label>
              <Input
                id="nickname"
                value={formData.nickname || ""}
                onChange={(e) => updateField("nickname", e.target.value)}
                placeholder="e.g., አበበ ከበደ"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio / Description *</Label>
            <Textarea
              id="bio"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Tell travelers about yourself, your experience, and what makes your tours special..."
              rows={4}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Years of Experience *</Label>
              <Input
                type="number"
                min={0}
                value={formData.experience_years}
                onChange={(e) => updateField("experience_years", Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>City *</Label>
              <Select value={formData.city_id} onValueChange={(v) => updateField("city_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your base city" />
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

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="Your location or meeting point"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Languages Spoken
          </CardTitle>
          <CardDescription>Select all languages you can conduct tours in</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <Badge
                key={lang}
                variant={formData.languages.includes(lang) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleLanguage(lang)}
              >
                {formData.languages.includes(lang) && <Check className="mr-1 h-3 w-3" />}
                {lang}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Specializations */}
      <Card>
        <CardHeader>
          <CardTitle>Tour Specializations</CardTitle>
          <CardDescription>What types of tours do you offer?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {TOUR_GUIDE_SPECIALIZATIONS.map((spec) => (
              <Badge
                key={spec}
                variant={formData.specializations.includes(spec) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleSpecialization(spec)}
              >
                {formData.specializations.includes(spec) && <Check className="mr-1 h-3 w-3" />}
                {spec}
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Add custom specialization"
              value={customSpecialization}
              onChange={(e) => setCustomSpecialization(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addCustomSpecialization()
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addCustomSpecialization}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing & Availability
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Price per Hour (ETB)</Label>
              <Input
                type="number"
                min={0}
                value={formData.price_per_hour || ""}
                onChange={(e) => updateField("price_per_hour", Number(e.target.value) || undefined)}
                placeholder="e.g., 500"
              />
            </div>
            <div className="space-y-2">
              <Label>Price per Day (ETB)</Label>
              <Input
                type="number"
                min={0}
                value={formData.price_per_day || ""}
                onChange={(e) => updateField("price_per_day", Number(e.target.value) || undefined)}
                placeholder="e.g., 3000"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Availability</Label>
            <Select value={formData.availability} onValueChange={(v) => updateField("availability", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABILITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cities Covered */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Cities You Can Guide In
          </CardTitle>
          <CardDescription>Select all cities where you can offer tour services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {cities.map((city) => (
              <Badge
                key={city.id}
                variant={formData.cities_covered.includes(city.id) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  if (formData.cities_covered.includes(city.id)) {
                    updateField("cities_covered", formData.cities_covered.filter((c) => c !== city.id))
                  } else {
                    updateField("cities_covered", [...formData.cities_covered, city.id])
                  }
                }}
              >
                {formData.cities_covered.includes(city.id) && <Check className="mr-1 h-3 w-3" />}
                {city.name}
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
              Create Tour Guide Profile
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

function TranslatorForm({
  cities,
  onSubmit,
  isSubmitting,
}: {
  cities: City[]
  onSubmit: (data: CreateTranslatorPayload) => void
  isSubmitting: boolean
}) {
  const [formData, setFormData] = useState<CreateTranslatorPayload>({
    name: "",
    nickname: "",
    description: "",
    category: "translator",
    languages: [],
    specializations: [],
    experience_years: 1,
    city_id: "",
    address: "",
    availability: "Flexible",
  })
  
  const [customSpecialization, setCustomSpecialization] = useState("")

  const updateField = <K extends keyof CreateTranslatorPayload>(key: K, value: CreateTranslatorPayload[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const toggleLanguage = (lang: string) => {
    if (formData.languages.includes(lang)) {
      updateField("languages", formData.languages.filter((l) => l !== lang))
    } else {
      updateField("languages", [...formData.languages, lang])
    }
  }

  const toggleSpecialization = (spec: string) => {
    if (formData.specializations.includes(spec)) {
      updateField("specializations", formData.specializations.filter((s) => s !== spec))
    } else {
      updateField("specializations", [...formData.specializations, spec])
    }
  }

  const addCustomSpecialization = () => {
    if (customSpecialization.trim() && !formData.specializations.includes(customSpecialization.trim())) {
      updateField("specializations", [...formData.specializations, customSpecialization.trim()])
      setCustomSpecialization("")
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
            <Languages className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>Tell us about yourself as a translator</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g., Tigist Alemayehu"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nickname">Amharic Name (Optional)</Label>
              <Input
                id="nickname"
                value={formData.nickname || ""}
                onChange={(e) => updateField("nickname", e.target.value)}
                placeholder="e.g., ትግስት አለማየሁ"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio / Description *</Label>
            <Textarea
              id="bio"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Tell clients about your translation experience, qualifications, and expertise areas..."
              rows={4}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Years of Experience *</Label>
              <Input
                type="number"
                min={0}
                value={formData.experience_years}
                onChange={(e) => updateField("experience_years", Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>City *</Label>
              <Select value={formData.city_id} onValueChange={(v) => updateField("city_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your base city" />
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

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="Your location"
              required
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="certified"
              checked={formData.is_certified}
              onCheckedChange={(checked) => updateField("is_certified", !!checked)}
            />
            <Label htmlFor="certified">I am a certified translator</Label>
          </div>
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Languages
          </CardTitle>
          <CardDescription>Select all languages you can translate between</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <Badge
                key={lang}
                variant={formData.languages.includes(lang) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleLanguage(lang)}
              >
                {formData.languages.includes(lang) && <Check className="mr-1 h-3 w-3" />}
                {lang}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Specializations */}
      <Card>
        <CardHeader>
          <CardTitle>Translation Specializations</CardTitle>
          <CardDescription>What areas do you specialize in?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {TRANSLATOR_SPECIALIZATIONS.map((spec) => (
              <Badge
                key={spec}
                variant={formData.specializations.includes(spec) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleSpecialization(spec)}
              >
                {formData.specializations.includes(spec) && <Check className="mr-1 h-3 w-3" />}
                {spec}
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Add custom specialization"
              value={customSpecialization}
              onChange={(e) => setCustomSpecialization(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addCustomSpecialization()
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addCustomSpecialization}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing & Availability
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Price per Hour (ETB)</Label>
              <Input
                type="number"
                min={0}
                value={formData.price_per_hour || ""}
                onChange={(e) => updateField("price_per_hour", Number(e.target.value) || undefined)}
                placeholder="e.g., 400"
              />
            </div>
            <div className="space-y-2">
              <Label>Price per Day (ETB)</Label>
              <Input
                type="number"
                min={0}
                value={formData.price_per_day || ""}
                onChange={(e) => updateField("price_per_day", Number(e.target.value) || undefined)}
                placeholder="e.g., 2500"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Availability</Label>
            <Select value={formData.availability} onValueChange={(v) => updateField("availability", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABILITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              Create Translator Profile
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

  // Sync state when URL search params change (e.g. sidebar nav changes ?type=hotel → ?type=restaurant)
  useEffect(() => {
    const type = searchParams.get("type") as PropertyCategory | null
    if (type) {
      setPropertyType(type)
      setStep(2)
    } else {
      setPropertyType(null)
      setStep(1)
    }
  }, [searchParams])

  useEffect(() => {
    loadCities()
  }, [])

  async function loadCities() {
    try {
      // Use the content API to get cities
      const citiesData = await contentAPI.getCities()
      // Convert to the format expected by the forms
      const formattedCities: City[] = citiesData.map(city => ({
        id: city.id,
        name: city.name,
        nickname: city.nickname,
        slug: city.slug,
        country: city.country,
        short_description: city.short_description,
        cover_photo_url: city.cover_photo_url,
        is_popular: city.is_popular,
        display_order: city.display_order,
        hotels_count: city.hotels_count,
        restaurants_count: city.restaurants_count,
        experiences_count: city.experiences_count,
      }))
      setCities(formattedCities)
    } catch (error) {
      console.error("[v0] Failed to load cities:", error)
      // Fallback to mock cities for demo
      setCities([
        { id: "1", name: "Addis Ababa", nickname: "አዲስ አበባ", slug: "addis-ababa", country: "Ethiopia", short_description: "", cover_photo_url: "", is_popular: true, display_order: 1, hotels_count: 0, restaurants_count: 0, experiences_count: 0 },
        { id: "2", name: "Lalibela", nickname: "ላሊበላ", slug: "lalibela", country: "Ethiopia", short_description: "", cover_photo_url: "", is_popular: true, display_order: 2, hotels_count: 0, restaurants_count: 0, experiences_count: 0 },
        { id: "3", name: "Gondar", nickname: "ጎን��ር", slug: "gondar", country: "Ethiopia", short_description: "", cover_photo_url: "", is_popular: true, display_order: 3, hotels_count: 0, restaurants_count: 0, experiences_count: 0 },
        { id: "4", name: "Axum", nickname: "አክሱም", slug: "axum", country: "Ethiopia", short_description: "", cover_photo_url: "", is_popular: true, display_order: 4, hotels_count: 0, restaurants_count: 0, experiences_count: 0 },
        { id: "5", name: "Harar", nickname: "ሐረር", slug: "harar", country: "Ethiopia", short_description: "", cover_photo_url: "", is_popular: true, display_order: 5, hotels_count: 0, restaurants_count: 0, experiences_count: 0 },
        { id: "6", name: "Bahir Dar", nickname: "ባሕር ዳር", slug: "bahir-dar", country: "Ethiopia", short_description: "", cover_photo_url: "", is_popular: true, display_order: 6, hotels_count: 0, restaurants_count: 0, experiences_count: 0 },
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

  const handleSubmitTourGuide = async (data: CreateTourGuidePayload) => {
    setIsSubmitting(true)
    try {
      await providerAPI.createTourGuide(data)
      toast.success("Tour guide service created successfully!")
      router.push("/provider/properties")
    } catch (error) {
      console.error("[v0] Failed to create tour guide:", error)
      toast.error("Failed to create tour guide service. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitTranslator = async (data: CreateTranslatorPayload) => {
    setIsSubmitting(true)
    try {
      await providerAPI.createTranslator(data)
      toast.success("Translator service created successfully!")
      router.push("/provider/properties")
    } catch (error) {
      console.error("[v0] Failed to create translator:", error)
      toast.error("Failed to create translator service. Please try again.")
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

      {step === 2 && propertyType === "tour_guide" && (
        <TourGuideForm cities={cities} onSubmit={handleSubmitTourGuide} isSubmitting={isSubmitting} />
      )}

      {step === 2 && propertyType === "translator" && (
        <TranslatorForm cities={cities} onSubmit={handleSubmitTranslator} isSubmitting={isSubmitting} />
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

