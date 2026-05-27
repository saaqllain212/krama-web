'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, PieChart, Activity, Brain, Clock, ChevronRight } from 'lucide-react'

const TABS = [
  {
    id: 'decode',
    label: 'Step 1',
    emoji: '🗺️',
    title: 'Pick what to study today',
    tagline: 'Stop studying randomly',
    desc: 'Your full exam syllabus is already broken into 400+ small topics. Just open Krama, see what\'s pending, and pick today\'s topic. No guessing. No overwhelm.',
    icon: <Brain size={18} />
  },
  {
    id: 'execute',
    label: 'Step 2',
    emoji: '⏱️',
    title: 'Start a timer and actually study',
    tagline: 'Stop fooling yourself',
    desc: 'Hit start. Study. Krama quietly tracks every time you switch tabs or lose focus. At the end, you see your real study time — not what you hoped it was.',
    icon: <Clock size={18} />
  },
  {
    id: 'optimize',
    label: 'Step 3',
    emoji: '🔍',
    title: 'Find out why you\'re failing',
    tagline: 'Fix the right thing',
    desc: 'Don\'t just log mock scores. Krama asks you why you got each question wrong — silly mistake, didn\'t know the concept, or ran out of time. Now you know what to fix.',
    icon: <Activity size={18} />
  },
] as const

export default function InteractiveConsole() {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['id']>('decode')
  return (
    <section id="how-it-works" className="bg-gradient-to-b from-white to-gray-50 py-24 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 px-4 py-2 rounded-full mb-5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"/>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"/>
            </span>
            <span className="text-xs font-bold text-primary-700 uppercase tracking-wider">How it works</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-3 tracking-tight">
            Three steps.<br/><span className="text-gradient">That's the whole system.</span>
          </h2>
          <p className="text-lg text-gray-500 font-medium max-w-xl mx-auto">
            No complicated setup. No 47-step onboarding. Open the app, pick a topic, study, done.
          </p>
        </div>
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
          <div className="flex-1 flex flex-col justify-center space-y-2">
            {TABS.map((tab) => (
              <button key={tab.id} onMouseEnter={() => setActiveTab(tab.id)} onClick={() => setActiveTab(tab.id)}
                className={`group relative p-5 text-left rounded-2xl border-2 transition-all duration-300 ${
                  activeTab === tab.id ? 'border-primary-200 bg-white shadow-medium' : 'border-transparent hover:border-gray-200 hover:bg-white/60'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-black text-sm flex items-center gap-2 ${activeTab === tab.id ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                    <span className="text-lg">{tab.emoji}</span> {tab.label} — {tab.tagline}
                  </span>
                  {activeTab === tab.id && <ChevronRight size={16} className="text-primary-500"/>}
                </div>
                <div className={`overflow-hidden transition-all duration-500 ${activeTab === tab.id ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                  <h3 className="text-lg font-black text-gray-900 mb-1">{tab.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed max-w-md">{tab.desc}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="flex-1 aspect-square md:aspect-[4/3] bg-gray-900 p-4 rounded-2xl shadow-large relative overflow-hidden ring-1 ring-gray-200">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none z-20 rounded-2xl" />
            <div className="bg-white w-full h-full rounded-xl overflow-hidden relative flex items-center justify-center p-6 md:p-10">
              <AnimatePresence mode="wait">
                {activeTab === 'decode' && (
                  <motion.div key="decode" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:1.05}} transition={{duration:0.2}} className="w-full max-w-sm space-y-3">
                    <div className="text-[11px] font-black text-gray-400 uppercase mb-4 tracking-widest text-center">UPSC / History</div>
                    <div className="border-l-2 border-gray-200 ml-4 space-y-4">
                      {[{name:'Ancient History',status:'done'},{name:'Medieval India',status:'active'},{name:'Modern Struggle',status:'locked'}].map((node,i)=>(
                        <motion.div key={node.name} initial={{x:-20,opacity:0}} animate={{x:0,opacity:1}} transition={{delay:i*0.1}}
                          className="flex items-center gap-3">
                          <div className="w-4 h-[2px] bg-gray-200"/>
                          <div className={`flex-1 p-3 rounded-xl font-bold text-sm flex justify-between items-center transition-all ${
                            node.status==='active'?'bg-primary-500 text-white shadow-soft scale-105':
                            node.status==='done'?'bg-gray-50 text-gray-400 border border-gray-200':'bg-gray-50 text-gray-300 border border-dashed border-gray-200'}`}>
                            {node.name}
                            {node.status==='done'&&<CheckCircle2 size={14}/>}
                            {node.status==='active'&&<div className="w-2 h-2 bg-white rounded-full animate-pulse"/>}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-center text-xs text-gray-400 font-semibold mt-4">Your turn: tap Medieval India to continue ↑</p>
                  </motion.div>
                )}
                {activeTab === 'execute' && (
                  <motion.div key="execute" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} className="text-center w-full">
                    <div className="text-[11px] font-black text-gray-400 uppercase mb-6 tracking-widest">Focus Session Live</div>
                    <div className="relative inline-block">
                      <div className="w-40 h-40 rounded-full border-[10px] border-gray-100 flex items-center justify-center relative">
                        <motion.div className="absolute inset-0 border-[10px] border-primary-500 rounded-full border-t-transparent border-l-transparent rotate-45"
                          animate={{rotate:360}} transition={{duration:8,ease:"linear",repeat:Infinity}}/>
                        <div className="text-5xl font-black tracking-tighter tabular-nums text-gray-900">24:59</div>
                      </div>
                      <motion.div initial={{scale:0}} animate={{scale:1}} transition={{delay:0.5,type:'spring'}}
                        className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
                        Studying: Medieval India
                      </motion.div>
                    </div>
                    <div className="mt-10 flex justify-center gap-2 text-xs font-bold text-gray-400">
                      <span className="animate-pulse text-red-500">● Recording</span>
                      <span>|</span>
                      <span>Tab switches: 0</span>
                    </div>
                  </motion.div>
                )}
                {activeTab === 'optimize' && (
                  <motion.div key="optimize" initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:1.1}} className="w-full max-w-sm">
                    <div className="text-[11px] font-black text-gray-400 uppercase mb-5 tracking-widest text-center">Last Mock · Why You Lost Marks</div>
                    <div className="bg-white border-2 border-gray-100 p-5 rounded-2xl shadow-soft">
                      <div className="flex items-center gap-2 mb-3 text-red-600">
                        <PieChart size={15}/>
                        <span className="text-[11px] font-black uppercase tracking-wider">Marks Lost Breakdown</span>
                      </div>
                      <div className="flex h-12 w-full rounded-xl overflow-hidden border border-gray-100 mb-3">
                        <motion.div initial={{width:0}} animate={{width:'55%'}} transition={{delay:0.2,duration:1}}
                          className="bg-red-500 h-full flex items-center justify-center text-white text-xs font-black">55%</motion.div>
                        <motion.div initial={{width:0}} animate={{width:'30%'}} transition={{delay:0.4,duration:1}}
                          className="bg-amber-400 h-full flex items-center justify-center text-white text-xs font-black">30%</motion.div>
                        <div className="bg-gray-100 flex-1"/>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-black uppercase text-gray-500 mb-3">
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-red-500 rounded-full"/>Silly Mistakes</div>
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-amber-400 rounded-full"/>Concept Gap</div>
                      </div>
                      <div className="bg-red-50 p-3 text-xs font-semibold border-l-4 border-red-500 rounded-r-xl">
                        <span className="font-black text-gray-900 block mb-0.5">Fix this first:</span>
                        You're losing marks to <span className="bg-red-100 px-1.5 py-0.5 font-black text-red-700 rounded">carelessness</span>. Slow down. Read twice before answering.
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
