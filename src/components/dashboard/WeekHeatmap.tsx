'use client'

import { useEffect, useState } from 'react'

interface WeekHeatmapProps {
  weekData: number[] // Array of 7 numbers (minutes per day)
  goalMinutes?: number
}

export default function WeekHeatmap({ weekData, goalMinutes = 360 }: WeekHeatmapProps) {
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const today = new Date().getDay()
  const adjustedToday = today === 0 ? 6 : today - 1

  // Animate bars on mount
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(timer)
  }, [])

  // Calculate max for relative bar heights
  const maxMinutes = Math.max(...weekData, goalMinutes)

  const getBarColor = (minutes: number) => {
    if (minutes === 0) return 'bg-gray-200'
    const pct = (minutes / goalMinutes) * 100
    if (pct >= 100) return 'bg-gradient-to-t from-success-500 to-success-400'
    if (pct >= 75) return 'bg-gradient-to-t from-success-400 to-success-300'
    if (pct >= 50) return 'bg-gradient-to-t from-primary-400 to-primary-300'
    if (pct >= 25) return 'bg-gradient-to-t from-primary-300 to-primary-200'
    return 'bg-gradient-to-t from-primary-200 to-primary-100'
  }

  return (
    <div className="flex items-end justify-between gap-2 h-20">
      {weekData.map((minutes, index) => {
        const isToday = index === adjustedToday
        const isFuture = index > adjustedToday
        const heightPct = maxMinutes > 0 ? Math.max(minutes === 0 ? 0 : 8, (minutes / maxMinutes) * 100) : 0
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        
        return (
          <div key={index} className="flex flex-col items-center gap-1.5 flex-1 group relative">
            {/* Bar */}
            <div className="w-full flex items-end justify-center" style={{ height: '56px' }}>
              <div 
                className={`w-full max-w-[28px] rounded-t-md transition-all duration-700 ease-out ${
                  isFuture 
                    ? 'bg-gray-100 border border-dashed border-gray-300' 
                    : minutes === 0 
                      ? 'bg-gray-200' 
                      : getBarColor(minutes)
                } ${isToday && minutes > 0 ? 'ring-2 ring-primary-400 ring-offset-1' : ''}`}
                style={{ 
                  height: mounted 
                    ? isFuture ? '100%' : `${heightPct}%`
                    : '0%',
                  minHeight: isFuture ? '100%' : minutes > 0 ? '6px' : '4px',
                  transitionDelay: `${index * 60}ms`,
                }}
              />
            </div>
            
            {/* Day label */}
            <span className={`text-[10px] font-semibold ${
              isToday 
                ? 'text-primary-600' 
                : isFuture 
                  ? 'text-gray-300' 
                  : 'text-gray-500'
            }`}>
              {dayLabels[index]}
            </span>

            {/* Tooltip */}
            {!isFuture && (
              <div className="absolute bottom-full mb-1 hidden group-hover:block z-10 pointer-events-none">
                <div className="bg-gray-900 text-white text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
                  {minutes === 0 ? 'No study' : `${hours > 0 ? `${hours}h ` : ''}${mins}m`}
                  {minutes >= goalMinutes && ' ✓'}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}