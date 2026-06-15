"use client"

import { useEffect, useState } from "react"
import { Send, Check, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getTelegramLink, disconnectTelegram, type TelegramLinkStatus } from "@/lib/api/notifications"
import { toast } from "sonner"

export function TelegramConnect() {
  const [status, setStatus] = useState<TelegramLinkStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    try {
      setStatus(await getTelegramLink())
    } catch {
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // When the user returns to the tab after connecting in Telegram, re-check.
  useEffect(() => {
    const onFocus = () => { if (status && !status.connected) load() }
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const connect = () => {
    if (status?.deep_link) window.open(status.deep_link, "_blank", "noopener,noreferrer")
  }

  const disconnect = async () => {
    setBusy(true)
    try {
      await disconnectTelegram()
      toast.success("Telegram disconnected")
      await load()
    } catch {
      toast.error("Couldn't disconnect. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5 text-[#229ED9]" />
          Telegram Notifications
        </CardTitle>
        <CardDescription>
          Get messages and booking updates pushed to Telegram — no need to keep checking the site.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : status?.connected ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
              <Check className="h-4 w-4" /> Connected
            </span>
            <Button variant="outline" size="sm" onClick={disconnect} disabled={busy}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={connect} disabled={!status?.deep_link} className="bg-[#229ED9] text-white hover:bg-[#1c8cc2]">
              <Send className="mr-2 h-4 w-4" />
              Connect Telegram
            </Button>
            <Button variant="ghost" size="sm" onClick={load} title="Refresh status">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <p className="text-xs text-muted-foreground">
              Opens @{status?.bot_username ?? "AlgaAle_bot"}. Tap <strong>Start</strong> there, then come back.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
