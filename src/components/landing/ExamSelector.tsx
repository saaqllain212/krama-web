'use client'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'

const EXAMS = [
  { id:'upsc', href:'/signup', emoji:'🏛️', tag:'UPSC', tagColor:'bg-blue-50 text-blue-700 border-blue-200', name:'UPSC CSE', description:'Prelims + Mains covered. History, Polity, Geography, Ethics — every subject mapped topic by topic.', gradient:'from-blue-500/10 to-blue-600/5', border:'border-blue-200' },
  { id:'jee', href:'/signup', emoji:'⚛️', tag:'JEE', tagColor:'bg-red-50 text-red-700 border-red-200', name:'JEE Mains & Advanced', description:'Chapter-wise Physics, Chemistry & Maths. See exactly which chapters you\'ve covered and which are pending.', gradient:'from-red-500/10 to-red-600/5', border:'border-red-200' },
  { id:'neet', href:'/signup', emoji:'🧬', tag:'NEET', tagColor:'bg-green-50 text-green-700 border-green-200', name:'NEET UG', description:'NCERT-aligned. Biology (Botany + Zoology), Physics & Chemistry tracked chapter by chapter.', gradient:'from-green-500/10 to-green-600/5', border:'border-green-200' },
  { id:'ssc', href:'/signup', emoji:'📊', tag:'SSC', tagColor:'bg-orange-50 text-orange-700 border-orange-200', name:'SSC CGL', description:'Quant, Reasoning, English & GA. Tier I & II fully mapped. Track daily progress per section.', gradient:'from-orange-500/10 to-orange-600/5', border:'border-orange-200' },
  { id:'rbi', href:'/signup', emoji:'🏦', tag:'Banking', tagColor:'bg-purple-50 text-purple-700 border-purple-200', name:'RBI Grade B', description:'Phase-I & Phase-II tracker. ESI, Finance, English — every topic laid out so nothing gets missed.', gradient:'from-purple-500/10 to-purple-600/5', border:'border-purple-200' },
]

export default function ExamSelector() {
  const [hovered, setHovered] = useState<string | null>(null)
  return (
    <section className="py-24 bg-white px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-block bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white rounded-full mb-5 shadow-lg shadow-primary-500/30">
            Your Exam
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            Which exam are you<br/>
            <span className="text-gradient">preparing for?</span>
          </h2>
          <p className="text-lg text-gray-500 font-medium max-w-xl mx-auto">
            Krama has a built-in syllabus for every major Indian competitive exam. Pick yours and your tracker is ready in 30 seconds.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {EXAMS.map((exam) => (
            <Link key={exam.id} href={exam.href}
              onMouseEnter={() => setHovered(exam.id)} onMouseLeave={() => setHovered(null)}
              className={`group relative overflow-hidden rounded-2xl border-2 p-6 bg-gradient-to-br ${exam.gradient} transition-all duration-300 hover:shadow-large hover:-translate-y-1 ${hovered === exam.id ? exam.border : 'border-gray-200'}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`inline-flex text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${exam.tagColor} mb-3`}>{exam.tag}</span>
                  <h3 className="text-xl font-black text-gray-900">{exam.name}</h3>
                </div>
                <span className="text-3xl">{exam.emoji}</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{exam.description}</p>
              <div className="flex items-center gap-1.5 text-sm font-black text-primary-600 group-hover:gap-2.5 transition-all">
                Start tracking <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform"/>
              </div>
            </Link>
          ))}
          {/* Custom exam card */}
          <Link href="/signup"
            className="group relative overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 p-6 bg-gray-50/50 hover:border-primary-300 hover:bg-primary-50/50 transition-all duration-300 hover:shadow-medium hover:-translate-y-1 flex flex-col items-center justify-center text-center gap-3">
            <span className="text-3xl">✏️</span>
            <h3 className="text-lg font-black text-gray-700">Any Other Exam</h3>
            <p className="text-sm text-gray-500">Build your own custom syllabus tracker from scratch.</p>
            <div className="flex items-center gap-1.5 text-sm font-black text-primary-600">
              Create custom <ArrowRight size={15}/>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}
