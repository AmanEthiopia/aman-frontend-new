"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Sparkles,
  Calendar,
  Users,
  MapPin,
  Building2,
  UtensilsCrossed,
  Camera,
  Car,
  Clock,
  DollarSign,
  Heart,
  RefreshCcw,
  Download,
  Share2,
  CheckCircle2,
  Plus,
  Info,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlgalleMark } from "@/components/brand/algalle-logo"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FEATURES } from "@/lib/config/features"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { useAuth } from "@/contexts/auth-context"
import { generateItinerary, type ItineraryRequest } from "@/lib/api/ai"
import { addDayItem, addTripDay, createTrip } from "@/lib/api/itinerary"
import { friendlyError } from "@/lib/utils/errors"
import { toast } from "sonner"

interface GeneratedDay {
  day: number
  date: string
  city: string
  activities: {
    id: string
    time: string
    type: "hotel" | "restaurant" | "experience" | "transport"
    title: string
    description: string
    price?: number
    duration?: string
    selected: boolean
  }[]
}

const interests = [
  { id: "history", label: "History & Culture", icon: Building2 },
  { id: "food", label: "Food & Cuisine", icon: UtensilsCrossed },
  { id: "nature", label: "Nature & Wildlife", icon: Camera },
  { id: "adventure", label: "Adventure", icon: MapPin },
  { id: "relaxation", label: "Relaxation", icon: Heart },
]

const travelStyles = [
  { value: "budget", label: "Budget-Friendly", description: "< $50/day" },
  { value: "comfort", label: "Comfortable", description: "$50-150/day" },
  { value: "luxury", label: "Luxury", description: "> $150/day" },
]

const activityTypeConfig = {
  hotel: { icon: Building2, color: "bg-blue-500/10 text-blue-600" },
  restaurant: { icon: UtensilsCrossed, color: "bg-orange-500/10 text-orange-600" },
  experience: { icon: Camera, color: "bg-purple-500/10 text-purple-600" },
  transport: { icon: Car, color: "bg-green-500/10 text-green-600" },
}

function PlannerForm({ onGenerate }: { onGenerate: (payload: ItineraryRequest) => void }) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["history", "food"])
  const [duration, setDuration] = useState([5])
  const [travelers, setTravelers] = useState("2")
  const [budget, setBudget] = useState("comfort")
  const [destination, setDestination] = useState("")
  const [notes, setNotes] = useState("")

  const submit = () => {
    const interestLabels = selectedInterests.map(
      (id) => interests.find((i) => i.id === id)?.label ?? id,
    )
    onGenerate({
      destination: !destination || destination === "ai-suggest" ? "" : destination.replace(/-/g, " "),
      days: duration[0],
      travelers,
      budget,
      interests: interestLabels,
      notes,
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <AlgalleMark size={40} title={null} />
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <h1 className="text-3xl font-bold">AI Trip Planner</h1>
          <Badge variant="secondary">Beta</Badge>
        </div>
        <p className="mt-2 text-muted-foreground">
          Tell us about your dream Ethiopian adventure and we'll create a personalized itinerary
        </p>
      </div>


      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Where do you want to go?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={destination} onValueChange={setDestination}>
            <SelectTrigger>
              <SelectValue placeholder="Select destinations or let AI suggest" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ai-suggest">Let AI suggest based on interests</SelectItem>
              {[
                { id: "addis-ababa", name: "Addis Ababa" },
                { id: "lalibela", name: "Lalibela" },
                { id: "bahir-dar", name: "Bahir Dar" },
                { id: "gondar", name: "Gondar" },
                { id: "axum", name: "Axum" },
                { id: "harar", name: "Harar" },
              ].map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Trip Duration
          </CardTitle>
          <CardDescription>How many days do you have?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Days</span>
            <span className="text-2xl font-bold">{duration[0]}</span>
          </div>
          <Slider value={duration} onValueChange={setDuration} min={2} max={14} step={1} className="w-full" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>2 days</span>
            <span>1 week</span>
            <span>2 weeks</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Travelers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={travelers} onValueChange={setTravelers}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Solo traveler</SelectItem>
              <SelectItem value="2">Couple (2 travelers)</SelectItem>
              <SelectItem value="3-4">Small group (3-4)</SelectItem>
              <SelectItem value="5+">Large group (5+)</SelectItem>
              <SelectItem value="family">Family with kids</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            What interests you?
          </CardTitle>
          <CardDescription>Select all that apply</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {interests.map((interest) => {
              const Icon = interest.icon
              const isSelected = selectedInterests.includes(interest.id)
              return (
                <button
                  key={interest.id}
                  onClick={() =>
                    setSelectedInterests((prev) =>
                      prev.includes(interest.id) ? prev.filter((i) => i !== interest.id) : [...prev, interest.id],
                    )
                  }
                  className={`flex items-center gap-2 rounded-lg border-2 p-3 text-sm transition-all ${
                    isSelected ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/20"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={isSelected ? "font-medium" : ""}>{interest.label}</span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Budget Style
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {travelStyles.map((style) => (
              <button
                key={style.value}
                onClick={() => setBudget(style.value)}
                className={`rounded-lg border-2 p-4 text-center transition-all ${
                  budget === style.value
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-muted-foreground/20"
                }`}
              >
                <p className={`font-medium ${budget === style.value ? "text-primary" : ""}`}>{style.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{style.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Anything else?</CardTitle>
          <CardDescription>Special requests, dietary restrictions, accessibility needs...</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="E.g., We're vegetarian, prefer morning activities, interested in photography spots..."
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      <Button onClick={submit} size="lg" className="w-full">
        <Sparkles className="mr-2 h-5 w-5" />
        Generate My Itinerary
      </Button>
    </div>
  )
}

function GeneratingState({ progress }: { progress: number }) {
  const steps = [
    "Analyzing your preferences...",
    "Finding the best destinations...",
    "Selecting verified accommodations...",
    "Crafting unique experiences...",
    "Optimizing your schedule...",
    "Finalizing your perfect trip...",
  ]
  const currentStep = Math.min(Math.floor(progress / 18), steps.length - 1)

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-8 relative">
        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
          <AlgalleMark size={56} title={null} className="animate-pulse" />
        </div>
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
      <h2 className="mb-2 text-2xl font-bold">Creating Your Perfect Trip</h2>
      <p className="mb-2 text-muted-foreground">{steps[currentStep]}</p>
      <p className="mb-8 text-xs text-muted-foreground">Matching verified hotels, transport, and experiences to your trip.</p>
      <div className="w-full max-w-md">
        <Progress value={progress} className="h-2" />
        <p className="mt-2 text-sm text-muted-foreground">{progress}% complete</p>
      </div>
    </div>
  )
}

// ── Results helpers ───────────────────────────────────────────────────────────

const PLANNER_STORAGE_KEY = "algaale_planner_result"

function itineraryAsText(itinerary: GeneratedDay[]): string {
  const lines = ["My Ethiopia trip plan (via Algalle AI Planner):", ""]
  itinerary.forEach((day) => {
    lines.push(`Day ${day.day} — ${day.city}`)
    day.activities
      .filter((a) => a.selected)
      .forEach((a) => lines.push(`  ${a.time}  ${a.title}${a.price ? ` ($${a.price})` : ""}`))
    lines.push("")
  })
  lines.push("Plan yours at https://aman.yichalal.ai/planner")
  return lines.join("\n")
}

function exportItineraryToPrint(itinerary: GeneratedDay[]) {
  const dayBlocks = itinerary
    .map((day) => {
      const rows = day.activities
        .filter((a) => a.selected)
        .map(
          (a) => `
            <tr>
              <td style="white-space:nowrap">${a.time}</td>
              <td><strong>${a.title}</strong><br/><span style="color:#6b7280">${a.description || ""}</span></td>
              <td style="white-space:nowrap;text-align:right">${a.price ? `$${a.price}` : ""}</td>
            </tr>`,
        )
        .join("")
      return `
        <h2>Day ${day.day} — ${day.city}</h2>
        <table>${rows || "<tr><td colspan='3' style='color:#9ca3af'>No activities selected</td></tr>"}</table>`
    })
    .join("")

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>My Ethiopia Itinerary</title>
<style>
  body { font-family: -apple-system, "Segoe UI", sans-serif; font-size: 13px; color: #111; padding: 32px; }
  h1 { font-size: 22px; margin-bottom: 4px; } h2 { font-size: 15px; margin: 20px 0 8px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  td { padding: 7px 10px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
  .footer { margin-top: 28px; color: #9ca3af; font-size: 11px; }
  @media print { body { padding: 12px; } }
</style></head><body>
  <h1>My Ethiopia Itinerary</h1>
  <p style="color:#6b7280">${itinerary.length} day${itinerary.length !== 1 ? "s" : ""} · Generated with Algalle AI Planner</p>
  ${dayBlocks}
  <div class="footer">Algalle — Trust-first Ethiopian travel · aman.yichalal.ai</div>
</body></html>`

  const win = window.open("", "_blank", "width=900,height=700")
  if (!win) {
    toast.error("Pop-up blocked — please allow pop-ups and try again")
    return
  }
  win.document.write(html)
  win.document.close()
  win.onload = () => {
    win.focus()
    win.print()
  }
}

const REGENERATE_CHIPS = [
  "More cultural & historical sites",
  "Cheaper / budget options",
  "More food experiences",
  "Different cities",
  "Slower pace, fewer activities",
]

function GeneratedItinerary({
  itinerary,
  onItineraryChange,
  onRegenerate,
  savedTripId,
  onSaved,
}: {
  itinerary: GeneratedDay[]
  onItineraryChange: (next: GeneratedDay[]) => void
  onRegenerate: (feedback: string) => void
  savedTripId: string | null
  onSaved: (tripId: string) => void
}) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  const [saveOpen, setSaveOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 7)
    return d.toISOString().slice(0, 10)
  })

  const [regenOpen, setRegenOpen] = useState(false)
  const [regenChips, setRegenChips] = useState<string[]>([])
  const [regenNotes, setRegenNotes] = useState("")

  const [addOpen, setAddOpen] = useState<number | null>(null) // day number
  const [actTitle, setActTitle] = useState("")
  const [actTime, setActTime] = useState("10:00")
  const [actType, setActType] = useState<GeneratedDay["activities"][number]["type"]>("experience")
  const [actDescription, setActDescription] = useState("")

  const [shareOpen, setShareOpen] = useState(false)

  const toggleActivity = (dayNumber: number, id: string) => {
    onItineraryChange(
      itinerary.map((d) =>
        d.day === dayNumber
          ? { ...d, activities: d.activities.map((a) => (a.id === id ? { ...a, selected: !a.selected } : a)) }
          : d,
      ),
    )
  }

  const selectedCount = itinerary.reduce((n, d) => n + d.activities.filter((a) => a.selected).length, 0)
  const totalPrice = itinerary.reduce(
    (total, day) => total + day.activities.reduce((t, a) => (a.selected && a.price ? t + a.price : t), 0),
    0,
  )

  // ── Save to itinerary ──────────────────────────────────────────────────────
  const handleSaveClick = () => {
    if (savedTripId) {
      router.push(`/itinerary/${savedTripId}`)
      return
    }
    if (!isAuthenticated) {
      // Preserve the result, then send them to sign in — they come back right here.
      try {
        sessionStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify({ itinerary }))
      } catch {}
      toast.info("Sign in to save your itinerary — your plan is kept safe.")
      router.push("/login?redirect=/planner")
      return
    }
    setSaveOpen(true)
  }

  const handleSaveConfirm = async () => {
    setSaving(true)
    try {
      const start = new Date(startDate + "T00:00:00")
      const end = new Date(start)
      end.setDate(end.getDate() + itinerary.length - 1)
      const iso = (d: Date) => d.toISOString().slice(0, 10)

      const trip = await createTrip({
        title: `Ethiopia Adventure — ${start.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`,
        description: "Created with the Algalle AI Planner.",
        start_date: iso(start),
        end_date: iso(end),
      })

      for (const day of itinerary) {
        const dayDate = new Date(start)
        dayDate.setDate(dayDate.getDate() + day.day - 1)
        const created = await addTripDay(trip.id, { date: iso(dayDate), title: `${day.city}` })
        const selected = day.activities.filter((a) => a.selected)
        for (let i = 0; i < selected.length; i++) {
          const a = selected[i]
          await addDayItem(trip.id, created.id, {
            item_type: "custom",
            order: i,
            time_slot: /^\d{2}:\d{2}/.test(a.time) ? a.time.slice(0, 5) : undefined,
            title: a.title,
            description: a.description,
            notes: "From AI Planner",
          })
        }
      }

      onSaved(trip.id)
      setSaveOpen(false)
      toast.success("Itinerary saved! Find it under My Itinerary.")
    } catch (err) {
      toast.error(friendlyError(err, "Couldn't save your itinerary. Please try again."))
    } finally {
      setSaving(false)
    }
  }

  // ── Regenerate with feedback ───────────────────────────────────────────────
  const handleRegenSubmit = () => {
    const feedback = [...regenChips, regenNotes.trim()].filter(Boolean).join("; ")
    setRegenOpen(false)
    setRegenChips([])
    setRegenNotes("")
    onRegenerate(feedback)
  }

  // ── Add activity ───────────────────────────────────────────────────────────
  const handleAddActivity = () => {
    if (addOpen === null) return
    if (!actTitle.trim()) {
      toast.error("Activity title is required")
      return
    }
    onItineraryChange(
      itinerary.map((d) =>
        d.day === addOpen
          ? {
              ...d,
              activities: [
                ...d.activities,
                {
                  id: `manual-${Date.now()}`,
                  time: actTime || "10:00",
                  type: actType,
                  title: actTitle.trim(),
                  description: actDescription.trim(),
                  selected: true,
                },
              ].sort((a, b) => a.time.localeCompare(b.time)),
            }
          : d,
      ),
    )
    setAddOpen(null)
    setActTitle("")
    setActDescription("")
    setActTime("10:00")
    toast.success("Activity added to your plan")
  }

  // ── Share ──────────────────────────────────────────────────────────────────
  const shareText = () => itineraryAsText(itinerary)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText())
      toast.success("Itinerary copied!")
    } catch {
      toast.error("Couldn't copy — try Export instead")
    }
    setShareOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Your Ethiopian Adventure</h1>
            <Badge variant="secondary">AI-generated</Badge>
          </div>
          <p className="text-muted-foreground">
            {itinerary.length} {itinerary.length === 1 ? "day" : "days"} · {new Set(itinerary.map((d) => d.city)).size} cities · Customized for you
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setRegenOpen(true)}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Regenerate
          </Button>
          <Popover open={shareOpen} onOpenChange={setShareOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-1" align="end">
              <button
                onClick={handleCopy}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                Copy itinerary
              </button>
              <button
                onClick={() => {
                  window.open(`https://wa.me/?text=${encodeURIComponent(shareText())}`, "_blank", "noopener,noreferrer")
                  setShareOpen(false)
                }}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                <Share2 className="h-4 w-4 text-[#25D366]" />
                WhatsApp
              </button>
              <button
                onClick={() => {
                  window.open(
                    `https://t.me/share/url?url=${encodeURIComponent("https://aman.yichalal.ai/planner")}&text=${encodeURIComponent(shareText())}`,
                    "_blank",
                    "noopener,noreferrer",
                  )
                  setShareOpen(false)
                }}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                <Share2 className="h-4 w-4 text-[#2AABEE]" />
                Telegram
              </button>
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" onClick={() => exportItineraryToPrint(itinerary)}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="flex items-center justify-between py-4 flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{itinerary.length}</p>
              <p className="text-sm text-muted-foreground">Days</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{selectedCount}</p>
              <p className="text-sm text-muted-foreground">Activities</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">${totalPrice}</p>
              <p className="text-sm text-muted-foreground">Est. Total</p>
            </div>
          </div>
          <Button size="lg" onClick={handleSaveClick} variant={savedTripId ? "outline" : "default"}>
            <CheckCircle2 className="mr-2 h-5 w-5" />
            {savedTripId ? "View in My Itinerary" : "Save to My Itinerary"}
          </Button>
        </CardContent>
      </Card>

      {/* Daily Breakdown */}
      <div className="space-y-6">
        {itinerary.map((day) => (
          <Card key={day.day}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {day.day}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{day.date}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {day.city}
                    </CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setAddOpen(day.day)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Activity
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {day.activities.map((activity) => {
                const config = activityTypeConfig[activity.type] ?? activityTypeConfig.experience
                const Icon = config.icon

                return (
                  <div
                    key={activity.id}
                    className={`flex items-start gap-4 rounded-lg border p-4 transition-all ${
                      activity.selected ? "border-primary/50 bg-primary/5" : "opacity-60"
                    }`}
                  >
                    <Checkbox checked={activity.selected} onCheckedChange={() => toggleActivity(day.day, activity.id)} />
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {activity.time}
                    </div>
                    <div className={`rounded-lg p-2 ${config.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{activity.title}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">{activity.description}</p>
                      <div className="mt-2 flex items-center gap-3 text-sm">
                        {activity.duration && (
                          <Badge variant="outline" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {activity.duration}
                          </Badge>
                        )}
                        {activity.price ? (
                          <Badge variant="secondary" className="gap-1">
                            <DollarSign className="h-3 w-3" />${activity.price}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom CTA */}
      <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
        <CardContent className="flex items-center justify-between py-4 flex-wrap gap-3">
          <div>
            <h3 className="font-semibold text-green-800 dark:text-green-200">Ready to book?</h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Save this itinerary, then book hotels, guides, and experiences from your plan
            </p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700" onClick={handleSaveClick}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {savedTripId ? "View in My Itinerary" : "Save & Continue"}
          </Button>
        </CardContent>
      </Card>

      {/* Save dialog */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save to My Itinerary</DialogTitle>
            <DialogDescription>
              When does your {itinerary.length}-day trip start? We&apos;ll map each day to a real date.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="start-date">Trip start date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {selectedCount} selected {selectedCount === 1 ? "activity" : "activities"} will be saved.
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSaveOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSaveConfirm} disabled={saving || !startDate}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Save Itinerary
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Regenerate dialog */}
      <Dialog open={regenOpen} onOpenChange={setRegenOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Regenerate Itinerary</DialogTitle>
            <DialogDescription>What should change? Tell us what you didn&apos;t like and we&apos;ll do better.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex flex-wrap gap-1.5">
              {REGENERATE_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() =>
                    setRegenChips((prev) => (prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]))
                  }
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    regenChips.includes(chip)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Anything else? E.g. 'Day 2 was too packed', 'I want to see Lalibela'…"
              value={regenNotes}
              onChange={(e) => setRegenNotes(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRegenOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRegenSubmit}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Regenerate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add activity dialog */}
      <Dialog open={addOpen !== null} onOpenChange={(open) => !open && setAddOpen(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Activity — Day {addOpen}</DialogTitle>
            <DialogDescription>Add your own activity alongside the AI suggestions.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                placeholder="E.g. Coffee ceremony at Tomoca"
                value={actTitle}
                onChange={(e) => setActTitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Time</Label>
                <Input type="time" value={actTime} onChange={(e) => setActTime(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={actType} onValueChange={(v) => setActType(v as typeof actType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="experience">Experience</SelectItem>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="Notes about this activity…"
                value={actDescription}
                onChange={(e) => setActDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddOpen(null)}>
              Cancel
            </Button>
            <Button onClick={handleAddActivity}>
              <Plus className="mr-2 h-4 w-4" />
              Add Activity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function PlannerPage() {
  const [stage, setStage] = useState<"form" | "generating" | "results">("form")
  const [progress, setProgress] = useState(0)
  const [generatedItinerary, setGeneratedItinerary] = useState<GeneratedDay[]>([])
  const [lastPayload, setLastPayload] = useState<ItineraryRequest | null>(null)
  const [savedTripId, setSavedTripId] = useState<string | null>(null)

  // Restore a preserved result (e.g. after the sign-in round trip from Save).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PLANNER_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed?.itinerary) && parsed.itinerary.length > 0) {
          setGeneratedItinerary(parsed.itinerary)
          if (parsed.payload) setLastPayload(parsed.payload)
          if (parsed.savedTripId) setSavedTripId(parsed.savedTripId)
          setStage("results")
        }
      }
    } catch {}
  }, [])

  // Keep the current result preserved across sign-in redirects and refreshes.
  const persist = (itin: GeneratedDay[], payload: ItineraryRequest | null, tripId: string | null) => {
    try {
      sessionStorage.setItem(
        PLANNER_STORAGE_KEY,
        JSON.stringify({ itinerary: itin, payload, savedTripId: tripId }),
      )
    } catch {}
  }

  const handleGenerate = async (payload: ItineraryRequest) => {
    setStage("generating")
    setProgress(0)
    setSavedTripId(null)

    // Animate progress up to ~92% while the real request runs.
    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 12 + 3, 92))
    }, 500)

    try {
      const result = await generateItinerary(payload)
      const itin = (result.itinerary ?? []) as GeneratedDay[]
      setGeneratedItinerary(itin)
      setLastPayload(payload)
      persist(itin, payload, null)
      setProgress(100)
      setStage("results")
    } catch (err) {
      toast.error(friendlyError(err, "Couldn't generate your itinerary. Please try again."))
      setStage(generatedItinerary.length > 0 ? "results" : "form")
    } finally {
      clearInterval(interval)
    }
  }

  const handleRegenerate = (feedback: string) => {
    if (!lastPayload) {
      setStage("form")
      return
    }
    const summary = generatedItinerary.map((d) => `Day ${d.day}: ${d.city}`).join("; ")
    const revisedNotes = [
      lastPayload.notes,
      feedback ? `REVISION REQUEST — the traveler asked for these changes: ${feedback}.` : "",
      `Previous plan summary: ${summary}. Produce a noticeably different plan honoring the request.`,
    ]
      .filter(Boolean)
      .join("\n")
    handleGenerate({ ...lastPayload, notes: revisedNotes })
  }

  const handleItineraryChange = (next: GeneratedDay[]) => {
    setGeneratedItinerary(next)
    persist(next, lastPayload, savedTripId)
  }

  const handleSaved = (tripId: string) => {
    setSavedTripId(tripId)
    persist(generatedItinerary, lastPayload, tripId)
  }

  if (!FEATURES.AI_PLANNER) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <Sparkles className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h2 className="text-xl font-semibold">AI Trip Planner</h2>
              <p className="mt-2 text-muted-foreground">
                The AI trip planner is not available yet. Check back soon!
              </p>
              <Button asChild className="mt-4">
                <Link href="/">Go Home</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {stage !== "form" && (
            <Button variant="ghost" className="mb-6" onClick={() => setStage("form")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Planner
            </Button>
          )}

          {stage === "form" && <PlannerForm onGenerate={handleGenerate} />}
          {stage === "generating" && <GeneratingState progress={Math.min(progress, 100)} />}
          {stage === "results" && (
            <GeneratedItinerary
              itinerary={generatedItinerary}
              onItineraryChange={handleItineraryChange}
              onRegenerate={handleRegenerate}
              savedTripId={savedTripId}
              onSaved={handleSaved}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
