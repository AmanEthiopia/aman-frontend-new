"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import {
  Search,
  MoreHorizontal,
  Send,
  Paperclip,
  Loader2,
  AlertCircle,
  Flag,
  Hotel,
  Utensils,
  Compass,
  Calendar,
  MessageSquare,
  Map,
  Info,
  Users,
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
  getConversations,
  getMessages,
  sendMessage,
  markConversationRead,
  formatMessageTime,
  createMessagePoller,
  type Conversation,
  type Message,
  type RelatedToType,
} from "@/lib/api/messages"
import { useAuth } from "@/contexts/auth-context"

const TYPE_ICONS: Record<RelatedToType, typeof Hotel> = {
  hotel: Hotel,
  restaurant: Utensils,
  experience: Compass,
  booking: Calendar,
  general: MessageSquare,
  guide: Map,
}

const quickReplies = [
  "Thank you for reaching out!",
  "I'll check and get back to you shortly.",
  "Yes, that can be arranged.",
  "Please let me know if you need anything else.",
]

function ConversationItem({
  conversation,
  isActive,
  onClick,
}: {
  conversation: Conversation
  isActive: boolean
  onClick: () => void
}) {
  const TypeIcon = TYPE_ICONS[conversation.related_to_type] || MessageSquare

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors",
        isActive ? "bg-primary/10" : "hover:bg-muted"
      )}
    >
      <div className="relative">
        <Avatar className="h-11 w-11">
          <AvatarImage src={conversation.other_participant.avatar_url} />
          <AvatarFallback>
            {conversation.other_participant.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {conversation.unread_count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-xs text-destructive-foreground">
            {conversation.unread_count}
          </span>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <span className={cn("font-medium truncate", conversation.unread_count > 0 && "font-semibold")}>
            {conversation.other_participant.name}
          </span>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {formatMessageTime(conversation.last_message_at)}
          </span>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <Badge variant="outline" className="h-5 gap-1 px-1.5 text-[10px]">
            <TypeIcon className="h-3 w-3" />
            {conversation.related_to_type}
          </Badge>
          {conversation.is_flagged && (
            <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
              Dispute
            </Badge>
          )}
        </div>
        <p
          className={cn(
            "mt-1 truncate text-sm",
            conversation.unread_count > 0 ? "font-medium text-foreground" : "text-muted-foreground"
          )}
        >
          {conversation.last_message.text}
        </p>
      </div>
    </button>
  )
}

function MessageBubble({
  message,
  currentUserId,
}: {
  message: Message
  currentUserId: string
}) {
  const isOwn = message.sender.id === currentUserId
  const isSystem = message.is_system_message

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="rounded-full bg-muted px-4 py-2 text-xs text-muted-foreground">
          {message.message_text}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex gap-2", isOwn ? "flex-row-reverse" : "flex-row")}>
      {!isOwn && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.sender.avatar_url} />
          <AvatarFallback>{message.sender.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-4 py-2",
          isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.message_text}</p>
        {message.attachment_url && (
          <a
            href={message.attachment_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-xs underline"
          >
            View attachment
          </a>
        )}
        <div
          className={cn(
            "mt-1 flex items-center gap-1 text-[10px]",
            isOwn ? "justify-end text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          <span>
            {new Date(message.created_at).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </div>
  )
}

function EmptyMessages() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center p-8">
      <div className="mb-4 rounded-full bg-muted p-4">
        <Users className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">No messages yet</h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        When travelers inquire about your listings, their messages will appear here.
      </p>
    </div>
  )
}

function EmptyConversation() {
  return (
    <CardContent className="flex h-full items-center justify-center text-center">
      <div>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <MessageSquare className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold">Select a conversation</h3>
        <p className="text-muted-foreground">
          Choose a conversation from the list to start messaging
        </p>
      </div>
    </CardContent>
  )
}

export default function ProviderMessagesPage() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const currentUserId = user?.id || ""

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    searchParams.get("conversation")
  )
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const stopPollerRef = useRef<(() => void) | null>(null)

  // Load conversations
  useEffect(() => {
    async function loadConversations() {
      try {
        setLoading(true)
        const { data } = await getConversations()
        setConversations(data)
        
        // Auto-select first conversation if none selected
        if (!selectedConversation && data.length > 0) {
          setSelectedConversation(data[0].id)
        }
      } catch (err: any) {
        setError(err.message || "Failed to load conversations")
      } finally {
        setLoading(false)
      }
    }
    loadConversations()
  }, [])

  // Load messages and start polling when conversation changes
  useEffect(() => {
    if (!selectedConversation) return

    async function loadMessages() {
      try {
        setMessagesLoading(true)
        const { data } = await getMessages(selectedConversation!)
        setMessages(data)

        // Mark as read
        await markConversationRead(selectedConversation!).catch(() => {})

        // Update unread count locally
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConversation ? { ...c, unread_count: 0 } : c
          )
        )
      } catch (err: any) {
        setError(err.message || "Failed to load messages")
      } finally {
        setMessagesLoading(false)
      }
    }

    loadMessages()

    // Stop previous poller
    if (stopPollerRef.current) {
      stopPollerRef.current()
    }

    // Start new poller
    stopPollerRef.current = createMessagePoller(
      selectedConversation,
      (newMessages) => {
        setMessages((prev) => [...prev, ...newMessages])
      },
      5000
    )

    return () => {
      if (stopPollerRef.current) {
        stopPollerRef.current()
      }
    }
  }, [selectedConversation])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const activeConversation = conversations.find((c) => c.id === selectedConversation)

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      setSendingMessage(true)
      const message = await sendMessage(selectedConversation, newMessage.trim())
      setMessages((prev) => [...prev, message])
      setNewMessage("")

      // Update last message in conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation
            ? {
                ...c,
                last_message: { text: message.message_text, created_at: message.created_at },
                last_message_at: message.created_at,
              }
            : c
        )
      )
    } catch (err: any) {
      setError(err.message || "Failed to send message")
    } finally {
      setSendingMessage(false)
    }
  }

  const handleQuickReply = (reply: string) => {
    setNewMessage(reply)
  }

  const filteredConversations = conversations.filter(
    (c) =>
      c.other_participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group conversations by flagged status
  const flaggedConversations = filteredConversations.filter((c) => c.is_flagged)
  const normalConversations = filteredConversations.filter((c) => !c.is_flagged)

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0)

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error && conversations.length === 0) {
    return (
      <div className="flex h-[calc(100vh-12rem)] flex-col items-center justify-center">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h3 className="mb-2 text-lg font-semibold">Failed to Load Messages</h3>
        <p className="mb-6 text-sm text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            Communicate with your guests
            {totalUnread > 0 && ` (${totalUnread} unread)`}
          </p>
        </div>
        {flaggedConversations.length > 0 && (
          <Badge variant="destructive">{flaggedConversations.length} disputes</Badge>
        )}
      </div>

      <div className="grid h-[calc(100vh-12rem)] gap-4 lg:grid-cols-3">
        {/* Conversations List */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader className="p-3 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            {filteredConversations.length > 0 ? (
              <div className="p-2">
                {/* Flagged conversations first */}
                {flaggedConversations.length > 0 && (
                  <div className="mb-2">
                    <p className="px-3 py-1 text-xs font-medium text-destructive">
                      Requires Attention
                    </p>
                    {flaggedConversations.map((conversation) => (
                      <ConversationItem
                        key={conversation.id}
                        conversation={conversation}
                        isActive={selectedConversation === conversation.id}
                        onClick={() => setSelectedConversation(conversation.id)}
                      />
                    ))}
                  </div>
                )}

                {/* Normal conversations */}
                {normalConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isActive={selectedConversation === conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyMessages />
            )}
          </ScrollArea>
        </Card>

        {/* Chat Area */}
        <Card className="flex flex-col lg:col-span-2">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <CardHeader className="flex flex-row items-center justify-between border-b p-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={activeConversation.other_participant.avatar_url} />
                    <AvatarFallback>
                      {activeConversation.other_participant.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{activeConversation.other_participant.name}</h3>
                      {activeConversation.is_flagged && (
                        <Badge variant="destructive" className="text-xs">
                          <Flag className="mr-1 h-3 w-3" />
                          Dispute
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{activeConversation.subject}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Info className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>

              {/* Dispute Banner */}
              {activeConversation.is_flagged && (
                <div className="flex items-center gap-2 border-b bg-destructive/10 px-4 py-2 flex-shrink-0">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive">
                    This conversation has been flagged as a dispute. An admin may review it.
                  </span>
                </div>
              )}

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {messagesLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        currentUserId={currentUserId}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Quick Replies */}
              <div className="border-t px-4 py-2 flex-shrink-0">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {quickReplies.map((reply, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0 text-xs"
                      onClick={() => handleQuickReply(reply)}
                    >
                      {reply}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="border-t p-4 flex-shrink-0">
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="flex-shrink-0">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Textarea
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    className="min-h-[2.5rem] max-h-24 resize-none flex-1"
                    rows={1}
                    disabled={sendingMessage}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sendingMessage}
                    className="flex-shrink-0"
                  >
                    {sendingMessage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <EmptyConversation />
          )}
        </Card>
      </div>
    </div>
  )
}
