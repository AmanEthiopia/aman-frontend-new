"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import {
  Search,
  MoreHorizontal,
  Send,
  Paperclip,
  Phone,
  Info,
  Check,
  CheckCheck,
  Shield,
  Loader2,
  AlertCircle,
  Flag,
  Hotel,
  Utensils,
  Compass,
  Calendar,
  MessageSquare,
  Map,
} from "lucide-react"
import { Card } from "@/components/ui/card"
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
        <Avatar className="h-12 w-12">
          <AvatarImage src={conversation.other_participant.avatar_url} />
          <AvatarFallback>
            {conversation.other_participant.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <span className={cn("font-medium", conversation.unread_count > 0 && "font-semibold")}>
            {conversation.other_participant.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatMessageTime(conversation.last_message_at)}
          </span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <Badge variant="outline" className="h-5 gap-1 px-1.5 text-[10px]">
            <TypeIcon className="h-3 w-3" />
            {conversation.related_to_type}
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
            conversation.unread_count > 0 ? "font-medium text-foreground" : "text-muted-foreground"
          )}
        >
          {conversation.last_message.text}
        </p>
      </div>
      {conversation.unread_count > 0 && (
        <Badge className="mt-1 h-5 min-w-5 px-1.5">{conversation.unread_count}</Badge>
      )}
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
    <div className="flex h-full flex-col items-center justify-center text-center">
      <h3 className="mb-2 text-lg font-semibold">Select a conversation</h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        Choose a conversation from the list to view messages
      </p>
    </div>
  )
}

export default function MessagesPage() {
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
  const [flagDialogOpen, setFlagDialogOpen] = useState(false)
  const [flagReason, setFlagReason] = useState("")
  const [flagging, setFlagging] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const stopPollerRef = useRef<(() => void) | null>(null)

  // Load conversations
  useEffect(() => {
    async function loadConversations() {
      try {
        setLoading(true)
        const { data } = await getConversations()
        setConversations(data)
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

  const handleFlag = async () => {
    if (!selectedConversation || !flagReason.trim()) return

    try {
      setFlagging(true)
      await flagConversation(selectedConversation, flagReason.trim())

      // Update conversation locally
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation ? { ...c, is_flagged: true } : c
        )
      )

      setFlagDialogOpen(false)
      setFlagReason("")
    } catch (err: any) {
      setError(err.message || "Failed to flag conversation")
    } finally {
      setFlagging(false)
    }
  }

  const filteredConversations = conversations.filter(
    (c) =>
      c.other_participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error && conversations.length === 0) {
    return (
      <div className="flex h-[calc(100vh-10rem)] flex-col items-center justify-center">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h3 className="mb-2 text-lg font-semibold">Failed to Load Messages</h3>
        <p className="mb-6 text-sm text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Messages</h1>
        {conversations.length > 0 && (
          <Badge variant="secondary">
            {conversations.reduce((acc, c) => acc + c.unread_count, 0)} unread
          </Badge>
        )}
      </div>

      <Card className="flex flex-1 overflow-hidden">
        {/* Conversations List */}
        <div className="w-full max-w-xs border-r">
          <div className="border-b p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <ScrollArea className="h-[calc(100%-4rem)]">
            {filteredConversations.length > 0 ? (
              <div className="p-2">
                {filteredConversations.map((conversation) => (
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
        </div>

        {/* Message Thread */}
        <div className="flex flex-1 flex-col">
          {activeConversation ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={activeConversation.other_participant.avatar_url} />
                    <AvatarFallback>
                      {activeConversation.other_participant.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {activeConversation.other_participant.name}
                      </span>
                      {activeConversation.is_flagged && (
                        <Badge variant="destructive" className="text-xs">
                          Flagged
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {activeConversation.subject}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
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
                </div>
              </div>

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
              <div className="border-t p-4">
                <div className="flex items-end gap-2">
                  <Button variant="ghost" size="icon">
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
                    className="min-h-[2.5rem] max-h-32 resize-none"
                    rows={1}
                    disabled={sendingMessage}
                  />
                  <Button onClick={handleSend} disabled={!newMessage.trim() || sendingMessage}>
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
        </div>
      </Card>

      {/* Flag Dialog */}
      <Dialog open={flagDialogOpen} onOpenChange={setFlagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report an Issue</DialogTitle>
            <DialogDescription>
              If you're having a problem with this conversation, let us know and our team will
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
