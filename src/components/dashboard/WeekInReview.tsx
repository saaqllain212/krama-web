'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Flame, Clock, Brain, X, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type WeekStats = {
  totalMinutes: number
  sessions: number
  reviews: number
  bestDay: string
  bestDayMinutes: number
  avgMinutes: number
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function WeekInReview() {
  const supabase = useMemo(() => createClient(), [])
  const [stats, setStats] = useState<WeekStats | null>(null)
  const [dismissed, setDismissed] = useState(false)

  const today = new Date()
  const dayOfWeek = today.getDay() // 0=Sun, 1=Mon

  useEffect(() => {
    // Show only on Monday and Tuesday (give 2 days to see it)
    if (dayOfWeek > 2) return

    // Check if already dismissed this week
    const weekKey = `krama_wir_${today.getFullYear()}_${getWeekNumber(today)}`
    if (localStorage.getItem(weekKey) === 'dismissed') return

    const fetchLastWeek = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Calculate last week's date range (Mon-Sun)
      const lastMonday = new Date(today)
      lastMonday.setDate(today.getDate() - today.getDay() - 6) // Last Monday
      lastMonday.setHours(0, 0, 0, 0)
      
      const lastSunday = new Date(lastMonday)
      lastSunday.setDate(lastMonday.getDate() + 6)
      lastSunday.setHours(23, 59, 59, 999)

      const [focusRes, reviewRes] = await Promise.all([
        supabase
          .from('focus_logs')
          .select('duration_minutes, created_at')
          .eq('user_id', user.id)
          .gte('created_at', lastMonday.toISOString())
          .lte('created_at', lastSunday.toISOString()),
        supabase
          .from('review_topics')
          .select('id')
          .eq('user_id', user.id)
          .gte('last_reviewed', lastMonday.toISOString())
          .lte('last_reviewed', lastSunday.toISOString()),
      ])

      const logs = focusRes.data || []
      if (logs.length === 0) return // Nothing to show

      const totalMinutes = logs.reduce((sum: number, l: any) => sum + (l.duration_minutes || 0), 0)

      // Find best day
      const dayTotals: Record<number, number> = {}
      logs.forEach((l: any) => {
        const d = new Date(l.created_at).getDay()
        dayTotals[d] = (dayTotals[d] || 0) + (l.duration_minutes || 0)
      })
      
      let bestDay = 0
      let bestDayMin = 0
      Object.entries(dayTotals).forEach(([day, min]) => {
        if (min > bestDayMin) {
          bestDay = Number(day)
          bestDayMin = min
        }
      })

      setStats({
        totalMinutes,
        sessions: logs.length,
        reviews: reviewRes.data?.length || 0,
        bestDay: DAY_NAMES[bestDay],
        bestDayMinutes: bestDayMin,
        avgMinutes: Math.round(totalMinutes / 7),
      })
    }

    fetchLastWeek()
  }, [supabase, dayOfWeek])

  const handleDismiss = () => {
    setDismissed(true)
    const weekKey = `krama_wir_${today.getFullYear()}_${getWeekNumber(today)}`
    localStorage.setItem(weekKey, 'dismissed')
  }

  if (!stats || dismissed || dayOfWeek > 2) return null

  const hours = Math.floor(stats.totalMinutes / 60)
  const mins = stats.totalMinutes % 60

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="card bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 relative"
      >
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Calendar size={18} className="text-indigo-500" />
          <h3 className="font-bold text-gray-900">Last Week in Review</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock size={14} className="text-indigo-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {hours}h {mins > 0 ? `${mins}m` : ''}
            </div>
            <div className="text-[11px] text-gray-500">Total Study</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame size={14} className="text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.sessions}</div>
            <div className="text-[11px] text-gray-500">Sessions</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Brain size={14} className="text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.reviews}</div>
            <div className="text-[11px] text-gray-500">Reviews</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp size={14} className="text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.bestDay}</div>
            <div className="text-[11px] text-gray-500">Best Day ({Math.floor(stats.bestDayMinutes / 60)}h)</div>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-500 text-center">
          Daily average: {Math.floor(stats.avgMinutes / 60)}h {stats.avgMinutes % 60}m · Fresh start this week 💪
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// ISO week number helper
function getWeekNumber(d: Date): number {
  const date = new Date(d.getTime())
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7))
  const week1 = new Date(date.getFullYear(), 0, 4)
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
}
