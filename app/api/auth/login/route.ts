import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "nm-decor-secret-key-2025"
const TOKEN_EXPIRY = "7d" // Token expires in 7 days

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    console.log("Login attempt with password:", password)

    // For demo purposes, use a hardcoded password
    const isValidPassword = password === "nmdecor2025"
    console.log("Password matched:", isValidPassword)

    if (isValidPassword) {
      // Create a token (using a dummy user ID for demo)
      const token = jwt.sign({ userId: "admin-user-id" }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
      console.log("Token generated")

      // Set the token in a cookie - use await
      const cookieStore = await cookies()
      cookieStore.set({
        name: "auth_token",
        value: token,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
      console.log("Cookie set")

      // Also set a simpler cookie for the middleware
      cookieStore.set({
        name: "admin-auth",
        value: "authenticated",
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
      console.log("Admin auth cookie set")

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, message: "Invalid password" }, { status: 401 })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "An error occurred during login" }, { status: 500 })
  }
}
