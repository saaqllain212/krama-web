'use client'

import Link from 'next/link'
import { Check, Zap } from 'lucide-react'
import { useTracker } from '@/analytics/useTracker'
import { EVENTS } from '@/analytics/events'
import { PricingCouponCard } from './PricingCoupon'

const FEATURES = [
  'AI MCQ Generator',
  'Dual Study Companions',
  'Pomodoro Focus Timer',
  'Visual Syllabus Tracker',
  'Spaced Repetition System',
  'Mock Test Logger',
  'Unlimited Focus Sessions',
  'Your data stays private',
  'No ads, ever',
  'Lifetime updates',
]

export default function PricingCard() {
  const { track } = useTracker()

  return (
    <section id="pricing" className="px-6 py-24 md:px-12 lg:px-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary-100 px-4 py-2 rounded-full mb-6">
            <Zap className="w-4 h-4 text-primary-600" />
            <span className="text-xs font-semibold text-primary-700 uppercase tracking-wider">One-Time Payment</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4 md:text-5xl">
            Simple, Honest Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            One payment. Lifetime access. No subscriptions. No hidden fees.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-lg mx-auto">
          <div className="card border-2 border-primary-200 shadow-large hover:shadow-glow-primary transition-all">
            
            {/* Header */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Krama Lifetime Access</h3>
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-5xl font-bold text-gray-900">₹299</span>
                <span className="text-2xl font-semibold text-gray-400 line-through">₹499</span>
              </div>
              <p className="text-sm text-gray-600">
                Limited time offer • Price increases soon
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-8">
              {FEATURES.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-success-600 stroke-[3px]" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link
              href="/signup"
              onClick={() => track(EVENTS.AUTH_SIGNUP_CLICKED, { location: 'pricing_section' })}
              className="btn btn-primary w-full text-center text-lg"
            >
              Start 14-Day Free Trial
            </Link>

            {/* Add the coupon card */}
            <div className="mb-8">
              <PricingCouponCard />
            </div>

            <p className="text-center text-sm text-gray-500 mt-4">
              No credit card required
            </p>
          </div>

          {/* Trust Badge */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">14-day free trial.</span> Not satisfied? Write to us — we genuinely want to improve.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}