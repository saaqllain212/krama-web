'use client'

import { useMemo } from 'react'
import { Target, Clock } from 'lucide-react'

type FocusLog = {
  id: string
  duration_minutes: number
  target_minutes: number
}

type OptimalSessionCardProps = {
  logs: FocusLog[]
}

export default function OptimalSessionCard({ logs }: OptimalSessionCardProps) {
  const optimal = useMemo(() => {
    if (logs.length < 5) return null
    
    const buckets: Record<number, { total: number; completed: number }> = {}
    
    logs.forEach(log => {
      const bucket = Math.floor(log.duration_minutes / 15) * 15
      if (!buckets[bucket]) buckets[bucket] = { total: 0, completed: 0 }
      buckets[bucket].total++
      if (log.duration_minutes >= log.target_minutes) buckets[bucket].completed++
    })
    
    const qualified = Object.entries(buckets)
      .filter(([_, data]) => data.total >= 3)
      .map(([len, data]) => ({
        length: parseInt(len),
        rate: (data.completed / data.total) * 100,
        count: data.total
      }))
      .sort((a, b) => b.rate - a.rate)
    
    if (qualified.length === 0) return null
    
    const best = qualified[0]
    
    return {
      optimalLength: best.length,
      completionRate: Math.round(best.rate),
      sampleSize: best.count
    }
  }, [logs])
  
  if (!optimal) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="h-[200px] flex items-center justify-center text-sm text-gray-400">
          Need 5+ sessions to analyze
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
          <h3 className="font-bold text-gray-900">Optimal Session Length</h3>
          <p className="text-xs text-gray-500">Your sweet spot for focus</p>
        </div>
      </div>
      
      <div className="text-center mb-6">
        <div className="inline-flex items-baseline gap-2 mb-3">
          <Clock size={32} className="text-green-600" />
          <div className="text-6xl font-black bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            {optimal.optimalLength}
          </div>
          <div className="text-2xl font-bold text-gray-400">min</div>
        </div>
        <p className="text-sm text-gray-600">{optimal.completionRate}% completion rate</p>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-xs font-semibold text-gray-600 mb-2">
          <span>Success Rate</span>
          <span>{optimal.completionRate}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-teal-600"
            style={{ width: `${optimal.completionRate}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">Based on {optimal.sampleSize} sessions</p>
      </div>
      
      <div className="p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-200">
        <p className="text-xs text-gray-700">
          <span className="font-bold text-green-700">💡 Tip:</span> Schedule {optimal.optimalLength}-min sessions for best results!
        </p>
      </div>
    </div>
  )
}