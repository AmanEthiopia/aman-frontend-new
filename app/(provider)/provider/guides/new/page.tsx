"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, X, Loader2 } from "lucide-react"
import { 
  createGuide,
  type GuideServiceType,
  type GuidePricingType,
  SERVICE_TYPE_LABELS,
  PRICING_TYPE_LABELS
} from "@/lib/api/guides"
import { toast } from "sonner"

const COMMON_LANGUAGES = [
  "English", "Amharic", "Tigrinya", "Oromo", "Somali", "French", 
  "German", "Italian", "Spanish", "Chinese", "Japanese", "Arabic"
]

export default function NewGuidePage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  
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
    cancellation_policy: "Free cancellation up to 48 hours before the booking date.",
  })
  
  const [newLanguage, setNewLanguage] = useState("")
  const [newCertification, setNewCertification] = useState("")

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.price || formData.languages.length === 0) {
      toast.error("Please fill in all required fields")
      return
    }

    setSubmitting(true)
    try {
      const guide = await createGuide({
        ...formData,
        years_experience: formData.years_experience || undefined,
        certifications: formData.certifications.length > 0 ? formData.certifications : undefined,
      })
      toast.success("Guide service created successfully!")
      router.push(`/provider/guides/${guide.id}/edit`)
    } catch (error: any) {
      toast.error(error.message || "Failed to create guide service")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/provider/guides">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Add Guide Service</h1>
          <p className="text-muted-foreground">Create a new tour guide, driver, or interpreter listing</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Private Tour Guide — Lalibela & Axum"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nickname">Nickname (Amharic)</Label>
                  <Input
                    id="nickname"
                    placeholder="e.g., ላሊበላ አስጎብኚ"
                    value={formData.nickname}
                    onChange={(e) => handleChange("nickname", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="short_description">Short Description</Label>
                  <Textarea
                    id="short_description"
                    placeholder="Brief description for listings (1-2 sentences)"
                    value={formData.short_description}
                    onChange={(e) => handleChange("short_description", e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description of your services, experience, specialties..."
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={5}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Service Type *</Label>
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
                    <Label>Pricing Type *</Label>
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
                    <Label htmlFor="price">Price *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="price"
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={(e) => handleChange("price", e.target.value)}
                        className="pl-7"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="min_group_size">Min Group Size</Label>
                    <Input
                      id="min_group_size"
                      type="number"
                      min={1}
                      value={formData.min_group_size}
                      onChange={(e) => handleChange("min_group_size", parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_group_size">Max Group Size</Label>
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

            <Card>
              <CardHeader>
                <CardTitle>Languages *</CardTitle>
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

                {formData.languages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.languages.map((lang) => (
                      <Badge key={lang} variant="secondary" className="gap-1">
                        {lang}
                        <button type="button" onClick={() => removeLanguage(lang)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Guide Service"
                  )}
                </Button>
                <Button type="button" variant="outline" className="w-full" asChild>
                  <Link href="/provider/guides">Cancel</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>After creating, you can:</p>
                <ul className="list-inside list-disc space-y-1">
                  <li>Add photos to showcase your services</li>
                  <li>Set operating cities/locations</li>
                  <li>Publish to make visible to travelers</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
