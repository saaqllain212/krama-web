'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import KramaLogo from './KramaLogo'
import { Menu, X } from 'lucide-react'

interface NavbarProps { onLogoClick?: () => void }

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
]

export default function Navbar({ onLogoClick }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-lg shadow-sm border-b border-gray-200/50' : 'bg-white/80 backdrop-blur-sm'}`}>
      <div className="px-6 md:px-12 lg:px-16">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" onClick={onLogoClick} className="hover:opacity-80 transition-opacity">
            <KramaLogo size="md" animated={false} />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <a key={link.href} href={link.href}
                className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {/* Free badge in nav */}
            <span className="hidden md:inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-[11px] font-bold px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Free Now
            </span>
            <Link href="/login" className="hidden sm:inline-flex text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors px-3 py-2">
              Log in
            </Link>
            <Link href="/signup"
              className={`btn btn-primary hidden sm:flex items-center gap-2 transition-all duration-300 ${scrolled ? 'ring-2 ring-primary-300 ring-offset-2' : ''}`}>
              Join Free
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200/50 bg-white/98 backdrop-blur-lg">
          <div className="px-6 py-4 space-y-1">
            {NAV_LINKS.map(link => (
              <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                {link.label}
              </a>
            ))}
            <Link href="/login" onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg">
              Log in
            </Link>
            <Link href="/signup" onClick={() => setMobileOpen(false)}
              className="block mt-2 btn btn-primary text-center">
              Join Free — No Credit Card
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
