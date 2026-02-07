'use client'

import { useMemo } from 'react'
import { Sun, TrendingUp } from 'lucide-react'

type MockLogEntry = {
  d: string
  s: number
  m: number
}

type BestDaysCardProps = {
  logs: MockLogEntry[]
}

export default function BestDaysCard({ logs }: BestDaysCardProps) {
  const dayStats = useMemo(() => {
    if (logs.length < 5) return null
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayMap: Record<string, { total: number; count: number; scores: number[] }> = {}
    
    logs.forEach(log => {
      const date = new Date(log.d)
      const dayName = dayNames[date.getDay()]
      const score = Math.round((log.s / log.m) * 100)
      
      if (!dayMap[dayName]) {
        dayMap[dayName] = { total: 0, count: 0, scores: [] }
      }
      
      dayMap[dayName].total += score
      dayMap[dayName].count += 1
      dayMap[dayName].scores.push(score)
    })
    
    const dayAverages = Object.entries(dayMap)
      .map(([day, data]) => ({
        day,
        avg: Math.round(data.total / data.count),
        count: data.count
      }))
      .filter(d => d.count >= 2) // Only days with 2+ tests
      .sort((a, b) => b.avg - a.avg)
    
    if (dayAverages.length === 0) return null
    
    const best = dayAverages[0]
    const worst = dayAverages[dayAverages.length - 1]
    const difference = best.avg - worst.avg
    
    return {
      best,
      worst,
      difference,
      all: dayAverages
    }
  }, [logs])
  
  if (!dayStats) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="h-[200px] flex items-center justify-center text-sm text-gray-400">
          Need 5+ tests on different days
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
          <Sun className="text-white" size={20} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Best Days Analysis</h3>
          <p className="text-xs text-gray-500">Performance by day of week</p>
        </div>
      </div>
      
      {/* Best vs Worst */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <div className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Best Day</div>
          <div className="text-2xl font-bold text-green-700">{dayStats.best.day}</div>
          <div className="text-sm text-gray-600 mt-1">{dayStats.best.avg}% avg ({dayStats.best.count} tests)</div>
        </div>
        
        <div className="p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-200">
          <div className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Worst Day</div>
          <div className="text-2xl font-bold text-red-700">{dayStats.worst.day}</div>
          <div className="text-sm text-gray-600 mt-1">{dayStats.worst.avg}% avg ({dayStats.worst.count} tests)</div>
        </div>
      </div>
      
      {/* All Days Bars */}
      <div className="space-y-2">
        {dayStats.all.map((day, i) => {
          const isMax = day.avg === dayStats.best.avg
          return (
            <div key={day.day}>
              <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                <span>{day.day}</span>
                <span>{day.avg}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${isMax ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-blue-500 to-cyan-600'} transition-all`}
                  style={{ width: `${day.avg}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Insight */}
      {dayStats.difference >= 10 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
          <p className="text-xs text-gray-700">
            <span className="font-bold text-amber-700">💡 Insight:</span> You score {dayStats.difference}% higher on {dayStats.best.day}s. 
            Schedule important tests on this day!
          </p>
        </div>
      )}
    </div>
  )
}