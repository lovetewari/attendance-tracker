import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define paths that don't require authentication
const publicPaths = ["/login", "/api/auth/login", "/api/auth/verify", "/api/auth/logout", "/api/seed"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is public
  const isPublicPath = publicPaths.some((path) => pathname === path || pathname.startsWith(path + "/"))

  // Allow access to public paths
  if (isPublicPath) {
    return NextResponse.next()
  }

  // Check for API routes
  const isApiRoute = pathname.startsWith("/api/")

  // Get the token from cookies
  const token = request.cookies.get("auth_token")?.value

  // If no token is present, redirect to login
  if (!token) {
    return isApiRoute
      ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", request.url))
  }

  // For Edge Runtime compatibility, we'll just check if the token exists
  // The actual verification will happen in the API routes
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
