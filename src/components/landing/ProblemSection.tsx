'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { X, Brain, ArrowRight } from 'lucide-react'

const PAIN = [
  { emoji:'😰', title:'You study 3 hours...', body:'But 50% is gone by tomorrow. Without a system to review it, every session is wasted.', stat:'50%', sub:'forgotten in 24h', c:'border-red-500/30 bg-red-500/5', sc:'text-red-400' },
  { emoji:'📚', title:'You open your notes...', body:'400+ topics stare back. No idea what\'s urgent, what\'s done, or what to skip. So you start from the beginning. Again.', stat:'400+', sub:'topics, no order', c:'border-amber-500/30 bg-amber-500/5', sc:'text-amber-400' },
  { emoji:'😔', title:'You start strong...', body:'Day 1 is great. Day 3 — nobody notices if you stop. So you do. And the guilt makes it worse.', stat:'3 days', sub:'before most quit', c:'border-orange-500/30 bg-orange-500/5', sc:'text-orange-400' },
  { emoji:'📝', title:'You attempt mocks...', body:'You get 65%. You don\'t know if it\'s carelessness or a concept gap. So nothing actually improves.', stat:'?', sub:'no feedback loop', c:'border-purple-500/30 bg-purple-500/5', sc:'text-purple-400' },
]

export default function ProblemSection() {
  return (
    <section className="bg-gradient-to-b from-gray-950 to-gray-900 py-24 px-6 md:px-12 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-red-500/15 border border-red-500/30 px-4 py-2 rounded-full mb-5">
            <span className="text-xs font-black text-red-400 uppercase tracking-wider">Sound familiar?</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
            Why good students still fail —<br/><span className="text-red-400">even the hardworking ones.</span>
          </h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto font-medium">It's not laziness. It's the wrong system.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {PAIN.map((p, i) => (
            <motion.div key={i} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}}
              className={`rounded-2xl border ${p.c} p-6 flex items-start gap-4 backdrop-blur-sm`}>
              <span className="text-4xl shrink-0">{p.emoji}</span>
              <div className="flex-1">
                <h3 className="font-black text-white text-base mb-1">{p.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{p.body}</p>
              </div>
              <div className="shrink-0 text-right">
                <div className={`text-2xl font-black ${p.sc}`}>{p.stat}</div>
                <div className="text-[9px] font-bold text-white/30 max-w-[70px] leading-tight">{p.sub}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* The fix */}
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
          className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 flex gap-4">
            <div className="p-2.5 bg-red-500/20 rounded-xl h-fit"><X className="w-5 h-5 text-red-400 stroke-[3px]"/></div>
            <div>
              <h3 className="font-black text-white text-sm uppercase tracking-wider mb-2">Without Krama</h3>
              <p className="text-white/50 text-sm leading-relaxed">Study randomly. Forget everything. Panic before exams. Repeat until you quit.</p>
            </div>
          </div>
          <div className="rounded-2xl border border-primary-500/40 bg-primary-500/10 p-6 flex gap-4">
            <div className="p-2.5 bg-primary-500/20 rounded-xl h-fit"><Brain className="w-5 h-5 text-primary-400 stroke-[2px]"/></div>
            <div>
              <h3 className="font-black bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent text-sm uppercase tracking-wider mb-2">With Krama</h3>
              <p className="text-white/70 text-sm leading-relaxed">Study what matters. Review before you forget. Stay accountable. <span className="font-black text-primary-400">Retain 90% with half the effort.</span></p>
            </div>
          </div>
        </motion.div>

        <div className="text-center mt-10">
          <Link href="/signup" className="inline-flex items-center gap-2 btn btn-primary shadow-[0_0_30px_rgba(91,143,249,0.3)]">
            Fix my study system — it's free <ArrowRight size={16}/>
          </Link>
        </div>
      </div>
    </section>
  )
}
