'use client'

import Link from 'next/link'
import { Check, Zap } from 'lucide-react'
import { useTracker } from '@/analytics/useTracker'
import { EVENTS } from '@/analytics/events'
import { PricingCouponCard } from './PricingCoupon'

const FREE_FEATURES = [
  'Focus Timer (unlimited sessions)',
  'Visual Syllabus Tracker',
  'AI MCQ Generator (your API key)',
  'Study streaks & daily goals',
  'Mobile PWA support',
]

const PRO_FEATURES = [
  'Everything in Free',
  'Spaced Repetition System',
  'Mock Test Analysis',
  'Dual Study Companions',
  'Full Analytics Dashboard',
  'Weekly Leaderboard',
  'Streak Earn-Back',
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

        {/* Pricing Cards */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          
          {/* FREE TIER */}
          <div className="card border border-gray-200">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Free</h3>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-4xl font-bold text-gray-900">₹0</span>
                <span className="text-sm text-gray-500 font-medium">forever</span>
              </div>
              <p className="text-sm text-gray-500">Start studying smarter today</p>
            </div>

            <div className="space-y-3 mb-8">
              {FREE_FEATURES.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-gray-600 stroke-[3px]" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <Link
              href="/signup"
              onClick={() => track(EVENTS.AUTH_SIGNUP_CLICKED, { location: 'pricing_free' })}
              className="btn btn-secondary w-full text-center"
            >
              Get Started Free
            </Link>
          </div>

          {/* PRO TIER */}
          <div className="card border-2 border-primary-200 shadow-large relative overflow-hidden">
            {/* Popular badge */}
            <div className="absolute top-0 right-0 bg-primary-500 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-bl-xl">
              Most Popular
            </div>

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Pro</h3>
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-4xl font-bold text-gray-900">₹149</span>
                <span className="text-lg font-semibold text-gray-400 line-through">₹299</span>
              </div>
              <p className="text-sm text-gray-500">
                One-time payment · Lifetime access
              </p>
            </div>

            {/* Coupon */}
            <div className="mb-6">
              <PricingCouponCard />
            </div>

            <div className="space-y-3 mb-8">
              {PRO_FEATURES.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-success-600 stroke-[3px]" />
                  </div>
                  <span className={`text-sm font-medium ${i === 0 ? 'text-primary-600 font-semibold' : 'text-gray-700'}`}>{feature}</span>
                </div>
              ))}
            </div>

            <Link
              href="/signup"
              onClick={() => track(EVENTS.AUTH_SIGNUP_CLICKED, { location: 'pricing_pro' })}
              className="btn btn-primary w-full text-center text-lg"
            >
              Try Pro Free for 14 Days
            </Link>

            <p className="text-center text-sm text-gray-500 mt-4">
              No credit card needed · Pay only if you love it
            </p>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-8 text-center space-y-3">
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="text-amber-400">★★★★★</span>
              <span className="font-medium text-gray-600">4.8/5</span>
            </span>
            <span className="w-px h-4 bg-gray-200" />
            <span><span className="font-semibold text-gray-700">500+</span> students</span>
            <span className="w-px h-4 bg-gray-200" />
            <span>₹149 lifetime</span>
          </div>
          <p className="text-sm text-gray-500">
            <span className="font-semibold">14-day Pro trial included.</span> Not satisfied? Write to us — we genuinely want to improve.
          </p>
        </div>

      </div>
    </section>
  )
}
