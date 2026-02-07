'use client'

import { X } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function TopBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
    // Check if user has dismissed the banner
    const dismissed = localStorage.getItem('coupon-banner-dismissed')
    if (dismissed) {
      setIsVisible(false)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('coupon-banner-dismissed', 'true')
  }

  // Don't render anything until mounted (prevents hydration mismatch)
  if (!mounted || !isVisible) return null

  return (
    <div className="relative bg-gradient-to-r from-primary-600 via-primary-500 to-purple-600 px-4 py-3 text-center text-white shadow-lg">
      {/* Subtle animated shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      
      <div className="relative flex items-center justify-center gap-3 flex-wrap">
        {/* Launch badge */}
        <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
          🚀 <span>Launch Offer</span>
        </span>
        
        {/* Main message */}
        <p className="text-xs font-medium md:text-sm flex items-center gap-2 flex-wrap">
          <span className="font-bold">First 100 Users</span> 
          <span className="text-white/90">get</span>
          <span className="font-bold text-lg">₹150 OFF</span>
        </p>
        
        {/* Divider */}
        <span className="hidden md:inline text-white/30">•</span>
        
        {/* Coupon code */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/90">Use Code:</span>
          <code className="bg-white/90 text-primary-600 px-3 py-1 font-bold text-sm tracking-wider rounded-md hover:bg-white transition-colors cursor-pointer select-all">
            NEW2026
          </code>
        </div>
      </div>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-1"
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}