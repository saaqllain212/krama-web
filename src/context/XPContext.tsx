'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react'
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
import { updateCompanionAfterStudy } from '@/lib/companions/companionLogic'

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
  const supabase = createClient()
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
      // No stats yet, create them — FIX: last_active_date defaults to NULL now
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

  // BUG FIX: REMOVED the useEffect that incremented streak on page load.
  // Streak is now ONLY updated when the user actually studies (in recordFocusSession).
  // Previously, just opening the dashboard each day would increment the streak.

  // Update stats in DB
  const updateStats = async (updates: Partial<UserStats>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setStats(prevStats => {
      if (!prevStats) return prevStats
      
      const newStats = { ...prevStats, ...updates }
      
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
        setNewAchievement(newAchievements[0])
      }

      // Fire DB update (non-blocking)
      supabase
        .from('user_stats')
        .update({
          ...updates,
          level: newStats.level,
          title: newStats.title,
          achievements: newStats.achievements,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .then(({ error }) => {
          if (error) console.error('Failed to update user_stats:', error)
        })

      return newStats
    })
  }

  // Add XP with notification
  const addXP = async (amount: number, reason: string) => {
    setRecentXPGain({ amount, reason })
    
    setStats(prev => {
      if (!prev) return prev
      return { ...prev, xp: prev.xp + amount }
    })
    
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.rpc('increment_xp', { user_id_input: user.id, amount_input: amount }).then(({ error }) => {
        if (error) {
          updateStats({})
        }
      })
    }
    
    setTimeout(() => setRecentXPGain(null), 3000)
  }

  // Record focus session — FIX: This is now the ONLY place streak gets updated
  const recordFocusSession = async (minutes: number) => {
    if (!stats) return
    
    const xpEarned = minutes * XP_REWARDS.FOCUS_PER_MINUTE
    const isFirstFocus = stats.total_focus_minutes === 0
    const totalXP = xpEarned + (isFirstFocus ? XP_REWARDS.FIRST_FOCUS : 0)

    // FIX: Calculate streak here (only when user actually studies)
    const { newStreak, isNewDay } = calculateStreak(stats.last_active_date, stats.current_streak)
    
    let bonusXP = 0
    const streakUpdates: Partial<UserStats> = {}

    if (isNewDay) {
      streakUpdates.current_streak = newStreak
      streakUpdates.longest_streak = Math.max(newStreak, stats.longest_streak)
      streakUpdates.last_active_date = new Date().toISOString().split('T')[0]

      // Daily login + streak bonuses
      if (newStreak > stats.current_streak) {
        bonusXP += XP_REWARDS.DAILY_LOGIN
        if (newStreak === 7) bonusXP += XP_REWARDS.STREAK_7_DAYS
        if (newStreak === 30) bonusXP += XP_REWARDS.STREAK_30_DAYS
      }
    } else if (!stats.last_active_date) {
      // First ever study session — set last_active_date
      streakUpdates.current_streak = 1
      streakUpdates.longest_streak = 1
      streakUpdates.last_active_date = new Date().toISOString().split('T')[0]
      bonusXP += XP_REWARDS.DAILY_LOGIN
    }
    
    await updateStats({
      xp: stats.xp + totalXP + bonusXP,
      total_focus_minutes: stats.total_focus_minutes + minutes,
      ...streakUpdates
    })
    
    // Update companion state
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await updateCompanionAfterStudy(supabase, user.id, minutes, streakUpdates.current_streak ?? stats.current_streak)
      }
    } catch (e) {
      console.error('Companion update failed:', e)
    }
    
    if (isFirstFocus) {
      setRecentXPGain({ amount: totalXP + bonusXP, reason: 'First focus session! 🎉' })
    } else if (bonusXP > 0) {
      setRecentXPGain({ amount: totalXP + bonusXP, reason: `${minutes} min focus + streak bonus!` })
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
