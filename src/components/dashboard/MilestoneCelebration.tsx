'use client'

import { useEffect, useState, useCallback } from 'react'
import { useXP } from '@/context/XPContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Flame, Clock, Zap, Trophy, X } from 'lucide-react'
import confetti from 'canvas-confetti'

type Milestone = {
  id: string
  title: string
  subtitle: string
  icon: typeof Star
  color: string
  gradient: string
  check: (stats: any) => boolean
}

const MILESTONES: Milestone[] = [
  {
    id: 'hours_10',
    title: '10 Hours!',
    subtitle: "You've studied for 10 hours. That's real commitment.",
    icon: Clock,
    color: 'text-blue-500',
    gradient: 'from-blue-500 to-cyan-500',
    check: (s) => s.total_focus_minutes >= 600,
  },
  {
    id: 'hours_50',
    title: '50 Hours!',
    subtitle: 'Half a century of focused study. You\'re building something real.',
    icon: Clock,
    color: 'text-purple-500',
    gradient: 'from-purple-500 to-pink-500',
    check: (s) => s.total_focus_minutes >= 3000,
  },
  {
    id: 'hours_100',
    title: '100 Hours!',
    subtitle: 'One hundred hours of deep work. Most people never get here.',
    icon: Trophy,
    color: 'text-amber-500',
    gradient: 'from-amber-500 to-orange-500',
    check: (s) => s.total_focus_minutes >= 6000,
  },
  {
    id: 'streak_7',
    title: '7-Day Streak!',
    subtitle: 'A full week of consistency. The habit is forming.',
    icon: Flame,
    color: 'text-orange-500',
    gradient: 'from-orange-500 to-red-500',
    check: (s) => s.current_streak >= 7,
  },
  {
    id: 'streak_14',
    title: '14-Day Streak!',
    subtitle: 'Two weeks straight. You\'re proving it wasn\'t a fluke.',
    icon: Flame,
    color: 'text-red-500',
    gradient: 'from-red-500 to-rose-600',
    check: (s) => s.current_streak >= 14,
  },
  {
    id: 'streak_30',
    title: '30-Day Streak!',
    subtitle: 'A full month. You\'re not preparing anymore — you\'re becoming.',
    icon: Flame,
    color: 'text-red-600',
    gradient: 'from-red-600 to-orange-500',
    check: (s) => s.current_streak >= 30,
  },
  {
    id: 'level_5',
    title: 'Level 5!',
    subtitle: 'Dedicated. You\'ve earned the title.',
    icon: Star,
    color: 'text-green-500',
    gradient: 'from-green-500 to-emerald-500',
    check: (s) => s.level >= 5,
  },
  {
    id: 'level_10',
    title: 'Level 10!',
    subtitle: 'Expert status. The top tier.',
    icon: Zap,
    color: 'text-amber-500',
    gradient: 'from-amber-400 to-yellow-500',
    check: (s) => s.level >= 10,
  },
  {
    id: 'xp_1000',
    title: '1,000 XP!',
    subtitle: 'Your first thousand. Momentum is building.',
    icon: Zap,
    color: 'text-primary-500',
    gradient: 'from-primary-500 to-indigo-500',
    check: (s) => s.xp >= 1000,
  },
  {
    id: 'xp_5000',
    title: '5,000 XP!',
    subtitle: 'Five thousand points of focused effort.',
    icon: Zap,
    color: 'text-purple-600',
    gradient: 'from-purple-600 to-violet-500',
    check: (s) => s.xp >= 5000,
  },
]

export default function MilestoneCelebration() {
  const { stats } = useXP()
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null)

  const fireConfetti = useCallback(() => {
    // Fire from both sides
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }
    
    confetti({ ...defaults, particleCount: 50, origin: { x: 0.2, y: 0.6 } })
    confetti({ ...defaults, particleCount: 50, origin: { x: 0.8, y: 0.6 } })
    
    // Second burst
    setTimeout(() => {
      confetti({ ...defaults, particleCount: 30, origin: { x: 0.5, y: 0.4 } })
    }, 250)
  }, [])

  useEffect(() => {
    if (!stats) return

    // Check which milestones are unlocked
    const storageKey = 'krama_milestones_seen'
    const seenRaw = localStorage.getItem(storageKey)
    const seen = new Set<string>(seenRaw ? JSON.parse(seenRaw) : [])

    // Find first unseen, unlocked milestone
    const newMilestone = MILESTONES.find(m => m.check(stats) && !seen.has(m.id))

    if (newMilestone) {
      // Mark as seen immediately (so it doesn't re-trigger)
      seen.add(newMilestone.id)
      localStorage.setItem(storageKey, JSON.stringify(Array.from(seen)))

      // Show with a small delay for dramatic effect
      setTimeout(() => {
        setActiveMilestone(newMilestone)
        fireConfetti()
      }, 500)
    }
  }, [stats, fireConfetti])

  const handleDismiss = () => {
    setActiveMilestone(null)
  }

  return (
    <AnimatePresence>
      {activeMilestone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ scale: 0.5, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient header */}
            <div className={`bg-gradient-to-r ${activeMilestone.gradient} p-8 text-center relative`}>
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 text-white/50 hover:text-white"
              >
                <X size={20} />
              </button>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4"
              >
                <activeMilestone.icon size={40} className="text-white" />
              </motion.div>
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-black text-white"
              >
                {activeMilestone.title}
              </motion.h2>
            </div>

            {/* Body */}
            <div className="p-6 text-center">
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 text-sm mb-6 leading-relaxed"
              >
                {activeMilestone.subtitle}
              </motion.p>

              <motion.button
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={handleDismiss}
                className="btn btn-primary w-full"
              >
                Keep Going 💪
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
