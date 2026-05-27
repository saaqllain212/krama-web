'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Users, Eye, Zap, Clock } from 'lucide-react'

export default function StudyBuddySection() {
  return (
    <section className="px-6 py-24 md:px-12 lg:px-16 bg-gradient-to-br from-purple-50/80 to-indigo-50/60">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-purple-100 border border-purple-200 px-4 py-2 rounded-full mb-6">
            <span className="text-[9px] font-black bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">New</span>
            <span className="text-xs font-bold text-purple-700">Study Buddy System</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-5 tracking-tight leading-tight">
            Don't study alone.<br/><span className="text-gradient">Find your accountability partner.</span>
          </h2>
          <p className="text-lg text-gray-500 font-medium mb-7 leading-relaxed">
            Krama automatically matches you with another student preparing for <strong className="text-gray-800">your exact exam</strong>. You can see each other's daily study hours. If your buddy studied 8 hours and you've done 3 — you'll feel it.
          </p>
          <div className="space-y-3 mb-8">
            {[
              { icon:Users, text:'Matched by exam type and daily study goal (4h, 6h, 8h, 10h+)' },
              { icon:Eye, text:"See each other's today's hours updated in real time" },
              { icon:Zap, text:'Nudged when your buddy is pulling ahead of you' },
              { icon:Clock, text:'Ghost alert if your buddy hasn\'t studied in 2 days' },
            ].map((item,i)=>(
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <item.icon size={15} className="text-purple-600"/>
                </div>
                <span className="text-sm font-semibold text-gray-700 leading-relaxed">{item.text}</span>
              </div>
            ))}
          </div>
          <Link href="/signup" className="btn btn-primary inline-flex items-center gap-2">
            Find My Study Buddy <ArrowRight size={16}/>
          </Link>
        </div>

        {/* Mockup */}
        <div className="space-y-3">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5">Live comparison</p>
          {/* You */}
          <div className="bg-white rounded-2xl border-2 border-primary-200 p-4 shadow-soft">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-black">Y</div>
              <div className="flex-1">
                <p className="font-black text-gray-900 text-sm">You</p>
                <p className="text-xs text-gray-500">UPSC CSE · 8h/day goal</p>
              </div>
              <span className="text-[10px] font-black bg-green-100 text-green-700 px-2.5 py-1 rounded-full">🔥 Ahead</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-primary-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-primary-700">6h 20m</p>
                <p className="text-[10px] font-bold text-primary-400">Today</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-orange-600">12🔥</p>
                <p className="text-[10px] font-bold text-orange-400">Streak</p>
              </div>
            </div>
          </div>

          {/* VS */}
          <div className="flex items-center gap-3 px-2">
            <div className="flex-1 h-px bg-gray-200"/>
            <span className="text-xs font-black text-gray-400 bg-white border border-gray-200 px-3 py-1 rounded-full">VS</span>
            <div className="flex-1 h-px bg-gray-200"/>
          </div>

          {/* Buddy */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-soft">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white font-black">A</div>
              <div className="flex-1">
                <p className="font-black text-gray-900 text-sm">Arjun S.</p>
                <p className="text-xs text-gray-500">UPSC CSE · Level 6</p>
              </div>
              <span className="text-[10px] font-black bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">⚡ Behind</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-gray-700">4h 45m</p>
                <p className="text-[10px] font-bold text-gray-400">Today</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-orange-600">8🔥</p>
                <p className="text-[10px] font-bold text-orange-400">Streak</p>
              </div>
            </div>
          </div>

          <motion.div initial={{opacity:0,y:8}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
            className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3.5 text-center">
            <p className="text-sm font-black text-amber-800">⚡ Arjun hasn't logged anything yet today. Stay ahead!</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
