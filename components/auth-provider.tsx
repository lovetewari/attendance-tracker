"use client"

import type React from "react"
import { createContext, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

// Define the auth API functions
const authApi = {
  login: async (password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      if (!response.ok) {
        return false
      }

      const data = await response.json()
      return data.success
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  },

  logout: async (): Promise<void> => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
    } catch (error) {
      console.error("Logout error:", error)
    }
  },

  verifyToken: async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/verify", {
        method: "GET",
        // Add cache: 'no-store' to prevent caching
        cache: "no-store",
      })

      if (!response.ok) {
        return false
      }

      const data = await response.json()
      return data.isAuthenticated
    } catch (error) {
      console.error("Verify token error:", error)
      return false
    }
  },
}

// Define the auth context type
export interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: (password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<boolean>
}

// Create the auth context
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const checkAuth = useCallback(async () => {
    try {
      console.log("Checking authentication...")
      const result = await authApi.verifyToken()
      console.log("Authentication result:", result)
      setIsAuthenticated(result)
      return result
    } catch (error) {
      console.error("Auth check error:", error)
      setIsAuthenticated(false)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(
    async (password: string) => {
      setIsLoading(true)
      try {
        console.log("Attempting login...")
        const success = await authApi.login(password)
        console.log("Login success:", success)
        setIsAuthenticated(success)

        if (success) {
          toast({
            title: "Login successful",
            description: "Welcome to NM DECOR Staff Tracker",
          })
          router.push("/dashboard")
        } else {
          toast({
            title: "Login failed",
            description: "Invalid password. Please try again.",
            variant: "destructive",
          })
        }

        return success
      } catch (error) {
        console.error("Login error:", error)
        toast({
          title: "Login error",
          description: "An error occurred during login. Please try again.",
          variant: "destructive",
        })
        setIsAuthenticated(false)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [router, toast],
  )

  const logout = useCallback(async () => {
    try {
      console.log("Logging out from auth context...")
      await authApi.logout()
      setIsAuthenticated(false)

      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })

      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Logout error",
        description: "An error occurred during logout.",
        variant: "destructive",
      })
    }
  }, [router, toast])

  // Check authentication status on initial load
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true)
      checkAuth()
    }
  }, [checkAuth, isInitialized])

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}
