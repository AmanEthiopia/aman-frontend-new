import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { Shield, AlertTriangle, Phone, MapPin, Users, Eye } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Safety Guidelines — Alga Ale",
  description: "How Alga Ale keeps travelers safe and what to do in an emergency.",
}

const guidelines = [
  {
    icon: Shield,
    title: "Verified Listings Only",
    description:
      "Every hotel, restaurant, and transport provider on Alga Ale is manually reviewed and verified by our team. Look for the Verified badge on listings — it means we have physically checked or thoroughly vetted the property.",
  },
  {
    icon: Eye,
    title: "AI Photo Verification",
    description:
      "Our AI cross-checks provider-submitted photos against independent sources to flag misrepresentation. If photos look inconsistent with reviews or our findings, the listing is held pending re-verification.",
  },
  {
    icon: MapPin,
    title: "Know Your Location",
    description:
      "Always save the address and emergency contacts for your accommodation before arrival. Share your itinerary with a trusted person at home. Use our AI Travel Planner's area safety notes for neighbourhood-level guidance.",
  },
  {
    icon: Users,
    title: "Trust Your Gut",
    description:
      "If a situation feels unsafe — whether at an accommodation, during transport, or on a tour — remove yourself immediately. No booking is worth your personal safety. Contact our 24/7 support line and we will assist you.",
  },
  {
    icon: AlertTriangle,
    title: "Report Issues Immediately",
    description:
      "If a provider behaves in a way that feels unsafe, illegal, or grossly inconsistent with their listing, report it via the platform's Report button or email safety@algaale.com. Your report helps protect future travelers.",
  },
  {
    icon: Phone,
    title: "Emergency Contacts",
    description:
      "Keep these numbers saved: Ethiopian Police 991 · Ambulance 907 · Alga Ale 24/7 Support +251 91 123 4567. In a life-threatening emergency, always contact local authorities first.",
  },
]

export default function SafetyGuidelinesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary/5 to-background py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                Your Safety
              </span>
              <h1 className="mb-4 text-4xl font-bold tracking-tight">Safety Guidelines</h1>
              <p className="text-muted-foreground">
                Alga Ale is built on trust. Here is how we protect you — and how you can stay safe while travelling in Ethiopia.
              </p>
            </div>
          </div>
        </section>

        {/* Emergency Banner */}
        <div className="bg-destructive/10 border-y border-destructive/20">
          <div className="container mx-auto px-4 py-4">
            <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <span className="font-medium text-destructive">Emergency Numbers</span>
              </div>
              <div className="flex flex-wrap gap-6 text-sm">
                <span><strong>Police:</strong> 991</span>
                <span><strong>Ambulance:</strong> 907</span>
                <span><strong>Alga Ale 24/7:</strong> +251 91 123 4567</span>
              </div>
            </div>
          </div>
        </div>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">

              {/* Guidelines Grid */}
              <div className="grid gap-6 sm:grid-cols-2">
                {guidelines.map((item) => (
                  <div key={item.title} className="rounded-xl border border-border bg-card p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mb-2 font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>

              {/* Alga Ale Safety Promise */}
              <div className="mt-10 rounded-xl border border-primary/30 bg-primary/5 p-6">
                <div className="flex items-start gap-4">
                  <Shield className="mt-1 h-6 w-6 shrink-0 text-primary" />
                  <div>
                    <h2 className="mb-2 text-lg font-semibold text-foreground">The Alga Ale Safety Promise</h2>
                    <p className="text-sm text-muted-foreground">
                      If a booking fails, a provider behaves dishonestly, or something goes wrong through no fault
                      of yours — <strong className="text-foreground">Alga Ale steps in</strong>. We operate a
                      Dispute Resolution Centre to investigate issues, mediate with providers, and where possible
                      facilitate refunds or alternative arrangements. You are never alone on your journey.
                    </p>
                  </div>
                </div>
              </div>

              {/* Traveler Responsibility */}
              <div className="mt-8 space-y-4 text-sm leading-relaxed text-muted-foreground">
                <h2 className="text-xl font-semibold text-foreground">Traveler Responsibilities</h2>
                <p>
                  While Alga Ale works hard to verify every provider on our platform, travel inherently involves
                  some degree of personal responsibility. We ask that all travelers:
                </p>
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>Read provider listings, policies, and reviews before booking.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>Ensure they hold appropriate travel insurance for their trip to Ethiopia.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>Check current travel advisories issued by their home country's government.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>Respect local customs, laws, and the natural environment of Ethiopia.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>
                      Report any safety concerns promptly via{" "}
                      <a href="mailto:safety@algaale.com" className="text-primary hover:underline">
                        safety@algaale.com
                      </a>
                      .
                    </span>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div className="mt-8 rounded-lg border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">
                  Non-emergency safety questions or provider reports:{" "}
                  <a href="mailto:safety@algaale.com" className="text-primary hover:underline">
                    safety@algaale.com
                  </a>
                  {" "}·{" "}
                  24/7 phone:{" "}
                  <a href="tel:+251911234567" className="text-primary hover:underline">
                    +251 91 123 4567
                  </a>
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-4 border-t border-border pt-8">
                <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                <span className="text-border">·</span>
                <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
                <span className="text-border">·</span>
                <Link href="/about" className="text-primary hover:underline">About Alga Ale</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
