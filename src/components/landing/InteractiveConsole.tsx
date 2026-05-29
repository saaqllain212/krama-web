'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, PieChart, Activity, Brain, Clock, ChevronRight } from 'lucide-react'

const TABS = [
  { id:'decode', label:'Step 1', emoji:'🗺️', tagline:'Stop studying randomly', title:'Pick what to study today', desc:'Your full exam syllabus is broken into 400+ small topics. Open Krama, see what\'s pending, pick today\'s topic. No guessing, no overwhelm.', icon:<Brain size={18}/> },
  { id:'execute', label:'Step 2', emoji:'⏱️', tagline:'Stop fooling yourself', title:'Start a timer and actually study', desc:'Hit start. Study. Krama tracks every tab switch and distraction. Your real study time — not what you hoped it was. Honest data. Real discipline.', icon:<Clock size={18}/> },
  { id:'optimize', label:'Step 3', emoji:'🔍', tagline:'Fix the right thing', title:"Find out exactly why you're failing", desc:"Don't just log mock scores. Tag every wrong answer — silly mistake, concept gap, or time pressure. Fix what's actually costing you marks.", icon:<Activity size={18}/> },
] as const

export default function InteractiveConsole() {
  const [active, setActive] = useState<typeof TABS[number]['id']>('decode')
  return (
    <section id="how-it-works" className="bg-white py-24 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 px-4 py-2 rounded-full mb-5">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-primary-400 opacity-75"/><span className="relative h-2 w-2 rounded-full bg-primary-500 inline-flex"/></span>
            <span className="text-xs font-black text-primary-700 uppercase tracking-wider">How it works</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-3 tracking-tight">Three steps.<br/><span className="text-gradient">That's the whole system.</span></h2>
          <p className="text-lg text-gray-500 font-medium max-w-xl mx-auto">No complicated setup. Open the app, pick a topic, study, done.</p>
        </div>
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
          <div className="flex-1 flex flex-col justify-center space-y-2">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActive(tab.id)} onMouseEnter={() => setActive(tab.id)}
                className={`group p-5 text-left rounded-2xl border-2 transition-all duration-300 ${active===tab.id?'border-primary-200 bg-primary-50/50 shadow-medium':'border-transparent hover:border-gray-200 hover:bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-black text-sm flex items-center gap-2 ${active===tab.id?'text-primary-600':'text-gray-400'}`}>
                    <span className="text-lg">{tab.emoji}</span>{tab.label} — {tab.tagline}
                  </span>
                  {active===tab.id&&<ChevronRight size={16} className="text-primary-500"/>}
                </div>
                <div className={`overflow-hidden transition-all duration-400 ${active===tab.id?'max-h-40 opacity-100 mt-2':'max-h-0 opacity-0'}`}>
                  <h3 className="text-lg font-black text-gray-900 mb-1">{tab.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed max-w-md">{tab.desc}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="flex-1 aspect-[4/3] bg-gray-900 rounded-2xl shadow-large relative overflow-hidden border border-gray-800">
            <div className="bg-white w-full h-full rounded-xl overflow-hidden relative flex items-center justify-center p-8 m-1" style={{width:'calc(100% - 8px)',height:'calc(100% - 8px)'}}>
              <AnimatePresence mode="wait">
                {active==='decode'&&(
                  <motion.div key="d" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0}} className="w-full max-w-xs space-y-3">
                    <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest text-center mb-4">UPSC / History</div>
                    <div className="border-l-2 border-gray-200 ml-4 space-y-3">
                      {[{n:'Ancient History',s:'done'},{n:'Medieval India',s:'active'},{n:'Modern Freedom',s:'pending'}].map((node,i)=>(
                        <motion.div key={node.n} initial={{x:-20,opacity:0}} animate={{x:0,opacity:1}} transition={{delay:i*0.1}} className="flex items-center gap-3">
                          <div className="w-4 h-[2px] bg-gray-200"/>
                          <div className={`flex-1 p-3 rounded-xl font-bold text-sm flex justify-between items-center ${node.s==='active'?'bg-primary-500 text-white shadow-soft scale-105':node.s==='done'?'bg-gray-50 text-gray-400 border border-gray-200':'bg-gray-50 text-gray-300 border border-dashed border-gray-200'}`}>
                            {node.n}
                            {node.s==='done'&&<CheckCircle2 size={14}/>}
                            {node.s==='active'&&<div className="w-2 h-2 bg-white rounded-full animate-pulse"/>}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
                {active==='execute'&&(
                  <motion.div key="e" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="text-center w-full">
                    <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6">Focus Session · Live</div>
                    <div className="relative inline-block">
                      <div className="w-40 h-40 rounded-full border-[10px] border-gray-100 flex items-center justify-center">
                        <motion.div className="absolute inset-0 border-[10px] border-primary-500 rounded-full border-t-transparent border-l-transparent rotate-45"
                          animate={{rotate:360}} transition={{duration:8,ease:'linear',repeat:Infinity}}/>
                        <div className="text-5xl font-black tabular-nums text-gray-900">24:59</div>
                      </div>
                      <motion.div initial={{scale:0}} animate={{scale:1}} transition={{delay:0.4,type:'spring'}}
                        className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
                        Medieval India · Deep focus
                      </motion.div>
                    </div>
                    <div className="mt-10 flex justify-center gap-4 text-xs font-bold text-gray-400">
                      <span className="animate-pulse text-red-500">● Recording</span>
                      <span>Tab switches: 0</span>
                    </div>
                  </motion.div>
                )}
                {active==='optimize'&&(
                  <motion.div key="o" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0}} className="w-full max-w-xs">
                    <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest text-center mb-5">Why you lost marks</div>
                    <div className="bg-white border-2 border-gray-100 p-5 rounded-2xl shadow-soft">
                      <div className="flex items-center gap-2 mb-3 text-red-600"><PieChart size={15}/><span className="text-[11px] font-black uppercase tracking-wider">Marks Lost</span></div>
                      <div className="flex h-10 w-full rounded-xl overflow-hidden border border-gray-100 mb-3">
                        <motion.div initial={{width:0}} animate={{width:'55%'}} transition={{delay:0.2,duration:0.8}} className="bg-red-500 h-full flex items-center justify-center text-white text-xs font-black">55%</motion.div>
                        <motion.div initial={{width:0}} animate={{width:'30%'}} transition={{delay:0.4,duration:0.8}} className="bg-amber-400 h-full flex items-center justify-center text-white text-xs font-black">30%</motion.div>
                        <div className="bg-gray-100 flex-1"/>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-[10px] font-black text-gray-500 mb-3">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full"/>Silly Mistakes</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-amber-400 rounded-full"/>Concept Gap</div>
                      </div>
                      <div className="bg-red-50 p-3 text-xs font-semibold border-l-4 border-red-500 rounded-r-xl">
                        <span className="font-black text-gray-900 block mb-0.5">Fix this first:</span>
                        You're losing marks to <span className="bg-red-100 px-1.5 font-black text-red-700 rounded">carelessness</span>. Slow down on reading questions.
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
