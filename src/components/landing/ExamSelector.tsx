'use client'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'

const EXAMS = [
  { id:'upsc', href:'/signup', emoji:'🏛️', tag:'UPSC', tc:'bg-blue-500/15 text-blue-400 border-blue-500/30', name:'UPSC CSE', desc:'Full Prelims & Mains tracker. History, Polity, Geography, Ethics — every subject mapped topic by topic.', g:'from-blue-500/15 to-blue-600/5', b:'border-blue-500/30' },
  { id:'jee', href:'/signup', emoji:'⚛️', tag:'JEE', tc:'bg-red-500/15 text-red-400 border-red-500/30', name:'JEE Mains & Advanced', desc:'Chapter-wise Physics, Chemistry & Maths. See exactly which chapters need attention.', g:'from-red-500/15 to-red-600/5', b:'border-red-500/30' },
  { id:'neet', href:'/signup', emoji:'🧬', tag:'NEET', tc:'bg-green-500/15 text-green-400 border-green-500/30', name:'NEET UG', desc:'NCERT-aligned. Botany, Zoology, Physics & Chemistry tracked chapter by chapter.', g:'from-green-500/15 to-green-600/5', b:'border-green-500/30' },
  { id:'ssc', href:'/signup', emoji:'📊', tag:'SSC', tc:'bg-orange-500/15 text-orange-400 border-orange-500/30', name:'SSC CGL', desc:'Quant, Reasoning, English & GA. Tier I & II fully mapped. Track per section daily.', g:'from-orange-500/15 to-orange-600/5', b:'border-orange-500/30' },
  { id:'rbi', href:'/signup', emoji:'🏦', tag:'Banking', tc:'bg-purple-500/15 text-purple-400 border-purple-500/30', name:'RBI Grade B', desc:'Phase I & II tracker. ESI, Finance, English — every topic laid out, nothing missed.', g:'from-purple-500/15 to-purple-600/5', b:'border-purple-500/30' },
]

export default function ExamSelector() {
  const [hovered, setHovered] = useState<string|null>(null)
  return (
    <section className="py-24 bg-gray-950 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-block bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white rounded-full mb-5 shadow-lg shadow-primary-500/30">Your Exam</div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">Which exam are you<br/><span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">preparing for?</span></h2>
          <p className="text-lg text-white/40 font-medium max-w-xl mx-auto">Krama has a built-in syllabus for every major Indian exam. Your tracker is ready in 30 seconds.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {EXAMS.map((exam) => (
            <Link key={exam.id} href={exam.href}
              onMouseEnter={() => setHovered(exam.id)} onMouseLeave={() => setHovered(null)}
              className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${exam.g} transition-all duration-300 hover:shadow-[0_0_30px_rgba(91,143,249,0.15)] hover:-translate-y-1 p-6 ${hovered===exam.id?exam.b:'border-white/10'}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`inline-flex text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${exam.tc} mb-3`}>{exam.tag}</span>
                  <h3 className="text-xl font-black text-white">{exam.name}</h3>
                </div>
                <span className="text-3xl">{exam.emoji}</span>
              </div>
              <p className="text-sm text-white/50 leading-relaxed mb-4">{exam.desc}</p>
              <div className="flex items-center gap-1.5 text-sm font-black text-primary-400 group-hover:gap-2.5 transition-all">
                Start tracking <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform"/>
              </div>
            </Link>
          ))}
          <Link href="/signup" className="group rounded-2xl border-2 border-dashed border-white/10 p-6 bg-white/2 hover:border-primary-500/40 hover:bg-primary-500/5 transition-all hover:-translate-y-1 flex flex-col items-center justify-center text-center gap-3">
            <span className="text-3xl">✏️</span>
            <h3 className="text-lg font-black text-white/70">Any Other Exam</h3>
            <p className="text-sm text-white/30">Build your own custom syllabus tracker from scratch.</p>
            <div className="flex items-center gap-1.5 text-sm font-black text-primary-400">Create custom <ArrowRight size={15}/></div>
          </Link>
        </div>
      </div>
    </section>
  )
}
