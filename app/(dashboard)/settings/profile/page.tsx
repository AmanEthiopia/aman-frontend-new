"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Camera, Loader2, Save, Trash2, User, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { updateMyProfile, uploadProfilePhoto, deleteProfilePhoto, type UpdateProfilePayload } from "@/lib/api/users"
import { sendPhoneOTP, verifyPhoneOTP } from "@/lib/api/auth"
import { useApp } from "@/lib/contexts/app-context"
import { toast } from "sonner"
import { friendlyError } from "@/lib/utils/errors"

const API_BASE = "https://api.aman.yichalal.ai"

function getMediaUrl(path: string | null | undefined): string {
  if (!path) return ""
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  if (path.startsWith("/media/")) return `${API_BASE}${path}`
  if (!path.startsWith("/")) return `${API_BASE}/media/${path}`
  return `${API_BASE}${path}`
}

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "am", label: "Amharic (አማርኛ)" },
]

const CURRENCIES = [
  { value: "USD", label: "USD ($)" },
  { value: "ETB", label: "ETB (Br)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
]

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
]

const TRAVEL_STYLES = [
  { value: "budget", label: "Budget Traveler" },
  { value: "mid_range", label: "Mid-Range" },
  { value: "luxury", label: "Luxury" },
  { value: "adventure", label: "Adventure Seeker" },
  { value: "cultural", label: "Cultural Explorer" },
  { value: "relaxation", label: "Relaxation Focused" },
]

const INTERESTS = [
  "History & Culture",
  "Nature & Wildlife",
  "Adventure Sports",
  "Food & Culinary",
  "Photography",
  "Religious Sites",
  "Local Markets",
  "Music & Dance",
  "Art & Crafts",
  "Hiking & Trekking",
]

const DIETARY_RESTRICTIONS = [
  "Vegetarian",
  "Vegan",
  "Halal",
  "Kosher",
  "Gluten-Free",
  "Dairy-Free",
  "Nut Allergy",
  "None",
]

export default function ProfileEditPage() {
  const router = useRouter()
  const { userProfile, refreshUser } = useAuth()
  const { setLanguage: setAppLanguage, setCurrency: setAppCurrency } = useApp()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [savedFields, setSavedFields] = useState<Set<string>>(new Set())
  
  // Phone verification state
  const [showPhoneVerification, setShowPhoneVerification] = useState(false)
  const [phoneOtp, setPhoneOtp] = useState("")
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false)
  
  // Track original values for change detection
  const [originalData, setOriginalData] = useState<Record<string, any>>({})
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    bio: "",
    date_of_birth: "",
    gender: "",
    nationality: "",
    preferred_language: "en",
    preferred_currency: "ETB",
    travel_style: "",
    interests: [] as string[],
    dietary_restrictions: [] as string[],
    accessibility_needs: "",
  })

  useEffect(() => {
    if (userProfile) {
      const user = userProfile.user
      const profile = userProfile.profile
      const initialData = {
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        phone: user?.phone || "",
        bio: profile?.bio || "",
        date_of_birth: profile?.date_of_birth || "",
        gender: profile?.gender || "",
        nationality: profile?.nationality || "",
        preferred_language: profile?.preferred_language || "en",
        preferred_currency: profile?.preferred_currency || "ETB",
        travel_style: profile?.travel_style || "",
        interests: profile?.interests || [],
        dietary_restrictions: profile?.dietary_restrictions || [],
        accessibility_needs: profile?.accessibility_needs || "",
      }
      setFormData(initialData)
      setOriginalData(initialData)
      setHasChanges(false)
    }
  }, [userProfile])

  const handleChange = useCallback((field: string, value: string | string[]) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      // Check if data has changed from original
      const hasAnyChange = Object.keys(newData).some(key => {
        const original = originalData[key]
        const current = newData[key as keyof typeof newData]
        if (Array.isArray(original) && Array.isArray(current)) {
          return JSON.stringify(original) !== JSON.stringify(current)
        }
        return original !== current
      })
      setHasChanges(hasAnyChange)
      return newData
    })
    setError(null)
    setSavedFields(prev => {
      const newSet = new Set(prev)
      newSet.delete(field)
      return newSet
    })
  }, [originalData])

  const toggleArrayItem = (field: "interests" | "dietary_restrictions", item: string) => {
    setFormData(prev => {
      const current = prev[field]
      if (current.includes(item)) {
        return { ...prev, [field]: current.filter((i: string) => i !== item) }
      }
      return { ...prev, [field]: [...current, item] }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Only send fields that have actually changed (partial update)
      const changedFields: UpdateProfilePayload = {}
      
      for (const [key, value] of Object.entries(formData)) {
        const original = originalData[key]
        const current = value
        
        // Check if the value has changed
        let hasChanged = false
        if (Array.isArray(original) && Array.isArray(current)) {
          hasChanged = JSON.stringify(original) !== JSON.stringify(current)
        } else {
          hasChanged = original !== current
        }
        
        if (hasChanged) {
          (changedFields as any)[key] = value
        }
      }
      
      // If no changes, just go back
      if (Object.keys(changedFields).length === 0) {
        toast.info("No changes to save")
        router.push("/settings")
        return
      }
      
      await updateMyProfile(changedFields)
      
      // Apply language and currency changes immediately to the app context
      if (changedFields.preferred_language) {
        setAppLanguage(changedFields.preferred_language as "en" | "am")
      }
      if (changedFields.preferred_currency) {
        setAppCurrency(changedFields.preferred_currency as "USD" | "ETB")
      }
      
      await refreshUser()
      
      // Mark all changed fields as saved
      setSavedFields(new Set(Object.keys(changedFields)))
      setOriginalData({ ...formData })
      setHasChanges(false)
      
      toast.success("Profile updated successfully")
      router.push("/settings")
    } catch (err: any) {
      const errorMessage = friendlyError(err, "Failed to update profile. Please try again.")
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB")
      return
    }

    setIsUploadingPhoto(true)
    try {
      await uploadProfilePhoto(file)
      await refreshUser()
      toast.success("Profile photo updated")
    } catch (err: any) {
      const msg = friendlyError(err, "Failed to upload photo. Please try again.")
      setError(msg)
      toast.error(msg)
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handleDeletePhoto = async () => {
    setIsUploadingPhoto(true)
    try {
      await deleteProfilePhoto()
      await refreshUser()
      toast.success("Profile photo removed")
    } catch (err: any) {
      const msg = friendlyError(err, "Failed to remove photo. Please try again.")
      setError(msg)
      toast.error(msg)
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handleSendPhoneOtp = async () => {
    if (!formData.phone) {
      setError("Please enter a phone number")
      return
    }

    setIsSendingOtp(true)
    try {
      await sendPhoneOTP(formData.phone)
      setShowPhoneVerification(true)
      toast.success("Verification code sent to your phone")
    } catch (err: any) {
      const msg = friendlyError(err, "Failed to send verification code. Please try again.")
      setError(msg)
      toast.error(msg)
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleVerifyPhone = async () => {
    if (!phoneOtp) {
      setError("Please enter the verification code")
      return
    }

    setIsVerifyingPhone(true)
    try {
      await verifyPhoneOTP(formData.phone, phoneOtp)
      await refreshUser()
      setShowPhoneVerification(false)
      setPhoneOtp("")
      toast.success("Phone number verified successfully")
    } catch (err: any) {
      const msg = friendlyError(err, "Failed to verify phone number. Please try again.")
      setError(msg)
      toast.error(msg)
    } finally {
      setIsVerifyingPhone(false)
    }
  }

  const user = userProfile?.user
  const profile = userProfile?.profile

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Profile</h1>
          <p className="text-muted-foreground">Update your personal information</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Profile Photo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile Photo</CardTitle>
          <CardDescription>This will be displayed on your profile</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={getMediaUrl(profile?.profile_photo) || undefined} />
              <AvatarFallback className="text-2xl">
                {user?.first_name?.charAt(0) || <User className="h-10 w-10" />}
              </AvatarFallback>
            </Avatar>
            {isUploadingPhoto && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
            >
              <Camera className="mr-2 h-4 w-4" />
              Change Photo
            </Button>
            {profile?.profile_photo && (
              <Button
                variant="ghost"
                className="text-destructive"
                onClick={handleDeletePhoto}
                disabled={isUploadingPhoto}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove Photo
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleChange("first_name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleChange("last_name", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleChange("date_of_birth", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(v) => handleChange("gender", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((g) => (
                      <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                value={formData.nationality}
                onChange={(e) => handleChange("nationality", e.target.value)}
                placeholder="e.g., Ethiopian, American"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="flex items-center gap-2">
                <Input value={user?.email || ""} disabled className="bg-muted" />
                {user?.is_email_verified && (
                  <Badge variant="outline" className="text-green-600 shrink-0">Verified</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+251911234567"
                />
                {user?.is_phone_verified ? (
                  <Badge variant="outline" className="text-green-600 shrink-0">Verified</Badge>
                ) : formData.phone && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendPhoneOtp}
                    disabled={isSendingOtp}
                    className="shrink-0"
                  >
                    {isSendingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                  </Button>
                )}
              </div>
            </div>

            {showPhoneVerification && (
              <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
                <Label htmlFor="phoneOtp">Enter Verification Code</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="phoneOtp"
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                  />
                  <Button
                    type="button"
                    onClick={handleVerifyPhone}
                    disabled={isVerifyingPhone}
                  >
                    {isVerifyingPhone ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Code expires in 15 minutes</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preferred_language">Language</Label>
                <Select 
                  value={formData.preferred_language} 
                  onValueChange={(v) => handleChange("preferred_language", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferred_currency">Currency</Label>
                <Select 
                  value={formData.preferred_currency} 
                  onValueChange={(v) => handleChange("preferred_currency", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="travel_style">Travel Style</Label>
              <Select 
                value={formData.travel_style} 
                onValueChange={(v) => handleChange("travel_style", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your travel style" />
                </SelectTrigger>
                <SelectContent>
                  {TRAVEL_STYLES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Interests */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Travel Interests</CardTitle>
            <CardDescription>Select your interests to get personalized recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <Badge
                  key={interest}
                  variant={formData.interests.includes(interest) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleArrayItem("interests", interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dietary & Accessibility */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dietary & Accessibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Dietary Restrictions</Label>
              <div className="flex flex-wrap gap-2">
                {DIETARY_RESTRICTIONS.map((diet) => (
                  <Badge
                    key={diet}
                    variant={formData.dietary_restrictions.includes(diet) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem("dietary_restrictions", diet)}
                  >
                    {diet}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessibility_needs">Accessibility Needs</Label>
              <Textarea
                id="accessibility_needs"
                value={formData.accessibility_needs}
                onChange={(e) => handleChange("accessibility_needs", e.target.value)}
                placeholder="Describe any accessibility requirements..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !hasChanges} className="flex-1">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : hasChanges ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                No Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
