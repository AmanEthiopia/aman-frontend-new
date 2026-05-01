"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Loader2,
  Check,
  Map,
  Users,
  DollarSign,
  Plus,
  X,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import * as providerAPI from "@/lib/api/provider"
import type { ProviderTrip } from "@/lib/api/provider"

const TRIP_TYPES = [
  { value: "day_trip", label: "Day Trip" },
  { value: "multi_day", label: "Multi-Day" },
  { value: "tour_package", label: "Tour Package" },
  { value: "cultural_event", label: "Cultural Event" },
  { value: "adventure", label: "Adventure" },
  { value: "nature", label: "Nature" },
  { value: "food", label: "Food & Culinary" },
  { value: "spiritual", label: "Spiritual" },
  { value: "historical", label: "Historical" },
]

interface TripFormData {
  name: string
  nickname: string
  description: string
  important_info: string
  trip_type: string
  duration_days: number
  price_per_person: number
  min_group_size: number
  max_group_size: number
  included_services: string[]
  excluded_services: string[]
  terms_conditions: string
  is_customizable: boolean
}

export default function EditTripPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [trip, setTrip] = useState<ProviderTrip | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<TripFormData>({
    name: "",
    nickname: "",
    description: "",
    important_info: "",
    trip_type: "multi_day",
    duration_days: 1,
    price_per_person: 0,
    min_group_size: 1,
    max_group_size: 20,
    included_services: [],
    excluded_services: [],
    terms_conditions: "",
    is_customizable: false,
  })
  const [newIncluded, setNewIncluded] = useState("")
  const [newExcluded, setNewExcluded] = useState("")

  useEffect(() => {
    loadTrip()
  }, [resolvedParams.id])

  async function loadTrip() {
    setIsLoading(true)
    try {
      const data = await providerAPI.getMyTrip(resolvedParams.id)
      setTrip(data)
      setFormData({
        name: data.name || "",
        nickname: data.nickname || "",
        description: data.description || "",
        important_info: data.important_info || "",
        trip_type: data.trip_type || "multi_day",
        duration_days: data.duration_days || 1,
        price_per_person: data.price_per_person || 0,
        min_group_size: data.min_group_size || 1,
        max_group_size: data.max_group_size || 20,
        included_services: data.included_services || [],
        excluded_services: data.excluded_services || [],
        terms_conditions: data.terms_conditions || "",
        is_customizable: data.is_customizable || false,
      })
    } catch (error) {
      console.error("[v0] Failed to load trip:", error)
      toast.error("Failed to load trip data")
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = <K extends keyof TripFormData>(key: K, value: TripFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const addIncluded = () => {
    const item = newIncluded.trim()
    if (!item) return
    updateField("included_services", [...formData.included_services, item])
    setNewIncluded("")
  }

  const removeIncluded = (index: number) => {
    updateField("included_services", formData.included_services.filter((_, i) => i !== index))
  }

  const addExcluded = () => {
    const item = newExcluded.trim()
    if (!item) return
    updateField("excluded_services", [...formData.excluded_services, item])
    setNewExcluded("")
  }

  const removeExcluded = (index: number) => {
    updateField("excluded_services", formData.excluded_services.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await providerAPI.updateTrip(resolvedParams.id, formData as any)
      toast.success("Trip updated successfully")
      router.push(`/provider/properties/trips/${resolvedParams.id}`)
    } catch (error) {
      console.error("[v0] Failed to update trip:", error)
      toast.error("Failed to update trip")
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

  if (!trip) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-semibold">Trip not found</h2>
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
        <Link href={`/provider/properties/trips/${trip.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Trip</h1>
          <p className="text-muted-foreground">{trip.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Update the basic details about your trip</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Trip Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g., 7 Days Ethiopia Highlights"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nickname">Amharic Name (Optional)</Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(e) => updateField("nickname", e.target.value)}
                  placeholder="e.g., ኢትዮጵያ ጉዞ"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Describe the trip experience..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="important_info">Important Info</Label>
              <Textarea
                id="important_info"
                value={formData.important_info}
                onChange={(e) => updateField("important_info", e.target.value)}
                placeholder="Key info participants should know before booking..."
                rows={2}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Trip Type *</Label>
                <Select
                  value={formData.trip_type}
                  onValueChange={(v) => updateField("trip_type", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIP_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
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
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Groups */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing & Group Size
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price_per_person">Price per Person ($) *</Label>
                <Input
                  id="price_per_person"
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.price_per_person}
                  onChange={(e) => updateField("price_per_person", Number(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_group_size">Min Group Size</Label>
                <Input
                  id="min_group_size"
                  type="number"
                  min={1}
                  value={formData.min_group_size}
                  onChange={(e) => updateField("min_group_size", Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_group_size">Max Group Size</Label>
                <Input
                  id="max_group_size"
                  type="number"
                  min={1}
                  value={formData.max_group_size}
                  onChange={(e) => updateField("max_group_size", Number(e.target.value))}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="is_customizable"
                checked={formData.is_customizable}
                onCheckedChange={(v) => updateField("is_customizable", v)}
              />
              <Label htmlFor="is_customizable">Allow customization requests</Label>
            </div>
          </CardContent>
        </Card>

        {/* Included / Excluded */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              What's Included / Excluded
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Included */}
            <div className="space-y-3">
              <Label>Included Services</Label>
              <div className="flex gap-2">
                <Input
                  value={newIncluded}
                  onChange={(e) => setNewIncluded(e.target.value)}
                  placeholder="e.g., Accommodation"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addIncluded() } }}
                />
                <Button type="button" variant="outline" size="icon" onClick={addIncluded}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.included_services.length > 0 && (
                <ul className="space-y-1">
                  {formData.included_services.map((item, i) => (
                    <li key={i} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
                      <span>{item}</span>
                      <button type="button" onClick={() => removeIncluded(i)} className="text-muted-foreground hover:text-destructive">
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Excluded */}
            <div className="space-y-3">
              <Label>Excluded Services</Label>
              <div className="flex gap-2">
                <Input
                  value={newExcluded}
                  onChange={(e) => setNewExcluded(e.target.value)}
                  placeholder="e.g., Flights"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addExcluded() } }}
                />
                <Button type="button" variant="outline" size="icon" onClick={addExcluded}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.excluded_services.length > 0 && (
                <ul className="space-y-1">
                  {formData.excluded_services.map((item, i) => (
                    <li key={i} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
                      <span>{item}</span>
                      <button type="button" onClick={() => removeExcluded(i)} className="text-muted-foreground hover:text-destructive">
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Terms & Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.terms_conditions}
              onChange={(e) => updateField("terms_conditions", e.target.value)}
              placeholder="e.g., Free cancellation up to 7 days before start date..."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link href={`/provider/properties/trips/${trip.id}`}>
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
