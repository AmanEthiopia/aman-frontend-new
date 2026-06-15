"use client"

import { useState } from "react"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Car, Utensils, Map, Clock, Building2, Phone, Mail, MessageSquare,
  Sparkles, CheckCircle, Star, Shield, Users, Loader2, AlertCircle, CheckCircle2,
} from "lucide-react"
import { submitInquiry } from "@/lib/api/inquiries"
import { useAuth } from "@/contexts/auth-context"
import { friendlyError } from "@/lib/utils/errors"

const SUPPORT_WHATSAPP = "251708029422"
const SUPPORT_PHONE = "+251708029422"

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

const SERVICE_OPTIONS = services.map((s) => s.title)

export default function ConciergePage() {
  const { userProfile } = useAuth()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
    company_website: "", // honeypot
  })

  const openRequest = (service?: string) => {
    setSubmitted(false)
    setError(null)
    setForm((p) => ({
      ...p,
      service: service || p.service,
      name: p.name || [userProfile?.user?.first_name, userProfile?.user?.last_name].filter(Boolean).join(" "),
      email: p.email || userProfile?.user?.email || "",
      phone: p.phone || userProfile?.user?.phone || "",
    }))
    setOpen(true)
  }

  const handleSubmit = async () => {
    setError(null)
    if (!form.name.trim() || !form.email.trim()) {
      setError("Please provide your name and email so we can reach you.")
      return
    }
    setSubmitting(true)
    try {
      const lines = [
        form.service ? `Service of interest: ${form.service}` : "",
        form.message,
      ].filter(Boolean).join("\n\n")
      await submitInquiry({
        inquiry_type: "concierge",
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        message: lines || "Premium concierge request",
        company_website: form.company_website,
      })
      setSubmitted(true)
    } catch (err) {
      setError(friendlyError(err, "We couldn't send your request. Please try again or reach us on WhatsApp."))
    } finally {
      setSubmitting(false)
    }
  }

  const waHref = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent("Hi Alga Ale — I'd like to ask about Premium Concierge services.")}`

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
                Premium Service · One-time booking
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
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90" onClick={() => openRequest()}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Request Concierge
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white" asChild>
                  <a href={waHref} target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chat on WhatsApp
                  </a>
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
                <Card key={service.title} className="flex flex-col overflow-hidden">
                  <CardHeader>
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <service.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col">
                    <ul className="mb-4 space-y-2">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" className="mt-auto w-full" onClick={() => openRequest(service.title)}>
                      Request This Service
                    </Button>
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
                Send a request and our concierge team will reach out within 24 hours to confirm the details.
                Prefer to talk first? Call or message us anytime.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" onClick={() => openRequest()}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Request Concierge
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent" asChild>
                  <a href={`tel:${SUPPORT_PHONE}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    +251 708 029 422
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent" asChild>
                  <a href="mailto:team@yichalal.ai">
                    <Mail className="mr-2 h-4 w-4" />
                    team@yichalal.ai
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Concierge request dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Request Premium Concierge
            </DialogTitle>
            <DialogDescription>
              Tell us what you need. The Alga Ale team will arrange it and confirm by email within 24 hours — no payment needed to request.
            </DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-600" />
              <p className="text-lg font-semibold">Request sent!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Our concierge team will reach out within 24 hours.
              </p>
              <Button className="mt-6" onClick={() => setOpen(false)}>Done</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {/* Honeypot */}
              <input
                type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden"
                value={form.company_website}
                onChange={(e) => setForm((p) => ({ ...p, company_website: e.target.value }))}
              />
              <div className="space-y-2">
                <Label htmlFor="c-service">Service</Label>
                <select
                  id="c-service"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
                  value={form.service}
                  onChange={(e) => setForm((p) => ({ ...p, service: e.target.value }))}
                >
                  <option value="">General concierge request</option>
                  {SERVICE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="c-name">Name *</Label>
                  <Input id="c-name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-email">Email *</Label>
                  <Input id="c-email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-phone">Phone / WhatsApp (optional)</Label>
                <Input id="c-phone" type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-message">Details</Label>
                <Textarea
                  id="c-message"
                  placeholder="Dates, group size, what you'd like arranged…"
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  rows={4}
                />
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" className="bg-transparent" asChild>
                  <a href={waHref} target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    WhatsApp instead
                  </a>
                </Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…</> : "Send Request"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
