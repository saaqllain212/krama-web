'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Flame, Target, Zap, Clock, AlertTriangle, Loader2, Brain } from 'lucide-react'

// --- TYPES ---
type FocusLog = {
  id: string
  created_at: string
  duration_minutes: number
  topic: string
}

export default function FocusInsightsPage() {
  const supabase = createClient()
  
  const [logs, setLogs] = useState<FocusLog[]>([])
  const [dailyGoal, setDailyGoal] = useState(8) // Default 8 hours
  const [loading, setLoading] = useState(true)

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Parallel Fetch
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

  // --- 2. ANALYTICS ENGINE (Memoized for Performance) ---
  const stats = useMemo(() => {
    if (logs.length === 0) return null

    // A. TARGET vs REALITY (Today)
    const today = new Date().toDateString()
    const todayLogs = logs.filter(l => new Date(l.created_at).toDateString() === today)
    const minutesToday = todayLogs.reduce((sum, l) => sum + l.duration_minutes, 0)
    const goalMinutes = dailyGoal * 60
    const progressPct = Math.min((minutesToday / goalMinutes) * 100, 100)

    // B. DISTRACTION RADAR (Topics)
    const topicMap: Record<string, number> = {}
    logs.forEach(l => {
      const t = l.topic.toUpperCase().trim() || 'UNKNOWN'
      topicMap[t] = (topicMap[t] || 0) + l.duration_minutes
    })
    const sortedTopics = Object.entries(topicMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5) // Top 5 only
    const totalMinutesAllTime = logs.reduce((sum, l) => sum + l.duration_minutes, 0)

    // C. GOLDEN HOUR (0-23h buckets)
    const hourBuckets = new Array(24).fill(0)
    logs.forEach(l => {
      const hour = new Date(l.created_at).getHours()
      hourBuckets[hour] += l.duration_minutes
    })
    const maxHourVal = Math.max(...hourBuckets)

    // D. DEEP WORK RATIO
    const avgSession = Math.round(totalMinutesAllTime / logs.length)
    const deepWorkBadge = avgSession > 50 ? 'MONK' : avgSession > 25 ? 'STUDENT' : 'GOLDFISH'

    // E. CONSISTENCY STREAK
    // Create a Set of "YYYY-MM-DD" strings present in logs
    const activeDays = new Set(logs.map(l => new Date(l.created_at).toDateString()))
    let streak = 0
    let checkDate = new Date()
    
    // Check Today (if verified) or Yesterday to start
    // We allow "Today" to be missing if the user hasn't started YET, checking yesterday extends streak
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


  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FBF9F6]"><Loader2 className="animate-spin"/></div>

  if (!stats) return (
    <div className="min-h-screen bg-[#FBF9F6] p-8 flex flex-col items-center justify-center text-center">
       <Brain size={48} className="text-black/20 mb-4" />
       <h1 className="text-2xl font-black uppercase mb-2">No Intel Available</h1>
       <p className="text-black/50 mb-6">Complete your first Focus Session to generate insights.</p>
       <Link href="/dashboard/focus" className="bg-black text-white px-6 py-3 font-bold uppercase">Initialize Protocol</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FBF9F6] p-6 md:p-12 text-black font-sans">
      
      {/* HEADER */}
      <div className="max-w-5xl mx-auto mb-8 flex justify-between items-center">
         <div>
            <Link href="/dashboard" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black mb-4">
              <ArrowLeft size={14} /> Dashboard
            </Link>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase flex items-center gap-3">
               <Zap className="fill-amber-500 text-amber-500" /> Neural Link
            </h1>
         </div>
         <div className="text-right hidden md:block">
            <div className="text-xs font-bold uppercase text-black/40">Total Hours Logged</div>
            <div className="text-3xl font-black">{(stats.totalMinutesAllTime / 60).toFixed(1)} <span className="text-sm text-black/40">HRS</span></div>
         </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         
         {/* 1. STREAK CARD */}
         <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_#000]">
            <div className="flex justify-between items-start mb-4">
               <h2 className="text-sm font-black uppercase tracking-widest text-black/40">Consistency Chain</h2>
               <Flame className={`fill-orange-500 ${stats.streak > 0 ? 'text-orange-500' : 'text-gray-300'}`} />
            </div>
            <div className="text-6xl font-black tabular-nums">{stats.streak}</div>
            <div className="text-xs font-bold uppercase text-black/40 mt-1">Days Unbroken</div>
         </div>

         {/* 2. DEEP WORK RATIO */}
         <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_#000]">
            <div className="flex justify-between items-start mb-4">
               <h2 className="text-sm font-black uppercase tracking-widest text-black/40">Avg Session Quality</h2>
               <Brain className="text-black" />
            </div>
            <div className="text-6xl font-black tabular-nums">{stats.avgSession}<span className="text-lg align-top text-black/40">m</span></div>
            <div className="flex items-center gap-2 mt-2">
               <span className={`text-[10px] font-black uppercase px-2 py-1 text-white 
                  ${stats.deepWorkBadge === 'MONK' ? 'bg-purple-600' : stats.deepWorkBadge === 'STUDENT' ? 'bg-blue-600' : 'bg-red-500'}`}>
                  {stats.deepWorkBadge} CLASS
               </span>
            </div>
         </div>

         {/* 3. DAILY CONTRACT */}
         <div className="md:col-span-2 lg:col-span-1 bg-black text-white p-6 shadow-[8px_8px_0_0_#ccff00]">
            <div className="flex justify-between items-start mb-6">
               <h2 className="text-sm font-black uppercase tracking-widest text-white/50">Daily Contract</h2>
               <Target className="text-[#ccff00]" />
            </div>
            
            <div className="mb-2 flex justify-between items-end">
               <span className="text-4xl font-black">
                  {Math.floor(stats.minutesToday / 60)}<span className="text-lg text-white/50">h</span> {stats.minutesToday % 60}<span className="text-lg text-white/50">m</span>
               </span>
               <span className="text-sm font-bold text-[#ccff00] mb-1">GOAL: {dailyGoal}h</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden">
               <div 
                 className={`h-full ${stats.progressPct >= 100 ? 'bg-[#ccff00]' : 'bg-red-500'} transition-all duration-500`} 
                 style={{ width: `${stats.progressPct}%` }}
               />
            </div>
            <div className="mt-2 text-[10px] font-bold uppercase text-white/40 text-center">
               {stats.progressPct >= 100 ? 'Contract Fulfilled' : 'Breach of Contract'}
            </div>
         </div>

         {/* 4. GOLDEN HOUR GRAPH (Full Width on Mobile) */}
         <div className="md:col-span-2 bg-white border-2 border-black p-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-black/40 mb-6 flex items-center gap-2">
               <Clock size={16} /> Bio-Rhythm (Golden Hour)
            </h2>
            <div className="flex items-end gap-1 h-32 w-full">
               {stats.hourBuckets.map((val, h) => {
                 const heightPct = stats.maxHourVal > 0 ? (val / stats.maxHourVal) * 100 : 0
                 return (
                   <div key={h} className="group relative flex-1 bg-stone-100 hover:bg-amber-400 transition-colors rounded-t-sm" style={{ height: '100%' }}>
                      <div 
                        className="absolute bottom-0 w-full bg-black transition-all group-hover:bg-amber-600"
                        style={{ height: `${heightPct}%` }}
                      ></div>
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-2 py-1 whitespace-nowrap z-10">
                         {h}:00 ({val}m)
                      </div>
                   </div>
                 )
               })}
            </div>
            <div className="flex justify-between text-[10px] font-bold text-black/30 mt-2 uppercase">
               <span>12 AM</span>
               <span>6 AM</span>
               <span>12 PM</span>
               <span>6 PM</span>
               <span>11 PM</span>
            </div>
         </div>

         {/* 5. DISTRACTION RADAR */}
         <div className="bg-white border-2 border-black p-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-black/40 mb-6 flex items-center gap-2">
               <AlertTriangle size={16} /> Topic breakdown
            </h2>
            <div className="space-y-4">
               {stats.sortedTopics.map(([topic, mins], i) => {
                  const pct = Math.round((mins / stats.totalMinutesAllTime) * 100)
                  return (
                     <div key={topic} className="group">
                        <div className="flex justify-between text-xs font-bold uppercase mb-1">
                           <span>{i+1}. {topic}</span>
                           <span>{pct}%</span>
                        </div>
                        <div className="w-full h-2 bg-stone-100">
                           <div 
                              className="h-full bg-black group-hover:bg-amber-500 transition-colors"
                              style={{ width: `${pct}%` }}
                           />
                        </div>
                     </div>
                  )
               })}
            </div>
         </div>

      </div>
    </div>
  )
}