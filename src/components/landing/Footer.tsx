'use client'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, Heart, Mail } from 'lucide-react'

export default function Footer() {
  const [showContact, setShowContact] = useState(false)
  return (
    <footer className="border-t border-white/10 bg-gray-950 px-6 pt-16 pb-8 md:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Final CTA */}
        <div className="text-center mb-14 pb-12 border-b border-white/10">
          <h3 className="text-2xl md:text-4xl font-black text-white mb-3">Start studying smarter. It's free.</h3>
          <p className="text-white/40 mb-6 max-w-md mx-auto font-medium">500 student cap. Every feature unlocked. No credit card. 30 seconds to join.</p>
          <Link href="/signup" className="btn btn-primary inline-flex items-center gap-2 text-base px-8 py-4 rounded-xl shadow-[0_0_30px_rgba(91,143,249,0.3)]">
            Join Free <ArrowRight size={18}/>
          </Link>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="text-2xl font-black text-white uppercase tracking-tight">Krama</div>
            <p className="text-sm text-white/30 text-center md:text-left max-w-xs">
              The study tracker built for Indian competitive exams. Focus, track, review, compete — free.
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs text-white/20 font-semibold">Made with</span>
              <Heart size={11} className="text-red-500 fill-red-500"/>
              <span className="text-xs text-white/20 font-semibold">in India 🇮🇳</span>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="flex flex-wrap justify-center gap-5 text-sm font-semibold text-white/30">
              <Link href="/legal/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/legal/refund" className="hover:text-white transition-colors">Refund</Link>
              <button onClick={() => setShowContact(!showContact)} className="hover:text-white transition-colors flex items-center gap-1">
                <Mail size={13}/> Contact
              </button>
            </div>
            {showContact && (
              <div className="text-sm bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                📧 <a href="mailto:support@usekrama.com" className="font-bold text-primary-400 hover:underline">support@usekrama.com</a>
              </div>
            )}
            <p className="text-xs text-white/20">© {new Date().getFullYear()} Krama. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
