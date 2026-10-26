import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"

export const metadata = {
  title: "Terms of Service — Algalle",
  description: "The terms governing your use of the Algalle travel platform.",
}

export default function TermsOfServicePage() {
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
              <h1 className="mb-4 text-4xl font-bold tracking-tight">Terms of Service</h1>
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
                <h2 className="mb-3 text-xl font-semibold text-foreground">1. Agreement to Terms</h2>
                <p>
                  By accessing or using the Algalle platform (website, mobile, or any associated service), you
                  agree to be bound by these Terms of Service. If you do not agree, please do not use our
                  platform. These terms apply to all visitors, registered users, and verified providers.
                </p>
              </div>

              <div>
                <h2 className="mb-3 text-xl font-semibold text-foreground">2. Eligibility & Account Security</h2>
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>
                      You must be <strong className="text-foreground">18 years of age or older</strong> to create
                      an account or make a booking on Algalle.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>
                      You are responsible for maintaining the confidentiality of your login credentials and for all
                      activity that occurs under your account.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>
                      You agree to provide accurate, current, and complete contact information and to keep it
                      up to date.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>
                      You must notify us immediately at{" "}
                      <a href="mailto:team@yichalal.ai" className="text-primary hover:underline">
                        team@yichalal.ai
                      </a>{" "}
                      if you suspect unauthorised access to your account.
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="mb-3 text-xl font-semibold text-foreground">3. Platform Role & Third-Party Providers</h2>
                <p>
                  Algalle acts as a <strong className="text-foreground">trusted digital companion and booking
                  facilitator</strong>. We connect you with verified third-party hotels, tour operators, restaurants,
                  and transport providers — but we do not directly own or operate these physical services.
                </p>
                <p className="mt-3">
                  Our rigorous verification process includes AI photo verification and manual reviews conducted
                  by our team. However, we cannot guarantee the actions of individual third-party providers after
                  a booking is confirmed. Algalle is <strong className="text-foreground">not liable</strong> for
                  any losses, delays, personal injury, property damage, or service disruptions caused by
                  third-party providers.
                </p>
              </div>

              <div>
                <h2 className="mb-3 text-xl font-semibold text-foreground">4. Bookings & Payments</h2>
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>
                      All bookings are subject to the specific cancellation and refund policies set by the
                      individual verified provider (hotel, tour operator, or transport service).
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>
                      Algalle facilitates payment via{" "}
                      <strong className="text-foreground">Telebirr, CBE Birr</strong> (local) and{" "}
                      <strong className="text-foreground">Stripe</strong> (international). By completing a payment,
                      you agree to the terms of the relevant payment processor.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>
                      Algalle is not liable for immediate refunds where a dispute arises with the physical
                      provider. However, we operate a{" "}
                      <strong className="text-foreground">Dispute Resolution Centre</strong> to actively assist
                      affected travelers.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>
                      Prices displayed on the platform are inclusive of all applicable fees unless stated
                      otherwise. Exchange rates for ETB/USD are indicative and may vary at payment.
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="mb-3 text-xl font-semibold text-foreground">5. User Conduct</h2>
                <p>You agree not to:</p>
                <ul className="mt-2 space-y-2">
                  <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /><span>Use the platform for any unlawful purpose or in violation of Ethiopian law.</span></li>
                  <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /><span>Post false, misleading, or fraudulent reviews or listings.</span></li>
                  <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /><span>Attempt to circumvent the platform to deal directly with providers to avoid fees.</span></li>
                  <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /><span>Scrape, crawl, or automate access to the platform without written consent.</span></li>
                  <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /><span>Harass, threaten, or harm other users or providers.</span></li>
                </ul>
                <p className="mt-3">
                  Violations may result in immediate account suspension and, where applicable, referral to
                  relevant authorities.
                </p>
              </div>

              <div>
                <h2 className="mb-3 text-xl font-semibold text-foreground">6. Intellectual Property</h2>
                <p>
                  All content on the Algalle platform — including logos, text, graphics, UI design, and software
                  — is the property of Algalle / Yichalal Family Initiative and is protected under applicable
                  copyright and trademark law. You may not reproduce, redistribute, or create derivative works
                  without prior written consent.
                </p>
              </div>

              <div>
                <h2 className="mb-3 text-xl font-semibold text-foreground">7. AI Travel Planner</h2>
                <p>
                  Our AI Travel Planner provides suggestions based on your stated preferences and available
                  platform data. AI-generated recommendations are for informational purposes only. Algalle
                  does not guarantee the accuracy of AI-generated content and recommends verifying critical
                  travel details (visa requirements, safety conditions, operating hours) independently.
                </p>
              </div>

              <div>
                <h2 className="mb-3 text-xl font-semibold text-foreground">8. Limitation of Liability</h2>
                <p>
                  To the fullest extent permitted by applicable law, Algalle and the Yichalal Family Initiative
                  are not liable for indirect, incidental, consequential, or punitive damages arising from your
                  use of the platform or any third-party service booked through it. Our total liability for any
                  direct claim shall not exceed the amount you paid for the specific booking in dispute.
                </p>
              </div>

              <div>
                <h2 className="mb-3 text-xl font-semibold text-foreground">9. Governing Law</h2>
                <p>
                  These Terms are governed by and construed in accordance with the laws of the Federal Democratic
                  Republic of Ethiopia. Any disputes shall be resolved through our Dispute Resolution Centre
                  in the first instance, and thereafter in the competent courts of Addis Ababa.
                </p>
              </div>

              <div>
                <h2 className="mb-3 text-xl font-semibold text-foreground">10. Changes to These Terms</h2>
                <p>
                  We reserve the right to update these Terms at any time. Continued use of the platform after
                  changes are posted constitutes your acceptance of the revised Terms. We will notify registered
                  users of material changes by email.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <p>
                  Questions about these terms?{" "}
                  <a href="mailto:legal@algalle.com" className="text-primary hover:underline">
                    legal@algalle.com
                  </a>
                </p>
              </div>

              <div className="flex flex-wrap gap-4 border-t border-border pt-8">
                <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
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
