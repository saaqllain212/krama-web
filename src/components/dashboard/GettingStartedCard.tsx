'use client'

import Link from 'next/link'
import { Timer, RotateCw, Map, ArrowRight, Sparkles } from 'lucide-react'

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
  // Only show when user has done nothing yet
  const isNewUser = focusMinutes === 0 && dueReviews === 0 && syllabusPercentage === 0
  
  if (!isNewUser) return null

  const actions = [
    {
      icon: Timer,
      label: 'Start your first focus session',
      description: '25 minutes is all it takes',
      href: '/dashboard/focus',
      gradient: 'from-primary-500 to-primary-600',
      bgHover: 'hover:bg-primary-50',
    },
    {
      icon: Map,
      label: 'Explore your syllabus map',
      description: 'See what lies ahead',
      href: '/dashboard/syllabus',
      gradient: 'from-cyan-500 to-cyan-600',
      bgHover: 'hover:bg-cyan-50',
    },
    {
      icon: RotateCw,
      label: 'Add your first review topic',
      description: 'Build your spaced repetition deck',
      href: '/dashboard/review',
      gradient: 'from-purple-500 to-purple-600',
      bgHover: 'hover:bg-purple-50',
    },
  ]

  return (
    <div className="card border-2 border-dashed border-primary-200 bg-gradient-to-br from-primary-50/50 to-purple-50/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-xl flex items-center justify-center shadow-soft">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Welcome to Krama!</h3>
          <p className="text-sm text-gray-500">Here are 3 quick ways to get started</p>
        </div>
      </div>

      <div className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.href}
              href={action.href}
              className={`flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white ${action.bgHover} transition-all group`}
            >
              <div className={`w-10 h-10 bg-gradient-to-br ${action.gradient} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900">{action.label}</div>
                <div className="text-xs text-gray-500">{action.description}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}