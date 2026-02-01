'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Mail } from 'lucide-react'

export default function Footer() {
  const [showContact, setShowContact] = useState(false)

  return (
    <footer className="border-t-2 border-black bg-white px-6 py-16 md:px-12">
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-between gap-8 md:flex-row">
        
        {/* BRAND & COPYRIGHT */}
        <div className="flex flex-col items-center gap-2 md:items-start">
          <div className="text-xl font-black uppercase tracking-tight">
            Krama
          </div>
          <div className="text-[11px] text-black/40 font-medium">
            &copy; {new Date().getFullYear()} Krama Systems. All rights reserved.
          </div>
        </div>

        {/* LEGAL & CONTACT */}
        <div className="flex flex-col items-center md:items-end gap-4">
          {/* Legal Links */}
          <div className="flex flex-wrap justify-center gap-8 text-xs font-bold uppercase tracking-wider text-black/50">
            <Link 
              href="/legal/terms" 
              className="hover:text-black border-b-2 border-transparent hover:border-brand pb-1 transition-all"
            >
              Terms
            </Link>
            <Link 
              href="/legal/privacy" 
              className="hover:text-black border-b-2 border-transparent hover:border-brand pb-1 transition-all"
            >
              Privacy
            </Link>
            <Link 
              href="/legal/refund" 
              className="hover:text-black border-b-2 border-transparent hover:border-brand pb-1 transition-all"
            >
              Refunds
            </Link>
          </div>

          {/* CONTACT TOGGLE */}
          <div className="h-8 flex items-center">
            {!showContact ? (
              <button 
                onClick={() => setShowContact(true)}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black/50 hover:text-black border-b-2 border-transparent hover:border-brand pb-1 transition-all"
              >
                <Mail size={14} />
                Contact Support
              </button>
            ) : (
              <div className="animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center md:items-end">
                <span className="text-sm font-bold text-black selection:bg-brand">
                  usekrama.contact@gmail.com
                </span>
                <span className="text-[10px] font-medium text-black/40 mt-1">
                  Replies within 48-72 hours
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}