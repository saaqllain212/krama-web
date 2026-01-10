'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Footer() {
  const [showContact, setShowContact] = useState(false)

  return (
    <footer className="border-t-2 border-black bg-white px-6 py-12 md:px-12">
      <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
        
        {/* BRAND & COPYRIGHT */}
        <div className="flex flex-col items-center gap-1 md:items-start">
          <div className="font-black uppercase tracking-tight">
            Krama
          </div>
          <div className="font-mono text-[10px] text-black/40 uppercase">
            &copy; {new Date().getFullYear()} Krama Systems.
          </div>
        </div>

        {/* LEGAL & CONTACT */}
        <div className="flex flex-col items-center md:items-end gap-2">
           <div className="flex flex-wrap justify-center gap-6 font-mono text-xs font-bold uppercase tracking-wide text-black/60">
              <Link href="/legal/terms" className="hover:text-black hover:underline decoration-2 underline-offset-4">
                Terms
              </Link>
              <Link href="/legal/privacy" className="hover:text-black hover:underline decoration-2 underline-offset-4">
                Privacy
              </Link>
              <Link href="/legal/refund" className="hover:text-black hover:underline decoration-2 underline-offset-4">
                Refunds
              </Link>
           </div>

           {/* CONTACT TOGGLE */}
           <div className="mt-2 h-6">
             {!showContact ? (
                <button 
                  onClick={() => setShowContact(true)}
                  className="font-mono text-xs font-bold uppercase tracking-wide text-black/60 hover:text-black hover:underline decoration-2 underline-offset-4"
                >
                  Contact Support
                </button>
             ) : (
                <div className="animate-in fade-in zoom-in duration-300 flex flex-col items-center md:items-end">
                   <span className="font-mono text-xs font-black text-black selection:bg-yellow-300">
                     usekrama.contact@gmail.com
                   </span>
                   <span className="text-[10px] font-bold text-black/40 uppercase tracking-wider">
                     Replies within 48-72 Hours
                   </span>
                </div>
             )}
           </div>
        </div>
      </div>
    </footer>
  )
}