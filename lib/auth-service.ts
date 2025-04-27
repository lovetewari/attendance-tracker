// Authentication service to interact with the Java backend

// Base API URL - replace with your actual backend URL
const API_URL = "http://localhost:8080/api/auth"

// Types
type LoginResponse = {
  success: boolean
  message: string
  token?: string
  role?: string
}

type VerifyResponse = {
  success: boolean
  role?: string
  message?: string
}

// Login function
export async function loginWithPassword(password: string): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    })

    const data = await response.json()

    if (data.success && data.token) {
      // Store token in localStorage
      localStorage.setItem("auth-token", data.token)
      localStorage.setItem("user-role", data.role || "admin")
    }

    return data
  } catch (error) {
    console.error("Login error:", error)
    return {
      success: false,
      message: "Network error. Please try again.",
    }
  }
}

// Verify token function
export async function verifyToken(): Promise<VerifyResponse> {
  try {
    const token = localStorage.getItem("auth-token")

    if (!token) {
      return { success: false }
    }

    const response = await fetch(`${API_URL}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    })

    const data = await response.json()

    if (!data.success) {
      // Clear invalid token
      localStorage.removeItem("auth-token")
      localStorage.removeItem("user-role")
    }

    return data
  } catch (error) {
    console.error("Token verification error:", error)
    return { success: false, message: "Network error. Please try again." }
  }
}

// Logout function
export async function logout(): Promise<{ success: boolean; message: string }> {
  try {
    const token = localStorage.getItem("auth-token")

    if (token) {
      const response = await fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      // Clear local storage regardless of response
      localStorage.removeItem("auth-token")
      localStorage.removeItem("user-role")

      return data
    }

    // If no token exists, just clear storage
    localStorage.removeItem("auth-token")
    localStorage.removeItem("user-role")

    return { success: true, message: "Logged out successfully" }
  } catch (error) {
    console.error("Logout error:", error)

    // Still clear storage on error
    localStorage.removeItem("auth-token")
    localStorage.removeItem("user-role")

    return { success: true, message: "Logged out successfully" }
  }
}

// Check if user is authenticated (client-side)
export function isAuthenticated(): boolean {
  return !!localStorage.getItem("auth-token")
}
