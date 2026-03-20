import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { Shield, Heart, Globe, Users } from "lucide-react"

const values = [
  {
    icon: Shield,
    title: "Trust & Verification",
    description:
      "Every hotel on our platform is personally verified by our team to ensure accuracy and quality for our users.",
  },
  {
    icon: Heart,
    title: "Local Expertise",
    description:
      "We combine deep local knowledge with modern technology to provide the most relevant and helpful recommendations.",
  },
  {
    icon: Globe,
    title: "Ethiopian Pride",
    description: "We're proud to showcase the beauty and hospitality of Ethiopia to travelers from around the world.",
  },
  {
    icon: Users,
    title: "Community First",
    description:
      "We work closely with hotels and local businesses to create a thriving ecosystem that benefits everyone.",
  },
]

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">About ALGA-ALLE</h1>
              <p className="text-lg text-muted-foreground">
                Building trust in Ethiopian hospitality, one verified hotel at a time.
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
                  ALGA-ALLE (አልጋ አለ) was born from a simple observation: finding reliable, trustworthy hotel information
                  in Ethiopia was unnecessarily difficult. Whether you&apos;re an Ethiopian planning a domestic trip or
                  an international visitor exploring our beautiful country, the lack of verified, transparent
                  information made booking accommodations a stressful experience.
                </p>
                <p>
                  We set out to change that. Our platform combines the best of local knowledge with modern technology to
                  create a hotel discovery experience that travelers can trust. Every hotel on our platform is verified
                  by our team, prices are transparent, and our AI assistant is always ready to help you find the perfect
                  stay.
                </p>
                <p>
                  Starting with Addis Ababa and expanding across Ethiopia, we&apos;re building a comprehensive platform
                  that showcases the incredible hospitality our country has to offer — from budget-friendly guesthouses
                  to world-class luxury hotels.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-2xl font-bold">Our Values</h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => (
                <div key={value.title} className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              ))}
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
                  href="mailto:info@algaalle.com"
                  className="rounded-lg border border-border bg-card px-6 py-3 font-medium transition-shadow hover:shadow-lg"
                >
                  info@algaalle.com
                </a>
                <a
                  href="tel:+251911234567"
                  className="rounded-lg border border-border bg-card px-6 py-3 font-medium transition-shadow hover:shadow-lg"
                >
                  +251 91 123 4567
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
