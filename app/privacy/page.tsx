import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"

export const metadata = {
  title: "Privacy Policy — Algalle",
  description: "How Algalle collects, uses, and protects your personal data.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary/5 to-background py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                Legal
              </span>
              <h1 className="mb-4 text-4xl font-bold tracking-tight">Privacy Policy</h1>
              <p className="text-muted-foreground">
                Last updated: June 2026 &nbsp;·&nbsp; Algalle, a Yichalal Family Initiative
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl space-y-10 text-sm leading-relaxed text-muted-foreground">

              <div>
                <h2 className="mb-3 text-xl font-semibold text-foreground">1. Who We Are</h2>
                <p>
                  Algalle (አልጋ አለ) is a travel and local intelligence platform operated by the Yichalal Family
                  Initiative. We connect locals, diaspora, and foreign travelers with verified hotels, experiences,
                  and transport across Ethiopia. References to <strong className="text-foreground">"Algalle," "we," "us,"</strong> or{" "}
                  <strong className="text-foreground">"our"</strong> in this policy refer to this entity.
                </p>
                <p className="mt-2">
                  For questions about this policy, contact us at{" "}
                  <a href="mailto:privacy@algalle.com" className="text-primary hover:underline">
                    privacy@algalle.com
                  </a>
                  .
                </p>
              </div>

              <div>
                <h2 className="mb-3 text-xl font-semibold text-foreground">2. What Data We Collect</h2>
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>
                      <strong className="text-foreground">Account Information:</strong> Name, email address, phone
                      number, and password when you register a profile.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>
                      <strong className="text-foreground">Travel Preferences:</strong> Budget, travel dates,
                      interests, dietary restrictions, and accessibility needs used to power our AI Travel Planner.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>
                      <strong className="text-foreground">Booking History:</strong> Records of hotels, experiences,
                      and transport you have booked or inquired about through the platform.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>
                      <strong className="text-foreground">Payment Data:</strong> We do not store raw card numbers.
                      Payments are processed via Telebirr, CBE Birr, or Stripe. We retain transaction references
                      and amounts for booking records.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>
                      <strong className="text-foreground">Usage Data:</strong> Pages visited, search queries, and
                      interaction patterns, collected via cookies and analytics to improve the platform.
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="mb-3 text-xl font-semibold text-foreground">3. How We Use Your Data</h2>
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>To process and confirm bookings with verified providers.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>To power our AI Travel Planner with personalized itineraries and recommendations.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>To send transactional communications (booking confirmations, reminders, support).</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>
                      To improve platform safety and quality through anonymous aggregated analytics.
                    </span>
                  </li>
                </ul>
                <p className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-primary">
                  <strong>We will never sell your personal data to third-party advertisers.</strong> Your data is
                  used solely to serve you on the Algalle platform.
                </p>
              </div>

              <div>
                <h2 className="mb-3 text-xl font-semibold text-foreground">4. Data Sharing</h2>
                <p>
                  We share minimal data with third parties only as required to operate the service:
                </p>
                <ul className="mt-2 space-y-2">
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>
                      <strong className="text-foreground">Verified Providers:</strong> Your name, contact detail,
                      and booking specifics are shared with the hotel, tour operator, or transport provider you book.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>
                      <strong className="text-foreground">Payment Processors:</strong> Stripe, Telebirr, and CBE
                      Birr receive payment details under their own privacy policies.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>
                      <strong className="text-foreground">Legal Obligations:</strong> We may disclose data when
                      required by Ethiopian law or a competent legal authority.
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="mb-3 text-xl font-semibold text-foreground">5. Data Retention</h2>
                <p>
                  We retain your account data for as long as your account is active, or as required by applicable
                  law. Booking records are retained for 5 years for financial compliance. You may request deletion
                  of your account at any time by emailing{" "}
                  <a href="mailto:privacy@algalle.com" className="text-primary hover:underline">
                    privacy@algalle.com
                  </a>
                  .
                </p>
              </div>

              <div>
                <h2 className="mb-3 text-xl font-semibold text-foreground">6. Your Rights</h2>
                <p>
                  In accordance with <strong className="text-foreground">GDPR, POPIA, and NDPR</strong>, you have the
                  right to:
                </p>
                <ul className="mt-2 space-y-2">
                  <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /><span>Access the personal data we hold about you.</span></li>
                  <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /><span>Request correction of inaccurate data.</span></li>
                  <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /><span>Request deletion of your data ("right to be forgotten").</span></li>
                  <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /><span>Object to or restrict how we process your data.</span></li>
                  <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /><span>Receive a portable copy of your data.</span></li>
                </ul>
                <p className="mt-2">
                  Submit requests to{" "}
                  <a href="mailto:privacy@algalle.com" className="text-primary hover:underline">
                    privacy@algalle.com
                  </a>
                  . We respond within 30 days.
                </p>
              </div>

              <div>
                <h2 className="mb-3 text-xl font-semibold text-foreground">7. Cookies</h2>
                <p>
                  We use essential cookies to keep you signed in and functional cookies to remember your language
                  and currency preferences. Analytics cookies (aggregated, anonymised) help us improve the
                  platform. You may disable non-essential cookies in your browser settings.
                </p>
              </div>

              <div>
                <h2 className="mb-3 text-xl font-semibold text-foreground">8. Changes to This Policy</h2>
                <p>
                  We may update this policy from time to time. We will notify registered users by email for material
                  changes. The "Last updated" date at the top of this page reflects the most recent revision.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 border-t border-border pt-8">
                <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
                <span className="text-border">·</span>
                <Link href="/safety" className="text-primary hover:underline">Safety Guidelines</Link>
                <span className="text-border">·</span>
                <Link href="/about" className="text-primary hover:underline">About Algalle</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
