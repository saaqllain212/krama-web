'use client'
import Link from 'next/link'
import { Check, Zap, Gift, ArrowRight, Clock } from 'lucide-react'
import { useTracker } from '@/analytics/useTracker'
import { EVENTS } from '@/analytics/events'
import { motion } from 'framer-motion'
import { PricingCouponCard } from './PricingCoupon'

const ALL_FEATURES = [
  'Focus Timer + Distraction Tracker',
  'Visual Syllabus Tracker (400+ topics)',
  'Spaced Repetition Review System',
  'AI MCQ Generator (your Gemini key)',
  'Study Buddy matching system',
  'Mock Test Analysis — why you failed',
  'Dual Companions (Guardian + Wraith)',
  'XP system, streaks & weekly leaderboard',
  'Topper Benchmarks',
  'Full Analytics Dashboard',
  'Mobile PWA — works offline',
  'Lifetime updates — no expiry',
]

export default function PricingCard() {
  const { track } = useTracker()
  return (
    <section id="pricing" className="px-6 py-24 md:px-12 lg:px-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-full mb-6">
            <Gift className="w-4 h-4 text-green-600"/>
            <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Early Access Active</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            Free now. Honest later.
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium">
            We're giving full access to the first 500 students. No cost, no catch. When we launch paid access, early users get a lifetime deal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start max-w-4xl mx-auto">
          {/* Free now card */}
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
            className="relative rounded-3xl border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50/60 p-8 overflow-hidden shadow-large">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-5 py-2 rounded-bl-2xl">
              🎉 Active Now
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-1">Early Access</h3>
            <p className="text-sm text-gray-500 mb-5">First 500 students · Full access</p>
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-6xl font-black text-green-600">₹0</span>
              <div>
                <span className="text-xl text-gray-400 line-through font-semibold block">₹149</span>
                <span className="text-sm font-bold text-green-600">Free for now</span>
              </div>
            </div>
            <div className="space-y-2.5 mb-7">
              {ALL_FEATURES.map((f,i)=>(
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-green-600 stroke-[3px]"/>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{f}</span>
                </div>
              ))}
            </div>
            <Link href="/signup"
              onClick={() => track(EVENTS.AUTH_SIGNUP_CLICKED, { location: 'pricing' })}
              className="btn btn-primary w-full flex items-center justify-center gap-2 text-base py-4 rounded-xl">
              <Zap size={18}/> Join Free — 30 Seconds <ArrowRight size={18}/>
            </Link>
            <p className="text-center text-xs text-gray-400 mt-3">No credit card · No catch · 500 cap</p>
          </motion.div>

          {/* After early access — future pricing */}
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.1}}
            className="rounded-3xl border-2 border-gray-200 bg-white p-8 shadow-soft">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={16} className="text-gray-400"/>
              <h3 className="text-xl font-black text-gray-400">After Early Access</h3>
            </div>
            <p className="text-sm text-gray-400 mb-5">For new users after the cap is hit</p>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-6xl font-black text-gray-300">₹149</span>
              <div className="text-sm text-gray-400 font-semibold">one-time<br/>lifetime</div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <p className="text-sm font-bold text-gray-600 mb-2">Why so cheap?</p>
              <ul className="space-y-1.5 text-sm text-gray-500">
                <li className="flex items-start gap-2"><span className="text-green-500 font-bold mt-0.5">✓</span>No servers to maintain — zero infra cost per user</li>
                <li className="flex items-start gap-2"><span className="text-green-500 font-bold mt-0.5">✓</span>Your Gemini key — no AI cost on our side</li>
                <li className="flex items-start gap-2"><span className="text-green-500 font-bold mt-0.5">✓</span>Built by students, priced for students</li>
              </ul>
            </div>
            <div className="text-center text-sm text-gray-400">
              Already in early access?<br/>
              <span className="font-bold text-primary-600">You keep full access for life — no charge.</span>
            </div>
          </motion.div>
        </div>

        <div className="mt-6 max-w-4xl mx-auto">
          <PricingCouponCard />
        </div>
      </div>
    </section>
  )
}
