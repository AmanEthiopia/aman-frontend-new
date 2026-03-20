import type { BookingRequest } from "@/lib/types"

export const mockBookings: BookingRequest[] = [
  {
    id: "book-1",
    type: "hotel",
    itemId: "hotel-1",
    itemName: "Sheraton Addis",
    guestName: "Sarah Johnson",
    guestEmail: "sarah@example.com",
    guestPhone: "+1 555 123 4567",
    checkInDate: "2025-01-15",
    checkOutDate: "2025-01-18",
    numGuests: 2,
    message: "Celebrating our anniversary, would love a room with a view if possible.",
    status: "confirmed",
    createdAt: "2025-01-02T10:30:00Z",
    totalPrice: 750,
  },
  {
    id: "book-2",
    type: "hotel",
    itemId: "hotel-4",
    itemName: "Kuriftu Resort Bahir Dar",
    guestName: "Michael Chen",
    guestEmail: "michael@example.com",
    checkInDate: "2025-01-20",
    checkOutDate: "2025-01-23",
    numGuests: 4,
    status: "pending",
    createdAt: "2025-01-05T14:20:00Z",
    totalPrice: 600,
  },
  {
    id: "book-3",
    type: "experience",
    itemId: "exp-5",
    itemName: "Lalibela Rock Churches Guided Tour",
    guestName: "Emma Williams",
    guestEmail: "emma@example.com",
    checkInDate: "2025-02-10",
    numGuests: 2,
    status: "confirmed",
    createdAt: "2025-01-08T09:15:00Z",
    totalPrice: 190,
  },
  {
    id: "book-4",
    type: "transport",
    itemId: "trans-1",
    itemName: "Getachew - Airport Transfer Specialist",
    guestName: "David Brown",
    guestEmail: "david@example.com",
    guestPhone: "+44 7700 123456",
    checkInDate: "2025-01-12",
    numGuests: 3,
    message: "Flight arrives at 6:30 AM, Ethiopian Airlines from London.",
    status: "confirmed",
    createdAt: "2025-01-03T16:45:00Z",
    totalPrice: 35,
  },
]

export function getBookingById(id: string): BookingRequest | undefined {
  return mockBookings.find((b) => b.id === id)
}

export function getBookingsByStatus(status: BookingRequest["status"]): BookingRequest[] {
  return mockBookings.filter((b) => b.status === status)
}
