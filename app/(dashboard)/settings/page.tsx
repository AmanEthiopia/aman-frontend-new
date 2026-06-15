"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { User, Bell, Globe, Shield, CreditCard, HelpCircle, LogOut, ChevronRight, Sun, Key, Moon, Check, Loader2, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { useApp } from "@/lib/contexts/app-context"
import { updateMyProfile } from "@/lib/api/users"
import { TelegramConnect } from "@/components/settings/telegram-connect"
import { deleteAccount } from "@/lib/api/auth"
import { getMediaUrl } from "@/lib/utils/media"

const settingsGroups = [
  {
    title: "Account",
    items: [
      { icon: User, label: "Personal Information", href: "/settings/profile" },
      { icon: Key, label: "Change Password", href: "/settings/change-password" },
      { icon: Shield, label: "Security & Privacy", href: "/settings/security" },
      { icon: CreditCard, label: "Payment Methods", href: "/settings/payments", disabled: true },
    ],
  },
  {
    title: "Support",
    items: [{ icon: HelpCircle, label: "Help Center", href: "/help" }],
  },
]

export default function SettingsPage() {
  const { userProfile, logout, refreshUser } = useAuth()
  const { theme, setTheme } = useTheme()
  const { language: appLanguage, setLanguage: setAppLanguage, currency: appCurrency, setCurrency: setAppCurrency } = useApp()
  const [mounted, setMounted] = useState(false)
  const [savingNotif, setSavingNotif] = useState(false)

  const profile = userProfile?.profile
  const syncedPrefsRef = useRef(false)

  // Notification state — initialized from profile once loaded
  const [notif, setNotif] = useState({
    notif_email_bookings: true,
    notif_email_marketing: false,
    notif_push_bookings: true,
  })

  // Delete account dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")
  const [deletingAccount, setDeletingAccount] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (profile) {
      setNotif({
        notif_email_bookings: profile.notif_email_bookings ?? true,
        notif_email_marketing: profile.notif_email_marketing ?? false,
        notif_push_bookings: profile.notif_push_bookings ?? true,
      })
    }
  }, [profile])

  // One-time sync: restore saved preferences from DB into AppContext/theme
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (profile && mounted && !syncedPrefsRef.current) {
      syncedPrefsRef.current = true
      const lang = profile.preferred_language
      if (lang === "en" || lang === "am") setAppLanguage(lang as "en" | "am")
      const curr = profile.preferred_currency
      if (curr === "USD" || curr === "ETB") setAppCurrency(curr as "USD" | "ETB")
      const expectedTheme = profile.dark_mode ? "dark" : "light"
      if (theme !== expectedTheme) setTheme(expectedTheme)
    }
  }, [profile, mounted]) // intentionally omit setter deps to prevent re-sync loops

  const handleThemeChange = useCallback(async (isDark: boolean) => {
    const newTheme = isDark ? "dark" : "light"
    setTheme(newTheme)
    // Sync dark_mode to backend silently
    try {
      await updateMyProfile({ dark_mode: isDark })
    } catch {
      // silent — theme still changed locally
    }
  }, [setTheme])

  const handleLanguageChange = useCallback(async (newLang: "en" | "am") => {
    setAppLanguage(newLang)
    toast.success(`Language changed to ${newLang === "en" ? "English" : "Amharic"}`)
    try {
      await updateMyProfile({ preferred_language: newLang })
    } catch {
      // silent
    }
  }, [setAppLanguage])

  const handleCurrencyChange = useCallback(async (newCurrency: "USD" | "ETB") => {
    setAppCurrency(newCurrency)
    toast.success(`Currency changed to ${newCurrency}`)
    try {
      await updateMyProfile({ preferred_currency: newCurrency })
    } catch {
      // silent
    }
  }, [setAppCurrency])

  const handleNotifChange = async (field: keyof typeof notif, checked: boolean) => {
    const updated = { ...notif, [field]: checked }
    setNotif(updated)
    setSavingNotif(true)
    try {
      await updateMyProfile(updated)
    } catch {
      setNotif(notif) // revert on error
      toast.error("Failed to save notification preference")
    } finally {
      setSavingNotif(false)
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

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="flex items-center gap-4 py-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={getMediaUrl(profile?.profile_photo) || undefined} />
            <AvatarFallback className="text-xl font-semibold">{user?.first_name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">
              {user?.first_name} {user?.last_name}
            </h3>
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary">{userProfile?.role.is_provider ? "Provider" : "Traveler"}</Badge>
              {user?.is_email_verified && (
                <Badge variant="outline" className="gap-1 text-green-600 border-green-200">
                  <Check className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>
          </div>
          <Link href="/settings/profile">
            <Button variant="outline" size="sm">Edit Profile</Button>
          </Link>
        </CardContent>
      </Card>

      {/* Quick Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preferences</CardTitle>
          <CardDescription>Changes apply immediately</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dark Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {mounted && theme === "dark" ? (
                <Moon className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Sun className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <Label htmlFor="theme">Dark Mode</Label>
                <p className="text-xs text-muted-foreground">Switch between light and dark themes</p>
              </div>
            </div>
            <Switch
              id="theme"
              checked={mounted && theme === "dark"}
              onCheckedChange={handleThemeChange}
            />
          </div>

          <Separator />

          {/* Language */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label>Language</Label>
                <p className="text-xs text-muted-foreground">Interface language</p>
              </div>
            </div>
            <Select value={appLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="am">Amharic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Currency */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label>Currency</Label>
                <p className="text-xs text-muted-foreground">Display prices in</p>
              </div>
            </div>
            <Select value={appCurrency} onValueChange={handleCurrencyChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="ETB">ETB (Br)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Telegram */}
      <TelegramConnect />

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Notifications</CardTitle>
              <CardDescription>Choose what updates you receive</CardDescription>
            </div>
            {savingNotif && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Booking Updates</Label>
              <p className="text-sm text-muted-foreground">Confirmations, changes & reminders</p>
            </div>
            <Switch
              checked={notif.notif_email_bookings}
              onCheckedChange={(v) => handleNotifChange("notif_email_bookings", v)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Real-time alerts on your device</p>
            </div>
            <Switch
              checked={notif.notif_push_bookings}
              onCheckedChange={(v) => handleNotifChange("notif_push_bookings", v)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">Deals, tips, and travel inspiration</p>
            </div>
            <Switch
              checked={notif.notif_email_marketing}
              onCheckedChange={(v) => handleNotifChange("notif_email_marketing", v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Settings Groups */}
      {settingsGroups.map((group) => (
        <Card key={group.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{group.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {group.items.map((item) => {
              const Icon = item.icon
              const content = (
                <button
                  disabled={item.disabled}
                  className="flex w-full items-center justify-between px-6 py-3 text-left transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span>{item.label}</span>
                    {item.disabled && (
                      <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              )
              return item.disabled ? (
                <div key={item.label}>{content}</div>
              ) : (
                <Link key={item.label} href={item.href}>{content}</Link>
              )
            })}
          </CardContent>
        </Card>
      ))}

      {/* Sign Out */}
      <Button
        variant="outline"
        className="w-full bg-transparent text-destructive hover:bg-destructive hover:text-destructive-foreground"
        onClick={logout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <div>
              <p className="font-medium text-destructive text-sm">Delete Account</p>
              <p className="text-xs text-muted-foreground">
                Permanently delete your account and all your data
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

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={(open) => { setDeleteDialogOpen(open); if (!open) setDeletePassword("") }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. Your account and all associated data will be permanently deleted.
              Enter your password to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="delete-password">Current Password</Label>
            <Input
              id="delete-password"
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
