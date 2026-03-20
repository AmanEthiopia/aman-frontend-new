"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Plus,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Building2,
  UtensilsCrossed,
  Car,
  Camera,
  GripVertical,
  Trash2,
  Edit2,
  Share2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FEATURES } from "@/lib/config/features"

interface ItineraryItem {
  id: string
  type: "hotel" | "restaurant" | "transport" | "experience"
  title: string
  location: string
  time?: string
  notes?: string
  confirmed: boolean
}

interface ItineraryDay {
  date: string
  items: ItineraryItem[]
}

// Mock itinerary data
const mockItinerary: ItineraryDay[] = [
  {
    date: "2025-01-15",
    items: [
      {
        id: "1",
        type: "hotel",
        title: "Check-in at Sheraton Addis",
        location: "Addis Ababa",
        time: "14:00",
        confirmed: true,
      },
      {
        id: "2",
        type: "restaurant",
        title: "Dinner at Yod Abyssinia",
        location: "Addis Ababa",
        time: "19:00",
        notes: "Traditional Ethiopian cuisine with cultural show",
        confirmed: false,
      },
    ],
  },
  {
    date: "2025-01-16",
    items: [
      {
        id: "3",
        type: "experience",
        title: "Ethiopian Coffee Ceremony",
        location: "Addis Ababa",
        time: "10:00",
        confirmed: true,
      },
      {
        id: "4",
        type: "transport",
        title: "Flight to Lalibela",
        location: "Bole International Airport",
        time: "15:30",
        confirmed: true,
      },
      {
        id: "5",
        type: "hotel",
        title: "Check-in at Maribela Hotel",
        location: "Lalibela",
        time: "18:00",
        confirmed: true,
      },
    ],
  },
]

const typeConfig = {
  hotel: { icon: Building2, color: "bg-blue-500/10 text-blue-600" },
  restaurant: { icon: UtensilsCrossed, color: "bg-orange-500/10 text-orange-600" },
  transport: { icon: Car, color: "bg-green-500/10 text-green-600" },
  experience: { icon: Camera, color: "bg-purple-500/10 text-purple-600" },
}

function ItineraryItemCard({
  item,
  onEdit,
  onDelete,
}: {
  item: ItineraryItem
  onEdit: () => void
  onDelete: () => void
}) {
  const config = typeConfig[item.type]
  const Icon = config.icon

  return (
    <div className="group flex items-start gap-3 rounded-lg border bg-card p-3 transition-all hover:shadow-sm">
      <div className="cursor-grab opacity-0 transition-opacity group-hover:opacity-100">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className={`rounded-lg p-2 ${config.color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-medium">{item.title}</h4>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {item.location}
              </span>
              {item.time && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {item.time}
                </span>
              )}
            </div>
          </div>
          <Badge variant={item.confirmed ? "default" : "secondary"}>{item.confirmed ? "Confirmed" : "Planned"}</Badge>
        </div>
        {item.notes && <p className="mt-2 text-sm text-muted-foreground">{item.notes}</p>}
      </div>
      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function EmptyItinerary() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16 text-center">
      <div className="mb-4 rounded-full bg-primary/10 p-4">
        <Calendar className="h-8 w-8 text-primary" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">No itinerary yet</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        Start planning your Ethiopian adventure by adding activities, accommodations, and experiences.
      </p>
      <div className="flex gap-3">
        {FEATURES.AI_CONCIERGE && (
          <Link href="/planner">
            <Button>
              <Sparkles className="mr-2 h-4 w-4" />
              AI Trip Planner
            </Button>
          </Link>
        )}
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Manually
        </Button>
      </div>
    </div>
  )
}

export default function ItineraryPage() {
  const [itinerary, setItinerary] = useState<ItineraryDay[]>(mockItinerary)
  const [selectedTrip, setSelectedTrip] = useState<string | null>("current")

  const handleEdit = (itemId: string) => {
    // Would open edit modal
    console.log("Edit item:", itemId)
  }

  const handleDelete = (itemId: string) => {
    setItinerary((prev) =>
      prev
        .map((day) => ({
          ...day,
          items: day.items.filter((item) => item.id !== itemId),
        }))
        .filter((day) => day.items.length > 0),
    )
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return {
      day: date.toLocaleDateString("en-US", { weekday: "long" }),
      date: date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Itinerary</h1>
          <p className="text-muted-foreground">Plan and organize your trip activities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          {FEATURES.AI_CONCIERGE && (
            <Link href="/planner">
              <Button size="sm">
                <Sparkles className="mr-2 h-4 w-4" />
                AI Planner
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Tabs defaultValue="current" className="space-y-6">
        <TabsList>
          <TabsTrigger value="current">Current Trip</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past Trips</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          {itinerary.length > 0 ? (
            <>
              {/* Trip Overview Card */}
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <h3 className="font-semibold">Ethiopian Highlands Adventure</h3>
                    <p className="text-sm text-muted-foreground">Jan 15 - Jan 22, 2025 • 7 days • 3 cities</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">5</p>
                      <p className="text-muted-foreground">Confirmed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">2</p>
                      <p className="text-muted-foreground">Planned</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Daily Itinerary */}
              <div className="space-y-6">
                {itinerary.map((day, index) => {
                  const { day: dayName, date } = formatDate(day.date)
                  return (
                    <div key={day.date}>
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold">{dayName}</h3>
                          <p className="text-sm text-muted-foreground">{date}</p>
                        </div>
                      </div>
                      <div className="ml-5 space-y-3 border-l-2 border-muted pl-8">
                        {day.items.map((item) => (
                          <ItineraryItemCard
                            key={item.id}
                            item={item}
                            onEdit={() => handleEdit(item.id)}
                            onDelete={() => handleDelete(item.id)}
                          />
                        ))}
                        <Button variant="ghost" size="sm" className="ml-3 text-muted-foreground">
                          <Plus className="mr-2 h-4 w-4" />
                          Add activity
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Add Day Button */}
              <Button variant="outline" className="w-full bg-transparent">
                <Plus className="mr-2 h-4 w-4" />
                Add Another Day
              </Button>
            </>
          ) : (
            <EmptyItinerary />
          )}
        </TabsContent>

        <TabsContent value="upcoming">
          <EmptyItinerary />
        </TabsContent>

        <TabsContent value="past">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Calendar className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-semibold">No past trips</h3>
            <p className="text-sm text-muted-foreground">Your completed trips will be saved here as travel memories.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
