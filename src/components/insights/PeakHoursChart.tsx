'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Clock } from 'lucide-react'

type FocusLog = {
  created_at: string
  duration_minutes: number
}

type PeakHoursChartProps = {
  logs: FocusLog[]
}

export default function PeakHoursChart({ logs }: PeakHoursChartProps) {
  const chartData = useMemo(() => {
    // Create 24-hour buckets
    const hourBuckets = new Array(24).fill(0).map((_, i) => ({
      hour: i,
      label: `${i}:00`,
      minutes: 0
    }))
    
    logs.forEach(log => {
      const hour = new Date(log.created_at).getHours()
      hourBuckets[hour].minutes += log.duration_minutes
    })
    
    // Filter to only hours with data, group into broader slots
    const slots = [
      { label: '6-9 AM', hours: [6, 7, 8, 9], color: '#f59e0b' },
      { label: '9-12 PM', hours: [9, 10, 11, 12], color: '#3b82f6' },
      { label: '12-3 PM', hours: [12, 13, 14, 15], color: '#8b5cf6' },
      { label: '3-6 PM', hours: [15, 16, 17, 18], color: '#ec4899' },
      { label: '6-9 PM', hours: [18, 19, 20, 21], color: '#10b981' },
      { label: '9-12 AM', hours: [21, 22, 23, 0], color: '#6366f1' },
    ]
    
    const slotData = slots.map(slot => {
      const totalMinutes = slot.hours.reduce((sum, h) => sum + hourBuckets[h].minutes, 0)
      return {
        label: slot.label,
        hours: Number((totalMinutes / 60).toFixed(1)),
        color: slot.color
      }
    }).filter(slot => slot.hours > 0) // Only show slots with data
    
    return slotData
  }, [logs])
  
  if (chartData.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
        No hourly data available
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
          <Clock className="text-white" size={20} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Peak Hours</h3>
          <p className="text-xs text-gray-500">When you study most</p>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <XAxis 
            dataKey="label" 
            stroke="#9ca3af"
            fontSize={11}
            tickLine={false}
          />
          <YAxis 
            stroke="#9ca3af"
            fontSize={11}
            tickLine={false}
            label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#9ca3af' } }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: 'none', 
              borderRadius: '8px',
              fontSize: '12px',
              color: '#fff'
            }}
            // FIX: Use 'any' type for value
            formatter={(value: any) => [`${value}h`, 'Study Time']}
          />
          <Bar dataKey="hours" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* Peak Time Indicator */}
      {chartData.length > 0 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
          <p className="text-xs text-gray-700">
            <span className="font-bold text-amber-700">Peak productivity:</span> {chartData[0].label} with {chartData[0].hours}h total
          </p>
        </div>
      )}
    </div>
  )
}