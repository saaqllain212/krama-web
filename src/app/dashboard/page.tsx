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
import DualCompanionsPreview from '@/components/dashboard/DualCompanionsPreview'
import AIMCQBanner from '@/components/dashboard/AIMCQBanner'

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
  // FIX 1: Added userEmail state
  const [userEmail, setUserEmail] = useState('')
  
  const [focusMinutes, setFocusMinutes] = useState(0)
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(360) // 6 hours default
  const [dueReviews, setDueReviews] = useState(0)
  const [mocksCount, setMocksCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [weekData, setWeekData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0])
  const [loading, setLoading] = useState(true)
  
  // MODAL STATES
  const [isSettingsOpen, setIsSettingsOpen] = useState(false) 
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  
  // MEMBERSHIP STATE
  const [isPremium, setIsPremium] = useState(false)
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null)

  const { stats, activeExam } = useSyllabus() 
  const supabase = createClient()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        if (user.user_metadata?.full_name) {
          setUserName(user.user_metadata.full_name.split(' ')[0])
        }
        
        // FIX 2: Set email from user data
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
          
          if (!access.is_premium && access.trial_ends_at) {
            const now = new Date()
            const end = new Date(access.trial_ends_at)
            const diffTime = end.getTime() - now.getTime()
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            setTrialDaysLeft(Math.max(0, diffDays))
          }
        }

        // --- 2. FETCH TODAY'S FOCUS TIME ---
        const today = new Date().toISOString().split('T')[0]
        const { data: focusData } = await supabase
          .from('focus_sessions')
          .select('duration')
          .eq('user_id', user.id)
          .gte('started_at', `${today}T00:00:00`)
          .lt('started_at', `${today}T23:59:59`)

        if (focusData) {
          const total = focusData.reduce((sum, s) => sum + (s.duration || 0), 0)
          setFocusMinutes(total)
        }

        // --- 3. FETCH WEEK DATA ---
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 6)
        const { data: weekFocus } = await supabase
          .from('focus_sessions')
          .select('started_at, duration')
          .eq('user_id', user.id)
          .gte('started_at', weekAgo.toISOString())

        if (weekFocus) {
          const newWeekData = [0, 0, 0, 0, 0, 0, 0]
          weekFocus.forEach((session) => {
            const sessionDate = new Date(session.started_at)
            const dayOfWeek = sessionDate.getDay()
            const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1
            newWeekData[adjustedDay] += session.duration || 0
          })
          setWeekData(newWeekData)
        }

        // --- 4. FETCH STREAK ---
        const { data: streakData } = await supabase
          .from('focus_sessions')
          .select('started_at')
          .eq('user_id', user.id)
          .order('started_at', { ascending: false })

        if (streakData && streakData.length > 0) {
          let currentStreak = 1
          const dates = streakData.map(s => new Date(s.started_at).toISOString().split('T')[0])
          const uniqueDates = [...new Set(dates)]
          
          for (let i = 1; i < uniqueDates.length; i++) {
            const prevDate = new Date(uniqueDates[i-1])
            const currDate = new Date(uniqueDates[i])
            const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24))
            
            if (diffDays === 1) {
              currentStreak++
            } else {
              break
            }
          }
          setStreak(currentStreak)
        }

        // --- 5. FETCH DUE REVIEWS ---
        const { data: reviewData } = await supabase
          .from('spaced_repetition')
          .select('id')
          .eq('user_id', user.id)
          .eq('exam_id', activeExam || 'upsc')
          .lte('next_review', today)

        if (reviewData) {
          setDueReviews(reviewData.length)
        }

        // --- 6. FETCH MOCKS COUNT ---
        const { data: mockData } = await supabase
          .from('mock_tests')
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

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-8 pb-24 animate-pulse">
        <div className="flex justify-between">
          <div className="h-10 w-48 bg-gray-200 rounded" />
          <div className="h-10 w-32 bg-gray-200 rounded" />
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-24">
      
      {/* MODALS */}
      <InitiationModal />
      <OnboardingModal />
      <BroadcastBanner />
      
      {/* FIX 3: Changed isOpen to open */}
      <SettingsModal open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      {/* FIX 4: Added userName and userEmail props */}
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        userName={userName}
        userEmail={userEmail}
      />

      {/* === TOP BAR: Status + Settings === */}
      <div className="flex items-center justify-between">
        
        {/* Status Badge */}
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

        {/* Settings */}
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-3 bg-white border border-gray-200 rounded-lg shadow-soft hover:shadow-medium hover:border-primary-300 transition-all"
          title="Settings"
        >
          <SettingsIcon size={20} className="text-gray-700" />
        </button>
      </div>

      {/* === GREETING SECTION === */}
      <div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
          {getGreeting()}, {userName}
        </h1>
        <p className="mt-3 text-lg md:text-xl font-medium text-gray-600">
          {getMotivation(progressPercent, streak)}
        </p>
      </div>

      {/* === DUAL COMPANIONS PREVIEW === */}
      <DualCompanionsPreview />

      {/* === TODAY'S PROGRESS CARD === */}
      <TodayProgressCard 
        focusMinutes={focusMinutes}
        dailyGoalMinutes={dailyGoalMinutes}
        weekData={weekData}
        streak={streak}
      />

      {/* === QUICK STATS GRID === */}
      <QuickStatsGrid 
        focusMinutes={focusMinutes}
        dueReviews={dueReviews}
        syllabusPercentage={stats.percentage}
        mocksCount={mocksCount}
      />

      {/* === AI MCQ GENERATOR BANNER === */}
      <AIMCQBanner />
    </div>
  )
}