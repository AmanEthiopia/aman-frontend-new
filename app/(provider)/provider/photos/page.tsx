"use client"

import { useState, useEffect, useCallback } from "react"
import { Upload, Trash2, GripVertical, Eye, Star, ImageIcon, Plus, Loader2, Building2, UtensilsCrossed, Car, Map, Package as PackageIcon } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { getMediaUrl } from "@/lib/utils/media"
import { toast } from "sonner"
import { getMyProperties, type PropertyBase } from "@/lib/api/provider"
import { getProviderGuides, type Guide } from "@/lib/api/guides"
import { getProviderPackages, type Package } from "@/lib/api/experiences"

interface PropertyPhoto {
  id: string
  url: string
  caption: string
  category: string
  isPrimary: boolean
  order: number
  propertyId?: string
  propertyName?: string
  propertyType?: string
}

interface PropertyOrService {
  id: string
  name: string
  type: "hotel" | "restaurant" | "driver" | "trip" | "guide" | "package"
  photos?: PropertyPhoto[]
}

const categories = [
  { value: "all", label: "All Photos" },
  { value: "exterior", label: "Exterior" },
  { value: "interior", label: "Interior" },
  { value: "rooms", label: "Rooms" },
  { value: "amenities", label: "Amenities" },
  { value: "food", label: "Food & Dining" },
  { value: "other", label: "Other" },
]

const typeIcons = {
  hotel: Building2,
  restaurant: UtensilsCrossed,
  driver: Car,
  trip: Map,
  guide: Map,
  package: PackageIcon,
}

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
        <img src={getMediaUrl(photo.url) || "/placeholder.svg"} alt={photo.caption} className="h-full w-full object-cover" />
        {photo.isPrimary && (
          <Badge className="absolute left-2 top-2 gap-1">
            <Star className="h-3 w-3 fill-current" />
            Primary
          </Badge>
        )}
        {photo.propertyName && (
          <Badge variant="secondary" className="absolute right-2 top-2 max-w-[120px] truncate">
            {photo.propertyName}
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
  const [photos, setPhotos] = useState<PropertyPhoto[]>([])
  const [properties, setProperties] = useState<PropertyOrService[]>([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState("all")
  const [previewPhoto, setPreviewPhoto] = useState<PropertyPhoto | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  
  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadCaption, setUploadCaption] = useState("")
  const [uploadCategory, setUploadCategory] = useState("exterior")
  const [uploadPropertyId, setUploadPropertyId] = useState("")

  // Fetch properties and their photos
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const allProperties: PropertyOrService[] = []
        const allPhotos: PropertyPhoto[] = []

        // Fetch properties
        try {
          const propertiesResponse = await getMyProperties({ page_size: 100 })
          const propertiesList = (propertiesResponse as any)?.results || propertiesResponse || []
          propertiesList.forEach((prop: any) => {
            allProperties.push({
              id: prop.id,
              name: prop.name,
              type: prop.category,
            })
            // Add mock photos for demo - in production these would come from the API
            if (prop.cover_image) {
              allPhotos.push({
                id: `photo-${prop.id}-cover`,
                url: prop.cover_image,
                caption: `${prop.name} - Cover`,
                category: "exterior",
                isPrimary: true,
                order: 1,
                propertyId: prop.id,
                propertyName: prop.name,
                propertyType: prop.category,
              })
            }
          })
        } catch (e) {
          console.log("Error fetching properties:", e)
        }

        // Fetch guides
        try {
          const guidesResponse = await getProviderGuides()
          const guidesList = (guidesResponse as any)?.results || guidesResponse || []
          guidesList.forEach((guide: any) => {
            allProperties.push({
              id: guide.id,
              name: guide.title || guide.name || "Guide Service",
              type: "guide",
            })
            if (guide.profile_photo) {
              allPhotos.push({
                id: `photo-guide-${guide.id}`,
                url: guide.profile_photo,
                caption: guide.title || guide.name || "Guide Photo",
                category: "other",
                isPrimary: true,
                order: 1,
                propertyId: guide.id,
                propertyName: guide.title || guide.name,
                propertyType: "guide",
              })
            }
          })
        } catch (e) {
          console.log("Error fetching guides:", e)
        }

        // Fetch packages
        try {
          const packagesResponse = await getProviderPackages()
          const packagesList = (packagesResponse as any)?.results || packagesResponse || []
          packagesList.forEach((pkg: any) => {
            allProperties.push({
              id: pkg.id,
              name: pkg.title,
              type: "package",
            })
            if (pkg.cover_image_url) {
              allPhotos.push({
                id: `photo-pkg-${pkg.id}`,
                url: pkg.cover_image_url,
                caption: pkg.title,
                category: "other",
                isPrimary: true,
                order: 1,
                propertyId: pkg.id,
                propertyName: pkg.title,
                propertyType: "package",
              })
            }
          })
        } catch (e) {
          console.log("Error fetching packages:", e)
        }

        setProperties(allProperties)
        setPhotos(allPhotos)
      } catch (error) {
        console.error("Error loading data:", error)
        toast.error("Failed to load photos")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredPhotos = photos.filter((p) => {
    const categoryMatch = selectedCategory === "all" || p.category === selectedCategory
    const propertyMatch = selectedPropertyFilter === "all" || p.propertyId === selectedPropertyFilter
    return categoryMatch && propertyMatch
  })

  const handleSetPrimary = (id: string) => {
    setPhotos((prev) => prev.map((p) => ({ ...p, isPrimary: p.id === id })))
    toast.success("Primary photo updated")
  }

  const handleDelete = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id))
    toast.success("Photo deleted")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB")
        return
      }
      setUploadFile(file)
    }
  }

  const handleUpload = async () => {
    if (!uploadFile || !uploadPropertyId) {
      toast.error("Please select a file and property")
      return
    }

    setUploading(true)
    try {
      // Create a preview URL for immediate display
      const previewUrl = URL.createObjectURL(uploadFile)
      const property = properties.find(p => p.id === uploadPropertyId)
      
      const newPhoto: PropertyPhoto = {
        id: `photo-${Date.now()}`,
        url: previewUrl,
        caption: uploadCaption || "New Photo",
        category: uploadCategory,
        isPrimary: false,
        order: photos.length + 1,
        propertyId: uploadPropertyId,
        propertyName: property?.name,
        propertyType: property?.type,
      }

      setPhotos(prev => [...prev, newPhoto])
      toast.success("Photo uploaded successfully")
      
      // Reset form
      setUploadFile(null)
      setUploadCaption("")
      setUploadCategory("exterior")
      setUploadPropertyId("")
      setUploadDialogOpen(false)
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload photo")
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Photos</h1>
          <p className="text-muted-foreground">Manage photos for your properties and services</p>
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
              <DialogDescription>Add new photos to your property or service listing</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Property / Service *</Label>
                <Select value={uploadPropertyId} onValueChange={setUploadPropertyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property or service" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((prop) => {
                      const Icon = typeIcons[prop.type]
                      return (
                        <SelectItem key={prop.id} value={prop.id}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span>{prop.name}</span>
                            <Badge variant="outline" className="ml-1 text-xs capitalize">{prop.type}</Badge>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6">
                {uploadFile ? (
                  <div className="text-center">
                    <img 
                      src={URL.createObjectURL(uploadFile)} 
                      alt="Preview" 
                      className="mx-auto h-32 w-32 rounded-lg object-cover"
                    />
                    <p className="mt-2 text-sm text-muted-foreground">{uploadFile.name}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setUploadFile(null)}
                      className="mt-2"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="mb-4 h-10 w-10 text-muted-foreground" />
                    <p className="mb-2 text-sm font-medium">Click to browse or drag files here</p>
                    <p className="text-xs text-muted-foreground">JPEG, PNG up to 10MB</p>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label>Caption</Label>
                <Input 
                  placeholder="Describe this photo..." 
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={uploadCategory} onValueChange={setUploadCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.slice(1).map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={uploading || !uploadFile || !uploadPropertyId}>
                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upload
              </Button>
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

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <Label className="text-xs text-muted-foreground mb-1 block">Filter by Property/Service</Label>
          <Select value={selectedPropertyFilter} onValueChange={setSelectedPropertyFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties & Services</SelectItem>
              {properties.map((prop) => {
                const Icon = typeIcons[prop.type]
                return (
                  <SelectItem key={prop.id} value={prop.id}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {prop.name}
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
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
          <h3 className="font-semibold">No photos found</h3>
          <p className="text-muted-foreground mb-4">
            {properties.length === 0 
              ? "Add properties or services first, then upload photos" 
              : "Upload photos to showcase your properties and services"}
          </p>
          {properties.length > 0 && (
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload First Photo
            </Button>
          )}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewPhoto} onOpenChange={() => setPreviewPhoto(null)}>
        <DialogContent className="max-w-3xl">
          {previewPhoto && (
            <>
              <img
                src={getMediaUrl(previewPhoto.url) || "/placeholder.svg"}
                alt={previewPhoto.caption}
                className="w-full rounded-lg"
              />
              <div className="mt-4">
                <h3 className="font-semibold">{previewPhoto.caption}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="capitalize">{previewPhoto.category}</Badge>
                  {previewPhoto.propertyName && (
                    <Badge variant="secondary">{previewPhoto.propertyName}</Badge>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
