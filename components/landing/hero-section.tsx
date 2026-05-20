"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, Star, Sparkles, Hotel, Utensils, Car, Compass } from "lucide-react"
import { useApp } from "@/lib/contexts/app-context"

const quickLinks = [
  { href: "/hotels", label: "Hotels", icon: Hotel },
  { href: "/restaurants", label: "Restaurants", icon: Utensils },
  { href: "/transport", label: "Transport", icon: Car },
  { href: "/experiences", label: "Experiences", icon: Compass },
]

export function HeroSection() {
  const { setIsAIAssistantOpen } = useApp()

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 bg-[url('/subtle-geometric-ethiopian-pattern-background.jpg')] bg-cover bg-center opacity-5" />

      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
            <Shield className="h-4 w-4" />
            <span>Built in Ethiopia, for Ethiopia</span>
          </div>

          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Trusted Stays & Local Intelligence for{" "}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Ethiopia</span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto mb-8 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
            Verified hotels, restaurants, transport, and experiences. From budget stays to luxury retreats — discover
            Ethiopia with confidence and local expertise.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="h-12 px-8 text-base">
              <Link href="/hotels">Explore Stays</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 bg-transparent px-8 text-base"
              onClick={() => setIsAIAssistantOpen(true)}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Ask AI
            </Button>
          </div>

          {/* Quick Category Links */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                <link.icon className="h-4 w-4 text-primary" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span>Verified Local Listings</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-secondary-foreground" />
              <span>Curated Across Ethiopia</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>AI-Powered Planning</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="container mx-auto px-4 pb-12">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border shadow-2xl">
          <img
            src="/beautiful-ethiopian-landscape-with-modern-hotel-bu.jpg"
            alt="Beautiful Ethiopian landscape with modern hotel"
            className="h-auto w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
        </div>
      </div>
    </section>
  )
}
