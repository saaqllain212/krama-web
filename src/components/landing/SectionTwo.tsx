'use client'
// Section 2 — The Problem + How it Works + Workflow
// All 3 original sections merged into one editorial flow
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Brain, Clock, Activity, ChevronRight } from 'lucide-react'

const PROBLEMS = [
  { num:'01', stat:'50%', sub:'forgotten in 24h', title:'You study 3 hours.', body:'But your brain dumps half of it overnight. Without a review system, every session is half-wasted.' },
  { num:'02', stat:'400+', sub:'topics, no order', title:'You open your notes.', body:'400+ topics stare back. No idea what\'s urgent, what\'s done, or what to skip. So you start from the beginning. Again.' },
  { num:'03', stat:'3 days', sub:'before most quit', title:'You start strong.', body:'Day 1 is great. By day 3 nobody notices if you stop. So you do. And the guilt makes it worse.' },
  { num:'04', stat:'?', sub:'no feedback loop', title:'You attempt mocks.', body:'You get 65%. You don\'t know if it\'s carelessness or a concept gap. Nothing actually improves.' },
]

const STEPS = [
  { id:'decode', num:'01', emoji:'🗺️', label:'Pick what to study', body:'Your full syllabus is broken into 400+ small topics. See what\'s pending, pick today\'s topic. No guessing, no overwhelm.', icon:<Brain size={18}/> },
  { id:'execute', num:'02', emoji:'⏱️', label:'Start the timer, really study', body:'Hit start. Study. Krama tracks every tab switch. You see your real study time — not what you hoped it was.', icon:<Clock size={18}/> },
  { id:'optimize', num:'03', emoji:'🔍', label:'Find exactly why you\'re failing', body:'Don\'t just log mock scores. Tag every wrong answer — silly mistake, concept gap, or time pressure. Fix what\'s actually costing you marks.', icon:<Activity size={18}/> },
] as const

function reveal(i: number) {
  return { initial:{opacity:0,y:30}, whileInView:{opacity:1,y:0}, viewport:{once:true}, transition:{delay:i*0.1,duration:0.7,ease:[0.16,1,0.3,1]} }
}

export default function SectionTwo() {
  const [activeStep, setActiveStep] = useState<'decode'|'execute'|'optimize'>('decode')

  return (
    <section className="bg-[#f5f2ee] py-28 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">

        {/* Section label — L+S style */}
        <div className="flex items-center gap-4 mb-20">
          <span className="text-[10px] font-black text-black/20 uppercase tracking-widest">02</span>
          <div className="h-px w-8 bg-black/20"/>
          <span className="text-[10px] font-black text-black/30 uppercase tracking-widest">The Problem</span>
        </div>

        {/* Problems — editorial numbered list */}
        <div className="mb-24">
          <motion.h2 {...reveal(0)} className="text-4xl md:text-6xl font-black text-black mb-16 tracking-tight leading-tight max-w-3xl"
            style={{fontFamily:"'Playfair Display',Georgia,serif",fontStyle:'italic'}}>
            Why good students fail — even the hardworking ones.
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-black/10">
            {PROBLEMS.map((p,i)=>(
              <motion.div key={p.num} {...reveal(i)}
                className="p-8 border-b border-r border-black/10 last:border-r-0 even:border-r-0 md:even:border-r group hover:bg-black hover:text-white transition-all duration-500 cursor-default">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-black/25 group-hover:text-white/30">{p.num}</span>
                  <div className="text-right">
                    <div className="text-3xl font-black text-black group-hover:text-white">{p.stat}</div>
                    <div className="text-[9px] font-bold text-black/30 group-hover:text-white/30 uppercase tracking-wider">{p.sub}</div>
                  </div>
                </div>
                <h3 className="text-xl font-black text-black group-hover:text-white mb-2">{p.title}</h3>
                <p className="text-sm text-black/50 group-hover:text-white/60 leading-relaxed">{p.body}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-20">
          <span className="text-[10px] font-black text-black/20 uppercase tracking-widest">—</span>
          <div className="h-px flex-1 bg-black/10"/>
          <span className="text-[10px] font-black text-black/30 uppercase tracking-widest">Krama fixes all four</span>
          <div className="h-px flex-1 bg-black/10"/>
        </div>

        {/* How it works — 3 steps */}
        <div className="flex items-center gap-4 mb-12">
          <span className="text-[10px] font-black text-black/20 uppercase tracking-widest">03</span>
          <div className="h-px w-8 bg-black/20"/>
          <span className="text-[10px] font-black text-black/30 uppercase tracking-widest">How it Works</span>
        </div>

        <motion.h2 {...reveal(0)} className="text-4xl md:text-5xl font-black text-black mb-16 tracking-tight leading-tight max-w-2xl">
          Three steps. <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontStyle:'italic'}}>That's the whole system.</span>
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Step selector */}
          <div className="space-y-2">
            {STEPS.map((step)=>(
              <button key={step.id} onClick={()=>setActiveStep(step.id)} onMouseEnter={()=>setActiveStep(step.id)}
                className={`w-full text-left p-6 border-2 transition-all duration-400 ${activeStep===step.id?'border-black bg-black text-white':'border-transparent hover:border-black/20 bg-transparent'}`}>
                <div className="flex items-center gap-4 mb-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${activeStep===step.id?'text-white/40':'text-black/25'}`}>{step.num}</span>
                  <span className="text-xl">{step.emoji}</span>
                  <span className={`font-black text-sm uppercase tracking-wide ${activeStep===step.id?'text-white':'text-black/70'}`}>{step.label}</span>
                  {activeStep===step.id&&<ChevronRight size={16} className="ml-auto text-white/50"/>}
                </div>
                {activeStep===step.id&&(
                  <motion.p initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} className="text-sm text-white/60 leading-relaxed pl-16">
                    {step.body}
                  </motion.p>
                )}
              </button>
            ))}
          </div>

          {/* Visual */}
          <div className="bg-black rounded-none overflow-hidden aspect-square flex items-center justify-center p-8">
            {activeStep==='decode'&&(
              <motion.div key="d" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} className="w-full max-w-xs space-y-3">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest text-center mb-6">UPSC / History</p>
                <div className="border-l-2 border-white/15 ml-4 space-y-3">
                  {[{n:'Ancient History',s:'done'},{n:'Medieval India',s:'active'},{n:'Modern Freedom',s:'pending'}].map((node,i)=>(
                    <motion.div key={node.n} initial={{x:-20,opacity:0}} animate={{x:0,opacity:1}} transition={{delay:i*0.1}} className="flex items-center gap-3">
                      <div className="w-4 h-[2px] bg-white/15"/>
                      <div className={`flex-1 p-3 text-sm font-bold flex justify-between items-center ${node.s==='active'?'bg-primary-500 text-white':node.s==='done'?'bg-white/8 text-white/30 border border-white/10':'bg-white/4 text-white/15 border border-dashed border-white/10'}`}>
                        {node.n}
                        {node.s==='done'&&<CheckCircle2 size={13} className="text-white/40"/>}
                        {node.s==='active'&&<div className="w-2 h-2 bg-white rounded-full animate-pulse"/>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
            {activeStep==='execute'&&(
              <motion.div key="e" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="text-center">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-8">Focus Session · Live</p>
                <div className="relative inline-block">
                  <div className="w-44 h-44 rounded-full border-[10px] border-white/8 flex items-center justify-center">
                    <motion.div className="absolute inset-0 border-[10px] border-primary-500 rounded-full border-t-transparent border-l-transparent"
                      animate={{rotate:360}} transition={{duration:8,ease:'linear',repeat:Infinity}}/>
                    <div className="text-6xl font-black tabular-nums text-white">24:59</div>
                  </div>
                  <motion.div initial={{scale:0}} animate={{scale:1}} transition={{delay:0.4,type:'spring'}}
                    className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-3 py-1.5 rounded-full whitespace-nowrap uppercase tracking-wide">
                    Medieval India
                  </motion.div>
                </div>
                <p className="mt-12 text-[10px] text-red-400 font-black animate-pulse uppercase tracking-widest">● Recording · Tab switches: 0</p>
              </motion.div>
            )}
            {activeStep==='optimize'&&(
              <motion.div key="o" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} className="w-full max-w-xs">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest text-center mb-6">Why You Lost Marks</p>
                <div className="border border-white/10 p-5 rounded-none">
                  <div className="flex h-10 w-full overflow-hidden mb-4">
                    <motion.div initial={{width:0}} animate={{width:'55%'}} transition={{delay:0.2,duration:0.8}} className="bg-red-500 h-full flex items-center justify-center text-white text-xs font-black">55%</motion.div>
                    <motion.div initial={{width:0}} animate={{width:'30%'}} transition={{delay:0.4,duration:0.8}} className="bg-amber-400 h-full flex items-center justify-center text-white text-xs font-black">30%</motion.div>
                    <div className="bg-white/8 flex-1"/>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[9px] font-black text-white/40 uppercase tracking-wider mb-4">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-red-500 rounded-full"/>Silly Mistakes</div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-amber-400 rounded-full"/>Concept Gap</div>
                  </div>
                  <div className="border-l-4 border-red-500 pl-3 text-xs text-white/60">
                    <span className="font-black text-white block mb-0.5">Fix this first:</span>
                    Slow down reading questions. Carelessness is costing you 55% of lost marks.
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="mt-16 flex items-center gap-6">
          <Link href="/signup" className="inline-flex items-center gap-2 bg-black text-white font-black text-xs px-8 py-4 uppercase tracking-widest hover:bg-primary-500 transition-colors duration-300">
            Fix my study system <ArrowRight size={14}/>
          </Link>
          <span className="text-xs text-black/30 font-bold uppercase tracking-widest">Free forever for early users</span>
        </div>
      </div>
    </section>
  )
}
