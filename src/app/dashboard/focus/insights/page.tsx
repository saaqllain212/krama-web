'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Flame, Target, Zap, Clock, Loader2, Brain, Sparkles, TrendingUp } from 'lucide-react'
import StudyHeatmap from '@/components/dashboard/StudyHeatmap'
import OptimalSessionCard from '@/components/focus-insights/OptimalSessionCard'

type FocusLog = {
  id: string
  created_at: string
  duration_minutes: number
  target_minutes: number
  topic: string
}

export default function FocusInsightsPage() {
  const supabase = createClient()
  
  const [logs, setLogs] = useState<FocusLog[]>([])
  const [dailyGoal, setDailyGoal] = useState(8)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [logsRes, settingsRes] = await Promise.all([
        supabase.from('focus_logs').select('*').order('created_at', { ascending: false }),
        supabase.from('syllabus_settings').select('daily_goal_hours').eq('user_id', user.id).single()
      ])

      if (logsRes.data) setLogs(logsRes.data)
      if (settingsRes.data) setDailyGoal(settingsRes.data.daily_goal_hours)
      
      setLoading(false)
    }
    fetchData()
  }, [])

  const stats = useMemo(() => {
    if (logs.length === 0) return null

    const today = new Date().toDateString()
    const todayLogs = logs.filter(l => new Date(l.created_at).toDateString() === today)
    const minutesToday = todayLogs.reduce((sum, l) => sum + l.duration_minutes, 0)
    const goalMinutes = dailyGoal * 60
    const progressPct = Math.min((minutesToday / goalMinutes) * 100, 100)

    const topicMap: Record<string, number> = {}
    logs.forEach(l => {
      const t = l.topic.toUpperCase().trim() || 'UNKNOWN'
      topicMap[t] = (topicMap[t] || 0) + l.duration_minutes
    })
    const sortedTopics = Object.entries(topicMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
    const totalMinutesAllTime = logs.reduce((sum, l) => sum + l.duration_minutes, 0)

    const hourBuckets = new Array(24).fill(0)
    logs.forEach(l => {
      const hour = new Date(l.created_at).getHours()
      hourBuckets[hour] += l.duration_minutes
    })
    const maxHourVal = Math.max(...hourBuckets)

    const avgSession = Math.round(totalMinutesAllTime / logs.length)
    const deepWorkBadge = avgSession > 50 ? 'MONK' : avgSession > 25 ? 'STUDENT' : 'GOLDFISH'

    const activeDays = new Set(logs.map(l => new Date(l.created_at).toDateString()))
    let streak = 0
    let checkDate = new Date()
    
    if (!activeDays.has(checkDate.toDateString())) {
       checkDate.setDate(checkDate.getDate() - 1)
    }
    
    while (activeDays.has(checkDate.toDateString())) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    }

    return {
      minutesToday,
      goalMinutes,
      progressPct,
      sortedTopics,
      totalMinutesAllTime,
      hourBuckets,
      maxHourVal,
      avgSession,
      deepWorkBadge,
      streak
    }
  }, [logs, dailyGoal])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center text-center">
        <Brain size={48} className="text-gray-300 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">No Data Yet</h1>
        <p className="text-gray-500 mb-6">Complete your first Focus Session to generate insights.</p>
        <Link 
          href="/dashboard/focus" 
          className="px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-shadow"
        >
          Start Focus Session
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-10">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <Sparkles className="text-white" size={24} />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">
                Focus Analytics
              </h1>
            </div>
            <p className="text-gray-500">Deep work patterns and optimization</p>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-500 mb-1">Total Hours Logged</div>
            <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {(stats.totalMinutesAllTime / 60).toFixed(1)}h
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
         
        {/* TOP ROW - Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Streak Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-1">Consistency Streak</h2>
                <p className="text-xs text-gray-500">Days of unbroken study</p>
              </div>
              <Flame className={`${stats.streak > 0 ? 'fill-orange-500 text-orange-500' : 'fill-gray-300 text-gray-300'}`} size={24} />
            </div>
            <div className="text-6xl font-bold text-gray-900 mb-1">{stats.streak}</div>
            <div className="text-sm text-gray-600">consecutive days</div>
          </div>

          {/* Deep Work Badge */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-1">Avg Session Quality</h2>
                <p className="text-xs text-gray-500">Focus duration per session</p>
              </div>
              <Brain className="text-gray-700" size={24} />
            </div>
            <div className="text-6xl font-bold text-gray-900 mb-2">{stats.avgSession}<span className="text-2xl text-gray-400">m</span></div>
            <div className={`inline-block text-xs font-bold uppercase px-3 py-1 rounded-full text-white ${
              stats.deepWorkBadge === 'MONK' ? 'bg-gradient-to-r from-purple-500 to-pink-600' : 
              stats.deepWorkBadge === 'STUDENT' ? 'bg-gradient-to-r from-blue-500 to-cyan-600' : 
              'bg-gradient-to-r from-red-500 to-rose-600'
            }`}>
              {stats.deepWorkBadge}
            </div>
          </div>

          {/* Daily Contract */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-lg text-white">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-1">Daily Contract</h2>
                <p className="text-xs text-gray-500">Today's progress</p>
              </div>
              <Target className="text-primary-400" size={24} />
            </div>
            
            <div className="mb-3 flex justify-between items-end">
              <span className="text-4xl font-bold">
                {Math.floor(stats.minutesToday / 60)}<span className="text-lg text-gray-400">h</span> {stats.minutesToday % 60}<span className="text-lg text-gray-400">m</span>
              </span>
              <span className="text-sm font-bold text-primary-400 mb-1">Goal: {dailyGoal}h</span>
            </div>

            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${stats.progressPct >= 100 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}
                style={{ width: `${stats.progressPct}%` }}
              />
            </div>
            <div className="mt-2 text-xs font-bold text-gray-400 text-center">
              {stats.progressPct >= 100 ? '✓ Contract Fulfilled' : 'Incomplete'}
            </div>
          </div>
        </div>

        {/* OPTIMAL SESSION LENGTH */}
        <OptimalSessionCard logs={logs} />

        {/* BIO-RHYTHM CHART */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
              <Clock size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Peak Hours</h2>
              <p className="text-xs text-gray-500">When you're most productive</p>
            </div>
          </div>
          
          <div className="flex items-end gap-1 h-32 w-full">
            {stats.hourBuckets.map((val, h) => {
              const heightPct = stats.maxHourVal > 0 ? (val / stats.maxHourVal) * 100 : 0
              return (
                <div key={h} className="group relative flex-1 bg-gray-100 hover:bg-amber-100 transition-colors rounded-t" style={{ height: '100%' }}>
                  <div 
                    className="absolute bottom-0 w-full bg-gradient-to-t from-amber-600 to-orange-500 transition-all group-hover:from-amber-500 group-hover:to-orange-400"
                    style={{ height: `${heightPct}%` }}
                  ></div>
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded whitespace-nowrap z-10">
                    {h}:00 ({val}m)
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between text-xs font-bold text-gray-400 mt-3 uppercase">
            <span>12 AM</span>
            <span>6 AM</span>
            <span>12 PM</span>
            <span>6 PM</span>
            <span>11 PM</span>
          </div>
        </div>

        {/* TOPIC DISTRIBUTION */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Topic Distribution</h2>
              <p className="text-xs text-gray-500">Top 5 focus areas</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {stats.sortedTopics.map(([topic, mins], i) => {
              const pct = Math.round((mins / stats.totalMinutesAllTime) * 100)
              const colors = [
                'from-blue-500 to-cyan-600',
                'from-purple-500 to-pink-600',
                'from-green-500 to-emerald-600',
                'from-amber-500 to-orange-600',
                'from-red-500 to-rose-600'
              ]
              return (
                <div key={topic}>
                  <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                    <span>#{i+1} {topic}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${colors[i]} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* FULL YEAR HEATMAP */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 text-xl mb-4">Study Calendar</h3>
          <StudyHeatmap />
        </div>
      </div>
    </div>
  )
}