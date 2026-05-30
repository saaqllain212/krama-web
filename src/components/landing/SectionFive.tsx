'use client'
// Section 5 — Testimonials (dual ticker) + Mobile PWA
import { motion } from 'framer-motion'

const TESTIMONIALS = [
  { name:'Priya R.', exam:'UPSC CSE', av:'P', c:'from-pink-400 to-rose-500', r:5, text:"I was using Google Sheets before. Krama showed me I was actually studying 2 hours less per day than I thought. 3 months in and haven't missed a day." },
  { name:'Arjun M.', exam:'JEE Advanced', av:'A', c:'from-blue-400 to-indigo-500', r:5, text:"The spaced review is the best feature. I kept forgetting organic reactions. Went from 140 to 182 in two months. Not kidding." },
  { name:'Sneha K.', exam:'NEET UG', av:'S', c:'from-emerald-400 to-green-500', r:4, text:"The streak system got me studying every single day for 45 days straight. That has literally NEVER happened before." },
  { name:'Rahul D.', exam:'SSC CGL', av:'R', c:'from-amber-400 to-orange-500', r:5, text:"I was paying ₹500/month for an app that did half of this. The mock analysis showing silly mistakes vs concept gaps changed everything." },
  { name:'Kavya S.', exam:'UPSC Prelims', av:'K', c:'from-violet-400 to-purple-500', r:5, text:"The Wraith companion sounds childish but genuinely works on me. Also the AI MCQ with my own NCERT notes is insane. Why is this free??" },
  { name:'Vikram T.', exam:'RBI Grade B', av:'V', c:'from-cyan-400 to-teal-500', r:4, text:"Surprisingly well built. PWA works perfectly once you add to home screen. Most useful free tool I've found for RBI prep." },
  { name:'Meera P.', exam:'NEET PG', av:'M', c:'from-rose-400 to-pink-500', r:5, text:"The study buddy feature is a game changer. My buddy and I compete daily — neither of us wants to be the one who logged less hours." },
  { name:'Kiran B.', exam:'UPSC CSE', av:'K', c:'from-green-400 to-emerald-500', r:5, text:"Finally deleted Notion after 2 years. Krama has everything in one place and it actually knows when to remind me to revise. Magic." },
]

function TestimonialCard({ t }: { t: typeof TESTIMONIALS[0] }) {
  return (
    <div className="flex-shrink-0 w-72 border border-white/8 p-6 bg-white/3 mx-2">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-9 h-9 bg-gradient-to-br ${t.c} flex items-center justify-center text-white font-black text-sm shrink-0`}>{t.av}</div>
        <div>
          <p className="font-black text-white text-sm">{t.name}</p>
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider">{t.exam}</p>
        </div>
        <div className="ml-auto flex gap-0.5">
          {Array.from({length:t.r}).map((_,i)=><span key={i} className="text-amber-400 text-xs">★</span>)}
        </div>
      </div>
      <p className="text-xs text-white/50 leading-relaxed">{t.text}</p>
    </div>
  )
}

export default function SectionFive() {
  const row1 = [...TESTIMONIALS, ...TESTIMONIALS]
  const row2 = [...TESTIMONIALS.slice(4), ...TESTIMONIALS.slice(0,4), ...TESTIMONIALS.slice(4), ...TESTIMONIALS.slice(0,4)]

  return (
    <section className="bg-[#0a0a0a] py-28 overflow-hidden">
      <div className="px-6 md:px-12 lg:px-20 mb-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <span className="text-[10px] font-black text-white/15 uppercase tracking-widest">06</span>
            <div className="h-px w-8 bg-white/15"/>
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">What Students Say</span>
          </div>
          <motion.h2 initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
            transition={{duration:0.8,ease:[0.16,1,0.3,1]}}
            className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight max-w-2xl"
            style={{fontFamily:"'Playfair Display',Georgia,serif",fontStyle:'italic'}}>
            Unfiltered.<br/>In their own words.
          </motion.h2>
        </div>
      </div>

      {/* Row 1 — scrolls left */}
      <div className="mb-4 overflow-hidden">
        <div className="flex" style={{animation:'ticker1 40s linear infinite'}}>
          {row1.map((t,i)=><TestimonialCard key={i} t={t}/>)}
        </div>
      </div>

      {/* Row 2 — scrolls right */}
      <div className="overflow-hidden">
        <div className="flex" style={{animation:'ticker2 45s linear infinite'}}>
          {row2.map((t,i)=><TestimonialCard key={i} t={t}/>)}
        </div>
      </div>

      <style>{`
        @keyframes ticker1 { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes ticker2 { 0%{transform:translateX(-50%)} 100%{transform:translateX(0)} }
      `}</style>

      <div className="px-6 md:px-12 lg:px-20 mt-12">
        <p className="text-center text-[10px] text-white/15 font-bold uppercase tracking-widest">Collected from in-app feedback and Telegram community</p>
      </div>
    </section>
  )
}
