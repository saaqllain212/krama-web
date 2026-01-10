'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Play, AlertCircle, PieChart, Activity, Brain, Clock, ChevronRight } from 'lucide-react'

const TABS = [
  {
    id: 'decode',
    label: '01. DECODE',
    title: 'The Syllabus Engine',
    desc: 'Stop studying randomly. We broke the entire syllabus into 400+ micro-topics or upload your own json files. Select exactly what you want to conquer today.',
    icon: <Brain size={18} />
  },
  {
    id: 'execute',
    label: '02. EXECUTE',
    title: 'The Focus Protocol',
    desc: 'The timer resets if you leave the screen. We force "Deep Work". No Instagram. No distractions. Just pure execution.',
    icon: <Clock size={18} />
  },
  {
    id: 'optimize',
    label: '03. OPTIMIZE',
    title: 'The Mistake Autopsy',
    desc: 'Don\'t just log scores. Log WHY you failed. Our algorithm detects if you are losing marks to "Carelessness" or "Concept Gaps".',
    icon: <Activity size={18} />
  }
] as const

export default function InteractiveConsole() {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['id']>('decode')

  return (
    <section className="bg-[#FBF9F6] py-24 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        
        {/* SECTION HEADER */}
        <div className="mb-16 md:mb-24">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 leading-[0.9]">
            Don't just study.<br/>
            <span className="text-black/20">Follow the System.</span>
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* LEFT: CONTROLS */}
          <div className="flex-1 flex flex-col justify-center space-y-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onMouseEnter={() => setActiveTab(tab.id)}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative p-6 text-left border-l-4 transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'border-black bg-white shadow-xl' 
                    : 'border-black/5 hover:border-black/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-black uppercase tracking-widest text-sm flex items-center gap-2 ${
                    activeTab === tab.id ? 'text-black' : 'text-black/40 group-hover:text-black/60'
                  }`}>
                    {tab.icon} {tab.label}
                  </span>
                  {activeTab === tab.id && <ChevronRight size={16} className="animate-pulse"/>}
                </div>
                
                {/* Expandable Text */}
                <div className={`overflow-hidden transition-all duration-500 ${
                  activeTab === tab.id ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'
                }`}>
                  <h3 className="text-xl font-black uppercase mb-2">{tab.title}</h3>
                  <p className="text-sm font-medium text-black/60 leading-relaxed max-w-md">
                    {tab.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* RIGHT: THE SCREEN (Visuals) */}
          <div className="flex-1 aspect-square md:aspect-[4/3] bg-black p-4 rounded-xl shadow-2xl relative overflow-hidden ring-4 ring-black/5">
             {/* Screen Glare Effect */}
             <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none z-20 rounded-xl" />
             
             {/* The "Glass" Container */}
             <div className="bg-[#FDFBF7] w-full h-full rounded-lg overflow-hidden relative flex items-center justify-center p-6 md:p-12">
                <AnimatePresence mode="wait">
                  
                  {/* SCENE 1: DECODE (Syllabus Tree) */}
                  {activeTab === 'decode' && (
                    <motion.div 
                      key="decode"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                      className="w-full max-w-sm space-y-3"
                    >
                       <div className="font-mono text-[10px] text-black/40 uppercase mb-4 tracking-widest text-center">System: Upsc / History</div>
                       
                       {/* Animated Tree Nodes */}
                       <div className="border-l-2 border-black/10 ml-4 space-y-4">
                          {[
                            { name: 'Ancient History', status: 'done' },
                            { name: 'Medieval India', status: 'active' },
                            { name: 'Modern Struggle', status: 'locked' }
                          ].map((node, i) => (
                             <motion.div 
                               key={node.name}
                               initial={{ x: -20, opacity: 0 }}
                               animate={{ x: 0, opacity: 1 }}
                               transition={{ delay: i * 0.1 }}
                               className="flex items-center gap-3 relative"
                             >
                                <div className="w-4 h-[2px] bg-black/10"></div>
                                <div className={`flex-1 p-3 border-2 font-bold text-sm flex justify-between items-center ${
                                   node.status === 'active' ? 'border-black bg-black text-white shadow-lg scale-105' : 
                                   node.status === 'done' ? 'border-black/10 text-black/40 bg-gray-50' : 'border-dashed border-black/20 text-black/30'
                                }`}>
                                   {node.name}
                                   {node.status === 'done' && <CheckCircle2 size={14} />}
                                   {node.status === 'active' && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>}
                                </div>
                             </motion.div>
                          ))}
                       </div>
                    </motion.div>
                  )}

                  {/* SCENE 2: EXECUTE (Timer) */}
                  {activeTab === 'execute' && (
                    <motion.div 
                      key="execute"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="text-center w-full"
                    >
                       <div className="font-mono text-[10px] text-black/40 uppercase mb-8 tracking-widest">Protocol: Deep Work</div>
                       
                       <div className="relative inline-block">
                          {/* Timer Circle */}
                          <div className="w-48 h-48 rounded-full border-[12px] border-black/5 flex items-center justify-center relative">
                             <motion.div 
                               className="absolute inset-0 border-[12px] border-amber-500 rounded-full border-t-transparent border-l-transparent rotate-45"
                               animate={{ rotate: 360 }}
                               transition={{ duration: 8, ease: "linear", repeat: Infinity }}
                             />
                             <div className="text-6xl font-black tracking-tighter tabular-nums">
                                24:59
                             </div>
                          </div>
                          
                          {/* Floating Badge */}
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, type: 'spring' }}
                            className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full whitespace-nowrap"
                          >
                             Target: 45m
                          </motion.div>
                       </div>

                       <div className="mt-8 flex justify-center gap-2 text-xs font-bold uppercase text-black/30">
                          <span className="animate-pulse text-red-500">● Recording</span>
                          <span>|</span>
                          <span>Do not switch tabs</span>
                       </div>
                    </motion.div>
                  )}

                  {/* SCENE 3: OPTIMIZE (Leaky Bucket) */}
                  {activeTab === 'optimize' && (
                    <motion.div 
                      key="optimize"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.1 }}
                      className="w-full max-w-sm"
                    >
                       <div className="font-mono text-[10px] text-black/40 uppercase mb-6 tracking-widest text-center">Analysis: Last Mock Test</div>
                       
                       <div className="bg-white border-2 border-black p-4 shadow-[8px_8px_0_0_#000]">
                          <div className="flex items-center gap-2 mb-4 text-red-600">
                             <PieChart size={16} />
                             <span className="text-xs font-black uppercase">Marks Lost Distribution</span>
                          </div>

                          {/* The Bar Chart */}
                          <div className="flex h-16 w-full rounded overflow-hidden border-2 border-black/5 mb-4">
                             <motion.div 
                               initial={{ width: 0 }} animate={{ width: '55%' }} transition={{ delay: 0.2, duration: 1 }}
                               className="bg-red-500 h-full flex items-center justify-center text-white text-xs font-bold"
                             >
                               55%
                             </motion.div>
                             <motion.div 
                               initial={{ width: 0 }} animate={{ width: '30%' }} transition={{ delay: 0.4, duration: 1 }}
                               className="bg-amber-400 h-full flex items-center justify-center text-black text-xs font-bold"
                             >
                               30%
                             </motion.div>
                             <div className="bg-stone-200 flex-1"></div>
                          </div>

                          {/* Legend */}
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase text-black/50 mb-4">
                             <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full"></div> Silly Mistakes</div>
                             <div className="flex items-center gap-1"><div className="w-2 h-2 bg-amber-400 rounded-full"></div> Concept Error</div>
                          </div>

                          {/* The Insight */}
                          <div className="bg-stone-100 p-3 text-xs font-medium border-l-4 border-red-500">
                             <span className="font-black text-black block mb-1">DIAGNOSIS:</span>
                             You are losing mostly to <span className="bg-red-200 px-1 font-bold text-red-900">Carelessness</span>. Slow down your reading speed.
                          </div>
                       </div>
                    </motion.div>
                  )}

                </AnimatePresence>
             </div>
          </div>

        </div>
      </div>
    </section>
  )
}