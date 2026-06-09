"use client"

import { Suspense } from "react"
import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Loader2, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { verifyEmail, resendVerification } from "@/lib/api/auth"

function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailParam = searchParams.get("email")
  const redirectParam = searchParams.get("redirect") || undefined

  const [email, setEmail] = useState(emailParam || "")
  const [otpCode, setOtpCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!email || !otpCode) {
      setError("Please provide both email and verification code")
      return
    }

    setIsLoading(true)

    try {
      await verifyEmail(email, otpCode)
      setSuccess(true)

      setTimeout(() => {
        const loginUrl = `/login?email=${encodeURIComponent(email)}${redirectParam ? `&redirect=${encodeURIComponent(redirectParam)}` : ""}`
        router.push(loginUrl)
      }, 2000)
    } catch (err: any) {
      console.error("[v0] Verification error:", err)

      if (err.message.includes("expired") || err.message.includes("410")) {
        setError("Your verification code has expired. Please request a new one below.")
      } else if (err.message.includes("Invalid") || err.message.includes("400")) {
        setError("Invalid verification code. Please check and try again.")
      } else {
        setError(err.message || "Verification failed. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      setError("Please enter your email address")
      return
    }

    setIsResending(true)
    setError(null)
    setResendSuccess(false)

    try {
      await resendVerification(email)
      setResendSuccess(true)

      setTimeout(() => {
        setResendSuccess(false)
      }, 5000)
    } catch (err: any) {
      console.error("[v0] Resend error:", err)

      if (err.message.includes("already verified") || err.message.includes("400")) {
        setError("This email is already verified. Please try logging in.")
      } else if (err.message.includes("not found") || err.message.includes("404")) {
        setError("Email not found. Please check your email address.")
      } else {
        setError(err.message || "Failed to resend code. Please try again.")
      }
    } finally {
      setIsResending(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <CardTitle className="text-2xl">Email Verified!</CardTitle>
          <CardDescription>Your account has been successfully verified</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">You can now log in to your Alga Ale account</p>
          <Button asChild className="w-full">
            <Link href={`/login?email=${encodeURIComponent(email)}${redirectParam ? `&redirect=${encodeURIComponent(redirectParam)}` : ""}`}>Go to Login</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <Mail className="mx-auto h-12 w-12 text-primary mb-4" />
        <CardTitle className="text-2xl">Verify Your Email</CardTitle>
        <CardDescription>Enter the 6-digit code sent to your email</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {resendSuccess && (
          <Alert className="mb-4 border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              Verification code sent! Please check your email.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError(null)
                }}
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="otpCode">Verification Code</Label>
            <Input
              id="otpCode"
              name="otpCode"
              type="text"
              placeholder="123456"
              value={otpCode}
              onChange={(e) => {
                setOtpCode(e.target.value)
                setError(null)
              }}
              maxLength={6}
              pattern="[0-9]{6}"
              required
              disabled={isLoading}
              className="text-center text-2xl tracking-widest"
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Code expires in 15 minutes
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Email"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">Didn't receive the code?</p>
          <Button
            variant="outline"
            onClick={handleResend}
            disabled={isResending || !email}
            className="w-full bg-transparent"
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Resend Code"
            )}
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            Back to Login
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Suspense fallback={<div>Loading...</div>}>
          <VerifyEmailForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
