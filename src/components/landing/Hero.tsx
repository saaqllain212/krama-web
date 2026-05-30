'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, Users, CheckCircle, Timer, BookOpen, Target } from 'lucide-react'
import { useTracker } from '@/analytics/useTracker'
import { EVENTS } from '@/analytics/events'
import { motion, useInView } from 'framer-motion'

function CountUp({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = end / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, end, duration])
  return <span ref={ref} className="tabular-nums">{count}</span>
}

function LiveClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const update = () => {
      const now = new Date()
      const h = now.getHours().toString().padStart(2,'0')
      const m = now.getMinutes().toString().padStart(2,'0')
      const s = now.getSeconds().toString().padStart(2,'0')
      setTime(`${h}:${m}:${s}`)
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [])
  return <span className="font-mono tabular-nums">{time}</span>
}

const TICKER_ITEMS = ['🏛️ UPSC CSE','⚛️ JEE Mains','🧬 NEET UG','📊 SSC CGL','🏦 RBI Grade B','🎯 Bank PO','📚 UPSC CAPF','🔬 JEE Advanced','🌿 NEET PG','💼 SEBI Grade A']

function Ticker() {
  return (
    <div className="relative overflow-hidden w-full border-t border-white/5 py-3">
      <div className="flex gap-6 whitespace-nowrap" style={{animation:'marquee 28s linear infinite'}}>
        {[...TICKER_ITEMS,...TICKER_ITEMS].map((item,i)=>(
          <span key={i} className="inline-flex items-center gap-2 text-[10px] font-black text-white/25 uppercase tracking-widest px-3 py-1 rounded-full border border-white/8">{item}</span>
        ))}
      </div>
      <style>{`@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
    </div>
  )
}

function MockupCard() {
  const [progress, setProgress] = useState(0)
  useEffect(() => { const t = setTimeout(()=>setProgress(72),800); return ()=>clearTimeout(t) }, [])
  const bars = [45,90,60,120,30,75,0]
  const days = ['M','T','W','T','F','S','S']
  return (
    <motion.div initial={{opacity:0,y:50,rotate:2}} animate={{opacity:1,y:0,rotate:2}}
      transition={{duration:1,delay:0.6,ease:[0.16,1,0.3,1] as [number,number,number,number]}}
      className="relative w-full max-w-[380px]">
      <div className="absolute -inset-8 bg-primary-500/15 rounded-[3rem] blur-3xl"/>
      <div className="absolute -inset-4 bg-purple-500/10 rounded-[2.5rem] blur-2xl"/>
      <div className="relative bg-[#111] rounded-2xl border border-white/10 overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 px-5 pt-5 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white/50 text-[9px] font-black uppercase tracking-widest">Today's Focus</p>
              <p className="text-white text-3xl font-black mt-0.5 tabular-nums">
                <CountUp end={4} duration={1400}/>h <CountUp end={20} duration={1800}/>m
              </p>
            </div>
            <div className="relative w-14 h-14">
              <svg className="-rotate-90" width="56" height="56" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="22" stroke="rgba(255,255,255,0.12)" strokeWidth="5" fill="none"/>
                <circle cx="28" cy="28" r="22" stroke="white" strokeWidth="5" fill="none"
                  strokeLinecap="round" strokeDasharray={138.2}
                  strokeDashoffset={138.2-(progress/100)*138.2}
                  className="transition-all duration-1000 ease-out" style={{transitionDelay:'0.8s'}}/>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-xs font-black">{progress}%</span>
              </div>
            </div>
          </div>
          <div className="flex items-end gap-1.5 h-8">
            {bars.map((m,i)=>(
              <motion.div key={i} className="flex-1 flex flex-col items-center gap-0.5"
                initial={{scaleY:0}} animate={{scaleY:1}}
                transition={{delay:1.1+i*0.07,duration:0.35,ease:'easeOut'}}
                style={{transformOrigin:'bottom'}}>
                <div className="w-full rounded-sm" style={{height:`${Math.max(m===0?2:4,(m/120)*22)}px`,backgroundColor:m===0?'rgba(255,255,255,0.12)':m>=90?'white':m>=60?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.35)'}}/>
                <span className="text-[7px] font-bold text-white/30">{days[i]}</span>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 border-b border-white/8">
          {[{v:'12🔥',l:'Streak'},{v:'47%',l:'Syllabus'},{v:'85',l:'Mock'}].map((s,i)=>(
            <motion.div key={s.l} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:1.5+i*0.1}}
              className="flex flex-col items-center py-3.5 border-r border-white/8 last:border-r-0">
              <span className="text-sm font-black text-white">{s.v}</span>
              <span className="text-[9px] font-semibold text-white/30 mt-0.5">{s.l}</span>
            </motion.div>
          ))}
        </div>
        <div className="flex items-center gap-2.5 px-4 py-3 bg-purple-500/15 border-b border-white/8">
          <div className="flex -space-x-1.5">
            {['A','R','S'].map((l,i)=>(
              <div key={i} className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-[8px] font-black text-white border-2 border-[#111]">{l}</div>
            ))}
          </div>
          <span className="text-[10px] font-bold text-purple-300">🤝 Buddy: Arjun studied 6h · you&apos;re ahead</span>
        </div>
        <div className="px-5 py-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-black text-white/25 uppercase tracking-widest">Level 4 · Scholar</span>
            <span className="text-[9px] font-black text-primary-400">286 XP</span>
          </div>
          <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-primary-400 to-purple-500 rounded-full"
              initial={{width:0}} animate={{width:'68%'}} transition={{delay:1.8,duration:0.9,ease:'easeOut'}}/>
          </div>
        </div>
      </div>
      <motion.div initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:2.1,type:'spring'}}
        className="absolute -left-12 top-14 bg-orange-500 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-lg shadow-orange-500/40 flex items-center gap-1.5 rotate-[-2deg]">
        🔥 12-day streak
      </motion.div>
      <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:2.4,type:'spring'}}
        className="absolute -right-10 bottom-16 bg-green-500 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-lg shadow-green-500/40 flex items-center gap-1.5 rotate-[2deg]">
        +50 XP ⚡
      </motion.div>
    </motion.div>
  )
}

export default function Hero() {
  const { track } = useTracker()
  return (
    <section className="relative min-h-[96vh] flex flex-col overflow-hidden bg-[#0a0a0a]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(91,143,249,0.12),transparent)]"/>
      <div className="absolute inset-0 opacity-[0.035]" style={{backgroundImage:`radial-gradient(circle at 1px 1px,rgba(255,255,255,0.8) 1px,transparent 0)`,backgroundSize:'32px 32px'}}/>
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#f5f2ee] to-transparent z-10"/>

      {/* Live clock — Light+Shade inspired */}
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.3}}
        className="relative z-10 flex items-center justify-between px-6 md:px-20 pt-8 pb-2">
        <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">India / IST</span>
        <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest"><LiveClock/></span>
      </motion.div>

      <div className="relative z-10 flex-1 flex items-center px-6 py-12 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-14 max-w-7xl mx-auto w-full">
          <div className="flex flex-col items-start gap-7">

            {/* Section number — L+S style */}
            <motion.div initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{duration:0.6}}
              className="flex items-center gap-4">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">01</span>
              <div className="h-px w-8 bg-white/20"/>
              <span className="inline-flex items-center gap-1.5 bg-green-500/12 border border-green-500/25 text-green-400 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"/>Free Now
              </span>
            </motion.div>

            {/* Headline — serif + sans contrast */}
            <motion.h1 initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.8,delay:0.15,ease:[0.16,1,0.3,1] as [number,number,number,number]}}
              className="text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-[5.5rem]">
              <span className="block text-white italic" style={{fontFamily:"'Playfair Display', Georgia, serif", fontWeight:700}}>
                You study hard.
              </span>
              <span className="block bg-gradient-to-r from-primary-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                But still forget.
              </span>
            </motion.h1>

            <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.7,delay:0.28}}
              className="max-w-lg text-lg font-medium text-white/40 leading-relaxed">
              Krama tracks every minute you study, tells you exactly what to revise before you forget it, and matches you with a study buddy — all free.
            </motion.p>

            {/* Exam tags */}
            <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.36}}
              className="flex flex-wrap gap-2">
              {['UPSC','JEE','NEET','SSC','RBI','Bank PO'].map(e=>(
                <span key={e} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-white/40 uppercase tracking-wider">{e}</span>
              ))}
            </motion.div>

            {/* Bullets */}
            <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.42}}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
              {[
                {icon:Timer, text:'Focus timer — honest tracking'},
                {icon:BookOpen, text:'Spaced review — never forget'},
                {icon:Target, text:'AI MCQs from your notes'},
                {icon:Users, text:'Study buddy — stay accountable'},
              ].map((item,i)=>(
                <div key={i} className="flex items-center gap-2.5 bg-white/4 border border-white/8 rounded-xl px-3 py-2.5">
                  <div className="w-6 h-6 bg-primary-500/15 rounded-lg flex items-center justify-center shrink-0">
                    <item.icon size={12} className="text-primary-400"/>
                  </div>
                  <span className="text-xs font-semibold text-white/50">{item.text}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.5}}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link href="/signup" onClick={()=>track(EVENTS.AUTH_SIGNUP_CLICKED,{location:'hero'})}
                className="group relative inline-flex items-center gap-3 bg-primary-500 hover:bg-primary-400 text-white font-black text-sm px-8 py-4 rounded-xl transition-all duration-200 shadow-[0_0_40px_rgba(91,143,249,0.4)] hover:shadow-[0_0_60px_rgba(91,143,249,0.6)] uppercase tracking-widest">
                <span className="absolute inset-0 rounded-xl border-2 border-primary-400 animate-ping opacity-15"/>
                Join Free — 30 Seconds
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1"/>
              </Link>
              <p className="text-xs text-white/20 font-bold uppercase tracking-widest">500 cap · <span className="text-red-400">spots filling fast</span></p>
            </motion.div>

            {/* Social proof */}
            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.8,delay:1}}
              className="flex flex-wrap items-center gap-6 pt-6 border-t border-white/8 w-full">
              <div className="flex items-center gap-2 text-xs text-white/25">
                <Users size={13}/><span className="font-black text-white/50"><CountUp end={500} duration={2000}/>+</span><span>students</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/25">
                <CheckCircle size={13} className="text-green-500"/><span>No subscription ever</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/25">
                <CheckCircle size={13} className="text-green-500"/><span>Built for Indian exams</span>
              </div>
            </motion.div>
          </div>

          <div className="hidden md:flex justify-end pr-8">
            <MockupCard/>
          </div>
        </div>
      </div>

      <div className="relative z-10"><Ticker/></div>

      {/* Playfair Display font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700&display=swap"/>
    </section>
  )
}