'use client'

import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { TrendingUp } from 'lucide-react'

type FocusLog = {
  created_at: string
  duration_minutes: number
}

type ProductivityChartProps = {
  logs: FocusLog[]
}

export default function ProductivityChart({ logs }: ProductivityChartProps) {
  const chartData = useMemo(() => {
    // Get last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    // Create map of date -> minutes
    const dateMap: Record<string, number> = {}
    
    logs.forEach(log => {
      const date = new Date(log.created_at)
      if (date >= thirtyDaysAgo) {
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        dateMap[dateStr] = (dateMap[dateStr] || 0) + log.duration_minutes
      }
    })
    
    // Convert to array with hours
    return Object.entries(dateMap).map(([date, minutes]) => ({
      date,
      hours: Number((minutes / 60).toFixed(1))
    })).slice(-14) // Show last 14 days for readability
  }, [logs])
  
  if (chartData.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
        No data for last 30 days
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
          <TrendingUp className="text-white" size={20} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Productivity Trend</h3>
          <p className="text-xs text-gray-500">Focus hours over last 14 days</p>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="productivityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
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
            formatter={(value: any) => [`${value}h`, 'Focus Time']}
          />
          <Area 
            type="monotone" 
            dataKey="hours" 
            stroke="#3b82f6" 
            strokeWidth={2}
            fill="url(#productivityGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}