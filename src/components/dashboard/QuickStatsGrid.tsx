'use client'

import Link from 'next/link'
import { Timer, RotateCw, Map, LineChart, ChevronRight } from 'lucide-react'

interface QuickStatsGridProps {
  focusMinutes: number
  dueReviews: number
  syllabusPercentage: number
  mocksCount: number
}

export default function QuickStatsGrid({ 
  focusMinutes, 
  dueReviews, 
  syllabusPercentage,
  mocksCount 
}: QuickStatsGridProps) {
  const stats = [
    {
      label: 'Focus Time',
      value: `${Math.floor(focusMinutes / 60)}h ${focusMinutes % 60}m`,
      icon: Timer,
      href: '/dashboard/focus',
      gradient: 'from-primary-400 to-primary-600',
      bgGradient: 'from-primary-50 to-primary-100',
    },
    {
      label: 'Reviews Due',
      value: dueReviews,
      icon: RotateCw,
      href: '/dashboard/review',
      gradient: 'from-purple-400 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
    },
    {
      label: 'Syllabus',
      value: `${syllabusPercentage}%`,
      icon: Map,
      href: '/dashboard/syllabus',
      gradient: 'from-cyan-400 to-cyan-600',
      bgGradient: 'from-cyan-50 to-cyan-100',
    },
    {
      label: 'Mock Tests',
      value: mocksCount,
      icon: LineChart,
      href: '/dashboard/mocks',
      gradient: 'from-success-400 to-success-600',
      bgGradient: 'from-success-50 to-success-100',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Link
            key={stat.label}
            href={stat.href}
            className="card group hover:scale-[1.02] transition-all"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4 shadow-soft group-hover:shadow-glow-primary transition-all`}>
              <Icon className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            
            <div className="mb-1">
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">{stat.label}</span>
              <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        )
      })}
    </div>
  )
}