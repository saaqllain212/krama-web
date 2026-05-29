'use client'
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
export default function TopBanner() {
  const [visible, setVisible] = useState(false)
  useEffect(() => { if (!localStorage.getItem('kb-v3')) setVisible(true) }, [])
  if (!visible) return null
  return (
    <div className="relative z-50 bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 text-white py-2.5 px-4 text-center">
      <span className="inline-flex items-center gap-2 flex-wrap justify-center text-xs font-bold uppercase tracking-wide">
        <span className="animate-pulse w-2 h-2 bg-white rounded-full opacity-80 inline-block" />
        🎉 Early Access — Every feature FREE right now · No credit card · 500 student cap
        <span className="animate-pulse w-2 h-2 bg-white rounded-full opacity-80 inline-block" />
      </span>
      <button onClick={() => { setVisible(false); localStorage.setItem('kb-v3','1') }}
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"><X size={14}/></button>
    </div>
  )
}
