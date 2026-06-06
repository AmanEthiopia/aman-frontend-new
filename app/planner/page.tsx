"use client"

import { useState } from "react"
import Link from "next/link"
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
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FEATURES } from "@/lib/config/features"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"

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

const mockGeneratedItinerary: GeneratedDay[] = []

const activityTypeConfig = {
  hotel: { icon: Building2, color: "bg-blue-500/10 text-blue-600" },
  restaurant: { icon: UtensilsCrossed, color: "bg-orange-500/10 text-orange-600" },
  experience: { icon: Camera, color: "bg-purple-500/10 text-purple-600" },
  transport: { icon: Car, color: "bg-green-500/10 text-green-600" },
}

function PlannerForm({ onGenerate }: { onGenerate: () => void }) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["history", "food"])
  const [duration, setDuration] = useState([5])
  const [travelers, setTravelers] = useState("2")
  const [budget, setBudget] = useState("comfort")
  const [destination, setDestination] = useState("")
  const [notes, setNotes] = useState("")

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <h1 className="text-3xl font-bold">AI Trip Planner</h1>
          <Badge variant="secondary">Preview</Badge>
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

      <Button onClick={onGenerate} size="lg" className="w-full">
        <Sparkles className="mr-2 h-5 w-5" />
        Generate My Itinerary (Demo)
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
          <Sparkles className="h-12 w-12 text-primary animate-pulse" />
        </div>
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
      <h2 className="mb-2 text-2xl font-bold">Creating Your Perfect Trip</h2>
      <p className="mb-2 text-muted-foreground">{steps[currentStep]}</p>
      <p className="mb-8 text-xs text-muted-foreground">(Simulated for demo)</p>
      <div className="w-full max-w-md">
        <Progress value={progress} className="h-2" />
        <p className="mt-2 text-sm text-muted-foreground">{progress}% complete</p>
      </div>
    </div>
  )
}

function GeneratedItinerary({
  itinerary,
  onRegenerate,
}: {
  itinerary: GeneratedDay[]
  onRegenerate: () => void
}) {
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(() => {
    const selected = new Set<string>()
    itinerary.forEach((day) => {
      day.activities.forEach((activity) => {
        if (activity.selected) selected.add(activity.id)
      })
    })
    return selected
  })

  const toggleActivity = (id: string) => {
    setSelectedActivities((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const totalPrice = itinerary.reduce((total, day) => {
    return (
      total +
      day.activities.reduce((dayTotal, activity) => {
        if (selectedActivities.has(activity.id) && activity.price) {
          return dayTotal + activity.price
        }
        return dayTotal
      }, 0)
    )
  }, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Your Ethiopian Adventure</h1>
            <Badge variant="secondary">Demo</Badge>
          </div>
          <p className="text-muted-foreground">3 days - 2 cities - Customized for you</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRegenerate}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Regenerate
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{itinerary.length}</p>
              <p className="text-sm text-muted-foreground">Days</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{selectedActivities.size}</p>
              <p className="text-sm text-muted-foreground">Activities</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">${totalPrice}</p>
              <p className="text-sm text-muted-foreground">Est. Total</p>
            </div>
          </div>
          <Button size="lg">
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Save to My Itinerary
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
                <Button variant="ghost" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Activity
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {day.activities.map((activity) => {
                const config = activityTypeConfig[activity.type]
                const Icon = config.icon
                const isSelected = selectedActivities.has(activity.id)

                return (
                  <div
                    key={activity.id}
                    className={`flex items-start gap-4 rounded-lg border p-4 transition-all ${
                      isSelected ? "border-primary/50 bg-primary/5" : "opacity-60"
                    }`}
                  >
                    <Checkbox checked={isSelected} onCheckedChange={() => toggleActivity(activity.id)} />
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
                        {activity.price && (
                          <Badge variant="secondary" className="gap-1">
                            <DollarSign className="h-3 w-3" />${activity.price}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {activity.type === "hotel" && (
                      <Link href={`/hotels/addis-1`}>
                        <Button variant="outline" size="sm">
                          View Hotel
                        </Button>
                      </Link>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom CTA */}
      <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
        <CardContent className="flex items-center justify-between py-4">
          <div>
            <h3 className="font-semibold text-green-800 dark:text-green-200">Ready to book?</h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Save this itinerary and start booking individual items (demo only)
            </p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Save & Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PlannerPage() {
  const [stage, setStage] = useState<"form" | "generating" | "results">("form")
  const [progress, setProgress] = useState(0)
  const [generatedItinerary, setGeneratedItinerary] = useState<GeneratedDay[]>([])

  const handleGenerate = () => {
    setStage("generating")
    setProgress(0)

    // Simulate AI generation with progress updates
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setGeneratedItinerary(mockGeneratedItinerary)
          setStage("results")
          return 100
        }
        return prev + Math.random() * 15 + 5
      })
    }, 500)
  }

  const handleRegenerate = () => {
    setStage("form")
    setProgress(0)
    setGeneratedItinerary([])
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
          {stage === "results" && <GeneratedItinerary itinerary={generatedItinerary} onRegenerate={handleRegenerate} />}
        </div>
      </main>
      <Footer />
    </div>
  )
}
