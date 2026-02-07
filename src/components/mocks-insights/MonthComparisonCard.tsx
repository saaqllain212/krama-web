'use client'

import { useMemo } from 'react'
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react'

type MockLogEntry = {
  d: string
  s: number
  m: number
}

type MonthComparisonCardProps = {
  logs: MockLogEntry[]
}

export default function MonthComparisonCard({ logs }: MonthComparisonCardProps) {
  const stats = useMemo(() => {
    if (logs.length === 0) return null
    
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(thisMonthStart.getTime() - 1)
    
    // This month
    const thisMonthLogs = logs.filter(l => new Date(l.d) >= thisMonthStart)
    const thisMonthScores = thisMonthLogs.map(l => Math.round((l.s / l.m) * 100))
    const thisMonthAvg = thisMonthScores.length > 0
      ? Math.round(thisMonthScores.reduce((a, b) => a + b, 0) / thisMonthScores.length)
      : 0
    const thisMonthCount = thisMonthLogs.length
    
    // Last month
    const lastMonthLogs = logs.filter(l => {
      const date = new Date(l.d)
      return date >= lastMonthStart && date <= lastMonthEnd
    })
    const lastMonthScores = lastMonthLogs.map(l => Math.round((l.s / l.m) * 100))
    const lastMonthAvg = lastMonthScores.length > 0
      ? Math.round(lastMonthScores.reduce((a, b) => a + b, 0) / lastMonthScores.length)
      : 0
    const lastMonthCount = lastMonthLogs.length
    
    // Calculate changes
    const avgChange = lastMonthAvg === 0 
      ? (thisMonthAvg > 0 ? 100 : 0)
      : Math.round(((thisMonthAvg - lastMonthAvg) / lastMonthAvg) * 100)
    
    const countChange = lastMonthCount === 0
      ? (thisMonthCount > 0 ? 100 : 0)
      : Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
    
    // Month names
    const thisMonthName = now.toLocaleString('default', { month: 'long' })
    const lastMonthName = new Date(lastMonthStart).toLocaleString('default', { month: 'long' })
    
    return {
      thisMonthAvg,
      lastMonthAvg,
      thisMonthCount,
      lastMonthCount,
      avgChange,
      countChange,
      thisMonthName,
      lastMonthName,
      isImproving: avgChange >= 0
    }
  }, [logs])
  
  if (!stats || stats.thisMonthCount === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="h-[200px] flex items-center justify-center text-sm text-gray-400">
          No tests this month yet
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
          <Calendar className="text-white" size={20} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Monthly Comparison</h3>
          <p className="text-xs text-gray-500">{stats.thisMonthName} vs {stats.lastMonthName}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Average Score Comparison */}
        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Average Score</span>
            <div className={`flex items-center gap-1 text-xs font-bold ${stats.avgChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.avgChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {Math.abs(stats.avgChange)}%
            </div>
          </div>
          <div className="flex items-end gap-3">
            <div className="text-3xl font-bold text-gray-900">{stats.thisMonthAvg}%</div>
            <div className="text-sm text-gray-500 mb-1">
              vs {stats.lastMonthAvg}% last month
            </div>
          </div>
        </div>
        
        {/* Test Count Comparison */}
        <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Tests Taken</span>
            <div className={`flex items-center gap-1 text-xs font-bold ${stats.countChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.countChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {Math.abs(stats.countChange)}%
            </div>
          </div>
          <div className="flex items-end gap-3">
            <div className="text-3xl font-bold text-gray-900">{stats.thisMonthCount}</div>
            <div className="text-sm text-gray-500 mb-1">
              vs {stats.lastMonthCount} last month
            </div>
          </div>
        </div>
      </div>
      
      {/* Summary */}
      <div className={`mt-4 p-3 rounded-lg text-xs ${
        stats.isImproving 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-900'
          : 'bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 text-orange-900'
      }`}>
        {stats.isImproving 
          ? `✨ Strong month! ${stats.avgChange > 5 ? 'Excellent improvement.' : 'Steady progress.'}`
          : `⚠️ Scores dipped. ${stats.countChange < 0 ? 'Take more tests.' : 'Review weak areas.'}`
        }
      </div>
    </div>
  )
}