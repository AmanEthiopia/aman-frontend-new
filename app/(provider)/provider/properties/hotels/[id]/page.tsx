"use client"

import { useState, useEffect, use, useRef } from "react"
import { getMediaUrl } from "@/lib/utils/media"
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
  EyeOff,
  CheckCircle2,
  XCircle,
  Camera,
  Bed,
  DollarSign,
  AlertCircle,
  Upload,
  X,
  ImagePlus,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Hash,
} from "lucide-react"
import { getRoomUnits, createRoomUnit, updateRoomUnit, deleteRoomUnit } from "@/lib/api/hotels"
import type { RoomUnit } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RequestVerificationButton } from "@/components/provider/request-verification-button"
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
import type { ProviderHotel, ProviderRoom, CreateRoomPayload, PropertyPhoto } from "@/lib/api/provider"
import { amenityLabel } from "@/lib/api/provider"
import { formatRating } from "@/lib/utils"

const HOTEL_PHOTO_TYPES = ["exterior", "lobby", "room", "bathroom", "facilities", "dining", "other"]

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


function RoomUnitsSection({ hotelId, roomId }: { hotelId: string; roomId: string }) {
  const [units, setUnits] = useState<RoomUnit[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [newUnitNumber, setNewUnitNumber] = useState("")
  const [newUnitLabel, setNewUnitLabel] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  async function loadUnits() {
    setIsLoading(true)
    try {
      const data = await getRoomUnits(hotelId, roomId)
      setUnits(data)
    } catch {
      toast.error("Failed to load room units")
    } finally {
      setIsLoading(false)
    }
  }

  function handleToggle() {
    if (!isOpen) loadUnits()
    setIsOpen((v) => !v)
  }

  async function handleAdd() {
    if (!newUnitNumber.trim()) return
    setIsSaving(true)
    try {
      const unit = await createRoomUnit(hotelId, roomId, {
        unit_number: newUnitNumber.trim(),
        label: newUnitLabel.trim() || undefined,
        is_active: true,
      })
      setUnits((p) => [...p, unit])
      setNewUnitNumber("")
      setNewUnitLabel("")
      setIsAdding(false)
      toast.success("Room unit added")
    } catch {
      toast.error("Failed to add room unit")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleToggleActive(unit: RoomUnit) {
    try {
      const updated = await updateRoomUnit(hotelId, roomId, unit.id, { is_active: !unit.is_active })
      setUnits((p) => p.map((u) => (u.id === unit.id ? updated : u)))
    } catch {
      toast.error("Failed to update unit")
    }
  }

  async function handleDelete(unitId: string) {
    try {
      await deleteRoomUnit(hotelId, roomId, unitId)
      setUnits((p) => p.filter((u) => u.id !== unitId))
      toast.success("Unit removed")
    } catch {
      toast.error("Failed to delete unit")
    }
  }

  return (
    <div className="mt-3 border-t pt-3">
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <Hash className="h-4 w-4" />
        Room Units {units.length > 0 ? `(${units.length})` : ""}
        <span className="ml-1 text-xs">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="mt-3 space-y-3">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <>
              {units.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {units.map((unit) => (
                    <div
                      key={unit.id}
                      className={`group flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs ${
                        unit.is_active ? "border-border bg-background" : "border-border/50 bg-muted text-muted-foreground"
                      }`}
                    >
                      <span className="font-medium">{unit.label || unit.unit_number}</span>
                      {unit.label && <span className="text-muted-foreground">#{unit.unit_number}</span>}
                      <button
                        type="button"
                        onClick={() => handleToggleActive(unit)}
                        title={unit.is_active ? "Mark inactive" : "Mark active"}
                        className="ml-0.5 text-muted-foreground hover:text-foreground"
                      >
                        {unit.is_active ? (
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(unit.id)}
                        className="ml-0.5 hidden text-muted-foreground hover:text-destructive group-hover:inline"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No room units added. Add physical room numbers to enable unit-level availability tracking.</p>
              )}

              {isAdding ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <Input
                    placeholder="Room # (e.g. 101)"
                    value={newUnitNumber}
                    onChange={(e) => setNewUnitNumber(e.target.value)}
                    className="h-8 w-28 text-sm"
                  />
                  <Input
                    placeholder="Label (optional)"
                    value={newUnitLabel}
                    onChange={(e) => setNewUnitLabel(e.target.value)}
                    className="h-8 w-36 text-sm"
                  />
                  <Button type="button" size="sm" onClick={handleAdd} disabled={isSaving || !newUnitNumber.trim()}>
                    {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Add"}
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAdding(true)}
                >
                  <Plus className="mr-1.5 h-3 w-3" />
                  Add Unit
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function RoomPhotosSection({ hotelId, roomId }: { hotelId: string; roomId: string }) {
  const [photos, setPhotos] = useState<PropertyPhoto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function loadPhotos() {
    setIsLoading(true)
    try {
      const data = await providerAPI.getRoomPhotos(hotelId, roomId)
      setPhotos(data)
    } catch {
      toast.error("Failed to load room photos")
    } finally {
      setIsLoading(false)
    }
  }

  function handleToggle() {
    if (!isOpen) loadPhotos()
    setIsOpen((v) => !v)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error("Max file size is 5 MB"); return }
    if (photos.length >= 5) { toast.error("Maximum 5 photos per room"); return }
    setIsUploading(true)
    try {
      const photo = await providerAPI.uploadRoomPhoto(hotelId, roomId, file)
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
      await providerAPI.deleteRoomPhoto(hotelId, roomId, photoId)
      setPhotos((p) => p.filter((x) => x.id !== photoId))
      toast.success("Photo deleted")
    } catch {
      toast.error("Failed to delete photo")
    }
  }

  return (
    <div className="mt-4 border-t pt-4">
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <Camera className="h-4 w-4" />
        Room Photos {photos.length > 0 ? `(${photos.length})` : ""}
        <span className="ml-1 text-xs">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="mt-3 space-y-3">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : photos.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {photos.map((photo) => (
                <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
                  <img src={getMediaUrl(photo.url) || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleDelete(photo.id)}
                    className="absolute right-1 top-1 hidden rounded-full bg-black/60 p-1 text-white group-hover:flex"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No photos yet · Best: JPEG, square 1:1, 800×800</p>
          )}

          {photos.length < 5 && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <><Loader2 className="mr-2 h-3 w-3 animate-spin" />Uploading...</>
                ) : (
                  <><ImagePlus className="mr-2 h-3 w-3" />Add Photo</>
                )}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function HotelPhotosSection({ hotelId, onPhotosChange }: { hotelId: string; onPhotosChange?: () => void }) {
  const [photos, setPhotos] = useState<PropertyPhoto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [photoType, setPhotoType] = useState("exterior")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadPhotos()
  }, [hotelId])

  async function loadPhotos() {
    setIsLoading(true)
    try {
      const data = await providerAPI.getHotelPhotos(hotelId)
      setPhotos(data)
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
      const photo = await providerAPI.uploadHotelPhoto(hotelId, file, photoType)
      setPhotos((p) => [...p, photo])
      onPhotosChange?.()
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
      await providerAPI.deleteHotelPhoto(hotelId, photoId)
      setPhotos((p) => p.filter((x) => x.id !== photoId))
      onPhotosChange?.()
      toast.success("Photo deleted")
    } catch {
      toast.error("Failed to delete photo")
    }
  }

  async function handleSetPrimary(photoId: string) {
    try {
      await providerAPI.setHotelPhotoPrimary(hotelId, photoId)
      await loadPhotos()
      onPhotosChange?.()
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
      await providerAPI.reorderHotelPhotos(
        hotelId,
        newPhotos.map((p, i) => ({ id: p.id, display_order: i + 1 }))
      )
      onPhotosChange?.()
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
            Hotel Photos
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
                {HOTEL_PHOTO_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            <Button
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
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
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : photos.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {photos.map((photo, index) => (
              <div key={photo.id} className="group relative aspect-video overflow-hidden rounded-lg bg-muted">
                <img src={getMediaUrl(photo.url) || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
                {photo.is_primary && (
                  <div className="absolute left-1 top-1 rounded bg-yellow-400 px-1.5 py-0.5 text-[10px] font-bold text-yellow-900">
                    Cover
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 hidden flex-col gap-1 bg-black/50 p-2 group-hover:flex">
                  {!photo.is_primary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(photo.id)}
                      className="flex items-center gap-1 text-xs text-yellow-300 hover:text-yellow-100"
                    >
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
                  <button
                    type="button"
                    onClick={() => handleDelete(photo.id)}
                    className="flex items-center gap-1 text-xs text-red-300 hover:text-red-100"
                  >
                    <Trash2 className="h-3 w-3" />Delete
                  </button>
                </div>
                <div className="absolute right-1 top-1 hidden rounded bg-black/60 px-1.5 py-0.5 text-[10px] capitalize text-white group-hover:block">
                  {photo.photo_type ?? photo.category}
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
  const [customAmenityInput, setCustomAmenityInput] = useState("")
  const [amenities, setAmenities] = useState<string[]>([])
  const [priceUsd, setPriceUsd] = useState<number | "">("")
  const [priceEtb, setPriceEtb] = useState<number | "">("")
  const [formData, setFormData] = useState<Omit<CreateRoomPayload, "amenities" | "price_per_night" | "price_etb">>({
    name: "",
    description: "",
    room_type: "standard",
    max_guests: 2,
    bed_type: "Queen",
    quantity: 1,
  })

  const updateField = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const toggleAmenity = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    )
  }

  const addCustomAmenity = () => {
    const val = customAmenityInput.trim()
    if (!val || amenities.includes(val)) return
    setAmenities((prev) => [...prev, val])
    setCustomAmenityInput("")
  }

  const removeCustomAmenity = (amenity: string) => {
    setAmenities((prev) => prev.filter((a) => a !== amenity))
  }

  const customAmenities = amenities.filter((a) => !ROOM_AMENITIES.includes(a))

  const handleClose = () => {
    setFormData({ name: "", description: "", room_type: "standard", max_guests: 2, bed_type: "Queen", quantity: 1 })
    setAmenities([])
    setPriceUsd("")
    setPriceEtb("")
    setCustomAmenityInput("")
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!priceUsd && !priceEtb) {
      toast.error("Please enter at least one price (ETB or USD)")
      return
    }
    setIsSubmitting(true)
    try {
      const payload: CreateRoomPayload = { ...formData, amenities }
      if (priceUsd !== "" && Number(priceUsd) > 0) payload.price_per_night = Number(priceUsd)
      if (priceEtb !== "" && Number(priceEtb) > 0) payload.price_etb = Number(priceEtb)
      await providerAPI.createRoom(hotelId, payload)
      toast.success("Room added successfully")
      onSuccess()
      handleClose()
    } catch (error) {
      console.error("[v0] Failed to create room:", error)
      toast.error("Failed to add room")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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

          {/* Pricing */}
          <div className="space-y-2">
            <Label>Price per Night</Label>
            <p className="text-xs text-muted-foreground">Enter price in ETB, USD, or both — no conversion needed</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="add_price_etb" className="text-sm font-normal text-muted-foreground">
                  ETB (Ethiopian Birr)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground select-none">ETB</span>
                  <Input
                    id="add_price_etb"
                    type="number"
                    min={0}
                    step="0.01"
                    className="pl-14"
                    value={priceEtb}
                    onChange={(e) => setPriceEtb(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="e.g., 5000"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add_price_usd" className="text-sm font-normal text-muted-foreground">
                  USD (US Dollar)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground select-none">$</span>
                  <Input
                    id="add_price_usd"
                    type="number"
                    min={0}
                    step="0.01"
                    className="pl-8"
                    value={priceUsd}
                    onChange={(e) => setPriceUsd(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="e.g., 120"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
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

          <div className="space-y-3">
            <Label>Room Amenities</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              {ROOM_AMENITIES.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`room-amenity-${amenity}`}
                    checked={amenities.includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                  />
                  <Label htmlFor={`room-amenity-${amenity}`} className="cursor-pointer text-sm">
                    {amenity}
                  </Label>
                </div>
              ))}
            </div>

            {/* Custom amenity chips */}
            {customAmenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {customAmenities.map((amenity) => (
                  <Badge key={amenity} variant="secondary" className="gap-1 pr-1 text-sm">
                    {amenity}
                    <button
                      type="button"
                      onClick={() => removeCustomAmenity(amenity)}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Add custom amenity */}
            <div className="flex gap-2">
              <Input
                placeholder="Add custom amenity (e.g., Sea View)"
                value={customAmenityInput}
                onChange={(e) => setCustomAmenityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); addCustomAmenity() }
                }}
                className="max-w-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCustomAmenity}
                disabled={!customAmenityInput.trim()}
              >
                <Plus className="mr-1 h-3 w-3" />
                Add
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
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
  hotelId,
  onEdit,
  onDelete,
}: {
  room: ProviderRoom
  hotelId: string
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
                {room.room_type && <Badge variant="outline">{roomTypeLabels[room.room_type]}</Badge>}
                {!room.is_available && (
                  <Badge variant="secondary">Unavailable</Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{room.description}</p>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Up to {room.max_adults ?? room.max_guests} guests
                </span>
                <span className="flex items-center gap-1">
                  <Bed className="h-4 w-4 text-muted-foreground" />
                  {room.bed_type}
                </span>
                {(room.base_price || room.price_per_night) ? (
                  <span className="font-medium text-primary">
                    ${Number(room.base_price ?? room.price_per_night).toLocaleString()}/night
                  </span>
                ) : null}
                {room.price_etb ? (
                  <span className="font-medium text-primary">
                    {Number(room.price_etb).toLocaleString()} ETB/night
                  </span>
                ) : null}
              </div>
              {room.amenities.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {room.amenities.slice(0, 4).map((amenity, i) => {
                    const label = amenityLabel(amenity)
                    return (
                      <Badge key={`${label}-${i}`} variant="secondary" className="text-xs">
                        {label}
                      </Badge>
                    )
                  })}
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
              <p className="text-sm text-muted-foreground">{room.total_units ?? room.quantity} rooms</p>
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
        <RoomUnitsSection hotelId={hotelId} roomId={room.id} />
        <RoomPhotosSection hotelId={hotelId} roomId={room.id} />
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
  const [isPublishing, setIsPublishing] = useState(false)
  const [heroPhotos, setHeroPhotos] = useState<PropertyPhoto[]>([])
  const [heroSlide, setHeroSlide] = useState(0)

  useEffect(() => {
    loadHotel()
  }, [resolvedParams.id])

  async function loadHeroPhotos(hotelId: string) {
    try {
      const data = await providerAPI.getHotelPhotos(hotelId)
      setHeroPhotos(data)
      setHeroSlide(0)
    } catch { /* silent — hero falls back to cover_photo_url */ }
  }

  async function loadHotel() {
    setIsLoading(true)
    try {
      const data = await providerAPI.getMyHotel(resolvedParams.id)
      setHotel(data)
      loadHeroPhotos(resolvedParams.id)
    } catch (error) {
      console.error("[v0] Failed to load hotel:", error)
      toast.error("Failed to load hotel data")
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

  const handleTogglePublish = async () => {
    if (!hotel) return
    setIsPublishing(true)
    try {
      const result = await providerAPI.publishHotel(resolvedParams.id)
      setHotel((prev) => prev ? { ...prev, is_active: result.is_published, is_verified: result.is_verified } : prev)
      toast.success(result.is_published ? "Hotel published" : "Hotel unpublished")
    } catch (error) {
      toast.error("Failed to update publish status")
    } finally {
      setIsPublishing(false)
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
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{hotel.name}</h1>
              {hotel.is_verified ? (
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
              <Badge variant={hotel.is_active ? "default" : "secondary"}>
                {hotel.is_active ? "Published" : "Unpublished"}
              </Badge>
              <RequestVerificationButton
                category="hotel"
                propertyId={hotel.id}
                isVerified={hotel.is_verified}
                isPublished={hotel.is_active}
              />
            </div>
            {hotel.nickname && (
              <p className="text-muted-foreground">{hotel.nickname}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTogglePublish} disabled={isPublishing}>
            {isPublishing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : hotel.is_active ? (
              <EyeOff className="mr-2 h-4 w-4" />
            ) : (
              <Eye className="mr-2 h-4 w-4" />
            )}
            {hotel.is_active ? "Unpublish" : "Publish"}
          </Button>
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
              {heroPhotos.length > 0 ? (
                <>
                  <img
                    src={getMediaUrl(heroPhotos[heroSlide].url) || "/placeholder.svg"}
                    alt={hotel.name}
                    className="h-full w-full object-cover transition-opacity duration-300"
                  />
                  {heroPhotos.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setHeroSlide((i) => (i - 1 + heroPhotos.length) % heroPhotos.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeroSlide((i) => (i + 1) % heroPhotos.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {heroPhotos.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setHeroSlide(i)}
                            className={`h-1.5 rounded-full transition-all ${i === heroSlide ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : hotel.cover_photo_url ? (
                <img
                  src={getMediaUrl(hotel.cover_photo_url)}
                  alt={hotel.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted">
                  <Camera className="h-16 w-16 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No photos uploaded yet</p>
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
                {heroPhotos.length > 1 && (
                  <Badge className="bg-background/90 text-foreground">
                    {heroSlide + 1}/{heroPhotos.length}
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
                  <p className="mt-2 text-xs text-muted-foreground">Room Types</p>
                  <p className="font-semibold">{hotel.rooms?.length ?? 0}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <CheckCircle2 className="mx-auto h-5 w-5 text-green-600" />
                  <p className="mt-2 text-xs text-muted-foreground">Total Units</p>
                  <p className="font-semibold">
                    {(hotel.rooms ?? []).reduce((sum, r) => sum + (r.total_units ?? (r as any).quantity ?? 0), 0)}
                  </p>
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
                  <span className="text-2xl font-bold text-primary">{hotel.rating ? formatRating(hotel.rating) : "N/A"}</span>
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
                {hotel.amenities?.map((amenity, i) => {
                  const label = amenityLabel(amenity)
                  return (
                    <Badge key={`${label}-${i}`} variant="secondary">
                      {label}
                    </Badge>
                  )
                })}
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
                hotelId={hotel.id}
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

      {/* Hotel Photos */}
      <HotelPhotosSection
        hotelId={hotel.id}
        onPhotosChange={() => loadHeroPhotos(hotel.id)}
      />

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
