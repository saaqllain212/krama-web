'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Crown, Clock, Settings as SettingsIcon } from 'lucide-react'
import { useSyllabus } from '@/context/SyllabusContext'
import { useXP } from '@/context/XPContext'
import { useAppConfig } from '@/context/AppConfigContext'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'

// === ABOVE THE FOLD — Eager loaded (critical for first paint) ===
import BroadcastBanner from '@/components/dashboard/BroadcastBanner'
import TodayProgressCard from '@/components/dashboard/TodayProgressCard'
import QuickStatsGrid from '@/components/dashboard/QuickStatsGrid'
import ExamCountdown from '@/components/dashboard/ExamCountdown'
import GettingStartedCard from '@/components/dashboard/GettingStartedCard'
import LiveStudyingCount from '@/components/dashboard/LiveStudyingCount'

// === BELOW THE FOLD — Lazy loaded (not visible on first paint) ===
const DailyQuests = dynamic(() => import('@/components/dashboard/DailyQuests'), { ssr: false })
const WeeklyLeaderboard = dynamic(() => import('@/components/dashboard/WeeklyLeaderboard'), { ssr: false })
const StudyConstellation = dynamic(() => import('@/components/dashboard/StudyConstellation'), { ssr: false })
const WeekInReview = dynamic(() => import('@/components/dashboard/WeekInReview'), { ssr: false })
const AIMCQBanner = dynamic(() => import('@/components/dashboard/AIMCQBanner'), { ssr: false })
const DualCompanions = dynamic(() => import('@/components/companions/DualCompanions'), { ssr: false })

// === MODALS — Lazy loaded (hidden until user interaction) ===
const SettingsModal = dynamic(() => import('@/components/dashboard/SettingsModal'), { ssr: false })
const OnboardingModal = dynamic(() => import('@/components/dashboard/OnboardingModal'), { ssr: false })
const CheckoutModal = dynamic(() => import('@/components/dashboard/CheckoutModal'), { ssr: false })
const InitiationModal = dynamic(() => import('@/components/dashboard/InitiationModal'), { ssr: false })
const StreakEarnBack = dynamic(() => import('@/components/dashboard/StreakEarnBack'), { ssr: false })
const MilestoneCelebration = dynamic(() => import('@/components/dashboard/MilestoneCelebration'), { ssr: false })

// Stagger animation wrapper
const stagger = {
  container: {
    animate: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
  },
  item: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } }
  }
}

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

const getMotivation = (progress: number, streak: number) => {
  if (progress >= 100) return "You've crushed today's goal! 🔥"
  if (progress >= 75) return "Almost there. One more push!"
  if (progress >= 50) return "Halfway through. Keep the momentum."
  if (streak >= 7) return `${streak}-day streak! Don't break it.`
  if (streak >= 3) return "Building consistency. Stay focused."
  return "Every minute counts. Let's begin."
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 pb-24">
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
          <div className="w-20 h-20 bg-gray-200 rounded-full skeleton-shimmer" />
        </div>
        <div className="h-px bg-gray-100" />
        <div className="flex gap-2">
          {[1,2,3,4,5,6,7].map(i => (
            <div key={i} className="flex-1 h-10 bg-gray-100 rounded-lg skeleton-shimmer" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
            <div className="w-9 h-9 bg-gray-200 rounded-lg skeleton-shimmer" />
            <div className="h-7 w-14 bg-gray-200 rounded skeleton-shimmer" />
            <div className="h-4 w-20 bg-gray-100 rounded skeleton-shimmer" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [userName, setUserName] = useState('Student')
  const [userEmail, setUserEmail] = useState('')
  const [user, setUser] = useState<{ id: string; user_metadata?: { full_name?: string }; email?: string } | null>(null)
  
  const [focusMinutes, setFocusMinutes] = useState(0)
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(360)
  const [dueReviews, setDueReviews] = useState(0)
  const [mocksCount, setMocksCount] = useState(0)
  const [weekData, setWeekData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0])
  const [loading, setLoading] = useState(true)
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false) 
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  
  const [isPremium, setIsPremium] = useState(false)
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null)

  const { stats, activeExam } = useSyllabus() 
  const supabase = useMemo(() => createClient(), [])
  const { config: appConfig } = useAppConfig()
  const { stats: xpStats } = useXP()
  const streak = xpStats?.current_streak ?? 0

  const getData = useCallback(async () => {
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

      const [accessRes, focusRes, weekRes, reviewRes, mockRes, goalRes] = await Promise.all([
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
        supabase
          .from('syllabus_settings')
          .select('daily_goal_hours')
          .eq('user_id', user.id)
          .single()
      ])

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
        setFocusMinutes(focusRes.data.reduce((sum, s) => sum + (s.duration_minutes || 0), 0))
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

      if (reviewRes.data) {
        setDueReviews(reviewRes.data.length)
      }

      if (mockRes.data?.logs && Array.isArray(mockRes.data.logs)) {
        setMocksCount(mockRes.data.logs.length)
      }

      if (goalRes.data?.daily_goal_hours) {
        setDailyGoalMinutes(goalRes.data.daily_goal_hours * 60)
      }
    }
    
    setLoading(false)
  }, [supabase, activeExam])

  useEffect(() => {
    getData()
  }, [getData])

  const progressPercent = Math.min(Math.round((focusMinutes / dailyGoalMinutes) * 100), 100)

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <motion.div 
      className="space-y-6 sm:space-y-8 pb-24"
      variants={stagger.container}
      initial="initial"
      animate="animate"
    >
      <InitiationModal />
      <OnboardingModal />
      <BroadcastBanner />
      <StreakEarnBack />
      <MilestoneCelebration />
      
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
      <motion.div variants={stagger.item} className="flex items-center justify-between">
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
          className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-soft hover:shadow-medium hover:border-primary-300 transition-all"
          title="Settings"
        >
          <SettingsIcon size={18} className="text-gray-600" />
        </button>
      </motion.div>

      {/* === GREETING === */}
      <motion.div variants={stagger.item}>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
          {getGreeting()}, {userName}
        </h1>
        <p className="mt-2 text-base sm:text-lg md:text-xl font-medium text-gray-500">
          {getMotivation(progressPercent, streak)}
        </p>
        <div className="mt-2">
          <LiveStudyingCount />
        </div>
      </motion.div>

      {/* === EXAM COUNTDOWN === */}
      <motion.div variants={stagger.item}>
        <ExamCountdown />
      </motion.div>

      {/* === WEEK IN REVIEW === */}
      <motion.div variants={stagger.item}>
        <WeekInReview />
      </motion.div>

      {/* === GETTING STARTED (new users) === */}
      <motion.div variants={stagger.item}>
        <GettingStartedCard 
          focusMinutes={focusMinutes}
          dueReviews={dueReviews}
          syllabusPercentage={stats.percentage}
        />
      </motion.div>

      {/* === DUAL COMPANIONS (feature-flagged) === */}
      {appConfig.feature_companions_enabled && (
        <motion.div variants={stagger.item}>
          <DualCompanions 
            userId={user?.id || ''}
            todayMinutes={focusMinutes}
            streak={streak}
            lastWeekAverage={weekData.reduce((a, b) => a + b, 0) / 7}
          />
        </motion.div>
      )}

      {/* === TODAY'S PROGRESS === */}
      <motion.div variants={stagger.item}>
        <TodayProgressCard 
          focusMinutes={focusMinutes}
          dailyGoalMinutes={dailyGoalMinutes}
          weekData={weekData}
          streak={streak}
        />
      </motion.div>

      {/* === QUICK STATS === */}
      <motion.div variants={stagger.item}>
        <QuickStatsGrid 
          focusMinutes={focusMinutes}
          dueReviews={dueReviews}
          syllabusPercentage={stats.percentage}
          mocksCount={mocksCount}
        />
      </motion.div>

      {/* === DAILY QUESTS + CONSTELLATION + LEADERBOARD === */}
      <motion.div variants={stagger.item} className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <DailyQuests />
        </div>
        <div className="space-y-4 sm:space-y-6">
          <div className="card flex flex-col items-center py-6">
            <StudyConstellation compact />
          </div>
          <WeeklyLeaderboard />
        </div>
      </motion.div>

      {/* === AI MCQ GENERATOR BANNER (feature-flagged) === */}
      {appConfig.feature_mcq_enabled && (
        <motion.div variants={stagger.item}>
          <AIMCQBanner />
        </motion.div>
      )}
    </motion.div>
  )
}
