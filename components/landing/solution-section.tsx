"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Shield, Sparkles, Users, Hotel, Utensils, Car, Compass } from "lucide-react"
import Link from "next/link"
import { searchHotels } from "@/lib/api/hotels"
import { getRestaurantsPaginated } from "@/lib/api/restaurants"
import { getExperiencesPaginated } from "@/lib/api/experiences"
import { getTransportsPaginated } from "@/lib/api/transport"

const solutions = [
  {
    icon: Shield,
    title: "Verified Everything",
    description: "Every hotel, restaurant, and experience is personally verified by our team.",
  },
  {
    icon: CheckCircle2,
    title: "Transparent Pricing",
    description: "Clear price ranges with no hidden fees or surprise charges.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Planning",
    description: "Get personalized trip plans and recommendations based on your needs.",
  },
  {
    icon: Users,
    title: "Local Expertise",
    description: "Detailed area guides and safety notes from local experts.",
  },
]

const categoryConfig = [
  { icon: Hotel,    title: "Hotels & Stays", key: "hotels",       href: "/hotels",       description: "From budget to luxury" },
  { icon: Utensils, title: "Restaurants",    key: "restaurants",  href: "/restaurants",  description: "Ethiopian & international" },
  { icon: Car,      title: "Transport",      key: "transport",    href: "/transport",    description: "Airport pickups & drivers" },
  { icon: Compass,  title: "Experiences",   key: "experiences",  href: "/experiences",  description: "Tours & activities" },
] as const

type CountKey = "hotels" | "restaurants" | "transport" | "experiences"

export function SolutionSection() {
  const [counts, setCounts] = useState<Record<CountKey, number | null>>({
    hotels: null,
    restaurants: null,
    transport: null,
    experiences: null,
  })

  useEffect(() => {
    Promise.all([
      searchHotels({ page_size: 1 }).catch(() => ({ count: 0 })),
      getRestaurantsPaginated({ page_size: 1 }).catch(() => ({ count: 0 })),
      getTransportsPaginated({ page_size: 1 }).catch(() => ({ count: 0 })),
      getExperiencesPaginated({ page_size: 1 }).catch(() => ({ count: 0 })),
    ]).then(([hotels, restaurants, transport, experiences]) => {
      setCounts({
        hotels: hotels.count,
        restaurants: restaurants.count,
        transport: transport.count,
        experiences: experiences.count,
      })
    })
  }, [])

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              Why Alga Ale
            </span>
            <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">Trust, Transparency, and Technology</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              We combine local expertise with modern technology to create the most reliable travel platform for
              Ethiopia. Every listing is verified, every price is clear, and our AI assistant is always ready to help.
            </p>

            <div className="grid gap-6 sm:grid-cols-2">
              {solutions.map((solution) => (
                <div key={solution.title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <solution.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{solution.title}</h3>
                    <p className="text-sm text-muted-foreground">{solution.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {categoryConfig.map((category) => {
              const count = counts[category.key]
              return (
                <Link
                  key={category.href}
                  href={category.href}
                  className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <category.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-1 font-semibold">{category.title}</h3>
                  <p className="mb-2 text-2xl font-bold text-primary">
                    {count === null ? (
                      <span className="inline-block h-8 w-12 animate-pulse rounded bg-primary/20" />
                    ) : (
                      `${count}+`
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
