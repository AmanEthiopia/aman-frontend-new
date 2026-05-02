"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  getProviderPackageById,
  updatePackage,
  togglePackagePublish,
  addPackageCity,
  removePackageCity,
  addPackageDay,
  updatePackageDay,
  deletePackageDay,
  addPackageDayItem,
  updatePackageDayItem,
  deletePackageDayItem,
  getPackageDepartures,
  createDeparture,
  updateDeparture,
  deleteDeparture,
  type Package,
  type PackageDay,
  type PackageDayItem,
  type PackageCity,
  type PackageCategory,
  type PackageItemType,
  type Departure,
} from "@/lib/api/experiences"
import { getCities, type City } from "@/lib/api/content"
import { searchHotels } from "@/lib/api/hotels"
import { getRestaurants } from "@/lib/api/restaurants"
import { getAttractions } from "@/lib/api/content"
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  Hotel,
  Utensils,
  Landmark,
  Activity,
  MapPin,
  Globe,
  GlobeLock,
  Save,
  Eye,
  Calendar,
  CalendarDays,
  Pencil,
} from "lucide-react"

const CATEGORIES: { value: PackageCategory; label: string }[] = [
  { value: "city_tour", label: "City Tour" },
  { value: "multi_city", label: "Multi-City" },
  { value: "adventure", label: "Adventure" },
  { value: "culture", label: "Cultural" },
  { value: "food", label: "Food & Culinary" },
  { value: "nature", label: "Nature" },
  { value: "spiritual", label: "Spiritual" },
  { value: "historical", label: "Historical" },
]

const ITEM_TYPES: { value: PackageItemType; label: string; icon: React.ReactNode }[] = [
  { value: "hotel", label: "Hotel", icon: <Hotel className="h-4 w-4" /> },
  { value: "restaurant", label: "Restaurant", icon: <Utensils className="h-4 w-4" /> },
  { value: "attraction", label: "Attraction", icon: <Landmark className="h-4 w-4" /> },
  { value: "activity", label: "Custom Activity", icon: <Activity className="h-4 w-4" /> },
]

export default function EditPackagePage() {
  const params = useParams()
  const router = useRouter()
  const packageId = params.id as string

  const [pkg, setPkg] = useState<Package | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Available data for selecting in itinerary
  const [availableCities, setAvailableCities] = useState<City[]>([])
  const [availableHotels, setAvailableHotels] = useState<any[]>([])
  const [availableRestaurants, setAvailableRestaurants] = useState<any[]>([])
  const [availableAttractions, setAvailableAttractions] = useState<any[]>([])

  // Dialog states
  const [addCityOpen, setAddCityOpen] = useState(false)
  const [addDayOpen, setAddDayOpen] = useState(false)
  const [addItemOpen, setAddItemOpen] = useState<{ dayId: string } | null>(null)

  // Departure state
  const [departures, setDepartures] = useState<Departure[]>([])
  const [departuresLoading, setDeparturesLoading] = useState(false)
  const [departureDialogOpen, setDepartureDialogOpen] = useState(false)
  const [editingDeparture, setEditingDeparture] = useState<Departure | null>(null)
  const [departureForm, setDepartureForm] = useState({
    start_date: "",
    end_date: "",
    max_seats: 10,
    is_active: true,
    notes: "",
  })
  const [departureSubmitting, setDepartureSubmitting] = useState(false)

  // Form states for dialogs
  const [newCity, setNewCity] = useState({ city_id: "", order: 1, night_count: 1 })
  const [newDay, setNewDay] = useState({ day_number: 1, title: "", description: "", city_id: "" })
  const [newItem, setNewItem] = useState({
    item_type: "activity" as PackageItemType,
    order: 1,
    hotel_id: "",
    restaurant_id: "",
    attraction_id: "",
    title: "",
    description: "",
    duration_minutes: 60,
    notes: "",
  })

  const loadPackage = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getProviderPackageById(packageId)
      setPkg(data)
      
      // Set next day number
      const maxDay = data.days?.reduce((max, d) => Math.max(max, d.day_number), 0) || 0
      setNewDay(prev => ({ ...prev, day_number: maxDay + 1 }))
    } catch (err: any) {
      setError(err.message || "Failed to load package")
    } finally {
      setLoading(false)
    }
  }, [packageId])

  const loadAvailableData = useCallback(async () => {
    try {
      const [cities, hotels, restaurants, attractions] = await Promise.all([
        getCities().catch(() => []),
        searchHotels({}).then(r => r.results || []).catch(() => []),
        getRestaurants({}).catch(() => []),
        getAttractions({}).catch(() => []),
      ])
      setAvailableCities(cities)
      setAvailableHotels(hotels)
      setAvailableRestaurants(restaurants)
      setAvailableAttractions(attractions)
    } catch {
      // Silently fail
    }
  }, [])

  const loadDepartures = useCallback(async () => {
    setDeparturesLoading(true)
    try {
      const data = await getPackageDepartures(packageId)
      setDepartures(data)
    } catch {
      // Silently fail
    } finally {
      setDeparturesLoading(false)
    }
  }, [packageId])

  useEffect(() => {
    loadPackage()
    loadAvailableData()
    loadDepartures()
  }, [loadPackage, loadAvailableData, loadDepartures])

  const openAddDeparture = () => {
    setEditingDeparture(null)
    setDepartureForm({ start_date: "", end_date: "", max_seats: 10, is_active: true, notes: "" })
    setDepartureDialogOpen(true)
  }

  const openEditDeparture = (dep: Departure) => {
    setEditingDeparture(dep)
    setDepartureForm({
      start_date: dep.start_date,
      end_date: dep.end_date,
      max_seats: dep.max_seats,
      is_active: dep.is_active,
      notes: dep.notes || "",
    })
    setDepartureDialogOpen(true)
  }

  const handleDepartureSubmit = async () => {
    setDepartureSubmitting(true)
    try {
      if (editingDeparture) {
        await updateDeparture(packageId, editingDeparture.id, departureForm)
      } else {
        await createDeparture(packageId, departureForm)
      }
      await loadDepartures()
      setDepartureDialogOpen(false)
      showSuccess(editingDeparture ? "Departure updated" : "Departure added")
    } catch (err: any) {
      setError(err.message || "Failed to save departure")
    } finally {
      setDepartureSubmitting(false)
    }
  }

  const handleDeleteDeparture = async (depId: string) => {
    if (!confirm("Delete this departure? This cannot be undone.")) return
    try {
      await deleteDeparture(packageId, depId)
      setDepartures((prev) => prev.filter((d) => d.id !== depId))
      showSuccess("Departure deleted")
    } catch (err: any) {
      setError(err.message || "Failed to delete departure")
    }
  }

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  // Package update
  const handleSaveBasicInfo = async (updates: Partial<Package>) => {
    if (!pkg) return
    try {
      setSaving(true)
      const updated = await updatePackage(pkg.id, updates as any)
      setPkg(prev => prev ? { ...prev, ...updated } : null)
      showSuccess("Package updated successfully")
    } catch (err: any) {
      setError(err.message || "Failed to update package")
    } finally {
      setSaving(false)
    }
  }

  // Publish toggle
  const handleTogglePublish = async () => {
    if (!pkg) return
    try {
      const result = await togglePackagePublish(pkg.id)
      setPkg(prev => prev ? { ...prev, is_published: result.is_published } : null)
      showSuccess(result.is_published ? "Package published!" : "Package unpublished")
    } catch (err: any) {
      setError(err.message || "Failed to update publish status")
    }
  }

  // City management
  const handleAddCity = async () => {
    if (!pkg || !newCity.city_id) return
    try {
      const city = await addPackageCity(pkg.id, newCity)
      setPkg(prev => prev ? { ...prev, cities: [...(prev.cities || []), city] } : null)
      setAddCityOpen(false)
      setNewCity({ city_id: "", order: (pkg.cities?.length || 0) + 2, night_count: 1 })
      showSuccess("City added")
    } catch (err: any) {
      setError(err.message || "Failed to add city")
    }
  }

  const handleRemoveCity = async (cityEntryId: string) => {
    if (!pkg || !confirm("Remove this city?")) return
    try {
      await removePackageCity(pkg.id, cityEntryId)
      setPkg(prev => prev ? { ...prev, cities: prev.cities?.filter(c => c.id !== cityEntryId) } : null)
      showSuccess("City removed")
    } catch (err: any) {
      setError(err.message || "Failed to remove city")
    }
  }

  // Day management
  const handleAddDay = async () => {
    if (!pkg || !newDay.title) return
    try {
      const day = await addPackageDay(pkg.id, {
        day_number: newDay.day_number,
        title: newDay.title,
        description: newDay.description || undefined,
        city_id: newDay.city_id || undefined,
      })
      setPkg(prev => prev ? { ...prev, days: [...(prev.days || []), { ...day, items: [] }] } : null)
      setAddDayOpen(false)
      setNewDay({ day_number: newDay.day_number + 1, title: "", description: "", city_id: "" })
      showSuccess("Day added")
    } catch (err: any) {
      setError(err.message || "Failed to add day")
    }
  }

  const handleDeleteDay = async (dayId: string) => {
    if (!pkg || !confirm("Delete this day and all its items?")) return
    try {
      await deletePackageDay(pkg.id, dayId)
      setPkg(prev => prev ? { ...prev, days: prev.days?.filter(d => d.id !== dayId) } : null)
      showSuccess("Day deleted")
    } catch (err: any) {
      setError(err.message || "Failed to delete day")
    }
  }

  // Item management
  const handleAddItem = async (dayId: string) => {
    if (!pkg) return
    try {
      const itemData: any = {
        item_type: newItem.item_type,
        order: newItem.order,
        notes: newItem.notes || undefined,
      }

      if (newItem.item_type === "hotel" && newItem.hotel_id) {
        itemData.hotel_id = newItem.hotel_id
      } else if (newItem.item_type === "restaurant" && newItem.restaurant_id) {
        itemData.restaurant_id = newItem.restaurant_id
      } else if (newItem.item_type === "attraction" && newItem.attraction_id) {
        itemData.attraction_id = newItem.attraction_id
      } else if (newItem.item_type === "activity") {
        itemData.title = newItem.title
        itemData.description = newItem.description
        itemData.duration_minutes = newItem.duration_minutes
      }

      const item = await addPackageDayItem(pkg.id, dayId, itemData)
      
      setPkg(prev => {
        if (!prev) return null
        return {
          ...prev,
          days: prev.days?.map(d => 
            d.id === dayId 
              ? { ...d, items: [...d.items, item] }
              : d
          )
        }
      })
      
      setAddItemOpen(null)
      setNewItem({
        item_type: "activity",
        order: 1,
        hotel_id: "",
        restaurant_id: "",
        attraction_id: "",
        title: "",
        description: "",
        duration_minutes: 60,
        notes: "",
      })
      showSuccess("Item added")
    } catch (err: any) {
      setError(err.message || "Failed to add item")
    }
  }

  const handleDeleteItem = async (dayId: string, itemId: string) => {
    if (!pkg || !confirm("Delete this item?")) return
    try {
      await deletePackageDayItem(pkg.id, dayId, itemId)
      setPkg(prev => {
        if (!prev) return null
        return {
          ...prev,
          days: prev.days?.map(d => 
            d.id === dayId 
              ? { ...d, items: d.items.filter(i => i.id !== itemId) }
              : d
          )
        }
      })
      showSuccess("Item deleted")
    } catch (err: any) {
      setError(err.message || "Failed to delete item")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[600px]" />
      </div>
    )
  }

  if (!pkg) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Package not found"}</AlertDescription>
        </Alert>
        <Link href="/provider/packages">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Packages
          </Button>
        </Link>
      </div>
    )
  }

  const sortedDays = pkg.days?.sort((a, b) => a.day_number - b.day_number) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/provider/packages">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{pkg.title}</h1>
            <div className="flex items-center gap-2">
              <Badge variant={pkg.is_published ? "default" : "secondary"}>
                {pkg.is_published ? <Globe className="mr-1 h-3 w-3" /> : <GlobeLock className="mr-1 h-3 w-3" />}
                {pkg.is_published ? "Published" : "Draft"}
              </Badge>
              <span className="text-sm text-muted-foreground">{pkg.duration_days} Days</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/experiences/${pkg.slug}`} target="_blank">
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
          </Link>
          <Button onClick={handleTogglePublish}>
            {pkg.is_published ? (
              <><GlobeLock className="mr-2 h-4 w-4" /> Unpublish</>
            ) : (
              <><Globe className="mr-2 h-4 w-4" /> Publish</>
            )}
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {successMessage && (
        <Alert className="border-green-500 bg-green-50 text-green-700">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs defaultValue="itinerary">
        <TabsList>
          <TabsTrigger value="itinerary">Itinerary Builder</TabsTrigger>
          <TabsTrigger value="cities">Cities</TabsTrigger>
          <TabsTrigger value="departures">Departures</TabsTrigger>
          <TabsTrigger value="details">Package Details</TabsTrigger>
        </TabsList>

        {/* Itinerary Tab */}
        <TabsContent value="itinerary" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Build your day-by-day itinerary by adding days and items.
            </p>
            <Dialog open={addDayOpen} onOpenChange={setAddDayOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Day
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Day {newDay.day_number}</DialogTitle>
                </DialogHeader>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Day Title *</FieldLabel>
                    <Input
                      value={newDay.title}
                      onChange={(e) => setNewDay({ ...newDay, title: e.target.value })}
                      placeholder="e.g., Arrival in Addis Ababa"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Description</FieldLabel>
                    <Textarea
                      value={newDay.description}
                      onChange={(e) => setNewDay({ ...newDay, description: e.target.value })}
                      placeholder="Brief overview of the day..."
                    />
                  </Field>
                  <Field>
                    <FieldLabel>City</FieldLabel>
                    <Select value={newDay.city_id} onValueChange={(v) => setNewDay({ ...newDay, city_id: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCities.map((city) => (
                          <SelectItem key={city.id} value={city.id}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Button onClick={handleAddDay} className="w-full">Add Day</Button>
                </FieldGroup>
              </DialogContent>
            </Dialog>
          </div>

          {sortedDays.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No days yet</h3>
                <p className="text-muted-foreground">Start building your itinerary by adding the first day.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sortedDays.map((day) => (
                <Card key={day.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                          {day.day_number}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{day.title}</CardTitle>
                          {day.city && (
                            <p className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {day.city.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteDay(day.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    {day.description && (
                      <p className="mt-2 text-sm text-muted-foreground">{day.description}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    {/* Day items */}
                    <div className="space-y-2">
                      {day.items
                        .sort((a, b) => a.order - b.order)
                        .map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3"
                          >
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background border">
                              {ITEM_TYPES.find(t => t.value === item.item_type)?.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {item.title || item.hotel?.name || item.restaurant?.name || item.attraction?.name}
                              </p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {item.item_type}
                                {item.duration_minutes && ` · ${item.duration_minutes} min`}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteItem(day.id, item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                    </div>

                    {/* Add item button */}
                    <Dialog
                      open={addItemOpen?.dayId === day.id}
                      onOpenChange={(open) => setAddItemOpen(open ? { dayId: day.id } : null)}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="mt-3 w-full">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Item
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Item to Day {day.day_number}</DialogTitle>
                        </DialogHeader>
                        <FieldGroup>
                          <Field>
                            <FieldLabel>Item Type</FieldLabel>
                            <Select
                              value={newItem.item_type}
                              onValueChange={(v) => setNewItem({ ...newItem, item_type: v as PackageItemType })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ITEM_TYPES.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    <span className="flex items-center gap-2">
                                      {type.icon}
                                      {type.label}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </Field>

                          {newItem.item_type === "hotel" && (
                            <Field>
                              <FieldLabel>Select Hotel</FieldLabel>
                              <Select
                                value={newItem.hotel_id}
                                onValueChange={(v) => setNewItem({ ...newItem, hotel_id: v })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose a hotel" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableHotels.map((hotel) => (
                                    <SelectItem key={hotel.id} value={hotel.id}>
                                      {hotel.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </Field>
                          )}

                          {newItem.item_type === "restaurant" && (
                            <Field>
                              <FieldLabel>Select Restaurant</FieldLabel>
                              <Select
                                value={newItem.restaurant_id}
                                onValueChange={(v) => setNewItem({ ...newItem, restaurant_id: v })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose a restaurant" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableRestaurants.map((rest) => (
                                    <SelectItem key={rest.id} value={rest.id}>
                                      {rest.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </Field>
                          )}

                          {newItem.item_type === "attraction" && (
                            <Field>
                              <FieldLabel>Select Attraction</FieldLabel>
                              <Select
                                value={newItem.attraction_id}
                                onValueChange={(v) => setNewItem({ ...newItem, attraction_id: v })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose an attraction" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableAttractions.map((attr) => (
                                    <SelectItem key={attr.id} value={attr.id}>
                                      {attr.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </Field>
                          )}

                          {newItem.item_type === "activity" && (
                            <>
                              <Field>
                                <FieldLabel>Activity Title *</FieldLabel>
                                <Input
                                  value={newItem.title}
                                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                  placeholder="e.g., Traditional Coffee Ceremony"
                                />
                              </Field>
                              <Field>
                                <FieldLabel>Description</FieldLabel>
                                <Textarea
                                  value={newItem.description}
                                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                  placeholder="Describe the activity..."
                                />
                              </Field>
                            </>
                          )}

                          <Field>
                            <FieldLabel>Duration (minutes)</FieldLabel>
                            <Input
                              type="number"
                              min={0}
                              value={newItem.duration_minutes}
                              onChange={(e) => setNewItem({ ...newItem, duration_minutes: parseInt(e.target.value) || 0 })}
                            />
                          </Field>

                          <Field>
                            <FieldLabel>Notes</FieldLabel>
                            <Input
                              value={newItem.notes}
                              onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                              placeholder="e.g., Included in package price"
                            />
                          </Field>

                          <Button onClick={() => handleAddItem(day.id)} className="w-full">
                            Add Item
                          </Button>
                        </FieldGroup>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Cities Tab */}
        <TabsContent value="cities" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Add the cities this package covers and how many nights in each.
            </p>
            <Dialog open={addCityOpen} onOpenChange={setAddCityOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add City
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add City</DialogTitle>
                </DialogHeader>
                <FieldGroup>
                  <Field>
                    <FieldLabel>City *</FieldLabel>
                    <Select value={newCity.city_id} onValueChange={(v) => setNewCity({ ...newCity, city_id: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCities.map((city) => (
                          <SelectItem key={city.id} value={city.id}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <div className="grid gap-4 grid-cols-2">
                    <Field>
                      <FieldLabel>Order</FieldLabel>
                      <Input
                        type="number"
                        min={1}
                        value={newCity.order}
                        onChange={(e) => setNewCity({ ...newCity, order: parseInt(e.target.value) || 1 })}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Nights</FieldLabel>
                      <Input
                        type="number"
                        min={0}
                        value={newCity.night_count}
                        onChange={(e) => setNewCity({ ...newCity, night_count: parseInt(e.target.value) || 0 })}
                      />
                    </Field>
                  </div>
                  <Button onClick={handleAddCity} className="w-full">Add City</Button>
                </FieldGroup>
              </DialogContent>
            </Dialog>
          </div>

          {(!pkg.cities || pkg.cities.length === 0) ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No cities added</h3>
                <p className="text-muted-foreground">Add the destinations covered in this package.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pkg.cities
                .sort((a, b) => a.order - b.order)
                .map((cityEntry) => (
                  <Card key={cityEntry.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                          {cityEntry.order}
                        </div>
                        <div>
                          <p className="font-medium">{cityEntry.city.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {cityEntry.night_count} night{cityEntry.night_count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveCity(cityEntry.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        {/* Departures Tab */}
        <TabsContent value="departures" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Departure Windows</h2>
              <p className="text-sm text-muted-foreground">
                Define fixed start/end dates that travelers can book.
              </p>
            </div>
            <Button onClick={openAddDeparture}>
              <Plus className="mr-2 h-4 w-4" />
              Add Departure
            </Button>
          </div>

          {departuresLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : departures.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No departures yet</h3>
                <p className="text-muted-foreground">Add departure windows so travelers can book this package.</p>
                <Button className="mt-4" onClick={openAddDeparture}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Departure
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {departures
                .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
                .map((dep) => {
                  const seatsLeft = dep.available_seats
                  const urgent = seatsLeft > 0 && seatsLeft <= 3
                  const full = seatsLeft === 0
                  return (
                    <Card key={dep.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <CalendarDays className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {new Date(dep.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              {" – "}
                              {new Date(dep.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{dep.max_seats} max seats</span>
                              {full ? (
                                <Badge variant="secondary">Fully Booked</Badge>
                              ) : urgent ? (
                                <Badge variant="destructive">{seatsLeft} left</Badge>
                              ) : (
                                <Badge variant="outline" className="text-green-600 border-green-300">{seatsLeft} available</Badge>
                              )}
                              {!dep.is_active && <Badge variant="outline">Inactive</Badge>}
                            </div>
                            {dep.notes && <p className="mt-1 text-xs text-muted-foreground">{dep.notes}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDeparture(dep)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteDeparture(dep.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          )}

          {/* Add/Edit Departure Dialog */}
          <Dialog open={departureDialogOpen} onOpenChange={setDepartureDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingDeparture ? "Edit Departure" : "Add Departure"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="dep-start">Start Date *</FieldLabel>
                    <Input
                      id="dep-start"
                      type="date"
                      value={departureForm.start_date}
                      onChange={(e) => setDepartureForm({ ...departureForm, start_date: e.target.value })}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="dep-end">End Date *</FieldLabel>
                    <Input
                      id="dep-end"
                      type="date"
                      min={departureForm.start_date}
                      value={departureForm.end_date}
                      onChange={(e) => setDepartureForm({ ...departureForm, end_date: e.target.value })}
                      required
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="dep-seats">Max Seats *</FieldLabel>
                  <Input
                    id="dep-seats"
                    type="number"
                    min={1}
                    value={departureForm.max_seats}
                    onChange={(e) => setDepartureForm({ ...departureForm, max_seats: parseInt(e.target.value) || 1 })}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="dep-notes">Notes (optional)</FieldLabel>
                  <Input
                    id="dep-notes"
                    value={departureForm.notes}
                    onChange={(e) => setDepartureForm({ ...departureForm, notes: e.target.value })}
                    placeholder="e.g. Special occasion, limited availability..."
                  />
                </Field>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="dep-active"
                    checked={departureForm.is_active}
                    onChange={(e) => setDepartureForm({ ...departureForm, is_active: e.target.checked })}
                    className="h-4 w-4 rounded border-input"
                  />
                  <label htmlFor="dep-active" className="text-sm font-medium">
                    Active (visible to travelers)
                  </label>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={() => setDepartureDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDepartureSubmit}
                    disabled={departureSubmitting || !departureForm.start_date || !departureForm.end_date}
                  >
                    {departureSubmitting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                    ) : editingDeparture ? "Update Departure" : "Add Departure"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Package Details</CardTitle>
              <CardDescription>
                Edit the basic information and pricing for your package.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                To update package details, please use the package creation form or contact support.
                Basic editing will be available in the next update.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{CATEGORIES.find(c => c.value === pkg.category)?.label || pkg.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{pkg.duration_days} Days</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price per Person</p>
                  <p className="font-medium">{pkg.price_per_person} {pkg.price_currency}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Max Group Size</p>
                  <p className="font-medium">{pkg.max_group_size || "Unlimited"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
