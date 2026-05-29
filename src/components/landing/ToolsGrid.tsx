'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Timer, RotateCw, Brain, BarChart3, Users, Zap, Map, Trophy, ArrowRight } from 'lucide-react'

const TOOLS = [
  { icon:Timer, name:'Focus Timer', tagline:'Study without lying to yourself', desc:'Tracks every distraction and tab switch. Honest data, real discipline.', c:'border-primary-500/30 bg-primary-500/5', ic:'text-primary-400 bg-primary-500/15', isNew:false },
  { icon:Map, name:'Syllabus Tracker', tagline:'Your whole exam on one screen', desc:'400+ micro-topics for UPSC, JEE, NEET, SSC. Visual map of your progress.', c:'border-cyan-500/30 bg-cyan-500/5', ic:'text-cyan-400 bg-cyan-500/15', isNew:false },
  { icon:RotateCw, name:'Spaced Review', tagline:'Never forget what you studied', desc:'Scheduled revision at the exact moment before you forget. Science-backed.', c:'border-purple-500/30 bg-purple-500/5', ic:'text-purple-400 bg-purple-500/15', isNew:false },
  { icon:Brain, name:'AI MCQ Generator', tagline:'Practice from YOUR notes', desc:'Paste any text → instant MCQs. Your own Gemini key. Zero extra cost.', c:'border-green-500/30 bg-green-500/5', ic:'text-green-400 bg-green-500/15', isNew:false },
  { icon:Users, name:'Study Buddy', tagline:"Don't study alone", desc:"Matched with a student for your exam. See each other's daily hours.", c:'border-pink-500/30 bg-pink-500/5', ic:'text-pink-400 bg-pink-500/15', isNew:true },
  { icon:BarChart3, name:'Mock Analysis', tagline:'Know WHY you failed', desc:"Tag every mistake — carelessness, concept gap, time pressure. Fix the right thing.", c:'border-amber-500/30 bg-amber-500/5', ic:'text-amber-400 bg-amber-500/15', isNew:false },
  { icon:Zap, name:'XP & Companions', tagline:'Study feels like a game', desc:'Level up. Guardian grows when you study. Wraith haunts when you slack.', c:'border-orange-500/30 bg-orange-500/5', ic:'text-orange-400 bg-orange-500/15', isNew:false },
  { icon:Trophy, name:'Leaderboard', tagline:'Compete every week', desc:'Weekly XP rankings. Topper benchmarks — see how rank-holders study daily.', c:'border-yellow-500/30 bg-yellow-500/5', ic:'text-yellow-400 bg-yellow-500/15', isNew:false },
]

export default function ToolsGrid() {
  return (
    <section id="features" className="py-24 px-6 md:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 px-4 py-2 rounded-full mb-5">
            <Zap className="w-4 h-4 text-primary-600"/><span className="text-xs font-black text-primary-700 uppercase tracking-wider">All 8 Features Free Right Now</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">8 tools. One app.<br/><span className="text-gradient">Zero cost.</span></h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium">Every feature below is unlocked and free. No trial expiry. No hidden limits.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TOOLS.map((tool, i) => {
            const Icon = tool.icon
            return (
              <motion.div key={tool.name} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.06,duration:0.4}}
                className={`relative rounded-2xl border-2 p-5 ${tool.c} hover:shadow-medium transition-all duration-200 hover:-translate-y-1`}>
                {tool.isNew&&<span className="absolute -top-2.5 -right-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[9px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full shadow-sm">New ✨</span>}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${tool.ic}`}><Icon size={20}/></div>
                <h3 className="font-black text-gray-900 text-sm mb-0.5">{tool.name}</h3>
                <p className="text-[11px] font-bold text-gray-500 mb-2">{tool.tagline}</p>
                <p className="text-xs text-gray-600 leading-relaxed">{tool.desc}</p>
                <div className="mt-3 inline-flex items-center gap-1 text-[10px] font-black text-green-700 bg-green-100 px-2 py-1 rounded-full">✓ Free now</div>
              </motion.div>
            )
          })}
        </div>
        <div className="text-center mt-10">
          <Link href="/signup" className="btn btn-primary inline-flex items-center gap-2 text-base px-8 py-4">Get All 8 Features Free <ArrowRight size={18}/></Link>
        </div>
      </div>
    </section>
  )
}
