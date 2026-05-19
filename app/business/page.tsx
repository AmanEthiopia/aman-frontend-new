"use client"

import Link from "next/link"
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
  Phone,
  Mail,
  Star,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FEATURES } from "@/lib/config/features"

const benefits = [
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
      "AMAN has transformed how we manage travel for our 200+ staff. The centralized booking and compliance features are invaluable.",
    rating: 5,
  },
  {
    name: "UN Ethiopia Office",
    role: "Operations Manager",
    quote: "The security verification and 24/7 support give us confidence when booking accommodations across Ethiopia.",
    rating: 5,
  },
]

export default function BusinessPage() {
  if (!FEATURES.BUSINESS_MODE) {
    return (
      <div className="container py-24 text-center">
        <Building2 className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Business Portal</h1>
        <p className="mt-2 text-muted-foreground">
          Corporate and diplomatic travel solutions. Contact us to get early access.
        </p>
        <Link href="/" className="mt-6 inline-block">
          <Button>Return Home</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/10 to-background py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              For Organizations & Diplomats
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Travel Management for <span className="text-primary">Ethiopia</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Streamlined corporate travel, diplomatic accommodations, and NGO logistics. Verified properties,
              centralized billing, and 24/7 priority support.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg">
                Request Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent">
                <Phone className="mr-2 h-5 w-5" />
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">Enterprise-Grade Features</h2>
            <p className="mt-2 text-muted-foreground">Everything your organization needs for safe, efficient travel</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon
              return (
                <Card key={benefit.title}>
                  <CardContent className="pt-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">{benefit.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="border-y bg-muted/30 py-16">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <Badge className="mb-4 bg-green-600">Security First</Badge>
              <h2 className="text-3xl font-bold">Trusted by Leading Organizations</h2>
              <p className="mt-4 text-muted-foreground">
                AMAN provides verified accommodations with enhanced security protocols for diplomatic missions,
                international organizations, and corporate travelers.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "All properties undergo rigorous verification",
                  "24/7 emergency support line for all business travelers",
                  "Secure communication channels with property hosts",
                  "Real-time location sharing during emergencies",
                  "Compliance with international travel safety standards",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              {testimonials.map((testimonial, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="mb-3 flex items-center gap-1">
                      {Array.from({ length: testimonial.rating }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm italic">"{testimonial.quote}"</p>
                    <div className="mt-4">
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl">
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Get Started</CardTitle>
                <CardDescription>
                  Tell us about your organization's travel needs and we'll create a customized solution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input id="name" placeholder="John Smith" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Work Email</Label>
                    <Input id="email" type="email" placeholder="john@organization.org" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="org">Organization</Label>
                    <Input id="org" placeholder="Organization name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Organization Type</Label>
                    <select id="type" className="w-full rounded-md border p-2">
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
                  <select id="travelers" className="w-full rounded-md border p-2">
                    <option value="">Select range...</option>
                    <option value="1-10">1-10 travelers</option>
                    <option value="11-50">11-50 travelers</option>
                    <option value="51-200">51-200 travelers</option>
                    <option value="200+">200+ travelers</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Tell us about your needs</Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your travel requirements, destinations, and any specific needs..."
                    className="min-h-[100px]"
                  />
                </div>
                <Button className="w-full" size="lg">
                  <Mail className="mr-2 h-5 w-5" />
                  Submit Inquiry
                </Button>
                <p className="text-center text-sm text-muted-foreground">Our team will respond within 24 hours</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
