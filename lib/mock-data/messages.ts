import type { Message, Conversation } from "@/lib/types"

export const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    participants: [
      { id: "user-1", name: "Sarah Johnson", type: "guest" },
      { id: "provider-1", name: "Sheraton Addis", type: "provider" },
    ],
    lastMessage: {
      id: "msg-3",
      conversationId: "conv-1",
      senderId: "provider-1",
      senderType: "provider",
      senderName: "Sheraton Addis",
      content: "Your room has been upgraded to a suite with a city view. See you on the 15th!",
      createdAt: "2025-01-10T14:30:00Z",
      isRead: true,
    },
    unreadCount: 0,
    bookingId: "book-1",
    createdAt: "2025-01-08T10:00:00Z",
  },
  {
    id: "conv-2",
    participants: [
      { id: "user-2", name: "Michael Chen", type: "guest" },
      { id: "provider-4", name: "Kuriftu Resort", type: "provider" },
    ],
    lastMessage: {
      id: "msg-5",
      conversationId: "conv-2",
      senderId: "user-2",
      senderType: "guest",
      senderName: "Michael Chen",
      content: "Can we arrange a boat tour on the second day of our stay?",
      createdAt: "2025-01-11T09:15:00Z",
      isRead: false,
    },
    unreadCount: 1,
    bookingId: "book-2",
    createdAt: "2025-01-09T16:00:00Z",
  },
]

export const mockMessages: Message[] = [
  {
    id: "msg-1",
    conversationId: "conv-1",
    senderId: "user-1",
    senderType: "guest",
    senderName: "Sarah Johnson",
    content: "Hi, we're celebrating our 10th anniversary. Is it possible to arrange something special?",
    createdAt: "2025-01-08T10:00:00Z",
    isRead: true,
  },
  {
    id: "msg-2",
    conversationId: "conv-1",
    senderId: "provider-1",
    senderType: "provider",
    senderName: "Sheraton Addis",
    content:
      "Congratulations on your anniversary! We would be delighted to make it special. Would you like champagne and flowers in your room upon arrival?",
    createdAt: "2025-01-08T11:30:00Z",
    isRead: true,
  },
  {
    id: "msg-3",
    conversationId: "conv-1",
    senderId: "provider-1",
    senderType: "provider",
    senderName: "Sheraton Addis",
    content: "Your room has been upgraded to a suite with a city view. See you on the 15th!",
    createdAt: "2025-01-10T14:30:00Z",
    isRead: true,
  },
  {
    id: "msg-4",
    conversationId: "conv-2",
    senderId: "provider-4",
    senderType: "provider",
    senderName: "Kuriftu Resort",
    content:
      "Welcome! We're looking forward to hosting you. Is there anything specific you'd like to experience during your stay?",
    createdAt: "2025-01-09T16:00:00Z",
    isRead: true,
  },
  {
    id: "msg-5",
    conversationId: "conv-2",
    senderId: "user-2",
    senderType: "guest",
    senderName: "Michael Chen",
    content: "Can we arrange a boat tour on the second day of our stay?",
    createdAt: "2025-01-11T09:15:00Z",
    isRead: false,
  },
]

export function getConversationById(id: string): Conversation | undefined {
  return mockConversations.find((c) => c.id === id)
}

export function getMessagesByConversation(conversationId: string): Message[] {
  return mockMessages.filter((m) => m.conversationId === conversationId)
}
