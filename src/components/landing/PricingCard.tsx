'use client'

import Link from 'next/link'
import { Infinity, Check, Sparkles } from 'lucide-react'
import { useTracker } from '@/analytics/useTracker'
import { EVENTS } from '@/analytics/events'

const FEATURES = [
  'All 4 tools unlocked',
  'Unlimited focus sessions',
  'Your data stays private',
  'No ads, ever',
  '14-day free trial',
]

export default function PricingCard() {
  const { track } = useTracker()

  return (
    <section className="px-6 py-24 md:px-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block border-2 border-black bg-brand px-4 py-1 text-xs font-black uppercase tracking-widest mb-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <Sparkles size={12} className="inline mr-1" /> One-Time Payment
          </div>
          <h2 className="text-4xl font-bold uppercase tracking-tight md:text-5xl">
            The Passport
          </h2>
        </div>

        {/* Card */}
        <div className="mx-auto max-w-lg border-2 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:p-10">
          
          {/* Price Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-black/50 mb-2">
                Krama Lifetime Access
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black tracking-tighter">₹299</span>
                <span className="text-sm font-bold text-black/40 line-through">₹499</span>
              </div>
              <div className="mt-2 text-xs font-medium text-black/50">
                One payment. Forever yours. Price increases soon.
              </div>
            </div>
            <div className="p-3 bg-black rounded-full">
              <Infinity className="h-8 w-8 text-brand stroke-[2px]" />
            </div>
          </div>

          <hr className="border-t-2 border-black/10 my-8" />

          {/* Features */}
          <ul className="space-y-4 mb-10">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm font-medium">
                <div className="flex-shrink-0 w-5 h-5 bg-brand border border-black flex items-center justify-center">
                  <Check size={12} strokeWidth={3} />
                </div>
                {feature}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Link 
            href="/signup"
            onClick={() => track(EVENTS.AUTH_SIGNUP_CLICKED, { location: 'pricing_card' })}
            className="block w-full border-2 border-black bg-brand py-4 text-center text-sm font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            Start 14-Day Free Trial
          </Link>
          
          <p className="mt-4 text-center text-[11px] font-medium text-black/40">
            No credit card required • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  )
}