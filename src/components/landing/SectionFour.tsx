'use client'
// Section 4 — Exam Selector + Syllabus Builder merged
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const EXAMS = [
  { id:'upsc', label:'UPSC CSE', emoji:'🏛️', color:'#5B8FF9', desc:'Full Prelims & Mains. History, Polity, Geography, Ethics — every subject mapped into 400+ micro-topics.', topics:['Ancient History','Medieval India','Modern Freedom Struggle','Indian Polity','Geography of India','Economy','Environment','Ethics & Integrity'] },
  { id:'jee', label:'JEE', emoji:'⚛️', color:'#ef4444', desc:'Chapter-wise Physics, Chemistry & Maths for Mains and Advanced. See exactly what needs attention.', topics:['Mechanics','Thermodynamics','Electromagnetism','Organic Chemistry','Inorganic Chemistry','Calculus','Algebra','Coordinate Geometry'] },
  { id:'neet', label:'NEET UG', emoji:'🧬', color:'#22c55e', desc:'NCERT-aligned. Botany, Zoology, Physics & Chemistry tracked chapter by chapter.', topics:['Cell Biology','Genetics','Human Physiology','Plant Physiology','Ecology','Organic Chemistry','Human Health','Reproduction'] },
  { id:'ssc', label:'SSC CGL', emoji:'📊', color:'#f97316', desc:'Quant, Reasoning, English & GA. Tier I & II fully mapped. Track per section daily.', topics:['Number System','Algebra','Geometry','Reasoning','English Grammar','General Awareness','Data Interpretation','Trigonometry'] },
  { id:'rbi', label:'RBI Grade B', emoji:'🏦', color:'#a855f7', desc:'Phase I & II tracker. ESI, Finance, English — every topic laid out, nothing missed.', topics:['Economic & Social Issues','Finance & Management','Quantitative Aptitude','English','General Awareness','Descriptive English','Data Analysis'] },
]

function reveal(i: number) {
  return { initial:{opacity:0,y:20}, whileInView:{opacity:1,y:0}, viewport:{once:true}, transition:{delay:i*0.08,duration:0.6,ease:[0.16,1,0.3,1] as [number,number,number,number]} }
}

export default function SectionFour() {
  const [active, setActive] = useState('upsc')
  const exam = EXAMS.find(e=>e.id===active)!

  return (
    <section className="bg-[#f5f2ee] py-28 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">

        <div className="flex items-center gap-4 mb-16">
          <span className="text-[10px] font-black text-black/20 uppercase tracking-widest">05</span>
          <div className="h-px w-8 bg-black/20"/>
          <span className="text-[10px] font-black text-black/30 uppercase tracking-widest">Your Exam</span>
        </div>

        <motion.h2 {...reveal(0)} className="text-4xl md:text-6xl font-black text-black mb-4 tracking-tight leading-tight max-w-3xl">
          Which exam are you<br/>
          <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontStyle:'italic'}}>preparing for?</span>
        </motion.h2>
        <motion.p {...reveal(1)} className="text-lg text-black/40 font-medium mb-16 max-w-xl">
          Krama has a built-in syllabus for every major Indian exam. Your tracker is ready in 30 seconds.
        </motion.p>

        {/* Exam tabs — horizontal */}
        <div className="flex flex-wrap gap-2 mb-12">
          {EXAMS.map((e,i)=>(
            <motion.button key={e.id} {...reveal(i)}
              onClick={()=>setActive(e.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-black uppercase tracking-widest border-2 transition-all duration-300 ${active===e.id?'bg-black text-white border-black':'bg-transparent text-black/50 border-black/15 hover:border-black/40 hover:text-black'}`}>
              <span>{e.emoji}</span>{e.label}
            </motion.button>
          ))}
          <motion.button {...reveal(5)} onClick={()=>setActive('custom')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-black uppercase tracking-widest border-2 border-dashed transition-all duration-300 ${active==='custom'?'bg-black text-white border-black':'bg-transparent text-black/30 border-black/15 hover:border-black/30 hover:text-black/60'}`}>
            ✏️ Custom
          </motion.button>
        </div>

        {/* Selected exam content */}
        <AnimatePresence mode="wait">
          {active === 'custom' ? (
            <motion.div key="custom" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}
              className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-black text-black mb-4">Build your own tracker.</h3>
                <p className="text-black/50 leading-relaxed mb-6">Paste any syllabus — from a PDF, Telegram group, anywhere. Krama converts it into a live interactive tracker in under 10 seconds.</p>
                <Link href="/signup" className="inline-flex items-center gap-2 bg-black text-white font-black text-xs px-6 py-3 uppercase tracking-widest hover:bg-primary-500 transition-colors">
                  Build My Tracker <ArrowRight size={13}/>
                </Link>
              </div>
              <div className="bg-black p-6 font-mono text-xs">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-red-500 rounded-full"/><div className="w-2 h-2 bg-yellow-500 rounded-full"/><div className="w-2 h-2 bg-green-500 rounded-full"/>
                  <span className="text-white/20 ml-1 uppercase tracking-widest text-[9px]">Syllabus Parser</span>
                </div>
                <p className="text-white/30 mb-2">&gt; Paste your syllabus text here...</p>
                <p className="text-green-400">✓ Detected 47 topics</p>
                <p className="text-blue-400">⟳ Organizing into tracker...</p>
                <p className="text-white mt-2">✓ Ready. 47 topics added.</p>
              </div>
            </motion.div>
          ) : (
            <motion.div key={active} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}
              className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{exam.emoji}</span>
                  <div>
                    <h3 className="text-2xl font-black text-black">{exam.label}</h3>
                    <p className="text-sm text-black/40 font-medium">{exam.topics.length} topics pre-loaded</p>
                  </div>
                </div>
                <p className="text-black/50 leading-relaxed mb-8">{exam.desc}</p>
                <Link href="/signup" className="inline-flex items-center gap-2 font-black text-xs px-6 py-3 uppercase tracking-widest hover:text-white transition-colors duration-300 border-2 border-black hover:bg-black"
                  style={{color:'black'}}>
                  Start {exam.label} tracker <ArrowRight size={13}/>
                </Link>
              </div>
              <div className="border border-black/10 bg-white p-6">
                <p className="text-[10px] font-black text-black/30 uppercase tracking-widest mb-4">Topics Pre-loaded</p>
                <div className="space-y-2">
                  {exam.topics.map((t,i)=>(
                    <motion.div key={t} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}}
                      className="flex items-center gap-3 py-2 border-b border-black/5 last:border-b-0">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{backgroundColor:exam.color}}/>
                      <span className="text-sm font-semibold text-black/60">{t}</span>
                      <span className="ml-auto text-[10px] font-black text-black/20 uppercase tracking-wider">Pending</span>
                    </motion.div>
                  ))}
                  <div className="flex items-center gap-2 pt-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black/10"/>
                    <span className="text-xs text-black/25 italic">+ {Math.floor(Math.random()*50+30)} more topics...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}