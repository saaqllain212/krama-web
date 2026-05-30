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
    <nav className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5' : 'bg-[#0a0a0a]/80 backdrop-blur-sm'}`}>
      <div className="px-6 md:px-12 lg:px-20">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" onClick={onLogoClick} className="hover:opacity-70 transition-opacity"><KramaLogo size="md" animated={false}/></Link>
          <div className="hidden md:flex items-center gap-10">
            {[['Features','#features'],['How it Works','#how-it-works'],['Pricing','#pricing']].map(([l,h])=>(
              <a key={h} href={h} className="text-xs font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 bg-green-500/15 border border-green-500/30 text-green-400 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"/>Free Now
            </span>
            <Link href="/login" className="hidden sm:inline-flex text-xs font-bold text-white/30 hover:text-white transition-colors px-3 py-2 uppercase tracking-widest">Log in</Link>
            <Link href="/signup" className="btn btn-primary hidden sm:flex items-center gap-2 text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(91,143,249,0.3)]">
              Join Free <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </Link>
            <button onClick={()=>setOpen(!open)} className="md:hidden p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg">{open?<X size={20}/>:<Menu size={20}/>}</button>
          </div>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-white/10 bg-[#0a0a0a]/98 backdrop-blur-xl">
          <div className="px-6 py-4 space-y-1">
            {[['Features','#features'],['How it Works','#how-it-works'],['Pricing','#pricing']].map(([l,h])=>(
              <a key={h} href={h} onClick={()=>setOpen(false)} className="block px-4 py-3 text-xs font-bold text-white/50 hover:text-white hover:bg-white/5 rounded-lg uppercase tracking-widest">{l}</a>
            ))}
            <Link href="/login" onClick={()=>setOpen(false)} className="block px-4 py-3 text-xs font-bold text-white/30 hover:text-white hover:bg-white/5 rounded-lg uppercase tracking-widest">Log in</Link>
            <Link href="/signup" onClick={()=>setOpen(false)} className="block mt-2 btn btn-primary text-center text-xs uppercase tracking-widest">Join Free — No Credit Card</Link>
          </div>
        </div>
      )}
    </nav>
  )
}
