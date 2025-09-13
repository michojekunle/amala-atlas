"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { WifiOff, Wifi } from "lucide-react"
import { cn } from "@/lib/utils"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)

      if (!online) {
        setShowIndicator(true)
      } else {
        // Show "back online" briefly then hide
        setShowIndicator(true)
        setTimeout(() => setShowIndicator(false), 3000)
      }
    }

    // Set initial status
    setIsOnline(navigator.onLine)

    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [])

  if (!showIndicator) return null

  return (
    <Card
      className={cn(
        "fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-3 py-2 shadow-lg transition-all duration-300",
        isOnline
          ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
          : "bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300",
      )}
    >
      <div className="flex items-center space-x-2 text-sm">
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4" />
            <span>Back online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span>You're offline - some features may be limited</span>
          </>
        )}
      </div>
    </Card>
  )
}
