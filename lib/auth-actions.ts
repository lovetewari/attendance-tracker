"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { connectToDatabase } from "@/lib/db/connect"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "nm-decor-secret-key-2025"
const TOKEN_EXPIRY = "7d" // Token expires in 7 days

// Helper function to create JWT token
const createToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
}

// Helper function to verify JWT token
const verifyToken = (token: string): { userId: string } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}

// Auth API object for client-side usage
export const authApi = {
  // Login function
  login: async (password: string): Promise<boolean> => {
    "use server"

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()
      return data.success
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  },

  // Logout function
  logout: async (): Promise<void> => {
    "use server"

    try {
      cookies().delete("auth_token")
    } catch (error) {
      console.error("Logout error:", error)
    }
  },

  // Verify token function
  verifyToken: async (): Promise<boolean> => {
    "use server"

    try {
      const token = cookies().get("auth_token")?.value

      if (!token) {
        return false
      }

      const decoded = verifyToken(token)
      return !!decoded
    } catch (error) {
      console.error("Token verification error:", error)
      return false
    }
  },
}

// Server-side login handler
export async function handleLogin(password: string) {
  try {
    await connectToDatabase()

    // For demo purposes, use a hardcoded password
    const isValidPassword = password === "nmdecor2025"

    if (isValidPassword) {
      // Create a token (using a dummy user ID for demo)
      const token = createToken("admin-user-id")

      // Set the token in a cookie
      cookies().set({
        name: "auth_token",
        value: token,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      return { success: true }
    }

    return { success: false, message: "Invalid password" }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, message: "An error occurred during login" }
  }
}

// Server-side logout handler
export async function handleLogout() {
  cookies().delete("auth_token")
  redirect("/login")
}

// Server-side auth check
export async function checkAuth() {
  const token = cookies().get("auth_token")?.value

  if (!token) {
    return { isAuthenticated: false }
  }

  const decoded = verifyToken(token)
  return { isAuthenticated: !!decoded }
}

// Middleware helper to protect routes
export function requireAuth() {
  const token = cookies().get("auth_token")?.value

  if (!token) {
    redirect("/login")
  }

  const decoded = verifyToken(token)

  if (!decoded) {
    redirect("/login")
  }

  return decoded
}
