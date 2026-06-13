"use client"

import { useState, useEffect, use, useRef } from "react"
import { getMediaUrl } from "@/lib/utils/media"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Loader2,
  Check,
  UtensilsCrossed,
  Clock,
  MapPin,
  Camera,
  Upload,
  Trash2,
  Star,
  X,
  Plus,
  Edit,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { LocationPicker } from "@/components/location/location-picker"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { toast } from "sonner"
import * as providerAPI from "@/lib/api/provider"
import * as contentAPI from "@/lib/api/content"
import type { ProviderRestaurant, PropertyPhoto, MenuItem, CreateMenuItemPayload } from "@/lib/api/provider"
import type { City } from "@/lib/api/content"

const RESTAURANT_PHOTO_TYPES = ["exterior", "interior", "food", "ambiance", "other"]

const EMPTY_MENU_ITEM: CreateMenuItemPayload = {
  name: "",
  category: "",
  description: "",
  price: 0,
  currency: "USD",
  is_available: true,
  is_popular: false,
  dietary_tags: [],
}

// ============================================================================
// Photos section
// ============================================================================

function RestaurantPhotosSection({ restaurantId }: { restaurantId: string }) {
  const [photos, setPhotos] = useState<PropertyPhoto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [photoType, setPhotoType] = useState("exterior")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadPhotos()
  }, [restaurantId])

  async function loadPhotos() {
    setIsLoading(true)
    try {
      setPhotos(await providerAPI.getRestaurantPhotos(restaurantId))
    } catch {
      setPhotos([])
    } finally {
      setIsLoading(false)
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error("Max file size is 5 MB"); return }
    if (photos.length >= 5) { toast.error("Maximum 5 photos allowed"); return }
    setIsUploading(true)
    try {
      const photo = await providerAPI.uploadRestaurantPhoto(restaurantId, file, photoType)
      setPhotos((p) => [...p, photo])
      toast.success("Photo uploaded")
    } catch {
      toast.error("Failed to upload photo")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function handleDelete(photoId: string) {
    try {
      await providerAPI.deleteRestaurantPhoto(restaurantId, photoId)
      setPhotos((p) => p.filter((x) => x.id !== photoId))
      toast.success("Photo deleted")
    } catch {
      toast.error("Failed to delete photo")
    }
  }

  async function handleSetPrimary(photoId: string) {
    try {
      await providerAPI.setRestaurantPhotoPrimary(restaurantId, photoId)
      await loadPhotos()
      toast.success("Cover photo updated")
    } catch {
      toast.error("Failed to set primary photo")
    }
  }

  async function handleReorder(index: number, direction: "up" | "down") {
    const newPhotos = [...photos]
    const swapIndex = direction === "up" ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= newPhotos.length) return
    ;[newPhotos[index], newPhotos[swapIndex]] = [newPhotos[swapIndex], newPhotos[index]]
    setPhotos(newPhotos)
    try {
      await providerAPI.reorderRestaurantPhotos(
        restaurantId,
        newPhotos.map((p, i) => ({ id: p.id, display_order: i + 1 }))
      )
    } catch {
      toast.error("Failed to reorder photos")
      await loadPhotos()
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Restaurant Photos
          </CardTitle>
          <CardDescription>{photos.length}/5 photos · JPEG, 16:9 landscape · Max 5 MB</CardDescription>
        </div>
        {photos.length < 5 && (
          <div className="flex items-center gap-2">
            <Select value={photoType} onValueChange={setPhotoType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RESTAURANT_PHOTO_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            <Button variant="outline" size="sm" disabled={isUploading} onClick={() => fileInputRef.current?.click()}>
              {isUploading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</>
              ) : (
                <><Upload className="mr-2 h-4 w-4" />Upload</>
              )}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : photos.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {photos.map((photo, index) => (
              <div key={photo.id} className="group relative aspect-video overflow-hidden rounded-lg bg-muted">
                <img src={getMediaUrl(photo.url)} alt="" className="h-full w-full object-cover" />
                {photo.is_primary && (
                  <div className="absolute left-1 top-1 rounded bg-yellow-400 px-1.5 py-0.5 text-[10px] font-bold text-yellow-900">
                    Cover
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 hidden flex-col gap-1 bg-black/50 p-2 group-hover:flex">
                  {!photo.is_primary && (
                    <button type="button" onClick={() => handleSetPrimary(photo.id)}
                      className="flex items-center gap-1 text-xs text-yellow-300 hover:text-yellow-100">
                      <Star className="h-3 w-3" />Set as Cover
                    </button>
                  )}
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleReorder(index, "up")}
                      disabled={index === 0}
                      className="flex items-center gap-1 text-xs text-white/80 hover:text-white disabled:opacity-30"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReorder(index, "down")}
                      disabled={index === photos.length - 1}
                      className="flex items-center gap-1 text-xs text-white/80 hover:text-white disabled:opacity-30"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>
                  <button type="button" onClick={() => handleDelete(photo.id)}
                    className="flex items-center gap-1 text-xs text-red-300 hover:text-red-100">
                    <Trash2 className="h-3 w-3" />Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12">
            <Camera className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No photos yet. Upload up to 5 photos.</p>
            <p className="mt-1 text-xs text-muted-foreground">Best: JPEG, 1920×1080, landscape 16:9</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Menu items section
// ============================================================================

function MenuItemModal({
  open,
  onClose,
  restaurantId,
  item,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  restaurantId: string
  item: MenuItem | null
  onSaved: (saved: MenuItem) => void
}) {
  const [form, setForm] = useState<CreateMenuItemPayload>(item ? {
    name: item.name,
    category: item.category ?? "",
    description: item.description ?? "",
    price: Number(item.price),
    currency: item.currency,
    is_available: item.is_available,
    is_popular: item.is_popular,
    dietary_tags: item.dietary_tags ?? [],
  } : { ...EMPTY_MENU_ITEM })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState("")

  useEffect(() => {
    if (open) {
      setForm(item ? {
        name: item.name,
        category: item.category ?? "",
        description: item.description ?? "",
        price: Number(item.price),
        currency: item.currency,
        is_available: item.is_available,
        is_popular: item.is_popular,
        dietary_tags: item.dietary_tags ?? [],
      } : { ...EMPTY_MENU_ITEM })
      setTagInput("")
    }
  }, [open, item])

  function update<K extends keyof CreateMenuItemPayload>(k: K, v: CreateMenuItemPayload[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      const tag = tagInput.trim().toLowerCase()
      if (tag && !(form.dietary_tags ?? []).includes(tag)) {
        update("dietary_tags", [...(form.dietary_tags ?? []), tag])
      }
      setTagInput("")
    }
  }

  function removeTag(tag: string) {
    update("dietary_tags", (form.dietary_tags ?? []).filter((t) => t !== tag))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      let saved: MenuItem
      if (item) {
        saved = await providerAPI.updateMenuItem(restaurantId, item.id, form)
        toast.success("Menu item updated")
      } else {
        saved = await providerAPI.createMenuItem(restaurantId, form)
        toast.success("Menu item added")
      }
      onSaved(saved)
      onClose()
    } catch {
      toast.error(item ? "Failed to update item" : "Failed to add item")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
          <DialogDescription>Fill in the details for this menu item</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => update("name", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={form.category} onChange={(e) => update("category", e.target.value)} placeholder="e.g., Starters" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={2} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Price *</Label>
              <Input type="number" min={0} step="0.01" value={form.price || ""} onChange={(e) => update("price", Number(e.target.value))} required />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={form.currency} onValueChange={(v) => update("currency", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="ETB">ETB</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={form.is_available} onCheckedChange={(v) => update("is_available", v)} id="is_available" />
              <Label htmlFor="is_available">Available</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_popular} onCheckedChange={(v) => update("is_popular", v)} id="is_popular" />
              <Label htmlFor="is_popular">Popular</Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Dietary Tags</Label>
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
              placeholder="Type tag and press Enter (e.g., vegan)"
            />
            {(form.dietary_tags ?? []).length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {(form.dietary_tags ?? []).map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Check className="mr-2 h-4 w-4" />{item ? "Update" : "Add Item"}</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function MenuItemsSection({ restaurantId }: { restaurantId: string }) {
  const [items, setItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [deleteItem, setDeleteItem] = useState<MenuItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadItems()
  }, [restaurantId])

  async function loadItems() {
    setIsLoading(true)
    try {
      setItems(await providerAPI.getMenuItems(restaurantId))
    } catch {
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }

  function handleSaved(saved: MenuItem) {
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.id === saved.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = saved
        return next
      }
      return [...prev, saved]
    })
  }

  async function handleDelete() {
    if (!deleteItem) return
    setIsDeleting(true)
    try {
      await providerAPI.deleteMenuItem(restaurantId, deleteItem.id)
      setItems((p) => p.filter((x) => x.id !== deleteItem.id))
      toast.success("Item deleted")
    } catch {
      toast.error("Failed to delete item")
    } finally {
      setIsDeleting(false)
      setDeleteItem(null)
    }
  }

  async function handleToggle(item: MenuItem) {
    try {
      const updated = await providerAPI.toggleMenuItemAvailability(restaurantId, item.id)
      setItems((p) => p.map((x) => (x.id === item.id ? updated : x)))
    } catch {
      toast.error("Failed to toggle availability")
    }
  }

  // Group by category
  const grouped = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const cat = item.category || "Uncategorized"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5" />
            Menu Items
          </CardTitle>
          <CardDescription>{items.length} item{items.length !== 1 ? "s" : ""}</CardDescription>
        </div>
        <Button size="sm" onClick={() => { setEditingItem(null); setModalOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" />Add Item
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12">
            <UtensilsCrossed className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No menu items yet. Add your first item.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([cat, catItems]) => (
              <div key={cat}>
                <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{cat}</h4>
                <div className="divide-y rounded-lg border">
                  {catItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.name}</span>
                          {item.is_popular && <Badge variant="secondary" className="text-xs">Popular</Badge>}
                          {(item.dietary_tags ?? []).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                        {item.description && (
                          <p className="mt-0.5 truncate text-sm text-muted-foreground">{item.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <span className="font-semibold whitespace-nowrap">
                          {item.currency} {Number(item.price).toFixed(2)}
                        </span>
                        <Switch
                          checked={item.is_available}
                          onCheckedChange={() => handleToggle(item)}
                          title={item.is_available ? "Available" : "Unavailable"}
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditingItem(item); setModalOpen(true) }}>
                              <Edit className="mr-2 h-4 w-4" />Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setDeleteItem(item)} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <MenuItemModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        restaurantId={restaurantId}
        item={editingItem}
        onSaved={handleSaved}
      />

      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
            <AlertDialogDescription>
              Delete "{deleteItem?.name}"? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

const CUISINE_OPTIONS = [
  "Ethiopian", "Italian", "Chinese", "Indian", "Mexican", "American",
  "French", "Japanese", "Middle Eastern", "Mediterranean", "Vegetarian", "Vegan",
]

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
const DAY_LABELS: Record<string, string> = {
  monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday", thursday: "Thursday",
  friday: "Friday", saturday: "Saturday", sunday: "Sunday",
}

interface RestaurantFormData {
  name: string
  nickname: string
  description: string
  cuisine_types: string[]
  price_range: "budget" | "moderate" | "expensive" | "fine_dining"
  address: string
  latitude?: number | null
  longitude?: number | null
  city_id: string
  seating_capacity: string
  has_delivery: boolean
  has_takeaway: boolean
  has_dine_in: boolean
  opening_hours: Record<string, string>
}

export default function EditRestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<ProviderRestaurant | null>(null)
  const [cities, setCities] = useState<City[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<RestaurantFormData>({
    name: "",
    nickname: "",
    description: "",
    cuisine_types: [],
    price_range: "moderate",
    address: "",
    city_id: "",
    seating_capacity: "",
    has_delivery: false,
    has_takeaway: false,
    has_dine_in: true,
    opening_hours: {},
  })

  useEffect(() => {
    loadData()
  }, [resolvedParams.id])

  async function loadData() {
    setIsLoading(true)
    try {
      const [restaurantData, citiesData] = await Promise.all([
        providerAPI.getMyRestaurant(resolvedParams.id),
        contentAPI.getCities().catch(() => []),
      ])
      setRestaurant(restaurantData)
      setCities(citiesData)
      setFormData({
        name: restaurantData.name || "",
        nickname: restaurantData.nickname || "",
        description: restaurantData.description || "",
        cuisine_types: restaurantData.cuisine_types || [],
        price_range: (restaurantData.price_range as any) || "moderate",
        address: restaurantData.address || "",
        latitude: (restaurantData as any).latitude ?? null,
        longitude: (restaurantData as any).longitude ?? null,
        city_id: restaurantData.city_id || "",
        seating_capacity: restaurantData.seating_capacity != null ? String(restaurantData.seating_capacity) : "",
        has_delivery: restaurantData.has_delivery || false,
        has_takeaway: restaurantData.has_takeaway || false,
        has_dine_in: restaurantData.has_dine_in !== false,
        opening_hours: restaurantData.opening_hours || {},
      })
    } catch (error) {
      console.error("[v0] Failed to load restaurant:", error)
      toast.error("Failed to load restaurant data")
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = <K extends keyof RestaurantFormData>(key: K, value: RestaurantFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const toggleCuisine = (cuisine: string) => {
    const lower = cuisine.toLowerCase()
    if (formData.cuisine_types.includes(lower)) {
      updateField("cuisine_types", formData.cuisine_types.filter((c) => c !== lower))
    } else {
      updateField("cuisine_types", [...formData.cuisine_types, lower])
    }
  }

  const updateHours = (day: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      opening_hours: { ...prev.opening_hours, [day]: value },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload: any = {
        ...formData,
        seating_capacity: formData.seating_capacity ? Number(formData.seating_capacity) : undefined,
      }
      await providerAPI.updateRestaurant(resolvedParams.id, payload)
      toast.success("Restaurant updated successfully")
      router.push(`/provider/properties/restaurants/${resolvedParams.id}`)
    } catch (error) {
      console.error("[v0] Failed to update restaurant:", error)
      toast.error("Failed to update restaurant")
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

  if (!restaurant) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-semibold">Restaurant not found</h2>
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
        <Link href={`/provider/properties/restaurants/${restaurant.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Restaurant</h1>
          <p className="text-muted-foreground">{restaurant.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" id="restaurant-edit-form">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Update the basic details about your restaurant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g., Lucy Restaurant"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nickname">Amharic Name (Optional)</Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(e) => updateField("nickname", e.target.value)}
                  placeholder="e.g., ሉሲ ምግብ ቤት"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Describe your restaurant, cuisine, and atmosphere..."
                rows={4}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Price Range *</Label>
                <Select
                  value={formData.price_range}
                  onValueChange={(v) => updateField("price_range", v as any)}
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

            <div className="grid gap-4 sm:grid-cols-2">
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
              <div className="sm:col-span-2">
                <LocationPicker
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  onChange={(c) => {
                    updateField("latitude", c.latitude)
                    updateField("longitude", c.longitude)
                  }}
                  label="Map location (helps travelers find you & 'Near me')"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seating_capacity">Seating Capacity</Label>
                <Input
                  id="seating_capacity"
                  type="number"
                  min={1}
                  value={formData.seating_capacity}
                  onChange={(e) => updateField("seating_capacity", e.target.value)}
                  placeholder="e.g., 80"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cuisine Types */}
        <Card>
          <CardHeader>
            <CardTitle>Cuisine Types</CardTitle>
            <CardDescription>Select all that apply</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {CUISINE_OPTIONS.map((cuisine) => {
                const lower = cuisine.toLowerCase()
                const selected = formData.cuisine_types.includes(lower)
                return (
                  <button
                    key={cuisine}
                    type="button"
                    onClick={() => toggleCuisine(cuisine)}
                    className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input hover:bg-muted"
                    }`}
                  >
                    {cuisine}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Service Options */}
        <Card>
          <CardHeader>
            <CardTitle>Service Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="has_dine_in">Dine-in</Label>
              <Switch
                id="has_dine_in"
                checked={formData.has_dine_in}
                onCheckedChange={(v) => updateField("has_dine_in", v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="has_takeaway">Takeaway</Label>
              <Switch
                id="has_takeaway"
                checked={formData.has_takeaway}
                onCheckedChange={(v) => updateField("has_takeaway", v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="has_delivery">Delivery</Label>
              <Switch
                id="has_delivery"
                checked={formData.has_delivery}
                onCheckedChange={(v) => updateField("has_delivery", v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Opening Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Opening Hours
            </CardTitle>
            <CardDescription>e.g., 08:00 - 22:00 or Closed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {DAYS.map((day) => (
              <div key={day} className="grid grid-cols-[100px_1fr] items-center gap-3">
                <Label className="capitalize">{DAY_LABELS[day]}</Label>
                <Input
                  value={formData.opening_hours[day] || ""}
                  onChange={(e) => updateHours(day, e.target.value)}
                  placeholder="e.g., 09:00 - 22:00"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link href={`/provider/properties/restaurants/${restaurant.id}`}>
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

      {/* Photos & Menu (saved immediately, outside the main form) */}
      <RestaurantPhotosSection restaurantId={restaurant.id} />
      <MenuItemsSection restaurantId={restaurant.id} />
    </div>
  )
}
