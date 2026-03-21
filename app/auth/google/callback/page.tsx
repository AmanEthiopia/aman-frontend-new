"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function GoogleCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loginWithGoogle } = useAuth()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code")
      const state = searchParams.get("state")
      const error = searchParams.get("error")

      // Check for OAuth errors
      if (error) {
        setStatus("error")
        setErrorMessage(
          error === "access_denied"
            ? "You denied access to your Google account."
            : `Google sign-in failed: ${error}`
        )
        return
      }

      // Validate state to prevent CSRF
      const savedState = sessionStorage.getItem("google_oauth_state")
      if (state && savedState && state !== savedState) {
        setStatus("error")
        setErrorMessage("Invalid state parameter. Please try signing in again.")
        return
      }

      // Clear the saved state
      sessionStorage.removeItem("google_oauth_state")

      if (!code) {
        setStatus("error")
        setErrorMessage("No authorization code received from Google.")
        return
      }

      try {
        // Exchange the code for tokens via our backend
        const response = await fetch("/api/auth/google/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            code, 
            redirect_uri: window.location.origin + "/auth/google/callback" 
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || "Failed to exchange authorization code")
        }

        const data = await response.json()
        
        // Use the ID token to authenticate with the backend
        if (data.id_token) {
          await loginWithGoogle(data.id_token)
          setStatus("success")
          // Redirect will be handled by the auth context
        } else {
          throw new Error("No ID token received")
        }
      } catch (err: any) {
        setStatus("error")
        setErrorMessage(err.message || "Failed to complete Google sign-in")
      }
    }

    handleCallback()
  }, [searchParams, loginWithGoogle, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>
            {status === "loading" && "Signing in with Google..."}
            {status === "success" && "Sign-in Successful!"}
            {status === "error" && "Sign-in Failed"}
          </CardTitle>
          <CardDescription>
            {status === "loading" && "Please wait while we complete your sign-in."}
            {status === "success" && "Redirecting you to your dashboard..."}
            {status === "error" && "There was a problem signing you in."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {status === "loading" && <Spinner className="h-8 w-8" />}
          
          {status === "success" && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-8 w-8" />
              <span>Redirecting...</span>
            </div>
          )}
          
          {status === "error" && (
            <>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link href="/login">Back to Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Create Account</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
