'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Users, Eye, Zap, Clock } from 'lucide-react'

export default function StudyBuddySection() {
  return (
    <section className="px-6 py-24 md:px-12 bg-gray-950 relative overflow-hidden">
      <div className="absolute top-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"/>
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl"/>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/30 px-4 py-2 rounded-full mb-6">
            <span className="text-[9px] font-black bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">New</span>
            <span className="text-xs font-black text-purple-400">Study Buddy System</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-5 tracking-tight leading-tight">
            Don't study alone.<br/><span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Find your partner.</span>
          </h2>
          <p className="text-lg text-white/50 font-medium mb-7 leading-relaxed">
            Krama matches you with another student preparing for <strong className="text-white">your exact exam</strong>. You see each other's daily study hours. If your buddy studied 8h and you've done 3h — you'll feel it.
          </p>
          <div className="space-y-3 mb-8">
            {[
              {icon:Users, text:'Matched by exam type and daily study goal'},
              {icon:Eye, text:"See each other's today's hours in real time"},
              {icon:Zap, text:'Get nudged when your buddy is pulling ahead'},
              {icon:Clock, text:"Ghost alert if they haven't studied in 2 days"},
            ].map((item,i)=>(
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-500/15 border border-purple-500/30 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <item.icon size={15} className="text-purple-400"/>
                </div>
                <span className="text-sm font-semibold text-white/60 leading-relaxed">{item.text}</span>
              </div>
            ))}
          </div>
          <Link href="/signup" className="btn btn-primary inline-flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            Find My Study Buddy <ArrowRight size={16}/>
          </Link>
        </div>
        <div className="space-y-3">
          <p className="text-xs font-black text-white/20 uppercase tracking-widest mb-5">Live comparison</p>
          <div className="bg-white/5 border-2 border-primary-500/40 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-black">Y</div>
              <div className="flex-1">
                <p className="font-black text-white text-sm">You</p>
                <p className="text-xs text-white/40">UPSC CSE · 8h/day goal</p>
              </div>
              <span className="text-[10px] font-black bg-green-500/20 border border-green-500/30 text-green-400 px-2.5 py-1 rounded-full">🔥 Ahead</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-primary-500/15 rounded-xl p-3 text-center"><p className="text-2xl font-black text-primary-400">6h 20m</p><p className="text-[10px] font-bold text-white/30">Today</p></div>
              <div className="bg-orange-500/10 rounded-xl p-3 text-center"><p className="text-2xl font-black text-orange-400">12🔥</p><p className="text-[10px] font-bold text-white/30">Streak</p></div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-2">
            <div className="flex-1 h-px bg-white/10"/><span className="text-xs font-black text-white/20 bg-white/5 border border-white/10 px-3 py-1 rounded-full">VS</span><div className="flex-1 h-px bg-white/10"/>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white font-black">A</div>
              <div className="flex-1">
                <p className="font-black text-white text-sm">Arjun S.</p>
                <p className="text-xs text-white/40">UPSC CSE · Level 6</p>
              </div>
              <span className="text-[10px] font-black bg-amber-500/20 border border-amber-500/30 text-amber-400 px-2.5 py-1 rounded-full">⚡ Behind</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 rounded-xl p-3 text-center"><p className="text-2xl font-black text-white/60">4h 45m</p><p className="text-[10px] font-bold text-white/20">Today</p></div>
              <div className="bg-orange-500/10 rounded-xl p-3 text-center"><p className="text-2xl font-black text-orange-400">8🔥</p><p className="text-[10px] font-bold text-white/20">Streak</p></div>
            </div>
          </div>
          <motion.div initial={{opacity:0,y:8}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
            className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 text-center">
            <p className="text-sm font-black text-amber-400">⚡ Arjun hasn't logged anything yet today. Stay ahead!</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
