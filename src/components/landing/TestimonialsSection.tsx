'use client'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const TESTIMONIALS = [
  { name:'Priya R.', exam:'UPSC CSE', avatar:'P', color:'from-pink-400 to-rose-500', rating:5, text:"I was using Google Sheets before this. Krama showed me I was actually studying 2 hours less per day than I thought. The focus timer counting only real study time hit different. 3 months in and I haven't missed a day.", detail:'3 months streak' },
  { name:'Arjun M.', exam:'JEE Advanced', avatar:'A', color:'from-blue-400 to-indigo-500', rating:5, text:"The spaced review is the best feature. I kept forgetting organic reactions. Now Krama tells me exactly when to revise what. Went from 140 to 182 in two months. I'm not even kidding.", detail:'Kota, Rajasthan' },
  { name:'Sneha K.', exam:'NEET UG', avatar:'S', color:'from-emerald-400 to-green-500', rating:4, text:"Not perfect — I wish it had dark mode. But the streak system got me studying every single day for 45 days straight. That has literally NEVER happened before. Worth it just for that.", detail:'45-day streak' },
  { name:'Rahul D.', exam:'SSC CGL', avatar:'R', color:'from-amber-400 to-orange-500', rating:5, text:"I was paying ₹500/month for an app that did half of this. The mock analysis that shows silly mistakes vs concept gaps was a game changer. I stopped losing 15–20 marks to carelessness in 3 weeks.", detail:'Working + preparing' },
  { name:'Kavya S.', exam:'UPSC Prelims', avatar:'K', color:'from-violet-400 to-purple-500', rating:5, text:"The companion thing sounds childish but it genuinely works on me. I feel bad when the Wraith says I've been idle. Also the AI MCQ generator with my own NCERT notes is actually insane. Why is this free??", detail:'2nd attempt prep' },
  { name:'Vikram T.', exam:'RBI Grade B', avatar:'V', color:'from-cyan-400 to-teal-500', rating:4, text:"Found this in a Telegram group. Didn't expect much. Surprisingly well built. No Android app yet but the PWA works perfectly once you add to home screen. Most useful free tool I've found for RBI prep.", detail:'Phase 2 prep' },
]

export default function TestimonialsSection() {
  return (
    <section className="px-6 py-24 md:px-12 bg-gradient-to-b from-gray-900 to-gray-950 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div className="text-center mb-14" initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 px-4 py-2 rounded-full mb-5">
            <span className="text-xs font-black text-amber-300 uppercase tracking-wider">Real students · Real results</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            What students actually say.
          </h2>
          <p className="text-lg text-white/50 max-w-xl mx-auto font-medium">
            Unfiltered. In their own words. From students using Krama every day.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={t.name} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.08}}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 hover:bg-white/8 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 bg-gradient-to-br ${t.color} rounded-full flex items-center justify-center text-white font-black text-sm`}>
                  {t.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-sm text-white">{t.name}</div>
                  <div className="text-xs text-white/40 font-semibold">{t.exam} · {t.detail}</div>
                </div>
              </div>
              <div className="flex gap-0.5 mb-3">
                {Array.from({length:5}).map((_,si)=>(
                  <Star key={si} size={13} className={si < t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600 fill-gray-600'}/>
                ))}
              </div>
              <p className="text-sm text-white/70 leading-relaxed">{t.text}</p>
            </motion.div>
          ))}
        </div>
        <motion.p className="text-center mt-10 text-xs text-white/25" initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}}>
          Collected from in-app feedback and Telegram community
        </motion.p>
      </div>
    </section>
  )
}
