'use client'

import { useMemo } from 'react'
import { Target, CheckCircle, XCircle } from 'lucide-react'

type FocusLog = {
  id: string
  created_at: string
  duration_minutes: number
  target_minutes: number
}

type EfficiencyScoreCardProps = {
  logs: FocusLog[]
}

export default function EfficiencyScoreCard({ logs }: EfficiencyScoreCardProps) {
  const stats = useMemo(() => {
    if (logs.length === 0) return null
    
    // Calculate completion rate
    const completed = logs.filter(log => log.duration_minutes >= log.target_minutes).length
    const total = logs.length
    const completionRate = Math.round((completed / total) * 100)
    
    // Calculate average efficiency (actual vs planned)
    const totalPlanned = logs.reduce((sum, log) => sum + log.target_minutes, 0)
    const totalActual = logs.reduce((sum, log) => sum + log.duration_minutes, 0)
    const efficiency = totalPlanned === 0 ? 0 : Math.round((totalActual / totalPlanned) * 100)
    
    // Get badge
    let badge = 'Getting Started'
    let badgeColor = 'from-gray-500 to-gray-600'
    
    if (efficiency >= 90) {
      badge = 'Master'
      badgeColor = 'from-purple-500 to-pink-600'
    } else if (efficiency >= 75) {
      badge = 'Excellent'
      badgeColor = 'from-green-500 to-emerald-600'
    } else if (efficiency >= 60) {
      badge = 'Good'
      badgeColor = 'from-blue-500 to-cyan-600'
    } else if (efficiency >= 40) {
      badge = 'Fair'
      badgeColor = 'from-amber-500 to-orange-600'
    } else {
      badge = 'Needs Work'
      badgeColor = 'from-red-500 to-rose-600'
    }
    
    return {
      completed,
      total,
      completionRate,
      efficiency,
      badge,
      badgeColor
    }
  }, [logs])
  
  if (!stats) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="h-[200px] flex items-center justify-center text-sm text-gray-400">
          Complete sessions to see efficiency
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg">
          <Target className="text-white" size={20} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Efficiency Score</h3>
          <p className="text-xs text-gray-500">How well you stick to plans</p>
        </div>
      </div>
      
      {/* Main Score */}
      <div className="text-center mb-6">
        <div className="inline-block relative">
          <svg className="w-32 h-32 transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="url(#efficiencyGradient)"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${(stats.efficiency / 100) * 351.86} 351.86`}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="efficiencyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#14b8a6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">{stats.efficiency}%</div>
              <div className="text-xs text-gray-500 font-medium">Efficiency</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Badge */}
      <div className={`mb-4 p-3 bg-gradient-to-r ${stats.badgeColor} rounded-lg text-center`}>
        <div className="text-sm font-bold text-white uppercase tracking-wide">{stats.badge}</div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={14} className="text-green-600" />
            <span className="text-xs font-bold text-gray-600">Completed</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
        </div>
        
        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center gap-2 mb-1">
            <XCircle size={14} className="text-red-600" />
            <span className="text-xs font-bold text-gray-600">Incomplete</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.total - stats.completed}</div>
        </div>
      </div>
      
      {/* Advice */}
      <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <p className="text-xs text-gray-700">
          <span className="font-bold">💡 Tip:</span> {
            stats.efficiency >= 75 
              ? 'Excellent focus! Try longer sessions.'
              : stats.efficiency >= 50
                ? 'Good progress! Set realistic targets.'
                : 'Start with shorter 25-min sessions.'
          }
        </p>
      </div>
    </div>
  )
}