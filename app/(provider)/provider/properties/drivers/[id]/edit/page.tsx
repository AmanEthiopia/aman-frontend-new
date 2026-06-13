"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Loader2,
  Check,
  Car,
  DollarSign,
  MapPin,
  Globe,
  Plus,
  X,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { LocationPicker } from "@/components/location/location-picker"
import { Switch } from "@/components/ui/switch"
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
import type { ProviderDriver, DriverService } from "@/lib/api/provider"
import type { City } from "@/lib/api/content"

const VEHICLE_TYPES = [
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
  { value: "van", label: "Van" },
  { value: "minibus", label: "Minibus" },
  { value: "bus", label: "Bus" },
  { value: "motorcycle", label: "Motorcycle" },
]

const SERVICE_OPTIONS: { value: DriverService; label: string }[] = [
  { value: "airport_pickup", label: "Airport Pickup" },
  { value: "airport_dropoff", label: "Airport Drop-off" },
  { value: "city_tour", label: "City Tour" },
  { value: "intercity", label: "Intercity" },
  { value: "hourly_rental", label: "Hourly Rental" },
  { value: "daily_rental", label: "Daily Rental" },
  { value: "hotel_transfer", label: "Hotel Transfer" },
]

const COMMON_LANGUAGES = ["English", "Amharic", "French", "Arabic", "Italian", "German", "Spanish", "Chinese"]

interface DriverFormData {
  name: string
  nickname: string
  description: string
  vehicle_type: string
  vehicle_make: string
  vehicle_model: string
  vehicle_year: string
  license_plate: string
  max_passengers: number
  city_id: string
  address: string
  latitude?: number | null
  longitude?: number | null
  languages: string[]
  services: string[]
  price_per_km: string
  price_per_hour: string
  price_per_day: string
  is_airport_pickup: boolean
  is_available_24h: boolean
}

export default function EditDriverPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [driver, setDriver] = useState<ProviderDriver | null>(null)
  const [cities, setCities] = useState<City[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<DriverFormData>({
    name: "",
    nickname: "",
    description: "",
    vehicle_type: "sedan",
    vehicle_make: "",
    vehicle_model: "",
    vehicle_year: "",
    license_plate: "",
    max_passengers: 4,
    city_id: "",
    address: "",
    languages: [],
    services: [],
    price_per_km: "",
    price_per_hour: "",
    price_per_day: "",
    is_airport_pickup: false,
    is_available_24h: false,
  })
  const [customLanguage, setCustomLanguage] = useState("")
  const [customServiceInput, setCustomServiceInput] = useState("")

  useEffect(() => {
    loadData()
  }, [resolvedParams.id])

  async function loadData() {
    setIsLoading(true)
    try {
      const [driverData, citiesData] = await Promise.all([
        providerAPI.getMyDriver(resolvedParams.id),
        contentAPI.getCities().catch(() => []),
      ])
      setDriver(driverData)
      setCities(citiesData)
      setFormData({
        name: driverData.name || "",
        nickname: driverData.nickname || "",
        description: driverData.description || "",
        vehicle_type: driverData.vehicle_type || "sedan",
        vehicle_make: driverData.vehicle_make || "",
        vehicle_model: driverData.vehicle_model || "",
        vehicle_year: driverData.vehicle_year != null ? String(driverData.vehicle_year) : "",
        license_plate: driverData.license_plate || "",
        max_passengers: driverData.max_passengers || 4,
        city_id: driverData.city_id || "",
        address: driverData.address || "",
        latitude: (driverData as any).latitude ?? null,
        longitude: (driverData as any).longitude ?? null,
        languages: driverData.languages || [],
        services: driverData.services || [],
        price_per_km: driverData.price_per_km != null ? String(driverData.price_per_km) : "",
        price_per_hour: driverData.price_per_hour != null ? String(driverData.price_per_hour) : "",
        price_per_day: driverData.price_per_day != null ? String(driverData.price_per_day) : "",
        is_airport_pickup: driverData.is_airport_pickup || false,
        is_available_24h: driverData.is_available_24h || false,
      })
    } catch (error) {
      console.error("[v0] Failed to load driver:", error)
      toast.error("Failed to load driver data")
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = <K extends keyof DriverFormData>(key: K, value: DriverFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const toggleService = (service: string) => {
    if (formData.services.includes(service)) {
      updateField("services", formData.services.filter((s) => s !== service))
    } else {
      updateField("services", [...formData.services, service])
    }
  }

  const toggleLanguage = (lang: string) => {
    if (formData.languages.includes(lang)) {
      updateField("languages", formData.languages.filter((l) => l !== lang))
    } else {
      updateField("languages", [...formData.languages, lang])
    }
  }

  const addCustomLanguage = () => {
    const lang = customLanguage.trim()
    if (!lang || formData.languages.includes(lang)) return
    updateField("languages", [...formData.languages, lang])
    setCustomLanguage("")
  }

  const addCustomService = () => {
    const svc = customServiceInput.trim()
    if (!svc || formData.services.includes(svc)) return
    updateField("services", [...formData.services, svc])
    setCustomServiceInput("")
  }

  const isCustomVehicleType = formData.vehicle_type !== "" && !VEHICLE_TYPES.some((t) => t.value === formData.vehicle_type)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload: any = {
        ...formData,
        vehicle_year: formData.vehicle_year ? Number(formData.vehicle_year) : undefined,
        price_per_km: formData.price_per_km ? Number(formData.price_per_km) : undefined,
        price_per_hour: formData.price_per_hour ? Number(formData.price_per_hour) : undefined,
        price_per_day: formData.price_per_day ? Number(formData.price_per_day) : undefined,
      }
      await providerAPI.updateDriver(resolvedParams.id, payload)
      toast.success("Driver service updated successfully")
      router.push(`/provider/properties/drivers/${resolvedParams.id}`)
    } catch (error) {
      console.error("[v0] Failed to update driver:", error)
      toast.error("Failed to update driver service")
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

  if (!driver) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-semibold">Driver service not found</h2>
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
        <Link href={`/provider/properties/drivers/${driver.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Driver Service</h1>
          <p className="text-muted-foreground">{driver.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Update the details about your driver service</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g., Addis Airport Transfer"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nickname">Amharic Name (Optional)</Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(e) => updateField("nickname", e.target.value)}
                  placeholder="e.g., አዲስ አበባ ሽርሽር"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Describe your driver service..."
                rows={3}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>City</Label>
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
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="e.g., Bole, Addis Ababa"
                />
              </div>
            </div>

            <LocationPicker
              latitude={formData.latitude}
              longitude={formData.longitude}
              onChange={(c) => {
                updateField("latitude", c.latitude)
                updateField("longitude", c.longitude)
              }}
              label="Base map location (helps travelers find you & 'Near me')"
            />
          </CardContent>
        </Card>

        {/* Vehicle Info */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Vehicle Type *</Label>
                <Select
                  value={isCustomVehicleType ? "__other__" : (formData.vehicle_type || "")}
                  onValueChange={(v) => {
                    if (v === "__other__") {
                      updateField("vehicle_type", "")
                    } else {
                      updateField("vehicle_type", v)
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                    <SelectItem value="__other__">Other...</SelectItem>
                  </SelectContent>
                </Select>
                {(isCustomVehicleType || formData.vehicle_type === "") && (
                  <Input
                    placeholder="Type vehicle type (e.g. Pickup, Tuk-tuk…)"
                    value={isCustomVehicleType ? formData.vehicle_type : ""}
                    onChange={(e) => updateField("vehicle_type", e.target.value)}
                    autoFocus={formData.vehicle_type === ""}
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_passengers">Max Passengers *</Label>
                <Input
                  id="max_passengers"
                  type="number"
                  min={1}
                  value={formData.max_passengers}
                  onChange={(e) => updateField("max_passengers", Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle_make">Make</Label>
                <Input
                  id="vehicle_make"
                  value={formData.vehicle_make}
                  onChange={(e) => updateField("vehicle_make", e.target.value)}
                  placeholder="e.g., Toyota"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle_model">Model</Label>
                <Input
                  id="vehicle_model"
                  value={formData.vehicle_model}
                  onChange={(e) => updateField("vehicle_model", e.target.value)}
                  placeholder="e.g., Land Cruiser"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle_year">Year</Label>
                <Input
                  id="vehicle_year"
                  type="number"
                  min={1990}
                  max={new Date().getFullYear() + 1}
                  value={formData.vehicle_year}
                  onChange={(e) => updateField("vehicle_year", e.target.value)}
                  placeholder="e.g., 2022"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="license_plate">License Plate</Label>
                <Input
                  id="license_plate"
                  value={formData.license_plate}
                  onChange={(e) => updateField("license_plate", e.target.value)}
                  placeholder="e.g., AA 12345"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader>
            <CardTitle>Services Offered</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {SERVICE_OPTIONS.map((service) => (
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
              {/* Custom services */}
              {formData.services
                .filter((s) => !SERVICE_OPTIONS.some((o) => o.value === s))
                .map((custom) => (
                  <div key={custom} className="flex items-center space-x-2">
                    <Checkbox
                      id={`service-custom-${custom}`}
                      checked
                      onCheckedChange={() => toggleService(custom)}
                    />
                    <Label htmlFor={`service-custom-${custom}`} className="cursor-pointer flex-1">
                      {custom}
                    </Label>
                    <button
                      type="button"
                      onClick={() => toggleService(custom)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
            </div>
            {/* Add custom service */}
            <div className="flex gap-2">
              <Input
                placeholder="Add custom service (e.g. Wedding Transfer)…"
                value={customServiceInput}
                onChange={(e) => setCustomServiceInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomService())}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={addCustomService} disabled={!customServiceInput.trim()}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add
              </Button>
            </div>
            <div className="flex gap-4 pt-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_airport_pickup"
                  checked={formData.is_airport_pickup}
                  onCheckedChange={(v) => updateField("is_airport_pickup", v)}
                />
                <Label htmlFor="is_airport_pickup">Airport Pickup Available</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_available_24h"
                  checked={formData.is_available_24h}
                  onCheckedChange={(v) => updateField("is_available_24h", v)}
                />
                <Label htmlFor="is_available_24h">Available 24/7</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing
            </CardTitle>
            <CardDescription>Leave blank for rates you don't offer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price_per_km">Price per km ($)</Label>
                <Input
                  id="price_per_km"
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.price_per_km}
                  onChange={(e) => updateField("price_per_km", e.target.value)}
                  placeholder="e.g., 5.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_per_hour">Price per hour ($)</Label>
                <Input
                  id="price_per_hour"
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.price_per_hour}
                  onChange={(e) => updateField("price_per_hour", e.target.value)}
                  placeholder="e.g., 30.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_per_day">Price per day ($)</Label>
                <Input
                  id="price_per_day"
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.price_per_day}
                  onChange={(e) => updateField("price_per_day", e.target.value)}
                  placeholder="e.g., 150.00"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Languages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Languages Spoken
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {COMMON_LANGUAGES.map((lang) => {
                const selected = formData.languages.includes(lang)
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input hover:bg-muted"
                    }`}
                  >
                    {lang}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-2">
              <Input
                value={customLanguage}
                onChange={(e) => setCustomLanguage(e.target.value)}
                placeholder="Add other language..."
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomLanguage() } }}
              />
              <Button type="button" variant="outline" size="icon" onClick={addCustomLanguage}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.languages.filter((l) => !COMMON_LANGUAGES.includes(l)).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.languages
                  .filter((l) => !COMMON_LANGUAGES.includes(l))
                  .map((lang) => (
                    <span
                      key={lang}
                      className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm"
                    >
                      {lang}
                      <button
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link href={`/provider/properties/drivers/${driver.id}`}>
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
