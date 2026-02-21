'use client'

import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { useState } from "react"

const EXAMS = [
  {
    id: 'upsc',
    href: '/signup',
    emoji: '🏛️',
    tag: 'Union',
    tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
    name: 'UPSC CSE',
    description: 'Complete tracker for Prelims & Mains. Covers History, Polity, Geography, Ethics & Optionals.',
    gradient: 'from-blue-500/10 to-blue-600/5',
    hoverGradient: 'group-hover:from-blue-500/20 group-hover:to-blue-600/10',
  },
  {
    id: 'jee',
    href: '/signup',
    emoji: '⚛️',
    tag: 'Engineering',
    tagColor: 'bg-red-50 text-red-700 border-red-200',
    name: 'JEE Mains',
    description: 'Chapter-wise tracker for Physics, Chemistry & Maths. Includes weightage analysis.',
    gradient: 'from-red-500/10 to-red-600/5',
    hoverGradient: 'group-hover:from-red-500/20 group-hover:to-red-600/10',
  },
  {
    id: 'neet',
    href: '/signup',
    emoji: '🧬',
    tag: 'Medical',
    tagColor: 'bg-green-50 text-green-700 border-green-200',
    name: 'NEET UG',
    description: 'NCERT-aligned syllabus tracker for Biology (Botany/Zoology), Physics & Chemistry.',
    gradient: 'from-green-500/10 to-green-600/5',
    hoverGradient: 'group-hover:from-green-500/20 group-hover:to-green-600/10',
  },
  {
    id: 'ssc',
    href: '/signup',
    emoji: '📊',
    tag: 'Govt Jobs',
    tagColor: 'bg-orange-50 text-orange-700 border-orange-200',
    name: 'SSC CGL',
    description: 'Strategic tracker for Quant, Reasoning, English & GA. Tier I & II coverage.',
    gradient: 'from-orange-500/10 to-orange-600/5',
    hoverGradient: 'group-hover:from-orange-500/20 group-hover:to-orange-600/10',
  },
  {
    id: 'rbi',
    href: '/signup',
    emoji: '🏦',
    tag: 'Banking',
    tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
    name: 'RBI Grade B',
    description: 'Specialized Phase-II tracker for ESI, FM & English Writing skills.',
    gradient: 'from-purple-500/10 to-purple-600/5',
    hoverGradient: 'group-hover:from-purple-500/20 group-hover:to-purple-600/10',
  },
]

export default function ExamSelector() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* SECTION HEADER */}
        <div className="text-center mb-16">
          <div className="inline-block bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white rounded-full mb-6 shadow-lg shadow-primary-500/30">
            Choose Your Path
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Select Your Battleground
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
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
              onMouseEnter={() => setHoveredCard(exam.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`group relative bg-white p-8 border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden bg-gradient-to-br ${exam.gradient} ${exam.hoverGradient}`}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Content */}
              <div className="relative z-10">
                {/* Top Row: Emoji + Tag */}
                <div className="flex justify-between items-start mb-6">
                  <span className="text-4xl transform group-hover:scale-110 transition-transform duration-300">
                    {exam.emoji}
                  </span>
                  <span className={`px-3 py-1.5 border text-[10px] font-bold uppercase tracking-wider rounded-full ${exam.tagColor}`}>
                    {exam.tag}
                  </span>
                </div>
                
                {/* Title with Arrow */}
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {exam.name}
                  </h3>
                  <ArrowRight 
                    size={20}
                    className="text-gray-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-gray-900 transition-all duration-300" 
                  />
                </div>
                
                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  {exam.description}
                </p>
              </div>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-primary-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-2xl" />
            </Link>
          ))}

          {/* CUSTOM SYLLABUS CARD */}
          <div 
            className="group relative bg-gradient-to-br from-gray-50 to-white p-8 border-2 border-dashed border-gray-300 rounded-2xl hover:border-primary-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
            onMouseEnter={() => setHoveredCard('custom')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Sparkle effect on hover */}
            {hoveredCard === 'custom' && (
              <div className="absolute top-4 right-4 text-primary-500 animate-bounce">
                <Sparkles size={20} />
              </div>
            )}

            <div className="relative z-10">
              {/* Top Row */}
              <div className="flex justify-between items-start mb-6">
                <span className="text-4xl grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110">
                  🛠️
                </span>
                <span className="px-3 py-1.5 bg-gray-100 border border-gray-200 text-gray-500 text-[10px] font-bold uppercase tracking-wider group-hover:bg-primary-100 group-hover:text-primary-700 group-hover:border-primary-200 transition-all duration-300 rounded-full">
                  Custom
                </span>
              </div>
              
              {/* Title */}
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-2xl font-bold text-gray-500 group-hover:text-gray-900 tracking-tight transition-colors duration-300">
                  Bring Your Own
                </h3>
                <ArrowRight 
                  size={20}
                  className="text-gray-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary-500 transition-all duration-300" 
                />
              </div>
              
              {/* Description */}
              <p className="text-gray-400 group-hover:text-gray-600 text-sm leading-relaxed transition-colors duration-300">
                Don't see your exam? Build your own syllabus structure using our Protocol Architect tool below.
              </p>
            </div>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-purple-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-2xl" />
          </div>

        </div>

        {/* DISCLAIMER */}
        <div className="mt-16 mx-auto max-w-4xl p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl text-center">
          <p className="text-xs text-gray-600 leading-relaxed">
            <span className="font-bold text-gray-900">⚠️ Note:</span> The syllabus data is structured for tracking purposes. 
            Always refer to official notifications from conducting bodies (UPSC, NTA, SSC, etc.) for the legally accurate syllabus.
          </p>
        </div>

      </div>
    </section>
  )
}