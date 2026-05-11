"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import * as authAPI from "@/lib/api/auth"
import { getAuthCookie, setAuthCookie, clearAuthCookies } from "@/lib/utils/cookies"
import type { CompleteUserProfile } from "@/lib/types"

interface AuthContextType {
  userProfile: CompleteUserProfile | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isAuthReady: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: (idToken: string) => Promise<void>
  registerWithGoogle: (idToken: string, role?: "traveler" | "provider") => Promise<void>
  register: (payload: authAPI.RegisterPayload) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<CompleteUserProfile | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthReady, setIsAuthReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadUserFromCookie()
  }, [])

  async function loadUserFromCookie() {
    const savedToken = getAuthCookie()
    const refreshToken = getAuthCookie(true)

    // If we have no tokens at all, mark as ready
    if (!savedToken && !refreshToken) {
      setIsAuthReady(true)
      return
    }

    setIsLoading(true)
    try {
      // Set token if we have one (even if expired - the API client will refresh it)
      if (savedToken) {
        setToken(savedToken)
      }
      
      // Try to get user profile - the API client will automatically refresh the token if needed
      const profileData = await authAPI.getCurrentUser()
      setUserProfile(profileData)
      
      // Update token in case it was refreshed
      const newToken = getAuthCookie()
      if (newToken) {
        setToken(newToken)
      }
    } catch (error: any) {
      console.error("[v0] Failed to load user from cookie:", error)
      
      // Only clear cookies if it's a 401 (unauthorized) error
      // Other errors might be network issues
      if (error?.status === 401) {
        clearAuthCookies()
        setToken(null)
        setUserProfile(null)
      }
    } finally {
      setIsLoading(false)
      setIsAuthReady(true)
    }
  }

  async function login(email: string, password: string) {
    setIsLoading(true)
    try {
      const response = await authAPI.login({ email, password })
      setAuthCookie(response.access_token)
      setAuthCookie(response.refresh_token, true)
      setToken(response.access_token)

      const profileData = await authAPI.getCurrentUser()
      setUserProfile(profileData)

      router.push(profileData?.role?.is_provider ? "/provider" : "/home")
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  async function loginWithGoogle(idToken: string) {
    setIsLoading(true)
    try {
      const response = await authAPI.loginWithGoogle(idToken)
      setAuthCookie(response.access_token)
      setAuthCookie(response.refresh_token, true)
      setToken(response.access_token)

      const profileData = await authAPI.getCurrentUser()
      setUserProfile(profileData)
      
      // Redirect based on user role
      const isProvider = profileData?.role?.is_provider
      router.push(isProvider ? "/provider" : "/home")
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  async function registerWithGoogle(idToken: string, role?: "traveler" | "provider") {
    setIsLoading(true)
    try {
      const response = await authAPI.registerWithGoogle(idToken, role)
      setAuthCookie(response.access_token)
      setAuthCookie(response.refresh_token, true)
      setToken(response.access_token)

      const profileData = await authAPI.getCurrentUser()
      setUserProfile(profileData)
      
      // Redirect based on user role
      const isProvider = profileData?.role?.is_provider || role === "provider"
      router.push(isProvider ? "/provider" : "/home")
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  async function register(payload: authAPI.RegisterPayload) {
    setIsLoading(true)
    try {
      await authAPI.register(payload)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  function logout() {
    authAPI.logoutAPI()
    clearAuthCookies()
    setToken(null)
    setUserProfile(null)
    router.push("/")
  }

  async function refreshUser() {
    if (!token) return

    try {
      const profileData = await authAPI.getCurrentUser()
      setUserProfile(profileData)
    } catch (error) {
      console.error("[v0] Failed to refresh user:", error)
    }
  }

  const value = {
    userProfile,
    token,
    isAuthenticated: !!userProfile && !!token,
    isLoading,
    isAuthReady,
    login,
    loginWithGoogle,
    registerWithGoogle,
    register,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
