'use client'

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

// Exam data - easy to modify in one place
const EXAMS = [
  {
    id: 'upsc',
    href: '/syllabus/upsc/history',
    emoji: '🏛️',
    tag: 'Union',
    tagColor: 'bg-blue-100 text-blue-700 border-blue-200',
    name: 'UPSC CSE',
    description: 'Complete tracker for Prelims & Mains. Covers History, Polity, Geography, Ethics & Optionals.',
    accentColor: 'group-hover:shadow-[8px_8px_0px_0px_rgba(59,130,246,1)]', // blue
  },
  {
    id: 'jee',
    href: '/syllabus/jee/physics',
    emoji: '⚛️',
    tag: 'Engineering',
    tagColor: 'bg-red-100 text-red-700 border-red-200',
    name: 'JEE Mains',
    description: 'Chapter-wise tracker for Physics, Chemistry & Maths. Includes weightage analysis.',
    accentColor: 'group-hover:shadow-[8px_8px_0px_0px_rgba(239,68,68,1)]', // red
  },
  {
    id: 'neet',
    href: '/syllabus/neet/biology',
    emoji: '🧬',
    tag: 'Medical',
    tagColor: 'bg-green-100 text-green-700 border-green-200',
    name: 'NEET UG',
    description: 'NCERT-aligned syllabus tracker for Biology (Botany/Zoology), Physics & Chemistry.',
    accentColor: 'group-hover:shadow-[8px_8px_0px_0px_rgba(34,197,94,1)]', // green
  },
  {
    id: 'ssc',
    href: '/syllabus/ssc/cgl',
    emoji: '📊',
    tag: 'Govt Jobs',
    tagColor: 'bg-orange-100 text-orange-700 border-orange-200',
    name: 'SSC CGL',
    description: 'Strategic tracker for Quant, Reasoning, English & GA. Tier I & II coverage.',
    accentColor: 'group-hover:shadow-[8px_8px_0px_0px_rgba(249,115,22,1)]', // orange
  },
  {
    id: 'rbi',
    href: '/syllabus/rbi/phase2',
    emoji: '🏦',
    tag: 'Banking',
    tagColor: 'bg-purple-100 text-purple-700 border-purple-200',
    name: 'RBI Grade B',
    description: 'Specialized Phase-II tracker for ESI, FM & English Writing skills.',
    accentColor: 'group-hover:shadow-[8px_8px_0px_0px_rgba(168,85,247,1)]', // purple
  },
]

export default function ExamSelector() {
  return (
    <section className="py-24 bg-white border-y-2 border-black">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* SECTION HEADER */}
        <div className="text-center mb-16">
          {/* Small Tag */}
          <div className="inline-block border-2 border-black bg-brand px-4 py-1 text-xs font-black uppercase tracking-widest mb-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            Choose Your Path
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4 tracking-tight">
            Select Your Battleground
          </h2>
          <p className="text-lg text-black/60 max-w-2xl mx-auto font-medium">
            Krama provides structured syllabus trackers for India's toughest exams. 
            Choose yours to start tracking — or build your own.
          </p>
        </div>

        {/* THE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* EXAM CARDS */}
          {EXAMS.map((exam) => (
            <Link 
              key={exam.id}
              href={exam.href} 
              className={`group relative bg-[#FBF9F6] p-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-300 ${exam.accentColor}`}
            >
              {/* Top Row: Emoji + Tag */}
              <div className="flex justify-between items-start mb-6">
                <span className="text-4xl">{exam.emoji}</span>
                <span className={`px-3 py-1 border text-[10px] font-bold uppercase tracking-wider ${exam.tagColor}`}>
                  {exam.tag}
                </span>
              </div>
              
              {/* Title with Arrow */}
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-2xl font-bold text-black tracking-tight">{exam.name}</h3>
                <ArrowUpRight 
                  size={20} 
                  className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" 
                />
              </div>
              
              {/* Description */}
              <p className="text-black/60 text-sm leading-relaxed font-medium">
                {exam.description}
              </p>

              {/* Bottom Hover Indicator */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
          ))}

          {/* CUSTOM SYLLABUS CARD */}
          <div className="group relative bg-white p-8 border-2 border-dashed border-black/30 hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between">
            <div>
              {/* Top Row */}
              <div className="flex justify-between items-start mb-6">
                <span className="text-4xl grayscale group-hover:grayscale-0 transition-all duration-300">🛠️</span>
                <span className="px-3 py-1 bg-black/5 border border-black/10 text-black/40 text-[10px] font-bold uppercase tracking-wider group-hover:bg-brand group-hover:text-black group-hover:border-black transition-all duration-300">
                  Custom
                </span>
              </div>
              
              {/* Title */}
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-2xl font-bold text-black/50 group-hover:text-black tracking-tight transition-colors duration-300">
                  Bring Your Own
                </h3>
                <ArrowUpRight 
                  size={20} 
                  className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-black" 
                />
              </div>
              
              {/* Description */}
              <p className="text-black/40 group-hover:text-black/60 text-sm leading-relaxed font-medium transition-colors duration-300">
                Don't see your exam? Build your own syllabus structure using our Protocol Architect tool below.
              </p>
            </div>

            {/* Bottom Hover Indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </div>

        </div>

        {/* DISCLAIMER */}
        <div className="mt-16 mx-auto max-w-4xl p-5 bg-[#FBF9F6] border-2 border-black/10 text-center">
          <p className="text-xs text-black/50 leading-relaxed font-medium">
            <span className="font-bold text-black/70">⚠️ Note:</span> The syllabus data is structured for tracking purposes. 
            Always refer to official notifications from conducting bodies (UPSC, NTA, SSC, etc.) for the legally accurate syllabus.
          </p>
        </div>

      </div>
    </section>
  )
}