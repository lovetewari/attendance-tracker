"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CalendarIcon, BarChart3, Users, DollarSign, Home, X } from "lucide-react"
import { verifyToken, logout } from "@/lib/auth-service"

export default function MenuPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication on component mount
  useEffect(() => {
    async function checkAuth() {
      setIsLoading(true)
      const result = await verifyToken()

      if (!result.success) {
        router.push("/")
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  // Handle logout
  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" />
                <path d="M9 22V12" />
                <path d="M15 22V12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold">NM DECOR</h1>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="icon" className="rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8">
          <div className="space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <Home className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Dashboard</div>
                <div className="text-sm text-muted-foreground">Return to dashboard</div>
              </div>
            </Link>
            <Link
              href="/attendance"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <CalendarIcon className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Attendance</div>
                <div className="text-sm text-muted-foreground">Track daily attendance</div>
              </div>
            </Link>
            <Link
              href="/expenses"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Expenses</div>
                <div className="text-sm text-muted-foreground">Manage expenses</div>
              </div>
            </Link>
            <Link
              href="/employees"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <Users className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Employees</div>
                <div className="text-sm text-muted-foreground">Manage team members</div>
              </div>
            </Link>
            <Link
              href="/reports"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <BarChart3 className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Reports</div>
                <div className="text-sm text-muted-foreground">View history and reports</div>
              </div>
            </Link>
            <div className="mt-4">
              <Button variant="destructive" className="w-full" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
