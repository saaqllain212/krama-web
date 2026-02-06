'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Play, 
  Brain, 
  CheckSquare, 
  Activity, 
  Plus, 
  Crown, 
  Clock, 
  Settings,
  Target,
  Flame,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Timer
} from 'lucide-react'
import Link from 'next/link'
import { useSyllabus } from '@/context/SyllabusContext'
import MocksModal from '@/components/mocks/MocksModal'
import SettingsModal from '@/components/dashboard/SettingsModal'
import OnboardingModal from '@/components/dashboard/OnboardingModal'
import CheckoutModal from '@/components/dashboard/CheckoutModal'
import InitiationModal from '@/components/dashboard/InitiationModal'
import ProtocolManagerModal from '@/components/dashboard/ProtocolManagerModal'
import BroadcastBanner from '@/components/dashboard/BroadcastBanner'
import Countdown from '@/components/dashboard/Countdown'

// Helper: Get time-aware greeting
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// Helper: Get motivational message based on progress
const getMotivation = (progress: number, streak: number) => {
  if (progress >= 100) return "You've crushed today's goal! 🔥"
  if (progress >= 75) return "Almost there. One more push!"
  if (progress >= 50) return "Halfway through. Keep the momentum."
  if (streak >= 7) return `${streak}-day streak! Don't break it.`
  if (streak >= 3) return "Building consistency. Stay focused."
  return "Every minute counts. Let's begin."
}

export default function DashboardPage() {
  const [userName, setUserName] = useState('Student')
  const [userEmail, setUserEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [focusMinutes, setFocusMinutes] = useState(0)
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(360) // 6 hours default
  const [dueReviews, setDueReviews] = useState(0)
  const [mocksCount, setMocksCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [weekData, setWeekData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0])
  const [loading, setLoading] = useState(true)
  
  // MODAL STATES
  const [isMocksModalOpen, setIsMocksModalOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false) 
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isProtocolManagerOpen, setIsProtocolManagerOpen] = useState(false)
  
  // MEMBERSHIP STATE
  const [isPremium, setIsPremium] = useState(false)
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null)

  const { stats, activeExam } = useSyllabus() 
  const supabase = createClient()
  
  const isFocusMode = activeExam === 'focus'

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUserId(user.id)

        if (user.user_metadata?.full_name) {
          setUserName(user.user_metadata.full_name.split(' ')[0])
        }
        if (user.email) {
          setUserEmail(user.email)
        }

        // --- 1. FETCH MEMBERSHIP STATUS ---
        const { data: access } = await supabase
          .from('user_access')
          .select('is_premium, trial_starts_at, trial_ends_at')
          .eq('user_id', user.id)
          .single()

        if (access) {
          setIsPremium(access.is_premium)
          
          if (!access.is_premium) {
            const today = new Date()
            let endDate: Date

            if (access.trial_ends_at) {
              endDate = new Date(access.trial_ends_at)
            } else {
              const start = new Date(access.trial_starts_at)
              endDate = new Date(start)
              endDate.setDate(endDate.getDate() + 14)
            }
            
            const diffTime = endDate.getTime() - today.getTime()
            const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            setTrialDaysLeft(daysLeft)
          }
        }

        // --- 2. FETCH SETTINGS (Goal) ---
        const { data: settings } = await supabase
          .from('syllabus_settings')
          .select('daily_goal_hours')
          .eq('user_id', user.id)
          .single()
        
        if (settings) {
          if (settings.daily_goal_hours) {
            setDailyGoalMinutes(settings.daily_goal_hours * 60)
          }
        }

        // --- 3. FOCUS MINUTES (Today) + Week Data + Streak ---
        const today = new Date()
        const todayStr = today.toISOString().split('T')[0]
        
        // Get last 7 days
        const weekDates: string[] = []
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today)
          d.setDate(d.getDate() - i)
          weekDates.push(d.toISOString().split('T')[0])
        }
        
        // Get last 30 days for streak calculation
        const thirtyDaysAgo = new Date(today)
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        const { data: logs } = await supabase
          .from('focus_logs')
          .select('started_at, duration_minutes')
          .eq('user_id', user.id)
          .gte('started_at', thirtyDaysAgo.toISOString())

        if (logs) {
          // Today's minutes
          const todayLogs = logs.filter(l => l.started_at.split('T')[0] === todayStr)
          const total = todayLogs.reduce((sum, log) => sum + log.duration_minutes, 0)
          setFocusMinutes(total)
          
          // Week data
          const weekMinutes = weekDates.map(date => {
            const dayLogs = logs.filter(l => l.started_at.split('T')[0] === date)
            return dayLogs.reduce((sum, log) => sum + log.duration_minutes, 0)
          })
          setWeekData(weekMinutes)
          
          // Streak calculation
          const activeDays = new Set(logs.map(l => l.started_at.split('T')[0]))
          let currentStreak = 0
          let checkDate = new Date(today)
          
          // Allow today to be missing (hasn't logged yet)
          if (!activeDays.has(checkDate.toISOString().split('T')[0])) {
            checkDate.setDate(checkDate.getDate() - 1)
          }
          
          while (activeDays.has(checkDate.toISOString().split('T')[0])) {
            currentStreak++
            checkDate.setDate(checkDate.getDate() - 1)
          }
          setStreak(currentStreak)
        }

        // --- 4. Due Reviews ---
        const now = new Date().toISOString()
        const { count: reviewCount } = await supabase
          .from('topics')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .neq('status', 'completed')
          .lte('next_review', now)
        
        if (reviewCount !== null) setDueReviews(reviewCount)

        // --- 5. Mocks Count ---
        const { data: mockData } = await supabase
          .from('mock_logs')
          .select('logs')
          .eq('user_id', user.id)
          .eq('exam_id', activeExam || 'upsc')
          .maybeSingle()
        
        if (mockData?.logs) {
          // @ts-ignore
          setMocksCount(mockData.logs.length)
        }
      }
      
      setLoading(false)
    }
    getData()
  }, [supabase, activeExam])

  // Calculate progress
  const progressPercent = Math.min(Math.round((focusMinutes / dailyGoalMinutes) * 100), 100)
  const hoursLogged = Math.floor(focusMinutes / 60)
  const minutesLogged = focusMinutes % 60
  const goalHours = Math.floor(dailyGoalMinutes / 60)
  
  // Day labels for week view
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const today = new Date().getDay()
  const adjustedToday = today === 0 ? 6 : today - 1 // Convert Sunday=0 to index 6

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-8 pb-24 animate-pulse">
        <div className="flex justify-between">
          <div className="h-10 w-24 bg-stone-200 rounded" />
          <div className="h-10 w-10 bg-stone-200 rounded" />
        </div>
        <div>
          <div className="h-10 w-64 bg-stone-200 rounded mb-2" />
          <div className="h-6 w-48 bg-stone-100 rounded" />
        </div>
        <div className="h-64 bg-stone-200 rounded" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-stone-200 rounded" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-24 relative">
      
      {/* MODALS */}
      <InitiationModal />
      <OnboardingModal />
      <BroadcastBanner />

      {/* === TOP BAR: Status + Settings === */}
      <div className="flex items-center justify-between">
        
        {/* Status Badge */}
        <div className="flex items-center gap-3">
          {isPremium ? (
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-400 border-2 border-black px-4 py-2 shadow-[3px_3px_0_0_#000]">
              <Crown size={16} fill="black" />
              <span className="text-sm font-bold uppercase tracking-wide">Pro</span>
            </div>
          ) : (
            <button 
              onClick={() => setIsCheckoutOpen(true)}
              className={`flex items-center gap-2 border-2 border-black px-4 py-2 text-sm font-bold uppercase tracking-wide shadow-[3px_3px_0_0_#000] transition-all hover:-translate-y-0.5
                ${(trialDaysLeft !== null && trialDaysLeft <= 3) 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white text-black hover:bg-stone-50'}`}
            >
              <Clock size={14} />
              {trialDaysLeft !== null && trialDaysLeft > 0 
                ? `${trialDaysLeft}d left` 
                : 'Upgrade'}
            </button>
          )}
          
          {/* Streak Badge */}
          {streak > 0 && (
            <div className="flex items-center gap-1.5 bg-orange-100 border-2 border-orange-300 px-3 py-2 text-orange-700">
              <Flame size={16} className="fill-orange-500" />
              <span className="text-sm font-bold">{streak}</span>
            </div>
          )}
        </div>

        {/* Settings */}
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-3 bg-white border-2 border-black shadow-[3px_3px_0_0_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
          title="Settings"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* === GREETING SECTION === */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-black">
          {getGreeting()}, {userName}
        </h1>
        <p className="mt-2 text-base md:text-lg font-medium text-black/60">
          {getMotivation(progressPercent, streak)}
        </p>
      </div>

      {/* === HERO CARD: Today's Progress === */}
      <div className="bg-black text-white p-6 md:p-8 border-2 border-black shadow-[6px_6px_0_0_#CCFF00]">
        
        {/* Top Row */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-white/60 text-sm font-bold uppercase tracking-widest mb-2">
              <Target size={16} />
              Today's Progress
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl md:text-6xl font-black tabular-nums">
                {hoursLogged}<span className="text-2xl md:text-3xl text-white/50">h</span>
                {minutesLogged > 0 && (
                  <> {minutesLogged}<span className="text-2xl md:text-3xl text-white/50">m</span></>
                )}
              </span>
              <span className="text-lg font-bold text-white/40">/ {goalHours}h goal</span>
            </div>
          </div>
          
          {/* Circular Progress Indicator */}
          <div className="relative w-20 h-20 md:w-24 md:h-24">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
              />
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                fill="none"
                stroke="#CCFF00"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${progressPercent * 2.83} 283`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl md:text-2xl font-black text-brand">{progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-6">
          <div 
            className="h-full bg-brand transition-all duration-1000 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* CTA Button */}
        <Link 
          href="/dashboard/focus"
          className="flex items-center justify-center gap-3 w-full bg-brand text-black py-4 md:py-5 font-black text-base md:text-lg uppercase tracking-wide border-2 border-brand hover:bg-brand-hover transition-all group"
        >
          <Play size={22} className="fill-black group-hover:scale-110 transition-transform" />
          Start Focus Session
        </Link>
      </div>

      {/* === QUICK STATS ROW === */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        
        {/* Stat 1: Deep Work */}
        <Link 
          href="/dashboard/focus"
          className="group bg-white border-2 border-black p-4 md:p-5 shadow-[4px_4px_0_0_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
        >
          <div className="flex items-center gap-2 text-black/50 mb-2">
            <Timer size={16} />
            <span className="text-xs font-bold uppercase tracking-wide">Focus</span>
          </div>
          <div className="text-2xl md:text-3xl font-black text-black">{focusMinutes}m</div>
          <div className="text-xs font-bold text-black/40 mt-1">Today</div>
        </Link>

        {/* Stat 2: Reviews Due */}
        <Link 
          href="/dashboard/review"
          className={`group border-2 border-black p-4 md:p-5 shadow-[4px_4px_0_0_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all
            ${dueReviews > 0 ? 'bg-brand' : 'bg-white'}`}
        >
          <div className={`flex items-center gap-2 mb-2 ${dueReviews > 0 ? 'text-black/60' : 'text-black/50'}`}>
            <Brain size={16} />
            <span className="text-xs font-bold uppercase tracking-wide">Review</span>
          </div>
          <div className="text-2xl md:text-3xl font-black text-black">{dueReviews}</div>
          <div className={`text-xs font-bold mt-1 ${dueReviews > 0 ? 'text-black/60' : 'text-black/40'}`}>
            {dueReviews > 0 ? 'Due now' : 'All clear'}
          </div>
        </Link>

        {/* Stat 3: Syllabus */}
        {!isFocusMode && (
          <Link 
            href="/dashboard/syllabus"
            className="group bg-white border-2 border-black p-4 md:p-5 shadow-[4px_4px_0_0_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
          >
            <div className="flex items-center gap-2 text-black/50 mb-2">
              <CheckSquare size={16} />
              <span className="text-xs font-bold uppercase tracking-wide">Syllabus</span>
            </div>
            <div className="text-2xl md:text-3xl font-black text-black">{stats.percentage}%</div>
            <div className="w-full h-1.5 bg-black/10 mt-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-black rounded-full transition-all duration-500"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </Link>
        )}

        {/* Stat 4: Mocks */}
        <Link 
          href="/dashboard/mocks"
          className="group bg-white border-2 border-black p-4 md:p-5 shadow-[4px_4px_0_0_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
        >
          <div className="flex items-center gap-2 text-black/50 mb-2">
            <Activity size={16} />
            <span className="text-xs font-bold uppercase tracking-wide">Mocks</span>
          </div>
          <div className="text-2xl md:text-3xl font-black text-black">{mocksCount}</div>
          <div className="text-xs font-bold text-black/40 mt-1">Tests taken</div>
        </Link>

        {/* If Focus Mode, add an extra card */}
        {isFocusMode && (
          <div className="bg-white border-2 border-black p-4 md:p-5 shadow-[4px_4px_0_0_#000]">
            <div className="flex items-center gap-2 text-black/50 mb-2">
              <Sparkles size={16} />
              <span className="text-xs font-bold uppercase tracking-wide">Mode</span>
            </div>
            <div className="text-lg md:text-xl font-black text-black uppercase">Focus</div>
            <div className="text-xs font-bold text-black/40 mt-1">Pure productivity</div>
          </div>
        )}
      </div>

      {/* === THIS WEEK SECTION === */}
      <div className="bg-white border-2 border-black p-5 md:p-6 shadow-[4px_4px_0_0_#000]">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
            <TrendingUp size={20} />
            This Week
          </h3>
          <Link 
            href="/dashboard/focus/insights"
            className="text-xs font-bold uppercase tracking-wide text-black/50 hover:text-black flex items-center gap-1 transition-colors"
          >
            View All <ChevronRight size={14} />
          </Link>
        </div>
        
        {/* Week Grid */}
        <div className="grid grid-cols-7 gap-2 md:gap-3">
          {weekData.map((minutes, i) => {
            const isToday = i === adjustedToday
            const percentage = Math.min(minutes / dailyGoalMinutes, 1)
            const height = Math.max(percentage * 100, 8) // Minimum 8% height
            
            return (
              <div key={i} className="flex flex-col items-center gap-2">
                {/* Bar */}
                <div className="w-full h-20 md:h-24 bg-stone-100 rounded-sm flex items-end overflow-hidden">
                  <div 
                    className={`w-full transition-all duration-500 rounded-sm ${
                      percentage >= 1 
                        ? 'bg-brand' 
                        : percentage > 0 
                          ? 'bg-amber-400' 
                          : 'bg-stone-200'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                </div>
                {/* Label */}
                <span className={`text-xs font-bold ${
                  isToday ? 'text-black bg-black text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-black/40'
                }`}>
                  {dayLabels[i]}
                </span>
              </div>
            )
          })}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-black/10">
          <div className="flex items-center gap-2 text-xs font-bold text-black/50">
            <div className="w-3 h-3 bg-stone-200 rounded-sm" />
            <span>No activity</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-black/50">
            <div className="w-3 h-3 bg-amber-400 rounded-sm" />
            <span>In progress</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-black/50">
            <div className="w-3 h-3 bg-brand rounded-sm" />
            <span>Goal hit</span>
          </div>
        </div>
      </div>

      {/* === EXAM COUNTDOWN (Editable) === */}
      <Countdown />

      {/* === QUICK ACTIONS === */}
      <div className="flex gap-3">
        <Link 
          href="/dashboard/mocks/insights"
          className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-black px-4 py-3 md:py-4 font-bold uppercase text-sm tracking-wide shadow-[3px_3px_0_0_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
        >
          <Activity size={16} />
          Insights
        </Link>
        <button 
          onClick={() => setIsMocksModalOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 bg-black text-white border-2 border-black px-4 py-3 md:py-4 font-bold uppercase text-sm tracking-wide shadow-[3px_3px_0_0_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
        >
          <Plus size={16} />
          Log Mock
        </button>
      </div>

      {/* === MODALS === */}
      <MocksModal 
        open={isMocksModalOpen} 
        onClose={() => setIsMocksModalOpen(false)} 
        examId={activeExam || 'upsc'} 
        onSuccess={() => window.location.reload()} 
      />

      <SettingsModal 
        open={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        userName={userName}
        userEmail={userEmail}
      />
      
      {activeExam === 'custom' && (
        <ProtocolManagerModal 
          isOpen={isProtocolManagerOpen}
          onClose={() => setIsProtocolManagerOpen(false)}
          userId={userId}
        />
      )}
    </div>
  )
}