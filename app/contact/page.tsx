"use client"

import { useState } from "react"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Loader2, Mail, MessageCircle, Phone } from "lucide-react"
import { submitInquiry } from "@/lib/api/inquiries"
import { friendlyError } from "@/lib/utils/errors"

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", email: "", message: "", company_website: "" })

  const handleSubmit = async () => {
    setError(null)
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please fill in your name, email, and message.")
      return
    }
    setSubmitting(true)
    try {
      await submitInquiry({ ...form, inquiry_type: "general" })
      setSubmitted(true)
    } catch (err) {
      setError(friendlyError(err, "We couldn't send your message. Please try again or email us directly."))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary/5 to-background py-12">
          <div className="container mx-auto max-w-2xl px-4 text-center">
            <h1 className="text-3xl font-bold md:text-4xl">Contact Us</h1>
            <p className="mt-3 text-muted-foreground">
              Questions, feedback, or help with a booking — we respond within 24 hours.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto grid max-w-4xl gap-8 px-4 md:grid-cols-3">
            {/* Direct channels */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">24/7 Support</p>
                  <a href="tel:+251708029422" className="text-sm text-muted-foreground hover:text-foreground">
                    +251 708 029 422
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Email</p>
                  <a href="mailto:team@yichalal.ai" className="text-sm text-muted-foreground hover:text-foreground">
                    team@yichalal.ai
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageCircle className="mt-0.5 h-5 w-5 text-[#25D366]" />
                <div>
                  <p className="font-medium">WhatsApp</p>
                  <a
                    href="https://wa.me/251708029422"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    +251 708 029 422
                  </a>
                </div>
              </div>
            </div>

            {/* Form */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>It lands directly in the founders&apos; inboxes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {submitted ? (
                  <div className="py-8 text-center">
                    <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-600" />
                    <p className="text-lg font-semibold">Message sent!</p>
                    <p className="mt-1 text-sm text-muted-foreground">We&apos;ll get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <>
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    {/* Honeypot */}
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      className="hidden"
                      value={form.company_website}
                      onChange={(e) => setForm((p) => ({ ...p, company_website: e.target.value }))}
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          placeholder="Your name"
                          value={form.name}
                          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="How can we help?"
                        className="min-h-[120px]"
                        value={form.message}
                        onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                      />
                    </div>
                    <Button className="w-full" size="lg" onClick={handleSubmit} disabled={submitting}>
                      {submitting ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending…</>
                      ) : (
                        <><Mail className="mr-2 h-5 w-5" /> Send Message</>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
