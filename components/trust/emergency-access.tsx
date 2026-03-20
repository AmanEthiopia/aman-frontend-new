"use client"

import { useState } from "react"
import { Phone, Shield, MapPin, MessageSquare, ChevronUp, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const emergencyContacts = [
  { name: "AMAN Emergency Line", number: "+251-911-AMAN", available: "24/7" },
  { name: "Ethiopia Police", number: "991", available: "24/7" },
  { name: "Ambulance", number: "907", available: "24/7" },
  { name: "Fire Emergency", number: "939", available: "24/7" },
]

export function EmergencyAccessButton() {
  const [expanded, setExpanded] = useState(false)
  const [minimized, setMinimized] = useState(false)

  if (minimized) {
    return (
      <Button
        onClick={() => setMinimized(false)}
        className="fixed bottom-20 right-4 z-50 h-12 w-12 rounded-full bg-red-600 p-0 shadow-lg hover:bg-red-700 md:bottom-4"
      >
        <Phone className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <div
      className={cn(
        "fixed bottom-20 right-4 z-50 w-80 transition-all duration-300 md:bottom-4",
        expanded ? "opacity-100" : "opacity-95",
      )}
    >
      <Card className="border-red-200 bg-red-50 shadow-xl dark:border-red-900 dark:bg-red-950">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-red-100 p-1.5 dark:bg-red-900">
                <Shield className="h-4 w-4 text-red-600" />
              </div>
              <CardTitle className="text-base text-red-800 dark:text-red-200">Emergency Access</CardTitle>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-600 hover:bg-red-100"
                onClick={() => setExpanded(!expanded)}
              >
                <ChevronUp className={cn("h-4 w-4 transition-transform", !expanded && "rotate-180")} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-600 hover:bg-red-100"
                onClick={() => setMinimized(true)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {expanded && (
          <CardContent className="space-y-3 pt-0">
            <p className="text-sm text-red-700 dark:text-red-300">
              Need help? AMAN provides 24/7 emergency support for all travelers in Ethiopia.
            </p>

            <div className="space-y-2">
              {emergencyContacts.map((contact) => (
                <a
                  key={contact.number}
                  href={`tel:${contact.number}`}
                  className="flex items-center justify-between rounded-lg bg-white p-3 transition-colors hover:bg-red-100 dark:bg-red-900/50 dark:hover:bg-red-900"
                >
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="font-medium text-red-800 dark:text-red-200">{contact.name}</p>
                      <p className="text-sm text-red-600 dark:text-red-400">{contact.available}</p>
                    </div>
                  </div>
                  <span className="font-mono font-semibold text-red-700 dark:text-red-300">{contact.number}</span>
                </a>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1 border-red-300 text-red-700 bg-transparent">
                <MapPin className="mr-2 h-4 w-4" />
                Share Location
              </Button>
              <Button variant="outline" size="sm" className="flex-1 border-red-300 text-red-700 bg-transparent">
                <MessageSquare className="mr-2 h-4 w-4" />
                Live Chat
              </Button>
            </div>
          </CardContent>
        )}

        {!expanded && (
          <CardContent className="pt-0">
            <Button
              className="w-full bg-red-600 text-white hover:bg-red-700"
              onClick={() => (window.location.href = "tel:+251-911-AMAN")}
            >
              <Phone className="mr-2 h-4 w-4" />
              Call AMAN Emergency: +251-911-AMAN
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
