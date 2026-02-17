'use client'

import { useState, useEffect, useMemo } from 'react'
import { useXP } from '@/context/XPContext'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, Check, Flame, Target, Clock, Brain, BookOpen, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type Quest = {
  id: string
  title: string
  description: string
  icon: typeof Flame
  color: string
  xp: number
  check: (ctx: QuestContext) => boolean
}

type QuestContext = {
  todayFocusMinutes: number
  todayReviews: number
  todaySyllabusChecks: number
  todayMocks: number
  streak: number
  todaySessions: number
}

// All possible quests — 3 will be picked per day based on date seed
const ALL_QUESTS: Quest[] = [
  { id: 'focus_25', title: 'Deep Focus', description: 'Complete a 25+ min focus session', icon: Clock, color: 'blue', xp: 15, check: (c) => c.todayFocusMinutes >= 25 },
  { id: 'focus_45', title: 'Marathon Focus', description: 'Study for 45+ minutes today', icon: Flame, color: 'orange', xp: 20, check: (c) => c.todayFocusMinutes >= 45 },
  { id: 'focus_90', title: 'Ultra Focus', description: 'Study for 90+ minutes today', icon: Zap, color: 'purple', xp: 35, check: (c) => c.todayFocusMinutes >= 90 },
  { id: 'review_3', title: 'Memory Refresh', description: 'Review 3 topics today', icon: Brain, color: 'purple', xp: 15, check: (c) => c.todayReviews >= 3 },
  { id: 'review_5', title: 'Revision Blitz', description: 'Review 5 topics today', icon: Brain, color: 'indigo', xp: 25, check: (c) => c.todayReviews >= 5 },
  { id: 'syllabus_5', title: 'Checklist Hero', description: 'Check off 5 syllabus items', icon: BookOpen, color: 'green', xp: 10, check: (c) => c.todaySyllabusChecks >= 5 },
  { id: 'syllabus_10', title: 'Syllabus Sprint', description: 'Check off 10 syllabus items', icon: BookOpen, color: 'emerald', xp: 20, check: (c) => c.todaySyllabusChecks >= 10 },
  { id: 'mock_1', title: 'Test Day', description: 'Log a mock test score', icon: Target, color: 'red', xp: 25, check: (c) => c.todayMocks >= 1 },
  { id: 'sessions_2', title: 'Double Down', description: 'Complete 2 focus sessions', icon: Clock, color: 'cyan', xp: 15, check: (c) => c.todaySessions >= 2 },
  { id: 'sessions_3', title: 'Triple Threat', description: 'Complete 3 focus sessions', icon: Flame, color: 'amber', xp: 25, check: (c) => c.todaySessions >= 3 },
]

// Deterministic daily quest selection — same quests for all users on same day
function getDailyQuests(date: Date): Quest[] {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
  // Simple hash to get 3 unique indices
  const indices: number[] = []
  let hash = seed
  while (indices.length < 3) {
    hash = ((hash * 1103515245 + 12345) & 0x7fffffff)
    const idx = hash % ALL_QUESTS.length
    if (!indices.includes(idx)) indices.push(idx)
  }
  return indices.map(i => ALL_QUESTS[i])
}

export default function DailyQuests() {
  const supabase = useMemo(() => createClient(), [])
  const { stats, addXP } = useXP()
  const [context, setContext] = useState<QuestContext | null>(null)
  const [claimedQuests, setClaimedQuests] = useState<Set<string>>(new Set())
  const [allClaimed, setAllClaimed] = useState(false)

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const quests = useMemo(() => getDailyQuests(today), [todayStr])

  // Load today's progress data
  useEffect(() => {
    const fetchContext = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      const [focusRes, reviewRes, mocksRes] = await Promise.all([
        supabase.from('focus_logs').select('duration_minutes').eq('user_id', user.id).gte('created_at', todayStart.toISOString()),
        supabase.from('review_topics').select('id').eq('user_id', user.id).gte('last_reviewed', todayStart.toISOString()),
        supabase.from('mock_scores').select('id').eq('user_id', user.id).gte('created_at', todayStart.toISOString()),
      ])

      const focusLogs = focusRes.data || []
      const todayFocusMinutes = focusLogs.reduce((sum: number, l: any) => sum + (l.duration_minutes || 0), 0)

      setContext({
        todayFocusMinutes,
        todayReviews: reviewRes.data?.length || 0,
        todaySyllabusChecks: 0, // syllabus checks aren't timestamped — skip for now
        todayMocks: mocksRes.data?.length || 0,
        streak: stats?.current_streak || 0,
        todaySessions: focusLogs.length,
      })
    }
    fetchContext()

    // Load claimed quests from localStorage
    const claimed = localStorage.getItem(`krama_quests_${todayStr}`)
    if (claimed) {
      const parsed = JSON.parse(claimed)
      setClaimedQuests(new Set(parsed.claimed || []))
      setAllClaimed(parsed.allClaimed || false)
    }
  }, [supabase, stats, todayStr])

  const handleClaim = async (quest: Quest) => {
    if (claimedQuests.has(quest.id)) return

    const newClaimed = new Set(claimedQuests)
    newClaimed.add(quest.id)
    setClaimedQuests(newClaimed)

    await addXP(quest.xp, `Quest: ${quest.title}`)

    // Check if all 3 are now claimed — bonus XP!
    const allDone = quests.every(q => newClaimed.has(q.id))
    if (allDone && !allClaimed) {
      setAllClaimed(true)
      await addXP(20, 'All Daily Quests Complete! 🎯')
    }

    // Persist to localStorage
    localStorage.setItem(`krama_quests_${todayStr}`, JSON.stringify({
      claimed: Array.from(newClaimed),
      allClaimed: allDone,
    }))
  }

  if (!context) return null

  const completedCount = quests.filter(q => q.check(context) && claimedQuests.has(q.id)).length

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Sparkles size={18} className="text-amber-500" />
          Daily Quests
        </h3>
        <div className="text-xs font-bold text-gray-400">
          {completedCount}/3 {allClaimed && '🎉'}
        </div>
      </div>

      <div className="space-y-3">
        {quests.map(quest => {
          const completed = quest.check(context)
          const claimed = claimedQuests.has(quest.id)

          return (
            <div
              key={quest.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                claimed 
                  ? 'bg-green-50 border-green-200' 
                  : completed 
                    ? 'bg-amber-50 border-amber-200' 
                    : 'bg-gray-50 border-gray-100'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                claimed ? 'bg-green-500' : completed ? 'bg-amber-400' : 'bg-gray-200'
              }`}>
                {claimed ? (
                  <Check size={16} className="text-white" />
                ) : (
                  <quest.icon size={16} className={claimed ? 'text-white' : completed ? 'text-white' : 'text-gray-400'} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold ${claimed ? 'text-green-700' : 'text-gray-900'}`}>
                  {quest.title}
                </div>
                <div className="text-[11px] text-gray-500">{quest.description}</div>
              </div>
              {completed && !claimed ? (
                <button
                  onClick={() => handleClaim(quest)}
                  className="px-3 py-1.5 bg-amber-400 text-amber-900 text-xs font-bold rounded-lg hover:bg-amber-500 transition-colors"
                >
                  +{quest.xp} XP
                </button>
              ) : claimed ? (
                <span className="text-xs font-bold text-green-600">+{quest.xp} ✓</span>
              ) : (
                <span className="text-[10px] font-medium text-gray-400">+{quest.xp} XP</span>
              )}
            </div>
          )
        })}
      </div>

      {/* All-complete bonus */}
      <AnimatePresence>
        {allClaimed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 p-3 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl text-center"
          >
            <div className="text-white font-bold text-sm">🎯 All Quests Complete! +20 Bonus XP</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
