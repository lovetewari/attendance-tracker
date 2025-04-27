import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "nm-decor-secret-key-2025"

export async function GET(request: NextRequest) {
  try {
    // Get the token from cookies - use await
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value
    console.log("Verifying token:", token ? "exists" : "missing")

    if (!token) {
      return NextResponse.json({ isAuthenticated: false })
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET)
      console.log("Token verified successfully")
      return NextResponse.json({ isAuthenticated: true, user: decoded })
    } catch (error) {
      console.error("Token verification error:", error)
      return NextResponse.json({ isAuthenticated: false })
    }
  } catch (error) {
    console.error("Auth verification error:", error)
    return NextResponse.json({ isAuthenticated: false }, { status: 500 })
  }
}
