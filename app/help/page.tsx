"use client"

import { useState } from "react"
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
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const categories = [
  { icon: Calendar, label: "Bookings", count: 12 },
  { icon: CreditCard, label: "Payments", count: 8 },
  { icon: Shield, label: "Safety", count: 6 },
  { icon: User, label: "Account", count: 10 },
  { icon: Building2, label: "Hosts", count: 9 },
]

const faqs = [
  {
    question: "How do I cancel my booking?",
    answer:
      "You can cancel your booking from the 'My Bookings' section in your dashboard. Select the booking you wish to cancel and click 'Request Cancellation'. Refund policies vary by property and are shown during booking.",
  },
  {
    question: "Is my payment secure?",
    answer:
      "Yes, all payments on AMAN are processed through secure, encrypted channels. We never store your full payment details. Your funds are held securely until after check-in to protect both travelers and hosts.",
  },
  {
    question: "How are properties verified?",
    answer:
      "Every property on AMAN undergoes a verification process including identity verification of hosts, on-site inspections where possible, and review of safety standards. Properties display verification badges indicating their trust level.",
  },
  {
    question: "What should I do in an emergency?",
    answer:
      "Use the Emergency Access button available on every page to contact our 24/7 support line. You can also call local emergency services. AMAN provides real-time location sharing for emergency responders.",
  },
  {
    question: "How do I become a verified host?",
    answer:
      "To become a verified host, complete your profile, verify your identity with government ID, add photos of your property, and pass our quality review. Visit the Provider Portal to start the verification process.",
  },
  {
    question: "Can I modify my booking after confirmation?",
    answer:
      "Modification requests should be made through the Messages feature to communicate directly with your host. The host can approve changes to dates or guest count. Some changes may affect pricing.",
  },
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero */}
      <section className="bg-background py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold">How can we help?</h1>
            <p className="mt-2 text-muted-foreground">Search our help center or browse topics below</p>
            <div className="relative mt-6">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-12 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12">
        <div className="container">
          <h2 className="mb-6 text-xl font-semibold">Browse by topic</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <Card key={category.label} className="cursor-pointer transition-all hover:border-primary">
                  <CardContent className="flex items-center gap-3 py-4">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{category.label}</p>
                      <p className="text-sm text-muted-foreground">{category.count} articles</p>
                    </div>
                    <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-12">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-xl font-semibold">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="rounded-lg border bg-background px-4">
                  <AccordionTrigger className="text-left hover:no-underline">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
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
            <Card>
              <CardContent className="flex flex-col items-center py-6 text-center">
                <div className="mb-3 rounded-full bg-primary/10 p-3">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Live Chat</h3>
                <p className="mt-1 text-sm text-muted-foreground">Chat with our support team</p>
                <Button variant="outline" size="sm" className="mt-4 bg-transparent">
                  Start Chat
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center py-6 text-center">
                <div className="mb-3 rounded-full bg-primary/10 p-3">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Call Us</h3>
                <p className="mt-1 text-sm text-muted-foreground">24/7 support available</p>
                <Button variant="outline" size="sm" className="mt-4 bg-transparent">
                  +251-911-AMAN
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center py-6 text-center">
                <div className="mb-3 rounded-full bg-primary/10 p-3">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Email</h3>
                <p className="mt-1 text-sm text-muted-foreground">We'll respond within 24h</p>
                <Button variant="outline" size="sm" className="mt-4 bg-transparent">
                  Send Email
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
