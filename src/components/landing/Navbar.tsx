'use client'

import Link from 'next/link'
import { useTracker } from '@/analytics/useTracker'
import { EVENTS } from '@/analytics/events'

export default function Navbar() {
  const { track } = useTracker()

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b-2 border-black bg-white px-6 py-4 md:px-12">
      {/* Logo */}
      <Link href="/" className="text-2xl font-black uppercase tracking-tight hover:text-brand transition-colors">
        Krama
      </Link>

      {/* CTA Button */}
      <Link 
        href="/signup"
        onClick={() => track(EVENTS.AUTH_SIGNUP_CLICKED)}
        className="font-bold border-2 border-black bg-brand px-6 py-2.5 text-sm uppercase tracking-wide text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
      >
        Start Free Trial
      </Link>
    </nav>
  )
}