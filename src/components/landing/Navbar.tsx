'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import KramaLogo from './KramaLogo'
import { Menu, X } from 'lucide-react'
interface NavbarProps { onLogoClick?: () => void }
export default function Navbar({ onLogoClick }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])
  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-gray-950/95 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-white/5' : 'bg-gray-950/80 backdrop-blur-sm'}`}>
      <div className="px-6 md:px-12 lg:px-16">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" onClick={onLogoClick} className="hover:opacity-80 transition-opacity">
            <KramaLogo size="md" animated={false} />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {[['Features','#features'],['How it Works','#how-it-works'],['Pricing','#pricing']].map(([l,h])=>(
              <a key={h} href={h} className="text-sm font-semibold text-white/50 hover:text-white transition-colors">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 bg-green-500/15 border border-green-500/30 text-green-400 text-[11px] font-black px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"/>Free Now
            </span>
            <Link href="/login" className="hidden sm:inline-flex text-sm font-semibold text-white/40 hover:text-white transition-colors px-3 py-2">Log in</Link>
            <Link href="/signup" className="btn btn-primary hidden sm:flex items-center gap-2 shadow-[0_0_20px_rgba(91,143,249,0.3)] hover:shadow-[0_0_30px_rgba(91,143,249,0.5)] transition-all">
              Join Free <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </Link>
            <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              {open ? <X size={22}/> : <Menu size={22}/>}
            </button>
          </div>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-white/10 bg-gray-950/98 backdrop-blur-xl">
          <div className="px-6 py-4 space-y-1">
            {[['Features','#features'],['How it Works','#how-it-works'],['Pricing','#pricing']].map(([l,h])=>(
              <a key={h} href={h} onClick={()=>setOpen(false)} className="block px-4 py-3 text-sm font-semibold text-white/60 hover:text-white hover:bg-white/5 rounded-lg">{l}</a>
            ))}
            <Link href="/login" onClick={()=>setOpen(false)} className="block px-4 py-3 text-sm font-semibold text-white/40 hover:text-white hover:bg-white/5 rounded-lg">Log in</Link>
            <Link href="/signup" onClick={()=>setOpen(false)} className="block mt-2 btn btn-primary text-center">Join Free — No Credit Card</Link>
          </div>
        </div>
      )}
    </nav>
  )
}
