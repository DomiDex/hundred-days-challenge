'use client'

import { useState, useEffect } from 'react'

declare global {
  interface Window {
    [key: string]: unknown
  }
}

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('ga-consent')
    if (!consent) {
      setShowBanner(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('ga-consent', 'accepted')
    setShowBanner(false)
    // GA is already loaded, consent is implicit
  }

  const handleDecline = () => {
    localStorage.setItem('ga-consent', 'declined')
    setShowBanner(false)
    // Disable GA
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      window[`ga-disable-${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`] = true
    }
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-4">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          We use cookies to analyze site traffic and improve your experience.
        </p>
        <div className="flex gap-2">
          <button
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            onClick={handleDecline}
          >
            Decline
          </button>
          <button
            className="rounded-md border border-primary bg-primary px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-primary/90"
            onClick={handleAccept}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
