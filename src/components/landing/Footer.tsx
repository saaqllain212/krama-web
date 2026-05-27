'use client'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, Heart, Mail } from 'lucide-react'

export default function Footer() {
  const [showContact, setShowContact] = useState(false)
  return (
    <footer className="border-t border-gray-200 bg-white px-6 pt-16 pb-8 md:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Final CTA */}
        <div className="text-center mb-14 pb-12 border-b border-gray-100">
          <h3 className="text-2xl md:text-4xl font-black text-gray-900 mb-3">
            Start studying smarter. It's free.
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto font-medium">
            500 student cap. Every feature unlocked. No credit card. 30 seconds to join.
          </p>
          <Link href="/signup" className="btn btn-primary inline-flex items-center gap-2 text-base px-8 py-4 rounded-xl">
            Join Free <ArrowRight size={18}/>
          </Link>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="text-2xl font-black text-gray-900 uppercase tracking-tight">Krama</div>
            <p className="text-sm text-gray-500 text-center md:text-left max-w-xs">
              The study tracker built for Indian competitive exams. Focus, track, review, compete — free.
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs text-gray-400 font-semibold">Made with</span>
              <Heart size={11} className="text-red-500 fill-red-500"/>
              <span className="text-xs text-gray-400 font-semibold">in India 🇮🇳</span>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="flex flex-wrap justify-center gap-5 text-sm font-semibold text-gray-500">
              <Link href="/legal/terms" className="hover:text-gray-900 transition-colors">Terms</Link>
              <Link href="/legal/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link>
              <Link href="/legal/refund" className="hover:text-gray-900 transition-colors">Refund</Link>
              <button onClick={() => setShowContact(!showContact)} className="hover:text-gray-900 transition-colors flex items-center gap-1">
                <Mail size={13}/> Contact
              </button>
            </div>
            {showContact && (
              <div className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200">
                📧 <a href="mailto:support@usekrama.com" className="font-bold text-primary-600 hover:underline">support@usekrama.com</a>
              </div>
            )}
            <p className="text-xs text-gray-400">© {new Date().getFullYear()} Krama. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
