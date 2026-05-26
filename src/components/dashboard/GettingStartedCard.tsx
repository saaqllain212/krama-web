'use client'

import Link from 'next/link'
import { Timer, RotateCw, Map, ArrowRight, Sparkles, Play } from 'lucide-react'
import { motion } from 'framer-motion'

interface GettingStartedCardProps {
  focusMinutes: number
  dueReviews: number
  syllabusPercentage: number
}

export default function GettingStartedCard({ 
  focusMinutes, 
  dueReviews, 
  syllabusPercentage 
}: GettingStartedCardProps) {
  const isNewUser = focusMinutes === 0 && dueReviews === 0 && syllabusPercentage === 0
  
  if (!isNewUser) return null

  const actions = [
    {
      icon: Timer,
      emoji: '🎯',
      label: 'Start your first focus session',
      description: '25 minutes of deep work — that\'s all it takes to begin',
      href: '/dashboard/focus',
      gradient: 'from-primary-500 to-primary-600',
      bgHover: 'hover:border-primary-300',
      primary: true,
    },
    {
      icon: Map,
      emoji: '🗺️',
      label: 'Explore your syllabus map',
      description: 'See every topic laid out clearly',
      href: '/dashboard/syllabus',
      gradient: 'from-cyan-500 to-cyan-600',
      bgHover: 'hover:border-cyan-300',
      primary: false,
    },
    {
      icon: RotateCw,
      emoji: '🧠',
      label: 'Add your first review topic',
      description: 'Never forget what you study',
      href: '/dashboard/review',
      gradient: 'from-purple-500 to-purple-600',
      bgHover: 'hover:border-purple-300',
      primary: false,
    },
  ]

  return (
    <div className="card border-2 border-primary-200 bg-gradient-to-br from-primary-50/60 to-purple-50/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-purple-500 rounded-xl flex items-center justify-center shadow-soft flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Welcome to Krama! 🎉</h3>
          <p className="text-sm text-gray-500 mt-0.5">Your journey starts here — pick one to begin</p>
        </div>
      </div>

      <div className="space-y-3">
        {actions.map((action, i) => {
          const Icon = action.icon
          return (
            <motion.div
              key={action.href}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <Link
                href={action.href}
                className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border bg-white ${action.bgHover} transition-all group active:scale-[0.98] ${
                  action.primary ? 'border-primary-200 shadow-soft' : 'border-gray-100'
                }`}
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${action.gradient} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                    {action.label}
                    {action.primary && (
                      <span className="text-[10px] font-bold bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{action.description}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
