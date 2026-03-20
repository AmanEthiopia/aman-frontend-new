"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, ArrowRight, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useApp } from "@/lib/contexts/app-context"

const examplePrompts = [
  "Plan 3 days in Addis under $100/day",
  "Best hotels for families in Gondar",
  "Suggest a cultural experience in Lalibela",
  "Safe area to stay near Bole Airport",
]

export function AIPreviewSection() {
  const { setIsAIAssistantOpen } = useApp()

  return (
    <section className="bg-muted/30 py-20">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Content */}
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              AI-Powered
            </div>
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Your Personal Travel Intelligence</h2>
            <p className="mb-6 text-lg text-muted-foreground">
              Ask anything about traveling in Ethiopia. Our AI assistant combines local knowledge with real-time
              information to help you plan the perfect trip.
            </p>

            {/* Context Memory Badge */}
            <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm text-primary">
                <span className="font-medium">Based on your budget, travel dates, and interests...</span>
                <br />
                <span className="text-muted-foreground">
                  Our AI learns your preferences to give increasingly personalized recommendations.
                </span>
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setIsAIAssistantOpen(true)}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Ask AI Assistant
              </Button>
              <Button variant="outline" asChild className="bg-transparent">
                <Link href="/ai/planner">
                  Plan a Trip
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Preview Card */}
          <div>
            <Card className="overflow-hidden">
              <div className="bg-primary/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                    <Sparkles className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AMAN AI Assistant</h3>
                    <p className="text-sm text-muted-foreground">Ask me anything about Ethiopia</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <p className="mb-4 text-sm text-muted-foreground">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {examplePrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setIsAIAssistantOpen(true)}
                      className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
