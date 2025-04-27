import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    // Get the cookie store - use await
    const cookieStore = await cookies()

    // Delete the auth_token cookie
    cookieStore.delete("auth_token")

    // Delete the admin-auth cookie
    cookieStore.delete("admin-auth")

    console.log("Cookies deleted during logout")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ success: false, message: "An error occurred during logout" }, { status: 500 })
  }
}
