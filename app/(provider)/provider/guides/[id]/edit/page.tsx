"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  ArrowLeft, Plus, X, Loader2, Upload, Trash2, MapPin, 
  Eye, EyeOff, Save, Image as ImageIcon
} from "lucide-react"
import { 
  getProviderGuideById,
  updateGuide,
  toggleGuidePublish,
  getGuideCities,
  addGuideCity,
  removeGuideCity,
  getGuidePhotos,
  uploadGuidePhoto,
  deleteGuidePhoto,
  type Guide,
  type GuideCity,
  type GuidePhoto,
  type GuideServiceType,
  type GuidePricingType,
  SERVICE_TYPE_LABELS,
  PRICING_TYPE_LABELS
} from "@/lib/api/guides"
import { getCities, type City } from "@/lib/api/content"
import { toast } from "sonner"

const API_BASE = "https://api.aman.yichalal.ai"

function getMediaUrl(path: string | null | undefined): string {
  if (!path) return ""
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  if (path.startsWith("/media/")) return `${API_BASE}${path}`
  return `${API_BASE}/media/${path}`
}

const COMMON_LANGUAGES = [
  "English", "Amharic", "Tigrinya", "Oromo", "Somali", "French", 
  "German", "Italian", "Spanish", "Chinese", "Japanese", "Arabic"
]

export default function EditGuidePage() {
  const router = useRouter()
  const params = useParams()
  const guideId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [guide, setGuide] = useState<Guide | null>(null)
  const [cities, setCities] = useState<City[]>([])
  const [guideCities, setGuideCities] = useState<GuideCity[]>([])
  const [photos, setPhotos] = useState<GuidePhoto[]>([])
  const [uploading, setUploading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: "",
    nickname: "",
    description: "",
    short_description: "",
    service_type: "private_tour" as GuideServiceType,
    pricing_type: "daily" as GuidePricingType,
    price: "",
    price_currency: "USD",
    languages: [] as string[],
    min_group_size: 1,
    max_group_size: 8,
    years_experience: 0,
    certifications: [] as string[],
    cancellation_policy: "",
  })
  
  const [newLanguage, setNewLanguage] = useState("")
  const [newCertification, setNewCertification] = useState("")
  const [selectedCity, setSelectedCity] = useState("")

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [guideData, citiesData, guideCitiesData, photosData] = await Promise.all([
          getProviderGuideById(guideId),
          getCities(),
          getGuideCities(guideId).catch(() => []),
          getGuidePhotos(guideId).catch(() => []),
        ])
        
        setGuide(guideData)
        setCities(citiesData)
        setGuideCities(guideCitiesData)
        setPhotos(photosData)
        
        setFormData({
          title: guideData.title || "",
          nickname: guideData.nickname || "",
          description: guideData.description || "",
          short_description: guideData.short_description || "",
          service_type: guideData.service_type,
          pricing_type: guideData.pricing_type,
          price: guideData.price,
          price_currency: guideData.price_currency || "USD",
          languages: guideData.languages || [],
          min_group_size: guideData.min_group_size || 1,
          max_group_size: guideData.max_group_size || 8,
          years_experience: guideData.years_experience || 0,
          certifications: guideData.certifications || [],
          cancellation_policy: guideData.cancellation_policy || "",
        })
      } catch (error) {
        toast.error("Failed to load guide data")
        router.push("/provider/guides")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [guideId, router])

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addLanguage = (lang: string) => {
    if (lang && !formData.languages.includes(lang)) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, lang]
      }))
    }
    setNewLanguage("")
  }

  const removeLanguage = (lang: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== lang)
    }))
  }

  const addCertification = () => {
    if (newCertification && !formData.certifications.includes(newCertification)) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification]
      }))
    }
    setNewCertification("")
  }

  const removeCertification = (cert: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c !== cert)
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await updateGuide(guideId, {
        ...formData,
        years_experience: formData.years_experience || undefined,
        certifications: formData.certifications.length > 0 ? formData.certifications : undefined,
      })
      setGuide(prev => prev ? { ...prev, ...updated } : updated)
      toast.success("Guide updated successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to update guide")
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePublish = async () => {
    try {
      const result = await toggleGuidePublish(guideId)
      setGuide(prev => prev ? { ...prev, is_published: result.is_published } : prev)
      toast.success(result.is_published ? "Guide published!" : "Guide unpublished")
    } catch (error) {
      toast.error("Failed to update publish status")
    }
  }

  const handleAddCity = async () => {
    if (!selectedCity) return
    try {
      const cityEntry = await addGuideCity(guideId, { city: selectedCity })
      setGuideCities([...guideCities, cityEntry])
      setSelectedCity("")
      toast.success("City added successfully")
    } catch (error) {
      toast.error("Failed to add city")
    }
  }

  const handleRemoveCity = async (cityEntryId: string) => {
    try {
      await removeGuideCity(guideId, cityEntryId)
      setGuideCities(guideCities.filter(c => c.id !== cityEntryId))
      toast.success("City removed")
    } catch (error) {
      toast.error("Failed to remove city")
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const photo = await uploadGuidePhoto(guideId, file, {
          is_primary: photos.length === 0,
        })
        setPhotos(prev => [...prev, photo])
      }
      toast.success("Photos uploaded successfully")
    } catch (error) {
      toast.error("Failed to upload photos")
    } finally {
      setUploading(false)
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await deleteGuidePhoto(guideId, photoId)
      setPhotos(photos.filter(p => p.id !== photoId))
      toast.success("Photo deleted")
    } catch (error) {
      toast.error("Failed to delete photo")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!guide) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/provider/guides">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Guide Service</h1>
            <p className="text-muted-foreground">{guide.title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTogglePublish}>
            {guide.is_published ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Unpublish
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Publish
              </>
            )}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex gap-2">
        <Badge variant={guide.is_published ? "default" : "secondary"}>
          {guide.is_published ? "Published" : "Draft"}
        </Badge>
        {guide.is_verified && <Badge variant="outline">Verified</Badge>}
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="cities">Cities ({guideCities.length})</TabsTrigger>
          <TabsTrigger value="photos">Photos ({photos.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname (Amharic)</Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(e) => handleChange("nickname", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description">Short Description</Label>
                <Textarea
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) => handleChange("short_description", e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>

          {/* Service & Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Service & Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Service Type</Label>
                  <Select 
                    value={formData.service_type} 
                    onValueChange={(v) => handleChange("service_type", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Pricing Type</Label>
                  <Select 
                    value={formData.pricing_type} 
                    onValueChange={(v) => handleChange("pricing_type", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRICING_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="price"
                      type="number"
                      min={0}
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleChange("price", e.target.value)}
                      className="pl-7"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_group_size">Min Group</Label>
                  <Input
                    id="min_group_size"
                    type="number"
                    min={1}
                    value={formData.min_group_size}
                    onChange={(e) => handleChange("min_group_size", parseInt(e.target.value) || 1)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_group_size">Max Group</Label>
                  <Input
                    id="max_group_size"
                    type="number"
                    min={1}
                    value={formData.max_group_size}
                    onChange={(e) => handleChange("max_group_size", parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="years_experience">Years of Experience</Label>
                <Input
                  id="years_experience"
                  type="number"
                  min={0}
                  value={formData.years_experience}
                  onChange={(e) => handleChange("years_experience", parseInt(e.target.value) || 0)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Languages */}
          <Card>
            <CardHeader>
              <CardTitle>Languages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {COMMON_LANGUAGES.map((lang) => (
                  <Badge
                    key={lang}
                    variant={formData.languages.includes(lang) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      if (formData.languages.includes(lang)) {
                        removeLanguage(lang)
                      } else {
                        addLanguage(lang)
                      }
                    }}
                  >
                    {lang}
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Add other language..."
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addLanguage(newLanguage)
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={() => addLanguage(newLanguage)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <CardTitle>Certifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Licensed Tour Guide — ETOA"
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addCertification()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addCertification}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {formData.certifications.length > 0 && (
                <div className="space-y-2">
                  {formData.certifications.map((cert, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border p-2">
                      <span className="text-sm">{cert}</span>
                      <button type="button" onClick={() => removeCertification(cert)}>
                        <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cancellation Policy */}
          <Card>
            <CardHeader>
              <CardTitle>Cancellation Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.cancellation_policy}
                onChange={(e) => handleChange("cancellation_policy", e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Operating Locations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a city..." />
                  </SelectTrigger>
                  <SelectContent>
                    {cities
                      .filter(c => !guideCities.some(gc => gc.city.id === c.id))
                      .map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name} {city.nickname && `(${city.nickname})`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAddCity} disabled={!selectedCity}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add City
                </Button>
              </div>

              {guideCities.length > 0 ? (
                <div className="space-y-2">
                  {guideCities.map((cityEntry) => (
                    <div
                      key={cityEntry.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{cityEntry.city.name}</span>
                        {cityEntry.city.nickname && (
                          <span className="text-sm text-muted-foreground">
                            ({cityEntry.city.nickname})
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCity(cityEntry.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No cities added yet. Add cities where you offer your services.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Area */}
              <div className="rounded-lg border-2 border-dashed p-8 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                  disabled={uploading}
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  {uploading ? (
                    <Loader2 className="mx-auto mb-2 h-10 w-10 animate-spin text-muted-foreground" />
                  ) : (
                    <Upload className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
                  )}
                  <p className="text-sm text-muted-foreground">
                    {uploading ? "Uploading..." : "Click to upload photos (max 5MB each)"}
                  </p>
                </label>
              </div>

              {/* Photo Grid */}
              {photos.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {photos.map((photo) => (
                    <div key={photo.id} className="group relative rounded-lg overflow-hidden">
                      <img
                        src={getMediaUrl(photo.photo_url)}
                        alt={photo.caption || "Guide photo"}
                        className="aspect-video w-full object-cover"
                      />
                      {photo.is_primary && (
                        <Badge className="absolute left-2 top-2">Primary</Badge>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeletePhoto(photo.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {photo.caption && (
                        <p className="p-2 text-xs text-muted-foreground">{photo.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <ImageIcon className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No photos uploaded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
