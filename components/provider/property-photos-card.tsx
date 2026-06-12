"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, Loader2, Star, Trash2, Upload } from "lucide-react"
import { toast } from "sonner"
import { getMediaUrl } from "@/lib/utils/media"
import {
  deletePropertyPhoto,
  getPropertyPhotos,
  setPropertyPhotoPrimary,
  uploadPropertyPhoto,
  type PhotoKind,
  type PropertyPhotoItem,
} from "@/lib/api/property-photos"

interface Props {
  kind: PhotoKind
  propertyId: string
  title?: string
}

/**
 * Self-contained photo manager for provider detail pages (drivers, trips).
 * Upload, delete, and set-primary against the real backend endpoints.
 */
export function PropertyPhotosCard({ kind, propertyId, title = "Photos" }: Props) {
  const [photos, setPhotos] = useState<PropertyPhotoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getPropertyPhotos(kind, propertyId)
      .then(setPhotos)
      .catch(() => toast.error("Couldn't load photos"))
      .finally(() => setLoading(false))
  }, [kind, propertyId])

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is over 5MB — skipped`)
          continue
        }
        const photo = await uploadPropertyPhoto(kind, propertyId, file, {
          is_primary: photos.length === 0, // first photo becomes the cover
        })
        setPhotos((prev) => [...prev, photo])
      }
      toast.success("Photo uploaded")
    } catch {
      toast.error("Upload failed. Please try again.")
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const handleDelete = async (photoId: string) => {
    setBusyId(photoId)
    try {
      await deletePropertyPhoto(kind, propertyId, photoId)
      setPhotos((prev) => prev.filter((p) => p.id !== photoId))
      toast.success("Photo deleted")
    } catch {
      toast.error("Couldn't delete photo")
    } finally {
      setBusyId(null)
    }
  }

  const handleSetPrimary = async (photoId: string) => {
    setBusyId(photoId)
    try {
      await setPropertyPhotoPrimary(kind, propertyId, photoId)
      setPhotos((prev) => prev.map((p) => ({ ...p, is_primary: p.id === photoId })))
      toast.success("Cover photo updated")
    } catch {
      toast.error("Couldn't set cover photo")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {photos.length} photo{photos.length !== 1 ? "s" : ""} — the starred photo is the cover
          </CardDescription>
        </div>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <Button size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Upload Photos
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-10 text-center">
            <ImageIcon className="mb-2 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium">No photos yet</p>
            <p className="text-sm text-muted-foreground">
              Listings with photos get far more bookings — add at least one.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo) => (
              <div key={photo.id} className="group relative overflow-hidden rounded-lg border">
                <div className="aspect-[4/3]">
                  <img
                    src={getMediaUrl(photo.photo_url) || "/placeholder.svg"}
                    alt={photo.caption || "Photo"}
                    className="h-full w-full object-cover"
                  />
                </div>
                {photo.is_primary && (
                  <Badge className="absolute left-2 top-2 gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Cover
                  </Badge>
                )}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  {!photo.is_primary && (
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => handleSetPrimary(photo.id)}
                      disabled={busyId === photo.id}
                      title="Set as cover"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(photo.id)}
                    disabled={busyId === photo.id}
                    title="Delete photo"
                  >
                    {busyId === photo.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
