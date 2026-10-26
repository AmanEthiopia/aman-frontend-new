"use client"

import { useMemo, useRef, useState } from "react"
import {
  Search,
  MessageSquare,
  Phone,
  Mail,
  ChevronRight,
  Shield,
  Calendar,
  CreditCard,
  User,
  Building2,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { FloatingAIAssistant } from "@/components/ai/floating-assistant"
import { useApp } from "@/lib/contexts/app-context"
import Link from "next/link"

// General contact channels
const SUPPORT_EMAIL = "team@yichalal.ai"
const SUPPORT_WHATSAPP = "251708029422" // wa.me format (no +)

interface Article {
  q: string
  a: string
}

interface Topic {
  id: string
  label: string
  icon: typeof Calendar
  blurb: string
  articles: Article[]
}

const topics: Topic[] = [
  {
    id: "bookings",
    label: "Bookings",
    icon: Calendar,
    blurb: "Making, changing, and cancelling bookings",
    articles: [
      {
        q: "How do I make a booking?",
        a: "Open any hotel, experience, guide, or transport listing and pick your dates (and room or option where relevant), then tap “Book.” Add your guest details and submit the request. The provider reviews it and confirms — you'll get a notification and it appears under My Bookings.",
      },
      {
        q: "Why is my booking “pending”?",
        a: "Bookings start as Pending until the provider accepts them. This protects you from paying for something that isn't available. Most providers respond quickly; if a request sits too long, message them or pick another verified option.",
      },
      {
        q: "How do I cancel or modify a booking?",
        a: "Go to My Bookings, open the booking, and choose Request Cancellation or message the provider to change dates or guest count. Cancellation and refund terms are shown on each listing before you book, since they vary by provider.",
      },
      {
        q: "Will my bookings show in my itinerary?",
        a: "Yes — every booking you request is automatically added to your trip itinerary on the booked date, so your whole trip stays in one place under My Itinerary.",
      },
    ],
  },
  {
    id: "payments",
    label: "Payments",
    icon: CreditCard,
    blurb: "Prices, payments, and refunds",
    articles: [
      {
        q: "How and when do I pay?",
        a: "For most listings you arrange payment with the provider once your booking is confirmed — prices are shown clearly per listing in USD and/or ETB. Always confirm the amount and method with the provider before you travel, and keep everything inside Algalle so we can help if anything goes wrong.",
      },
      {
        q: "Is it safe to pay?",
        a: "Only pay confirmed, verified listings and keep communication on the platform. Be cautious of anyone pushing you to pay off-platform or to a personal account before confirmation — that's a common scam signal. If something feels off, contact us before paying.",
      },
      {
        q: "How do refunds work?",
        a: "Refunds follow the cancellation policy shown on the listing at the time of booking. If a provider cancels on you or a listing wasn't as described, reach out to our team and we'll help sort it out.",
      },
      {
        q: "What does the Algalle commission mean for me as a traveler?",
        a: "Nothing extra — providers receive your payment directly and remit a small commission to Algalle. The price you see is the price you pay the provider.",
      },
    ],
  },
  {
    id: "safety",
    label: "Safety",
    icon: Shield,
    blurb: "Staying safe and reporting issues",
    articles: [
      {
        q: "How do you keep listings trustworthy?",
        a: "Listings can request verification, and our team reviews them before granting the Verified badge. Prefer Verified listings, read recent reviews, and check the map location before booking.",
      },
      {
        q: "What should I do in an emergency?",
        a: "For any immediate danger, contact local emergency services first — Police 991, Ambulance 907. Then reach our 24/7 support so we can assist and coordinate.",
      },
      {
        q: "How do I report a provider or listing?",
        a: "If a listing feels unsafe, misleading, or inconsistent with what's advertised, use the share/report options or contact our team with the listing name and details. Your report helps protect other travelers.",
      },
      {
        q: "Any general safety tips for Ethiopia?",
        a: "Keep your plans and key details in your itinerary, share your location with someone you trust, agree prices and pickup points in advance (especially for transport), and keep bookings and chats on the platform so there's a record.",
      },
    ],
  },
  {
    id: "account",
    label: "Account",
    icon: User,
    blurb: "Sign in, profile, and settings",
    articles: [
      {
        q: "How do I create an account or sign in?",
        a: "Tap Register to sign up with your email (you'll verify it with a code) or continue with Google. Already have an account? Use Sign In. Travelers land on their dashboard; providers land on the provider dashboard.",
      },
      {
        q: "How do I reset my password?",
        a: "On the Sign In page choose “Forgot password,” enter your email, and we'll send a reset code. Enter the code and set a new password.",
      },
      {
        q: "How do I update my profile or preferences?",
        a: "Go to Settings to update your name, photo, phone, language, and currency. Your preferences (like USD/ETB) follow you across the site.",
      },
      {
        q: "How do I switch between traveler and provider?",
        a: "Provider features live in the Provider dashboard. If you want to list a hotel, restaurant, trip, guide, or transport service, head to “Partner With Us” to get started.",
      },
    ],
  },
  {
    id: "hosts",
    label: "Hosts",
    icon: Building2,
    blurb: "Listing and managing your services",
    articles: [
      {
        q: "How do I list my property or service?",
        a: "Create a provider account, then add your hotel, restaurant, trip, guide, or transport listing with photos, pricing, and a map location. Publish it when you're ready to receive bookings — there's no fee to get listed.",
      },
      {
        q: "How do I get verified?",
        a: "Once your listing is published, use the “Request Verification” button on the listing. Our team reviews it and applies the Verified badge, which builds traveler trust and earns you more bookings.",
      },
      {
        q: "How do payouts and commission work for providers?",
        a: "Guests pay you directly. You keep your revenue and remit Algalle's commission on a schedule that suits you (weekly, bi-weekly, or monthly). Your Earnings page shows gross revenue, commission owed, and net earnings.",
      },
      {
        q: "How do I add photos, cities, or a day-by-day itinerary?",
        a: "Open your listing in the provider dashboard. Hotels, restaurants, trips, and drivers support photo uploads; trips also have a Daily Itinerary editor where you add days, activities, and per-day photos that travelers see before they join.",
      },
    ],
  },
]

// Frequently asked questions (also searchable)
const faqs: Article[] = [
  {
    q: "How do I cancel my booking?",
    a: "Open the booking under My Bookings and choose Request Cancellation. Refund terms vary by provider and are shown on the listing at the time you book.",
  },
  {
    q: "Is my payment secure?",
    a: "Keep payments and chats on Algalle and only pay confirmed, verified listings. Be wary of anyone asking you to pay off-platform before your booking is confirmed.",
  },
  {
    q: "How are listings verified?",
    a: "Providers request verification and our team reviews each listing before granting the Verified badge. Look for the badge and recent reviews when choosing.",
  },
  {
    q: "What should I do in an emergency?",
    a: "Contact local emergency services first (Police 991, Ambulance 907), then reach our 24/7 support so we can help and coordinate.",
  },
  {
    q: "How do I become a host?",
    a: "Create a provider account and add your hotel, restaurant, trip, guide, or transport listing — then publish it and request verification. See “Partner With Us.”",
  },
  {
    q: "Can I modify my booking after confirmation?",
    a: "Yes — message the provider through Messages to change dates or guest count. They can approve changes, and some changes may affect pricing.",
  },
]

// Flatten for search (topics + FAQs)
const allArticles: (Article & { topic: string; topicId: string })[] = [
  ...topics.flatMap((t) => t.articles.map((a) => ({ ...a, topic: t.label, topicId: t.id }))),
  ...faqs.map((a) => ({ ...a, topic: "FAQ", topicId: "faq" })),
]

export default function HelpPage() {
  const { setIsAIAssistantOpen } = useApp()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTopic, setSelectedTopic] = useState<string>("bookings")
  const articlesRef = useRef<HTMLDivElement>(null)

  const query = searchQuery.trim().toLowerCase()

  const searchResults = useMemo(() => {
    if (!query) return []
    return allArticles.filter(
      (a) =>
        a.q.toLowerCase().includes(query) ||
        a.a.toLowerCase().includes(query) ||
        a.topic.toLowerCase().includes(query),
    )
  }, [query])

  const activeTopic = topics.find((t) => t.id === selectedTopic) ?? topics[0]

  const selectTopic = (id: string) => {
    setSearchQuery("")
    setSelectedTopic(id)
    setTimeout(() => articlesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        {/* Hero + Search */}
        <section className="bg-background py-16">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-3xl font-bold">How can we help?</h1>
              <p className="mt-2 text-muted-foreground">Search our help center or browse topics below</p>
              <div className="relative mt-6">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search for help (e.g. cancel booking, refund, verify)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 pl-12 text-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Search results */}
        {query ? (
          <section className="py-12">
            <div className="container">
              <div className="mx-auto max-w-3xl">
                <h2 className="mb-6 text-xl font-semibold">
                  {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
                </h2>
                {searchResults.length === 0 ? (
                  <Card>
                    <CardContent className="py-10 text-center">
                      <p className="font-medium">No articles matched your search.</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Try different words, browse the topics, or contact our team below.
                      </p>
                      <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setSearchQuery("")}>
                        Browse all topics
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Accordion type="single" collapsible className="space-y-2">
                    {searchResults.map((a, i) => (
                      <AccordionItem key={i} value={`r-${i}`} className="rounded-lg border bg-background px-4">
                        <AccordionTrigger className="text-left hover:no-underline">
                          <span className="flex items-center gap-2">
                            {a.q}
                            <Badge variant="secondary" className="ml-1 text-[10px]">{a.topic}</Badge>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">{a.a}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* Browse by topic */}
            <section className="py-12">
              <div className="container">
                <h2 className="mb-6 text-xl font-semibold">Browse by topic</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  {topics.map((topic) => {
                    const Icon = topic.icon
                    const isActive = topic.id === selectedTopic
                    return (
                      <Card
                        key={topic.id}
                        onClick={() => selectTopic(topic.id)}
                        className={`cursor-pointer transition-all hover:border-primary ${isActive ? "border-primary ring-1 ring-primary/30" : ""}`}
                      >
                        <CardContent className="flex items-center gap-3 py-4">
                          <div className="rounded-lg bg-primary/10 p-2">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium">{topic.label}</p>
                            <p className="text-sm text-muted-foreground">{topic.articles.length} articles</p>
                          </div>
                          <ChevronRight className={`ml-auto h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </section>

            {/* Selected topic articles */}
            <section className="py-4 pb-12" ref={articlesRef}>
              <div className="container">
                <div className="mx-auto max-w-3xl">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <activeTopic.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{activeTopic.label}</h2>
                      <p className="text-sm text-muted-foreground">{activeTopic.blurb}</p>
                    </div>
                  </div>
                  <Accordion type="single" collapsible className="space-y-2">
                    {activeTopic.articles.map((a, i) => (
                      <AccordionItem key={i} value={`a-${i}`} className="rounded-lg border bg-background px-4">
                        <AccordionTrigger className="text-left hover:no-underline">{a.q}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">{a.a}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            </section>
          </>
        )}

        {/* FAQs */}
        <section id="faq" className="scroll-mt-20 py-12">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-6 text-xl font-semibold">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="space-y-2">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`} className="rounded-lg border bg-background px-4">
                    <AccordionTrigger className="text-left hover:no-underline">{faq.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Contact Options */}
        <section className="py-12">
          <div className="container">
            <h2 className="mb-6 text-center text-xl font-semibold">Still need help?</h2>
            <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-3">
              {/* Live chat -> Algalle AI */}
              <Card>
                <CardContent className="flex flex-col items-center py-6 text-center">
                  <div className="mb-3 rounded-full bg-primary/10 p-3">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Live Chat</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Ask the Algalle AI assistant</p>
                  <Button size="sm" className="mt-4" onClick={() => setIsAIAssistantOpen(true)}>
                    Start Chat
                  </Button>
                </CardContent>
              </Card>

              {/* Call us -> WhatsApp */}
              <Card>
                <CardContent className="flex flex-col items-center py-6 text-center">
                  <div className="mb-3 rounded-full bg-primary/10 p-3">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Call / WhatsApp</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Chat with us on WhatsApp</p>
                  <Button variant="outline" size="sm" className="mt-4 bg-transparent" asChild>
                    <a
                      href={`https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent("Hi Algalle, I need some help with...")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Message on WhatsApp
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* Email -> contact/message form */}
              <Card>
                <CardContent className="flex flex-col items-center py-6 text-center">
                  <div className="mb-3 rounded-full bg-primary/10 p-3">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="mt-1 text-sm text-muted-foreground">We&apos;ll respond within 24h</p>
                  <Button variant="outline" size="sm" className="mt-4 bg-transparent" asChild>
                    <Link href="/contact">
                      Send a message
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Or email us directly at{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
                {SUPPORT_EMAIL}
              </a>
            </p>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingAIAssistant />
    </div>
  )
}
