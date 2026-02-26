'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, PieChart, Activity, Brain, Clock, ChevronRight } from 'lucide-react'

const TABS = [
  {
    id: 'decode',
    label: '01. Decode',
    title: 'The Syllabus Engine',
    desc: 'Stop studying randomly. We broke the entire syllabus into 400+ micro-topics or upload your own JSON files. Select exactly what you want to conquer today.',
    icon: <Brain size={18} />
  },
  {
    id: 'execute',
    label: '02. Execute',
    title: 'The Focus Protocol',
    desc: 'Start a focus session, then study. Krama silently tracks tab switches and shows you how much time you lost. After each session, rate your own focus. Real data, real discipline.',
    icon: <Clock size={18} />
  },
  {
    id: 'optimize',
    label: '03. Optimize',
    title: 'The Mistake Autopsy',
    desc: 'Don\'t just log scores. Log WHY you failed. Our algorithm detects if you are losing marks to "Carelessness" or "Concept Gaps".',
    icon: <Activity size={18} />
  }
] as const

export default function InteractiveConsole() {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['id']>('decode')

  return (
    <section id="how-it-works" className="bg-gradient-to-b from-white to-gray-50 py-24 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        
        {/* SECTION HEADER */}
        <div className="mb-16 md:mb-20 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span>
            The System
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Don&apos;t just study.
          </h2>
          <p className="text-xl md:text-2xl text-gray-500 font-medium">Follow the system.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* LEFT: CONTROLS */}
          <div className="flex-1 flex flex-col justify-center space-y-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onMouseEnter={() => setActiveTab(tab.id)}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative p-6 text-left rounded-xl border transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'border-primary-200 bg-white shadow-medium' 
                    : 'border-transparent hover:border-gray-200 hover:bg-white/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-semibold text-sm flex items-center gap-2 ${
                    activeTab === tab.id ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`}>
                    {tab.icon} {tab.label}
                  </span>
                  {activeTab === tab.id && <ChevronRight size={16} className="text-primary-500 animate-pulse"/>}
                </div>
                
                {/* Expandable Text */}
                <div className={`overflow-hidden transition-all duration-500 ${
                  activeTab === tab.id ? 'max-h-40 opacity-100 mt-3' : 'max-h-0 opacity-0'
                }`}>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{tab.title}</h3>
                  <p className="text-[15px] text-gray-600 leading-relaxed max-w-md">
                    {tab.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* RIGHT: THE SCREEN (Visuals) */}
          <div className="flex-1 aspect-square md:aspect-[4/3] bg-gray-900 p-4 rounded-2xl shadow-large relative overflow-hidden ring-1 ring-gray-200">
             {/* Screen Glare Effect */}
             <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none z-20 rounded-2xl" />
             
             {/* The Container */}
             <div className="bg-white w-full h-full rounded-xl overflow-hidden relative flex items-center justify-center p-6 md:p-12">
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
                       <div className="text-xs font-medium text-gray-400 uppercase mb-4 tracking-wider text-center">UPSC / History</div>
                       
                       {/* Animated Tree Nodes */}
                       <div className="border-l-2 border-gray-200 ml-4 space-y-4">
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
                                <div className="w-4 h-[2px] bg-gray-200"></div>
                                <div className={`flex-1 p-3 rounded-lg font-medium text-sm flex justify-between items-center transition-all ${
                                   node.status === 'active' ? 'bg-primary-500 text-white shadow-soft scale-105' : 
                                   node.status === 'done' ? 'bg-gray-50 text-gray-400 border border-gray-200' : 'bg-gray-50 text-gray-300 border border-dashed border-gray-200'
                                }`}>
                                   {node.name}
                                   {node.status === 'done' && <CheckCircle2 size={14} />}
                                   {node.status === 'active' && <div className="w-2 h-2 bg-white rounded-full animate-pulse"/>}
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
                       <div className="text-xs font-medium text-gray-400 uppercase mb-8 tracking-wider">Deep Work Mode</div>
                       
                       <div className="relative inline-block">
                          {/* Timer Circle */}
                          <div className="w-48 h-48 rounded-full border-[12px] border-gray-100 flex items-center justify-center relative">
                             <motion.div 
                               className="absolute inset-0 border-[12px] border-primary-500 rounded-full border-t-transparent border-l-transparent rotate-45"
                               animate={{ rotate: 360 }}
                               transition={{ duration: 8, ease: "linear", repeat: Infinity }}
                             />
                             <div className="text-6xl font-bold tracking-tighter tabular-nums text-gray-900">
                                24:59
                             </div>
                          </div>
                          
                          {/* Floating Badge */}
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, type: 'spring' }}
                            className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap"
                          >
                             Target: 45m
                          </motion.div>
                       </div>

                       <div className="mt-8 flex justify-center gap-2 text-xs font-medium text-gray-400">
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
                       <div className="text-xs font-medium text-gray-400 uppercase mb-6 tracking-wider text-center">Last Mock Analysis</div>
                       
                       <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-soft">
                          <div className="flex items-center gap-2 mb-4 text-danger-600">
                             <PieChart size={16} />
                             <span className="text-xs font-bold uppercase tracking-wider">Marks Lost Distribution</span>
                          </div>

                          {/* The Bar Chart */}
                          <div className="flex h-14 w-full rounded-xl overflow-hidden border border-gray-100 mb-4">
                             <motion.div 
                               initial={{ width: 0 }} animate={{ width: '55%' }} transition={{ delay: 0.2, duration: 1 }}
                               className="bg-danger-500 h-full flex items-center justify-center text-white text-xs font-bold"
                             >
                               55%
                             </motion.div>
                             <motion.div 
                               initial={{ width: 0 }} animate={{ width: '30%' }} transition={{ delay: 0.4, duration: 1 }}
                               className="bg-warning-400 h-full flex items-center justify-center text-white text-xs font-bold"
                             >
                               30%
                             </motion.div>
                             <div className="bg-gray-100 flex-1"></div>
                          </div>

                          {/* Legend */}
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold uppercase text-gray-500 mb-4">
                             <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-danger-500 rounded-full"></div> Silly Mistakes</div>
                             <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-warning-400 rounded-full"></div> Concept Error</div>
                          </div>

                          {/* The Insight */}
                          <div className="bg-danger-50 p-4 text-xs font-medium border-l-4 border-danger-500 rounded-r-lg">
                             <span className="font-bold text-gray-900 block mb-1">Diagnosis:</span>
                             You are losing mostly to <span className="bg-danger-100 px-1.5 py-0.5 font-bold text-danger-700 rounded">Carelessness</span>. Slow down your reading speed.
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
