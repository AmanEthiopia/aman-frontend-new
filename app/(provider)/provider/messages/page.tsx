"use client"

import { useState, useRef, useEffect } from "react"
import {
  Search,
  Send,
  Paperclip,
  MoreHorizontal,
  Phone,
  Video,
  Info,
  Check,
  CheckCheck,
  ImageIcon,
  File,
  Calendar,
  Star,
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  senderId: string
  content: string
  timestamp: string
  type: "text" | "image" | "file"
  isRead: boolean
}

interface Conversation {
  id: string
  guestName: string
  guestAvatar?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  bookingId?: string
  bookingStatus?: "pending" | "confirmed" | "completed"
  messages: Message[]
}

const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    guestName: "Sarah Johnson",
    guestAvatar: "/diverse-user-avatars.png",
    lastMessage: "Thank you! Looking forward to our stay.",
    lastMessageTime: "10:30 AM",
    unreadCount: 2,
    bookingId: "BK-101",
    bookingStatus: "pending",
    messages: [
      {
        id: "m1",
        senderId: "guest",
        content: "Hi! I have a question about the check-in time. Is early check-in available?",
        timestamp: "10:15 AM",
        type: "text",
        isRead: true,
      },
      {
        id: "m2",
        senderId: "provider",
        content: "Hello Sarah! Yes, early check-in is available from 12 PM onwards, subject to availability. I'll make a note on your reservation.",
        timestamp: "10:20 AM",
        type: "text",
        isRead: true,
      },
      {
        id: "m3",
        senderId: "guest",
        content: "That would be perfect! Also, is the airport shuttle service complimentary?",
        timestamp: "10:25 AM",
        type: "text",
        isRead: true,
      },
      {
        id: "m4",
        senderId: "provider",
        content: "Yes, we offer complimentary airport pickup for all our guests. Please share your flight details and we'll arrange everything.",
        timestamp: "10:28 AM",
        type: "text",
        isRead: true,
      },
      {
        id: "m5",
        senderId: "guest",
        content: "Thank you! Looking forward to our stay.",
        timestamp: "10:30 AM",
        type: "text",
        isRead: false,
      },
    ],
  },
  {
    id: "conv-2",
    guestName: "Michael Chen",
    lastMessage: "Can you send me photos of the family room?",
    lastMessageTime: "Yesterday",
    unreadCount: 1,
    bookingId: "BK-102",
    bookingStatus: "pending",
    messages: [
      {
        id: "m1",
        senderId: "guest",
        content: "Hello, I just submitted a booking request for the Family Room.",
        timestamp: "Yesterday 2:00 PM",
        type: "text",
        isRead: true,
      },
      {
        id: "m2",
        senderId: "guest",
        content: "Can you send me photos of the family room?",
        timestamp: "Yesterday 2:05 PM",
        type: "text",
        isRead: false,
      },
    ],
  },
  {
    id: "conv-3",
    guestName: "David Brown",
    lastMessage: "Great, see you then!",
    lastMessageTime: "2 days ago",
    unreadCount: 0,
    bookingId: "BK-104",
    bookingStatus: "confirmed",
    messages: [
      {
        id: "m1",
        senderId: "provider",
        content: "Hi David! Your booking is confirmed. We look forward to hosting you.",
        timestamp: "2 days ago 10:00 AM",
        type: "text",
        isRead: true,
      },
      {
        id: "m2",
        senderId: "guest",
        content: "Great, see you then!",
        timestamp: "2 days ago 10:30 AM",
        type: "text",
        isRead: true,
      },
    ],
  },
  {
    id: "conv-4",
    guestName: "Olivia Martinez",
    lastMessage: "Thank you for the wonderful stay!",
    lastMessageTime: "1 week ago",
    unreadCount: 0,
    bookingId: "BK-105",
    bookingStatus: "completed",
    messages: [
      {
        id: "m1",
        senderId: "guest",
        content: "Thank you for the wonderful stay!",
        timestamp: "1 week ago",
        type: "text",
        isRead: true,
      },
    ],
  },
]

const quickReplies = [
  "Thank you for reaching out!",
  "I'll check and get back to you shortly.",
  "Yes, that can be arranged.",
  "Please let me know if you need anything else.",
]

function ConversationList({
  conversations,
  selectedId,
  onSelect,
  searchQuery,
}: {
  conversations: Conversation[]
  selectedId: string | null
  onSelect: (id: string) => void
  searchQuery: string
}) {
  const filtered = conversations.filter((c) =>
    c.guestName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <ScrollArea className="h-[calc(100vh-16rem)]">
      <div className="space-y-1 p-2">
        {filtered.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation.id)}
            className={cn(
              "flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors",
              selectedId === conversation.id
                ? "bg-primary/10"
                : "hover:bg-muted"
            )}
          >
            <div className="relative">
              <Avatar>
                <AvatarImage src={conversation.guestAvatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {conversation.guestName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {conversation.unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-xs text-destructive-foreground">
                  {conversation.unreadCount}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium truncate">{conversation.guestName}</span>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {conversation.lastMessageTime}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {conversation.lastMessage}
              </p>
              {conversation.bookingId && (
                <Badge
                  variant={
                    conversation.bookingStatus === "confirmed"
                      ? "default"
                      : conversation.bookingStatus === "completed"
                        ? "secondary"
                        : "outline"
                  }
                  className="mt-1 text-xs"
                >
                  {conversation.bookingId}
                </Badge>
              )}
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            No conversations found
          </div>
        )}
      </div>
    </ScrollArea>
  )
}

function MessageBubble({
  message,
  isOwn,
}: {
  message: Message
  isOwn: boolean
}) {
  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-4 py-2",
          isOwn
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        <p className="text-sm">{message.content}</p>
        <div
          className={cn(
            "mt-1 flex items-center justify-end gap-1 text-xs",
            isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          <span>{message.timestamp}</span>
          {isOwn && (
            message.isRead ? (
              <CheckCheck className="h-3 w-3" />
            ) : (
              <Check className="h-3 w-3" />
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProviderMessagesPage() {
  const [conversations, setConversations] = useState(mockConversations)
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    mockConversations[0]?.id || null
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [messageInput, setMessageInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentConversation = conversations.find((c) => c.id === selectedConversation)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [currentConversation?.messages])

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return

    const newMessage: Message = {
      id: `m-${Date.now()}`,
      senderId: "provider",
      content: messageInput,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
      type: "text",
      isRead: false,
    }

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConversation
          ? {
              ...c,
              messages: [...c.messages, newMessage],
              lastMessage: messageInput,
              lastMessageTime: "Just now",
            }
          : c
      )
    )
    setMessageInput("")
  }

  const handleQuickReply = (reply: string) => {
    setMessageInput(reply)
  }

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

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
      </div>

      <div className="grid h-[calc(100vh-12rem)] gap-4 lg:grid-cols-3">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader className="p-3">
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
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversation}
            onSelect={setSelectedConversation}
            searchQuery={searchQuery}
          />
        </Card>

        {/* Chat Area */}
        <Card className="flex flex-col lg:col-span-2">
          {currentConversation ? (
            <>
              {/* Chat Header */}
              <CardHeader className="flex flex-row items-center justify-between border-b p-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={currentConversation.guestAvatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {currentConversation.guestName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{currentConversation.guestName}</h3>
                    {currentConversation.bookingId && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Booking {currentConversation.bookingId}
                        <Badge
                          variant={
                            currentConversation.bookingStatus === "confirmed"
                              ? "default"
                              : currentConversation.bookingStatus === "completed"
                                ? "secondary"
                                : "outline"
                          }
                          className="text-xs"
                        >
                          {currentConversation.bookingStatus}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Info className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Star className="mr-2 h-4 w-4" />
                        Mark as important
                      </DropdownMenuItem>
                      <DropdownMenuItem>View booking details</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        Archive conversation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {currentConversation.messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwn={message.senderId === "provider"}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Quick Replies */}
              <div className="border-t px-4 py-2">
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
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="flex-shrink-0">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="flex-shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex h-full items-center justify-center text-center">
              <div>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold">Select a conversation</h3>
                <p className="text-muted-foreground">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
