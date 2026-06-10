import Link from "next/link"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Globe,
  Users,
  TrendingUp,
  Shield,
  Star,
  Briefcase,
  Building2,
  Plane,
  HandshakeIcon,
  Mail,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  MapPin,
  BarChart3,
  FileText,
  Scale,
  Rocket,
  MessageCircle,
  Crown,
  Car,
  Compass,
  Hotel,
  Sparkles,
} from "lucide-react"

// ─── Data ─────────────────────────────────────────────────────────────────────

const benefits = [
  {
    icon: Globe,
    title: "Reach Global Travelers",
    body: "Connect with thousands of international visitors, diplomats, and business travelers who use Aman Ethiopia as their trusted platform for discovering and booking services across Ethiopia.",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Revenue",
    body: "Our platform handles discovery, booking logistics, and payment processing — so you focus on delivering great experiences while we bring you qualified bookings.",
  },
  {
    icon: Shield,
    title: "Verified & Trusted",
    body: "Every partner on Aman Ethiopia goes through a verification process. Your listing carries our trust badge, signaling quality to every traveler.",
  },
  {
    icon: Users,
    title: "Dedicated Support",
    body: "You get a direct line to our team. From onboarding to ongoing optimization, we help you present your service in the best possible light.",
  },
  {
    icon: Star,
    title: "Reviews & Reputation",
    body: "Build a verified review profile that compounds over time. Travelers trust peer reviews — and our review system is designed to be fair and transparent.",
  },
  {
    icon: Briefcase,
    title: "Tools Built for Providers",
    body: "Manage bookings, view earnings, assign resources, and communicate with guests — all from a single, purpose-built provider dashboard.",
  },
]

const partnerTypes = [
  {
    icon: Building2,
    title: "Hotels & Lodges",
    description: "From boutique guesthouses to luxury resorts — list your property, manage room availability in real-time, and reach travelers who are actively planning their stay in Ethiopia.",
  },
  {
    icon: Plane,
    title: "Tour Operators & Guides",
    description: "Offer curated multi-day trips or private guided experiences. Our platform handles departure scheduling, seat management, and group bookings end-to-end.",
  },
  {
    icon: HandshakeIcon,
    title: "Diplomatic & Corporate Travel",
    description: "Provide reliable, vetted transport, accommodation, and concierge services for embassies, international organizations, and corporate delegations visiting Ethiopia.",
  },
  {
    icon: MapPin,
    title: "Transport & Drivers",
    description: "Register your vehicles and drivers, set your services and pricing, and accept bookings for airport transfers, city tours, intercity routes, and more.",
  },
]

const founders = [
  {
    name: "Mulubrhan Legesse",
    role: "Co-Founder & CEO",
    bio: "Builder of Aman Ethiopia. Passionate about unlocking Ethiopia's tourism potential through technology.",
    linkedin: "https://www.linkedin.com/in/mulubrhan-legesse/",
    portfolio: "https://v0-mulubrhan.vercel.app/",
    email: "legesse.mulubrhan@gmail.com",
    whatsapp: "+251708029422",
    initials: "ML",
  },
  {
    name: "Fitsum Getachew",
    role: "Co-Founder",
    bio: "Driving partnerships and growth at Aman Ethiopia. Committed to creating world-class travel experiences rooted in Ethiopian culture.",
    linkedin: "https://www.linkedin.com/in/fitsum-getachew/",
    portfolio: "",
    email: "fitsumgetachewtola@gmail.com",
    whatsapp: "+251709192541",
    initials: "FG",
  },
]

const marketEntryServices = [
  {
    icon: BarChart3,
    title: "Local Market Analysis",
    body: "In-depth research on the Ethiopian consumer landscape, competitive environment, demand patterns, and sector-specific opportunities — with a focus on fintech, hospitality, and trade.",
  },
  {
    icon: FileText,
    title: "Documentation Support",
    body: "End-to-end guidance on the paperwork required to operate in Ethiopia: business registration, tax identification, foreign investment permits, and sector-specific licenses.",
  },
  {
    icon: Scale,
    title: "Legal & Compliance Advisory",
    body: "Navigate Ethiopia's regulatory framework with confidence. We connect you with trusted local legal counsel and walk you through the compliance requirements for your industry.",
  },
  {
    icon: TrendingUp,
    title: "Cost & Financial Modeling",
    body: "Realistic cost-of-entry estimates — office setup, staffing, regulatory fees, and operational overhead — so you can plan your budget before committing capital.",
  },
  {
    icon: Shield,
    title: "Risk Assessment",
    body: "Candid analysis of market risks: currency exposure, regulatory uncertainty, infrastructure gaps, and cultural nuances that affect business outcomes.",
  },
  {
    icon: Rocket,
    title: "Scaling Strategy",
    body: "A phased growth roadmap tailored to your model — from pilot launch to national expansion — including local partnership identification and distribution channel mapping.",
  },
]

const premiumTiers = [
  {
    name: "Essential",
    price: "$99",
    badge: null,
    description: "Perfect for solo business travelers and short diplomatic visits.",
    includes: [
      "Airport pickup & drop-off",
      "3-night hotel booking (selected properties)",
      "Daily breakfast arrangement",
      "City orientation briefing",
      "24/7 WhatsApp support",
    ],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Business",
    price: "$199",
    badge: "Most Popular",
    description: "Ideal for corporate delegations and multi-day business trips.",
    includes: [
      "Everything in Essential",
      "Up to 5 nights premium accommodation",
      "Dedicated bilingual driver for the stay",
      "2 curated city or cultural experiences",
      "Meeting venue sourcing",
      "Local SIM card & data package",
    ],
    cta: "Book Business",
    highlight: true,
  },
  {
    name: "Executive",
    price: "$299",
    badge: "White Glove",
    description: "Full concierge service for executives and diplomatic delegations.",
    includes: [
      "Everything in Business",
      "Up to 7 nights luxury hotel",
      "Private guided trip (1–3 days)",
      "Personal concierge on-call throughout stay",
      "Restaurant reservations & private dining",
      "Custom itinerary built around your goals",
      "Post-trip summary & local contacts dossier",
    ],
    cta: "Book Executive",
    highlight: false,
  },
]

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PartnerWithUsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">

        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/90 to-primary py-24 text-primary-foreground">
          <div className="pointer-events-none absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1600')] bg-cover bg-center opacity-10" />
          <div className="container relative mx-auto max-w-4xl px-4 text-center">
            <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">For Businesses & Diplomats</Badge>
            <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              Partner with Aman Ethiopia
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-white/85 md:text-xl">
              Join Ethiopia's fastest-growing travel platform. Reach thousands of verified travelers, manage bookings effortlessly, and grow your business with tools built specifically for Ethiopian hospitality providers.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/provider/register">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold px-8">
                  Become a Partner
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="#contact">
                <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 px-8">
                  Talk to Our Team
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="border-b bg-muted/40 py-10">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
              {[
                { value: "500+", label: "Active Travelers" },
                { value: "50+", label: "Listed Properties" },
                { value: "4.8★", label: "Average Rating" },
                { value: "24/7", label: "Support" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl font-bold text-primary">{stat.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who can partner */}
        <section className="py-20">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold">Who We Partner With</h2>
              <p className="mt-3 text-muted-foreground">From boutique hotels to diplomatic travel coordinators</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {partnerTypes.map((type) => (
                <Card key={type.title} className="border-border/60 transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <type.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{type.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{type.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-muted/30 py-20">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold">Why Partner with Us?</h2>
              <p className="mt-3 text-muted-foreground">Built by Ethiopians, for the world</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map((b) => (
                <div key={b.title} className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <b.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{b.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{b.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20">
          <div className="container mx-auto max-w-3xl px-4">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold">How It Works</h2>
              <p className="mt-3 text-muted-foreground">Get listed and accepting bookings in minutes</p>
            </div>
            <div className="space-y-6">
              {[
                { step: "01", title: "Create Your Provider Account", body: "Sign up as a provider and complete your profile. No subscription fee to get started." },
                { step: "02", title: "List Your Services", body: "Add your hotel, tour, driver service, or guide profile with photos, pricing, and availability." },
                { step: "03", title: "Get Verified", body: "Our team reviews your listing and applies the Aman Verified badge, boosting traveler trust." },
                { step: "04", title: "Accept Bookings & Get Paid", body: "Receive booking requests, confirm them from your dashboard, and receive payouts directly." },
              ].map((item) => (
                <div key={item.step} className="flex gap-5">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  <div className="pt-1.5">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link href="/provider/register">
                <Button size="lg" className="px-10">
                  Start Your Application
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Contact / Founders */}
        <section id="contact" className="bg-muted/30 py-20">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold">Talk to the Founders</h2>
              <p className="mt-3 text-muted-foreground">
                We personally review every partnership inquiry. Reach out directly — we respond fast.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2">
              {founders.map((f) => (
                <Card key={f.name} className="overflow-hidden">
                  <CardContent className="p-6">
                    {/* Avatar */}
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

                    {/* Links */}
                    <div className="space-y-2">
                      {f.email && (
                        <a
                          href={`mailto:${f.email}`}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          {f.email}
                        </a>
                      )}
                      {f.linkedin && (
                        <a
                          href={f.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="h-4 w-4 flex-shrink-0" />
                          LinkedIn Profile
                        </a>
                      )}
                      {f.whatsapp && (
                        <a
                          href={`https://wa.me/${f.whatsapp.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <MessageCircle className="h-4 w-4 flex-shrink-0 text-[#25D366]" />
                          WhatsApp: {f.whatsapp}
                        </a>
                      )}
                      {f.portfolio && (
                        <a
                          href={f.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Globe className="h-4 w-4 flex-shrink-0" />
                          Portfolio
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Business card note */}
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Prefer a formal introduction? Ask us for our digital business card.
            </p>
          </div>
        </section>

        {/* ── Market Entry Advisory ── */}
        <section id="market-entry" className="py-20">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="mb-4 flex justify-center">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1">For Businesses Expanding to Ethiopia</Badge>
            </div>
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold">Ethiopia Market Entry Advisory</h2>
              <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
                Planning to enter the Ethiopian market — especially in fintech, hospitality, or trade? We provide the on-the-ground intelligence and connections you need to move from idea to operations with confidence.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
              {marketEntryServices.map((s) => (
                <div key={s.title} className="rounded-xl border bg-card p-5 hover:shadow-md transition-shadow">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-1.5 font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>

            {/* Callout */}
            <div className="rounded-2xl border bg-gradient-to-r from-primary/5 to-primary/10 p-8 text-center">
              <p className="text-lg font-semibold mb-2">Ready to explore the Ethiopian market?</p>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto text-sm">
                Book a free 30-minute discovery call with our founders. We'll help you understand what's realistic, what the path looks like, and how Aman Ethiopia can support your expansion.
              </p>
              <a href="#contact">
                <Button size="lg" className="px-8">
                  Book a Discovery Call
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* ── Premium Concierge Packages ── */}
        <section id="premium" className="bg-muted/30 py-20">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="mb-4 flex justify-center">
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 px-3 py-1">
                <Crown className="mr-1.5 h-3.5 w-3.5 inline" />
                Premium Concierge
              </Badge>
            </div>
            <div className="mb-4 text-center">
              <h2 className="text-3xl font-bold">We Arrange Everything. You Just Arrive.</h2>
              <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
                For diplomats, executives, and business delegations visiting Ethiopia. One flat fee — hotels, transport, experiences, and a personal concierge — all coordinated by our team so you can focus on what matters.
              </p>
            </div>

            {/* What's included visually */}
            <div className="mb-10 flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
              {[
                { icon: Hotel, label: "Hotel Booking" },
                { icon: Car, label: "Private Transport" },
                { icon: Compass, label: "Guided Experiences" },
                { icon: Sparkles, label: "Personal Concierge" },
              ].map((item) => (
                <span key={item.label} className="flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5">
                  <item.icon className="h-4 w-4 text-primary" />
                  {item.label}
                </span>
              ))}
            </div>

            {/* Pricing tiers */}
            <div className="grid gap-6 md:grid-cols-3">
              {premiumTiers.map((tier) => (
                <div
                  key={tier.name}
                  className={`relative flex flex-col rounded-2xl border p-6 transition-shadow hover:shadow-lg ${
                    tier.highlight
                      ? "border-primary bg-primary text-primary-foreground shadow-lg"
                      : "bg-card"
                  }`}
                >
                  {tier.badge && (
                    <span className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-semibold ${
                      tier.highlight ? "bg-white text-primary" : "bg-amber-400 text-amber-900"
                    }`}>
                      {tier.badge}
                    </span>
                  )}

                  <div className="mb-4">
                    <p className={`text-sm font-medium mb-1 ${tier.highlight ? "text-white/70" : "text-muted-foreground"}`}>
                      {tier.name}
                    </p>
                    <p className="text-4xl font-bold">{tier.price}</p>
                    <p className={`mt-1 text-sm ${tier.highlight ? "text-white/70" : "text-muted-foreground"}`}>
                      {tier.description}
                    </p>
                  </div>

                  <ul className="mb-6 flex-1 space-y-2">
                    {tier.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className={`mt-0.5 h-4 w-4 flex-shrink-0 ${tier.highlight ? "text-white/80" : "text-primary"}`} />
                        <span className={tier.highlight ? "text-white/90" : ""}>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <a href="#contact">
                    <Button
                      className={`w-full ${tier.highlight ? "bg-white text-primary hover:bg-white/90" : ""}`}
                      variant={tier.highlight ? "default" : "outline"}
                    >
                      {tier.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                </div>
              ))}
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              All packages are tailored to your schedule. Prices are indicative — final quote provided after a brief consultation.
            </p>
          </div>
        </section>

        {/* CTA strip */}
        <section className="bg-primary py-16 text-primary-foreground">
          <div className="container mx-auto max-w-3xl px-4 text-center">
            <h2 className="mb-4 text-3xl font-bold">Ready to Join Aman Ethiopia?</h2>
            <p className="mb-8 text-white/80">
              Hundreds of travelers discover Ethiopian hotels, tours, and experiences on our platform every month. Make sure yours is among them.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/provider/register">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold px-8">
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Get Listed Today
                </Button>
              </Link>
              <a href="#contact">
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 px-8">
                  Contact the Team
                </Button>
              </a>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
