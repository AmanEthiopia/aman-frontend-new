"use client"

import Link from "next/link"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import {
  Building2,
  Globe,
  Shield,
  Users,
  Clock,
  CreditCard,
  FileText,
  ArrowRight,
  CheckCircle2,
  Mail,
  Star,
  BarChart3,
  Scale,
  Calculator,
  AlertTriangle,
  TrendingUp,
  MapPin,
  MessageCircle,
  Briefcase,
  ExternalLink,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import { useState } from "react"
import { submitInquiry } from "@/lib/api/inquiries"
import { friendlyError } from "@/lib/utils/errors"

// ─── Data ─────────────────────────────────────────────────────────────────────

const marketEntryServices = [
  {
    icon: BarChart3,
    title: "Local Market Analysis",
    description: "Deep-dive research into Ethiopia's travel and hospitality landscape — competitor mapping, demand hotspots, pricing benchmarks, and growth opportunities tailored to your sector.",
  },
  {
    icon: FileText,
    title: "Documentation & Registration",
    description: "End-to-end support for business registration, operating licenses, and permit applications. We know the exact requirements and can fast-track the process.",
  },
  {
    icon: Scale,
    title: "Legal & Compliance",
    description: "Navigate Ethiopian commercial law, foreign investment regulations, tax obligations, and sector-specific compliance requirements with expert local guidance.",
  },
  {
    icon: Calculator,
    title: "Cost & Financial Modeling",
    description: "Transparent cost projections covering setup, staffing, operations, and regulatory fees. Build a realistic financial model before committing capital.",
  },
  {
    icon: AlertTriangle,
    title: "Risk Assessment",
    description: "Honest risk profiling across regulatory, operational, political, and market dimensions — with mitigation strategies based on real on-the-ground experience.",
  },
  {
    icon: TrendingUp,
    title: "Scaling Strategy",
    description: "Once you're established, we help you grow — through partnerships, platform integration, and access to our network of verified operators across Ethiopia.",
  },
]

const enterpriseFeatures = [
  {
    icon: Shield,
    title: "Priority Verification",
    description: "Fast-track verification for corporate and diplomatic accounts",
  },
  {
    icon: Users,
    title: "Team Management",
    description: "Manage bookings for your entire team from one dashboard",
  },
  {
    icon: CreditCard,
    title: "Centralized Billing",
    description: "Consolidated invoicing and expense management",
  },
  {
    icon: Clock,
    title: "24/7 Priority Support",
    description: "Dedicated support line for business travelers",
  },
  {
    icon: FileText,
    title: "Compliance Reports",
    description: "Travel policy compliance and detailed reporting",
  },
  {
    icon: Globe,
    title: "Negotiated Rates",
    description: "Access to corporate rates and exclusive deals",
  },
]

const testimonials = [
  {
    name: "African Development Bank",
    role: "Travel Coordinator",
    quote:
      "Algalle has transformed how we manage travel for our 200+ staff. The centralized booking and compliance features are invaluable.",
    rating: 5,
  },
  {
    name: "UN Ethiopia Office",
    role: "Operations Manager",
    quote: "The security verification and 24/7 support give us confidence when booking accommodations across Ethiopia.",
    rating: 5,
  },
]

const founders = [
  {
    name: "Mulubrhan Legesse",
    role: "Co-Founder & CEO",
    bio: "Builder of Algalle. Passionate about unlocking Ethiopia's business potential through technology.",
    linkedin: "https://www.linkedin.com/in/mulubrhan-legesse/",
    email: "legesse.mulubrhan@gmail.com",
    whatsapp: "+251708029422",
    initials: "ML",
  },
  {
    name: "Fitsum Getachew",
    role: "Co-Founder",
    bio: "Driving partnerships and growth at Algalle. Committed to bridging Ethiopian opportunity with global capital.",
    linkedin: "https://www.linkedin.com/in/fitsum-getachew/",
    email: "fitsumgetachewtola@gmail.com",
    whatsapp: "+251709192541",
    initials: "FG",
  },
]

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function BusinessPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "",
    email: "",
    organization: "",
    org_type: "",
    travelers: "",
    message: "",
    company_website: "", // honeypot
  })

  const setField = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async () => {
    setFormError(null)
    if (!form.name.trim() || !form.email.trim()) {
      setFormError("Please enter your name and work email.")
      return
    }
    setSubmitting(true)
    try {
      await submitInquiry({ ...form, inquiry_type: "business" })
      setSubmitted(true)
    } catch (err) {
      setFormError(friendlyError(err, "We couldn't send your inquiry. Please try again or email us directly."))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">

        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/90 to-primary py-24 text-primary-foreground">
          <div className="pointer-events-none absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1600')] bg-cover bg-center opacity-10" />
          <div className="container relative mx-auto max-w-4xl px-4 text-center">
            <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">
              For Organizations & Diplomats
            </Badge>
            <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              Business & Diplomat Services
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-white/85 md:text-xl">
              Whether you're expanding into Ethiopia, managing a diplomatic mission, or coordinating enterprise travel — Algalle provides the advisory, compliance, and logistics support to get it done right.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#contact">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold px-8">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Start a Conversation
                </Button>
              </a>
              <a href="#advisory">
                <Button size="lg" variant="outline" className="border-white/50 bg-transparent text-white hover:bg-white/10 hover:text-white px-8">
                  View Services
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b bg-muted/40 py-10">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
              {[
                { value: "15+", label: "Markets Served" },
                { value: "40+", label: "Organizations" },
                { value: "6", label: "Advisory Services" },
                { value: "24/7", label: "Dedicated Support" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl font-bold text-primary">{stat.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Market Entry Advisory */}
        <section id="advisory" className="py-20">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="mb-12 text-center">
              <Badge className="mb-4 bg-primary/10 text-primary">For Organizations Entering Ethiopia</Badge>
              <h2 className="text-3xl font-bold">Market Entry Advisory</h2>
              <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
                Ethiopia is one of Africa's fastest-growing economies — but navigating its regulatory environment requires local expertise. We've done it. Let us guide you.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {marketEntryServices.map((service) => (
                <Card key={service.title} className="border-border/60 transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <service.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 font-semibold">{service.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-10 text-center">
              <a href="#contact">
                <Button size="lg" className="px-10">
                  Request a Market Entry Brief
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Enterprise Travel Features */}
        <section className="bg-muted/30 py-20">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold">Enterprise Travel Management</h2>
              <p className="mt-3 text-muted-foreground">Streamlined tools for organizations managing travel across Ethiopia</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enterpriseFeatures.map((feature) => (
                <Card key={feature.title} className="border-border/50">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Trust / Testimonials */}
        <section className="py-20">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <Badge className="mb-4 bg-green-600 text-white">Security First</Badge>
                <h2 className="text-3xl font-bold">Trusted by Leading Organizations</h2>
                <p className="mt-4 text-muted-foreground">
                  Algalle provides verified accommodations with enhanced security protocols for diplomatic missions, international organizations, and corporate travelers.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "All properties undergo rigorous verification",
                    "24/7 emergency support line for all business travelers",
                    "Secure communication channels with property hosts",
                    "Real-time location sharing during emergencies",
                    "Compliance with international travel safety standards",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                {testimonials.map((t) => (
                  <Card key={t.name}>
                    <CardContent className="pt-6">
                      <div className="mb-3 flex items-center gap-1">
                        {Array.from({ length: t.rating }).map((_, j) => (
                          <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-sm italic">"{t.quote}"</p>
                      <div className="mt-4">
                        <p className="font-medium">{t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.role}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Founders / Direct Contact */}
        <section className="bg-muted/30 py-20">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold">Talk Directly with the Founders</h2>
              <p className="mt-3 text-muted-foreground">
                Business and diplomatic inquiries are reviewed personally. Reach out — we respond within one business day.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2">
              {founders.map((f) => (
                <Card key={f.name}>
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                        {f.initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{f.name}</h3>
                        <p className="text-sm text-primary font-medium">{f.role}</p>
                      </div>
                    </div>
                    <p className="mb-5 text-sm text-muted-foreground leading-relaxed">{f.bio}</p>
                    <div className="space-y-2">
                      <a
                        href={`mailto:${f.email}`}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        {f.email}
                      </a>
                      <a
                        href={f.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 flex-shrink-0" />
                        LinkedIn Profile
                      </a>
                      <a
                        href={`https://wa.me/${f.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <MessageCircle className="h-4 w-4 flex-shrink-0 text-[#25D366]" />
                        WhatsApp: {f.whatsapp}
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section id="contact" className="py-20">
          <div className="container mx-auto max-w-2xl px-4">
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Submit an Inquiry</CardTitle>
                <CardDescription>
                  Tell us about your organization's needs and we'll prepare a tailored briefing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {submitted ? (
                  <div className="py-8 text-center">
                    <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-600" />
                    <p className="font-semibold text-lg">Thank you — inquiry received!</p>
                    <p className="mt-1 text-sm text-muted-foreground">Our team will respond within 24 hours.</p>
                  </div>
                ) : (
                  <>
                    {formError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{formError}</AlertDescription>
                      </Alert>
                    )}
                    {/* Honeypot — visually hidden, ignored by humans, filled by bots */}
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      value={form.company_website}
                      onChange={setField("company_website")}
                      className="hidden"
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name</Label>
                        <Input id="name" placeholder="John Smith" value={form.name} onChange={setField("name")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Work Email</Label>
                        <Input id="email" type="email" placeholder="john@organization.org" value={form.email} onChange={setField("email")} />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="org">Organization</Label>
                        <Input id="org" placeholder="Organization name" value={form.organization} onChange={setField("organization")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type">Organization Type</Label>
                        <select id="type" value={form.org_type} onChange={setField("org_type")} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                          <option value="">Select type...</option>
                          <option value="corporate">Corporate / Business</option>
                          <option value="diplomatic">Diplomatic Mission</option>
                          <option value="ngo">NGO / Non-Profit</option>
                          <option value="government">Government Agency</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="travelers">Estimated Monthly Travelers</Label>
                      <select id="travelers" value={form.travelers} onChange={setField("travelers")} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        <option value="">Select range...</option>
                        <option value="1-10">1–10 travelers</option>
                        <option value="11-50">11–50 travelers</option>
                        <option value="51-200">51–200 travelers</option>
                        <option value="200+">200+ travelers</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Tell us about your needs</Label>
                      <Textarea
                        id="message"
                        placeholder="Describe your travel requirements, expansion goals, destinations, and any specific needs..."
                        className="min-h-[100px]"
                        value={form.message}
                        onChange={setField("message")}
                      />
                    </div>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending…</>
                      ) : (
                        <><Mail className="mr-2 h-5 w-5" /> Submit Inquiry</>
                      )}
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">Our team will respond within 24 hours</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Nudge back to listings */}
        <section className="bg-primary py-14 text-primary-foreground">
          <div className="container mx-auto max-w-3xl px-4 text-center">
            <h2 className="mb-3 text-2xl font-bold">Also listing your services on Algalle?</h2>
            <p className="mb-6 text-white/80">
              Hotels, guides, and transport providers can list on our platform separately from the advisory program.
            </p>
            <Link href="/host">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold px-8">
                Partner With Us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
