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
  MessageCircle,
} from "lucide-react"

// ─── Data ─────────────────────────────────────────────────────────────────────

const benefits = [
  {
    icon: Globe,
    title: "Reach Global Travelers",
    body: "Connect with thousands of international visitors, diplomats, and business travelers who use Algalle as their trusted platform for discovering and booking services across Ethiopia.",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Revenue",
    body: "Our platform handles discovery, booking logistics, and payment processing — so you focus on delivering great experiences while we bring you qualified bookings.",
  },
  {
    icon: Shield,
    title: "Verified & Trusted",
    body: "Every partner on Algalle goes through a verification process. Your listing carries our trust badge, signaling quality to every traveler.",
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
    bio: "Builder of Algalle. Passionate about unlocking Ethiopia's tourism potential through technology.",
    linkedin: "https://www.linkedin.com/in/mulubrhan-legesse/",
    portfolio: "https://v0-mulubrhan.vercel.app/",
    email: "legesse.mulubrhan@gmail.com",
    whatsapp: "+251708029422",
    initials: "ML",
  },
  {
    name: "Fitsum Getachew",
    role: "Co-Founder",
    bio: "Driving partnerships and growth at Algalle. Committed to creating world-class travel experiences rooted in Ethiopian culture.",
    linkedin: "https://www.linkedin.com/in/fitsum-getachew/",
    portfolio: "",
    email: "fitsumgetachewtola@gmail.com",
    whatsapp: "+251709192541",
    initials: "FG",
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
            <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">For Hotels, Guides & Transport</Badge>
            <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              Partner with Algalle
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-white/85 md:text-xl">
              Join Ethiopia's fastest-growing travel platform. Reach thousands of verified travelers, manage bookings effortlessly, and grow your business with tools built specifically for Ethiopian hospitality providers.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register?role=provider">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold px-8">
                  Become a Partner
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="#contact">
                <Button size="lg" variant="outline" className="border-white/50 bg-transparent text-white hover:bg-white/10 hover:text-white px-8">
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
              <h2 className="text-3xl font-bold">Why Partner with Algalle?</h2>
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
                { step: "03", title: "Get Verified", body: "Our team reviews your listing and applies the Algalle Verified badge, boosting traveler trust." },
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
              <Link href="/register?role=provider">
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
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Prefer a formal introduction? Ask us for our digital business card.
            </p>
          </div>
        </section>

        {/* Nudge toward Business & Diplomats */}
        <section className="py-16">
          <div className="container mx-auto max-w-3xl px-4 text-center">
            <Badge className="mb-4 bg-primary/10 text-primary">Expanding to Ethiopia?</Badge>
            <h2 className="text-2xl font-bold mb-3">Looking for Business or Diplomatic Services?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              From market entry advisory and document support to premium concierge packages for executives and diplomatic delegations — we have a dedicated offering for organizations.
            </p>
            <Link href="/business">
              <Button size="lg" variant="outline" className="px-8 bg-transparent">
                View Business & Diplomat Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* CTA strip */}
        <section className="bg-primary py-16 text-primary-foreground">
          <div className="container mx-auto max-w-3xl px-4 text-center">
            <h2 className="mb-4 text-3xl font-bold">Ready to Join Algalle?</h2>
            <p className="mb-8 text-white/80">
              Hundreds of travelers discover Ethiopian hotels, tours, and experiences on our platform every month. Make sure yours is among them.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register?role=provider">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold px-8">
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Get Listed Today
                </Button>
              </Link>
              <a href="#contact">
                <Button size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white px-8">
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
