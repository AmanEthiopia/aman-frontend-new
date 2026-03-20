"use client"

import { useState, useEffect } from "react"
import {
  Search,
  MoreHorizontal,
  Send,
  Paperclip,
  ImageIcon,
  Phone,
  Info,
  Check,
  CheckCheck,
  Building2,
  Shield,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { getConversations, getMessages, sendMessage, type Conversation, type Message } from "@/lib/api/messages"

function ConversationItem({
  conversation,
  isActive,
  onClick,
}: {
  conversation: Conversation
  isActive: boolean
  onClick: () => void
}) {
  const lastMessage = conversation.last_message
  const isUnread = conversation.unread_count > 0

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors",
        isActive ? "bg-primary/10" : "hover:bg-muted",
      )}
    >
      <div className="relative">
        <Avatar className="h-12 w-12">
          <AvatarImage src={conversation.participant_avatar || "/placeholder.svg"} />
          <AvatarFallback>{conversation.participant_name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        {conversation.is_verified && (
          <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-background p-0.5">
            <Shield className="h-3.5 w-3.5 text-green-600" />
          </div>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <span className={cn("font-medium", isUnread && "font-semibold")}>{conversation.participant_name}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(lastMessage.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
            {conversation.participant_type === "host" ? "Hotel" : "Support"}
          </Badge>
          {conversation.listing_name && <span className="text-muted-foreground">{conversation.listing_name}</span>}
        </div>
        <p className={cn("mt-1 truncate text-sm", isUnread ? "font-medium text-foreground" : "text-muted-foreground")}>
          {lastMessage.content}
        </p>
      </div>
      {isUnread && <Badge className="mt-1 h-5 min-w-5 px-1.5">{conversation.unread_count}</Badge>}
    </button>
  )
}

function MessageBubble({ message, currentUserId }: { message: Message; currentUserId: string }) {
  const isOwn = message.sender_id === currentUserId
  const StatusIcon = message.read ? CheckCheck : Check

  return (
    <div className={cn("flex gap-2", isOwn ? "flex-row-reverse" : "flex-row")}>
      {!isOwn && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.sender_avatar || "/placeholder.svg"} />
          <AvatarFallback>{message.sender_name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn("max-w-[70%] rounded-2xl px-4 py-2", isOwn ? "bg-primary text-primary-foreground" : "bg-muted")}
      >
        <p className="text-sm">{message.content}</p>
        <div
          className={cn(
            "mt-1 flex items-center gap-1 text-[10px]",
            isOwn ? "justify-end text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          <span>
            {new Date(message.created_at).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
          {isOwn && <StatusIcon className="h-3 w-3" />}
        </div>
      </div>
    </div>
  )
}

function EmptyMessages() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center p-8">
      <div className="mb-4 rounded-full bg-muted p-4">
        <Building2 className="h-8 w-8 text-muted-foreground" />
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
      <p className="max-w-sm text-sm text-muted-foreground">Choose a conversation from the list to view messages</p>
    </div>
  )
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadConversations() {
      try {
        setLoading(true)
        const data = await getConversations()
        setConversations(data)
      } catch (err: any) {
        console.error("Failed to load conversations:", err)
        setError(err.message || "Failed to load conversations")
      } finally {
        setLoading(false)
      }
    }
    loadConversations()
  }, [])

  useEffect(() => {
    async function loadMessages() {
      if (!selectedConversation) return

      try {
        setMessagesLoading(true)
        const data = await getMessages(selectedConversation)
        setMessages(data)
      } catch (err: any) {
        console.error("Failed to load messages:", err)
        setError(err.message || "Failed to load messages")
      } finally {
        setMessagesLoading(false)
      }
    }
    loadMessages()
  }, [selectedConversation])

  const activeConversation = conversations.find((c) => c.id === selectedConversation)

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      setSendingMessage(true)
      const message = await sendMessage({
        conversation_id: selectedConversation,
        content: newMessage,
      })
      setMessages((prev) => [...prev, message])
      setNewMessage("")
    } catch (err: any) {
      console.error("Failed to send message:", err)
      setError(err.message || "Failed to send message")
    } finally {
      setSendingMessage(false)
    }
  }

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
          <Badge variant="secondary">{conversations.reduce((acc, c) => acc + c.unread_count, 0)} unread</Badge>
        )}
      </div>

      <Card className="flex flex-1 overflow-hidden">
        {/* Conversations List */}
        <div className="w-full max-w-xs border-r">
          <div className="border-b p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search messages..." className="pl-9" />
            </div>
          </div>
          <ScrollArea className="h-[calc(100%-4rem)]">
            {conversations.length > 0 ? (
              <div className="p-2">
                {conversations.map((conversation) => (
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
                    <AvatarImage src={activeConversation.participant_avatar || "/placeholder.svg"} />
                    <AvatarFallback>{activeConversation.participant_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{activeConversation.participant_name}</span>
                      {activeConversation.is_verified && <Shield className="h-4 w-4 text-green-600" />}
                    </div>
                    {activeConversation.listing_name && (
                      <span className="text-sm text-muted-foreground">{activeConversation.listing_name}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Info className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
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
                        currentUserId={activeConversation.participant_id}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Input */}
              <div className="border-t p-4">
                <div className="flex items-end gap-2">
                  <Button variant="ghost" size="icon">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <ImageIcon className="h-4 w-4" />
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
                    {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <EmptyConversation />
          )}
        </div>
      </Card>
    </div>
  )
}
