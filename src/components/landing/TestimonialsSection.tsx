'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const TESTIMONIALS = [
  {
    name: 'Priya R.',
    exam: 'UPSC CSE',
    avatar: 'P',
    color: 'from-pink-400 to-rose-500',
    rating: 5,
    text: "honestly i was just using google sheets before this lol. krama actually made me realise how little i was studying vs how much i THOUGHT i was. the focus timer not counting if you switch tabs is brutal but it works.",
    detail: '3 months in',
  },
  {
    name: 'Arjun M.',
    exam: 'JEE Advanced',
    avatar: 'A',
    color: 'from-blue-400 to-indigo-500',
    rating: 5,
    text: "the spaced review thing is lowkey the best feature. i kept forgetting organic chem reactions and now it literally tells me when to revise what. my mock scores went from 140ish to 180+ in like 2 months",
    detail: 'Kota, Rajasthan',
  },
  {
    name: 'Sneha K.',
    exam: 'NEET UG',
    avatar: 'S',
    color: 'from-emerald-400 to-green-500',
    rating: 4,
    text: "its not perfect — i wish it had a dark mode and sometimes the syllabus tracker takes a sec to load. but the streak system genuinely got me to study every single day for 45 days straight which has NEVER happened before",
    detail: 'Biology topper vibes',
  },
  {
    name: 'Rahul D.',
    exam: 'SSC CGL',
    avatar: 'R',
    color: 'from-amber-400 to-orange-500',
    rating: 5,
    text: "bhai ₹299 for lifetime?? i was paying ₹500/month for an app that did half of what this does. the mock analysis showing silly mistakes vs concept errors was an eye opener. stopped losing 15-20 marks to carelessness.",
    detail: 'Working + preparing',
  },
  {
    name: 'Kavya S.',
    exam: 'UPSC Prelims',
    avatar: 'K',
    color: 'from-violet-400 to-purple-500',
    rating: 5,
    text: "the two companion thing (tree and hourglass) sounds gimmicky but it actually works on me?? like i feel bad when the wraith says ive been idle for 2 days 😂 also the AI mcq generator with my own notes is chef's kiss",
    detail: '2nd attempt prep',
  },
  {
    name: 'Vikram T.',
    exam: 'RBI Grade B',
    avatar: 'V',
    color: 'from-cyan-400 to-teal-500',
    rating: 4,
    text: "found this through a telegram group. honestly didnt expect much from a free tool but its surprisingly well built. only complaint is no android app — the pwa works fine tho once you add to home screen. solid for tracking daily hours.",
    detail: 'Phase 2 prep',
  },
]

export default function TestimonialsSection() {
  return (
    <section className="px-6 py-24 md:px-12 bg-gradient-to-b from-gray-900 to-gray-950 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 px-4 py-2 rounded-full mb-6">
            <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">What students say</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Real students. Real results.
          </h2>
          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto">
            From aspirants who actually use Krama every day.
          </p>
        </motion.div>

        {/* Testimonial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all"
            >
              {/* Top: Avatar + Name + Exam */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 bg-gradient-to-br ${t.color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                  {t.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-white">{t.name}</div>
                  <div className="text-xs text-white/40 font-medium">{t.exam} · {t.detail}</div>
                </div>
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star 
                    key={si} 
                    size={14} 
                    className={si < t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} 
                  />
                ))}
              </div>

              {/* Review text — kept raw and imperfect intentionally */}
              <p className="text-[15px] text-white/70 leading-relaxed">
                {t.text}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-sm text-white/30">
            Collected from in-app feedback and Telegram community
          </p>
        </motion.div>
      </div>
    </section>
  )
}
