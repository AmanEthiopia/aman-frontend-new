"use client"

import { AlertCircle, WifiOff, Lock, ServerCrash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ErrorStateProps {
  type?: "network" | "unauthorized" | "not-found" | "server" | "generic"
  title?: string
  message?: string
  onRetry?: () => void
  showRetry?: boolean
}

const errorConfig = {
  network: {
    icon: WifiOff,
    title: "Connection Error",
    message: "Unable to reach the server. Please check your internet connection and try again.",
  },
  unauthorized: {
    icon: Lock,
    title: "Access Denied",
    message: "You need to be logged in to view this content.",
  },
  "not-found": {
    icon: AlertCircle,
    title: "Not Found",
    message: "The content you're looking for doesn't exist or has been removed.",
  },
  server: {
    icon: ServerCrash,
    title: "Server Error",
    message: "Something went wrong on our end. Our team has been notified.",
  },
  generic: {
    icon: AlertCircle,
    title: "Something Went Wrong",
    message: "We encountered an unexpected error. Please try again.",
  },
}

export function ErrorState({ type = "generic", title, message, onRetry, showRetry = true }: ErrorStateProps) {
  const config = errorConfig[type]
  const Icon = config.icon

  return (
    <div className="flex min-h-[400px] items-center justify-center p-8">
      <Card className="max-w-md">
        <CardContent className="flex flex-col items-center text-center pt-6">
          <div className="mb-4 rounded-full bg-destructive/10 p-3">
            <Icon className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">{title || config.title}</h3>
          <p className="mb-6 text-sm text-muted-foreground">{message || config.message}</p>
          {showRetry && onRetry && (
            <Button onClick={onRetry} variant="outline">
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
