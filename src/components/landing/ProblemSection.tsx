'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const PROBLEMS = [
  { emoji:'😰', title:'You study 3 hours...', body:"But your brain dumps 50% of it overnight. Without a review system, it's wasted.", stat:'50%', statSub:'forgotten in 24h', color:'bg-red-50 border-red-200', statColor:'text-red-600 bg-red-100' },
  { emoji:'📚', title:'You open your notes...', body:"But 400+ topics stare back. No idea what's urgent, what's done, or what to skip.", stat:'400+', statSub:'topics, no order', color:'bg-amber-50 border-amber-200', statColor:'text-amber-700 bg-amber-100' },
  { emoji:'😔', title:'You start strong...', body:"Day 1 and 2 are great. By day 3, no one notices if you stop. So you do.", stat:'3 days', statSub:'avg before quitting', color:'bg-orange-50 border-orange-200', statColor:'text-orange-700 bg-orange-100' },
  { emoji:'📝', title:'You attempt mocks...', body:"But you don't know if you're failing because of carelessness or a concept gap. So nothing improves.", stat:'?', statSub:'no feedback loop', color:'bg-purple-50 border-purple-200', statColor:'text-purple-700 bg-purple-100' },
]

export default function ProblemSection() {
  return (
    <section className="px-6 py-24 md:px-12 lg:px-16 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 px-4 py-2 rounded-full mb-5">
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Sound familiar?</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
            Why good students still fail —<br/>
            <span className="text-red-500">even the hardworking ones</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium">
            It's not laziness. It's the wrong system. Hours spent without a way to retain, track, or stay consistent.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {PROBLEMS.map((p, i) => (
            <motion.div key={i} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}}
              viewport={{once:true}} transition={{delay:i*0.1,duration:0.5}}
              className={`rounded-2xl border-2 p-6 ${p.color} flex items-start gap-4`}>
              <span className="text-4xl shrink-0">{p.emoji}</span>
              <div className="flex-1">
                <h3 className="font-black text-gray-900 text-base mb-1">{p.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{p.body}</p>
              </div>
              <div className={`shrink-0 text-right px-3 py-2 rounded-xl ${p.statColor}`}>
                <div className="text-xl font-black">{p.stat}</div>
                <div className="text-[9px] font-bold leading-tight max-w-[70px]">{p.statSub}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Krama is the fix */}
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
          className="text-center bg-gradient-to-br from-primary-50 to-purple-50 rounded-3xl border-2 border-primary-200 p-10">
          <div className="text-5xl mb-4">💡</div>
          <h3 className="text-2xl md:text-4xl font-black text-gray-900 mb-3">Krama fixes all four problems.</h3>
          <p className="text-gray-500 font-medium max-w-xl mx-auto text-lg mb-6">
            One free app. Focus timer. Spaced review. Study buddy. Mock analysis. Built specifically for Indian competitive exams.
          </p>
          <Link href="/signup" className="btn btn-primary inline-flex items-center gap-2">
            Start Free <ArrowRight size={16}/>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
