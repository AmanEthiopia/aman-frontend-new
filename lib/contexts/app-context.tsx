"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

// Demo users for role switching (legacy mock shape — kept loose intentionally)
interface DemoUser {
  id: string
  email: string
  name: string
  role: string
  isVerified: boolean
  createdAt: string
  avatar?: string
  phone?: string
  preferences: { language: string; currency: string; notifications: boolean }
}

const demoUsers: Record<string, DemoUser> = {
  guest: {
    id: "",
    email: "",
    name: "Guest",
    role: "guest",
    isVerified: false,
    createdAt: new Date().toISOString(),
    preferences: { language: "en", currency: "USD", notifications: false },
  },
  traveler: {
    id: "user-demo-traveler",
    email: "traveler@demo.com",
    name: "Alex Traveler",
    avatar: "/placeholder.svg?height=40&width=40",
    phone: "+1 555 987 6543",
    role: "traveler",
    isVerified: true,
    createdAt: "2024-06-15T10:00:00Z",
    preferences: { language: "en", currency: "USD", notifications: true },
  },
  provider: {
    id: "user-demo-provider",
    email: "provider@demo.com",
    name: "Abebe Hotel Owner",
    avatar: "/placeholder.svg?height=40&width=40",
    phone: "+251 91 234 5678",
    role: "provider",
    isVerified: true,
    createdAt: "2024-01-10T08:00:00Z",
    preferences: { language: "en", currency: "ETB", notifications: true },
  },
}

interface AppContextType {
  // User & Role
  user: DemoUser
  isAuthenticated: boolean
  switchRole: (role: "guest" | "traveler" | "provider") => void

  // Preferences
  language: "en" | "am"
  setLanguage: (lang: "en" | "am") => void
  currency: "USD" | "ETB"
  setCurrency: (currency: "USD" | "ETB") => void

  // UI State
  isAIAssistantOpen: boolean
  setIsAIAssistantOpen: (open: boolean) => void

  // Saved items
  savedItems: string[]
  toggleSavedItem: (itemId: string) => void
  isItemSaved: (itemId: string) => boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser>(demoUsers.guest)
  const [language, setLanguage] = useState<"en" | "am">("en")
  const [currency, setCurrency] = useState<"USD" | "ETB">("USD")
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)
  const [savedItems, setSavedItems] = useState<string[]>([])

  const isAuthenticated = user.role !== "guest"

  const switchRole = useCallback((role: "guest" | "traveler" | "provider") => {
    setUser(demoUsers[role])
  }, [])

  const toggleSavedItem = useCallback((itemId: string) => {
    setSavedItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }, [])

  const isItemSaved = useCallback((itemId: string) => savedItems.includes(itemId), [savedItems])

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        switchRole,
        language,
        setLanguage,
        currency,
        setCurrency,
        isAIAssistantOpen,
        setIsAIAssistantOpen,
        savedItems,
        toggleSavedItem,
        isItemSaved,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
