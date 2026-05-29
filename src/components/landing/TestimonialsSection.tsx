'use client'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const T = [
  { name:'Priya R.', exam:'UPSC CSE', av:'P', c:'from-pink-400 to-rose-500', r:5, text:"honestly i was just using google sheets before this lol. krama actually made me realise how little i was studying vs how much i THOUGHT i was. the focus timer not counting if you switch tabs is brutal but it works.", d:'3 months streak' },
  { name:'Arjun M.', exam:'JEE Advanced', av:'A', c:'from-blue-400 to-indigo-500', r:5, text:"the spaced review thing is lowkey the best feature. i kept forgetting organic chem reactions and now it literally tells me when to revise what. my mock scores went from 140ish to 180+ in like 2 months", d:'Kota, Rajasthan' },
  { name:'Sneha K.', exam:'NEET UG', av:'S', c:'from-emerald-400 to-green-500', r:4, text:"its not perfect — i wish it had dark mode. but the streak system genuinely got me to study every single day for 45 days straight which has NEVER happened before lol", d:'45-day streak' },
  { name:'Rahul D.', exam:'SSC CGL', av:'R', c:'from-amber-400 to-orange-500', r:5, text:"bhai ₹149 for lifetime?? i was paying ₹500/month for an app that did half of what this does. the mock analysis showing silly mistakes vs concept errors changed everything for me", d:'Working + preparing' },
  { name:'Kavya S.', exam:'UPSC Prelims', av:'K', c:'from-violet-400 to-purple-500', r:5, text:"the companion thing sounds childish but it genuinely works on me. i feel bad when the wraith says ive been idle. also the AI mcq generator with my own notes is actually insane. why is this free??", d:'2nd attempt' },
  { name:'Vikram T.', exam:'RBI Grade B', av:'V', c:'from-cyan-400 to-teal-500', r:4, text:"found this through a telegram group. didnt expect much. surprisingly well built. only complaint is no android app yet — the pwa works fine though once you add to home screen.", d:'Phase 2 prep' },
]

export default function TestimonialsSection() {
  return (
    <section className="px-6 py-24 md:px-12 bg-white relative overflow-hidden">
      <div className="absolute top-20 left-10 w-96 h-96 bg-amber-100/60 rounded-full blur-3xl"/>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-100/60 rounded-full blur-3xl"/>
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div className="text-center mb-14" initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-full mb-5">
            <span className="text-xs font-black text-amber-700 uppercase tracking-wider">Real students · Real results</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">What students actually say.</h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto font-medium">Unfiltered. In their own words.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {T.map((t, i) => (
            <motion.div key={t.name} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.08}}
              className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-gray-200 hover:shadow-medium transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 bg-gradient-to-br ${t.c} rounded-full flex items-center justify-center text-white font-black text-sm`}>{t.av}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-sm text-gray-900">{t.name}</div>
                  <div className="text-xs text-gray-400 font-semibold">{t.exam} · {t.d}</div>
                </div>
              </div>
              <div className="flex gap-0.5 mb-3">
                {Array.from({length:5}).map((_,si)=>(
                  <Star key={si} size={13} className={si<t.r?'text-amber-400 fill-amber-400':'text-gray-200 fill-gray-200'}/>
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{t.text}</p>
            </motion.div>
          ))}
        </div>
        <p className="text-center mt-8 text-xs text-gray-400">Collected from in-app feedback and Telegram community</p>
      </div>
    </section>
  )
}
