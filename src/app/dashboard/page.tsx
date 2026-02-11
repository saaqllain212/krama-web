'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Crown, Clock, Settings as SettingsIcon } from 'lucide-react'
import { useSyllabus } from '@/context/SyllabusContext'
import SettingsModal from '@/components/dashboard/SettingsModal'
import OnboardingModal from '@/components/dashboard/OnboardingModal'
import CheckoutModal from '@/components/dashboard/CheckoutModal'
import InitiationModal from '@/components/dashboard/InitiationModal'
import BroadcastBanner from '@/components/dashboard/BroadcastBanner'
import TodayProgressCard from '@/components/dashboard/TodayProgressCard'
import QuickStatsGrid from '@/components/dashboard/QuickStatsGrid'
import AIMCQBanner from '@/components/dashboard/AIMCQBanner'
import GettingStartedCard from '@/components/dashboard/GettingStartedCard'

// IMPORTS THE COMPANION WIDGET
import DualCompanions from '@/components/companions/DualCompanions'

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

// --- Shimmer skeleton component ---
function DashboardSkeleton() {
  return (
    <div className="space-y-8 pb-24">
      <div className="flex justify-between items-center">
        <div className="h-10 w-28 bg-gray-200 rounded-full skeleton-shimmer" />
        <div className="h-10 w-10 bg-gray-200 rounded-lg skeleton-shimmer" />
      </div>
      <div className="space-y-3">
        <div className="h-10 w-72 bg-gray-200 rounded-lg skeleton-shimmer" />
        <div className="h-6 w-56 bg-gray-100 rounded-lg skeleton-shimmer" />
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-6">
        <div className="flex justify-between">
          <div className="space-y-3">
            <div className="h-4 w-32 bg-gray-200 rounded skeleton-shimmer" />
            <div className="h-12 w-40 bg-gray-200 rounded skeleton-shimmer" />
          </div>
          <div className="w-24 h-24 bg-gray-200 rounded-full skeleton-shimmer" />
        </div>
        <div className="h-px bg-gray-100" />
        <div className="flex gap-3">
          {[1,2,3,4,5,6,7].map(i => (
            <div key={i} className="flex-1 h-10 bg-gray-100 rounded-lg skeleton-shimmer" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
            <div className="w-12 h-12 bg-gray-200 rounded-xl skeleton-shimmer" />
            <div className="h-8 w-16 bg-gray-200 rounded skeleton-shimmer" />
            <div className="h-4 w-24 bg-gray-100 rounded skeleton-shimmer" />
          </div>
        ))}
      </div>
      <style jsx>{`
        .skeleton-shimmer { position: relative; overflow: hidden; }
        .skeleton-shimmer::after {
          content: ''; position: absolute; top: 0; right: 0; bottom: 0; left: 0;
          transform: translateX(-100%);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer { 100% { transform: translateX(100%); } }
      `}</style>
    </div>
  )
}

export default function DashboardPage() {
  const [userName, setUserName] = useState('Student')
  const [userEmail, setUserEmail] = useState('')
  const [user, setUser] = useState<any>(null)
  
  const [focusMinutes, setFocusMinutes] = useState(0)
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(360) // default — will be overridden from DB
  const [dueReviews, setDueReviews] = useState(0)
  const [mocksCount, setMocksCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [weekData, setWeekData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0])
  const [loading, setLoading] = useState(true)
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false) 
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  
  const [isPremium, setIsPremium] = useState(false)
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null)

  const { stats, activeExam } = useSyllabus() 
  const supabase = createClient()

  const getData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      setUser(user)
      
      if (user.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name.split(' ')[0])
      }
      if (user.email) {
        setUserEmail(user.email)
      }

      const today = new Date().toISOString().split('T')[0]
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 6)

      // FIX: Added goalRes to fetch user's daily goal from syllabus_settings
      const [accessRes, focusRes, weekRes, statsRes, reviewRes, mockRes, goalRes] = await Promise.all([
        supabase
          .from('user_access')
          .select('is_premium, trial_starts_at, trial_ends_at')
          .eq('user_id', user.id)
          .single(),

        supabase
          .from('focus_logs')
          .select('duration_minutes')
          .eq('user_id', user.id)
          .gte('started_at', `${today}T00:00:00`)
          .lt('started_at', `${today}T23:59:59`),

        supabase
          .from('focus_logs')
          .select('started_at, duration_minutes')
          .eq('user_id', user.id)
          .gte('started_at', weekAgo.toISOString()),

        supabase
          .from('user_stats')
          .select('current_streak')
          .eq('user_id', user.id)
          .single(),

        supabase
          .from('topics')
          .select('id')
          .eq('user_id', user.id)
          .lte('next_review', today),

        supabase
          .from('mock_logs')
          .select('logs')
          .eq('user_id', user.id)
          .eq('exam_id', activeExam || 'upsc')
          .maybeSingle(),

        // BUG FIX: Fetch daily goal from DB instead of hardcoding 6h
        supabase
          .from('syllabus_settings')
          .select('daily_goal_hours')
          .eq('user_id', user.id)
          .single()
      ])

      // Process membership
      if (accessRes.data) {
        const access = accessRes.data
        setIsPremium(access.is_premium)
        if (!access.is_premium && access.trial_ends_at) {
          const now = new Date()
          const end = new Date(access.trial_ends_at)
          const diffTime = end.getTime() - now.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          setTrialDaysLeft(Math.max(0, diffDays))
        }
      }

      if (focusRes.data) {
        const total = focusRes.data.reduce((sum, s) => sum + (s.duration_minutes || 0), 0)
        setFocusMinutes(total)
      }

      if (weekRes.data) {
        const newWeekData = [0, 0, 0, 0, 0, 0, 0]
        weekRes.data.forEach((session) => {
          const sessionDate = new Date(session.started_at)
          const dayOfWeek = sessionDate.getDay()
          const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1
          newWeekData[adjustedDay] += session.duration_minutes || 0
        })
        setWeekData(newWeekData)
      }

      if (statsRes.data) {
        setStreak(statsRes.data.current_streak || 0)
      }

      if (reviewRes.data) {
        setDueReviews(reviewRes.data.length)
      }

      if (mockRes.data?.logs) {
        // @ts-ignore
        setMocksCount(mockRes.data.logs.length)
      }

      // BUG FIX: Use DB value for daily goal (overrides the default 360)
      if (goalRes.data?.daily_goal_hours) {
        setDailyGoalMinutes(goalRes.data.daily_goal_hours * 60)
      }
    }
    
    setLoading(false)
  }

  useEffect(() => {
    getData()
  }, [supabase, activeExam]) // eslint-disable-line react-hooks/exhaustive-deps

  const progressPercent = Math.min(Math.round((focusMinutes / dailyGoalMinutes) * 100), 100)

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-8 pb-24">
      
      <InitiationModal />
      <OnboardingModal />
      <BroadcastBanner />
      
      {/* FIX: Pass onGoalSaved callback so dashboard re-fetches without full page reload */}
      <SettingsModal 
        open={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onGoalSaved={() => getData()}
      />
      
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        userName={userName}
        userEmail={userEmail}
      />

      {/* === TOP BAR === */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isPremium ? (
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-400 px-4 py-2 rounded-full shadow-soft">
              <Crown size={16} className="text-amber-900" />
              <span className="text-sm font-bold text-amber-900 uppercase tracking-wide">Pro</span>
            </div>
          ) : (
            <button 
              onClick={() => setIsCheckoutOpen(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide shadow-soft transition-all hover:shadow-medium
                ${(trialDaysLeft !== null && trialDaysLeft <= 3) 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white text-gray-900 border border-gray-200 hover:border-primary-300'}`}
            >
              <Clock size={14} />
              {trialDaysLeft !== null && trialDaysLeft > 0 
                ? `${trialDaysLeft}d left` 
                : 'Upgrade'}
            </button>
          )}
        </div>

        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-3 bg-white border border-gray-200 rounded-lg shadow-soft hover:shadow-medium hover:border-primary-300 transition-all"
          title="Settings"
        >
          <SettingsIcon size={20} className="text-gray-700" />
        </button>
      </div>

      {/* === GREETING === */}
      <div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
          {getGreeting()}, {userName}
        </h1>
        <p className="mt-3 text-lg md:text-xl font-medium text-gray-600">
          {getMotivation(progressPercent, streak)}
        </p>
      </div>

      <GettingStartedCard 
        focusMinutes={focusMinutes}
        dueReviews={dueReviews}
        syllabusPercentage={stats.percentage}
      />

      <DualCompanions 
        userId={user?.id || ''}
        todayMinutes={focusMinutes}
        streak={streak}
        lastWeekAverage={weekData.reduce((a, b) => a + b, 0) / 7}
      />

      <TodayProgressCard 
        focusMinutes={focusMinutes}
        dailyGoalMinutes={dailyGoalMinutes}
        weekData={weekData}
        streak={streak}
      />

      <QuickStatsGrid 
        focusMinutes={focusMinutes}
        dueReviews={dueReviews}
        syllabusPercentage={stats.percentage}
        mocksCount={mocksCount}
      />

      <AIMCQBanner />
    </div>
  )
}
