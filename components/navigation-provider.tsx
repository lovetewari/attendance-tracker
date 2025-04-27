"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import { TimelockLoader } from "./timelock-loader"

interface NavigationContextType {
  isNavigating: boolean
  startNavigation: () => void
  endNavigation: () => void
}

const NavigationContext = createContext<NavigationContextType>({
  isNavigating: false,
  startNavigation: () => {},
  endNavigation: () => {},
})

export const useNavigation = () => useContext(NavigationContext)

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false)
  const pathname = usePathname()

  const startNavigation = useCallback(() => {
    setIsNavigating(true)
  }, [])

  const endNavigation = useCallback(() => {
    setIsNavigating(false)
  }, [])

  // End navigation after a timeout to prevent infinite loading
  useEffect(() => {
    if (isNavigating) {
      const timer = setTimeout(() => {
        setIsNavigating(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isNavigating])

  // Track route changes
  useEffect(() => {
    setIsNavigating(false)
  }, [pathname])

  return (
    <NavigationContext.Provider value={{ isNavigating, startNavigation, endNavigation }}>
      {children}
      <TimelockLoader isLoading={isNavigating} />
    </NavigationContext.Provider>
  )
}
