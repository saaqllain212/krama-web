'use client'
import { Sprout, Clock, TrendingUp, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function DualBrainPreview() {
  return (
    <section className="relative px-6 py-24 md:px-12 lg:px-16 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-100/40 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl" />
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-purple-100 border border-purple-200 px-4 py-2 rounded-full mb-5">
            <span className="text-xs font-black text-purple-700 uppercase tracking-wider">Study Companions</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            Two companions watching you.<br/>
            <span className="text-gradient">One rewards you. One haunts you.</span>
          </h2>
          <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">
            Sounds weird. Works incredibly well. Students who have companions study 40% more consistently than those who don't.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Growth Guardian */}
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
            className="card group hover:scale-[1.02] transition-transform duration-300 border-2 border-green-200">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-green-200">
                <Sprout className="w-7 h-7 text-white"/>
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-1">Growth Guardian 🌱</h3>
                <p className="text-sm font-bold text-green-600">Grows when you study</p>
              </div>
            </div>
            <p className="text-gray-600 mb-5 leading-relaxed">
              Every time you complete a focus session, your Guardian grows. Skip study and it starts to wilt. Students say seeing it grow makes them feel genuinely proud.
            </p>
            <div className="bg-green-50 rounded-xl p-5 border border-green-200 mb-4">
              <p className="text-[11px] font-black text-green-700 uppercase tracking-wider mb-3">Evolution Path</p>
              <div className="space-y-2.5">
                {[['0–25h','Tiny Seed 🌱'],['25–100h','Growing Sapling 🌿'],['100–250h','Flourishing Tree 🌳'],['250h+','Ancient Guardian 🌲']].map(([h,label])=>(
                  <div key={h} className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0"/>
                    <span className="text-sm font-semibold text-gray-700"><span className="font-black text-green-700">{h}</span> · {label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl p-3.5 border border-green-200 flex items-start gap-2.5">
              <TrendingUp className="w-4 h-4 text-green-500 shrink-0 mt-0.5"/>
              <p className="text-sm text-gray-700 font-medium italic">"You studied 4 hours today! I grew 3 new branches. You're unstoppable."</p>
            </div>
          </motion.div>

          {/* Time Wraith */}
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.1}}
            className="card group hover:scale-[1.02] transition-transform duration-300 border-2 border-amber-200">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-200">
                <Clock className="w-7 h-7 text-white"/>
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-1">Time Wraith ⏳</h3>
                <p className="text-sm font-bold text-amber-600">Haunts you when you skip</p>
              </div>
            </div>
            <p className="text-gray-600 mb-5 leading-relaxed">
              The Wraith grows more powerful every day you don't study. It will call you out — directly. Students say the Wraith is the reason they don't skip "just one more day."
            </p>
            <div className="bg-amber-50 rounded-xl p-5 border border-amber-200 mb-4">
              <p className="text-[11px] font-black text-amber-700 uppercase tracking-wider mb-3">Wraith Stages</p>
              <div className="space-y-2.5">
                {[['Day 1 missed','Whispering shadow 👤'],['Day 2–3 missed','Growing presence 👻'],['Day 4–5 missed','Menacing Wraith 😰'],['Week missed','The Devourer 💀']].map(([h,label])=>(
                  <div key={h} className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0"/>
                    <span className="text-sm font-semibold text-gray-700"><span className="font-black text-amber-700">{h}</span> · {label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl p-3.5 border border-amber-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5"/>
              <p className="text-sm text-gray-700 font-medium italic">"You haven't studied in 2 days. I'm watching. Are you sure this is the plan?"</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
