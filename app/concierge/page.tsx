"use client"

import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Car,
  Utensils,
  Map,
  Clock,
  Building2,
  Phone,
  Mail,
  MessageSquare,
  Sparkles,
  CheckCircle,
  Star,
  Shield,
  Users,
} from "lucide-react"
import Link from "next/link"

const services = [
  {
    icon: Car,
    title: "Airport Transfers",
    description: "Reliable pickup and drop-off services with professional drivers. Available 24/7 for all major airports.",
    features: ["Meet & greet service", "Flight tracking", "Child seats available", "Luxury vehicles"],
  },
  {
    icon: Utensils,
    title: "Restaurant Reservations",
    description: "Secure tables at Ethiopia's finest restaurants. From traditional cuisine to international dining.",
    features: ["Priority bookings", "Special dietary requests", "Private dining arrangements", "Event hosting"],
  },
  {
    icon: Map,
    title: "Tour Arrangements",
    description: "Customized tours with expert local guides. Discover hidden gems and iconic landmarks.",
    features: ["Private guides", "Custom itineraries", "Group tours", "Photography tours"],
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Round-the-clock assistance for any travel needs. We're always here when you need us.",
    features: ["Emergency assistance", "Real-time support", "Multi-language", "Local expertise"],
  },
  {
    icon: Building2,
    title: "Business Services",
    description: "Comprehensive support for business travelers. Meeting rooms, interpreters, and more.",
    features: ["Meeting coordination", "Translation services", "Office space rental", "Event planning"],
  },
  {
    icon: Users,
    title: "Group Travel",
    description: "Specialized services for group trips, corporate retreats, and family vacations.",
    features: ["Group discounts", "Coordinated logistics", "Team activities", "Custom packages"],
  },
]

const benefits = [
  { icon: Shield, title: "Verified Partners", description: "All service providers are thoroughly vetted" },
  { icon: Star, title: "Premium Quality", description: "Only the highest standard of service" },
  { icon: Clock, title: "Time Saving", description: "We handle the details so you can enjoy" },
  { icon: CheckCircle, title: "Guaranteed Service", description: "Full satisfaction or your money back" },
]

export default function ConciergePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('/abstract-geometric-pattern.png')] bg-cover bg-center" />
          </div>
          <div className="container relative mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="secondary" className="mb-4 bg-white/10 text-primary-foreground">
                <Sparkles className="mr-1 h-3 w-3" />
                Premium Service
              </Badge>
              <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl">
                Premium Concierge Services
              </h1>
              <p className="mb-8 text-lg text-primary-foreground/80">
                Experience Ethiopia with personalized support every step of the way. Our dedicated team
                handles everything from airport transfers to restaurant reservations, ensuring your
                journey is seamless and memorable.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Us Now
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Start Chat
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="border-b py-12">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <benefit.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">Our Services</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                From the moment you land to the day you depart, our concierge team is dedicated
                to making your Ethiopian experience exceptional.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <Card key={service.title} className="overflow-hidden">
                  <CardHeader>
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <service.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="mb-4 text-2xl font-bold">Ready to Experience Premium Travel?</h2>
              <p className="mb-8 text-muted-foreground">
                Contact our concierge team today to start planning your perfect Ethiopian journey.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" asChild>
                  <Link href="/register">
                    Get Started
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent" asChild>
                  <a href="mailto:concierge@aman.et">
                    <Mail className="mr-2 h-4 w-4" />
                    concierge@aman.et
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
