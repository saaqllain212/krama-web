'use client'

import CircularProgress from './CircularProgress'
import WeekHeatmap from './WeekHeatmap'
import AnimatedNumber from '@/components/ui/AnimatedNumber'
import { Target, TrendingUp } from 'lucide-react'

interface TodayProgressCardProps {
  focusMinutes: number
  dailyGoalMinutes: number
  weekData: number[]
  streak: number
}

export default function TodayProgressCard({ 
  focusMinutes, 
  dailyGoalMinutes, 
  weekData,
  streak 
}: TodayProgressCardProps) {
  const progressPercent = Math.min(Math.round((focusMinutes / dailyGoalMinutes) * 100), 100)
  const hoursLogged = Math.floor(focusMinutes / 60)
  const minutesLogged = focusMinutes % 60
  const goalHours = Math.floor(dailyGoalMinutes / 60)

  return (
    <div className="card bg-gradient-to-br from-primary-50 to-purple-50 border-2 border-primary-200">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-gray-600 text-sm font-semibold mb-2">
            <Target size={16} />
            Today's Progress
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900">
              <AnimatedNumber value={hoursLogged} duration={800} />
              <span className="text-lg sm:text-2xl md:text-3xl text-gray-500 font-semibold">h</span>
              {minutesLogged > 0 && (
                <> <AnimatedNumber value={minutesLogged} duration={900} /><span className="text-lg sm:text-2xl md:text-3xl text-gray-500 font-semibold">m</span></>
              )}
            </span>
            <span className="text-lg font-medium text-gray-500">/ {goalHours}h goal</span>
          </div>
        </div>
        
        {/* Circular Progress */}
        <CircularProgress 
          percentage={progressPercent}
          size={80}
          strokeWidth={8}
          color="#5B8FF9"
        />
      </div>

      {/* Week Heatmap */}
      <div className="pt-6 border-t border-primary-200">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-700">This Week</p>
          {streak > 0 && (
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-success-200">
              <TrendingUp size={14} className="text-success-600" />
              <span className="text-sm font-bold text-success-700">
                <AnimatedNumber value={streak} duration={600} /> day streak
              </span>
            </div>
          )}
        </div>
        <WeekHeatmap weekData={weekData} goalMinutes={dailyGoalMinutes} />
      </div>
    </div>
  )
}