'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Mail } from 'lucide-react'

export default function Footer() {
  const [showContact, setShowContact] = useState(false)

  return (
    <footer className="border-t border-gray-200 bg-white px-6 py-16 md:px-12">
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-between gap-8 md:flex-row">
        
        {/* BRAND & COPYRIGHT */}
        <div className="flex flex-col items-center gap-2 md:items-start">
          <div className="text-xl font-bold text-gray-900">
            Krama
          </div>
          <div className="text-xs text-gray-400 font-medium">
            &copy; {new Date().getFullYear()} Krama Systems. All rights reserved.
          </div>
        </div>

        {/* LEGAL & CONTACT */}
        <div className="flex flex-col items-center md:items-end gap-4">
          {/* Legal Links */}
          <div className="flex flex-wrap justify-center gap-8 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <Link 
              href="/legal/terms" 
              className="hover:text-gray-900 transition-colors"
            >
              Terms
            </Link>
            <Link 
              href="/legal/privacy" 
              className="hover:text-gray-900 transition-colors"
            >
              Privacy
            </Link>
            <Link 
              href="/legal/refund" 
              className="hover:text-gray-900 transition-colors"
            >
              Refunds
            </Link>
          </div>

          {/* CONTACT TOGGLE */}
          <div className="h-8 flex items-center">
            {!showContact ? (
              <button 
                onClick={() => setShowContact(true)}
                className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
              >
                <Mail size={14} />
                Contact Support
              </button>
            ) : (
              <div className="animate-fade-in flex flex-col items-center md:items-end">
                <span className="text-sm font-semibold text-gray-900">
                  usekrama.contact@gmail.com
                </span>
                <span className="text-[10px] font-medium text-gray-400 mt-1">
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
