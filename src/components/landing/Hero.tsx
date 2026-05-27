'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Flame, BookOpen, Target, Users, CheckCircle, Timer } from 'lucide-react'
import { useTracker } from '@/analytics/useTracker'
import { EVENTS } from '@/analytics/events'
import { motion } from 'framer-motion'

function CountUp({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = end / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [end, duration])
  return <span className="tabular-nums">{count}</span>
}

function LiveMockup() {
  const [progress, setProgress] = useState(0)
  useEffect(() => { const t = setTimeout(() => setProgress(72), 700); return () => clearTimeout(t) }, [])
  const bars = [45, 90, 60, 120, 30, 75, 0]
  const days = ['M','T','W','T','F','S','S']
  return (
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-[420px]">
      <div className="absolute -inset-6 bg-gradient-to-br from-primary-400/25 via-purple-400/20 to-cyan-400/20 rounded-[2rem] blur-3xl" />
      <div className="relative bg-white rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden">
        {/* Header bar */}
        <div className="bg-gradient-to-r from-primary-500 to-purple-600 px-5 pt-5 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Today's Focus</p>
              <p className="text-white text-3xl font-black mt-0.5 tabular-nums">
                <CountUp end={4} duration={1200} />h <CountUp end={20} duration={1600} />m
              </p>
            </div>
            <div className="relative w-14 h-14">
              <svg className="-rotate-90" width="56" height="56" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="22" stroke="rgba(255,255,255,0.2)" strokeWidth="5" fill="none"/>
                <circle cx="28" cy="28" r="22" stroke="white" strokeWidth="5" fill="none"
                  strokeLinecap="round" strokeDasharray={138.2}
                  strokeDashoffset={138.2 - (progress/100)*138.2}
                  className="transition-all duration-1000 ease-out" style={{transitionDelay:'0.7s'}}/>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-xs font-black">{progress}%</span>
              </div>
            </div>
          </div>
          {/* Week bars */}
          <div className="flex items-end gap-1.5 h-8">
            {bars.map((m, i) => (
              <motion.div key={i} className="flex-1 flex flex-col items-center gap-0.5"
                initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                transition={{ delay: 1 + i*0.07, duration: 0.35, ease: 'easeOut' }}
                style={{ transformOrigin: 'bottom' }}>
                <div className={`w-full rounded-sm ${m===0?'bg-white/20':m>=90?'bg-white':'m>=60?bg-white/80':'bg-white/50'}`}
                  style={{ height: `${Math.max(m===0?2:4,(m/120)*22)}px`, backgroundColor: m===0?'rgba(255,255,255,0.2)':m>=90?'white':m>=60?'rgba(255,255,255,0.8)':'rgba(255,255,255,0.5)' }}/>
                <span className="text-[8px] font-bold text-white/50">{days[i]}</span>
              </motion.div>
            ))}
          </div>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-3 border-b border-gray-100">
          {[{icon:Flame,v:'12🔥',l:'Streak',c:'text-orange-500'},{icon:BookOpen,v:'47%',l:'Syllabus',c:'text-cyan-600'},{icon:Target,v:'85',l:'Mock',c:'text-green-600'}].map((s,i)=>(
            <motion.div key={s.l} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
              transition={{delay:1.4+i*0.1}}
              className="flex flex-col items-center py-3.5 border-r border-gray-100 last:border-r-0">
              <span className="text-base font-black text-gray-900">{s.v}</span>
              <span className="text-[10px] font-semibold text-gray-400 mt-0.5">{s.l}</span>
            </motion.div>
          ))}
        </div>
        {/* Buddy strip */}
        <div className="flex items-center gap-2.5 px-5 py-3 bg-purple-50">
          <div className="flex -space-x-1.5">
            {['A','R','S'].map((l,i)=>(
              <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-[9px] font-black text-white border-2 border-white">{l}</div>
            ))}
          </div>
          <span className="text-[11px] font-bold text-purple-700">🤝 Buddy: Arjun studied 6h today · you're ahead!</span>
        </div>
        {/* XP bar */}
        <div className="px-5 py-3 border-t border-gray-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Level 4 · Scholar</span>
            <span className="text-[10px] font-bold text-primary-600">286 XP</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full"
              initial={{width:0}} animate={{width:'68%'}} transition={{delay:1.6,duration:0.8,ease:'easeOut'}}/>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Hero() {
  const { track } = useTracker()
  return (
    <section className="relative min-h-[94vh] flex items-center px-6 py-16 md:px-12 lg:px-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/90 via-white to-purple-50/70" />
      <div className="absolute inset-0 opacity-[0.03]"
        style={{backgroundImage:`radial-gradient(circle at 1px 1px,rgba(0,0,0,1) 1px,transparent 0)`,backgroundSize:'28px 28px'}}/>
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl" />

      <div className="relative z-10 grid grid-cols-1 items-center gap-14 md:grid-cols-2 md:gap-16 max-w-7xl mx-auto w-full">
        {/* LEFT */}
        <div className="flex flex-col items-start gap-7">

          {/* Free pill */}
          <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.5}}
            className="flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
            <span className="text-xs font-bold text-green-700">🎉 100% Free right now — no credit card, no catch</span>
          </motion.div>

          {/* Headline — pain first */}
          <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:0.7,delay:0.1}}>
            <h1 className="text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-[4.5rem]">
              You study hard.<br />
              <span className="text-gradient">But still forget.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg md:text-xl font-medium text-gray-500 leading-relaxed">
              Krama tracks every minute you study, tells you exactly what to revise before your brain forgets it, and finds you a study buddy — so you never fall off again.
            </p>
          </motion.div>

          {/* Exam tags */}
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.2}}
            className="flex flex-wrap gap-2">
            {['UPSC','JEE','NEET','SSC','RBI Grade B','Bank PO'].map(e=>(
              <span key={e} className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-700 shadow-sm">{e}</span>
            ))}
          </motion.div>

          {/* 4 bullets */}
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.28}}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
            {[
              {icon:Timer, text:'Focus timer — tracks when you really study'},
              {icon:BookOpen, text:'Spaced review — never forget anything again'},
              {icon:Target, text:'AI MCQs from your own notes, zero cost'},
              {icon:Users, text:'Study buddy matched to your exam & goal'},
            ].map((item,i)=>(
              <div key={i} className="flex items-center gap-2.5 bg-white/70 border border-gray-100 rounded-xl px-3 py-2.5 shadow-sm">
                <div className="w-7 h-7 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
                  <item.icon size={14} className="text-primary-600"/>
                </div>
                <span className="text-sm font-semibold text-gray-700">{item.text}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.38}}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link href="/signup"
              onClick={() => track(EVENTS.AUTH_SIGNUP_CLICKED, { location: 'hero' })}
              className="btn btn-primary group inline-flex items-center gap-3 text-base md:text-lg px-8 py-4 rounded-xl shadow-glow-primary">
              Join Free — Takes 30 Seconds
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1"/>
            </Link>
            <p className="text-sm text-gray-400 font-medium">500 student cap · <span className="text-red-500 font-bold">spots filling fast</span></p>
          </motion.div>

          {/* Social proof */}
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.8,delay:0.9}}
            className="flex flex-wrap items-center gap-5 pt-6 border-t border-gray-200/70 w-full">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users size={15} className="text-gray-400"/>
              <span className="font-black text-gray-900">500+</span> students in
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <CheckCircle size={15} className="text-green-500"/>
              <span>No subscription ever</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <CheckCircle size={15} className="text-green-500"/>
              <span>Built for Indian exams</span>
            </div>
          </motion.div>
        </div>

        {/* RIGHT */}
        <div className="hidden md:flex justify-center md:justify-end">
          <LiveMockup />
        </div>
      </div>
    </section>
  )
}
