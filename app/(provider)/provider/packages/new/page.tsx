"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { createPackage, type PackageCategory } from "@/lib/api/experiences"
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react"
import { useDuplicateGuard } from "@/components/provider/use-duplicate-guard"

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

const CURRENCIES = ["USD", "ETB", "EUR", "GBP"]

export default function NewPackagePage() {
  const router = useRouter()
  const { checkDuplicate, DuplicateDialog } = useDuplicateGuard()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    nickname: "",
    short_description: "",
    description: "",
    category: "multi_city" as PackageCategory,
    duration_days: 3,
    price_per_person: "",
    price_currency: "ETB",
    child_price: "",
    payment_required: true,
    min_group_size: 1,
    max_group_size: 12,
    min_age: undefined as number | undefined,
    meeting_point: "",
    languages: ["English"],
    what_included: [""],
    what_excluded: [""],
    what_to_bring: [""],
    cancellation_policy: "Free cancellation up to 7 days before start date.",
  })

  const handleArrayChange = (field: "what_included" | "what_excluded" | "what_to_bring", index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addArrayItem = (field: "what_included" | "what_excluded" | "what_to_bring") => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ""]
    }))
  }

  const removeArrayItem = (field: "what_included" | "what_excluded" | "what_to_bring", index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!(await checkDuplicate("trip", formData.title))) return
    setSubmitting(true)
    setError(null)

    try {
      const result = await createPackage({
        title: formData.title,
        nickname: formData.nickname || undefined,
        short_description: formData.short_description || undefined,
        description: formData.description || undefined,
        category: formData.category,
        duration_days: formData.duration_days,
        price_per_person: formData.price_per_person,
        price_currency: formData.price_currency,
        child_price: formData.child_price || undefined,
        payment_required: formData.payment_required,
        min_group_size: formData.min_group_size,
        max_group_size: formData.max_group_size,
        min_age: formData.min_age,
        meeting_point: formData.meeting_point || undefined,
        languages: formData.languages.filter(Boolean),
        what_included: formData.what_included.filter(Boolean),
        what_excluded: formData.what_excluded.filter(Boolean),
        what_to_bring: formData.what_to_bring.filter(Boolean),
        cancellation_policy: formData.cancellation_policy || undefined,
      })

      router.push(`/provider/packages/${result.id}/edit`)
    } catch (err: any) {
      setError(err.message || "Failed to create package")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/provider/packages">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create New Package</h1>
          <p className="text-muted-foreground">Set up your travel package details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the main details of your package</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="title">Package Title *</FieldLabel>
                    <Input
                      id="title"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., 7 Days Ethiopia Highlights"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="nickname">Nickname (Local Name)</FieldLabel>
                    <Input
                      id="nickname"
                      value={formData.nickname}
                      onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                      placeholder="e.g., ኢትዮጵያ ጉዞ"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="short_description">Short Description</FieldLabel>
                    <Input
                      id="short_description"
                      value={formData.short_description}
                      onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                      placeholder="Brief one-line description"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="description">Full Description</FieldLabel>
                    <Textarea
                      id="description"
                      rows={5}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detailed description of the package..."
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel>Category *</FieldLabel>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value as PackageCategory })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="duration_days">Duration (Days) *</FieldLabel>
                      <Input
                        id="duration_days"
                        type="number"
                        min={1}
                        required
                        value={formData.duration_days}
                        onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) || 1 })}
                      />
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="meeting_point">Meeting Point</FieldLabel>
                    <Input
                      id="meeting_point"
                      value={formData.meeting_point}
                      onChange={(e) => setFormData({ ...formData, meeting_point: e.target.value })}
                      placeholder="e.g., Bole International Airport, Addis Ababa"
                    />
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field>
                      <FieldLabel htmlFor="price_per_person">Price per Person *</FieldLabel>
                      <Input
                        id="price_per_person"
                        type="number"
                        min={0}
                        step="0.01"
                        required
                        value={formData.price_per_person}
                        onChange={(e) => setFormData({ ...formData, price_per_person: e.target.value })}
                        placeholder="450.00"
                      />
                    </Field>

                    <Field>
                      <FieldLabel>Currency</FieldLabel>
                      <Select
                        value={formData.price_currency}
                        onValueChange={(value) => setFormData({ ...formData, price_currency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map((curr) => (
                            <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="child_price">Child Price</FieldLabel>
                      <Input
                        id="child_price"
                        type="number"
                        min={0}
                        step="0.01"
                        value={formData.child_price}
                        onChange={(e) => setFormData({ ...formData, child_price: e.target.value })}
                        placeholder="250.00"
                      />
                    </Field>
                  </div>

                  <Field className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Require Payment</p>
                      <p className="text-sm text-muted-foreground">
                        Travelers must pay when booking
                      </p>
                    </div>
                    <Switch
                      checked={formData.payment_required}
                      onCheckedChange={(checked) => setFormData({ ...formData, payment_required: checked })}
                    />
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>

            {/* Group Size */}
            <Card>
              <CardHeader>
                <CardTitle>Group Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field>
                      <FieldLabel htmlFor="min_group_size">Min Group Size</FieldLabel>
                      <Input
                        id="min_group_size"
                        type="number"
                        min={1}
                        value={formData.min_group_size}
                        onChange={(e) => setFormData({ ...formData, min_group_size: parseInt(e.target.value) || 1 })}
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="max_group_size">Max Group Size</FieldLabel>
                      <Input
                        id="max_group_size"
                        type="number"
                        min={1}
                        value={formData.max_group_size}
                        onChange={(e) => setFormData({ ...formData, max_group_size: parseInt(e.target.value) || 12 })}
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="min_age">Minimum Age</FieldLabel>
                      <Input
                        id="min_age"
                        type="number"
                        min={0}
                        value={formData.min_age ?? ""}
                        onChange={(e) => setFormData({ ...formData, min_age: e.target.value ? parseInt(e.target.value) : undefined })}
                        placeholder="No minimum"
                      />
                    </Field>
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>

            {/* Inclusions */}
            <Card>
              <CardHeader>
                <CardTitle>What's Included</CardTitle>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  {formData.what_included.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) => handleArrayChange("what_included", index, e.target.value)}
                        placeholder="e.g., Accommodation"
                      />
                      {formData.what_included.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeArrayItem("what_included", index)}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("what_included")}>
                    + Add Item
                  </Button>
                </FieldGroup>
              </CardContent>
            </Card>

            {/* Exclusions */}
            <Card>
              <CardHeader>
                <CardTitle>What's Not Included</CardTitle>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  {formData.what_excluded.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) => handleArrayChange("what_excluded", index, e.target.value)}
                        placeholder="e.g., International flights"
                      />
                      {formData.what_excluded.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeArrayItem("what_excluded", index)}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("what_excluded")}>
                    + Add Item
                  </Button>
                </FieldGroup>
              </CardContent>
            </Card>

            {/* Cancellation */}
            <Card>
              <CardHeader>
                <CardTitle>Cancellation Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.cancellation_policy}
                  onChange={(e) => setFormData({ ...formData, cancellation_policy: e.target.value })}
                  rows={3}
                  placeholder="Describe your cancellation terms..."
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Create Package</CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <p className="mb-4 text-sm text-muted-foreground">
                  After creating the package, you can add cities, build the day-by-day itinerary, and upload photos.
                </p>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Package"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
      {DuplicateDialog}
    </div>
  )
}
