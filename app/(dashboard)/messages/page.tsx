"use client"

import { useState, useEffect, useRef, Suspense } from "react"
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
  ArrowLeft,
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getMediaUrl } from "@/lib/utils/media"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
  getConversations,
  getMessages,
  sendMessage,
  markConversationRead,
  flagConversation,
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

function ConversationItem({
  conversation,
  isActive,
  onClick,
}: {
  conversation: Conversation
  isActive: boolean
  onClick: () => void
}) {
  if (!conversation) return null

  const TypeIcon = TYPE_ICONS[conversation.related_to_type] || MessageSquare
  const participantName = conversation.other_participant?.name || "Unknown"
  const participantAvatar = getMediaUrl(conversation.other_participant?.avatar_url)
  const unreadCount = conversation.unread_count || 0
  const lastMessageText = conversation.last_message?.text || ""
  const lastMessageAt = conversation.last_message_at || ""

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
          <AvatarImage src={participantAvatar} />
          <AvatarFallback>{participantName.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-xs text-destructive-foreground">
            {unreadCount}
          </span>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <span className={cn("font-medium truncate", unreadCount > 0 && "font-semibold")}>
            {participantName}
          </span>
          <span className="flex-shrink-0 text-xs text-muted-foreground">
            {lastMessageAt ? formatMessageTime(lastMessageAt) : ""}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-1">
          <Badge variant="outline" className="h-5 gap-1 px-1.5 text-[10px]">
            <TypeIcon className="h-3 w-3" />
            {conversation.related_to_type || "general"}
          </Badge>
          {conversation.is_flagged && (
            <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
              Flagged
            </Badge>
          )}
        </div>
        <p
          className={cn(
            "mt-1 truncate text-sm",
            unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground"
          )}
        >
          {lastMessageText}
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
  if (!message) return null

  const senderId = message.sender?.id || ""
  const senderName = message.sender?.name || "Unknown"
  const senderAvatar = getMediaUrl(message.sender?.avatar_url)
  const isOwn = senderId === currentUserId
  const isSystem = message.is_system_message

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="rounded-full bg-muted px-4 py-2 text-xs text-muted-foreground">
          {message.message_text || ""}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex gap-2", isOwn ? "flex-row-reverse" : "flex-row")}>
      {!isOwn && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={senderAvatar} />
          <AvatarFallback>{senderName.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-4 py-2",
          isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        <p className="whitespace-pre-wrap text-sm">{message.message_text || ""}</p>
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
            {message.created_at
              ? new Date(message.created_at).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })
              : ""}
          </span>
        </div>
      </div>
    </div>
  )
}

function EmptyMessages() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <MessageSquare className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">No messages yet</h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        When you make a booking or inquiry, your conversations with hosts will appear here.
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
          Choose a conversation from the list to view messages
        </p>
      </div>
    </CardContent>
  )
}

function MessagesContent() {
  const searchParams = useSearchParams()
  const { userProfile } = useAuth()
  const currentUserId = userProfile?.user?.id || ""

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
  const [flagDialogOpen, setFlagDialogOpen] = useState(false)
  const [flagReason, setFlagReason] = useState("")
  const [flagging, setFlagging] = useState(false)
  // On mobile: show chat panel when a conversation is selected
  const [mobileShowChat, setMobileShowChat] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const stopPollerRef = useRef<(() => void) | null>(null)

  // Load conversations
  useEffect(() => {
    async function loadConversations() {
      try {
        setLoading(true)
        const { data } = await getConversations()
        const convList = data ?? []
        setConversations(convList)
        // Auto-select first conversation if none preselected
        if (!selectedConversation && convList.length > 0) {
          setSelectedConversation(convList[0].id)
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
        const { data: msgData } = await getMessages(selectedConversation!)
        setMessages(msgData ?? [])
        await markConversationRead(selectedConversation!).catch(() => {})
        setConversations((prev) =>
          prev.map((c) => (c.id === selectedConversation ? { ...c, unread_count: 0 } : c))
        )
      } catch (err: any) {
        setError(err.message || "Failed to load messages")
      } finally {
        setMessagesLoading(false)
      }
    }

    loadMessages()

    if (stopPollerRef.current) stopPollerRef.current()
    stopPollerRef.current = createMessagePoller(
      selectedConversation,
      (newMessages) => setMessages((prev) => {
        const existing = new Set(prev.map((m) => m.id))
        const fresh = newMessages.filter((m) => !existing.has(m.id))
        return fresh.length > 0 ? [...prev, ...fresh] : prev
      }),
      5000
    )

    return () => {
      if (stopPollerRef.current) stopPollerRef.current()
    }
  }, [selectedConversation])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const activeConversation = conversations.find((c) => c.id === selectedConversation) || null

  const handleSelectConversation = (id: string) => {
    setSelectedConversation(id)
    setMobileShowChat(true)
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversation) return
    try {
      setSendingMessage(true)
      const message = await sendMessage(selectedConversation, newMessage.trim())
      setMessages((prev) => [...prev, message])
      setNewMessage("")
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

  const handleFlag = async () => {
    if (!selectedConversation || !flagReason.trim()) return
    try {
      setFlagging(true)
      await flagConversation(selectedConversation, flagReason.trim())
      setConversations((prev) =>
        prev.map((c) => (c.id === selectedConversation ? { ...c, is_flagged: true } : c))
      )
      setFlagDialogOpen(false)
      setFlagReason("")
    } catch (err: any) {
      setError(err.message || "Failed to flag conversation")
    } finally {
      setFlagging(false)
    }
  }

  const filteredConversations = (conversations || []).filter(
    (c) =>
      c?.other_participant?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c?.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalUnread = (conversations || []).reduce((sum, c) => sum + (c?.unread_count || 0), 0)

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
            Your conversations with hosts
            {totalUnread > 0 && ` · ${totalUnread} unread`}
          </p>
        </div>
      </div>

      <div className="grid h-[calc(100vh-12rem)] gap-4 lg:grid-cols-3">
        {/* Conversations List — hidden on mobile when chat is open */}
        <Card className={cn("flex flex-col lg:col-span-1", mobileShowChat ? "hidden lg:flex" : "flex")}>
          <CardHeader className="flex-shrink-0 p-3">
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
                {filteredConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isActive={selectedConversation === conversation.id}
                    onClick={() => handleSelectConversation(conversation.id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyMessages />
            )}
          </ScrollArea>
        </Card>

        {/* Chat Area — takes full width on mobile when chat is open */}
        <Card className={cn("flex flex-col lg:col-span-2", mobileShowChat ? "flex" : "hidden lg:flex")}>
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <CardHeader className="flex flex-shrink-0 flex-row items-center justify-between border-b p-4">
                <div className="flex items-center gap-3">
                  {/* Mobile back button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={() => setMobileShowChat(false)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Avatar>
                    <AvatarImage src={getMediaUrl(activeConversation.other_participant.avatar_url) || undefined} />
                    <AvatarFallback>
                      {activeConversation.other_participant.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{activeConversation.other_participant.name}</h3>
                      {activeConversation.is_flagged && (
                        <Badge variant="destructive" className="text-xs">Flagged</Badge>
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
                    {!activeConversation.is_flagged && (
                      <DropdownMenuItem
                        onClick={() => setFlagDialogOpen(true)}
                        className="text-destructive"
                      >
                        <Flag className="mr-2 h-4 w-4" />
                        Report Issue
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>

              {/* Flagged banner */}
              {activeConversation.is_flagged && (
                <div className="flex flex-shrink-0 items-center gap-2 border-b bg-destructive/10 px-4 py-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive">
                    This conversation has been flagged. Our team will review it.
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

              {/* Input */}
              <div className="flex-shrink-0 border-t p-4">
                <div className="flex items-end gap-2">
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
                    className="max-h-24 min-h-[2.5rem] flex-1 resize-none"
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

      {/* Flag / Report Dialog */}
      <Dialog open={flagDialogOpen} onOpenChange={setFlagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report an Issue</DialogTitle>
            <DialogDescription>
              If you&apos;re having a problem with this conversation, let us know and our team will
              review it.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder="Describe the issue you're experiencing..."
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFlagDialogOpen(false)} disabled={flagging}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleFlag}
              disabled={!flagReason.trim() || flagging}
            >
              {flagging ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Flag className="mr-2 h-4 w-4" />
                  Submit Report
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  )
}
