"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Check, X, Loader2, Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import { loginWithPassword } from "@/lib/auth-service"
import { useToast } from "@/hooks/use-toast"

export function LoginForm() {
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (status === "loading") return

    setStatus("loading")

    try {
      const result = await loginWithPassword(password)

      if (result.success) {
        setStatus("success")

        toast({
          title: "Login successful",
          description: "Welcome to NM DECOR Staff Tracker",
        })

        // Redirect immediately instead of waiting for animation
        router.push("/dashboard")
      } else {
        setStatus("error")

        toast({
          title: "Login failed",
          description: result.message || "Invalid password. Please try again.",
          variant: "destructive",
        })

        // Reset error state after a short delay
        setTimeout(() => {
          setStatus("idle")
        }, 1500)
      }
    } catch (error) {
      console.error("Login error:", error)
      setStatus("error")

      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      })

      // Reset error state after a short delay
      setTimeout(() => {
        setStatus("idle")
      }, 1500)
    }
  }

  return (
    <Card className="border shadow-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold flex items-center justify-between">
          Admin Login
          {status === "success" && (
            <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center">
              <Check className="h-5 w-5 text-green-500" />
            </div>
          )}
          {status === "error" && (
            <div className="w-8 h-8 rounded-full bg-red-100 border-2 border-red-500 flex items-center justify-center animate-bounce">
              <X className="h-5 w-5 text-red-500" />
            </div>
          )}
        </CardTitle>
        <CardDescription>Enter your password to access the staff tracker</CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                className={`pl-10 ${status === "error" ? "border-red-500 animate-shake" : ""}`}
                disabled={status === "loading" || status === "success"}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={status === "loading"}>
            {status === "loading" && (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </div>
            )}
            {status === "success" && (
              <div className="flex items-center justify-center">
                <Check className="mr-2 h-4 w-4" />
                Success!
              </div>
            )}
            {status === "error" && (
              <div className="flex items-center justify-center">
                <X className="mr-2 h-4 w-4" />
                Try Again
              </div>
            )}
            {status === "idle" && "Login"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
