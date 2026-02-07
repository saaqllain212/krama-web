'use client'

import { useMemo } from 'react'
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react'

type FocusLog = {
  created_at: string
  duration_minutes: number
}

type WeeklyComparisonCardProps = {
  logs: FocusLog[]
}

export default function WeeklyComparisonCard({ logs }: WeeklyComparisonCardProps) {
  const stats = useMemo(() => {
    const now = new Date()
    const thisWeekStart = new Date(now)
    thisWeekStart.setDate(now.getDate() - now.getDay()) // Start of this week (Sunday)
    thisWeekStart.setHours(0, 0, 0, 0)
    
    const lastWeekStart = new Date(thisWeekStart)
    lastWeekStart.setDate(thisWeekStart.getDate() - 7)
    
    const lastWeekEnd = new Date(thisWeekStart)
    lastWeekEnd.setMilliseconds(-1)
    
    // Calculate this week
    const thisWeekLogs = logs.filter(log => {
      const date = new Date(log.created_at)
      return date >= thisWeekStart && date <= now
    })
    
    const thisWeekMinutes = thisWeekLogs.reduce((sum, log) => sum + log.duration_minutes, 0)
    const thisWeekHours = Number((thisWeekMinutes / 60).toFixed(1))
    const thisWeekSessions = thisWeekLogs.length
    
    // Calculate last week
    const lastWeekLogs = logs.filter(log => {
      const date = new Date(log.created_at)
      return date >= lastWeekStart && date <= lastWeekEnd
    })
    
    const lastWeekMinutes = lastWeekLogs.reduce((sum, log) => sum + log.duration_minutes, 0)
    const lastWeekHours = Number((lastWeekMinutes / 60).toFixed(1))
    const lastWeekSessions = lastWeekLogs.length
    
    // Calculate change
    const hoursChange = lastWeekHours === 0 
      ? (thisWeekHours > 0 ? 100 : 0)
      : Math.round(((thisWeekHours - lastWeekHours) / lastWeekHours) * 100)
    
    const sessionsChange = lastWeekSessions === 0
      ? (thisWeekSessions > 0 ? 100 : 0)
      : Math.round(((thisWeekSessions - lastWeekSessions) / lastWeekSessions) * 100)
    
    return {
      thisWeekHours,
      lastWeekHours,
      thisWeekSessions,
      lastWeekSessions,
      hoursChange,
      sessionsChange,
      isImproving: hoursChange >= 0
    }
  }, [logs])
  
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
          <Calendar className="text-white" size={20} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Weekly Comparison</h3>
          <p className="text-xs text-gray-500">This week vs last week</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Hours Comparison */}
        <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Focus Hours</span>
            <div className={`flex items-center gap-1 text-xs font-bold ${stats.hoursChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.hoursChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {Math.abs(stats.hoursChange)}%
            </div>
          </div>
          <div className="flex items-end gap-3">
            <div className="text-3xl font-black text-gray-900">{stats.thisWeekHours}h</div>
            <div className="text-sm text-gray-500 mb-1">vs {stats.lastWeekHours}h last week</div>
          </div>
        </div>
        
        {/* Sessions Comparison */}
        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Sessions</span>
            <div className={`flex items-center gap-1 text-xs font-bold ${stats.sessionsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.sessionsChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {Math.abs(stats.sessionsChange)}%
            </div>
          </div>
          <div className="flex items-end gap-3">
            <div className="text-3xl font-black text-gray-900">{stats.thisWeekSessions}</div>
            <div className="text-sm text-gray-500 mb-1">vs {stats.lastWeekSessions} last week</div>
          </div>
        </div>
      </div>
      
      {/* Summary Message */}
      <div className={`mt-4 p-3 rounded-lg text-xs ${
        stats.isImproving 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-900'
          : 'bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 text-orange-900'
      }`}>
        {stats.isImproving 
          ? `✨ Great progress! Keep this momentum going.`
          : `⚠️ Study time decreased. Plan catch-up sessions.`
        }
      </div>
    </div>
  )
}