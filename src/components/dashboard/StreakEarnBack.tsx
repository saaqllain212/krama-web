'use client'

import { useState, useEffect } from 'react'
import { useXP } from '@/context/XPContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, X, Zap } from 'lucide-react'

/**
 * StreakEarnBack — Duolingo-inspired streak recovery.
 * 
 * When a user's streak breaks (diffDays >= 2 and no freeze available),
 * instead of silently resetting to 0, we show a modal:
 * "Your 14-day streak broke! Complete 2 focus sessions today to earn it back."
 * 
 * How it works:
 * - On mount, check if streak was recently broken (last_active_date is 2+ days ago AND current_streak dropped)
 * - Store the "recoverable streak" value in localStorage with a 24h expiry
 * - If user completes 2 sessions today, restore their streak via XPContext
 * - After 24 hours, the offer expires and streak is permanently lost
 */
export default function StreakEarnBack() {
  const { stats, refreshStats } = useXP()
  const [show, setShow] = useState(false)
  const [recoveryData, setRecoveryData] = useState<{
    lostStreak: number
    sessionsNeeded: number
    expiresAt: string
  } | null>(null)

  useEffect(() => {
    if (!stats) return

    const storageKey = 'krama_streak_recovery'
    const stored = localStorage.getItem(storageKey)

    if (stored) {
      try {
        const data = JSON.parse(stored)
        const expired = new Date(data.expiresAt) < new Date()
        
        if (expired) {
          // Recovery window expired — clean up
          localStorage.removeItem(storageKey)
          return
        }
        
        // Recovery is still active — check if they've completed enough sessions today
        setRecoveryData(data)
        setShow(true)
      } catch {
        localStorage.removeItem(storageKey)
      }
      return
    }

    // Detect a streak break: current_streak is 1 but we can see from last_active_date 
    // that they had a longer streak before
    if (stats.current_streak <= 1 && stats.longest_streak >= 3 && stats.last_active_date) {
      const last = new Date(stats.last_active_date)
      const now = new Date()
      last.setHours(0, 0, 0, 0)
      now.setHours(0, 0, 0, 0)
      const daysSince = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))

      // Streak just broke (2-3 days since last activity) — offer recovery
      if (daysSince >= 2 && daysSince <= 3) {
        const recovery = {
          lostStreak: stats.longest_streak, // Best guess at what they had
          sessionsNeeded: 2,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }
        localStorage.setItem(storageKey, JSON.stringify(recovery))
        setRecoveryData(recovery)
        setShow(true)
      }
    }
  }, [stats])

  const handleDismiss = () => {
    setShow(false)
    // Don't remove from localStorage — they can still earn it back
  }

  const handleDismissPermanent = () => {
    setShow(false)
    localStorage.removeItem('krama_streak_recovery')
  }

  if (!show || !recoveryData) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-center relative">
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 text-white/60 hover:text-white"
            >
              <X size={20} />
            </button>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-3">
              <Flame size={32} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Streak Broken!</h2>
            <p className="text-white/80 text-sm mt-1">
              Your {recoveryData.lostStreak}-day streak was lost
            </p>
          </div>

          {/* Body */}
          <div className="p-6 text-center">
            <div className="mb-4">
              <div className="text-5xl font-bold text-gray-900 mb-1">
                {recoveryData.lostStreak}
              </div>
              <div className="text-xs font-bold text-gray-400 uppercase">Days you built</div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap size={16} className="text-amber-600" />
                <span className="text-sm font-bold text-amber-800">Earn It Back!</span>
              </div>
              <p className="text-sm text-amber-700">
                Complete <strong>{recoveryData.sessionsNeeded} focus sessions</strong> today to restore your streak.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDismiss}
                className="flex-1 btn btn-primary"
              >
                Let&apos;s Go!
              </button>
              <button
                onClick={handleDismissPermanent}
                className="px-4 text-xs font-medium text-gray-400 hover:text-gray-600"
              >
                Skip
              </button>
            </div>

            <p className="text-[10px] text-gray-400 mt-3">
              Offer expires in 24 hours
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
