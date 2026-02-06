'use client'

import { motion } from 'framer-motion'
import { Timer, Calendar, CheckSquare, TrendingUp, Sparkles } from 'lucide-react'

const TOOLS = [
  {
    id: 'pomodoro',
    icon: Timer,
    title: 'Pomodoro Timer',
    desc: 'Deep focus sessions with zero distractions',
    size: 'large', // Takes 2 columns on desktop
    gradient: 'from-orange-400 to-red-500',
    preview: (
      <motion.div 
        className="text-6xl md:text-7xl font-black text-white/90 tabular-nums"
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        25:00
      </motion.div>
    ),
  },
  {
    id: 'review',
    icon: Calendar,
    title: 'Spaced Review',
    desc: 'Smart algorithm ensures you never forget',
    size: 'medium',
    gradient: 'from-purple-400 to-purple-600',
    preview: (
      <div className="space-y-2 text-xs font-medium text-white/80">
        <motion.div 
          className="flex items-center gap-2"
          initial={{ x: -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-white font-bold">→</span>
          <span>Ch 3 - Today</span>
        </motion.div>
        <motion.div 
          className="flex items-center gap-2 opacity-60"
          initial={{ x: -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 0.6 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <span>○</span>
          <span>Ch 1 - In 3 days</span>
        </motion.div>
        <motion.div 
          className="flex items-center gap-2 opacity-40"
          initial={{ x: -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 0.4 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <span>○</span>
          <span>Ch 5 - In 7 days</span>
        </motion.div>
      </div>
    ),
  },
  {
    id: 'syllabus',
    icon: CheckSquare,
    title: 'Syllabus Tracker',
    desc: 'Visual progress for every topic',
    size: 'medium',
    gradient: 'from-cyan-400 to-blue-500',
    preview: (
      <div className="space-y-2 text-xs font-medium text-white/80">
        <motion.div 
          className="flex items-center gap-2 line-through opacity-50"
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 0.5 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <span>✓</span>
          <span>Algebra</span>
        </motion.div>
        <motion.div 
          className="flex items-center gap-2 line-through opacity-50"
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 0.5 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <span>✓</span>
          <span>Calculus</span>
        </motion.div>
        <motion.div 
          className="flex items-center gap-2 font-bold text-white"
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <span>→</span>
          <span>Geometry</span>
        </motion.div>
      </div>
    ),
  },
  {
    id: 'mocks',
    icon: TrendingUp,
    title: 'Mock Tests',
    desc: 'Track scores and improve faster',
    size: 'large',
    gradient: 'from-green-400 to-emerald-600',
    preview: (
      <div className="space-y-3">
        <motion.div 
          className="flex justify-between items-center text-white"
          initial={{ y: 10, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-sm">Jan 9</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">85</span>
            <span className="text-lg text-white/60">/100</span>
            <span className="text-green-300">↑</span>
          </div>
        </motion.div>
        <motion.div 
          className="flex justify-between items-center text-white/60 text-sm"
          initial={{ y: 10, opacity: 0 }}
          whileInView={{ y: 0, opacity: 0.6 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <span>Jan 6</span>
          <span>78/100</span>
        </motion.div>
        <motion.div 
          className="flex justify-between items-center text-white/40 text-sm"
          initial={{ y: 10, opacity: 0 }}
          whileInView={{ y: 0, opacity: 0.4 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <span>Jan 3</span>
          <span>72/100</span>
        </motion.div>
      </div>
    ),
  },
]

export default function ToolsGrid() {
  return (
    <section className="bg-gray-50 px-6 py-24 md:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles size={16} className="animate-pulse" />
            Your Arsenal
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything you need
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Four powerful tools. One focused experience.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {TOOLS.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className={`
                group relative overflow-hidden rounded-3xl p-8 
                ${tool.size === 'large' ? 'md:col-span-2' : 'md:col-span-1'}
                bg-gradient-to-br ${tool.gradient}
                shadow-lg hover:shadow-2xl transition-all duration-300
              `}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_70%)]" />
              
              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <motion.div 
                  className="mb-6 inline-flex p-3 bg-white/20 backdrop-blur-sm rounded-2xl"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <tool.icon className="w-6 h-6 text-white" />
                </motion.div>

                {/* Title & Description */}
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                  {tool.title}
                </h3>
                <p className="text-sm text-white/80 mb-6 leading-relaxed">
                  {tool.desc}
                </p>

                {/* Preview */}
                <div className="pt-6 border-t border-white/20">
                  {tool.preview}
                </div>
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 blur-xl" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-gray-600 text-sm">
            All tools work seamlessly together to keep you focused
          </p>
        </motion.div>
      </div>
    </section>
  )
}