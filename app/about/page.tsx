import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { Shield, Heart, Globe, Users, Sparkles, Building2 } from "lucide-react"
import Link from "next/link"

const values = [
  {
    icon: Shield,
    title: "Trust & Verification",
    description:
      "Every hotel, experience, and transport provider is verified through AI photo verification and manual review before appearing on our platform.",
  },
  {
    icon: Heart,
    title: "Local Expertise",
    description:
      "We combine deep local knowledge with modern technology to provide the most relevant and helpful recommendations for Ethiopia.",
  },
  {
    icon: Globe,
    title: "Ethiopian Pride",
    description:
      "We're proud to showcase the beauty and hospitality of Ethiopia to locals, diaspora, and international travelers alike.",
  },
  {
    icon: Users,
    title: "Community First",
    description:
      "We work closely with local hotels, tour operators, and businesses to build a thriving ecosystem that benefits everyone.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Intelligence",
    description:
      "Our AI Travel Planner learns your preferences to deliver personalized itineraries, safety notes, and honest recommendations.",
  },
  {
    icon: Building2,
    title: "Yichalal Family",
    description:
      "Alga Ale is a proud initiative of the Yichalal Family — committed to building trusted digital infrastructure for Ethiopia.",
  },
]

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                A Yichalal Family Initiative
              </span>
              <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
                About Alga Ale
                <span className="ml-3 font-serif text-muted-foreground">አልጋ አለ</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Travel & Local Intelligence — Ethiopia&apos;s trust-first platform for verified hotels, experiences, and transport.
              </p>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-6 text-2xl font-bold">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Alga Ale (አልጋ አለ) — meaning "there is a bed" — was born from a simple but persistent frustration:
                  finding reliable, verified travel information in Ethiopia was harder than it should be. Whether
                  you&apos;re a local planning a domestic getaway, a member of the diaspora visiting family, or an
                  international traveler discovering Ethiopia for the first time, the lack of transparent and
                  trustworthy information made every booking feel like a gamble.
                </p>
                <p>
                  As a Yichalal Family Initiative, we set out to change that. Alga Ale is a trust-first travel
                  platform that connects locals, diaspora, and foreign travelers with verified hotels, experiences,
                  and transport across Ethiopia. We combine rigorous verification — including AI photo verification
                  and manual team reviews — with an AI-powered travel planner to make every trip simpler, safer,
                  and more memorable.
                </p>
                <p>
                  Starting in Addis Ababa and expanding across the country, we&apos;re building a comprehensive
                  platform that showcases the incredible hospitality Ethiopia has to offer — from budget-friendly
                  guesthouses in Lalibela to world-class luxury hotels in the capital, authentic restaurant
                  experiences, and handcrafted cultural tours.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-2xl font-bold">Our Values</h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {values.map((value) => (
                <div key={value.title} className="rounded-xl border border-border bg-card p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Legal Links */}
        <section className="border-t border-border py-12">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 text-xl font-semibold">Policies & Guidelines</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                We believe in full transparency about how we operate and protect your data.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/privacy"
                  className="rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium transition-shadow hover:shadow-md"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium transition-shadow hover:shadow-md"
                >
                  Terms of Service
                </Link>
                <Link
                  href="/safety"
                  className="rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium transition-shadow hover:shadow-md"
                >
                  Safety Guidelines
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 text-2xl font-bold">Get In Touch</h2>
              <p className="mb-6 text-muted-foreground">
                Have questions, suggestions, or want to partner with us? We&apos;d love to hear from you.
              </p>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <a
                  href="mailto:team@yichalal.ai"
                  className="rounded-lg border border-border bg-card px-6 py-3 font-medium transition-shadow hover:shadow-lg"
                >
                  team@yichalal.ai
                </a>
                <a
                  href="tel:+251708029422"
                  className="rounded-lg border border-border bg-card px-6 py-3 font-medium transition-shadow hover:shadow-lg"
                >
                  +251 708 029 422
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
