"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, Loader2, User, MapPin, Shield } from "lucide-react"
import Link from "next/link"
import type { Hotel } from "@/lib/types/index"
import { mockHotels } from "@/lib/mock-data/hotels"
import { AmanZigzag, AmanZigzagLoader } from "@/components/brand/aman-logo"

interface Message {
  role: "user" | "assistant"
  content: string
  hotels?: Hotel[]
}

const suggestedQueries = [
  "Best hotel near Bole Airport under $100",
  "Safe luxury hotel for foreigners in Addis",
  "Budget-friendly stay in Bahir Dar",
  "Hotel with pool and spa in Addis Ababa",
  "Historic hotel in Gondar for culture lovers",
]

function generateMockResponse(query: string): { response: string; hotels: Hotel[] } {
  const lowerQuery = query.toLowerCase()
  let filteredHotels = [...mockHotels]
  let response = ""

  // Filter by price
  if (lowerQuery.includes("budget") || lowerQuery.includes("cheap") || lowerQuery.includes("affordable")) {
    filteredHotels = filteredHotels.filter((h) => h.priceRange === "budget")
    response = "Here are some budget-friendly options that offer great value:"
  } else if (lowerQuery.includes("luxury") || lowerQuery.includes("premium") || lowerQuery.includes("best")) {
    filteredHotels = filteredHotels.filter((h) => h.priceRange === "luxury")
    response = "These luxury hotels offer exceptional service and amenities:"
  }

  // Filter by city
  if (lowerQuery.includes("addis") || lowerQuery.includes("bole")) {
    filteredHotels = filteredHotels.filter((h) => h.cityId === "addis-ababa")
    response = response || "Here are top-rated hotels in Addis Ababa:"
  } else if (lowerQuery.includes("bahir dar") || lowerQuery.includes("lake tana")) {
    filteredHotels = filteredHotels.filter((h) => h.cityId === "bahir-dar")
    response = response || "Beautiful lakeside options in Bahir Dar:"
  } else if (lowerQuery.includes("gondar")) {
    filteredHotels = filteredHotels.filter((h) => h.cityId === "gondar")
    response = response || "Historic hotels in the royal city of Gondar:"
  } else if (lowerQuery.includes("lalibela")) {
    filteredHotels = filteredHotels.filter((h) => h.cityId === "lalibela")
    response = response || "Stays near the famous rock-hewn churches of Lalibela:"
  }

  // Filter by amenities
  if (lowerQuery.includes("pool") || lowerQuery.includes("spa")) {
    filteredHotels = filteredHotels.filter((h) =>
      h.amenities.some((a) => a.toLowerCase().includes("pool") || a.toLowerCase().includes("spa")),
    )
    response = response || "Hotels with pool and spa facilities:"
  }

  // Default response
  if (!response) {
    response = "Based on your search, here are some recommended hotels in Ethiopia:"
  }

  // Limit to 3 results
  const results = filteredHotels.slice(0, 3)

  if (results.length === 0) {
    return {
      response:
        "I couldn't find hotels matching those specific criteria, but here are some popular options you might like:",
      hotels: mockHotels.slice(0, 3),
    }
  }

  return { response, hotels: results }
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (query: string) => {
    if (!query.trim() || isLoading) return

    const userMessage: Message = { role: "user", content: query }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))

    const { response, hotels } = generateMockResponse(query)

    const assistantMessage: Message = {
      role: "assistant",
      content: response,
      hotels: hotels,
    }
    setMessages((prev) => [...prev, assistantMessage])
    setIsLoading(false)
  }

  const priceRangeLabels: Record<string, { label: string; color: string }> = {
    budget: { label: "Budget", color: "bg-green-100 text-green-800" },
    "mid-range": { label: "Mid-Range", color: "bg-blue-100 text-blue-800" },
    luxury: { label: "Luxury", color: "bg-amber-100 text-amber-800" },
  }

  return (
    <div className="flex h-[600px] flex-col rounded-xl border border-border bg-card shadow-lg">
      {/* Chat Header */}
      <div className="flex items-center gap-3 border-b border-border p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <AmanZigzag size={18} strokeWidth={5} title="AMAN AI" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">AMAN AI Assistant</h3>
          <p className="text-sm text-muted-foreground">Ask me anything about hotels in Ethiopia</p>
        </div>
        <Badge variant="secondary" className="text-xs">
          Demo Mode
        </Badge>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <AmanZigzag size={28} strokeWidth={5} title="AMAN AI" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">How can I help you today?</h3>
            <p className="mb-6 max-w-md text-sm text-muted-foreground">
              Ask me about hotels in Ethiopia - I can help you find the perfect stay based on your budget, location
              preferences, and needs.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestedQueries.map((query) => (
                <button
                  key={query}
                  onClick={() => handleSubmit(query)}
                  className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs transition-colors hover:bg-muted"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <AmanZigzag size={14} strokeWidth={5} title="AMAN AI" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>

                  {/* Hotel Recommendations */}
                  {message.hotels && message.hotels.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <p className="text-xs font-medium uppercase tracking-wide opacity-70">Recommended Hotels</p>
                      {message.hotels.map((hotel) => {
                        const priceInfo = priceRangeLabels[hotel.priceRange] || priceRangeLabels["mid-range"]
                        return (
                          <Link key={hotel.id} href={`/hotels/${hotel.id}`}>
                            <Card className="transition-shadow hover:shadow-md">
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{hotel.name}</span>
                                      {hotel.isVerified && (
                                        <Shield className="h-3.5 w-3.5 text-primary" aria-label="Verified" />
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <MapPin className="h-3 w-3" />
                                      {hotel.area}
                                    </div>
                                  </div>
                                  <Badge variant="outline" className={priceInfo.color}>
                                    ${hotel.priceMin}-${hotel.priceMax}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
                {message.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <AmanZigzag size={14} strokeWidth={5} title="AMAN AI" />
                </div>
                <div className="rounded-2xl bg-muted px-4 py-2">
                  <AmanZigzagLoader size={22} label="AMAN AI is planning your trip" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit(input)
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about hotels in Ethiopia..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send message</span>
          </Button>
        </form>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          AMAN AI may make mistakes. Verify key details before booking.
        </p>
      </div>
    </div>
  )
}
