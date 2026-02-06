'use client'

import Link from 'next/link'
import KramaLogo from './KramaLogo'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
      <div className="px-6 md:px-12 lg:px-16">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <KramaLogo size="md" animated={false} />
          </Link>

          {/* CTA Button */}
          <Link 
            href="/signup"
            className="btn btn-primary group"
          >
            <span>Start Free Trial</span>
            <svg 
              className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </nav>
  )
}