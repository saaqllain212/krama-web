'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode, useMemo } from 'react'
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
import { useAppConfig } from '@/context/AppConfigContext'

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
  streak_freezes_remaining: number
  streak_freeze_used_at: string | null
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
  const { config: appConfig } = useAppConfig()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [recentXPGain, setRecentXPGain] = useState<{ amount: number, reason: string } | null>(null)
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null)

  // FIX: Cache user ID to avoid calling getUser() on every XP action
  const userIdRef = useRef<string | null>(null)

  // Helper to get userId — uses cache, falls back to getUser()
  const getUserId = useCallback(async (): Promise<string | null> => {
    if (userIdRef.current) return userIdRef.current
    const { data: { user } } = await supabase.auth.getUser()
    if (user) userIdRef.current = user.id
    return user?.id ?? null
  }, [supabase])

  // Fetch stats on mount
  const refreshStats = useCallback(async () => {
    const userId = await getUserId()
    if (!userId) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code === 'PGRST116') {
      // No stats yet, create them
      const { data: newStats } = await supabase
        .from('user_stats')
        .insert({ user_id: userId })
        .select()
        .single()
      
      if (newStats) {
        setStats({
          ...newStats,
          achievements: newStats.achievements || []
        })
      }
    } else if (data) {
      // Weekly freeze reset: if last freeze was used more than 7 days ago, restore 1 freeze
      let updatedData = { ...data, achievements: data.achievements || [] }
      if (data.streak_freeze_used_at) {
        const lastUsed = new Date(data.streak_freeze_used_at)
        const now = new Date()
        const daysSinceUse = Math.floor((now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24))
        if (daysSinceUse >= 7 && (data.streak_freezes_remaining ?? 0) < 1) {
          updatedData.streak_freezes_remaining = 1
          updatedData.streak_freeze_used_at = null
          // Persist reset to DB (non-blocking)
          supabase.from('user_stats').update({
            streak_freezes_remaining: 1,
            streak_freeze_used_at: null
          }).eq('user_id', userId).then(() => {})
        }
      }
      setStats(updatedData)
    }
    
    setLoading(false)
  }, [supabase, getUserId])

  useEffect(() => {
    refreshStats()
  }, [refreshStats])

  // BUG FIX: REMOVED the useEffect that incremented streak on page load.
  // Streak is now ONLY updated when the user actually studies (in recordFocusSession).
  // Previously, just opening the dashboard each day would increment the streak.

  // Update stats in DB
  const updateStats = async (updates: Partial<UserStats>) => {
    const userId = await getUserId()
    if (!userId) return

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
        .eq('user_id', userId)
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
    
    const userId = await getUserId()
    if (userId) {
      await supabase.rpc('increment_xp', { user_id_input: userId, amount_input: amount }).then(({ error }) => {
        if (error) {
          updateStats({})
        }
      })
    }
    
    setTimeout(() => setRecentXPGain(null), 3000)
  }

  // Record focus session — This is the ONLY place streak gets updated
  const recordFocusSession = async (minutes: number) => {
    if (!stats) return
    
    const xpEarned = Math.round(minutes * XP_REWARDS.FOCUS_PER_MINUTE * (appConfig.xp_multiplier || 1))
    const isFirstFocus = stats.total_focus_minutes === 0
    const totalXP = xpEarned + (isFirstFocus ? XP_REWARDS.FIRST_FOCUS : 0)

    // Calculate streak with freeze support
    const { newStreak, isNewDay, freezeUsed } = calculateStreak(
      stats.last_active_date, 
      stats.current_streak,
      stats.streak_freezes_remaining ?? 0
    )
    
    let bonusXP = 0
    const streakUpdates: Partial<UserStats> = {}

    if (isNewDay) {
      streakUpdates.current_streak = newStreak
      streakUpdates.longest_streak = Math.max(newStreak, stats.longest_streak)
      streakUpdates.last_active_date = new Date().toISOString().split('T')[0]

      // If a freeze was used, decrement the counter
      if (freezeUsed) {
        streakUpdates.streak_freezes_remaining = Math.max(0, (stats.streak_freezes_remaining ?? 0) - 1)
        streakUpdates.streak_freeze_used_at = new Date().toISOString()
      }

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
      const userId = await getUserId()
      if (userId) {
        await updateCompanionAfterStudy(supabase, userId, minutes, streakUpdates.current_streak ?? stats.current_streak)
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
