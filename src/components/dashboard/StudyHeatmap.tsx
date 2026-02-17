'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Zap, Info } from 'lucide-react'

// UTILS: Generate last 365 days
const getYearData = () => {
  const dates = []
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - 365)
  const startDay = startDate.getDay()
  for (let i = 0; i < startDay; i++) {
    dates.push(null)
  }
  for (let i = 0; i <= 365; i++) {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

export default function StudyHeatmap() {
  const supabase = useMemo(() => createClient(), [])
  const [data, setData] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(240) // Default 4 hours (240m)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. FETCH USER GOAL (The "Honest" Logic)
      const { data: settings } = await supabase
        .from('syllabus_settings')
        .select('daily_goal_hours')
        .eq('user_id', user.id)
        .single()
      
      if (settings?.daily_goal_hours) {
         setDailyGoalMinutes(settings.daily_goal_hours * 60)
      }

      // 2. FETCH LOGS
      const today = new Date()
      const pastDate = new Date()
      pastDate.setDate(today.getDate() - 366) 

      const { data: logs } = await supabase
        .from('focus_logs')
        .select('started_at, duration_minutes')
        .eq('user_id', user.id)
        .gte('started_at', pastDate.toISOString())

      const map: Record<string, number> = {}
      logs?.forEach(log => {
        const dateStr = log.started_at.split('T')[0]
        map[dateStr] = (map[dateStr] || 0) + log.duration_minutes
      })

      setData(map)
      setLoading(false)
    }
    fetchData()
  }, [])

  const yearGrid = useMemo(() => getYearData(), [])

  // DYNAMIC COLOR LOGIC (Based on User Goal)
  const getColor = (minutes: number) => {
    if (minutes === 0) return 'bg-stone-100'        // Empty
    
    const percentage = minutes / dailyGoalMinutes

    if (percentage < 0.25) return 'bg-amber-200'    // Warm up
    if (percentage < 0.50) return 'bg-amber-300'    // Getting there
    if (percentage < 0.75) return 'bg-amber-400'    // Solid
    if (percentage < 1.0)  return 'bg-amber-500'    // Almost
    return 'bg-amber-700'                           // GOAL HIT (Inferno)
  }

  return (
    <div className="border border-gray-200 bg-white rounded-xl p-6 shadow-soft">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Zap size={20} className="text-amber-500 fill-amber-500" />
            Consistency Grid
          </h3>
          <p className="text-xs font-semibold text-gray-400 mt-1">
            Target: {dailyGoalMinutes / 60} Hrs/Day
          </p>
        </div>

        {/* LEGEND */}
        <div className="flex items-center gap-2 text-[10px] font-semibold text-gray-400">
          <span>Less</span>
          <div className="w-3 h-3 bg-stone-100 border border-stone-200" />
          <div className="w-3 h-3 bg-amber-200 border border-gray-200/10" />
          <div className="w-3 h-3 bg-amber-400 border border-gray-200/10" />
          <div className="w-3 h-3 bg-amber-700 border border-gray-200/10" />
          <span>Goal</span>
        </div>
      </div>

      {/* THE GRID */}
      {loading ? (
        <div className="h-32 flex items-center justify-center animate-pulse text-xs font-semibold text-gray-300">
          Loading Data...
        </div>
      ) : (
        <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
          <div 
            className="grid grid-rows-7 grid-flow-col gap-1 min-w-max"
            style={{ height: '100px' }} 
          >
            {yearGrid.map((date, i) => {
              if (!date) return <div key={`spacer-${i}`} className="w-3 h-3 bg-transparent" />
              
              const minutes = data[date] || 0
              return (
                <div 
                  key={date}
                  title={`${date}: ${minutes}m Focused`}
                  className={`w-3 h-3 transition-all hover:scale-125 border border-transparent hover:border-gray-200 ${getColor(minutes)}`}
                />
              )
            })}
          </div>
        </div>
      )}
      
      <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-gray-400">
        <div className="flex gap-2 items-center">
            <Info size={12} />
            <span>Horizontal Axis: Time (Weeks) &rarr;</span>
        </div>
        <div>Vertical Axis: Mon - Sun</div>
      </div>
    </div>
  )
}