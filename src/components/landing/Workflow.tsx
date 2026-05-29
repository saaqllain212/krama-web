'use client'
import { motion } from 'framer-motion'
import { BookOpen, Timer, RefreshCw, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const STEPS = [
  { num:'01', icon:BookOpen, title:'Map your syllabus', desc:'Break your exam into 400+ small topics. See everything clearly on one screen. Know exactly what\'s left.', c:'from-primary-500 to-primary-600', ib:'bg-primary-100', ic:'text-primary-600' },
  { num:'02', icon:Timer, title:'Start a focus session', desc:'Pick one topic. Hit start. Study. Krama tracks real time only — no tab switching, no cheating yourself.', c:'from-purple-500 to-purple-600', ib:'bg-purple-100', ic:'text-purple-600' },
  { num:'03', icon:RefreshCw, title:'Review before you forget', desc:'Krama brings each topic back at exactly the right moment. Science-backed spacing. Nothing slips through.', c:'from-green-500 to-green-600', ib:'bg-green-100', ic:'text-green-600' },
]

export default function Workflow() {
  return (
    <section className="bg-gray-950 py-24 px-6 md:px-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(91,143,249,0.05)_0%,_transparent_70%)]"/>
      <div className="mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-5">
            <span className="text-xs font-black text-white/40 uppercase tracking-wider">The System</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Three steps.<br/><span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">Repeat every day.</span>
          </h2>
          <p className="text-lg text-white/40 max-w-xl mx-auto font-medium">That's the entire method. No complicated rules. Just this loop, every day.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div key={step.num} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.12,duration:0.5}}
                className="relative group bg-white/5 border border-white/10 rounded-2xl p-7 hover:border-white/20 hover:bg-white/8 transition-all">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                    <ArrowRight size={20} className="text-white/20"/>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 bg-gradient-to-br ${step.c} rounded-xl flex items-center justify-center shadow-lg shrink-0`}>
                    <Icon size={20} className="text-white"/>
                  </div>
                  <span className="text-4xl font-black text-white/10">{step.num}</span>
                </div>
                <h3 className="text-xl font-black text-white mb-3">{step.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
              </motion.div>
            )
          })}
        </div>
        <div className="text-center">
          <Link href="/signup" className="btn btn-primary inline-flex items-center gap-2 shadow-[0_0_30px_rgba(91,143,249,0.3)]">
            Start the loop — it's free <ArrowRight size={16}/>
          </Link>
        </div>
      </div>
    </section>
  )
}
