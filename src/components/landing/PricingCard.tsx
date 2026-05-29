'use client'
import Link from 'next/link'
import { Check, Zap, Gift, ArrowRight, Clock } from 'lucide-react'
import { useTracker } from '@/analytics/useTracker'
import { EVENTS } from '@/analytics/events'
import { motion } from 'framer-motion'
import { PricingCouponCard } from './PricingCoupon'

const FEATURES = [
  'Focus Timer + Distraction Tracker','Visual Syllabus Tracker (400+ topics)',
  'Spaced Repetition Review System','AI MCQ Generator (your Gemini key)',
  'Study Buddy matching system','Mock Test Analysis — why you failed',
  'Dual Companions (Guardian + Wraith)','XP system, streaks & leaderboard',
  'Topper Benchmarks','Full Analytics Dashboard',
  'Mobile PWA — works offline','Lifetime updates — no expiry',
]

export default function PricingCard() {
  const { track } = useTracker()
  return (
    <section id="pricing" className="px-6 py-24 md:px-12 bg-gray-950 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"/>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"/>
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-green-500/15 border border-green-500/30 px-4 py-2 rounded-full mb-6">
            <Gift className="w-4 h-4 text-green-400"/><span className="text-xs font-black text-green-400 uppercase tracking-wider">Early Access Active</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">Free now. Honest later.</h2>
          <p className="text-xl text-white/40 max-w-2xl mx-auto font-medium">Full access to the first 500 students. No cost, no catch.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start max-w-4xl mx-auto">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
            className="relative rounded-3xl border-2 border-green-500/40 bg-green-500/5 backdrop-blur-sm p-8 overflow-hidden shadow-[0_0_60px_rgba(34,197,94,0.1)]">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-5 py-2 rounded-bl-2xl">🎉 Active Now</div>
            <h3 className="text-xl font-black text-white mb-1">Early Access</h3>
            <p className="text-sm text-white/40 mb-5">First 500 students · Full access</p>
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-6xl font-black text-green-400">₹0</span>
              <div><span className="text-xl text-white/30 line-through font-semibold block">₹149</span><span className="text-sm font-black text-green-400">Free for now</span></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4 mb-7">
              {FEATURES.map((f,i)=>(
                <div key={i} className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-green-400 stroke-[3px]"/>
                  </div>
                  <span className="text-xs font-semibold text-white/60">{f}</span>
                </div>
              ))}
            </div>
            <Link href="/signup"
              onClick={() => track(EVENTS.AUTH_SIGNUP_CLICKED, { location: 'pricing' })}
              className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-400 text-white font-black text-base py-4 rounded-xl transition-all shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_50px_rgba(34,197,94,0.5)]">
              <Zap size={18}/> Join Free — 500 Cap <ArrowRight size={18}/>
            </Link>
            <p className="text-center text-xs text-white/20 mt-3">No credit card · No catch · Takes 30 seconds</p>
          </motion.div>
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.1}}
            className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-8">
            <div className="flex items-center gap-2 mb-1"><Clock size={16} className="text-white/30"/><h3 className="text-xl font-black text-white/30">After Early Access</h3></div>
            <p className="text-sm text-white/20 mb-5">For new users after cap is hit</p>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-6xl font-black text-white/20">₹149</span>
              <div className="text-sm text-white/20 font-semibold">one-time<br/>lifetime</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/10">
              <p className="text-sm font-black text-white/50 mb-2">Why so cheap?</p>
              <ul className="space-y-1.5 text-sm text-white/30">
                <li className="flex items-start gap-2"><span className="text-green-500 font-bold mt-0.5">✓</span>No servers per user — zero infra cost</li>
                <li className="flex items-start gap-2"><span className="text-green-500 font-bold mt-0.5">✓</span>Your Gemini key — no AI cost for us</li>
                <li className="flex items-start gap-2"><span className="text-green-500 font-bold mt-0.5">✓</span>Built by students, priced for students</li>
              </ul>
            </div>
            <div className="text-center text-sm text-white/20">Early access users?<br/><span className="font-black text-primary-400">Full access for life — no charge ever.</span></div>
          </motion.div>
        </div>
        <div className="mt-6 max-w-4xl mx-auto"><PricingCouponCard /></div>
      </div>
    </section>
  )
}
