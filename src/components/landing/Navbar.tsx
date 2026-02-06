'use client'

import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="px-6 md:px-12 lg:px-16">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="text-2xl font-black uppercase tracking-tight text-gray-900 hover:text-primary-600 transition-colors">
            Krama
          </Link>

          {/* CTA Button */}
          <Link 
            href="/signup"
            className="btn btn-primary"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </nav>
  )
}