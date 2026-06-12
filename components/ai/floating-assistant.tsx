"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X, Send, Loader2, User, Minimize2 } from "lucide-react"
import { useApp } from "@/lib/contexts/app-context"
import { sendAIQuery } from "@/lib/api/ai"
import { friendlyError } from "@/lib/utils/errors"
import { FEATURES } from "@/lib/config/features"
import { AmanZigzag, AmanZigzagLoader } from "@/components/brand/aman-logo"

interface Message {
  role: "user" | "assistant"
  content: string
}

const suggestedQueries = [
  "Best hotel near Bole Airport",
  "Is this area safe?",
  "Suggest a cheaper option",
  "Plan 3 days in Addis",
]

export function FloatingAIAssistant() {
  const { isAIAssistantOpen, setIsAIAssistantOpen } = useApp()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (!FEATURES.AI_CONCIERGE) return null

  const handleSubmit = async (query: string) => {
    if (!query.trim() || isLoading) return

    const userMessage: Message = { role: "user", content: query }
    const history = messages.slice(-6).map((m) => ({ role: m.role, content: m.content }))
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const result = await sendAIQuery(query, {
        history,
        context: typeof window !== "undefined" ? { page: window.location.pathname } : undefined,
      })
      setMessages((prev) => [...prev, { role: "assistant", content: result.response }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: friendlyError(err, "I couldn't answer that right now. Please try again.") },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAIAssistantOpen) {
    return (
      <Button
        onClick={() => setIsAIAssistantOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
        size="icon"
        aria-label="Open Alga Ale AI Assistant"
      >
        <AmanZigzag size={20} strokeWidth={6} title="Alga Ale AI" />
        <span className="sr-only">Open AI Assistant</span>
      </Button>
    )
  }

  if (isMinimized) {
    return (
      <Button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-50 gap-2 rounded-full px-4 shadow-lg"
      >
        <AmanZigzag size={14} strokeWidth={6} title="Alga Ale AI" />
        AI Assistant
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 z-50 flex h-[500px] w-[380px] flex-col shadow-2xl sm:w-[420px]">
      <CardHeader className="flex flex-row items-center justify-between border-b p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <AmanZigzag size={14} strokeWidth={6} title="Alga Ale AI" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">Alga Ale AI Assistant</h3>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                Beta
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Ask anything about Ethiopia</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsMinimized(true)}>
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsAIAssistantOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-3 text-primary/70">
                <AmanZigzag size={36} strokeWidth={5} title="Alga Ale AI" />
              </div>
              <h4 className="mb-1 font-medium">How can I help?</h4>
              <p className="mb-4 text-xs text-muted-foreground">Ask about hotels, restaurants, transport, or trip ideas in Ethiopia.</p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestedQueries.map((query) => (
                  <button
                    key={query}
                    onClick={() => handleSubmit(query)}
                    className="rounded-full border border-border px-3 py-1 text-xs transition-colors hover:bg-muted"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div key={index} className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  {message.role === "assistant" && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <AmanZigzag size={10} strokeWidth={6} title="Alga Ale AI" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {message.content}
                  </div>
                  {message.role === "user" && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="h-3 w-3" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <AmanZigzag size={10} strokeWidth={6} title="Alga Ale AI" />
                  </div>
                  <div className="rounded-2xl bg-muted px-3 py-2">
                    <AmanZigzagLoader size={18} label="Alga Ale AI is thinking" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit(input)
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Ethiopia..."
              disabled={isLoading}
              className="flex-1 text-sm"
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">Alga Ale AI may make mistakes. Verify key details before booking.</p>
        </div>
      </CardContent>
    </Card>
  )
}
