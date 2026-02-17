'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  getLevelFromXP, 
  getNextLevel, 
  calculateStreak, 
  XP_REWARDS, 
  checkNewAchievements,
  type LevelInfo,
  type Achievement
} from '@/lib/xp'

type UserStats = {
  xp: number
  level: number
  title: string
  current_streak: number
  longest_streak: number
  last_active_date: string | null
  total_focus_minutes: number
  total_reviews: number
  total_mocks: number
  achievements: string[]
}

type XPContextType = {
  stats: UserStats | null
  levelInfo: LevelInfo | null
  nextLevelInfo: { nextLevel: LevelInfo | null, xpNeeded: number, progress: number } | null
  loading: boolean
  addXP: (amount: number, reason: string) => Promise<void>
  recordFocusSession: (minutes: number) => Promise<void>
  recordReview: () => Promise<void>
  recordMock: () => Promise<void>
  recordSyllabusTopic: () => Promise<void>
  refreshStats: () => Promise<void>
  recentXPGain: { amount: number, reason: string } | null
  newAchievement: Achievement | null
  clearNotifications: () => void
}

const XPContext = createContext<XPContextType | undefined>(undefined)

export function XPProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), [])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [recentXPGain, setRecentXPGain] = useState<{ amount: number, reason: string } | null>(null)
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null)

  // Fetch stats on mount
  const refreshStats = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code === 'PGRST116') {
      // No stats yet, create them
      const { data: newStats } = await supabase
        .from('user_stats')
        .insert({ user_id: user.id })
        .select()
        .single()
      
      if (newStats) {
        setStats({
          ...newStats,
          achievements: newStats.achievements || []
        })
      }
    } else if (data) {
      setStats({
        ...data,
        achievements: data.achievements || []
      })
    }
    
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    refreshStats()
  }, [refreshStats])

  // Check and update streak on load
  useEffect(() => {
    if (!stats) return
    
    const { newStreak, isNewDay } = calculateStreak(stats.last_active_date, stats.current_streak)
    
    if (isNewDay) {
      updateStats({
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, stats.longest_streak),
        last_active_date: new Date().toISOString().split('T')[0]
      })
      
      // Award daily login XP
      if (newStreak > stats.current_streak) {
        addXP(XP_REWARDS.DAILY_LOGIN, 'Daily login')
        
        // Check for streak bonuses
        if (newStreak === 7) {
          addXP(XP_REWARDS.STREAK_7_DAYS, '7-day streak bonus!')
        } else if (newStreak === 30) {
          addXP(XP_REWARDS.STREAK_30_DAYS, '30-day streak bonus!')
        }
      }
    }
  }, [stats?.last_active_date])

  // Update stats in DB
  const updateStats = async (updates: Partial<UserStats>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !stats) return

    const newStats = { ...stats, ...updates }
    
    // Recalculate level
    const levelInfo = getLevelFromXP(newStats.xp)
    newStats.level = levelInfo.level
    newStats.title = levelInfo.title
    
    // Check for new achievements
    const newAchievements = checkNewAchievements(newStats)
    if (newAchievements.length > 0) {
      newStats.achievements = [
        ...newStats.achievements,
        ...newAchievements.map(a => a.id)
      ]
      // Show first new achievement
      setNewAchievement(newAchievements[0])
    }

    await supabase
      .from('user_stats')
      .update({
        ...updates,
        level: newStats.level,
        title: newStats.title,
        achievements: newStats.achievements,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    setStats(newStats)
  }

  // Add XP with notification
  const addXP = async (amount: number, reason: string) => {
    if (!stats) return
    
    setRecentXPGain({ amount, reason })
    await updateStats({ xp: stats.xp + amount })
    
    // Clear notification after 3 seconds
    setTimeout(() => setRecentXPGain(null), 3000)
  }

  // Record focus session
  const recordFocusSession = async (minutes: number) => {
    if (!stats) return
    
    const xpEarned = minutes * XP_REWARDS.FOCUS_PER_MINUTE
    const isFirstFocus = stats.total_focus_minutes === 0
    
    await updateStats({
      xp: stats.xp + xpEarned + (isFirstFocus ? XP_REWARDS.FIRST_FOCUS : 0),
      total_focus_minutes: stats.total_focus_minutes + minutes
    })
    
    if (isFirstFocus) {
      setRecentXPGain({ amount: xpEarned + XP_REWARDS.FIRST_FOCUS, reason: 'First focus session! 🎉' })
    } else {
      setRecentXPGain({ amount: xpEarned, reason: `${minutes} min focus` })
    }
    
    setTimeout(() => setRecentXPGain(null), 3000)
  }

  // Record review completion
  const recordReview = async () => {
    if (!stats) return
    
    await updateStats({
      xp: stats.xp + XP_REWARDS.REVIEW_COMPLETE,
      total_reviews: stats.total_reviews + 1
    })
    
    setRecentXPGain({ amount: XP_REWARDS.REVIEW_COMPLETE, reason: 'Review complete' })
    setTimeout(() => setRecentXPGain(null), 3000)
  }

  // Record mock test
  const recordMock = async () => {
    if (!stats) return
    
    const isFirstMock = stats.total_mocks === 0
    const xpEarned = XP_REWARDS.MOCK_LOGGED + (isFirstMock ? XP_REWARDS.FIRST_MOCK : 0)
    
    await updateStats({
      xp: stats.xp + xpEarned,
      total_mocks: stats.total_mocks + 1
    })
    
    setRecentXPGain({ amount: xpEarned, reason: isFirstMock ? 'First mock test! 🎉' : 'Mock logged' })
    setTimeout(() => setRecentXPGain(null), 3000)
  }

  // Record syllabus topic
  const recordSyllabusTopic = async () => {
    if (!stats) return
    
    await updateStats({
      xp: stats.xp + XP_REWARDS.SYLLABUS_TOPIC
    })
    
    setRecentXPGain({ amount: XP_REWARDS.SYLLABUS_TOPIC, reason: 'Topic checked' })
    setTimeout(() => setRecentXPGain(null), 3000)
  }

  const clearNotifications = () => {
    setRecentXPGain(null)
    setNewAchievement(null)
  }

  const levelInfo = stats ? getLevelFromXP(stats.xp) : null
  const nextLevelInfo = stats ? getNextLevel(stats.xp) : null

  return (
    <XPContext.Provider value={{
      stats,
      levelInfo,
      nextLevelInfo,
      loading,
      addXP,
      recordFocusSession,
      recordReview,
      recordMock,
      recordSyllabusTopic,
      refreshStats,
      recentXPGain,
      newAchievement,
      clearNotifications
    }}>
      {children}
    </XPContext.Provider>
  )
}

export function useXP() {
  const context = useContext(XPContext)
  if (context === undefined) {
    throw new Error('useXP must be used within an XPProvider')
  }
  return context
}
