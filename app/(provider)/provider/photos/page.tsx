"use client"

import { useState } from "react"
import { Upload, Trash2, GripVertical, Eye, Star, ImageIcon, Plus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface PropertyPhoto {
  id: string
  url: string
  caption: string
  category: string
  isPrimary: boolean
  order: number
}

const mockPhotos: PropertyPhoto[] = [
  {
    id: "p1",
    url: "/luxury-hotel-exterior-addis-ababa.jpg",
    caption: "Hotel Exterior",
    category: "exterior",
    isPrimary: true,
    order: 1,
  },
  {
    id: "p2",
    url: "/luxury-hotel-lobby-ethiopia.jpg",
    caption: "Grand Lobby",
    category: "interior",
    isPrimary: false,
    order: 2,
  },
  {
    id: "p3",
    url: "/deluxe-hotel-room-bed.jpg",
    caption: "Deluxe Suite",
    category: "rooms",
    isPrimary: false,
    order: 3,
  },
  {
    id: "p4",
    url: "/hotel-bathroom-modern.jpg",
    caption: "Suite Bathroom",
    category: "rooms",
    isPrimary: false,
    order: 4,
  },
  {
    id: "p5",
    url: "/hotel-restaurant-breakfast.jpg",
    caption: "Restaurant",
    category: "amenities",
    isPrimary: false,
    order: 5,
  },
  {
    id: "p6",
    url: "/hotel-swimming-pool.png",
    caption: "Swimming Pool",
    category: "amenities",
    isPrimary: false,
    order: 6,
  },
]

const categories = [
  { value: "all", label: "All Photos" },
  { value: "exterior", label: "Exterior" },
  { value: "interior", label: "Interior" },
  { value: "rooms", label: "Rooms" },
  { value: "amenities", label: "Amenities" },
]

function PhotoCard({
  photo,
  onSetPrimary,
  onDelete,
  onPreview,
}: {
  photo: PropertyPhoto
  onSetPrimary: () => void
  onDelete: () => void
  onPreview: () => void
}) {
  return (
    <div className="group relative overflow-hidden rounded-lg border bg-card">
      <div className="relative aspect-[4/3]">
        <img src={photo.url || "/placeholder.svg"} alt={photo.caption} className="h-full w-full object-cover" />
        {photo.isPrimary && (
          <Badge className="absolute left-2 top-2 gap-1">
            <Star className="h-3 w-3 fill-current" />
            Primary
          </Badge>
        )}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="secondary" size="icon" onClick={onPreview}>
            <Eye className="h-4 w-4" />
          </Button>
          {!photo.isPrimary && (
            <Button variant="secondary" size="icon" onClick={onSetPrimary}>
              <Star className="h-4 w-4" />
            </Button>
          )}
          <Button variant="destructive" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="absolute left-2 top-2 cursor-grab opacity-0 transition-opacity group-hover:opacity-100">
          <div className="rounded bg-black/50 p-1">
            <GripVertical className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>
      <div className="p-3">
        <p className="font-medium">{photo.caption}</p>
        <p className="text-sm text-muted-foreground capitalize">{photo.category}</p>
      </div>
    </div>
  )
}

export default function ProviderPhotosPage() {
  const [photos, setPhotos] = useState(mockPhotos)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [previewPhoto, setPreviewPhoto] = useState<PropertyPhoto | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  const filteredPhotos = selectedCategory === "all" ? photos : photos.filter((p) => p.category === selectedCategory)

  const handleSetPrimary = (id: string) => {
    setPhotos((prev) => prev.map((p) => ({ ...p, isPrimary: p.id === id })))
  }

  const handleDelete = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Photos</h1>
          <p className="text-muted-foreground">Manage your property images</p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Photos
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Photos</DialogTitle>
              <DialogDescription>Add new photos to your property listing</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8">
                <ImageIcon className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-2 font-medium">Drag photos here or click to browse</p>
                <p className="text-sm text-muted-foreground">JPEG, PNG up to 10MB each</p>
                <Button variant="outline" className="mt-4 bg-transparent">
                  <Plus className="mr-2 h-4 w-4" />
                  Select Files
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Caption</Label>
                <Input placeholder="Describe this photo..." />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <select className="w-full rounded-md border p-2">
                  {categories.slice(1).map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setUploadDialogOpen(false)}>Upload</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tips Card */}
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
        <CardContent className="py-4">
          <div className="flex items-start gap-4">
            <ImageIcon className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">Photo Tips</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Properties with 10+ high-quality photos receive 40% more bookings. Show your best rooms, amenities, and
                unique features.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Button
            key={category.value}
            variant={selectedCategory === category.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.value)}
            className={cn(selectedCategory !== category.value && "bg-transparent")}
          >
            {category.label}
            {category.value !== "all" && (
              <Badge variant="secondary" className="ml-2">
                {photos.filter((p) => p.category === category.value).length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Photos Grid */}
      {filteredPhotos.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onSetPrimary={() => handleSetPrimary(photo.id)}
              onDelete={() => handleDelete(photo.id)}
              onPreview={() => setPreviewPhoto(photo)}
            />
          ))}
          {/* Add More Card */}
          <button
            onClick={() => setUploadDialogOpen(true)}
            className="flex aspect-[4/3] flex-col items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Plus className="mb-2 h-8 w-8" />
            <span className="font-medium">Add Photo</span>
          </button>
        </div>
      ) : (
        <div className="py-16 text-center">
          <ImageIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="font-semibold">No photos in this category</h3>
          <p className="text-muted-foreground">Upload photos to showcase your property</p>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewPhoto} onOpenChange={() => setPreviewPhoto(null)}>
        <DialogContent className="max-w-3xl">
          {previewPhoto && (
            <>
              <img
                src={previewPhoto.url || "/placeholder.svg"}
                alt={previewPhoto.caption}
                className="w-full rounded-lg"
              />
              <div className="mt-4">
                <h3 className="font-semibold">{previewPhoto.caption}</h3>
                <p className="text-sm text-muted-foreground capitalize">{previewPhoto.category}</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
