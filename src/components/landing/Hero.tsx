'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Flame, BookOpen, Target, Users } from 'lucide-react'
import { useTracker } from '@/analytics/useTracker' 
import { EVENTS } from '@/analytics/events'
import { motion } from 'framer-motion'

// Animated stat that counts up
function CountUp({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = end / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [end, duration])
  return <span className="tabular-nums">{count}{suffix}</span>
}

// Floating mock dashboard card
function DashboardMockup() {
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    const timer = setTimeout(() => setProgress(72), 600)
    return () => clearTimeout(timer)
  }, [])

  const weekData = [45, 90, 60, 120, 30, 75, 0]
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30, rotateX: 5 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-md"
    >
      {/* Glow behind card */}
      <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 via-purple-500/15 to-cyan-500/20 rounded-3xl blur-2xl" />
      
      <div className="relative bg-white rounded-2xl shadow-large border border-gray-200/80 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Today&apos;s Progress</p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-4xl font-bold text-gray-900 tabular-nums">
                  <CountUp end={4} duration={1500} />
                  <span className="text-xl text-gray-400 font-semibold">h</span>
                  {' '}
                  <CountUp end={20} duration={1800} />
                  <span className="text-xl text-gray-400 font-semibold">m</span>
                </span>
                <span className="text-sm text-gray-400 font-medium">/ 6h</span>
              </div>
            </div>
            
            {/* Circular progress */}
            <div className="relative w-16 h-16">
              <svg className="transform -rotate-90" width="64" height="64">
                <circle cx="32" cy="32" r="26" stroke="#f0f0f0" strokeWidth="6" fill="none" />
                <circle 
                  cx="32" cy="32" r="26" 
                  stroke="url(#heroProgressGrad)" strokeWidth="6" fill="none"
                  strokeLinecap="round"
                  strokeDasharray={163.36}
                  strokeDashoffset={163.36 - (progress / 100) * 163.36}
                  className="transition-all duration-1000 ease-out"
                  style={{ transitionDelay: '0.6s' }}
                />
                <defs>
                  <linearGradient id="heroProgressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#5B8FF9" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-900">{progress}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Week heatmap */}
        <div className="px-6 pb-4">
          <div className="flex items-end gap-2 h-12">
            {weekData.map((mins, i) => (
              <motion.div 
                key={i} 
                className="flex-1 flex flex-col items-center gap-1"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.8 + i * 0.08, duration: 0.4, ease: 'easeOut' }}
                style={{ transformOrigin: 'bottom' }}
              >
                <div 
                  className={`w-full rounded-sm ${mins === 0 ? 'bg-gray-100' : mins >= 90 ? 'bg-primary-500' : mins >= 60 ? 'bg-primary-400' : 'bg-primary-200'}`}
                  style={{ height: `${Math.max(mins === 0 ? 3 : 8, (mins / 120) * 32)}px` }}
                />
                <span className="text-[9px] font-semibold text-gray-400">{dayLabels[i]}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 border-t border-gray-100">
          {[
            { icon: Flame, value: '12', label: 'Streak', color: 'text-orange-500' },
            { icon: BookOpen, value: '47%', label: 'Syllabus', color: 'text-cyan-500' },
            { icon: Target, value: '85', label: 'Mock Score', color: 'text-green-500' },
          ].map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + i * 0.1 }}
              className="flex flex-col items-center py-4 border-r border-gray-100 last:border-r-0"
            >
              <stat.icon size={14} className={stat.color} />
              <span className="text-lg font-bold text-gray-900 mt-1">{stat.value}</span>
              <span className="text-[10px] font-medium text-gray-400">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function Hero() {
  const { track } = useTracker()

  return (
    <section className="relative min-h-[92vh] px-6 py-16 md:px-12 lg:px-16 overflow-hidden">
      
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/80 via-white to-purple-50/60" />
      
      {/* Subtle dot grid */}
      <div 
        className="absolute inset-0 opacity-[0.025]" 
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Content */}
      <div className="relative z-10 grid min-h-[85vh] grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16 max-w-7xl mx-auto">
        
        {/* Left Column */}
        <div className="flex flex-col items-start gap-6">
          
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 shadow-soft"
          >
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-gray-600">Try free for 14 days · No card needed</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Study without <br />
            <span className="text-gradient">the overwhelm.</span>
          </motion.h1>
          
          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-lg text-base sm:text-lg md:text-xl font-medium text-gray-500 leading-relaxed"
          >
            Focus timer, syllabus tracker, spaced revision, AI MCQs — 
            everything you need to crack UPSC, JEE, NEET & more. In one place.
          </motion.p>

          {/* Exam tags */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-2"
          >
            {['UPSC', 'JEE', 'NEET', 'SSC', 'RBI'].map((exam) => (
              <span key={exam} className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-600 shadow-soft">
                {exam}
              </span>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-2"
          >
            <Link 
              href="/signup" 
              onClick={() => track(EVENTS.AUTH_SIGNUP_CLICKED, { location: 'hero_section' })}
              className="btn btn-primary group inline-flex items-center gap-3 text-base md:text-lg px-8 py-4 rounded-xl"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <span className="text-sm text-gray-400 font-medium">
              Free forever · Pro for ₹149 lifetime
            </span>
          </motion.div>

          {/* Social proof strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex items-center gap-4 mt-4 pt-6 border-t border-gray-200/60"
          >
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users size={16} className="text-gray-400" />
              <span className="font-semibold text-gray-700">500+</span>
              <span>students joined</span>
            </div>
            <span className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <span className="font-semibold text-gray-700">₹149</span>
              <span>lifetime after trial</span>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Product Mockup */}
        <div className="hidden md:flex justify-center md:justify-end">
          <DashboardMockup />
        </div>
      </div>
    </section>
  )
}
