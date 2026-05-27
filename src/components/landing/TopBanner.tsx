'use client'
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export default function TopBanner() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const d = localStorage.getItem('krama-banner-v2')
    if (!d) setVisible(true)
  }, [])
  if (!visible) return null
  return (
    <div className="relative z-50 bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 text-white py-2.5 px-4 text-center text-xs font-bold tracking-wide uppercase">
      <span className="inline-flex items-center gap-2 flex-wrap justify-center">
        <span className="animate-pulse inline-block w-2 h-2 bg-white rounded-full opacity-80" />
        🎉 Early Access — Every feature is completely FREE right now · 500 student cap · No credit card
        <span className="animate-pulse inline-block w-2 h-2 bg-white rounded-full opacity-80" />
      </span>
      <button onClick={() => { setVisible(false); localStorage.setItem('krama-banner-v2','1') }}
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  )
}
