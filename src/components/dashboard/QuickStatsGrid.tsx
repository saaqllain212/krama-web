'use client'

import Link from 'next/link'
import { Timer, RotateCw, Map, LineChart, ChevronRight } from 'lucide-react'
import AnimatedNumber from '@/components/ui/AnimatedNumber'

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
  const hours = Math.floor(focusMinutes / 60)
  const mins = focusMinutes % 60

  const stats = [
    {
      label: 'Focus Time',
      numericValue: hours,
      suffix: 'h',
      extraText: mins > 0 ? ` ${mins}m` : '',
      icon: Timer,
      href: '/dashboard/focus',
      gradient: 'from-primary-400 to-primary-600',
    },
    {
      label: 'Reviews Due',
      numericValue: dueReviews,
      suffix: '',
      extraText: '',
      icon: RotateCw,
      href: '/dashboard/review',
      gradient: 'from-purple-400 to-purple-600',
    },
    {
      label: 'Syllabus',
      numericValue: syllabusPercentage,
      suffix: '%',
      extraText: '',
      icon: Map,
      href: '/dashboard/syllabus',
      gradient: 'from-cyan-400 to-cyan-600',
    },
    {
      label: 'Mock Tests',
      numericValue: mocksCount,
      suffix: '',
      extraText: '',
      icon: LineChart,
      href: '/dashboard/mocks',
      gradient: 'from-success-400 to-success-600',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat, i) => {
        const Icon = stat.icon
        return (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-soft group hover:border-primary-200 hover:shadow-medium transition-all active:scale-[0.98]"
          >
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-2 sm:mb-3`}>
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" strokeWidth={2.5} />
            </div>
            
            <div className="mb-0.5">
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                <AnimatedNumber 
                  value={stat.numericValue} 
                  duration={600 + i * 150}
                  suffix={stat.suffix}
                />
                {stat.extraText && (
                  <span className="text-sm text-gray-500 font-semibold">{stat.extraText}</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">{stat.label}</span>
              <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        )
      })}
    </div>
  )
}