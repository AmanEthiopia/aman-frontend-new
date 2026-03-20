"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Spinner } from "@/components/ui/spinner"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireRole?: "provider" | "admin"
}

export function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isAuthReady, userProfile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthReady) return

    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (requireRole === "provider" && !userProfile?.role?.is_provider) {
      router.push("/home")
      return
    }

    if (requireRole === "admin" && !userProfile?.role?.is_admin) {
      router.push("/home")
      return
    }
  }, [isAuthenticated, isAuthReady, userProfile, requireRole, router])

  if (!isAuthReady || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
        <span className="ml-2 text-muted-foreground">Loading...</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requireRole === "provider" && !userProfile?.role?.is_provider) {
    return null
  }

  if (requireRole === "admin" && !userProfile?.role?.is_admin) {
    return null
  }

  return <>{children}</>
}
