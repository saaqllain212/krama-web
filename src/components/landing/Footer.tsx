'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Mail, Heart, ArrowRight } from 'lucide-react'

export default function Footer() {
  const [showContact, setShowContact] = useState(false)

  return (
    <footer className="border-t border-gray-200 bg-white px-6 pt-16 pb-8 md:px-12">
      <div className="max-w-6xl mx-auto">

        {/* Final CTA — catches bottom-scrollers */}
        <div className="text-center mb-16 pb-12 border-b border-gray-100">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Ready to study smarter?
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Join 500+ students already using Krama. Free forever, or go Pro for ₹149 lifetime.
          </p>
          <Link
            href="/signup"
            className="btn btn-primary inline-flex items-center gap-2 text-base px-8 py-3.5"
          >
            Start for Free <ArrowRight size={18} />
          </Link>
        </div>
        
        {/* Top Row */}
        <div className="flex flex-col items-center justify-between gap-10 md:flex-row md:items-start">
          
          {/* Brand Column */}
          <div className="flex flex-col items-center gap-3 md:items-start max-w-xs">
            <div className="text-2xl font-bold text-gray-900 uppercase tracking-tight">
              Krama
            </div>
            <p className="text-sm text-gray-500 leading-relaxed text-center md:text-left">
              The study tracker built for Indian competitive exams. Focus timer, syllabus map, spaced review, mock analysis — all in one place.
            </p>
            {/* Made in India */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-xs font-semibold text-gray-400">Made with</span>
              <Heart size={12} className="text-red-500 fill-red-500" />
              <span className="text-xs font-semibold text-gray-400">in India 🇮🇳</span>
            </div>
          </div>

          {/* Links Column */}
          <div className="flex flex-col items-center md:items-end gap-6">
            
            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-sm font-medium text-gray-500">
              <Link href="/legal/terms" className="hover:text-gray-900 transition-colors">
                Terms
              </Link>
              <Link href="/legal/privacy" className="hover:text-gray-900 transition-colors">
                Privacy
              </Link>
              <Link href="/legal/refund" className="hover:text-gray-900 transition-colors">
                Refunds
              </Link>
              <Link href="/login" className="hover:text-gray-900 transition-colors">
                Log in
              </Link>
            </div>

            {/* Contact */}
            <div className="h-8 flex items-center">
              {!showContact ? (
                <button 
                  onClick={() => setShowContact(true)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <Mail size={15} />
                  Contact Support
                </button>
              ) : (
                <div className="animate-fade-in flex flex-col items-center md:items-end">
                  <span className="text-sm font-semibold text-gray-900">
                    usekrama.contact@gmail.com
                  </span>
                  <span className="text-xs font-medium text-gray-400 mt-1">
                    Replies within 48-72 hours
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Divider + Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-400 font-medium">
            &copy; {new Date().getFullYear()} Krama Systems. All rights reserved.
          </div>
          <div className="text-xs text-gray-400 font-medium">
            Free forever · Pro ₹149 one-time · No subscriptions
          </div>
        </div>
      </div>
    </footer>
  )
}
