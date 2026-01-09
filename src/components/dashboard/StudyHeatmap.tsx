'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Zap, Info } from 'lucide-react'

// UTILS: Generate last 365 days
const getYearData = () => {
  const dates = []
  const today = new Date()
  
  // 1. Calculate Start Date (365 days ago)
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - 365)
  
  // 2. Calculate Offset (If start date is Wed, we need 3 empty slots for Sun/Mon/Tue)
  const startDay = startDate.getDay() // 0 = Sunday, 1 = Monday...
  
  // 3. Generate the array
  // Add spacers first
  for (let i = 0; i < startDay; i++) {
    dates.push(null)
  }
  
  // Add real dates
  for (let i = 0; i <= 365; i++) {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)
    dates.push(d.toISOString().split('T')[0])
  }
  
  return dates
}

export default function StudyHeatmap() {
  const supabase = createClient()
  const [data, setData] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

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

  // COLOR LOGIC: "Fire Theme" (Amber Gradient)
  const getColor = (minutes: number) => {
    if (minutes === 0) return 'bg-stone-100'        // Empty
    if (minutes < 30) return 'bg-amber-200'         // Warm
    if (minutes < 60) return 'bg-amber-400'         // Hot
    if (minutes < 120) return 'bg-amber-600'        // Burning
    return 'bg-amber-800'                           // Inferno (2h+)
  }

  return (
    <div className="border-2 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
            <Zap size={20} className="text-amber-500 fill-amber-500" />
            Consistency Grid
          </h3>
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-1">
            365-Day Performance Architecture
          </p>
        </div>

        {/* LEGEND (Updated to Fire Colors) */}
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-stone-400">
          <span>Less</span>
          <div className="w-3 h-3 bg-stone-100 border border-stone-200" />
          <div className="w-3 h-3 bg-amber-200 border border-black/10" />
          <div className="w-3 h-3 bg-amber-400 border border-black/10" />
          <div className="w-3 h-3 bg-amber-800 border border-black/10" />
          <span>More</span>
        </div>
      </div>

      {/* THE GRID (GitHub Style) */}
      {loading ? (
        <div className="h-32 flex items-center justify-center animate-pulse text-xs font-bold uppercase text-stone-300">
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
                  // Using 'hover:border-black' adds a crisp interaction without changing size
                  className={`w-3 h-3 transition-all hover:scale-125 border border-transparent hover:border-black ${getColor(minutes)}`}
                />
              )
            })}
          </div>
        </div>
      )}
      
      {/* FOOTER */}
      <div className="mt-2 flex items-center justify-between text-[10px] font-bold uppercase text-stone-400">
        <div className="flex gap-2 items-center">
            <Info size={12} />
            <span>Horizontal Axis: Time (Weeks) &rarr;</span>
        </div>
        <div>Vertical Axis: Mon - Sun</div>
      </div>
    </div>
  )
}