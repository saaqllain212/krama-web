'use client'
// Section 3 — All 8 features + Companions + AI MCQ + Study Buddy
// Horizontal scroll panel + 2-column deep dives below
import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Timer, RotateCw, Brain, BarChart3, Users, Zap, Map, Trophy, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const TOOLS = [
  { icon:Timer, name:'Focus Timer', tagline:'Study without lying to yourself', desc:'Tracks every tab switch and distraction. Real study time, not hoped time.', c:'#5B8FF9', bg:'rgba(91,143,249,0.08)', isNew:false },
  { icon:Map, name:'Syllabus Tracker', tagline:'Your whole exam on one screen', desc:'400+ micro-topics for UPSC, JEE, NEET, SSC. Visual map of your progress.', c:'#06b6d4', bg:'rgba(6,182,212,0.08)', isNew:false },
  { icon:RotateCw, name:'Spaced Review', tagline:'Never forget what you studied', desc:'Scheduled revision at the exact moment before you forget. Science-backed.', c:'#a855f7', bg:'rgba(168,85,247,0.08)', isNew:false },
  { icon:Brain, name:'AI MCQ Generator', tagline:'Practice from YOUR notes', desc:'Paste any text → instant MCQs. Your own Gemini key. Zero extra cost.', c:'#22c55e', bg:'rgba(34,197,94,0.08)', isNew:false },
  { icon:Users, name:'Study Buddy', tagline:"Don't study alone", desc:"Matched with a student for your exam. See daily hours. Stay accountable.", c:'#ec4899', bg:'rgba(236,72,153,0.08)', isNew:true },
  { icon:BarChart3, name:'Mock Analysis', tagline:'Know WHY you failed', desc:'Tag every mistake — carelessness, concept gap, time pressure. Fix it.', c:'#f59e0b', bg:'rgba(245,158,11,0.08)', isNew:false },
  { icon:Zap, name:'XP & Companions', tagline:'Study feels like a game', desc:'Level up. Guardian grows when you study. Wraith haunts when you slack.', c:'#f97316', bg:'rgba(249,115,22,0.08)', isNew:false },
  { icon:Trophy, name:'Leaderboard', tagline:'Compete every week', desc:'Weekly XP rankings. Topper benchmarks show how rank-holders study.', c:'#eab308', bg:'rgba(234,179,8,0.08)', isNew:false },
]

function reveal(i: number) {
  return { initial:{opacity:0,y:30}, whileInView:{opacity:1,y:0}, viewport:{once:true}, transition:{delay:i*0.08,duration:0.7,ease:[0.16,1,0.3,1] as [number,number,number,number]} }
}

export default function SectionThree() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const scroll = (dir: 'left'|'right') => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir==='right'?320:-320, behavior:'smooth' })
  }

  return (
    <section id="features" className="bg-[#0a0a0a] py-28 overflow-hidden">
      <div className="px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">

          {/* Section label */}
          <div className="flex items-center gap-4 mb-16">
            <span className="text-[10px] font-black text-white/15 uppercase tracking-widest">04</span>
            <div className="h-px w-8 bg-white/15"/>
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Everything Included · Free</span>
          </div>

          <div className="flex items-end justify-between mb-12">
            <motion.h2 {...reveal(0)}
              className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight max-w-2xl"
              style={{fontFamily:"'Playfair Display',Georgia,serif",fontStyle:'italic'}}>
              8 tools. One app.<br/>Zero cost.
            </motion.h2>
            <div className="hidden md:flex items-center gap-2">
              <button onClick={()=>scroll('left')} className="p-2.5 border border-white/15 text-white/40 hover:text-white hover:border-white/40 transition-colors">
                <ChevronLeft size={18}/>
              </button>
              <button onClick={()=>scroll('right')} className="p-2.5 border border-white/15 text-white/40 hover:text-white hover:border-white/40 transition-colors">
                <ChevronRight size={18}/>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal scroll — L+S portfolio style */}
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto px-6 md:px-20 pb-4 scrollbar-hide"
        style={{scrollbarWidth:'none',msOverflowStyle:'none'}}>
        {TOOLS.map((tool, i) => {
          const Icon = tool.icon
          return (
            <motion.div key={tool.name} {...reveal(i)}
              className="flex-shrink-0 w-72 border border-white/8 p-7 hover:border-white/20 transition-all duration-300 group cursor-default"
              style={{background:tool.bg}}>
              {tool.isNew&&<span className="inline-flex text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2.5 py-1 mb-4 block w-fit">New ✨</span>}
              <div className="w-10 h-10 rounded-none flex items-center justify-center mb-5" style={{backgroundColor:`${tool.c}20`}}>
                <Icon size={20} style={{color:tool.c}}/>
              </div>
              <h3 className="font-black text-white text-base mb-1">{tool.name}</h3>
              <p className="text-[10px] font-black text-white/30 uppercase tracking-wider mb-3">{tool.tagline}</p>
              <p className="text-xs text-white/40 leading-relaxed">{tool.desc}</p>
              <div className="mt-5 inline-flex items-center gap-1 text-[10px] font-black text-green-400 uppercase tracking-wider">
                ✓ Free now
              </div>
            </motion.div>
          )
        })}
        {/* End spacer */}
        <div className="flex-shrink-0 w-20"/>
      </div>

      {/* Deep dives — 2 column */}
      <div className="px-6 md:px-12 lg:px-20 mt-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-px border border-white/8">

          {/* Companions deep dive */}
          <div className="p-10 bg-[#0f0f0f] border-r border-white/8">
            <div className="flex items-center gap-3 mb-8">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Deep Dive</span>
              <div className="h-px flex-1 bg-white/8"/>
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight">
              Two AI companions.<br/>
              <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontStyle:'italic'}} className="text-white/60">One rewards. One haunts.</span>
            </h3>
            <p className="text-sm text-white/40 mb-8 leading-relaxed">Students with companions study 40% more consistently. Sounds weird. Works incredibly well.</p>
            <div className="space-y-3">
              <div className="border border-green-500/20 bg-green-500/5 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-base">🌱</div>
                  <div>
                    <p className="font-black text-white text-sm">Growth Guardian</p>
                    <p className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Grows when you study</p>
                  </div>
                </div>
                <p className="text-xs text-white/40 italic">&ldquo;You studied 4h today! I grew 3 new branches. Keep going.&rdquo;</p>
              </div>
              <div className="border border-amber-500/20 bg-amber-500/5 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white text-base">⏳</div>
                  <div>
                    <p className="font-black text-white text-sm">Time Wraith</p>
                    <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Haunts when you skip</p>
                  </div>
                </div>
                <p className="text-xs text-white/40 italic">&ldquo;You haven&apos;t studied in 2 days. I&apos;m watching. Is this the plan?&rdquo;</p>
              </div>
            </div>
          </div>

          {/* AI MCQ deep dive */}
          <div className="p-10 bg-[#0f0f0f]">
            <div className="flex items-center gap-3 mb-8">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Deep Dive</span>
              <div className="h-px flex-1 bg-white/8"/>
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight">
              AI MCQs from<br/>
              <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontStyle:'italic'}} className="text-white/60">your own notes.</span>
            </h3>
            <p className="text-sm text-white/40 mb-8 leading-relaxed">Paste any text. Get MCQs instantly. Your own Gemini key — Krama charges you ₹0 for AI.</p>
            <div className="bg-black border border-white/8 p-5 font-mono text-xs">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full"/><div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"/><div className="w-2.5 h-2.5 bg-green-500 rounded-full"/>
                <span className="text-white/20 text-[10px] ml-1 uppercase tracking-widest">MCQ Generator</span>
              </div>
              <div className="space-y-2 text-[11px] leading-relaxed">
                <p className="text-green-400">✓ Notes: &quot;Revolt of 1857&quot;</p>
                <p className="text-blue-400">⟳ Generating for UPSC Prelims...</p>
                <div className="mt-3 bg-white/4 p-3 border border-white/8">
                  <p className="text-yellow-300 font-bold mb-2">Q3. Who was &quot;The Last Mughal&quot;?</p>
                  <p className="text-white/30">A) Aurangzeb</p>
                  <p className="text-green-400">B) Bahadur Shah Zafar ✓</p>
                  <p className="text-white/30">C) Shah Alam II</p>
                  <p className="text-white/30">D) Akbar II</p>
                </div>
                <p className="text-white/20 mt-2">Score: 7/10 · Time: 4m 12s</p>
              </div>
            </div>
          </div>

          {/* Study Buddy deep dive */}
          <div className="p-10 bg-[#0f0f0f] border-r border-white/8 border-t border-t-white/8">
            <div className="flex items-center gap-3 mb-8">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">New Feature</span>
              <div className="h-px flex-1 bg-white/8"/>
              <span className="text-[9px] font-black bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5">NEW</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight">
              Don&apos;t study alone.<br/>
              <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontStyle:'italic'}} className="text-white/60">Find your partner.</span>
            </h3>
            <p className="text-sm text-white/40 mb-8 leading-relaxed">Matched with a student preparing for your exact exam. See each other&apos;s daily hours. If your buddy studied 8h and you&apos;ve done 3h — you&apos;ll feel it.</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between border border-primary-500/20 bg-primary-500/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-black text-sm">Y</div>
                  <div>
                    <p className="font-black text-white text-sm">You · UPSC</p>
                    <p className="text-[10px] text-white/30">6h 20m today</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-green-400 bg-green-500/15 border border-green-500/25 px-2 py-1 uppercase tracking-wider">🔥 Ahead</span>
              </div>
              <div className="flex items-center justify-between border border-white/8 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white font-black text-sm">A</div>
                  <div>
                    <p className="font-black text-white text-sm">Arjun S. · UPSC</p>
                    <p className="text-[10px] text-white/30">4h 45m today</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-amber-400 bg-amber-500/15 border border-amber-500/25 px-2 py-1 uppercase tracking-wider">⚡ Behind</span>
              </div>
            </div>
          </div>

          {/* Mobile PWA */}
          <div className="p-10 bg-[#0f0f0f] border-t border-t-white/8">
            <div className="flex items-center gap-3 mb-8">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Works on Mobile</span>
              <div className="h-px flex-1 bg-white/8"/>
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight">
              No app store.<br/>
              <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontStyle:'italic'}} className="text-white/60">Works offline too.</span>
            </h3>
            <p className="text-sm text-white/40 mb-8 leading-relaxed">Add to home screen in 2 taps. Works offline during study sessions. No download, no update popups.</p>
            <div className="space-y-3">
              {[
                {os:'iPhone / Safari', steps:['Tap Share button','Tap Add to Home Screen']},
                {os:'Android / Chrome', steps:['Tap ⋮ menu','Tap Add to Home Screen']},
              ].map((card,i)=>(
                <div key={i} className="border border-white/8 p-4">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3">{card.os}</p>
                  <div className="space-y-1.5">
                    {card.steps.map((step,j)=>(
                      <div key={j} className="flex items-center gap-2.5 text-xs text-white/50 font-semibold">
                        <span className="w-4 h-4 bg-white/8 rounded-sm flex items-center justify-center text-[9px] font-black text-white/30 shrink-0">{j+1}</span>
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex items-center gap-6">
          <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-black font-black text-xs px-8 py-4 uppercase tracking-widest hover:bg-primary-400 hover:text-white transition-colors duration-300">
            Get All 8 Features Free <ArrowRight size={14}/>
          </Link>
        </div>
      </div>
    </section>
  )
}