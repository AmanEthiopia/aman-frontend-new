"use client"

import { useState, useEffect, useRef } from "react"
import {
  User, Building2, Bell, CreditCard, Shield,
  Camera, Save, Loader2, Mail, Phone, Globe, MapPin,
  AlertTriangle, CheckCircle2, Eye, EyeOff, Lock,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { getMediaUrl } from "@/lib/utils/media"
import {
  updateMyProfile,
  uploadProfilePhoto,
  deleteProfilePhoto,
  getProviderProfile,
  updateProviderProfile,
  getProviderPayout,
  updateProviderPayout,
  BUSINESS_TYPE_LABELS,
  COMPLETION_FIELD_LABELS,
  type ProviderProfile,
  type PayoutSettings,
  type ProfileCompletion,
} from "@/lib/api/users"
import { changePassword, deleteAccount } from "@/lib/api/auth"
import { TelegramConnect } from "@/components/settings/telegram-connect"

// ─── Profile completion banner ────────────────────────────────────────────────

function CompletionBanner({ completion }: { completion: ProfileCompletion | null }) {
  if (!completion || completion.is_complete) return null

  const missingLabels = completion.missing
    .map((f) => COMPLETION_FIELD_LABELS[f] || f)
    .join(", ")

  return (
    <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800 dark:text-amber-300">
        <span className="font-medium">Your profile is {completion.percentage}% complete.</span>{" "}
        Complete it to publish listings.
        <div className="mt-2">
          <Progress value={completion.percentage} className="h-1.5 bg-amber-200" />
        </div>
        {completion.missing.length > 0 && (
          <p className="mt-1.5 text-sm">
            <span className="font-medium">Missing:</span> {missingLabels}
          </p>
        )}
      </AlertDescription>
    </Alert>
  )
}

// ─── Provider Settings Page ───────────────────────────────────────────────────

export default function ProviderSettingsPage() {
  const { userProfile, refreshUser, logout } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [activeTab, setActiveTab] = useState("profile")
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  // Completion state (from profile response)
  const [completion, setCompletion] = useState<ProfileCompletion | null>(
    userProfile?.profile_completion ?? null
  )

  // ── Profile tab ──────────────────────────────────────────────────────────
  const [profileForm, setProfileForm] = useState({
    first_name: userProfile?.user?.first_name || "",
    last_name: userProfile?.user?.last_name || "",
    phone: userProfile?.user?.phone || "",
    bio: userProfile?.profile?.bio || "",
  })
  const [savingProfile, setSavingProfile] = useState(false)

  // ── Business tab ─────────────────────────────────────────────────────────
  const [businessForm, setBusinessForm] = useState<ProviderProfile>({
    business_name: "",
    business_type: "hotel",
    registration_number: "",
    tax_id: "",
    business_address: "",
    website: "",
    support_email: "",
  })
  const [businessLoaded, setBusinessLoaded] = useState(false)
  const [savingBusiness, setSavingBusiness] = useState(false)

  // ── Notifications tab ────────────────────────────────────────────────────
  const [notif, setNotif] = useState({
    notif_email_bookings: userProfile?.profile?.notif_email_bookings ?? true,
    notif_email_messages: userProfile?.profile?.notif_email_messages ?? true,
    notif_email_reviews: userProfile?.profile?.notif_email_reviews ?? true,
    notif_email_payments: userProfile?.profile?.notif_email_payments ?? true,
    notif_email_marketing: userProfile?.profile?.notif_email_marketing ?? false,
    notif_push_bookings: userProfile?.profile?.notif_push_bookings ?? true,
    notif_push_messages: userProfile?.profile?.notif_push_messages ?? true,
  })
  const [savingNotif, setSavingNotif] = useState(false)

  // ── Payment tab ──────────────────────────────────────────────────────────
  const [payoutForm, setPayoutForm] = useState<PayoutSettings>({
    bank_name: "",
    account_number: "",
    account_holder_name: "",
    payout_schedule: "weekly",
  })
  const [payoutLoaded, setPayoutLoaded] = useState(false)
  const [savingPayout, setSavingPayout] = useState(false)

  // ── Security tab ─────────────────────────────────────────────────────────
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  })
  const [showPasswords, setShowPasswords] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // ── Delete account ───────────────────────────────────────────────────────
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")
  const [deletingAccount, setDeletingAccount] = useState(false)

  // ── Sync profile form when userProfile loads ─────────────────────────────
  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        first_name: userProfile.user?.first_name || "",
        last_name: userProfile.user?.last_name || "",
        phone: userProfile.user?.phone || "",
        bio: userProfile.profile?.bio || "",
      })
      setNotif({
        notif_email_bookings: userProfile.profile?.notif_email_bookings ?? true,
        notif_email_messages: userProfile.profile?.notif_email_messages ?? true,
        notif_email_reviews: userProfile.profile?.notif_email_reviews ?? true,
        notif_email_payments: userProfile.profile?.notif_email_payments ?? true,
        notif_email_marketing: userProfile.profile?.notif_email_marketing ?? false,
        notif_push_bookings: userProfile.profile?.notif_push_bookings ?? true,
        notif_push_messages: userProfile.profile?.notif_push_messages ?? true,
      })
      setCompletion(userProfile.profile_completion ?? null)
    }
  }, [userProfile])

  // ── Lazy-load business & payout when tabs are activated ──────────────────
  useEffect(() => {
    if (activeTab === "business" && !businessLoaded) {
      getProviderProfile()
        .then((data) => {
          setBusinessForm(data)
          setBusinessLoaded(true)
        })
        .catch(() => {
          setBusinessLoaded(true) // still mark so we don't infinite retry
        })
    }
    if (activeTab === "payment" && !payoutLoaded) {
      getProviderPayout()
        .then((data) => {
          setPayoutForm(data)
          setPayoutLoaded(true)
        })
        .catch(() => {
          setPayoutLoaded(true)
        })
    }
  }, [activeTab, businessLoaded, payoutLoaded])

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be under 5 MB")
      return
    }
    setUploadingPhoto(true)
    try {
      await uploadProfilePhoto(file)
      await refreshUser()
      toast.success("Profile photo updated")
    } catch (err: any) {
      toast.error(err.message || "Failed to upload photo")
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleDeletePhoto = async () => {
    setUploadingPhoto(true)
    try {
      await deleteProfilePhoto()
      await refreshUser()
      toast.success("Profile photo removed")
    } catch (err: any) {
      toast.error(err.message || "Failed to remove photo")
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      await updateMyProfile({
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        phone: profileForm.phone || undefined,
        bio: profileForm.bio || undefined,
      })
      await refreshUser()
      toast.success("Profile updated successfully")
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile")
    } finally {
      setSavingProfile(false)
    }
  }

  const handleSaveBusiness = async () => {
    setSavingBusiness(true)
    try {
      await updateProviderProfile(businessForm)
      await refreshUser()
      toast.success("Business information saved")
    } catch (err: any) {
      toast.error(err.message || "Failed to update business info")
    } finally {
      setSavingBusiness(false)
    }
  }

  const handleSaveNotifications = async () => {
    setSavingNotif(true)
    try {
      await updateMyProfile(notif)
      toast.success("Notification preferences saved")
    } catch (err: any) {
      toast.error(err.message || "Failed to save preferences")
    } finally {
      setSavingNotif(false)
    }
  }

  const handleSavePayout = async () => {
    setSavingPayout(true)
    try {
      await updateProviderPayout(payoutForm)
      await refreshUser()
      toast.success("Payout settings saved")
    } catch (err: any) {
      toast.error(err.message || "Failed to update payout settings")
    } finally {
      setSavingPayout(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError("New passwords do not match")
      return
    }
    if (passwordForm.new_password.length < 8) {
      setPasswordError("Password must be at least 8 characters")
      return
    }
    setSavingPassword(true)
    try {
      await changePassword(passwordForm.old_password, passwordForm.new_password, passwordForm.confirm_password)
      setPasswordForm({ old_password: "", new_password: "", confirm_password: "" })
      toast.success("Password changed successfully")
    } catch (err: any) {
      setPasswordError(err.message || "Failed to change password")
    } finally {
      setSavingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) return
    setDeletingAccount(true)
    try {
      await deleteAccount(deletePassword)
      toast.success("Account deleted successfully")
      logout()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete account")
    } finally {
      setDeletingAccount(false)
    }
  }

  const user = userProfile?.user
  const profile = userProfile?.profile

  // ─── Save Button ──────────────────────────────────────────────────────────
  const SaveButton = ({ onClick, loading }: { onClick: () => void; loading: boolean }) => (
    <div className="flex justify-end pt-2">
      <Button onClick={onClick} disabled={loading} className="min-w-[130px]">
        {loading ? (
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
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Provider Settings</h1>
        <p className="text-muted-foreground">Manage your account, business, and payout settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="gap-1.5">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="business" className="gap-1.5">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Business</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="gap-1.5">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Payment</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Profile ────────────────────────────────────────────── */}
        <TabsContent value="profile" className="space-y-6">
          <CompletionBanner completion={completion} />

          {/* Photo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile Photo</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={getMediaUrl(profile?.profile_photo) || undefined} />
                  <AvatarFallback className="text-xl">
                    {profileForm.first_name?.[0]}{profileForm.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                {uploadingPhoto && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/80">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto}>
                  <Camera className="mr-2 h-4 w-4" />
                  Change Photo
                </Button>
                {profile?.profile_photo && (
                  <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={handleDeletePhoto} disabled={uploadingPhoto}>
                    Remove Photo
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">Max 5 MB · JPG, PNG</p>
              </div>
              <div className="ml-auto text-right">
                <Badge variant="secondary">Provider</Badge>
                {user?.is_email_verified && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Email verified
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Fields */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    value={profileForm.first_name}
                    onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={profileForm.last_name}
                    onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={user?.email || ""} disabled className="bg-muted pl-9" />
                </div>
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="+251708029422"
                    className="pl-9"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Tell guests about your business..."
                  rows={3}
                />
              </div>

              <SaveButton onClick={handleSaveProfile} loading={savingProfile} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 2: Business ───────────────────────────────────────────── */}
        <TabsContent value="business" className="space-y-6">
          <CompletionBanner completion={completion} />

          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Manage your business details and legal documentation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!businessLoaded ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Business Name</Label>
                      <Input
                        value={businessForm.business_name}
                        onChange={(e) => setBusinessForm({ ...businessForm, business_name: e.target.value })}
                        placeholder="Grand Palace Hospitality"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Business Type</Label>
                      <Select
                        value={businessForm.business_type}
                        onValueChange={(v) => setBusinessForm({ ...businessForm, business_type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(BUSINESS_TYPE_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Registration Number</Label>
                      <Input
                        value={businessForm.registration_number || ""}
                        onChange={(e) => setBusinessForm({ ...businessForm, registration_number: e.target.value })}
                        placeholder="ETH-2024-12345"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tax ID (TIN)</Label>
                      <Input
                        value={businessForm.tax_id || ""}
                        onChange={(e) => setBusinessForm({ ...businessForm, tax_id: e.target.value })}
                        placeholder="TIN-123456789"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Business Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        value={businessForm.business_address || ""}
                        onChange={(e) => setBusinessForm({ ...businessForm, business_address: e.target.value })}
                        placeholder="Bole Road, Addis Ababa"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          className="pl-9"
                          type="url"
                          value={businessForm.website || ""}
                          onChange={(e) => setBusinessForm({ ...businessForm, website: e.target.value })}
                          placeholder="https://yourwebsite.et"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Support Email</Label>
                      <Input
                        type="email"
                        value={businessForm.support_email || ""}
                        onChange={(e) => setBusinessForm({ ...businessForm, support_email: e.target.value })}
                        placeholder="support@yourwebsite.et"
                      />
                    </div>
                  </div>

                  <SaveButton onClick={handleSaveBusiness} loading={savingBusiness} />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 3: Notifications ──────────────────────────────────────── */}
        <TabsContent value="notifications" className="space-y-6">
          <CompletionBanner completion={completion} />

          {/* Telegram */}
          <TelegramConnect />

          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Email Notifications</CardTitle>
              <CardDescription>Choose what you want to be notified about via email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "notif_email_bookings" as const, label: "Booking Updates", desc: "New bookings, cancellations, modifications" },
                { key: "notif_email_messages" as const, label: "Messages", desc: "New messages from guests" },
                { key: "notif_email_reviews" as const, label: "Reviews", desc: "New reviews and responses" },
                { key: "notif_email_payments" as const, label: "Payments", desc: "Payouts and payment notifications" },
                { key: "notif_email_marketing" as const, label: "Marketing", desc: "Tips, features, and promotions" },
              ].map((item, idx, arr) => (
                <div key={item.key}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={notif[item.key]}
                      onCheckedChange={(v) => setNotif({ ...notif, [item.key]: v })}
                    />
                  </div>
                  {idx < arr.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Push Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Push Notifications</CardTitle>
              <CardDescription>Real-time alerts on your device</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "notif_push_bookings" as const, label: "Booking Alerts", desc: "Instant alerts for new bookings" },
                { key: "notif_push_messages" as const, label: "Message Alerts", desc: "Instant alerts for new messages" },
              ].map((item, idx, arr) => (
                <div key={item.key}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={notif[item.key]}
                      onCheckedChange={(v) => setNotif({ ...notif, [item.key]: v })}
                    />
                  </div>
                  {idx < arr.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveNotifications} disabled={savingNotif} className="min-w-[160px]">
              {savingNotif ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" />Save Preferences</>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* ── Tab 4: Payment ────────────────────────────────────────────── */}
        <TabsContent value="payment" className="space-y-6">
          <CompletionBanner completion={completion} />

          <Card>
            <CardHeader>
              <CardTitle>Payout Settings</CardTitle>
              <CardDescription>Configure your bank account to receive earnings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!payoutLoaded ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Bank Name</Label>
                      <Input
                        value={payoutForm.bank_name || ""}
                        onChange={(e) => setPayoutForm({ ...payoutForm, bank_name: e.target.value })}
                        placeholder="Commercial Bank of Ethiopia"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Number</Label>
                      <Input
                        value={payoutForm.account_number || ""}
                        onChange={(e) => setPayoutForm({ ...payoutForm, account_number: e.target.value })}
                        placeholder="1000123456789"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Account Holder Name</Label>
                      <Input
                        value={payoutForm.account_holder_name || ""}
                        onChange={(e) => setPayoutForm({ ...payoutForm, account_holder_name: e.target.value })}
                        placeholder="Grand Palace Hotel"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Payout Schedule</Label>
                      <Select
                        value={payoutForm.payout_schedule}
                        onValueChange={(v: "weekly" | "biweekly" | "monthly") =>
                          setPayoutForm({ ...payoutForm, payout_schedule: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                    Payouts are processed according to your schedule after booking completion.
                  </div>

                  <SaveButton onClick={handleSavePayout} loading={savingPayout} />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 5: Security ───────────────────────────────────────────── */}
        <TabsContent value="security" className="space-y-6">
          <CompletionBanner completion={completion} />

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>Choose a strong password with at least 8 characters</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                {passwordError && (
                  <Alert variant="destructive">
                    <AlertDescription>{passwordError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <div className="relative">
                    <Input
                      type={showPasswords ? "text" : "password"}
                      value={passwordForm.old_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input
                      type={showPasswords ? "text" : "password"}
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input
                      type={showPasswords ? "text" : "password"}
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={savingPassword} className="min-w-[160px]">
                    {savingPassword ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* 2FA */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Enable 2FA</p>
                <p className="text-xs text-muted-foreground">
                  Protect your account with an authenticator app
                </p>
              </div>
              <Button variant="outline" onClick={() => toast.info("Two-factor authentication coming soon")}>
                Enable
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible and destructive actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                <div>
                  <p className="font-medium text-destructive text-sm">Delete Account</p>
                  <p className="text-xs text-muted-foreground">
                    Permanently delete your account and all listings
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={(open) => { setDeleteDialogOpen(open); if (!open) setDeletePassword("") }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. Your account, all listings, and associated data will be permanently deleted.
              Enter your password to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="provider-delete-password">Current Password</Label>
            <Input
              id="provider-delete-password"
              type="password"
              placeholder="Enter your password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && deletePassword) handleDeleteAccount() }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setDeleteDialogOpen(false); setDeletePassword("") }}
              disabled={deletingAccount}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deletingAccount || !deletePassword}
            >
              {deletingAccount ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</>
              ) : (
                "Delete My Account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
