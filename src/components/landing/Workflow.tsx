'use client'

import { motion } from 'framer-motion'
import { BookOpen, Timer, RefreshCw, ArrowRight } from 'lucide-react'

const STEPS = [
  {
    num: '01',
    icon: BookOpen,
    title: 'Input Syllabus',
    desc: 'Break your massive exam syllabus into small, atomic topics. Track completion visually with our interactive checklist.',
    color: 'from-primary-500 to-primary-600',
    iconBg: 'bg-primary-100',
    iconColor: 'text-primary-600',
  },
  {
    num: '02',
    icon: Timer,
    title: 'Focus Session',
    desc: 'Pick one topic. Start the timer. Work deeply for 25 minutes. The system ensures no distractions allowed.',
    color: 'from-purple-500 to-purple-600',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    num: '03',
    icon: RefreshCw,
    title: 'Spaced Review',
    desc: 'The algorithm brings that topic back tomorrow, then in 3 days, then 7. You never forget what matters.',
    color: 'from-success-500 to-success-600',
    iconBg: 'bg-success-100',
    iconColor: 'text-success-600',
  },
]

export default function Workflow() {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-24">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        
        {/* Header */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 px-4 py-2 rounded-full text-sm font-semibold mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span>
            The Process
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How it works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Three simple steps to transform how you study
          </p>
        </motion.div>

        {/* Timeline - Desktop */}
        <div className="hidden md:block relative">
          {/* Connecting Line */}
          <div className="absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-200 via-purple-200 to-success-200" />
          
          <div className="grid grid-cols-3 gap-8">
            {STEPS.map((step, index) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                {/* Step Card */}
                <div className="relative bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  
                  {/* Icon Circle on top of timeline */}
                  <div className={`absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 ${step.iconBg} rounded-full flex items-center justify-center shadow-lg ring-4 ring-white`}>
                    <step.icon className={`w-10 h-10 ${step.iconColor}`} />
                  </div>

                  {/* Number Badge */}
                  <div className={`mt-16 mb-4 inline-block bg-gradient-to-r ${step.color} text-white px-4 py-1.5 rounded-full text-sm font-bold`}>
                    {step.num}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {/* Arrow connector (between cards) */}
                {index < STEPS.length - 1 && (
                  <motion.div
                    className="absolute top-20 -right-4 text-gray-300 hidden lg:block"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 + index * 0.2 }}
                  >
                    <ArrowRight size={24} />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Timeline - Mobile (Vertical) */}
        <div className="md:hidden space-y-6">
          {STEPS.map((step, index) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative pl-16"
            >
              {/* Vertical connecting line */}
              {index < STEPS.length - 1 && (
                <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gradient-to-b from-primary-200 to-transparent" />
              )}

              {/* Icon Circle */}
              <div className={`absolute left-0 top-4 w-16 h-16 ${step.iconBg} rounded-full flex items-center justify-center shadow-md`}>
                <step.icon className={`w-7 h-7 ${step.iconColor}`} />
              </div>

              {/* Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className={`inline-block bg-gradient-to-r ${step.color} text-white px-3 py-1 rounded-full text-xs font-bold mb-3`}>
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}