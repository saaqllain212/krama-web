'use client'
// Section 6 — Pricing + Footer merged
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import { Check, Zap, Gift, ArrowRight, Clock, Mail, Heart } from 'lucide-react'
import { useTracker } from '@/analytics/useTracker'
import { EVENTS } from '@/analytics/events'
import { PricingCouponCard } from './PricingCoupon'

const FEATURES = [
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

export default function SectionSix() {
  const { track } = useTracker()
  const [showContact, setShowContact] = useState(false)

  return (
    <section id="pricing" className="bg-[#f5f2ee]">

      {/* Pricing */}
      <div className="py-28 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">

          <div className="flex items-center gap-4 mb-16">
            <span className="text-[10px] font-black text-black/20 uppercase tracking-widest">07</span>
            <div className="h-px w-8 bg-black/20"/>
            <span className="text-[10px] font-black text-black/30 uppercase tracking-widest">Pricing</span>
          </div>

          <motion.h2 initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
            transition={{duration:0.8,ease:[0.16,1,0.3,1]}}
            className="text-4xl md:text-6xl font-black text-black mb-4 tracking-tight leading-tight"
            style={{fontFamily:"'Playfair Display',Georgia,serif",fontStyle:'italic'}}>
            Free now.<br/>Honest later.
          </motion.h2>
          <motion.p initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.1,duration:0.7}}
            className="text-lg text-black/40 max-w-xl mb-16 font-medium">
            Full access to the first 500 students. No cost, no catch. When we start charging — it&apos;s ₹149 once, forever.
          </motion.p>

          <div className="grid md:grid-cols-2 gap-px border border-black/10 max-w-4xl">

            {/* Free now */}
            <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
              className="bg-black p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-5 py-2">
                🎉 Active Now
              </div>
              <h3 className="text-lg font-black text-white mb-1 uppercase tracking-widest">Early Access</h3>
              <p className="text-xs text-white/30 mb-6 font-bold uppercase tracking-widest">First 500 students · Full access</p>
              <div className="flex items-baseline gap-3 mb-8">
                <span className="text-7xl font-black text-green-400">₹0</span>
                <div>
                  <span className="text-xl text-white/20 line-through font-semibold block">₹149</span>
                  <span className="text-xs font-black text-green-400 uppercase tracking-widest">Free for now</span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-y-2.5 mb-8">
                {FEATURES.map((f,i)=>(
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 border border-green-500/40 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-green-400 stroke-[3px]"/>
                    </div>
                    <span className="text-xs font-semibold text-white/50">{f}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => { track(EVENTS.AUTH_SIGNUP_CLICKED,{location:'pricing'}); window.location.href='/signup' }}
                className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-black text-xs py-4 uppercase tracking-widest transition-all shadow-[0_0_40px_rgba(34,197,94,0.3)] hover:shadow-[0_0_60px_rgba(34,197,94,0.5)]">
                <Zap size={15}/> Join Free — 500 Cap <ArrowRight size={15}/>
              </button>
              <p className="text-center text-[10px] text-white/20 mt-3 uppercase tracking-widest">No credit card · No catch</p>
            </motion.div>

            {/* After early access */}
            <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.1}}
              className="bg-[#f0ede8] p-10 border border-black/10">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={15} className="text-black/25"/>
                <h3 className="text-lg font-black text-black/30 uppercase tracking-widest">After Early Access</h3>
              </div>
              <p className="text-xs text-black/25 mb-6 font-bold uppercase tracking-widest">For new users after cap is hit</p>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-7xl font-black text-black/20">₹149</span>
                <div className="text-sm text-black/20 font-semibold">one-time<br/>lifetime</div>
              </div>
              <div className="bg-white border border-black/8 p-5 mb-6">
                <p className="text-xs font-black text-black/40 mb-3 uppercase tracking-widest">Why so cheap?</p>
                <ul className="space-y-2 text-xs text-black/40">
                  <li className="flex items-start gap-2"><span className="text-green-600 font-bold mt-0.5">✓</span>No servers per user — zero infra cost</li>
                  <li className="flex items-start gap-2"><span className="text-green-600 font-bold mt-0.5">✓</span>Your Gemini key — no AI cost for us</li>
                  <li className="flex items-start gap-2"><span className="text-green-600 font-bold mt-0.5">✓</span>Built by students, priced for students</li>
                </ul>
              </div>
              <div className="text-center text-sm text-black/25 leading-relaxed">
                Early access users?<br/>
                <span className="font-black text-black/50">Full access for life — no charge ever.</span>
              </div>
            </motion.div>
          </div>

          <div className="mt-8 max-w-4xl">
            <PricingCouponCard/>
          </div>

        </div>
      </div>

      {/* Footer — flows directly from pricing */}
      <footer className="border-t border-black/8 px-6 pt-16 pb-8 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          {/* Final CTA */}
          <div className="text-center mb-16 pb-12 border-b border-black/8">
            <h3 className="text-3xl md:text-5xl font-black text-black mb-3 tracking-tight"
              style={{fontFamily:"'Playfair Display',Georgia,serif",fontStyle:'italic'}}>
              Start studying smarter.<br/>It&apos;s free.
            </h3>
            <p className="text-black/40 mb-8 max-w-sm mx-auto font-medium">500 student cap. Every feature unlocked. 30 seconds to join.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 bg-black text-white font-black text-xs px-10 py-4 uppercase tracking-widest hover:bg-primary-500 transition-colors duration-300">
              Join Free <ArrowRight size={15}/>
            </Link>
          </div>

          {/* Footer links */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="text-xl font-black text-black uppercase tracking-tight">Krama</div>
              <p className="text-xs text-black/30 text-center md:text-left max-w-xs font-medium">
                The study tracker built for Indian competitive exams.
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] text-black/20 font-semibold">Made with</span>
                <Heart size={10} className="text-red-500 fill-red-500"/>
                <span className="text-[10px] text-black/20 font-semibold">in India 🇮🇳</span>
              </div>
            </div>
            <div className="flex flex-col items-center md:items-end gap-4">
              <div className="flex flex-wrap justify-center gap-6 text-xs font-black text-black/25 uppercase tracking-widest">
                <Link href="/legal/terms" className="hover:text-black transition-colors">Terms</Link>
                <Link href="/legal/privacy" className="hover:text-black transition-colors">Privacy</Link>
                <Link href="/legal/refund" className="hover:text-black transition-colors">Refund</Link>
                <button onClick={()=>setShowContact(!showContact)} className="hover:text-black transition-colors flex items-center gap-1">
                  <Mail size={12}/> Contact
                </button>
              </div>
              {showContact && (
                <div className="text-xs bg-white border border-black/10 px-4 py-2.5">
                  📧 <a href="mailto:support@usekrama.com" className="font-black text-black hover:underline">support@usekrama.com</a>
                </div>
              )}
              <p className="text-[10px] text-black/20 font-bold uppercase tracking-widest">© {new Date().getFullYear()} Krama. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </section>
  )
}
