"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { User, Bell, Globe, Shield, CreditCard, HelpCircle, LogOut, ChevronRight, Sun, Key, Moon, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { useApp } from "@/lib/contexts/app-context"

const API_BASE = "https://api.aman.yichalal.ai"

function getMediaUrl(path: string | null | undefined): string {
  if (!path) return ""
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  if (path.startsWith("/media/")) return `${API_BASE}${path}`
  if (!path.startsWith("/")) return `${API_BASE}/media/${path}`
  return `${API_BASE}${path}`
}

// Persist preferences to localStorage
function savePreferences(key: string, value: any) {
  if (typeof window !== "undefined") {
    localStorage.setItem(`aman_pref_${key}`, JSON.stringify(value))
  }
}

function loadPreference<T>(key: string, defaultValue: T): T {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(`aman_pref_${key}`)
    if (stored) {
      try {
        return JSON.parse(stored) as T
      } catch {
        return defaultValue
      }
    }
  }
  return defaultValue
}

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
    title: "Preferences",
    items: [
      { icon: Bell, label: "Notifications", href: "/settings/notifications" },
      { icon: Globe, label: "Language & Region", href: "/settings/region" },
    ],
  },
  {
    title: "Support",
    items: [{ icon: HelpCircle, label: "Help Center", href: "/help" }],
  },
]

export default function SettingsPage() {
  const { userProfile, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const { language: appLanguage, setLanguage: setAppLanguage, currency: appCurrency, setCurrency: setAppCurrency } = useApp()
  const [mounted, setMounted] = useState(false)
  
  // Initialize from localStorage or defaults
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    // Load saved preferences
    setEmailNotifications(loadPreference("email_notifications", true))
    setPushNotifications(loadPreference("push_notifications", true))
    setMarketingEmails(loadPreference("marketing_emails", false))
  }, [])
  
  // Handle dark mode toggle with immediate effect
  const handleThemeChange = useCallback((isDark: boolean) => {
    const newTheme = isDark ? "dark" : "light"
    setTheme(newTheme)
    toast.success(`Switched to ${newTheme} mode`)
  }, [setTheme])
  
  // Handle language change with immediate effect
  const handleLanguageChange = useCallback((newLang: "en" | "am") => {
    setAppLanguage(newLang)
    savePreferences("language", newLang)
    toast.success(`Language changed to ${newLang === "en" ? "English" : "Amharic"}`)
  }, [setAppLanguage])
  
  // Handle currency change with immediate effect
  const handleCurrencyChange = useCallback((newCurrency: "USD" | "ETB") => {
    setAppCurrency(newCurrency)
    savePreferences("currency", newCurrency)
    toast.success(`Currency changed to ${newCurrency}`)
  }, [setAppCurrency])
  
  // Handle notification preference changes with immediate effect
  const handleEmailNotificationsChange = useCallback((checked: boolean) => {
    setEmailNotifications(checked)
    savePreferences("email_notifications", checked)
    toast.success(checked ? "Email notifications enabled" : "Email notifications disabled")
  }, [])
  
  const handlePushNotificationsChange = useCallback((checked: boolean) => {
    setPushNotifications(checked)
    savePreferences("push_notifications", checked)
    toast.success(checked ? "Push notifications enabled" : "Push notifications disabled")
  }, [])
  
  const handleMarketingEmailsChange = useCallback((checked: boolean) => {
    setMarketingEmails(checked)
    savePreferences("marketing_emails", checked)
    toast.success(checked ? "Marketing emails enabled" : "Marketing emails disabled")
  }, [])

  const user = userProfile?.user
  const profile = userProfile?.profile

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
            <AvatarFallback>{user?.first_name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold">
              {user?.first_name} {user?.last_name}
            </h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="secondary">{userProfile?.role.is_provider ? "Provider" : "Traveler"}</Badge>
              {user?.is_email_verified && (
                <Badge variant="outline" className="text-green-600">
                  Verified
                </Badge>
              )}
            </div>
          </div>
          <Link href="/settings/profile">
            <Button variant="outline">Edit Profile</Button>
          </Link>
        </CardContent>
      </Card>

      {/* Quick Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Settings</CardTitle>
          <CardDescription>Changes apply immediately</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription>Choose what updates you receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Booking confirmations & updates</p>
            </div>
            <Switch checked={emailNotifications} onCheckedChange={handleEmailNotificationsChange} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Real-time alerts on your device</p>
            </div>
            <Switch checked={pushNotifications} onCheckedChange={handlePushNotificationsChange} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">Deals, tips, and travel inspiration</p>
            </div>
            <Switch checked={marketingEmails} onCheckedChange={handleMarketingEmailsChange} />
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
              return (
                <Link key={item.label} href={item.href}>
                  <button
                    disabled={item.disabled}
                    className="flex w-full items-center justify-between px-6 py-3 text-left transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <span>{item.label}</span>
                      {item.disabled && (
                        <Badge variant="secondary" className="text-xs">
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                </Link>
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
    </div>
  )
}
