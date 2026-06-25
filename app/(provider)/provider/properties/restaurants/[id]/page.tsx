"use client"

import { useState, useEffect, use, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Edit,
  Trash2,
  UtensilsCrossed,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  Plus,
  MoreVertical,
  Flame,
  GripVertical,
  ImagePlus,
  ToggleLeft,
  ToggleRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { RequestVerificationButton } from "@/components/provider/request-verification-button"
import * as providerAPI from "@/lib/api/provider"
import type { ProviderRestaurant, MenuItem } from "@/lib/api/provider"
import { getMediaUrl } from "@/lib/utils/media"

const priceRangeLabels: Record<string, string> = {
  budget: "Budget",
  moderate: "Moderate",
  mid_range: "Mid-Range",
  upscale: "Upscale",
  fine_dining: "Fine Dining",
}

const DAY_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
const DAY_LABELS: Record<string, string> = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu",
  friday: "Fri", saturday: "Sat", sunday: "Sun",
}

// ─── Menu Management ──────────────────────────────────────────────────────────

interface MenuItemFormState {
  name: string
  category: string
  description: string
  price: string
  currency: string
  is_available: boolean
  is_popular: boolean
  dietary_tags: string
}

const BLANK_FORM: MenuItemFormState = {
  name: "", category: "", description: "", price: "",
  currency: "ETB", is_available: true, is_popular: false, dietary_tags: "",
}

function MenuManagementSection({ restaurantId }: { restaurantId: string }) {
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [reorderMode, setReorderMode] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [form, setForm] = useState<MenuItemFormState>(BLANK_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [photoTarget, setPhotoTarget] = useState<MenuItem | null>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const dragItem = useRef<number | null>(null)
  const dragOverItem = useRef<number | null>(null)

  useEffect(() => {
    load()
  }, [restaurantId])

  async function load() {
    setLoading(true)
    try {
      const [itemsData, catsData] = await Promise.all([
        providerAPI.getMenuItems(restaurantId),
        providerAPI.getMenuCategories(restaurantId).catch(() => [] as string[]),
      ])
      setItems(itemsData)
      setCategories(catsData)
    } catch {
      toast.error("Failed to load menu")
    } finally {
      setLoading(false)
    }
  }

  function openAddForm() {
    setEditingItem(null)
    setForm(BLANK_FORM)
    setShowForm(true)
  }

  function openEditForm(item: MenuItem) {
    setEditingItem(item)
    setForm({
      name: item.name,
      category: item.category ?? "",
      description: item.description ?? "",
      price: String(item.price),
      currency: item.currency,
      is_available: item.is_available,
      is_popular: item.is_popular,
      dietary_tags: item.dietary_tags?.join(", ") ?? "",
    })
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.name || !form.price) {
      toast.error("Name and price are required")
      return
    }
    setSaving(true)
    try {
      const payload: providerAPI.CreateMenuItemPayload = {
        name: form.name,
        category: form.category || undefined,
        description: form.description || undefined,
        price: parseFloat(form.price),
        currency: form.currency,
        is_available: form.is_available,
        is_popular: form.is_popular,
        dietary_tags: form.dietary_tags ? form.dietary_tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      }
      if (editingItem) {
        const updated = await providerAPI.updateMenuItem(restaurantId, editingItem.id, payload)
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
        toast.success("Item updated")
      } else {
        const created = await providerAPI.createMenuItem(restaurantId, payload)
        setItems((prev) => [...prev, created])
        if (payload.category && !categories.includes(payload.category)) {
          setCategories((prev) => [...prev, payload.category!])
        }
        toast.success("Item added")
      }
      setShowForm(false)
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save item")
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(item: MenuItem) {
    try {
      const updated = await providerAPI.toggleMenuItemAvailability(restaurantId, item.id)
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
    } catch {
      toast.error("Failed to toggle availability")
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await providerAPI.deleteMenuItem(restaurantId, deleteTarget.id)
      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id))
      toast.success("Item deleted")
      setDeleteTarget(null)
    } catch {
      toast.error("Failed to delete item")
    } finally {
      setDeleting(false)
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !photoTarget) return
    try {
      const updated = await providerAPI.uploadMenuItemPhoto(restaurantId, photoTarget.id, file)
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
      toast.success("Photo updated")
    } catch {
      toast.error("Failed to upload photo")
    } finally {
      setPhotoTarget(null)
      if (photoInputRef.current) photoInputRef.current.value = ""
    }
  }

  function handleDragStart(index: number) {
    dragItem.current = index
  }

  function handleDragEnter(index: number) {
    dragOverItem.current = index
  }

  async function handleDragEnd() {
    if (dragItem.current === null || dragOverItem.current === null) return
    const copy = [...items]
    const dragged = copy.splice(dragItem.current, 1)[0]
    copy.splice(dragOverItem.current, 0, dragged)
    const reordered = copy.map((item, i) => ({ ...item, display_order: i }))
    setItems(reordered)
    dragItem.current = null
    dragOverItem.current = null
    try {
      await providerAPI.reorderMenuItems(restaurantId, reordered.map((i) => ({ id: i.id, display_order: i.display_order ?? 0 })))
    } catch {
      toast.error("Failed to save order")
    }
  }

  // Group by category
  const grouped: Record<string, MenuItem[]> = {}
  for (const item of items) {
    const cat = item.category ?? "Uncategorized"
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(item)
  }
  const groupKeys = Object.keys(grouped)

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5" />
              Menu
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={reorderMode ? "default" : "outline"}
                size="sm"
                onClick={() => setReorderMode((v) => !v)}
              >
                <GripVertical className="mr-1.5 h-4 w-4" />
                {reorderMode ? "Done Reordering" : "Reorder"}
              </Button>
              <Button size="sm" onClick={openAddForm}>
                <Plus className="mr-1.5 h-4 w-4" />
                Add Item
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              <UtensilsCrossed className="mx-auto mb-3 h-8 w-8 opacity-40" />
              <p className="font-medium">No menu items yet</p>
              <p className="text-sm">Add your first item to get started</p>
              <Button size="sm" className="mt-3" onClick={openAddForm}>
                <Plus className="mr-1.5 h-4 w-4" /> Add Item
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {groupKeys.map((cat) => (
                <div key={cat}>
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    <span className="h-px flex-1 bg-border" />
                    {cat}
                    <span className="h-px flex-1 bg-border" />
                  </h4>
                  <div className="space-y-2">
                    {grouped[cat].map((item, idx) => (
                      <div
                        key={item.id}
                        draggable={reorderMode}
                        onDragStart={() => handleDragStart(items.indexOf(item))}
                        onDragEnter={() => handleDragEnter(items.indexOf(item))}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                          reorderMode ? "cursor-grab border-dashed" : ""
                        } ${!item.is_available ? "opacity-60" : ""}`}
                      >
                        {reorderMode && <GripVertical className="h-5 w-5 shrink-0 text-muted-foreground" />}

                        {/* Thumbnail */}
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                          {item.photo_url ? (
                            <img
                              src={getMediaUrl(item.photo_url) || "/placeholder.svg"}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <UtensilsCrossed className="h-5 w-5 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>

                        {/* Name + badges */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="truncate font-medium text-sm">{item.name}</span>
                            {item.is_popular && (
                              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 text-xs">
                                <Flame className="mr-0.5 h-2.5 w-2.5" /> Popular
                              </Badge>
                            )}
                            {item.is_available ? (
                              <Badge variant="outline" className="text-xs text-green-600 border-green-300">Available</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs text-red-600 border-red-300">Sold Out</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{item.currency} {item.price}</p>
                        </div>

                        {/* Context menu */}
                        {!reorderMode && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditForm(item)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setPhotoTarget(item)
                                  photoInputRef.current?.click()
                                }}
                              >
                                <ImagePlus className="mr-2 h-4 w-4" /> Upload Photo
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggle(item)}>
                                {item.is_available ? (
                                  <><ToggleLeft className="mr-2 h-4 w-4" /> Mark Sold Out</>
                                ) : (
                                  <><ToggleRight className="mr-2 h-4 w-4" /> Mark Available</>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeleteTarget(item)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <Button variant="outline" size="sm" onClick={openAddForm}>
                  <Plus className="mr-1.5 h-4 w-4" /> Add Category / Item
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hidden photo input */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoUpload}
      />

      {/* Add/Edit dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Category</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="e.g. Starters, Main Dishes, Drinks"
                list="category-suggestions"
              />
              <datalist id="category-suggestions">
                {categories.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div>
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Item name"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Short description"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Price *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Input
                  value={form.currency}
                  onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                  placeholder="ETB"
                />
              </div>
            </div>
            <div>
              <Label>Dietary Tags</Label>
              <Input
                value={form.dietary_tags}
                onChange={(e) => setForm((f) => ({ ...f, dietary_tags: e.target.value }))}
                placeholder="vegan, gluten-free (comma separated)"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Available</Label>
              <Switch
                checked={form.is_available}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_available: v }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Mark as Popular</Label>
              <Switch
                checked={form.is_popular}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_popular: v }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
            <AlertDialogDescription>
              Delete "{deleteTarget?.name}"? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default function RestaurantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<ProviderRestaurant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [showUnpublishDialog, setShowUnpublishDialog] = useState(false)

  useEffect(() => {
    loadRestaurant()
  }, [resolvedParams.id])

  async function loadRestaurant() {
    setIsLoading(true)
    try {
      const data = await providerAPI.getMyRestaurant(resolvedParams.id)
      setRestaurant(data)
    } catch (error) {
      console.error("[v0] Failed to load restaurant:", error)
      toast.error("Failed to load restaurant")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await providerAPI.deleteRestaurant(resolvedParams.id)
      toast.success("Restaurant deleted successfully")
      router.push("/provider/properties")
    } catch (error) {
      console.error("[v0] Failed to delete restaurant:", error)
      toast.error("Failed to delete restaurant")
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleTogglePublish = async () => {
    if (!restaurant) return
    // Unpublishing requires confirmation; publishing happens directly.
    if (restaurant.is_active) {
      setShowUnpublishDialog(true)
      return
    }
    setIsPublishing(true)
    try {
      const result = await providerAPI.publishRestaurant(resolvedParams.id)
      setRestaurant((prev) => prev ? { ...prev, is_active: result.is_published, is_verified: result.is_verified } : prev)
      toast.success("Restaurant published")
    } catch (error) {
      toast.error("Failed to update publish status")
    } finally {
      setIsPublishing(false)
    }
  }

  const handleConfirmUnpublish = async () => {
    if (!restaurant) return
    setIsPublishing(true)
    try {
      const result = await providerAPI.unpublishRestaurant(resolvedParams.id)
      setRestaurant((prev) => prev ? { ...prev, is_active: result.is_published } : prev)
      toast.success("Restaurant unpublished — it's now hidden from travelers")
    } catch (error) {
      toast.error("Failed to unpublish")
    } finally {
      setIsPublishing(false)
      setShowUnpublishDialog(false)
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
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{restaurant.name}</h1>
              {restaurant.is_verified ? (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Verified
                </Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Unverified
                </Badge>
              )}
              <Badge variant={restaurant.is_active ? "default" : "secondary"}>
                {restaurant.is_active ? "Published" : "Unpublished"}
              </Badge>
              <RequestVerificationButton
                category="restaurant"
                propertyId={restaurant.id}
                isVerified={restaurant.is_verified}
                isPublished={restaurant.is_active}
              />
            </div>
            {restaurant.nickname && (
              <p className="text-muted-foreground">{restaurant.nickname}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleTogglePublish}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : restaurant.is_active ? (
              <EyeOff className="mr-2 h-4 w-4" />
            ) : (
              <Eye className="mr-2 h-4 w-4" />
            )}
            {restaurant.is_active ? "Unpublish" : "Publish"}
          </Button>
          <Link href={`/provider/properties/restaurants/${restaurant.id}/edit`}>
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5" />
                Restaurant Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{restaurant.description}</p>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {restaurant.cuisine_types && restaurant.cuisine_types.length > 0 && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Cuisine</p>
                    <p className="mt-1 font-semibold capitalize">
                      {restaurant.cuisine_types.join(", ")}
                    </p>
                  </div>
                )}
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Price Range</p>
                  <p className="mt-1 font-semibold">
                    {priceRangeLabels[restaurant.price_range] || restaurant.price_range}
                  </p>
                </div>
                {restaurant.seating_capacity != null && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Seating</p>
                    <p className="mt-1 font-semibold">{restaurant.seating_capacity} seats</p>
                  </div>
                )}
              </div>

              {restaurant.city_name && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>{restaurant.address ? `${restaurant.address}, ` : ""}{restaurant.city_name}</span>
                </div>
              )}

              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  {restaurant.has_dine_in ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span>Dine-in</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {restaurant.has_takeaway ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span>Takeaway</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {restaurant.has_delivery ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span>Delivery</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Opening Hours */}
          {restaurant.opening_hours && Object.keys(restaurant.opening_hours).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Opening Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {DAY_ORDER.map((day) => {
                    const hours = restaurant.opening_hours[day]
                    if (!hours) return null
                    return (
                      <div key={day} className="flex items-center justify-between text-sm">
                        <span className="w-12 font-medium capitalize">{DAY_LABELS[day]}</span>
                        <span className="text-muted-foreground">{hours}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Menu Management */}
          <MenuManagementSection restaurantId={restaurant.id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Performance */}
          {(restaurant.rating !== undefined || restaurant.review_count !== undefined) && (
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {restaurant.rating !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Rating</span>
                    <span className="font-semibold">{restaurant.rating ?? "N/A"} / 5</span>
                  </div>
                )}
                {restaurant.review_count !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Reviews</span>
                    <span className="font-semibold">{restaurant.review_count}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Restaurant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{restaurant.name}"? This cannot be undone.
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
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unpublish Confirmation */}
      <AlertDialog open={showUnpublishDialog} onOpenChange={setShowUnpublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unpublish this listing?</AlertDialogTitle>
            <AlertDialogDescription>
              It will be hidden from travelers until you publish it again. Your data,
              bookings, and reviews are kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPublishing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUnpublish} disabled={isPublishing}>
              {isPublishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Unpublishing...
                </>
              ) : (
                "Unpublish"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
